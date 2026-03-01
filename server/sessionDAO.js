// Helper to add new values to template suggestions if they don't exist
const learnNewValues = async (db, values) => {
    for (const val of values) {
        if (!val.value || !val.parameter_id) continue;

        // Check if value already exists for this parameter in template suggestions
        await new Promise((resolve, reject) => {
            db.get(
                "SELECT id FROM parameter_values WHERE parameter_id = ? AND value = ?",
                [val.parameter_id, val.value],
                (err, row) => {
                    if (err) return reject(err);
                    if (row) {
                        // Value already exists as a suggestion
                        resolve();
                    } else {
                        // New value! Add it to template suggestions
                        const newValId = crypto.randomUUID();
                        db.run(
                            "INSERT INTO parameter_values (id, parameter_id, value) VALUES (?, ?, ?)",
                            [newValId, val.parameter_id, val.value],
                            (err) => {
                                if (err) return reject(err);
                                resolve();
                            }
                        );
                    }
                }
            );
        });
    }
};

export const saveSession = async (db, session) => {
    return new Promise((resolve, reject) => {
        if (!session || !session.id || !session.name) {
            return reject(new Error("Session incomplete"));
        }

        db.serialize(async () => {
            // 1. Learn new values first
            if (session.values && Array.isArray(session.values)) {
                try {
                    await learnNewValues(db, session.values);
                } catch (err) {
                    console.error("Error learning new values:", err);
                    // Don't fail the session save if learning fails
                }
            }

            db.run("BEGIN TRANSACTION", (err) => {
                if (err) return reject(err);

                // 2. Insert session
                db.run(
                    "INSERT INTO sessions (id, template_id, name) VALUES (?, ?, ?)",
                    [session.id, session.template_id || null, session.name],
                    (err) => {
                        if (err) {
                            db.run("ROLLBACK");
                            return reject(err);
                        }

                        // 3. Insert values if any
                        if (session.values && Array.isArray(session.values)) {
                            let pending = session.values.length;
                            if (pending === 0) {
                                db.run("COMMIT", (err) => {
                                    if (err) {
                                        db.run("ROLLBACK");
                                        return reject(err);
                                    }
                                    resolve({ id: session.id });
                                });
                                return;
                            }

                            session.values.forEach((val) => {
                                const valId = crypto.randomUUID();
                                db.run(
                                    "INSERT INTO session_values (id, session_id, parameter_id, value) VALUES (?, ?, ?, ?)",
                                    [valId, session.id, val.parameter_id, val.value],
                                    (err) => {
                                        if (err) {
                                            db.run("ROLLBACK");
                                            return reject(err);
                                        }
                                        pending--;
                                        if (pending === 0) {
                                            db.run("COMMIT", (err) => {
                                                if (err) {
                                                    db.run("ROLLBACK");
                                                    return reject(err);
                                                }
                                                resolve({ id: session.id });
                                            });
                                        }
                                    }
                                );
                            });
                        } else {
                            db.run("COMMIT", (err) => {
                                if (err) {
                                    db.run("ROLLBACK");
                                    return reject(err);
                                }
                                resolve({ id: session.id });
                            });
                        }
                    }
                );
            });
        });
    });
};

