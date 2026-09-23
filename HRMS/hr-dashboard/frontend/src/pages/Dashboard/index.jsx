import { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import { Users, UserCheck, CalendarOff, ClipboardCheck, Wallet, Check, X, FileSpreadsheet, CalendarClock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useOverview, useAttendanceTrend, useDepartmentBreakdown } from "../../hooks/useAnalytics";
import { useLeave } from "../../hooks/useLeave";
import { useAttendance } from "../../hooks/useAttendance";
import { useEmployees } from "../../hooks/useEmployees";
import { usePayrollSummary } from "../../hooks/usePayroll";
import KpiCard from "../../components/common/KpiCard";
import StatusChip from "../../components/common/StatusChip";
import InitialsAvatar from "../../components/common/InitialsAvatar";
import EmptyState from "../../components/common/EmptyState";
import WelcomeBanner from "../../components/dashboard/WelcomeBanner";
import AttendanceTrendChart from "../../components/dashboard/AttendanceTrendChart";
import DepartmentDonut from "../../components/dashboard/DepartmentDonut";
import CommunityRow from "../../components/dashboard/CommunityRow";
import PendingActionsCard from "../../components/dashboard/PendingActionsCard";
import LeaveBalanceCard from "../../components/dashboard/LeaveBalanceCard";
import AttendanceSummaryCard from "../../components/dashboard/AttendanceSummaryCard";
import { useSnackbar } from "../../components/common/SnackbarProvider";
import { KpiSkeletonRow, CardSkeleton } from "../../components/common/LoadingSkeleton";
import { formatTime, formatDate, formatCurrency, formatMonthLabel, attendanceStatusFor } from "../../utils/format";

const SectionHeader = ({ title }) => (
  <Typography
    variant="overline"
    sx={{ display: "block", fontWeight: 700, letterSpacing: "0.08em", color: "text.secondary", mb: -1.5, lineHeight: 1.5 }}
  >
    {title}
  </Typography>
);

const ManagerOverview = ({ user }) => {
  const [range, setRange] = useState("daily");
  const { data: overview, loading: overviewLoading } = useOverview();
  const { data: trend, loading: trendLoading } = useAttendanceTrend(range);
  const { data: deptBreakdown, loading: deptLoading } = useDepartmentBreakdown();
  const { pendingLeaves, loading: leaveLoading, actOnLeave } = useLeave();
  const { employees, loading: employeesLoading } = useEmployees();
  const { summary: payrollSummary, loading: payrollLoading } = usePayrollSummary();
  const navigate = useNavigate();

  const presentPct = overview?.totalEmployees ? Math.round((overview.presentToday / overview.totalEmployees) * 100) : 0;
  const onLeavePct = overview?.totalEmployees ? Math.round((overview.onLeaveToday / overview.totalEmployees) * 100) : 0;

  const newHiresThisMonth = useMemo(() => {
    const now = new Date();
    return employees.filter((e) => {
      if (!e.createdAt) return false;
      const d = new Date(e.createdAt);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;
  }, [employees]);

  const recentEmployees = useMemo(
    () => [...employees].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5),
    [employees]
  );

  const kpiLoading = overviewLoading || leaveLoading || payrollLoading;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {kpiLoading ? (
        <KpiSkeletonRow count={5} />
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(5, minmax(0, 1fr))" }, gap: 2 }}>
          <KpiCard
            icon={Users}
            label="Total Employees"
            value={overview?.totalEmployees ?? 0}
            tone="primary"
            deltaLabel={newHiresThisMonth > 0 ? `+${newHiresThisMonth} joined this month` : "No new hires this month"}
          />
          <KpiCard
            icon={UserCheck}
            label="Present Today"
            value={overview?.presentToday ?? 0}
            tone="success"
            deltaLabel={`${presentPct}% of workforce`}
          />
          <KpiCard
            icon={CalendarOff}
            label="On Leave"
            value={overview?.onLeaveToday ?? 0}
            tone="warning"
            deltaLabel={`${onLeavePct}% of workforce`}
          />
          <KpiCard
            icon={ClipboardCheck}
            label="Pending Approvals"
            value={pendingLeaves.length}
            tone="error"
            deltaLabel="Awaiting your review"
          />
          <Box sx={{ gridColumn: { xs: "span 2", md: "auto" }, minWidth: 0, display: "flex", "& > *": { flex: 1 } }}>
          <KpiCard
            icon={Wallet}
            label={payrollSummary?.month ? `Payroll — ${formatMonthLabel(payrollSummary.month)}` : "Payroll"}
            value={formatCurrency(payrollSummary?.totalNetPay ?? null)}
            tone="secondary"
            deltaLabel={payrollSummary ? `For ${payrollSummary.employeeCount} employees` : undefined}
          />
          </Box>
        </Box>
      )}

      <SectionHeader title="Workforce analytics" />
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1.5fr 1fr" }, gap: 3, alignItems: "stretch" }}>
        <AttendanceTrendChart trend={trend} loading={trendLoading} range={range} onRangeChange={setRange} />
        <DepartmentDonut breakdown={deptBreakdown || []} loading={deptLoading} />
      </Box>

      <SectionHeader title="Company updates" />
      <CommunityRow canOpenProfiles />

      <SectionHeader title="Needs your attention" />

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1.4fr 1fr" }, gap: 3, alignItems: "stretch" }}>
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={700}>Pending Leave Requests</Typography>
            <Button size="small" onClick={() => navigate("/leave")}>View all</Button>
          </Box>
          {leaveLoading ? (
            <CardSkeleton height={220} />
          ) : pendingLeaves.length === 0 ? (
            <EmptyState title="No pending requests" description="You're all caught up." />
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {pendingLeaves.slice(0, 4).map((leave) => (
                <Box
                  key={leave._id}
                  sx={{ display: "flex", alignItems: "center", gap: 1.25, p: 1.25, borderRadius: "10px", border: "1px solid rgba(128,128,128,0.15)" }}
                >
                  <InitialsAvatar name={leave.user?.name} size={34} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {leave.user?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {leave.leaveType} · {formatDate(leave.startDate)} – {formatDate(leave.endDate)}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => actOnLeave(leave._id, "Approved")}
                    sx={{ bgcolor: "success.main", color: "#fff", "&:hover": { bgcolor: "success.dark" } }}
                  >
                    <Check size={16} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => actOnLeave(leave._id, "Rejected")}
                    sx={{ bgcolor: "error.main", color: "#fff", "&:hover": { bgcolor: "error.dark" } }}
                  >
                    <X size={16} />
                  </IconButton>
                </Box>
              ))}
              {pendingLeaves.length > 4 && (
                <Button size="small" onClick={() => navigate("/leave")}>
                  View all {pendingLeaves.length} requests
                </Button>
              )}
            </Box>
          )}
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={700}>Recent Employees</Typography>
            <Button size="small" onClick={() => navigate("/employees")}>View all</Button>
          </Box>
          {employeesLoading ? (
            <CardSkeleton height={220} />
          ) : recentEmployees.length === 0 ? (
            <EmptyState title="No employees yet" />
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
              {recentEmployees.map((emp) => (
                <Box
                  key={emp._id}
                  sx={{ display: "flex", alignItems: "center", gap: 1.25, cursor: "pointer" }}
                  onClick={() => navigate(`/employees/${emp._id}`)}
                >
                  <InitialsAvatar name={emp.name} size={36} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>{emp.name}</Typography>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {emp.designation || emp.role} · {emp.department}
                    </Typography>
                  </Box>
                  <StatusChip status="Active" />
                </Box>
              ))}
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

const EmployeeOverview = ({ user }) => {
  const { records, todayRecord, openRecord, loading, actionLoading, clockIn, clockOut } = useAttendance();
  const { myLeaves, loading: leaveLoading } = useLeave();
  const notify = useSnackbar();

  const handleClock = (action, successMessage) => async () => {
    const res = await action();
    notify(res.ok ? successMessage : res.message, res.ok ? "success" : "error");
  };
  const handleClockIn = handleClock(clockIn, "Checked in. Have a great day!");
  const handleClockOut = handleClock(clockOut, "Checked out. See you tomorrow!");
  const status = attendanceStatusFor(todayRecord);
  const pendingCount = myLeaves.filter((l) => l.status === "Pending").length;
  const approvedThisYear = myLeaves.filter((l) => l.status === "Approved").length;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {loading || leaveLoading ? (
        <KpiSkeletonRow />
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" }, gap: 2 }}>
          <KpiCard icon={UserCheck} label="Today's Status" value={status} tone="primary" />
          <KpiCard icon={CalendarClock} label="Check In" value={formatTime(todayRecord?.checkIn)} tone="success" />
          <KpiCard icon={FileSpreadsheet} label="Approved Leaves" value={approvedThisYear} tone="secondary" />
          <KpiCard icon={CalendarOff} label="Pending Requests" value={pendingCount} tone="warning" />
        </Box>
      )}

      <SectionHeader title="Today" />
      {loading || leaveLoading ? (
        <CardSkeleton height={160} />
      ) : (
        <PendingActionsCard
          todayRecord={todayRecord}
          openRecord={openRecord}
          myLeaves={myLeaves}
          actionLoading={actionLoading}
          onClockIn={handleClockIn}
          onClockOut={handleClockOut}
        />
      )}

      <SectionHeader title="Leave & attendance" />
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 3, alignItems: "stretch" }}>
        {loading || leaveLoading ? (
          <>
            <CardSkeleton height={300} />
            <CardSkeleton height={300} />
          </>
        ) : (
          <>
            <LeaveBalanceCard myLeaves={myLeaves} />
            <AttendanceSummaryCard records={records} leaves={myLeaves} />
          </>
        )}
      </Box>

      <SectionHeader title="Company updates" />
      <CommunityRow />
    </Box>
  );
};

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const Dashboard = () => {
  const { user } = useAuth();
  const isManager = ["Manager", "HR", "Admin"].includes(user?.role);
  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <Box>
      <WelcomeBanner
        greeting={greeting()}
        name={firstName}
        subtitle={isManager ? "Here's what's happening with your workforce today." : "Here's what's happening with your work today."}
      />
      {isManager ? <ManagerOverview user={user} /> : <EmployeeOverview user={user} />}
    </Box>
  );
};

export default Dashboard;
