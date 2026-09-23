import { useState, useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import { Search, CalendarClock, CalendarCheck, Clock3, Timer, LogIn } from "lucide-react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { useAuth } from "../../context/AuthContext";
import { useAttendance, useAllAttendance } from "../../hooks/useAttendance";
import { useLeave } from "../../hooks/useLeave";
import { useSnackbar } from "../../components/common/SnackbarProvider";
import StatusChip from "../../components/common/StatusChip";
import InitialsAvatar from "../../components/common/InitialsAvatar";
import DataTable from "../../components/common/DataTable";
import KpiCard from "../../components/common/KpiCard";
import { CardSkeleton, KpiSkeletonRow } from "../../components/common/LoadingSkeleton";
import { formatTime, formatHoursShort, attendanceStatusFor } from "../../utils/format";
import { localDateKey } from "../../hooks/useAttendance";
import { computeMonthlySummary, computeAttendanceStats, formatMinutesAsTime } from "../../utils/attendanceStats";
import AttendanceHeroCard from "../../components/attendance/AttendanceHeroCard";
import WeeklyHoursChart from "../../components/attendance/WeeklyHoursChart";
import AttendanceSummaryDonut from "../../components/attendance/AttendanceSummaryDonut";
import RecentAttendanceTable from "../../components/attendance/RecentAttendanceTable";

const STATUS_DOT = {
  Working: "#2563eb",
  Completed: "#16a34a",
  Late: "#d97706",
  Absent: "#dc2626",
};

const EmployeeAttendance = () => {
  const { records, todayRecord, openRecord, loading, actionLoading, clockIn, clockOut } = useAttendance();
  const { myLeaves } = useLeave();
  const notify = useSnackbar();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!openRecord) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [openRecord]);

  const liveMs = openRecord
    ? (openRecord.hoursWorked || 0) + (now - new Date(openRecord.checkIn).getTime())
    : todayRecord?.hoursWorked || 0;

  const summary = useMemo(() => computeMonthlySummary(records, myLeaves), [records, myLeaves]);
  const stats = useMemo(() => computeAttendanceStats(records), [records]);

  const events = useMemo(
    () =>
      records.map((r) => ({
        title: attendanceStatusFor(r),
        date: localDateKey(r.date),
        color: STATUS_DOT[attendanceStatusFor(r)] || "#94a3b8",
      })),
    [records]
  );

  const handleClockIn = async () => {
    const res = await clockIn();
    notify(res.ok ? "Clocked in successfully" : res.message, res.ok ? "success" : "error");
  };
  const handleClockOut = async () => {
    const res = await clockOut();
    notify(res.ok ? "Clocked out successfully" : res.message, res.ok ? "success" : "error");
  };

  if (loading) return <CardSkeleton height={220} />;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <AttendanceHeroCard
        todayRecord={todayRecord}
        openRecord={openRecord}
        liveMs={liveMs}
        actionLoading={actionLoading}
        onClockIn={handleClockIn}
        onClockOut={handleClockOut}
      />

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" }, gap: 2 }}>
        <KpiCard
          icon={CalendarCheck}
          label="Present Days"
          value={`${summary.present} / ${summary.totalWorkdays}`}
          tone="success"
        />
        <KpiCard
          icon={Clock3}
          label="Late Arrivals"
          value={stats.lateArrivals}
          delta={stats.lateArrivalsDelta}
          deltaLabel={stats.lateArrivalsDelta != null ? "from last month" : undefined}
          tone="warning"
        />
        <KpiCard
          icon={Timer}
          label="Avg. Hours / Day"
          value={`${stats.avgHours.toFixed(1)}h`}
          delta={stats.avgHoursDelta}
          deltaLabel={stats.avgHoursDelta != null ? "from last month" : undefined}
          tone="primary"
        />
        <KpiCard
          icon={LogIn}
          label="Avg. Check-in Time"
          value={formatMinutesAsTime(stats.avgCheckIn)}
          delta={stats.avgCheckInDeltaMinutes != null ? -stats.avgCheckInDeltaMinutes : null}
          deltaSuffix=" min"
          deltaLabel={stats.avgCheckInDeltaMinutes != null ? "from last month" : undefined}
          tone="secondary"
        />
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1.4fr 1fr" }, gap: 3 }}>
        <WeeklyHoursChart records={records} />
        <AttendanceSummaryDonut summary={summary} />
      </Box>

      <RecentAttendanceTable records={records} leaves={myLeaves} />

      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Monthly Overview</Typography>
        <Box sx={{ "& .fc": { fontFamily: "inherit" }, "& .fc-toolbar-title": { fontSize: "1rem", fontWeight: 700 }, "& .fc-daygrid-day-number": { fontSize: "0.8rem" } }}>
          <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{ left: "prev,next", center: "title", right: "" }}
            height="auto"
            events={events}
            eventDisplay="block"
          />
        </Box>
      </Paper>
    </Box>
  );
};

const OrgAttendanceTable = () => {
  const { records, loading } = useAllAttendance();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return records;
    const q = search.toLowerCase();
    return records.filter((r) => r.user?.name?.toLowerCase().includes(q) || r.user?.department?.toLowerCase().includes(q));
  }, [records, search]);

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
        <Typography variant="subtitle1" fontWeight={700}>Organization Attendance</Typography>
        <TextField
          size="small"
          placeholder="Search employee or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment> }}
        />
      </Box>
      <DataTable
        loading={loading}
        rows={filtered.slice(0, 50)}
        emptyTitle="No attendance records"
        emptyIcon={CalendarClock}
        columns={[
          { key: "employee", label: "Employee", render: (r) => (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
              <InitialsAvatar name={r.user?.name} size={28} />
              <Typography variant="body2" fontWeight={600}>{r.user?.name}</Typography>
            </Box>
          ) },
          { key: "department", label: "Department", render: (r) => r.user?.department || "—" },
          { key: "checkIn", label: "Check In", render: (r) => formatTime(r.checkIn) },
          { key: "checkOut", label: "Check Out", render: (r) => formatTime(r.checkOut) },
          { key: "hours", label: "Working Hours", render: (r) => formatHoursShort(r.hoursWorked) },
          { key: "status", label: "Status", render: (r) => <StatusChip status={attendanceStatusFor(r)} /> },
        ]}
      />
    </Paper>
  );
};

const AttendancePage = () => {
  const { user } = useAuth();
  const isManager = ["Manager", "HR", "Admin"].includes(user?.role);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Attendance</Typography>
        <Typography variant="body2" color="text.secondary">Track your working hours and attendance</Typography>
      </Box>
      <EmployeeAttendance />
      {isManager && <OrgAttendanceTable />}
    </Box>
  );
};

export default AttendancePage;
