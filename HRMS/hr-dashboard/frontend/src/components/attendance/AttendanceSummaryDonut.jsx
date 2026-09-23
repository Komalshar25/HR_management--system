import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ChartTooltip } from "recharts";

const SEGMENTS = [
  { key: "present", label: "Present", color: "#16a34a" },
  { key: "late", label: "Late", color: "#f59e0b" },
  { key: "absent", label: "Absent", color: "#dc2626" },
  { key: "leave", label: "Leave", color: "#2563eb" },
];

const AttendanceSummaryDonut = ({ summary }) => {
  const data = SEGMENTS.map((s) => ({ ...s, value: summary[s.key], pct: summary[`${s.key}Pct`] }));
  const hasData = summary.tracked > 0;

  return (
    <Paper sx={{ p: 3, height: "100%" }}>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Attendance Summary</Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}>
        <Box sx={{ width: 160, height: 160, flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={hasData ? data : [{ label: "None", value: 1, color: "rgba(148,163,184,0.35)" }]}
                dataKey="value"
                nameKey="label"
                innerRadius={52}
                outerRadius={74}
                paddingAngle={hasData ? 2 : 0}
                strokeWidth={0}
              >
                {(hasData ? data : [{ color: "rgba(148,163,184,0.35)" }]).map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              {hasData && (
                <ChartTooltip
                  contentStyle={{ borderRadius: 10, border: "1px solid rgba(128,128,128,0.25)" }}
                  formatter={(value, name, props) => [`${value} (${props.payload.pct}%)`, props.payload.label]}
                />
              )}
            </PieChart>
          </ResponsiveContainer>
        </Box>

        <Box sx={{ flex: 1, minWidth: 140, display: "flex", flexDirection: "column", gap: 1.25 }}>
          {data.map((s) => (
            <Box key={s.key} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: s.color }} />
                <Typography variant="body2" color="text.secondary">{s.label}</Typography>
              </Box>
              <Typography variant="body2" fontWeight={700}>
                {s.value} <Typography component="span" variant="caption" color="text.secondary">({s.pct}%)</Typography>
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
};

export default AttendanceSummaryDonut;
