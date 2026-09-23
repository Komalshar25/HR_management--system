import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { Cake, Award } from "lucide-react";
import InitialsAvatar from "../common/InitialsAvatar";
import EmptyState from "../common/EmptyState";
import { CardSkeleton } from "../common/LoadingSkeleton";
import { getCelebrations } from "../../api/announcements";

const whenLabel = (daysUntil) => {
  if (daysUntil === 0) return "Today";
  if (daysUntil === 1) return "Tomorrow";
  const d = new Date();
  d.setDate(d.getDate() + daysUntil);
  return d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
};

const Row = ({ person, detail }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
    <InitialsAvatar name={person.name} size={32} />
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography variant="body2" fontWeight={600} noWrap>{person.name}</Typography>
      <Typography variant="caption" color="text.secondary" noWrap>
        {detail ? `${detail} · ` : ""}{person.department}
      </Typography>
    </Box>
    <Typography
      variant="caption"
      sx={{
        fontWeight: 700,
        px: 1,
        py: 0.25,
        borderRadius: "20px",
        color: person.daysUntil === 0 ? "#16a34a" : "text.secondary",
        bgcolor: person.daysUntil === 0 ? "rgba(22,163,74,0.14)" : "action.hover",
        whiteSpace: "nowrap",
      }}
    >
      {whenLabel(person.daysUntil)}
    </Typography>
  </Box>
);

const Section = ({ icon: Icon, color, title, children, empty }) => (
  <Box>
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1.25 }}>
      <Icon size={15} color={color} />
      <Typography variant="caption" sx={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "text.secondary" }}>
        {title}
      </Typography>
    </Box>
    {empty ? (
      <Typography variant="body2" color="text.secondary">Nothing in the next 7 days.</Typography>
    ) : (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>{children}</Box>
    )}
  </Box>
);

const CelebrationsCard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCelebrations()
      .then(setData)
      .catch(() => setData({ birthdays: [], anniversaries: [] }))
      .finally(() => setLoading(false));
  }, []);

  const birthdays = data?.birthdays || [];
  const anniversaries = data?.anniversaries || [];

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>Celebrations</Typography>
      {loading ? (
        <CardSkeleton height={160} />
      ) : birthdays.length === 0 && anniversaries.length === 0 ? (
        <EmptyState icon={Cake} title="No celebrations this week" />
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          <Section icon={Cake} color="#ec4899" title="Birthdays" empty={birthdays.length === 0}>
            {birthdays.slice(0, 4).map((p) => <Row key={p._id} person={p} />)}
          </Section>
          <Section icon={Award} color="#7c3aed" title="Work anniversaries" empty={anniversaries.length === 0}>
            {anniversaries.slice(0, 4).map((p) => (
              <Row key={p._id} person={p} detail={`${p.years} ${p.years === 1 ? "year" : "years"}`} />
            ))}
          </Section>
        </Box>
      )}
    </Paper>
  );
};

export default CelebrationsCard;
