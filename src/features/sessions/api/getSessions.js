import db from '../../../shared/db/db.js';

export const getSessions = async (filters = {}) => {
    try {
        let collection = db.sessions.orderBy('created_at').reverse();

        // Apply filters if needed (e.g. routine name, date range)
        // For now, simplicity: get all and then filter in memory or extend Dexie query
        let sessions = await collection.toArray();

        const sessionsWithValues = await Promise.all(
            sessions.map(async (session) => {
                const values = await db.sessionValues
                    .where('session_id')
                    .equals(session.id)
                    .toArray();

                const parameters = await Promise.all(
                    values.map(async (v) => {
                        const param = await db.parameters.get(v.parameter_id);
                        return {
                            id: v.parameter_id,
                            name: param?.name || 'Unknown',
                            units: param?.units || '',
                            value: v.value,
                        };
                    })
                );

                return {
                    ...session,
                    parameters,
                };
            })
        );

        return {
            success: true,
            data: { sessions: sessionsWithValues, count: sessionsWithValues.length },
        };
    } catch (error) {
        console.error('Error fetching sessions:', error);
        return { success: false, error: error.message };
    }
};
