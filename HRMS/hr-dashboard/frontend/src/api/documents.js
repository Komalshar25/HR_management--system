import api from "../services/axios";

export const getMyDocuments = () => api.get("/api/documents/my").then((r) => r.data);
export const getDocumentsByUser = (id) => api.get(`/api/documents/user/${id}`).then((r) => r.data);
