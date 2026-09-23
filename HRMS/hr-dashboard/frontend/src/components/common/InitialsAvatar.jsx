import Avatar from "@mui/material/Avatar";

const PALETTE = [
  "#2563eb", "#0ea5e9", "#7c3aed", "#16a34a",
  "#d97706", "#dc2626", "#0891b2", "#4f46e5",
];

const colorFor = (name = "") => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return PALETTE[Math.abs(hash) % PALETTE.length];
};

const initialsFor = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "?";

const InitialsAvatar = ({ name, size = 40, sx = {}, ...props }) => (
  <Avatar
    sx={{
      width: size,
      height: size,
      bgcolor: colorFor(name),
      fontSize: size * 0.4,
      fontWeight: 700,
      ...sx,
    }}
    {...props}
  >
    {initialsFor(name)}
  </Avatar>
);

export default InitialsAvatar;
