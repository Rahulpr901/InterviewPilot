import axiosClient from "./axiosClient";

export const getReports = () => axiosClient.get("/reports");
export const getReportById = (id) => axiosClient.get(`/reports/${id}`);
