export const deleteTemplate = async (id) => {
  try {
    const url = `api/templates/${id}`;
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Failed to delete template");
    }
    return {
      success: true,
      data: result,
      status: response.status,
    };
  } catch (err) {
    alert("Error deleting template: " + err.message);
    return {
      success: false,
      error: err.message,
    };
  }
};
