import axiosClient from "./axiosClient";

export const startInterview = (payload) =>
  axiosClient.post("/interview/start", payload);
export const submitAnswer = (payload) =>
  axiosClient.post("/interview/answer", payload);
export const endInterview = (payload) =>
  axiosClient.post("/interview/end", payload);
