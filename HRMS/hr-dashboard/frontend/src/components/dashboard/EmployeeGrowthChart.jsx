import { useMemo } from "react";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer, LabelList } from "recharts";
import { CardSkeleton } from "../common/LoadingSkeleton";

const monthsBack = (count) => {
  const months = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    months.push(new Date(now.getFullYear(), now.getMonth() - i, 1));
  }
  return months;
};

const EmployeeGrowthChart = ({ employees, loading }) => {
  const data = useMemo(() => {
    return monthsBack(6).map((monthStart) => {
      const endOfMonth = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 23, 59, 59);
      const count = employees.filter((e) => e.createdAt && new Date(e.createdAt) <= endOfMonth).length;
      return {
        label: monthStart.toLocaleDateString(undefined, { month: "short" }),
        count,
      };
    });
  }, [employees]);

  const maxCount = Math.max(4, ...data.map((d) => d.count));

  if (loading) return <CardSkeleton height={320} />;

  return (
    <Paper sx={{ p: 3, height: "100%" }}>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Employee Growth</Typography>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 24, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, maxCount]} tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} allowDecimals={false} />
          <ChartTooltip contentStyle={{ borderRadius: 10, border: "1px solid rgba(128,128,128,0.25)" }} formatter={(v) => [v, "Employees"]} />
          <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={40}>
            <LabelList dataKey="count" position="top" style={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default EmployeeGrowthChart;
