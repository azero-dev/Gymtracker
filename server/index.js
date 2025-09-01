import express from "express";
import cors from "cors";
import sqlite3 from "sqlite3";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";
import {
  saveTemplate,
  getAllTemplates,
  deleteTemplate,
} from "./templateDAO.js";

const app = express();
const PORT = process.env.PORT || 4666;

app.use(cors());
app.use(express.json());

// TODO: move db handling to separate file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbDir = join(__dirname, "../database/");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}
const dbPath = join(dbDir, "tracker.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error while connecting to the db", err);
    process.exit(1);
  } else {
    console.log("Connected to db");
  }
});

db.serialize(() => {
  db.exec(`
      CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS parameters (
      id TEXT PRIMARY KEY,
      template_id TEXT NOT NULL,
      name TEXT NOT NULL,
      units TEXT,
      FOREIGN KEY (template_id) REFERENCES templates(id)
    );

    CREATE TABLE IF NOT EXISTS parameter_values (
      id TEXT PRIMARY KEY,
      parameter_id TEXT NOT NULL,
      value TEXT NOT NULL,
      FOREIGN KEY (parameter_id) REFERENCES parameters(id)
    );

    CREATE TABLE IF NOT EXISTS highlights (
      parameter_id TEXT NOT NULL,
      value_id TEXT NOT NULL,
      PRIMARY KEY (parameter_id, value_id),
      FOREIGN KEY (parameter_id) REFERENCES parameters(id)
      FOREIGN KEY (value_id) REFERENCES parameter_values(id)
    );
  `);
});

// Templates
app.post("/api/templates", async (req, res) => {
  const template = req.body;
  // console.log("Received template:", JSON.stringify(template, null, 2));
  if (!template.id || !template.name || !Array.isArray(template.parameters)) {
    console.log("Invalid template data:", template);
    return res.status(400).json({
      error: "Invalid template data",
    });
  }
  try {
    await saveTemplate(db, template);
    res.status(201).json({
      success: true,
      data: template,
    });
  } catch (err) {
    console.error("Save error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

app.delete("/api/templates/:id", async (req, res) => {
  const templateId = req.params.id;
  if (!templateId) {
    return res.status(400).json({
      success: false,
      error: "Template ID is required",
    });
  }
  try {
    await deleteTemplate(db, templateId);
    res.status(200).json({
      success: true,
      message: `Template ${templateId} deleted successfully`,
    });
  } catch (err) {
    console.error("Delete error:", err);
    // Manejar diferentes tipos de errores
    if (err.message.includes("does not exist")) {
      res.status(404).json({
        success: false,
        error: err.message,
      });
    } else {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }
});

app.get("/api/templates", async (req, res) => {
  try {
    const templates = await getAllTemplates(db);
    const templatesJson = templates.map((template) => ({
      id: template.id,
      name: template.name,
      parameters: Array.from(template.parameters.entries()).map(
        ([key, parameter]) => ({
          id: parameter.id,
          name: parameter.name,
          units: parameter.units,
          values: Array.from(parameter.values),
        }),
      ),
    }));
    res.json({ templates: templatesJson, count: templatesJson.length });
  } catch (error) {
    console.error("Error fetching all templates:", error);
    res.status(500).json({ error: error.message });
  }
});

// TODO: SESSIONS ENDPOINTS (old versions)
// app.post("/api/sessions", (req, res) => {
//   const { id, name } = req.body;
//   if (!id || !name) {
//     return res.status(400).json({ error: "ID and name are required" });
//   }
//   const stmt = db.prepare("INSERT INTO sessions (id, name) VALUES (?, ?)");
//   stmt.run(id, name, function (err) {
//     if (err) {
//       console.error("Error inserting session:", err);
//       // Check if already exists
//       if (err.message.includes("UNIQUE constraint failed")) {
//         return res
//           .status(409)
//           .json({ error: "Session with this ID already exists" });
//       }
//       return res.status(500).json({ error: "Internal server error" });
//     }
//     res.status(201).json({
//       id,
//       name,
//       message: "Session saved successfully",
//     });
//   });
//   stmt.finalize();
// });
//
// app.get("/api/sessions", (req, res) => {
//   db.all("SELECT * FROM sessions ORDER BY created_at DESC", (err, rows) => {
//     if (err) {
//       console.error("Error al consultar sessions:", err);
//       return res.status(500).json({ error: "Internal server error" });
//     }
//     res.json({ sessions: rows, count: rows.length });
//   });
// });
//
// app.get("/api/sessions/:id", (req, res) => {
//   const { id } = req.params;
//   db.get("SELECT * FROM sessions WHERE id = ?", [id], (err, row) => {
//     if (err) {
//       console.error("Error accessing session:", err);
//       return res.status(500).json({ error: "Internal server error" });
//     }
//     if (!row) {
//       return res.status(404).json({ error: "Session not found" });
//     }
//     res.json(row);
//   });
// });
//
// app.delete("/api/sessions/:id", (req, res) => {
//   const { id } = req.params;
//   db.run("DELETE FROM sessions WHERE id = ?", [id], function (err) {
//     if (err) {
//       console.error("Error deleting session:", err);
//       return res.status(500).json({ error: "Internal server error" });
//     }
//     if (this.changes === 0) {
//       return res.status(404).json({ error: "Session not found" });
//     }
//     res.json({
//       message: "Session successfully deleted",
//       deletedId: id,
//     });
//   });
// });

// Static files and error handling
const frontendDistPath = join(__dirname, "../dist");
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get("*", (req, res) => {
    res.sendFile(join(frontendDistPath, "index.html"));
  });
}

// TODO: error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong :(" });
});

// TODO: 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found - 404" });
});

process.on("SIGINT", () => {
  console.log("\nClosing server...");
  db.close((err) => {
    if (err) {
      console.error("Error closing the db:", err);
    } else {
      console.log("Database connection closed.");
    }
    process.exit(0);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Database: ${dbPath}`);
});
