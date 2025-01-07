import api from "./api";

export const getTemplates = async () => {
  try {
    const response = await api.get("/templates");
    return response.data;
  } catch (error) {
    return error.response.data.error;
  }
};

export const getTemplateById = async (id) => {
  try {
    const response = await api.get(`/templates/${id}`);
    return response.data;
  } catch (error) {
    return error.response.data.error;
  }
};

export const createTemplate = async (templateData) => {
  try {
    const response = await api.post("/templates", templateData);
    return response.data;
  } catch (error) {
    return error.response.data.error;
  }
};

export const updateTemplate = async (id, templateData) => {
  try {
    const response = await api.put(`/templates/${id}/update`, templateData);
    return response.data;
  } catch (error) {
    return error.response.data.error;
  }
};

export const deleteTemplate = async (id) => {
  try {
    const response = await api.delete(`/templates/${id}/delete`);
    return response.data;
  } catch (error) {
    return error.response.data.error;
  }
};
