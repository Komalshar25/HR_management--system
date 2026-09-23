import { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { Heart, Trophy, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import InitialsAvatar from "../common/InitialsAvatar";
import EmptyState from "../common/EmptyState";
import { CardSkeleton } from "../common/LoadingSkeleton";
import GiveKudosDialog from "../recognition/GiveKudosDialog";
import { BADGES } from "../recognition/badges";
import { getRecentKudos, getKudosLeaderboard } from "../../api/recognition";
import { timeAgo, formatMonthLabel } from "../../utils/format";

const RANK_COLORS = ["#f59e0b", "#94a3b8", "#b45309"];

const KudosItem = ({ kudos, onOpen }) => {
  const badge = BADGES[kudos.badge] || BADGES["Team Player"];
  const Icon = badge.icon;
  return (
    <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
      <InitialsAvatar name={kudos.to?.name} size={38} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
          <Box component="span" sx={{ fontWeight: 700, cursor: "pointer" }} onClick={() => onOpen(kudos.to?._id)}>
            {kudos.from?.name}
          </Box>
          {" recognised "}
          <Box component="span" sx={{ fontWeight: 700, cursor: "pointer" }} onClick={() => onOpen(kudos.to?._id)}>
            {kudos.to?.name}
          </Box>
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, wordBreak: "break-word" }}>
          {kudos.message}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.75 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
              px: 1,
              py: 0.2,
              borderRadius: "20px",
              fontSize: "0.7rem",
              fontWeight: 700,
              color: badge.color,
              bgcolor: `${badge.color}22`,
            }}
          >
            <Icon size={12} /> {kudos.badge}
          </Box>
          <Typography variant="caption" color="text.secondary">{timeAgo(kudos.createdAt)}</Typography>
        </Box>
      </Box>
    </Box>
  );
};

const RecognitionWall = ({ canOpenProfiles = false }) => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("recent");
  const [recent, setRecent] = useState([]);
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const [r, b] = await Promise.all([getRecentKudos(), getKudosLeaderboard()]);
      setRecent(r);
      setBoard(b);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openProfile = (id) => {
    if (canOpenProfiles && id) navigate(`/employees/${id}`);
  };

  const winner = board?.lastMonthWinner;
  const leaders = board?.leaders || [];

  return (
    <Paper sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1, gap: 1, flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Heart size={18} color="#ef4444" />
          <Typography variant="subtitle1" fontWeight={700}>Recognition Wall</Typography>
        </Box>
        <Button size="small" variant="contained" onClick={() => setDialogOpen(true)} sx={{ py: 0.6, boxShadow: "none" }}>
          Give kudos
        </Button>
      </Box>

      {winner && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 1.5,
            my: 1.5,
            borderRadius: "12px",
            background: "linear-gradient(90deg, rgba(245,158,11,0.18), rgba(245,158,11,0.04))",
            border: "1px solid rgba(245,158,11,0.35)",
          }}
        >
          <Crown size={22} color="#f59e0b" />
          <InitialsAvatar name={winner.user.name} size={36} />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" sx={{ color: "#d97706", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Employee of the month · {formatMonthLabel(board.lastMonth)}
            </Typography>
            <Typography variant="body2" fontWeight={700} noWrap>
              {winner.user.name}
              <Box component="span" sx={{ fontWeight: 500, color: "text.secondary" }}>
                {" "}· {winner.count} kudos
              </Box>
            </Typography>
          </Box>
        </Box>
      )}

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ minHeight: 38, mb: 1.5, "& .MuiTab-root": { minHeight: 38, py: 0 } }}>
        <Tab label="Recent" value="recent" />
        <Tab label="This month's leaderboard" value="leaders" />
      </Tabs>

      {loading ? (
        <CardSkeleton height={240} />
      ) : tab === "recent" ? (
        recent.length === 0 ? (
          <EmptyState title="No kudos yet" description="Be the first to recognise a colleague." />
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minHeight: 0, overflowY: "auto", pr: 0.5 }}>
            {recent.map((k) => (
              <KudosItem key={k._id} kudos={k} onOpen={openProfile} />
            ))}
          </Box>
        )
      ) : leaders.length === 0 ? (
        <EmptyState icon={Trophy} title="No kudos this month" description="Send some kudos to start the leaderboard." />
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {leaders.map((l, i) => (
            <Box key={l.user._id} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.8rem",
                  fontWeight: 800,
                  color: i < 3 ? "#fff" : "text.secondary",
                  bgcolor: i < 3 ? RANK_COLORS[i] : "action.hover",
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </Box>
              <InitialsAvatar name={l.user.name} size={34} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600} noWrap>{l.user.name}</Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {l.user.designation} · {l.user.department}
                </Typography>
              </Box>
              <Typography variant="body2" fontWeight={800}>{l.count}</Typography>
            </Box>
          ))}
        </Box>
      )}

      <GiveKudosDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onGiven={load} />
    </Paper>
  );
};

export default RecognitionWall;
