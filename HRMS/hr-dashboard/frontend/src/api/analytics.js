import api from "../services/axios";

export const getOverview = () => api.get("/api/analytics/overview").then((r) => r.data);
export const getAttendanceTrend = (range) =>
  api.get("/api/analytics/attendance-trend", { params: { range } }).then((r) => r.data);
export const getDepartmentBreakdown = () =>
  api.get("/api/analytics/department-breakdown").then((r) => r.data);
export const getLeaveTrend = (range) =>
  api.get("/api/analytics/leave-trend", { params: { range } }).then((r) => r.data);
export const getWorkforceDistribution = () =>
  api.get("/api/analytics/workforce-distribution").then((r) => r.data);
