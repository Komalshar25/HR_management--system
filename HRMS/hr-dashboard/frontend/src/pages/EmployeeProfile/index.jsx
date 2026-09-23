import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import { ArrowLeft, Mail, Building2, Calendar, FileText, Heart } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { getUser } from "../../api/users";
import { getAttendanceByUser } from "../../api/attendance";
import { getLeavesByUser } from "../../api/leave";
import { getPayrollByUser } from "../../api/payroll";
import { getAppraisalsByUser } from "../../api/appraisals";
import { getDocumentsByUser } from "../../api/documents";
import { getKudosForUser } from "../../api/recognition";
import { useAuth } from "../../context/AuthContext";
import GiveKudosDialog from "../../components/recognition/GiveKudosDialog";
import { BADGES } from "../../components/recognition/badges";
import InitialsAvatar from "../../components/common/InitialsAvatar";
import StatusChip from "../../components/common/StatusChip";
import DataTable from "../../components/common/DataTable";
import EmptyState from "../../components/common/EmptyState";
import RatingStars from "../../components/common/RatingStars";
import { formatTime, formatHoursShort, formatDate, formatCurrency, formatMonthLabel, attendanceStatusFor, timeAgo } from "../../utils/format";

const EmployeeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [kudos, setKudos] = useState({ total: 0, kudos: [] });
  const [kudosOpen, setKudosOpen] = useState(false);
  const [employee, setEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [appraisals, setAppraisals] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getUser(id),
      getAttendanceByUser(id),
      getLeavesByUser(id),
      getPayrollByUser(id),
      getAppraisalsByUser(id),
      getDocumentsByUser(id),
      getKudosForUser(id),
    ])
      .then(([u, att, lv, pr, ap, docs, kd]) => {
        setKudos(kd);
        setEmployee(u);
        setAttendance(att);
        setLeaves(lv);
        setPayroll(pr);
        setAppraisals(ap);
        setDocuments(docs);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Box>
        <Skeleton variant="rounded" height={140} sx={{ mb: 3 }} />
        <Skeleton variant="rounded" height={300} />
      </Box>
    );
  }

  if (!employee) {
    return <EmptyState title="Employee not found" description="This profile may have been removed." />;
  }

  const avgRating = appraisals.length
    ? Math.round((appraisals.reduce((s, a) => s + a.rating, 0) / appraisals.length) * 10) / 10
    : null;
  const latestPayroll = payroll[0];

  return (
    <Box>
      <Button startIcon={<ArrowLeft size={16} />} onClick={() => navigate("/employees")} sx={{ mb: 2 }} color="inherit">
        Back to Employees
      </Button>

      <Paper sx={{ p: 3, mb: 3, display: "flex", alignItems: "center", gap: 2.5, flexWrap: "wrap" }}>
        <InitialsAvatar name={employee.name} size={72} sx={{ fontSize: "1.6rem" }} />
        <Box sx={{ flex: 1, minWidth: 200 }}>
          <Typography variant="h6" fontWeight={700}>{employee.name}</Typography>
          <Typography variant="body2" color="text.secondary">{employee.designation} · {employee.employeeId}</Typography>
          <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
            <StatusChip status="Active" />
            <StatusChip status={employee.role} />
          </Box>
        </Box>
        {String(currentUser?._id || currentUser?.id) !== String(employee._id) && (
          <Button variant="outlined" startIcon={<Heart size={16} />} onClick={() => setKudosOpen(true)}>
            Give kudos
          </Button>
        )}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary" }}>
            <Mail size={14} /> <Typography variant="body2">{employee.email}</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary" }}>
            <Building2 size={14} /> <Typography variant="body2">{employee.department}</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary" }}>
            <Calendar size={14} /> <Typography variant="body2">Joined {formatDate(employee.createdAt)}</Typography>
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ px: 2 }} variant="scrollable" scrollButtons="auto">
          <Tab label="Overview" value="overview" />
          <Tab label="Attendance" value="attendance" />
          <Tab label="Leave" value="leave" />
          <Tab label="Payroll" value="payroll" />
          <Tab label="Performance" value="performance" />
          <Tab label="Documents" value="documents" />
          <Tab label={`Recognition (${kudos.total})`} value="recognition" />
        </Tabs>
      </Paper>

      {tab === "overview" && (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(5, minmax(0, 1fr))" }, gap: 2 }}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Attendance</Typography>
            <Typography variant="h4" fontWeight={700}>{attendance.length}</Typography>
            <Typography variant="caption" color="text.secondary">total logged sessions</Typography>
          </Paper>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Leave Requests</Typography>
            <Typography variant="h4" fontWeight={700}>{leaves.length}</Typography>
            <Typography variant="caption" color="text.secondary">
              {leaves.filter((l) => l.status === "Approved").length} approved · {leaves.filter((l) => l.status === "Pending").length} pending
            </Typography>
          </Paper>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Latest Payroll</Typography>
            <Typography variant="h4" fontWeight={700}>{latestPayroll ? formatCurrency(latestPayroll.netPay) : "—"}</Typography>
            <Typography variant="caption" color="text.secondary">
              {latestPayroll ? formatMonthLabel(latestPayroll.month) : "No payroll records yet"}
            </Typography>
          </Paper>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Performance</Typography>
            {avgRating != null ? (
              <>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="h4" fontWeight={700}>{avgRating}</Typography>
                  <RatingStars rating={Math.round(avgRating)} />
                </Box>
                <Typography variant="caption" color="text.secondary">{appraisals.length} review{appraisals.length !== 1 ? "s" : ""}</Typography>
              </>
            ) : (
              <>
                <Typography variant="h4" fontWeight={700}>—</Typography>
                <Typography variant="caption" color="text.secondary">No reviews yet</Typography>
              </>
            )}
          </Paper>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>Documents</Typography>
            <Typography variant="h4" fontWeight={700}>{documents.length}</Typography>
            <Typography variant="caption" color="text.secondary">
              {documents.filter((d) => d.status === "Verified").length} verified
            </Typography>
          </Paper>
        </Box>
      )}

      {tab === "attendance" && (
        <DataTable paginate
          rows={attendance}
          emptyTitle="No attendance records"
          columns={[
            { key: "date", label: "Date", render: (r) => new Date(r.date).toLocaleDateString() },
            { key: "checkIn", label: "Check In", render: (r) => formatTime(r.checkIn) },
            { key: "checkOut", label: "Check Out", render: (r) => formatTime(r.checkOut) },
            { key: "hours", label: "Hours", render: (r) => formatHoursShort(r.hoursWorked) },
            { key: "status", label: "Status", render: (r) => <StatusChip status={attendanceStatusFor(r)} /> },
          ]}
        />
      )}

      {tab === "leave" && (
        <DataTable paginate
          rows={leaves}
          emptyTitle="No leave requests"
          columns={[
            { key: "leaveType", label: "Type" },
            { key: "dates", label: "Dates", render: (r) => `${formatDate(r.startDate)} → ${formatDate(r.endDate)}` },
            { key: "reason", label: "Reason" },
            { key: "status", label: "Status", render: (r) => <StatusChip status={r.status} /> },
          ]}
        />
      )}

      {tab === "payroll" && (
        <DataTable paginate
          rows={payroll}
          getRowKey={(r) => r._id}
          emptyTitle="No payroll records"
          columns={[
            { key: "month", label: "Month", render: (r) => formatMonthLabel(r.month) },
            { key: "basic", label: "Basic", render: (r) => formatCurrency(r.basic) },
            { key: "allowances", label: "Allowances", render: (r) => formatCurrency(r.allowances) },
            { key: "deductions", label: "Deductions", render: (r) => formatCurrency(r.deductions) },
            { key: "netPay", label: "Net Pay", render: (r) => <Typography variant="body2" fontWeight={700}>{formatCurrency(r.netPay)}</Typography> },
            { key: "status", label: "Status", render: (r) => <StatusChip status={r.status} /> },
          ]}
        />
      )}

      {tab === "performance" && (
        <DataTable paginate
          rows={appraisals}
          getRowKey={(r) => r._id}
          emptyTitle="No performance reviews"
          columns={[
            { key: "reviewDate", label: "Date", render: (r) => formatDate(r.reviewDate) },
            { key: "rating", label: "Rating", render: (r) => <RatingStars rating={r.rating} /> },
            { key: "remarks", label: "Remarks", render: (r) => <StatusChip status={r.remarks} /> },
          ]}
        />
      )}

      {tab === "documents" && (
        <DataTable paginate
          rows={documents}
          getRowKey={(r) => r._id}
          emptyTitle="No documents on file"
          emptyIcon={FileText}
          columns={[
            { key: "name", label: "Document", render: (r) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <FileText size={16} color="#94a3b8" />
                <Typography variant="body2" fontWeight={600}>{r.name}</Typography>
              </Box>
            ) },
            { key: "type", label: "Type" },
            { key: "uploadedAt", label: "Uploaded", render: (r) => formatDate(r.uploadedAt) },
            { key: "status", label: "Status", render: (r) => <StatusChip status={r.status} /> },
          ]}
        />
      )}

      {tab === "recognition" && (
        <DataTable paginate
          rows={kudos.kudos}
          getRowKey={(r) => r._id}
          emptyTitle="No kudos received yet"
          emptyIcon={Heart}
          columns={[
            { key: "from", label: "From", render: (r) => r.from?.name },
            { key: "badge", label: "Badge", render: (r) => {
              const b = BADGES[r.badge] || BADGES["Team Player"];
              const Icon = b.icon;
              return (
                <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, color: b.color, fontWeight: 700, fontSize: "0.8rem" }}>
                  <Icon size={14} /> {r.badge}
                </Box>
              );
            } },
            { key: "message", label: "Message" },
            { key: "createdAt", label: "When", render: (r) => timeAgo(r.createdAt) },
          ]}
        />
      )}

      <GiveKudosDialog
        open={kudosOpen}
        onClose={() => setKudosOpen(false)}
        presetUser={employee}
        onGiven={() => getKudosForUser(id).then(setKudos)}
      />
    </Box>
  );
};

export default EmployeeProfile;