export const updateSession = async (db, session) => {
    return new Promise((resolve, reject) => {
        if (!session || !session.id) {
            return reject(new Error("Session ID is required for update"));
        }

        db.serialize(async () => {
            // 1. Learn new values
            if (session.values && Array.isArray(session.values)) {
                try {
                    await learnNewValues(db, session.values);
                } catch (err) {
                    console.error("Error learning new values during update:", err);
                }
            }

            db.run("BEGIN TRANSACTION", (err) => {
                if (err) return reject(err);

                // 2. Update session name and created_at if provided
                const updateQuery = session.created_at
                    ? "UPDATE sessions SET name = ?, created_at = ? WHERE id = ?"
                    : "UPDATE sessions SET name = ? WHERE id = ?";
                const updateParams = session.created_at
                    ? [session.name, session.created_at, session.id]
                    : [session.name, session.id];

                db.run(
                    updateQuery,
                    updateParams,
                    (err) => {
                        if (err) {
                            db.run("ROLLBACK");
                            return reject(err);
                        }

                        // 3. Delete old values
                        db.run(
                            "DELETE FROM session_values WHERE session_id = ?",
                            [session.id],
                            (err) => {
                                if (err) {
                                    db.run("ROLLBACK");
                                    return reject(err);
                                }

                                // 4. Insert new values
                                if (session.values && Array.isArray(session.values)) {
                                    let pending = session.values.length;
                                    if (pending === 0) {
                                        db.run("COMMIT", (err) => {
                                            if (err) {
                                                db.run("ROLLBACK");
                                                return reject(err);
                                            }
                                            resolve({ id: session.id });
                                        });
                                        return;
                                    }

                                    session.values.forEach((val) => {
                                        const valId = crypto.randomUUID();
                                        db.run(
                                            "INSERT INTO session_values (id, session_id, parameter_id, value) VALUES (?, ?, ?, ?)",
                                            [valId, session.id, val.parameter_id, val.value],
                                            (err) => {
                                                if (err) {
                                                    db.run("ROLLBACK");
                                                    return reject(err);
                                                }
                                                pending--;
                                                if (pending === 0) {
                                                    db.run("COMMIT", (err) => {
                                                        if (err) {
                                                            db.run("ROLLBACK");
                                                            return reject(err);
                                                        }
                                                        resolve({ id: session.id });
                                                    });
                                                }
                                            }
                                        );
                                    });
                                } else {
                                    db.run("COMMIT", (err) => {
                                        if (err) {
                                            db.run("ROLLBACK");
                                            return reject(err);
                                        }
                                        resolve({ id: session.id });
                                    });
                                }
                            }
                        );
                    }
                );
            });
        });
    });
};

export const getAllSessions = async (db) => {
    return new Promise((resolve, reject) => {
        const query = `
      SELECT 
        s.id as session_id,
        s.name as session_name,
        s.template_id,
        s.created_at as session_created_at,
        sv.parameter_id,
        sv.value as session_value,
        p.name as parameter_name,
        p.units as parameter_units
      FROM sessions s
      LEFT JOIN session_values sv ON s.id = sv.session_id
      LEFT JOIN parameters p ON sv.parameter_id = p.id
      ORDER BY s.created_at DESC
    `;

        db.all(query, (err, rows) => {
            if (err) {
                console.error("Error fetching sessions:", err);
                return reject(err);
            }

            const sessionsMap = new Map();
            rows.forEach((row) => {
                if (!sessionsMap.has(row.session_id)) {
                    sessionsMap.set(row.session_id, {
                        id: row.session_id,
                        name: row.session_name,
                        template_id: row.template_id,
                        created_at: row.session_created_at,
                        parameters: [],
                    });
                }

                if (row.parameter_id) {
                    const session = sessionsMap.get(row.session_id);
                    session.parameters.push({
                        id: row.parameter_id,
                        name: row.parameter_name,
                        units: row.parameter_units,
                        value: row.session_value,
                    });
                }
            });

            resolve(Array.from(sessionsMap.values()));
        });
    });
};

export const deleteSession = async (db, sessionId) => {
    return new Promise((resolve, reject) => {
        if (!sessionId) {
            return reject(new Error("Session ID is required"));
        }

        db.serialize(() => {
            db.run("BEGIN TRANSACTION", (err) => {
                if (err) return reject(err);

                // Delete values first
                db.run(
                    "DELETE FROM session_values WHERE session_id = ?",
                    [sessionId],
                    (err) => {
                        if (err) {
                            db.run("ROLLBACK");
                            return reject(err);
                        }

                        // Delete session
                        db.run(
                            "DELETE FROM sessions WHERE id = ?",
                            [sessionId],
                            (err) => {
                                if (err) {
                                    db.run("ROLLBACK");
                                    return reject(err);
                                }
                                db.run("COMMIT", (err) => {
                                    if (err) {
                                        db.run("ROLLBACK");
                                        return reject(err);
                                    }
                                    resolve({ id: sessionId });
                                });
                            }
                        );
                    }
                );
            });
        });
    });
};
