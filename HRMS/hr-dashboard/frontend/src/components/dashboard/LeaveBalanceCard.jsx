import { useMemo } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import { useNavigate } from "react-router-dom";
import { computeLeaveBalance, daysBetween } from "../../utils/leave";
import { formatDate } from "../../utils/format";

const TYPE_COLORS = { Sick: "#ef4444", Casual: "#0ea5e9", Annual: "#2563eb", Maternity: "#7c3aed" };

const LeaveBalanceCard = ({ myLeaves }) => {
  const navigate = useNavigate();
  const balances = useMemo(() => computeLeaveBalance(myLeaves), [myLeaves]);

  const upcoming = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    return myLeaves
      .filter((l) => l.status === "Approved" && new Date(l.endDate).getTime() >= today)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))[0];
  }, [myLeaves]);

  return (
    <Paper sx={{ p: 3, height: "100%" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
        <Typography variant="subtitle1" fontWeight={700}>Leave balance</Typography>
        <Button size="small" onClick={() => navigate("/leave")} sx={{ boxShadow: "none" }}>Manage</Button>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {balances.map(({ type, allowance, used, remaining }) => {
          const color = TYPE_COLORS[type] || "#2563eb";
          return (
            <Box key={type}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", mb: 0.75 }}>
                <Typography variant="body2" fontWeight={600}>{type}</Typography>
                <Typography variant="body2" color="text.secondary">
                  <Box component="span" sx={{ fontWeight: 800, color: "text.primary" }}>{remaining}</Box> of {allowance} days left
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min((used / allowance) * 100, 100)}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: "rgba(128,128,128,0.18)",
                  "& .MuiLinearProgress-bar": { borderRadius: 4, bgcolor: color },
                }}
              />
            </Box>
          );
        })}
      </Box>

      <Box sx={{ mt: 2.5, pt: 2, borderTop: "1px solid rgba(128,128,128,0.2)" }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
          Next approved leave
        </Typography>
        <Typography variant="body2" fontWeight={600} sx={{ mt: 0.5 }}>
          {upcoming
            ? `${upcoming.leaveType} · ${formatDate(upcoming.startDate)} – ${formatDate(upcoming.endDate)} (${daysBetween(upcoming.startDate, upcoming.endDate)} day${daysBetween(upcoming.startDate, upcoming.endDate) > 1 ? "s" : ""})`
            : "No upcoming leave planned"}
        </Typography>
      </Box>
    </Paper>
  );
};

export default LeaveBalanceCard;
