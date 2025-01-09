import api from "./api";

export const uploadImage = async (imageData) => {
  try {
    const formData = new FormData();
    formData.append("file", imageData);

    const response = await api.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    return error.response.data.error;
  }
};
