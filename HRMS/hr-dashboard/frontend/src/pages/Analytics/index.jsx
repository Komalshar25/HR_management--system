import { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import TextField from "@mui/material/TextField";
import { Download } from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend,
} from "recharts";
import {
  useOverview, useAttendanceTrend, useDepartmentBreakdown, useLeaveTrend, useWorkforceDistribution,
} from "../../hooks/useAnalytics";
import KpiCard from "../../components/common/KpiCard";
import EmptyState from "../../components/common/EmptyState";
import { CardSkeleton, KpiSkeletonRow } from "../../components/common/LoadingSkeleton";
import { Users, UserCheck, CalendarOff, TrendingUp } from "lucide-react";

const PIE_COLORS = ["#2563eb", "#0ea5e9", "#7c3aed", "#16a34a", "#d97706", "#dc2626"];

const downloadCsv = (filename, rows) => {
  if (!rows || rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => JSON.stringify(r[h] ?? "")).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const Analytics = () => {
  const [range, setRange] = useState("monthly");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const { data: overview, loading: overviewLoading } = useOverview();
  const { data: trend, loading: trendLoading } = useAttendanceTrend(range === "custom" ? "daily" : range);
  const { data: departments, loading: deptLoading } = useDepartmentBreakdown();
  const { data: leaveTrend, loading: leaveLoading } = useLeaveTrend(range === "custom" ? "weekly" : range);
  const { data: workforce, loading: workforceLoading } = useWorkforceDistribution();

  const trendData = useMemo(() => {
    if (!trend?.data) return [];
    if (range !== "custom" || (!customFrom && !customTo)) return trend.data;
    return trend.data;
  }, [trend, range, customFrom, customTo]);

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Reports & Analytics</Typography>
          <Typography variant="body2" color="text.secondary">Organization-wide workforce insights.</Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap" }}>
          <ToggleButtonGroup size="small" exclusive value={range} onChange={(e, v) => v && setRange(v)}>
            <ToggleButton value="daily" sx={{ textTransform: "none", px: 1.5 }}>Daily</ToggleButton>
            <ToggleButton value="weekly" sx={{ textTransform: "none", px: 1.5 }}>Weekly</ToggleButton>
            <ToggleButton value="monthly" sx={{ textTransform: "none", px: 1.5 }}>Monthly</ToggleButton>
            <ToggleButton value="custom" sx={{ textTransform: "none", px: 1.5 }}>Custom</ToggleButton>
          </ToggleButtonGroup>
          {range === "custom" && (
            <>
              <TextField size="small" type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
              <TextField size="small" type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
            </>
          )}
          <Button
            variant="outlined"
            size="small"
            startIcon={<Download size={15} />}
            onClick={() => downloadCsv("attendance-trend.csv", trendData)}
          >
            Export Report
          </Button>
        </Box>
      </Box>

      {overviewLoading ? (
        <KpiSkeletonRow />
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" }, gap: 2, mb: 3 }}>
          <KpiCard icon={Users} label="Total Employees" value={overview?.totalEmployees ?? 0} tone="primary" />
          <KpiCard icon={UserCheck} label="Present Today" value={overview?.presentToday ?? 0} tone="success" />
          <KpiCard icon={CalendarOff} label="On Leave" value={overview?.onLeaveToday ?? 0} tone="secondary" />
          <KpiCard
            icon={TrendingUp}
            label="Attendance Rate"
            value={overview?.totalEmployees ? `${Math.round((overview.presentToday / overview.totalEmployees) * 100)}%` : "0%"}
            tone="error"
          />
        </Box>
      )}

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 3, mb: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Attendance Trend</Typography>
          {trendLoading ? <CardSkeleton height={260} /> : trendData.length === 0 ? (
            <EmptyState title="No data" description="No attendance records in this period." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <ChartTooltip contentStyle={{ borderRadius: 10, border: "1px solid rgba(128,128,128,0.25)" }} />
                <Line type="monotone" dataKey="attendanceRate" name="Attendance %" stroke="#2563eb" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Department Comparison</Typography>
          {deptLoading ? <CardSkeleton height={260} /> : !departments?.length ? (
            <EmptyState title="No departments" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={departments}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                <XAxis dataKey="department" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <ChartTooltip contentStyle={{ borderRadius: 10, border: "1px solid rgba(128,128,128,0.25)" }} />
                <Bar dataKey="headcount" name="Headcount" fill="#2563eb" radius={[6, 6, 0, 0]} />
                <Bar dataKey="presentToday" name="Present Today" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Paper>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 3, mb: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Leave Trend</Typography>
          {leaveLoading ? <CardSkeleton height={240} /> : !leaveTrend?.data?.length ? (
            <EmptyState title="No leave data" />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={leaveTrend.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <ChartTooltip contentStyle={{ borderRadius: 10, border: "1px solid rgba(128,128,128,0.25)" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="approved" stackId="a" fill="#16a34a" name="Approved" />
                <Bar dataKey="pending" stackId="a" fill="#d97706" name="Pending" />
                <Bar dataKey="rejected" stackId="a" fill="#dc2626" name="Rejected" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Workforce Distribution</Typography>
          {workforceLoading ? <CardSkeleton height={240} /> : !workforce?.byDepartment?.length ? (
            <EmptyState title="No workforce data" />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={workforce.byDepartment} dataKey="value" nameKey="label" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {workforce.byDepartment.map((entry, i) => (
                    <Cell key={entry.label} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip contentStyle={{ borderRadius: 10, border: "1px solid rgba(128,128,128,0.25)" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Paper>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Late Arrival Trend</Typography>
          {trendLoading ? <CardSkeleton height={220} /> : trendData.length === 0 ? (
            <EmptyState title="No data" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <ChartTooltip contentStyle={{ borderRadius: 10, border: "1px solid rgba(128,128,128,0.25)" }} />
                <Line type="monotone" dataKey="late" name="Late arrivals" stroke="#d97706" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Overtime Trend</Typography>
          {trendLoading ? <CardSkeleton height={220} /> : trendData.length === 0 ? (
            <EmptyState title="No data" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <ChartTooltip contentStyle={{ borderRadius: 10, border: "1px solid rgba(128,128,128,0.25)" }} />
                <Line type="monotone" dataKey="overtimeHours" name="Overtime (hrs)" stroke="#7c3aed" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default Analytics;
