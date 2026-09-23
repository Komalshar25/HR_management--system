import Chip from "@mui/material/Chip";

const STATUS_STYLES = {
  Working: { bg: "rgba(37,99,235,0.14)", color: "#2563eb" },
  Present: { bg: "rgba(37,99,235,0.14)", color: "#2563eb" },
  Completed: { bg: "rgba(22,163,74,0.14)", color: "#16a34a" },
  Approved: { bg: "rgba(22,163,74,0.14)", color: "#16a34a" },
  Late: { bg: "rgba(217,119,6,0.15)", color: "#d97706" },
  Absent: { bg: "rgba(220,38,38,0.14)", color: "#dc2626" },
  Rejected: { bg: "rgba(220,38,38,0.14)", color: "#dc2626" },
  "On Leave": { bg: "rgba(124,58,237,0.16)", color: "#7c3aed" },
  Pending: { bg: "rgba(217,119,6,0.15)", color: "#d97706" },
  Active: { bg: "rgba(22,163,74,0.14)", color: "#16a34a" },
  Excellent: { bg: "rgba(22,163,74,0.14)", color: "#16a34a" },
  Good: { bg: "rgba(37,99,235,0.14)", color: "#2563eb" },
  Average: { bg: "rgba(217,119,6,0.15)", color: "#d97706" },
  "Needs Improvement": { bg: "rgba(220,38,38,0.14)", color: "#dc2626" },
  Selected: { bg: "rgba(22,163,74,0.14)", color: "#16a34a" },
  Verified: { bg: "rgba(22,163,74,0.14)", color: "#16a34a" },
};

const StatusChip = ({ status, size = "small" }) => {
  const style = STATUS_STYLES[status] || { bg: "rgba(148,163,184,0.18)", color: "#94a3b8" };
  return (
    <Chip
      label={status}
      size={size}
      sx={{
        bgcolor: style.bg,
        color: style.color,
        fontWeight: 600,
        fontSize: "0.75rem",
        border: "none",
      }}
    />
  );
};

export default StatusChip;
