import { useState, useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Drawer from "@mui/material/Drawer";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import { Plus, X, FileSpreadsheet } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLeave } from "../../hooks/useLeave";
import { getAllLeaves } from "../../api/leave";
import { useSnackbar } from "../../components/common/SnackbarProvider";
import StatusChip from "../../components/common/StatusChip";
import InitialsAvatar from "../../components/common/InitialsAvatar";
import DataTable from "../../components/common/DataTable";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import EmptyState from "../../components/common/EmptyState";
import { TableSkeleton } from "../../components/common/LoadingSkeleton";
import { LEAVE_TYPES, computeLeaveBalance, daysBetween } from "../../utils/leave";
import { formatDate } from "../../utils/format";

const ApplyLeaveDialog = ({ open, onClose, onSubmit }) => {
  const [form, setForm] = useState({ leaveType: "Sick", startDate: "", endDate: "", reason: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await onSubmit(form);
    setLoading(false);
    if (res.ok) {
      setForm({ leaveType: "Sick", startDate: "", endDate: "", reason: "" });
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 700 }}>Apply for Leave</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <Select value={form.leaveType} onChange={(e) => setForm({ ...form, leaveType: e.target.value })} fullWidth>
            {LEAVE_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </Select>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField type="date" label="Start Date" required fullWidth InputLabelProps={{ shrink: true }} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            <TextField type="date" label="End Date" required fullWidth InputLabelProps={{ shrink: true }} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </Box>
          <TextField label="Reason" required multiline rows={3} fullWidth value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} color="inherit">Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>Submit</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const ApprovalDrawer = ({ leave, onClose, onDecide }) => {
  const [confirmAction, setConfirmAction] = useState(null);

  return (
    <Drawer anchor="right" open={!!leave} onClose={onClose} slotProps={{ paper: { sx: { width: 380, p: 3 } } }}>
      {leave && (
        <>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography variant="h6" fontWeight={700}>Leave Request</Typography>
            <IconButton size="small" onClick={onClose}><X size={18} /></IconButton>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
            <InitialsAvatar name={leave.user?.name} size={48} />
            <Box>
              <Typography fontWeight={700}>{leave.user?.name}</Typography>
              <Typography variant="caption" color="text.secondary">{leave.user?.department}</Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">Type</Typography>
              <Typography variant="body2" fontWeight={600}>{leave.leaveType}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">Dates</Typography>
              <Typography variant="body2" fontWeight={600}>{formatDate(leave.startDate)} → {formatDate(leave.endDate)}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">Duration</Typography>
              <Typography variant="body2" fontWeight={600}>{daysBetween(leave.startDate, leave.endDate)} day(s)</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="body2" color="text.secondary">Requested</Typography>
              <Typography variant="body2" fontWeight={600}>{formatDate(leave.createdAt)}</Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="body2" color="text.secondary">Status</Typography>
              <StatusChip status={leave.status} />
            </Box>
          </Box>

          <Typography variant="body2" color="text.secondary" gutterBottom>Reason</Typography>
          <Paper variant="outlined" sx={{ p: 1.5, mb: 3, bgcolor: "action.hover" }}>
            <Typography variant="body2">{leave.reason}</Typography>
          </Paper>

          {leave.status === "Pending" && (
            <Box sx={{ display: "flex", gap: 1.5, mt: "auto" }}>
              <Button fullWidth variant="outlined" color="error" onClick={() => setConfirmAction("Rejected")}>Reject</Button>
              <Button fullWidth variant="contained" color="success" onClick={() => setConfirmAction("Approved")}>Approve</Button>
            </Box>
          )}

          <ConfirmDialog
            open={!!confirmAction}
            title={confirmAction === "Approved" ? "Approve leave request?" : "Reject leave request?"}
            message={`This will mark ${leave.user?.name}'s ${leave.leaveType} leave as ${confirmAction}.`}
            confirmLabel={confirmAction === "Approved" ? "Approve" : "Reject"}
            confirmColor={confirmAction === "Approved" ? "success" : "error"}
            onClose={() => setConfirmAction(null)}
            onConfirm={() => {
              onDecide(leave._id, confirmAction);
              setConfirmAction(null);
              onClose();
            }}
          />
        </>
      )}
    </Drawer>
  );
};

const EmployeeLeaveSection = () => {
  const { myLeaves, loading, submitLeave } = useLeave();
  const notify = useSnackbar();
  const [applyOpen, setApplyOpen] = useState(false);
  const [statusTab, setStatusTab] = useState("All");
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("action") === "apply") {
      setApplyOpen(true);
      searchParams.delete("action");
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const balances = useMemo(() => computeLeaveBalance(myLeaves), [myLeaves]);
  const filtered = statusTab === "All" ? myLeaves : myLeaves.filter((l) => l.status === statusTab);

  const handleSubmit = async (data) => {
    const res = await submitLeave(data);
    notify(res.ok ? "Leave request submitted" : res.message, res.ok ? "success" : "error");
    return res;
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700}>Leave Balance</Typography>
        <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => setApplyOpen(true)}>Apply Leave</Button>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" }, gap: 2, mb: 3 }}>
        {balances.map((b) => (
          <Paper key={b.type} sx={{ p: 2.5 }}>
            <Typography variant="caption" color="text.secondary">{b.type}</Typography>
            <Typography variant="h5" fontWeight={700}>{b.remaining}<Typography component="span" variant="body2" color="text.secondary"> / {b.allowance} days</Typography></Typography>
          </Paper>
        ))}
      </Box>

      <Paper sx={{ mb: 2 }}>
        <Tabs value={statusTab} onChange={(e, v) => setStatusTab(v)} sx={{ px: 2 }}>
          <Tab label="All" value="All" />
          <Tab label="Pending" value="Pending" />
          <Tab label="Approved" value="Approved" />
          <Tab label="Rejected" value="Rejected" />
        </Tabs>
      </Paper>

      {loading ? (
        <TableSkeleton />
      ) : (
        <DataTable paginate
          rows={filtered}
          emptyTitle="No leave requests"
          emptyDescription="Apply for leave using the button above."
          emptyIcon={FileSpreadsheet}
          columns={[
            { key: "leaveType", label: "Type" },
            { key: "dates", label: "Dates", render: (r) => `${formatDate(r.startDate)} → ${formatDate(r.endDate)}` },
            { key: "days", label: "Days", render: (r) => daysBetween(r.startDate, r.endDate) },
            { key: "reason", label: "Reason" },
            { key: "status", label: "Status", render: (r) => <StatusChip status={r.status} /> },
          ]}
        />
      )}

      <ApplyLeaveDialog open={applyOpen} onClose={() => setApplyOpen(false)} onSubmit={handleSubmit} />
    </Box>
  );
};

