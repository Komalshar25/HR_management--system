import { useMemo } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  computeMonthlySummary,
  computeAttendanceStats,
  formatMinutesAsTime,
} from "../../utils/attendanceStats";

const SEGMENTS = [
  { key: "present", label: "Present", color: "#16a34a" },
  { key: "late", label: "Late", color: "#d97706" },
  { key: "leave", label: "On leave", color: "#7c3aed" },
  { key: "absent", label: "Absent", color: "#dc2626" },
];

const Stat = ({ label, value }) => (
  <Box>
    <Typography variant="caption" color="text.secondary">{label}</Typography>
    <Typography variant="body1" fontWeight={800}>{value}</Typography>
  </Box>
);

const AttendanceSummaryCard = ({ records, leaves }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const now = useMemo(() => new Date(), []);
  const summary = useMemo(
    () => computeMonthlySummary(records, leaves, now, user?.createdAt),
    [records, leaves, now, user?.createdAt]
  );
  const stats = useMemo(() => computeAttendanceStats(records, now), [records, now]);

  const attended = summary.present + summary.late;
  const rate = summary.tracked > 0 ? Math.round((attended / summary.tracked) * 100) : null;
  const monthName = now.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  return (
    <Paper sx={{ p: 3, height: "100%" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
        <Box>
          <Typography variant="subtitle1" fontWeight={700}>Attendance summary</Typography>
          <Typography variant="caption" color="text.secondary">{monthName}</Typography>
        </Box>
        <Button size="small" onClick={() => navigate("/attendance")} sx={{ boxShadow: "none" }}>Details</Button>
      </Box>

      <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 1.5 }}>
        <Typography variant="h3" fontWeight={800}>{rate == null ? "—" : `${rate}%`}</Typography>
        <Typography variant="body2" color="text.secondary">attendance rate</Typography>
      </Box>

      <Box sx={{ display: "flex", height: 10, borderRadius: 5, overflow: "hidden", bgcolor: "rgba(128,128,128,0.18)", mb: 2 }}>
        {summary.tracked > 0 &&
          SEGMENTS.map((s) =>
            summary[s.key] > 0 ? (
              <Box key={s.key} sx={{ width: `${(summary[s.key] / summary.tracked) * 100}%`, bgcolor: s.color }} title={`${s.label}: ${summary[s.key]}`} />
            ) : null
          )}
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, mb: 2.5 }}>
        {SEGMENTS.map((s) => (
          <Box key={s.key}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: s.color }} />
              <Typography variant="caption" color="text.secondary">{s.label}</Typography>
            </Box>
            <Typography variant="h6" fontWeight={800}>{summary[s.key]}</Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ pt: 2, borderTop: "1px solid rgba(128,128,128,0.2)", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}>
        <Stat label="Avg. hours / day" value={stats.avgHours ? `${stats.avgHours.toFixed(1)}h` : "—"} />
        <Stat label="Avg. check-in" value={formatMinutesAsTime(stats.avgCheckIn)} />
        <Stat label="Late arrivals" value={stats.lateArrivals} />
      </Box>
    </Paper>
  );
};

export default AttendanceSummaryCard;
