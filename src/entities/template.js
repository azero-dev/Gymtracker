/**
 * Template entity — plain object factories replacing the OOP Template class.
 * Immutable-friendly, serializable to JSON.
 */

export const createTemplate = ({ name = "", parameters = {} } = {}) => ({
    id: crypto.randomUUID(),
    name,
    parameters, // { [id]: parameter }
    highlights: [], // max 3 parameter ids
});

export const setTemplateName = (template, name) => ({
    ...template,
    name,
});

export const addParameter = (template, parameter) => ({
    ...template,
    parameters: {
        ...template.parameters,
        [parameter.id]: parameter,
    },
});

export const removeParameter = (template, parameterId) => {
    const { [parameterId]: _, ...rest } = template.parameters;
    return { ...template, parameters: rest };
};

export const getParametersArray = (template) =>
    Object.values(template.parameters);

export const templateToJSON = (template) => ({
    id: template.id,
    name: template.name,
    highlights: template.highlights,
    parameters: getParametersArray(template).map((param) => ({
        id: param.id,
        name: param.name,
        units: param.units,
        values: param.values,
    })),
});
