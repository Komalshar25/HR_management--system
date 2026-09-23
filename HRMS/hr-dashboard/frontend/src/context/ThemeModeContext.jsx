import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import buildTheme from "../styles/theme";

const STORAGE_KEY = "themeMode";

const initialMode = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // storage unavailable — fall through to system preference
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const ThemeModeContext = createContext({ mode: "light", toggleMode: () => {} });

export const ThemeModeProvider = ({ children }) => {
  const [mode, setMode] = useState(initialMode);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // ignore
    }
  }, [mode]);

  const toggleMode = useCallback(() => setMode((m) => (m === "dark" ? "light" : "dark")), []);
  const theme = useMemo(() => buildTheme(mode), [mode]);

  return (
    <ThemeModeContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};

export const useThemeMode = () => useContext(ThemeModeContext);
