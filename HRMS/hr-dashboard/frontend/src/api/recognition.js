import api from "../services/axios";

export const giveKudos = (data) => api.post("/api/kudos", data).then((r) => r.data);
export const getRecentKudos = () => api.get("/api/kudos/recent").then((r) => r.data);
export const getKudosLeaderboard = () => api.get("/api/kudos/leaderboard").then((r) => r.data);
export const getKudosForUser = (id) => api.get(`/api/kudos/user/${id}`).then((r) => r.data);
