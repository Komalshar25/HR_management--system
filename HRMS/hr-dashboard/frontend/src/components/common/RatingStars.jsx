import Box from "@mui/material/Box";
import { Star } from "lucide-react";

const RatingStars = ({ rating, size = 15 }) => (
  <Box sx={{ display: "flex", gap: 0.25 }}>
    {[1, 2, 3, 4, 5].map((n) => (
      <Star key={n} size={size} fill={n <= rating ? "#f59e0b" : "none"} color={n <= rating ? "#f59e0b" : "#cbd5e1"} />
    ))}
  </Box>
);

export default RatingStars;
