import db from '../../../shared/db/db.js';

export const saveTemplate = async (templateData) => {
    try {
        await db.transaction('rw', db.templates, db.parameters, db.parameterValues, async () => {
            await db.templates.add({
                id: templateData.id,
                name: templateData.name,
                created_at: new Date().toISOString(),
            });

            for (const param of templateData.parameters) {
                await db.parameters.add({
                    id: param.id,
                    template_id: templateData.id,
                    name: param.name,
                    units: param.units || '',
                });

                if (param.values && Array.isArray(param.values)) {
                    for (const val of param.values) {
                        await db.parameterValues.add({
                            parameter_id: param.id,
                            value: val,
                        });
                    }
                }
            }
        });

        return { success: true, data: templateData };
    } catch (err) {
        console.error('Error saving template:', err);
        return { success: false, error: err.message };
    }
};
