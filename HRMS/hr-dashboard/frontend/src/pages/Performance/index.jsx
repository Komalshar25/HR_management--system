import { useMemo } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { Star, Award, TrendingUp, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "../../context/AuthContext";
import { useMyAppraisals, useAppraisalSummary, useAllAppraisals } from "../../hooks/useAppraisals";
import DataTable from "../../components/common/DataTable";
import KpiCard from "../../components/common/KpiCard";
import StatusChip from "../../components/common/StatusChip";
import InitialsAvatar from "../../components/common/InitialsAvatar";
import EmptyState from "../../components/common/EmptyState";
import RatingStars from "../../components/common/RatingStars";
import { CardSkeleton, KpiSkeletonRow, TableSkeleton } from "../../components/common/LoadingSkeleton";
import { formatDate } from "../../utils/format";

const MyPerformanceSection = () => {
  const { records, loading } = useMyAppraisals();

  const avgRating = useMemo(() => {
    if (!records.length) return null;
    return Math.round((records.reduce((s, r) => s + r.rating, 0) / records.length) * 10) / 10;
  }, [records]);

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>My Performance</Typography>

      {loading ? (
        <KpiSkeletonRow count={2} />
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" }, gap: 2, mb: 3 }}>
          <KpiCard icon={Star} label="Average Rating" value={avgRating ?? "—"} tone="warning" />
          <KpiCard icon={Award} label="Total Reviews" value={records.length} tone="primary" />
        </Box>
      )}

      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Review History</Typography>
        {loading ? (
          <TableSkeleton />
        ) : (
          <DataTable paginate
            rows={records}
            emptyTitle="No appraisals yet"
            emptyDescription="Your performance reviews will show up here."
            emptyIcon={Award}
            columns={[
              { key: "reviewDate", label: "Date", render: (r) => formatDate(r.reviewDate) },
              { key: "rating", label: "Rating", render: (r) => <RatingStars rating={r.rating} /> },
              { key: "remarks", label: "Remarks", render: (r) => <StatusChip status={r.remarks} /> },
            ]}
          />
        )}
      </Paper>
    </Box>
  );
};

const TeamPerformanceSection = () => {
  const { summary, loading: summaryLoading } = useAppraisalSummary();
  const { records, loading: recordsLoading } = useAllAppraisals();

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Organization Performance</Typography>

      {summaryLoading ? (
        <KpiSkeletonRow count={2} />
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" }, gap: 2, mb: 3 }}>
          <KpiCard icon={TrendingUp} label="Average Rating" value={summary?.avgRating ?? "—"} tone="warning" />
          <KpiCard icon={Users} label="Total Reviews" value={summary?.total ?? 0} tone="primary" />
        </Box>
      )}

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" }, gap: 3, mb: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Average Rating by Department</Typography>
          {summaryLoading ? <CardSkeleton height={260} /> : !summary?.byDepartment?.length ? (
            <EmptyState title="No data" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={summary.byDepartment}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                <XAxis dataKey="department" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <ChartTooltip
                  contentStyle={{ borderRadius: 10, border: "1px solid rgba(128,128,128,0.25)" }}
                  formatter={(value, name, props) => [`${value} (${props.payload.total} reviews)`, "Avg. Rating"]}
                />
                <Bar dataKey="avgRating" name="Avg. Rating" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Rating Distribution</Typography>
          {summaryLoading ? <CardSkeleton height={260} /> : !summary?.byRating?.length ? (
            <EmptyState title="No data" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={summary.byRating}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                <XAxis dataKey="rating" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <ChartTooltip contentStyle={{ borderRadius: 10, border: "1px solid rgba(128,128,128,0.25)" }} formatter={(v) => [v, "Reviews"]} />
                <Bar dataKey="count" name="Reviews" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Paper>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Recent Reviews</Typography>
        {recordsLoading ? (
          <TableSkeleton />
        ) : (
          <DataTable paginate
            rows={records}
            getRowKey={(r) => r._id}
            emptyTitle="No appraisals yet"
            emptyIcon={Award}
            columns={[
              { key: "employee", label: "Employee", render: (r) => (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                  <InitialsAvatar name={r.user?.name} size={28} />
                  <Typography variant="body2" fontWeight={600}>{r.user?.name}</Typography>
                </Box>
              ) },
              { key: "department", label: "Department", render: (r) => r.user?.department || "—" },
              { key: "reviewDate", label: "Date", render: (r) => formatDate(r.reviewDate) },
              { key: "rating", label: "Rating", render: (r) => <RatingStars rating={r.rating} /> },
              { key: "remarks", label: "Remarks", render: (r) => <StatusChip status={r.remarks} /> },
            ]}
          />
        )}
      </Paper>
    </Box>
  );
};

const PerformancePage = () => {
  const { user } = useAuth();
  const isManager = ["Manager", "HR", "Admin"].includes(user?.role);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Performance</Typography>
        <Typography variant="body2" color="text.secondary">Track appraisal history and review outcomes.</Typography>
      </Box>
      <MyPerformanceSection />
      {isManager && <TeamPerformanceSection />}
    </Box>
  );
};

export default PerformancePage;
