import { saveTemplate } from "./saveTemplate.js";
import { getTemplates } from "./getTemplate.js";
import { deleteTemplate } from "./deleteTemplate.js";

export const templateServices = {
  get: getTemplates,
  post: saveTemplate,
  update: null,
  delete: deleteTemplate,
};
