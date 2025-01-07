import api from "./api";

export const createComment = async (commentData) => {
  try {
    const response = await api.post("/comments", commentData);
    return response.data;
  } catch (error) {
    return error.response.data.error;
  }
};

export const updateComment = async (id, commentData) => {
  try {
    const response = await api.put(`/comments/${id}`, commentData);
    return response.data;
  } catch (error) {
    return error.response.data.error;
  }
};

export const getCommentByUser = async (userId) => {
  try {
    const response = await api.get(`/comments/user/${userId}`);
    return response.data;
  } catch (error) {
    return error.response.data.error;
  }
};

export const getCommentByTemplate = async (templateId) => {
  try {
    const response = await api.get(`/comments/template/${templateId}`);
    return response.data;
  } catch (error) {
    return error.response.data.error;
  }
};

export const deleteComment = async (commentId) => {
  try {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  } catch (error) {
    return error.response.data.error;
  }
};
