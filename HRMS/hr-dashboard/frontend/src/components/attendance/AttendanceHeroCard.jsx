import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Divider from "@mui/material/Divider";
import { Info, LogIn, LogOut, Clock, Calendar, Sprout } from "lucide-react";
import { formatDuration, formatTime } from "../../utils/format";

const STATE_STYLES = {
  in: { bg: "rgba(22,163,74,0.14)", color: "#16a34a", dot: "#16a34a", label: "Checked In" },
  out: { bg: "rgba(37,99,235,0.14)", color: "#2563eb", dot: "#2563eb", label: "Checked Out" },
  none: { bg: "rgba(148,163,184,0.18)", color: "#64748b", dot: "#94a3b8", label: "Not Checked In" },
};

const Illustration = () => (
  <Box
    sx={{
      display: { xs: "none", lg: "flex" },
      alignItems: "center",
      justifyContent: "center",
      width: 140,
      height: 140,
      flexShrink: 0,
      position: "relative",
    }}
  >
    <Box sx={{ position: "absolute", inset: 0, borderRadius: "50%", bgcolor: "rgba(37,99,235,0.14)" }} />
    <Box
      sx={{
        position: "relative",
        width: 84,
        height: 96,
        bgcolor: "background.paper",
        borderRadius: "10px",
        border: "1px solid rgba(37,99,235,0.3)",
        boxShadow: "0 8px 24px rgba(37,99,235,0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Calendar size={34} color="#93c5fd" strokeWidth={1.5} />
      <Box
        sx={{
          position: "absolute",
          bottom: -12,
          right: -12,
          width: 44,
          height: 44,
          borderRadius: "50%",
          bgcolor: "#2563eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 6px 16px rgba(37,99,235,0.3)",
        }}
      >
        <Clock size={20} color="#fff" strokeWidth={2} />
      </Box>
      <Box sx={{ position: "absolute", bottom: -6, left: -18, color: "#86efac" }}>
        <Sprout size={26} strokeWidth={1.5} />
      </Box>
    </Box>
  </Box>
);

const AttendanceHeroCard = ({ todayRecord, openRecord, liveMs, actionLoading, onClockIn, onClockOut }) => {
  const state = openRecord ? "in" : todayRecord ? "out" : "none";
  const style = STATE_STYLES[state];

  const infoText =
    state === "in"
      ? "Your working hours are being tracked automatically."
      : state === "out"
      ? "You've checked out for today. You can check in again if needed."
      : "You haven't checked in yet today.";

  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: "16px" }}>
      <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
        <Box sx={{ flex: 1, minWidth: 260 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1.5 }}>
            Today &bull; {todayLabel}
          </Typography>

          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.75,
              bgcolor: style.bg,
              color: style.color,
              px: 1.5,
              py: 0.5,
              borderRadius: "20px",
              fontSize: "0.8rem",
              fontWeight: 700,
              mb: 2,
            }}
          >
            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: style.dot }} />
            {style.label}
          </Box>

          <Typography
            variant="h2"
            sx={{ fontWeight: 700, fontFamily: "monospace", letterSpacing: "2px", fontSize: { xs: "2.6rem", sm: "3.2rem" }, lineHeight: 1.1 }}
          >
            {formatDuration(liveMs)}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5, mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Working time today
            </Typography>
            <Tooltip title="Total time tracked from check-in to check-out today">
              <Info size={14} color="#94a3b8" style={{ cursor: "help" }} />
            </Tooltip>
          </Box>

          {state === "in" ? (
            <Button
              variant="contained"
              size="large"
              startIcon={<LogOut size={18} />}
              disabled={actionLoading}
              onClick={onClockOut}
              sx={{ px: 4 }}
            >
              Check Out
            </Button>
          ) : (
            <Button
              variant="contained"
              size="large"
              startIcon={<LogIn size={18} />}
              disabled={actionLoading}
              onClick={onClockIn}
              sx={{ px: 4 }}
            >
              Check In
            </Button>
          )}
        </Box>

        <Divider orientation="vertical" flexItem sx={{ display: { xs: "none", md: "block" } }} />

        <Box sx={{ flex: 1, minWidth: 220, display: "flex", flexDirection: "column", gap: 2 }}>
          <Box sx={{ display: "flex", gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "text.secondary", mb: 0.5 }}>
                <Clock size={14} />
                <Typography variant="caption" fontWeight={600}>Check In</Typography>
              </Box>
              <Typography variant="h6" fontWeight={700}>{formatTime(todayRecord?.checkIn)}</Typography>
              <Typography variant="caption" color="text.secondary">
                {todayRecord?.checkIn ? "Today" : "—"}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "text.secondary", mb: 0.5 }}>
                <Clock size={14} />
                <Typography variant="caption" fontWeight={600}>Check Out</Typography>
              </Box>
              <Typography variant="h6" fontWeight={700} color={openRecord ? "text.disabled" : "text.primary"}>
                {openRecord ? "--:--" : formatTime(todayRecord?.checkOut)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {openRecord ? "Not checked out yet" : todayRecord?.checkOut ? "Today" : "—"}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 1,
              bgcolor: "rgba(37,99,235,0.14)",
              color: "#3b82f6",
              px: 1.5,
              py: 1,
              borderRadius: "10px",
              fontSize: "0.8rem",
            }}
          >
            <Info size={15} style={{ marginTop: 2, flexShrink: 0 }} />
            <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
              {infoText}
            </Typography>
          </Box>
        </Box>

        <Illustration />
      </Box>
    </Paper>
  );
};

export default AttendanceHeroCard;
