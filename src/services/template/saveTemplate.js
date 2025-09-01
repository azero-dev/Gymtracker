export const saveTemplate = async (templateData, config = {}) => {
  try {
    const { baseURL = "api", headers = {}, ...options } = config;
    // TODO: reuse hook by checking if template or param, then modify url accordingly

    const url = `/${baseURL}/templates`;
    const defaultHeaders = {
      "Content-Type": "application/json",
      ...headers,
    };
    const response = await fetch(url, {
      method: "POST",
      headers: defaultHeaders,
      body: JSON.stringify(templateData),
      ...options,
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Failed to save template");
    }
    return {
      success: true,
      data: result,
      status: response.status,
    };
  } catch (err) {
    alert("Error saving template: " + err.message);
    return {
      success: false,
      error: err.message,
    };
  }
};
