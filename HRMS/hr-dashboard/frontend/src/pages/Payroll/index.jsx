import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Divider from "@mui/material/Divider";
import { Wallet, TrendingUp, MinusCircle, Receipt } from "lucide-react";
import { usePayroll } from "../../hooks/usePayroll";
import DataTable from "../../components/common/DataTable";
import KpiCard from "../../components/common/KpiCard";
import StatusChip from "../../components/common/StatusChip";
import { KpiSkeletonRow, TableSkeleton } from "../../components/common/LoadingSkeleton";
import { formatCurrency, formatMonthLabel } from "../../utils/format";

const PayslipDialog = ({ record, onClose }) => (
  <Dialog open={!!record} onClose={onClose} maxWidth="xs" fullWidth>
    {record && (
      <>
        <DialogTitle sx={{ fontWeight: 700 }}>Payslip — {formatMonthLabel(record.month)}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 1.5, pb: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary">Basic Pay</Typography>
            <Typography variant="body2" fontWeight={600}>{formatCurrency(record.basic)}</Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary">Allowances</Typography>
            <Typography variant="body2" fontWeight={600} color="success.main">+{formatCurrency(record.allowances)}</Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary">Deductions</Typography>
            <Typography variant="body2" fontWeight={600} color="error.main">-{formatCurrency(record.deductions)}</Typography>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="subtitle2" fontWeight={700}>Net Pay</Typography>
            <Typography variant="subtitle2" fontWeight={700}>{formatCurrency(record.netPay)}</Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
            <Typography variant="body2" color="text.secondary">Status</Typography>
            <StatusChip status={record.status} />
          </Box>
        </DialogContent>
      </>
    )}
  </Dialog>
);

const PayrollPage = () => {
  const { records, loading } = usePayroll();
  const [selected, setSelected] = useState(null);

  const summary = useMemo(() => {
    const latest = records[0];
    const ytdGross = records.reduce((sum, r) => sum + r.basic + r.allowances, 0);
    const ytdDeductions = records.reduce((sum, r) => sum + r.deductions, 0);
    return {
      latestNet: latest?.netPay ?? null,
      latestMonth: latest?.month,
      ytdGross,
      ytdDeductions,
    };
  }, [records]);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Payroll</Typography>
        <Typography variant="body2" color="text.secondary">View your salary breakdown and payslip history.</Typography>
      </Box>

      {loading ? (
        <KpiSkeletonRow count={3} />
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2, mb: 3 }}>
          <KpiCard
            icon={Wallet}
            label={summary.latestMonth ? `Net Pay — ${formatMonthLabel(summary.latestMonth)}` : "Net Pay"}
            value={formatCurrency(summary.latestNet)}
            tone="primary"
          />
          <KpiCard icon={TrendingUp} label="Gross Pay (6 mo.)" value={formatCurrency(summary.ytdGross)} tone="success" />
          <KpiCard icon={MinusCircle} label="Deductions (6 mo.)" value={formatCurrency(summary.ytdDeductions)} tone="warning" />
        </Box>
      )}

      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Payslip History</Typography>
        {loading ? (
          <TableSkeleton />
        ) : (
          <DataTable paginate
            rows={records}
            getRowKey={(r) => r._id}
            emptyTitle="No payslips yet"
            emptyIcon={Receipt}
            columns={[
              { key: "month", label: "Month", render: (r) => formatMonthLabel(r.month) },
              { key: "basic", label: "Basic", render: (r) => formatCurrency(r.basic) },
              { key: "allowances", label: "Allowances", render: (r) => formatCurrency(r.allowances) },
              { key: "deductions", label: "Deductions", render: (r) => formatCurrency(r.deductions) },
              { key: "netPay", label: "Net Pay", render: (r) => <Typography variant="body2" fontWeight={700}>{formatCurrency(r.netPay)}</Typography> },
              { key: "status", label: "Status", render: (r) => <StatusChip status={r.status} /> },
              { key: "actions", label: "", render: (r) => (
                <Button size="small" onClick={() => setSelected(r)}>View</Button>
              ) },
            ]}
          />
        )}
      </Paper>

      <PayslipDialog record={selected} onClose={() => setSelected(null)} />
    </Box>
  );
};

export default PayrollPage;
