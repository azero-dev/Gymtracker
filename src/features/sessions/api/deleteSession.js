import db from '../../../shared/db/db.js';

export const deleteSession = async (id) => {
    try {
        await db.transaction('rw', db.sessions, db.sessionValues, async () => {
            await db.sessionValues
                .where('session_id')
                .equals(id)
                .delete();

            await db.sessions.delete(id);
        });

        return { success: true, data: { message: `Session ${id} deleted` } };
    } catch (err) {
        console.error('Error deleting session:', err);
        return { success: false, error: err.message };
    }
};
