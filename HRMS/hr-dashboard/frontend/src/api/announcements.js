import api from "../services/axios";

export const listAnnouncements = () => api.get("/api/announcements").then((r) => r.data);
export const createAnnouncement = (data) => api.post("/api/announcements", data).then((r) => r.data);
export const deleteAnnouncement = (id) => api.delete(`/api/announcements/${id}`).then((r) => r.data);
export const getCelebrations = () => api.get("/api/announcements/celebrations").then((r) => r.data);
