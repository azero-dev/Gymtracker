import db from '../../../shared/db/db.js';

export const saveSession = async (sessionData) => {
    try {
        await db.transaction('rw', db.sessions, db.sessionValues, async () => {
            await db.sessions.add({
                id: sessionData.id,
                template_id: sessionData.template_id,
                name: sessionData.name,
                created_at: sessionData.created_at || new Date().toISOString(),
            });

            if (sessionData.values && Array.isArray(sessionData.values)) {
                for (const val of sessionData.values) {
                    await db.sessionValues.add({
                        session_id: sessionData.id,
                        parameter_id: val.parameter_id,
                        value: val.value,
                    });
                }
            }
        });

        return { success: true, data: sessionData };
    } catch (err) {
        console.error('Error saving session:', err);
        return { success: false, error: err.message };
    }
};
