import api from "./api";

export const getTopics = async () => {
  try {
    const response = await api.get("/topics");

    return response.data;
  } catch (error) {
    return error.response.data.error;
  }
};
