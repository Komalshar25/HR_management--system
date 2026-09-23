import { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, LabelList } from "recharts";
import { computeWeeklyHours, formatHoursMinutes } from "../../utils/attendanceStats";

const WeeklyHoursChart = ({ records }) => {
  const [weekOffset, setWeekOffset] = useState(0);

  const data = useMemo(() => computeWeeklyHours(records, weekOffset), [records, weekOffset]);
  const maxHours = Math.max(4, ...data.map((d) => d.hours));
  const domainMax = maxHours <= 4 ? 4 : maxHours <= 8 ? 8 : 12;

  return (
    <Paper sx={{ p: 3, height: "100%" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700}>Weekly Working Hours</Typography>
        <Select size="small" value={weekOffset} onChange={(e) => setWeekOffset(e.target.value)} sx={{ minWidth: 130 }}>
          <MenuItem value={0}>This Week</MenuItem>
          <MenuItem value={-1}>Last Week</MenuItem>
        </Select>
      </Box>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 24, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <YAxis
            domain={[0, domainMax]}
            ticks={[0, domainMax / 3, (domainMax / 3) * 2, domainMax]}
            tickFormatter={(v) => `${Math.round(v)}h`}
            tick={{ fontSize: 12, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
          />
          <ChartTooltip
            contentStyle={{ borderRadius: 10, border: "1px solid rgba(128,128,128,0.25)" }}
            formatter={(value, name, props) => [formatHoursMinutes(props.payload.ms), "Worked"]}
          />
          <Bar dataKey="hours" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={40}>
            <LabelList
              dataKey="ms"
              position="top"
              formatter={(ms) => (ms > 0 ? formatHoursMinutes(ms) : "")}
              style={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default WeeklyHoursChart;
