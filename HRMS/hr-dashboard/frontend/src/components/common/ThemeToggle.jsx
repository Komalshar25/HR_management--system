import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { Sun, Moon } from "lucide-react";
import { useThemeMode } from "../../context/ThemeModeContext";

const ThemeToggle = ({ sx }) => {
  const { mode, toggleMode } = useThemeMode();
  const isDark = mode === "dark";

  return (
    <Tooltip title={isDark ? "Switch to light mode" : "Switch to dark mode"}>
      <IconButton size="small" onClick={toggleMode} aria-label="Toggle dark mode" sx={sx}>
        {isDark ? <Sun size={19} /> : <Moon size={19} />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
