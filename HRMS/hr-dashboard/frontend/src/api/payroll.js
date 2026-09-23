import api from "../services/axios";

export const getMyPayroll = () => api.get("/api/payroll/my").then((r) => r.data);
export const getPayrollSummary = () => api.get("/api/payroll/summary").then((r) => r.data);
export const getAllPayroll = (month) =>
  api.get("/api/payroll/all", { params: month ? { month } : {} }).then((r) => r.data);
export const getPayrollByUser = (id) => api.get(`/api/payroll/user/${id}`).then((r) => r.data);
