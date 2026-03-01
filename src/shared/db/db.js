import Dexie from 'dexie';

const db = new Dexie('GymtrackDB');

db.version(1).stores({
    templates: 'id, name, created_at',
    parameters: 'id, template_id, name, units',
    parameterValues: '++id, parameter_id, value',
    sessions: 'id, template_id, name, created_at',
    sessionValues: '++id, session_id, parameter_id, value',
});

export default db;
