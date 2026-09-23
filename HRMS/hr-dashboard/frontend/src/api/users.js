import api from "../services/axios";

export const listUsers = () => api.get("/api/users").then((r) => r.data);
export const getUser = (id) => api.get(`/api/users/${id}`).then((r) => r.data);
export const createUser = (data) => api.post("/api/users", data).then((r) => r.data);
export const updateUserRole = (id, role) =>
  api.patch(`/api/users/${id}/role`, { role }).then((r) => r.data);
export const updateMe = (data) => api.patch("/api/users/me", data).then((r) => r.data);
export const searchUsers = (q) =>
  api.get("/api/users/search", { params: { q } }).then((r) => r.data);
