/**
 * Parameter entity — plain object factories replacing the OOP Parameter class.
 * Immutable-friendly, serializable to JSON.
 */

export const createParameter = ({ id, name = "", units = "", values = [] } = {}) => ({
    id: id ?? crypto.randomUUID(),
    name,
    units,
    values, // string[]
});

export const addValue = (parameter, value) => ({
    ...parameter,
    values: [...parameter.values, value],
});

export const removeValue = (parameter, value) => ({
    ...parameter,
    values: parameter.values.filter((v) => v !== value),
});
