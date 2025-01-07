import api from "./api";

export const createForms = async (formData) => {
  try {
    const response = await api.post("/forms", formData);
    return response.data;
  } catch (error) {
    return error.response.data.error;
  }
};

export const getFormsByTemplate = async (templateId) => {
  try {
    const response = await api.get(`/forms/template/${templateId}`);
    return response.data;
  } catch (error) {
    return error.response.data.error;
  }
};

export const getFormsByUser = async (userId) => {
  try {
    const response = await api.get(`/forms/user/${userId}`);
    return response.data;
  } catch (error) {
    return error.response.data.error;
  }
};

export const updateForm = async (id, formData) => {
  try {
    const response = await api.put(`/forms/${id}`, formData);
    return response.data;
  } catch (error) {
    return error.response.data.error;
  }
};

export const deleteForm = async (id) => {
  try {
    await api.delete(`/forms/${id}`);
    return response.data;
  } catch (error) {
    return error.response.data.error;
  }
};
