import api from "../services/axios";

export const getRecruitmentSummary = () => api.get("/api/recruitment/summary").then((r) => r.data);
export const getAllCandidates = (params) => api.get("/api/recruitment/all", { params }).then((r) => r.data);
