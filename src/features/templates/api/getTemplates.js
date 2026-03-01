import db from '../../../shared/db/db.js';

export const getTemplates = async () => {
    try {
        const templates = await db.templates.orderBy('created_at').reverse().toArray();

        const templatesWithParams = await Promise.all(
            templates.map(async (template) => {
                const parameters = await db.parameters
                    .where('template_id')
                    .equals(template.id)
                    .toArray();

                const paramsWithValues = await Promise.all(
                    parameters.map(async (param) => {
                        const valueRecords = await db.parameterValues
                            .where('parameter_id')
                            .equals(param.id)
                            .toArray();
                        return {
                            id: param.id,
                            name: param.name,
                            units: param.units,
                            values: valueRecords.map((v) => v.value),
                        };
                    })
                );

                return {
                    id: template.id,
                    name: template.name,
                    parameters: paramsWithValues,
                };
            })
        );

        return {
            success: true,
            data: { templates: templatesWithParams, count: templatesWithParams.length },
        };
    } catch (error) {
        console.error('Error fetching templates:', error);
        return { success: false, error: error.message };
    }
};