const ManagerLeaveQueue = () => {
  const notify = useSnackbar();
  const { actOnLeave } = useLeave();
  const [statusTab, setStatusTab] = useState("Pending");
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = () => {
    setLoading(true);
    getAllLeaves(statusTab)
      .then(setLeaves)
      .finally(() => setLoading(false));
  };

  useEffect(load, [statusTab]);

  const handleDecide = async (id, status) => {
    const res = await actOnLeave(id, status);
    notify(res.ok ? `Leave ${status.toLowerCase()}` : res.message, res.ok ? "success" : "error");
    load();
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Team Leave Requests</Typography>
      <Paper sx={{ mb: 2 }}>
        <Tabs value={statusTab} onChange={(e, v) => setStatusTab(v)} sx={{ px: 2 }}>
          <Tab label="Pending" value="Pending" />
          <Tab label="Approved" value="Approved" />
          <Tab label="Rejected" value="Rejected" />
        </Tabs>
      </Paper>

      {loading ? (
        <TableSkeleton />
      ) : leaves.length === 0 ? (
        <Paper><EmptyState title={`No ${statusTab.toLowerCase()} requests`} icon={FileSpreadsheet} /></Paper>
      ) : (
        <DataTable paginate
          rows={leaves}
          emptyTitle="No requests"
          onRowClick={(row) => setSelected(row)}
          columns={[
            { key: "employee", label: "Employee", render: (r) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                <InitialsAvatar name={r.user?.name} size={28} />
                <Typography variant="body2" fontWeight={600}>{r.user?.name}</Typography>
              </Box>
            ) },
            { key: "department", label: "Department", render: (r) => r.user?.department || "—" },
            { key: "leaveType", label: "Type" },
            { key: "dates", label: "Dates", render: (r) => `${formatDate(r.startDate)} → ${formatDate(r.endDate)}` },
            { key: "days", label: "Days", render: (r) => daysBetween(r.startDate, r.endDate) },
            { key: "reason", label: "Reason", render: (r) => (
              <Typography variant="body2" noWrap sx={{ maxWidth: 160 }}>{r.reason}</Typography>
            ) },
            { key: "status", label: "Status", render: (r) => <StatusChip status={r.status} /> },
            { key: "actions", label: "Actions", render: (r) => (
              r.status === "Pending" ? (
                <Box sx={{ display: "flex", gap: 1 }} onClick={(e) => e.stopPropagation()}>
                  <Button size="small" color="success" onClick={() => handleDecide(r._id, "Approved")}>Approve</Button>
                  <Button size="small" color="error" onClick={() => handleDecide(r._id, "Rejected")}>Reject</Button>
                </Box>
              ) : (
                <Button size="small" onClick={(e) => { e.stopPropagation(); setSelected(r); }}>View</Button>
              )
            ) },
          ]}
        />
      )}

      <ApprovalDrawer leave={selected} onClose={() => setSelected(null)} onDecide={handleDecide} />
    </Box>
  );
};

const LeaveManagement = () => {
  const { user } = useAuth();
  const isManager = ["Manager", "HR", "Admin"].includes(user?.role);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Leave Management</Typography>
        <Typography variant="body2" color="text.secondary">Apply for leave and track approval status.</Typography>
      </Box>
      <EmployeeLeaveSection />
      {isManager && <ManagerLeaveQueue />}
    </Box>
  );
};

export default LeaveManagement;
