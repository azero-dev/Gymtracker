import { useEffect, useState } from "react";
import { templateServices } from "../../../services/template/templateServices.js";

export const useTemplates = (initialFilters = {}) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [updating, setUpdating] = useState(null);
  // WARNING: error is set as a placeholder. Set proper error handling later.
  const [error, setError] = useState(null);

  const loadTemplates = async (filters = initialFilters) => {
    setLoading(true);
    try {
      const result = await templateServices.get(filters);
      if (result.success) {
        const templatesArray = result.data.templates || [];
        setTemplates(templatesArray);
      } else {
        setTemplates([]);
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error("Loading templates failed:", err);
      setTemplates([]);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (templateData) => {
    setSaving(true);
    try {
      const result = await templateServices.post(templateData);
      if (result.success) {
        await loadTemplates();
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setSaving(false);
    }
  };

  const deleteTemplate = async (templateId) => {
    setDeleting(templateId);
    try {
      const result = await templateServices.delete(templateId);
      if (result.success) {
        await loadTemplates();
        return { success: true, message: result.message };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      console.error("Delete template failed:", err);
      return { success: false, error: err.message };
    } finally {
      setDeleting(null);
    }
  };

  // TODO::
  // const updateTemplate = async (id, updates) => {};

  useEffect(() => {
    loadTemplates();
  }, []);

  return {
    templates,
    loading,
    error,
    saving,
    deleting,
    updating,
    loadTemplates,
    createTemplate,
    deleteTemplate,
  };
};
