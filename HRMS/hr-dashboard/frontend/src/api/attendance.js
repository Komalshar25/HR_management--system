import api from "../services/axios";

export const getMyAttendance = () => api.get("/api/attendance/my").then((r) => r.data);
export const clockIn = () => api.post("/api/attendance/clock-in").then((r) => r.data);
export const clockOut = () => api.post("/api/attendance/clock-out").then((r) => r.data);
export const getAllAttendance = (params) =>
  api.get("/api/attendance/all", { params }).then((r) => r.data);
export const getAttendanceByUser = (id) =>
  api.get(`/api/attendance/user/${id}`).then((r) => r.data);
