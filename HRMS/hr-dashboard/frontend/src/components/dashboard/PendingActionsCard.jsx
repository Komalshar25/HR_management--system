import { useMemo } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { CheckCircle2, LogIn, LogOut, Hourglass, XCircle, Cake, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { computeLeaveBalance } from "../../utils/leave";

const isWeekend = (d) => d.getDay() === 0 || d.getDay() === 6;

const PendingActionsCard = ({ todayRecord, openRecord, myLeaves, actionLoading, onClockIn, onClockOut }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const items = useMemo(() => {
    const now = new Date();
    const list = [];

    if (!todayRecord && !isWeekend(now)) {
      list.push({
        key: "checkin",
        icon: LogIn,
        color: "#16a34a",
        title: "You haven't checked in today",
        detail: "Start tracking your working hours.",
        action: { label: "Check in", onClick: onClockIn, disabled: actionLoading },
      });
    }

    if (openRecord && now.getHours() >= 18) {
      list.push({
        key: "checkout",
        icon: LogOut,
        color: "#dc2626",
        title: "You're still checked in",
        detail: "Remember to check out before you leave.",
        action: { label: "Check out", onClick: onClockOut, disabled: actionLoading },
      });
    }

    const pending = myLeaves.filter((l) => l.status === "Pending").length;
    if (pending > 0) {
      list.push({
        key: "pending",
        icon: Hourglass,
        color: "#d97706",
        title: `${pending} leave request${pending > 1 ? "s" : ""} awaiting approval`,
        detail: "Your manager hasn't responded yet.",
        action: { label: "View", onClick: () => navigate("/requests") },
      });
    }

    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const rejected = myLeaves.filter((l) => l.status === "Rejected" && new Date(l.updatedAt || l.createdAt).getTime() >= weekAgo).length;
    if (rejected > 0) {
      list.push({
        key: "rejected",
        icon: XCircle,
        color: "#dc2626",
        title: `${rejected} leave request${rejected > 1 ? "s were" : " was"} rejected this week`,
        detail: "Review the details or submit a new request.",
        action: { label: "Review", onClick: () => navigate("/requests") },
      });
    }

    const lowBalance = computeLeaveBalance(myLeaves).filter((b) => b.remaining <= 2 && b.type !== "Maternity");
    if (lowBalance.length > 0) {
      list.push({
        key: "balance",
        icon: AlertTriangle,
        color: "#d97706",
        title: `Low leave balance: ${lowBalance.map((b) => b.type).join(", ")}`,
        detail: "2 days or fewer remaining this year.",
        action: { label: "Details", onClick: () => navigate("/leave") },
      });
    }

    if (!user?.dateOfBirth) {
      list.push({
        key: "dob",
        icon: Cake,
        color: "#ec4899",
        title: "Add your birthday",
        detail: "Let your team celebrate with you.",
        action: { label: "Update profile", onClick: () => navigate("/settings") },
      });
    }

    return list;
  }, [todayRecord, openRecord, myLeaves, user, actionLoading, onClockIn, onClockOut, navigate]);

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={700}>Pending actions</Typography>
        {items.length > 0 && (
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, px: 1, py: 0.25, borderRadius: "20px", color: "#d97706", bgcolor: "rgba(217,119,6,0.15)" }}
          >
            {items.length} to do
          </Typography>
        )}
      </Box>

      {items.length === 0 ? (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", py: 4, gap: 1 }}>
          <CheckCircle2 size={34} color="#16a34a" />
          <Typography variant="body2" fontWeight={700}>You're all caught up</Typography>
          <Typography variant="caption" color="text.secondary">Nothing needs your attention right now.</Typography>
        </Box>
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(auto-fill, minmax(340px, 1fr))" }, gap: 1.5 }}>
          {items.map(({ key, icon: Icon, color, title, detail, action }) => (
            <Box
              key={key}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 1.25,
                borderRadius: "12px",
                border: "1px solid rgba(128,128,128,0.2)",
              }}
            >
              <Box
                sx={{ width: 34, height: 34, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color, bgcolor: `${color}1f` }}
              >
                <Icon size={17} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={700}>{title}</Typography>
                <Typography variant="caption" color="text.secondary">{detail}</Typography>
              </Box>
              <Button size="small" onClick={action.onClick} disabled={action.disabled} sx={{ boxShadow: "none", whiteSpace: "nowrap" }}>
                {action.label}
              </Button>
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );
};

export default PendingActionsCard;
