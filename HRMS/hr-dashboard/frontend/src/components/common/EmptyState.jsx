import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Inbox } from "lucide-react";

const EmptyState = ({ icon: Icon = Inbox, title, description, actionLabel, onAction, sx = {} }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      py: 6,
      px: 3,
      ...sx,
    }}
  >
    <Box
      sx={{
        width: 56,
        height: 56,
        borderRadius: "14px",
        bgcolor: "rgba(128,128,128,0.15)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mb: 2,
      }}
    >
      <Icon size={26} color="#94a3b8" />
    </Box>
    <Typography variant="subtitle1" fontWeight={700} gutterBottom>
      {title}
    </Typography>
    {description && (
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 340, mb: actionLabel ? 2 : 0 }}>
        {description}
      </Typography>
    )}
    {actionLabel && (
      <Button variant="contained" size="small" onClick={onAction} sx={{ mt: 1 }}>
        {actionLabel}
      </Button>
    )}
  </Box>
);

export default EmptyState;
