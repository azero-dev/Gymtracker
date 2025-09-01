import { Template } from "../src/models/Template.js";
import { Parameter } from "../src/models/Parameter.js";
import { Value } from "../src/models/Value.js";

export const saveTemplate = async (db, template) => {
  return new Promise((resolve, reject) => {
    if (!template || !template.id || !template.name) {
      return reject(new Error("Template incomplete"));
    }
    db.serialize(() => {
      db.get(
        "SELECT id FROM templates WHERE id = ?",
        [template.id],
        (err, row) => {
          if (err) {
            console.error("Error checking template existence:", err);
            return reject(err);
          }
          if (row) {
            return reject(
              new Error(`Template with ID ${template.id} already exists`),
            );
          }
          db.run("BEGIN TRANSACTION", (err) => {
            if (err) {
              console.error("Failed to begin transaction:", err);
              return reject(err);
            }
            db.run(
              "INSERT INTO templates (id, name) VALUES (?, ?)",
              [template.id, template.name],
              (err) => {
                if (err) {
                  console.error("Failed to insert template:", err);
                  db.run("ROLLBACK");
                  return reject(err);
                }
                if (
                  !template.parameters ||
                  !Array.isArray(template.parameters)
                ) {
                  db.run("COMMIT", (err) => {
                    if (err) {
                      console.error("Commit failed:", err);
                      db.run("ROLLBACK");
                      return reject(err);
                    } else {
                      console.log(
                        "Transaction committed successfully (no parameters)",
                      );
                      return resolve();
                    }
                  });
                  return;
                }
                let pendingOperations = 0;
                let hasError = false;
                const checkCompletion = () => {
                  if (pendingOperations === 0 && !hasError) {
                    db.run("COMMIT", (err) => {
                      if (err) {
                        console.error("Commit failed:", err);
                        db.run("ROLLBACK");
                        return reject(err);
                      } else {
                        console.log("Transaction committed successfully");
                        return resolve();
                      }
                    });
                  }
                };
                template.parameters.forEach((param) => {
                  if (!param || !param.id || !param.name) {
                    console.warn("Skipping invalid parameter:", param);
                    return;
                  }
                  pendingOperations++;
                  db.run(
                    "INSERT INTO parameters (id, template_id, name, units) VALUES (?, ?, ?, ?)",
                    [param.id, template.id, param.name, param.units || null],
                    (err) => {
                      if (err && !hasError) {
                        hasError = true;
                        console.error("Failed to insert parameter:", err);
                        db.run("ROLLBACK");
                        return reject(err);
                      }
                      if (
                        Array.isArray(param.values) &&
                        param.values.length > 0
                      ) {
                        let pendingValues = param.values.filter(
                          (value) => value !== null && value !== undefined,
                        ).length;
                        if (pendingValues === 0) {
                          pendingOperations--;
                          checkCompletion();
                          return;
                        }
                        param.values.forEach((value) => {
                          if (value === null || value === undefined) return;
                          const valueId = `${param.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                          db.run(
                            "INSERT INTO parameter_values (id, parameter_id, value) VALUES (?, ?, ?)",
                            [valueId, param.id, value],
                            (err) => {
                              if (err && !hasError) {
                                hasError = true;
                                console.error(
                                  "Failed to insert parameter value:",
                                  err,
                                );
                                db.run("ROLLBACK");
                                return reject(err);
                              }
                              pendingValues--;
                              if (pendingValues === 0) {
                                pendingOperations--;
                                checkCompletion();
                              }
                            },
                          );
                        });
                      } else {
                        pendingOperations--;
                        checkCompletion();
                      }
                    },
                  );
                });
                if (template.parameters.length === 0) {
                  checkCompletion();
                }
              },
            );
          });
        },
      );
      // OLD VERSION:
      // db.run("BEGIN TRANSACTION");
      // try {
      //   // Insert template
      //   db.run("INSERT INTO templates (id, name) VALUES (?, ?)", [
      //     template.id,
      //     template.name,
      //   ]);
      //
      //   // Insert parameters
      //   template.parameters.forEach((param) => {
      //     if (!param) return;
      //     db.run(
      //       "INSERT INTO parameters (id, template_id, name, units) VALUES (?, ?, ?, ?)",
      //       [param.id, template.id, param.name, param.units],
      //     );
      //
      //     // Insert values
      //     if (Array.isArray(param.values)) {
      //       param.values.forEach((value) => {
      //         if (!value) return;
      //         const valueId = `${param.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      //         db.run(
      //           "INSERT INTO parameter_values (id, parameter_id, value) VALUES (?, ?, ?)",
      //           [valueId, param.id, value],
      //         );
      //       });
      //     }
      //
      //     // Insert highlights
      //     // if (Array.isArray(param.highlights)) {
      //     //   param.highlights.forEach((highlight) => {
      //     //     if (!highlight) return;
      //     //     db.run(
      //     //       "INSERT INTO highlights (parameter_id, value_id) VALUES (?, ?)",
      //     //       [param.id, XXXXXXXXXX?],
      //     //     );
      //     //   });
      //     // }
      //   });
      //
      //   db.run("COMMIT", (err) => {
      //     if (err) {
      //       console.error("Commit failed:", err);
      //       db.run("ROLLBACK");
      //       reject(err);
      //     } else {
      //       console.log("Transaction committed successfully");
      //       resolve();
      //     }
      //   });
      // } catch (err) {
      //   console.error("Transaction failed:", err);
      //   db.run("ROLLBACK");
      //   reject(err);
      // }
    });
  });
};

// export function getTemplate(db, templateId) {
//   // 1. Recuperar el template
//   const templateRow = db
//     .prepare("SELECT * FROM templates WHERE id = ?")
//     .get(templateId);
//   if (!templateRow) return null;
//
//   const template = new Template();
//   template.id = templateRow.id;
//   template.name = templateRow.name;
//
//   // 2. Recuperar parámetros
//   const parameters = db
//     .prepare("SELECT * FROM parameters WHERE template_id = ?")
//     .all(templateId);
//
//   for (const paramRow of parameters) {
//     const parameter = new Parameter();
//     parameter.id = paramRow.id;
//     parameter.name = paramRow.name;
//     parameter.units = paramRow.units;
//
//     // 3. Recuperar valores del parámetro
//     const valuesRows = db
//       .prepare("SELECT * FROM values WHERE parameter_id = ?")
//       .all(paramRow.id);
//     for (const valueRow of valuesRows) {
//       const value = new Values();
//       value.id = valueRow.id;
//       value.options = new Set(JSON.parse(valueRow.options_json)); // String → Set
//       parameter.values.set(value.id, value);
//     }
//
//     // 4. Recuperar highlights (solo IDs de valores destacados)
//     const highlightRows = db
//       .prepare("SELECT value_id FROM highlights WHERE parameter_id = ?")
//       .all(paramRow.id);
//     for (const row of highlightRows) {
//       parameter.highlights.add(row.value_id);
//     }
//
//     template.parameters.set(parameter.id, parameter);
//   }
//
//   return template;
// }

export const getAllTemplates = async (db) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        t.id as template_id,
        t.name as template_name,
        t.created_at as template_created_at,
        p.id as parameter_id,
        p.name as parameter_name,
        p.units as parameter_units,
        pv.id as value_id,
        pv.value as value_text
      FROM templates t
      LEFT JOIN parameters p ON t.id = p.template_id
      LEFT JOIN parameter_values pv ON p.id = pv.parameter_id
      ORDER BY t.created_at DESC, p.name, pv.value
    `;
    db.all(query, (err, rows) => {
      if (err) {
        console.error("Error in getAllTemplatesSimple:", err);
        return reject(err);
      }
      const templatesMap = new Map();
      rows.forEach((row) => {
        // WARNING: cambiar asignacion a metodos de clase
        if (!templatesMap.has(row.template_id)) {
          const template = new Template();
          template.id = row.template_id;
          template.name = row.template_name;
          templatesMap.set(row.template_id, template);
        }
        const template = templatesMap.get(row.template_id);
        if (row.parameter_id) {
          // WARNING: cambiar asignacion a metodos de clase
          if (!template.parameters.has(row.parameter_id)) {
            const parameter = new Parameter();
            parameter.id = row.parameter_id;
            parameter.name = row.parameter_name;
            parameter.units = row.parameter_units;
            template.parameters.set(row.parameter_id, parameter);
          }
          const parameter = template.parameters.get(row.parameter_id);
          if (row.value_text) {
            parameter.values.add(row.value_text);
          }
        }
      });
      resolve(Array.from(templatesMap.values()));
      // TODO: set reject
    });
  });
};

export const deleteTemplate = async (db, templateId) => {
  return new Promise((resolve, reject) => {
    if (!templateId) {
      return reject(new Error("Template ID is required"));
    }
    db.serialize(() => {
      db.get(
        "SELECT id FROM templates WHERE id = ?",
        [templateId],
        (err, row) => {
          if (err) {
            return reject(err);
          }
          if (!row) {
            return reject(
              new Error(`Template with ID ${templateId} does not exist`),
            );
          }
          db.run("BEGIN TRANSACTION", (err) => {
            if (err) {
              console.error("Failed to begin transaction:", err);
              return reject(err);
            }
            db.run(
              `DELETE FROM parameter_values 
               WHERE parameter_id IN (
                 SELECT id FROM parameters WHERE template_id = ?
               )`,
              [templateId],
              (err) => {
                if (err) {
                  console.error("Failed to delete parameter values:", err);
                  db.run("ROLLBACK");
                  return reject(err);
                }
                db.run(
                  "DELETE FROM parameters WHERE template_id = ?",
                  [templateId],
                  (err) => {
                    if (err) {
                      console.error("Failed to delete parameters:", err);
                      db.run("ROLLBACK");
                      return reject(err);
                    }
                    db.run(
                      "DELETE FROM templates WHERE id = ?",
                      [templateId],
                      (err) => {
                        if (err) {
                          console.error("Failed to delete template:", err);
                          db.run("ROLLBACK");
                          return reject(err);
                        }
                        db.run("COMMIT", (err) => {
                          if (err) {
                            console.error("Commit failed:", err);
                            db.run("ROLLBACK");
                            return reject(err);
                          } else {
                            console.log(
                              `Template ${templateId} deleted successfully`,
                            );
                            return resolve();
                          }
                        });
                      },
                    );
                  },
                );
              },
            );
          });
        },
      );
    });
  });
};
