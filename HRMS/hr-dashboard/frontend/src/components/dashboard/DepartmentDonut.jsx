import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ChartTooltip } from "recharts";
import EmptyState from "../common/EmptyState";
import { CardSkeleton } from "../common/LoadingSkeleton";
import { Building2 } from "lucide-react";
import { useTheme } from "@mui/material/styles";

const COLORS = ["#2563eb", "#0ea5e9", "#f59e0b", "#ef4444", "#7c3aed", "#16a34a", "#64748b", "#4f46e5"];

const DepartmentDonut = ({ breakdown, loading }) => {
  const theme = useTheme();
  if (loading) return <CardSkeleton height={320} />;

  const total = breakdown.reduce((sum, d) => sum + d.headcount, 0);
  const data = breakdown
    .map((d, i) => ({ ...d, color: COLORS[i % COLORS.length], pct: total ? Math.round((d.headcount / total) * 1000) / 10 : 0 }))
    .sort((a, b) => b.headcount - a.headcount);

  return (
    <Paper sx={{ p: 3, height: "100%" }}>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Employees by Department</Typography>
      {total === 0 ? (
        <EmptyState icon={Building2} title="No department data" />
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
          <Box sx={{ position: "relative", width: 170, height: 170 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="headcount"
                  nameKey="department"
                  innerRadius={56}
                  outerRadius={80}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid rgba(128,128,128,0.25)",
                    backgroundColor: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    boxShadow: "0 8px 24px rgba(15,23,42,0.16)",
                  }}
                  wrapperStyle={{ zIndex: 20, outline: "none" }}
                  formatter={(value, name, props) => [`${value} (${props.payload.pct}%)`, props.payload.department]}
                />
              </PieChart>
            </ResponsiveContainer>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center",
                pointerEvents: "none",
                zIndex: 1,
                width: 92,
                height: 92,
                borderRadius: "50%",
                bgcolor: "background.paper",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.2 }}>{total}</Typography>
              <Typography variant="caption" color="text.secondary">Employees</Typography>
            </Box>
          </Box>

          <Box sx={{ width: "100%", display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, columnGap: 3, rowGap: 1 }}>
            {data.map((d) => (
              <Box key={d.department} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: d.color, flexShrink: 0 }} />
                  <Typography variant="body2" color="text.secondary" noWrap>{d.department}</Typography>
                </Box>
                <Typography variant="body2" fontWeight={700} sx={{ flexShrink: 0, pl: 1 }}>
                  {d.headcount} <Typography component="span" variant="caption" color="text.secondary">({d.pct}%)</Typography>
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default DepartmentDonut;
