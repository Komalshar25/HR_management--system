import api from "../services/axios";

export const getMyLeaves = () => api.get("/api/leaves/my").then((r) => r.data);
export const getPendingLeaves = () => api.get("/api/leaves/pending").then((r) => r.data);
export const getAllLeaves = (status) =>
  api.get("/api/leaves/all", { params: status ? { status } : {} }).then((r) => r.data);
export const getLeavesByUser = (id) =>
  api.get(`/api/leaves/user/${id}`).then((r) => r.data);
export const requestLeave = (data) => api.post("/api/leaves/request", data).then((r) => r.data);
export const updateLeaveStatus = (id, status) =>
  api.patch(`/api/leaves/${id}/status`, { status }).then((r) => r.data);
