import { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { Users, UserCheck, UserX, Briefcase } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer } from "recharts";
import { useRecruitmentSummary, useCandidates } from "../../hooks/useRecruitment";
import DataTable from "../../components/common/DataTable";
import KpiCard from "../../components/common/KpiCard";
import StatusChip from "../../components/common/StatusChip";
import EmptyState from "../../components/common/EmptyState";
import { CardSkeleton, KpiSkeletonRow, TableSkeleton } from "../../components/common/LoadingSkeleton";
import { formatDate } from "../../utils/format";

const RecruitmentPage = () => {
  const { summary, loading: summaryLoading } = useRecruitmentSummary();
  const [statusTab, setStatusTab] = useState("All");
  const params = useMemo(() => (statusTab === "All" ? {} : { status: statusTab }), [statusTab]);
  const { candidates, loading: candidatesLoading } = useCandidates(params);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Recruitment</Typography>
        <Typography variant="body2" color="text.secondary">Track candidates through the interview pipeline.</Typography>
      </Box>

      {summaryLoading ? (
        <KpiSkeletonRow />
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" }, gap: 2, mb: 3 }}>
          <KpiCard icon={Users} label="Total Candidates" value={summary?.total ?? 0} tone="primary" />
          <KpiCard icon={UserCheck} label="Selected" value={summary?.selected ?? 0} tone="success" />
          <KpiCard icon={Briefcase} label="Pending" value={summary?.pending ?? 0} tone="warning" />
          <KpiCard icon={UserX} label="Rejected" value={summary?.rejected ?? 0} tone="error" />
        </Box>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Candidates by Position</Typography>
        {summaryLoading ? <CardSkeleton height={260} /> : !summary?.byPosition?.length ? (
          <EmptyState title="No data" />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={summary.byPosition}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
              <XAxis dataKey="position" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <ChartTooltip contentStyle={{ borderRadius: 10, border: "1px solid rgba(128,128,128,0.25)" }} />
              <Bar dataKey="total" name="Total Candidates" fill="#2563eb" radius={[6, 6, 0, 0]} />
              <Bar dataKey="selected" name="Selected" fill="#16a34a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Paper>

      <Paper sx={{ mb: 2 }}>
        <Tabs value={statusTab} onChange={(e, v) => setStatusTab(v)} sx={{ px: 2 }}>
          <Tab label="All" value="All" />
          <Tab label="Pending" value="Pending" />
          <Tab label="Selected" value="Selected" />
          <Tab label="Rejected" value="Rejected" />
        </Tabs>
      </Paper>

      {candidatesLoading ? (
        <TableSkeleton />
      ) : (
        <DataTable paginate
          rows={candidates}
          getRowKey={(r) => r._id}
          emptyTitle="No candidates"
          emptyIcon={Users}
          columns={[
            { key: "candidateName", label: "Candidate" },
            { key: "position", label: "Position" },
            { key: "interviewDate", label: "Interview Date", render: (r) => formatDate(r.interviewDate) },
            { key: "status", label: "Status", render: (r) => <StatusChip status={r.status} /> },
          ]}
        />
      )}
    </Box>
  );
};

export default RecruitmentPage;
