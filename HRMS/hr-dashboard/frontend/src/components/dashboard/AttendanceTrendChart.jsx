import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer } from "recharts";
import EmptyState from "../common/EmptyState";
import { CardSkeleton } from "../common/LoadingSkeleton";

const AttendanceTrendChart = ({ trend, loading, range, onRangeChange }) => (
  <Paper sx={{ p: 3, height: "100%" }}>
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 1 }}>
      <Typography variant="subtitle1" fontWeight={700}>Attendance Trend</Typography>
      <ToggleButtonGroup size="small" exclusive value={range} onChange={(e, v) => v && onRangeChange(v)}>
        <ToggleButton value="daily" sx={{ textTransform: "none", px: 1.5 }}>Daily</ToggleButton>
        <ToggleButton value="weekly" sx={{ textTransform: "none", px: 1.5 }}>Weekly</ToggleButton>
        <ToggleButton value="monthly" sx={{ textTransform: "none", px: 1.5 }}>Monthly</ToggleButton>
      </ToggleButtonGroup>
    </Box>
    {loading ? (
      <CardSkeleton height={260} />
    ) : !trend?.data?.length ? (
      <EmptyState title="No attendance data yet" description="Once employees start clocking in, trends will appear here." />
    ) : trend.data.length < 3 ? (
      <Box sx={{ height: 260, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 0.5 }}>
        <Typography variant="h3" fontWeight={800}>{trend.data[trend.data.length - 1].present}</Typography>
        <Typography variant="body2" color="text.secondary">
          present on {trend.data[trend.data.length - 1].label} · {trend.data[trend.data.length - 1].attendanceRate}% of workforce
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, maxWidth: 260 }}>
          The trend line appears once at least 3 days of attendance are recorded.
        </Typography>
      </Box>
    ) : (
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={trend.data}>
          <defs>
            <linearGradient id="attendanceFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} allowDecimals={false} />
          <ChartTooltip
            contentStyle={{ borderRadius: 10, border: "1px solid rgba(128,128,128,0.25)" }}
            formatter={(value) => [value, "Present"]}
          />
          <Area type="monotone" dataKey="present" stroke="#2563eb" strokeWidth={2} fill="url(#attendanceFill)" />
        </AreaChart>
      </ResponsiveContainer>
    )}
  </Paper>
);

export default AttendanceTrendChart;
