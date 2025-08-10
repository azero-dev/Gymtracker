const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");
const app = express();
const PORT = process.env.PORT || 4666;

app.use(express.json());
app.use(express.static("public"));

const dbDir = path.join(__dirname, "database");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}
const dbPath = path.join(dbDir, "numbers.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error while connecting to the db", err);
    process.exit(1);
  } else {
    console.log("Connected to db");
  }
});

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS numbers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        weight REAL NOT NULL,
        distance REAL NOT NULL,
        time REAL NOT NULL,
        food INTEGER CHECK (food IN (0, 1)),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    (err) => {
      if (err) {
        console.error("Error creating the table", err.message);
      } else {
        console.log('Table ready (db)');
      }
    },
  );
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/api/numbers", (req, res) => {
  const { weight, distance, time, food } = req.body;
  if (weight < 0 || isNaN(parseFloat(weight))) {
    return res.status(400).json({ error: "Invalid weight" });
  }
  if (distance < 0 || isNaN(parseFloat(distance))) {
    return res.status(400).json({ error: "Invalid distance" });
  }
  if (time < 0 || isNaN(parseFloat(time))) {
    return res.status(400).json({ error: "Invalid time" });
  }
  const stmt = db.prepare(
    "INSERT INTO numbers (weight, distance, time, food) VALUES (?, ?, ?, ?)",
  );
  stmt.run([weight, distance, time, food], function (err) {
    if (err) {
      console.error("Error inserting:", err);
      return res.status(500).json({
        error: "Internal server error",
      });
    }
    res.status(201).json({
      weight: weight,
      distance: distance,
      time: time,
      food: food,
      message: "Session saved",
    });
  });
  stmt.finalize();
});

app.get("/api/numbers", (req, res) => {
  db.all("SELECT * FROM numbers ORDER BY created_at DESC", (err, rows) => {
    if (err) {
      console.error("Error al consultar:", err);
      return res.status(500).json({
        error: "Internat server error",
      });
    }
    res.json({
      numbers: rows,
      count: rows.length,
    });
  });
});

app.get("/api/numbers/:id", (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM numbers WHERE id = ?", [id], (err, row) => {
    if (err) {
      console.error("Error accesing:", err);
      return res.status(500).json({
        error: "Internat server error",
      });
    }
    if (!row) {
      return res.status(404).json({
        error: "Session not found",
      });
    }
    res.json(row);
  });
});

app.delete("/api/numbers/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM numbers WHERE id = ?", [id], function (err) {
    if (err) {
      console.error("Error deleting:", err);
      return res.status(500).json({
        error: "Internal server error",
      });
    }
    if (this.changes === 0) {
      return res.status(404).json({
        error: "Session not found",
      });
    }
    res.json({
      message: "Session Successfully deleted",
      deletedId: id,
    });
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong :(",
  });
});

app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found - 404",
  });
});

process.on("SIGINT", () => {
  console.log("\nClosing server...");
  db.close((err) => {
    if (err) {
      console.error("Error closing the db:", err);
    } else {
      console.log("Database conection closed.");
    }
    process.exit(0);
  });
});

app.listen(PORT, () => {
  console.log(`Server started: http://localhost:${PORT}`);
  console.log(`Database in: ${dbPath}`);
});

module.exports = app;
