export const getTemplates = async (filters = {}, config = {}) => {
  // TODO: refactor like saveTemplate (config)
  try {
    const response = await fetch("/api/templates");
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`,
      );
    }
    const data = await response.json();
    return {
      success: true,
      data: data,
      status: response.status,
    };
  } catch (error) {
    console.error("Error fetching templates:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
