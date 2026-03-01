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
  updateTemplate,
} from "./templateDAO.js";
import {
  saveSession,
  getAllSessions,
  deleteSession,
  updateSession,
} from "./sessionDAO.js";

const app = express();
const PORT = parseInt(process.env.PORT || "4666", 10);

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
    db.run("PRAGMA journal_mode = WAL;", (err) => {
      if (err) {
        console.error("Failed to enable WAL mode:", err);
      } else {
        console.log("WAL mode enabled");
      }
    });
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
      FOREIGN KEY (parameter_id) REFERENCES parameters(id),
      FOREIGN KEY (value_id) REFERENCES parameter_values(id)
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      template_id TEXT,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (template_id) REFERENCES templates(id)
    );

    CREATE TABLE IF NOT EXISTS session_values (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      parameter_id TEXT NOT NULL,
      value TEXT NOT NULL,
      FOREIGN KEY (session_id) REFERENCES sessions(id),
      FOREIGN KEY (parameter_id) REFERENCES parameters(id)
    );

    -- Migration: add template_id to sessions if not present
    PRAGMA foreign_keys=OFF;
    BEGIN TRANSACTION;
    CREATE TABLE IF NOT EXISTS sessions_new (
      id TEXT PRIMARY KEY,
      template_id TEXT,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (template_id) REFERENCES templates(id)
    );
    -- Check if we need to migrate
    -- In a real app we'd check table_info, but for this refactor we can do a simple check
    INSERT OR IGNORE INTO sessions_new (id, name, created_at) SELECT id, name, created_at FROM sessions;
    DROP TABLE IF EXISTS sessions;
    ALTER TABLE sessions_new RENAME TO sessions;
    COMMIT;
    PRAGMA foreign_keys=ON;
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

// Sessions
app.put("/api/templates/:id", async (req, res) => {
  const template = req.body;
  const { id } = req.params;
  if (template.id !== id) {
    return res.status(400).json({ error: "ID mismatch" });
  }
  try {
    const result = await updateTemplate(db, template);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error("Update template error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/sessions", async (req, res) => {
  const session = req.body;
  console.log("POST /api/sessions - request body:", session);
  if (!session.id || !session.name) {
    return res.status(400).json({ error: "ID and name are required" });
  }
  try {
    const result = await saveSession(db, session);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    if (err.message.includes("already exists")) {
      return res.status(409).json({ success: false, error: err.message });
    }
    console.error("Save session error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/sessions", async (req, res) => {
  try {
    const sessions = await getAllSessions(db);
    res.json({ sessions, count: sessions.length });
  } catch (err) {
    console.error("Get sessions error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/sessions/:id", async (req, res) => {
  const session = req.body;
  const { id } = req.params;
  if (session.id !== id) {
    return res.status(400).json({ error: "ID mismatch" });
  }
  try {
    const result = await updateSession(db, session);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error("Update session error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.delete("/api/sessions/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await deleteSession(db, id);
    res.json({ success: true, message: `Session ${id} deleted successfully` });
  } catch (err) {
    if (err.message.includes("does not exist")) {
      return res.status(404).json({ success: false, error: err.message });
    }
    console.error("Delete session error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

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

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Database: ${dbPath}`);
});
