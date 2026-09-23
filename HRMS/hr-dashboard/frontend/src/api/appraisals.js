import api from "../services/axios";

export const getMyAppraisals = () => api.get("/api/appraisals/my").then((r) => r.data);
export const getAppraisalSummary = () => api.get("/api/appraisals/summary").then((r) => r.data);
export const getAllAppraisals = () => api.get("/api/appraisals/all").then((r) => r.data);
export const getAppraisalsByUser = (id) => api.get(`/api/appraisals/user/${id}`).then((r) => r.data);
