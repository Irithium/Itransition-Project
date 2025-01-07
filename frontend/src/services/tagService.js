import api from "./api";

export const getTags = async () => {
  try {
    const response = await api.get("/tags");
    return response.data;
  } catch (error) {
    return error.response.data.error;
  }
};
