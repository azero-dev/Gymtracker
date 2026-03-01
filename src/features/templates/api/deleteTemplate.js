import db from '../../../shared/db/db.js';

export const deleteTemplate = async (id) => {
    try {
        await db.transaction('rw', db.templates, db.parameters, db.parameterValues, db.sessions, db.sessionValues, async () => {
            // Get parameters for this template
            const params = await db.parameters
                .where('template_id')
                .equals(id)
                .toArray();

            // Delete parameter values
            for (const param of params) {
                await db.parameterValues
                    .where('parameter_id')
                    .equals(param.id)
                    .delete();
            }

            // Delete parameters
            await db.parameters
                .where('template_id')
                .equals(id)
                .delete();

            // Delete template
            await db.templates.delete(id);
        });

        return { success: true, data: { message: `Template ${id} deleted` } };
    } catch (err) {
        console.error('Error deleting template:', err);
        return { success: false, error: err.message };
    }
};
