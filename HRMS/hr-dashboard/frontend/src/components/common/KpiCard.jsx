import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

const KpiCard = ({ icon: Icon, label, value, delta, deltaLabel, deltaSuffix = "%", tone = "primary" }) => {
  const positive = typeof delta === "number" && delta >= 0;

  return (
    <Paper
      sx={{
        p: { xs: 2, sm: 2.5 },
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
        transition: "transform 200ms ease, box-shadow 200ms ease",
        "&:hover": { transform: "translateY(-2px)" },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: (theme) => theme.palette[tone]?.main || theme.palette.primary.main,
            bgcolor: (theme) => alpha(theme.palette[tone]?.main || theme.palette.primary.main, 0.12),
          }}
        >
          {Icon && <Icon size={21} strokeWidth={2.25} color="currentColor" />}
        </Box>
        {typeof delta === "number" && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.3,
              fontSize: "0.75rem",
              fontWeight: 700,
              px: 1,
              py: 0.4,
              borderRadius: "999px",
              color: positive ? "success.main" : "error.main",
              bgcolor: (theme) => alpha(theme.palette[positive ? "success" : "error"].main, 0.1),
            }}
          >
            {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(delta)}{deltaSuffix}
          </Box>
        )}
      </Box>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700, lineHeight: 1.2, fontSize: { xs: "1.4rem", sm: "2.125rem" }, overflowWrap: "anywhere" }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {label}
        </Typography>
        {deltaLabel && (
          <Typography variant="caption" color="text.secondary">
            {deltaLabel}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default KpiCard;
