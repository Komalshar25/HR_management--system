import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { CalendarDays } from "lucide-react";
import dayImage from "../../assets/banner-day.jpg";
import eveningImage from "../../assets/banner-evening.jpg";
import nightImage from "../../assets/banner-night.jpg";

const QUOTES = [
  "Great people build great companies.",
  "Progress, not perfection.",
  "Small daily improvements lead to big results.",
  "Teamwork makes the dream work.",
  "Consistency beats intensity.",
  "Every check-in is a step forward.",
];

const dayOfYear = (d) => {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d - start) / (1000 * 60 * 60 * 24));
};

// Day 06:00-17:00, Evening 17:00-20:00, Night 20:00-06:00
const timeBandFor = (hour) => {
  if (hour >= 6 && hour < 17) return "day";
  if (hour >= 17 && hour < 20) return "evening";
  return "night";
};

const BAND_IMAGES = { day: dayImage, evening: eveningImage, night: nightImage };

const WelcomeBanner = ({ greeting, name, subtitle }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60 * 1000);
    return () => clearInterval(t);
  }, []);

  const quote = QUOTES[dayOfYear(now) % QUOTES.length];
  const band = timeBandFor(now.getHours());

  return (
    <Paper
      sx={{
        position: "relative",
        mb: 3,
        borderRadius: "20px",
        border: "none",
        overflow: "hidden",
        bgcolor: "#0f172a",
      }}
    >
      {Object.entries(BAND_IMAGES).map(([key, src]) => (
        <Box
          key={key}
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${src})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: band === key ? 1 : 0,
            transition: "opacity 1.5s ease",
          }}
        />
      ))}

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(90deg, rgba(15,23,42,0.55) 0%, rgba(15,23,42,0.15) 60%, rgba(15,23,42,0.05) 100%)",
        }}
      />

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          p: { xs: 3, md: 4 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 3,
          color: "#fff",
        }}
      >
        <Box sx={{ maxWidth: 480 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, textShadow: "0 2px 12px rgba(0,0,0,0.65)" }}>
            {greeting}, <Box component="span" sx={{ color: "#93c5fd" }}>{name}</Box>
          </Typography>
          <Typography variant="body2" sx={{ color: "#fff", fontWeight: 600, mt: 0.5, textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>
            {subtitle}
          </Typography>
          <Typography variant="body2" sx={{ color: "#fff", mt: 2, fontStyle: "italic", fontWeight: 500, textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}>
            "{quote}"
          </Typography>
        </Box>

        <Box
          sx={{
            bgcolor: "rgba(15,23,42,0.55)",
            border: "1px solid rgba(255,255,255,0.25)",
            borderRadius: "14px",
            px: 2.5,
            py: 1.75,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            backdropFilter: "blur(8px)",
          }}
        >
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "10px",
              bgcolor: "rgba(96,165,250,0.25)",
              color: "#93c5fd",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <CalendarDays size={19} />
          </Box>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 700, color: "#fff" }}>
              {now.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.85)" }}>
              Make today count!
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default WelcomeBanner;
