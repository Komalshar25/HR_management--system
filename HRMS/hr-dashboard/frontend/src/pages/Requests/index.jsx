import { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { Plus, Inbox } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLeave } from "../../hooks/useLeave";
import DataTable from "../../components/common/DataTable";
import StatusChip from "../../components/common/StatusChip";
import { TableSkeleton } from "../../components/common/LoadingSkeleton";
import { formatDate } from "../../utils/format";
import { daysBetween } from "../../utils/leave";

const MyRequestsPage = () => {
  const { myLeaves, loading } = useLeave();
  const navigate = useNavigate();
  const [statusTab, setStatusTab] = useState("All");

  const filtered = useMemo(
    () => (statusTab === "All" ? myLeaves : myLeaves.filter((l) => l.status === statusTab)),
    [myLeaves, statusTab]
  );

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3, flexWrap: "wrap", gap: 1.5 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>My Requests</Typography>
          <Typography variant="body2" color="text.secondary">Track the status of every request you've submitted.</Typography>
        </Box>
        <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => navigate("/leave?action=apply")}>
          New Request
        </Button>
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
          emptyTitle="No requests yet"
          emptyDescription="Requests you submit, like leave applications, will show up here."
          emptyIcon={Inbox}
          columns={[
            { key: "leaveType", label: "Type", render: (r) => `${r.leaveType} Leave` },
            { key: "dates", label: "Dates", render: (r) => `${formatDate(r.startDate)} → ${formatDate(r.endDate)}` },
            { key: "days", label: "Days", render: (r) => daysBetween(r.startDate, r.endDate) },
            { key: "submitted", label: "Submitted", render: (r) => formatDate(r.createdAt) },
            { key: "reason", label: "Reason", render: (r) => (
              <Typography variant="body2" noWrap sx={{ maxWidth: 220 }}>{r.reason}</Typography>
            ) },
            { key: "status", label: "Status", render: (r) => <StatusChip status={r.status} /> },
          ]}
        />
      )}
    </Box>
  );
};

export default MyRequestsPage;
