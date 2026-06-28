import axiosClient from "./axiosClient";

export const uploadResume = (formData) =>
  axiosClient.post("/resume/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getResumes = () => axiosClient.get("/resume");
export const getResumeById = (id) => axiosClient.get(`/resume/${id}`);
