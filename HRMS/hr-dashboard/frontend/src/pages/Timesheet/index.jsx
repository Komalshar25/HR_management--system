import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { CalendarClock, Clock3, Timer, ListChecks } from "lucide-react";
import { useAttendance, localDateKey } from "../../hooks/useAttendance";
import DataTable from "../../components/common/DataTable";
import KpiCard from "../../components/common/KpiCard";
import StatusChip from "../../components/common/StatusChip";
import { KpiSkeletonRow, TableSkeleton } from "../../components/common/LoadingSkeleton";
import { formatTime, formatDate, attendanceStatusFor } from "../../utils/format";
import { formatHoursMinutes } from "../../utils/attendanceStats";

const startOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);

const TimesheetPage = () => {
  const { records, loading } = useAttendance();
  const [period, setPeriod] = useState("week");

  const filtered = useMemo(() => {
    const now = new Date();
    const from = period === "week" ? startOfWeek(now) : startOfMonth(now);
    const fromKey = localDateKey(from);
    return records
      .filter((r) => localDateKey(r.date) >= fromKey)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [records, period]);

  const stats = useMemo(() => {
    const totalMs = filtered.reduce((sum, r) => sum + (r.hoursWorked || 0), 0);
    const daysLogged = new Set(filtered.map((r) => localDateKey(r.date))).size;
    const avgMs = daysLogged > 0 ? totalMs / daysLogged : 0;
    return { totalMs, daysLogged, avgMs };
  }, [filtered]);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Timesheet</Typography>
        <Typography variant="body2" color="text.secondary">Review your logged working hours by period.</Typography>
      </Box>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={period} onChange={(e, v) => setPeriod(v)} sx={{ px: 2 }}>
          <Tab label="This Week" value="week" />
          <Tab label="This Month" value="month" />
        </Tabs>
      </Paper>

      {loading ? (
        <KpiSkeletonRow count={3} />
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2, mb: 3 }}>
          <KpiCard icon={Timer} label="Total Hours Logged" value={formatHoursMinutes(stats.totalMs)} tone="primary" />
          <KpiCard icon={CalendarClock} label="Days Logged" value={stats.daysLogged} tone="success" />
          <KpiCard icon={Clock3} label="Avg. Hours / Day" value={formatHoursMinutes(stats.avgMs)} tone="secondary" />
        </Box>
      )}

      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
          {period === "week" ? "This Week's Entries" : "This Month's Entries"}
        </Typography>
        {loading ? (
          <TableSkeleton />
        ) : (
          <DataTable paginate
            rows={filtered}
            emptyTitle="No entries for this period"
            emptyDescription="Clock in from the Attendance page to start logging hours."
            emptyIcon={ListChecks}
            columns={[
              { key: "date", label: "Date", render: (r) => formatDate(r.date) },
              { key: "checkIn", label: "Check In", render: (r) => formatTime(r.checkIn) },
              { key: "checkOut", label: "Check Out", render: (r) => formatTime(r.checkOut) },
              { key: "hours", label: "Hours Worked", render: (r) => formatHoursMinutes(r.hoursWorked) },
              { key: "status", label: "Status", render: (r) => <StatusChip status={attendanceStatusFor(r)} /> },
            ]}
          />
        )}
      </Paper>
    </Box>
  );
};

export default TimesheetPage;
