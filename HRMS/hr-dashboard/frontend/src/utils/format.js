export const formatDuration = (ms) => {
  if (!ms || ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
  const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
  const s = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
};

export const formatHoursShort = (ms) => {
  const hours = (ms || 0) / (1000 * 60 * 60);
  return `${hours.toFixed(1)}h`;
};

export const formatTime = (date) =>
  date ? new Date(date).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }) : "—";

export const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—";

export const formatCurrency = (amount) =>
  typeof amount === "number"
    ? amount.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })
    : "—";

export const formatMonthLabel = (monthKey) =>
  monthKey
    ? new Date(`${monthKey}-01`).toLocaleDateString(undefined, { month: "long", year: "numeric" })
    : "—";

const LATE_HOUR = 9;
const LATE_MINUTE = 30;

export const attendanceStatusFor = (record) => {
  if (!record) return "Absent";
  if (record.status === "Absent") return "Absent";
  if (record.status === "Leave") return "On Leave";
  if (!record.checkOut) return "Working";
  const checkIn = new Date(record.checkIn);
  const isLate = checkIn.getHours() > LATE_HOUR || (checkIn.getHours() === LATE_HOUR && checkIn.getMinutes() > LATE_MINUTE);
  return isLate ? "Late" : "Completed";
};

export const timeAgo = (date) => {
  if (!date) return "";
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(date);
};
