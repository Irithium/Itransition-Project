import api from "./api";

export const createLikes = async (id, likeData) => {
  try {
    const response = await api.post(`/likes/templates/${id}`, likeData);
    return response.data;
  } catch (error) {
    return error.response.data.error;
  }
};

export const deleteLikes = async (id) => {
  try {
    const response = await api.delete(`/likes/templates/${id}`);
    return response.data;
  } catch (error) {
    return error.response.data.error;
  }
};

export const getTemplatesByLikes = async () => {
  try {
    const response = await api.get("/likes/templates");
    return response.data;
  } catch (error) {
    return error.response.data.error;
  }
};
