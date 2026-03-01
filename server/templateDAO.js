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
    });
  });
};

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
        console.error("Error in getAllTemplates:", err);
        return reject(err);
      }
      const templatesMap = new Map();
      rows.forEach((row) => {
        if (!templatesMap.has(row.template_id)) {
          templatesMap.set(row.template_id, {
            id: row.template_id,
            name: row.template_name,
            parameters: new Map(),
          });
        }
        const template = templatesMap.get(row.template_id);
        if (row.parameter_id) {
          if (!template.parameters.has(row.parameter_id)) {
            template.parameters.set(row.parameter_id, {
              id: row.parameter_id,
              name: row.parameter_name,
              units: row.parameter_units,
              values: new Set(),
            });
          }
          const parameter = template.parameters.get(row.parameter_id);
          if (row.value_text) {
            parameter.values.add(row.value_text);
          }
        }
      });

      // Convert internal Maps and Sets to Arrays for JSON serialization
      const result = Array.from(templatesMap.values()).map(template => ({
        ...template,
        parameters: Array.from(template.parameters.values()).map(param => ({
          ...param,
          values: Array.from(param.values)
        }))
      }));
      resolve(result);
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
export const updateTemplate = async (db, template) => {
  return new Promise((resolve, reject) => {
    if (!template || !template.id) {
      return reject(new Error("Template ID is required for update"));
    }

    db.serialize(() => {
      db.run("BEGIN TRANSACTION", (err) => {
        if (err) return reject(err);

        // 1. Delete all existing parameter values for this template's parameters
        const deleteQuery = `
          DELETE FROM parameter_values 
          WHERE parameter_id IN (
            SELECT id FROM parameters WHERE template_id = ?
          )
        `;

        db.run(deleteQuery, [template.id], (err) => {
          if (err) {
            db.run("ROLLBACK");
            return reject(err);
          }

          // 2. Insert new parameter values if any
          if (!template.parameters || !Array.isArray(template.parameters)) {
            db.run("COMMIT", (err) => {
              if (err) {
                db.run("ROLLBACK");
                return reject(err);
              }
              resolve({ id: template.id });
            });
            return;
          }

          let pendingParameters = template.parameters.length;
          if (pendingParameters === 0) {
            db.run("COMMIT", (err) => {
              if (err) {
                db.run("ROLLBACK");
                return reject(err);
              }
              resolve({ id: template.id });
            });
            return;
          }

          let hasError = false;
          template.parameters.forEach((param) => {
            if (!param.values || !Array.isArray(param.values) || param.values.length === 0) {
              pendingParameters--;
              if (pendingParameters === 0 && !hasError) {
                db.run("COMMIT", (err) => {
                  if (err) {
                    db.run("ROLLBACK");
                    return reject(err);
                  }
                  resolve({ id: template.id });
                });
              }
              return;
            }

            let pendingValues = param.values.length;
            param.values.forEach((value) => {
              const valueId = `${param.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
              db.run(
                "INSERT INTO parameter_values (id, parameter_id, value) VALUES (?, ?, ?)",
                [valueId, param.id, value],
                (err) => {
                  if (err && !hasError) {
                    hasError = true;
                    db.run("ROLLBACK");
                    return reject(err);
                  }
                  pendingValues--;
                  if (pendingValues === 0) {
                    pendingParameters--;
                    if (pendingParameters === 0 && !hasError) {
                      db.run("COMMIT", (err) => {
                        if (err) {
                          db.run("ROLLBACK");
                          return reject(err);
                        }
                        resolve({ id: template.id });
                      });
                    }
                  }
                }
              );
            });
          });
        });
      });
    });
  });
};
