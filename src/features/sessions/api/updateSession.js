import db from '../../../shared/db/db.js';

export const updateSession = async (sessionData) => {
    try {
        await db.transaction('rw', db.sessions, db.sessionValues, async () => {
            await db.sessions.update(sessionData.id, {
                template_id: sessionData.template_id,
                name: sessionData.name,
                created_at: sessionData.created_at,
            });

            // Delete old values
            await db.sessionValues
                .where('session_id')
                .equals(sessionData.id)
                .delete();

            // Add new values
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
        console.error('Error updating session:', err);
        return { success: false, error: err.message };
    }
};
