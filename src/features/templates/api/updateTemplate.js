import db from '../../../shared/db/db.js';

export const updateTemplate = async (templateData) => {
    try {
        await db.transaction('rw', db.templates, db.parameters, db.parameterValues, async () => {
            // Update template name if needed
            await db.templates.update(templateData.id, { name: templateData.name });

            // For each parameter, update its values
            for (const param of templateData.parameters) {
                // Delete old values
                await db.parameterValues
                    .where('parameter_id')
                    .equals(param.id)
                    .delete();

                // Add new values
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
        console.error('Error updating template:', err);
        return { success: false, error: err.message };
    }
};
