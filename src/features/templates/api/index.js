import { getTemplates } from "./getTemplates.js";
import { saveTemplate } from "./saveTemplate.js";
import { updateTemplate } from "./updateTemplate.js";
import { deleteTemplate } from "./deleteTemplate.js";

export const templateApi = {
    get: getTemplates,
    post: saveTemplate,
    put: updateTemplate,
    delete: deleteTemplate,
};
