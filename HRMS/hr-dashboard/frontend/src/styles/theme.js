import { createTheme } from '@mui/material/styles';

const buildTheme = (mode) => {
  const dark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      background: dark
        ? { default: '#0b1220', paper: '#111a2e' }
        : { default: '#f5f7fb', paper: '#ffffff' },
      primary: { main: dark ? '#3b82f6' : '#2563eb' },
      secondary: { main: '#0ea5e9' },
      success: { main: '#16a34a' },
      info: { main: '#2563eb' },
      error: { main: '#ef4444' },
      text: dark
        ? { primary: '#e2e8f0', secondary: '#94a3b8' }
        : { primary: '#0f172a', secondary: '#475569' },
      divider: dark ? 'rgba(148,163,184,0.16)' : 'rgba(15,23,42,0.08)',
    },
    shape: {
      borderRadius: 14,
    },
    typography: {
      fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif',
      h1: { fontWeight: 700 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 700 },
      button: { fontWeight: 700, letterSpacing: '0.01em' },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: dark
          ? {
              '.recharts-default-tooltip': {
                backgroundColor: '#1e293b !important',
                border: '1px solid rgba(148,163,184,0.25) !important',
                color: '#e2e8f0',
              },
              '.recharts-tooltip-cursor': { fill: 'rgba(148,163,184,0.12)' },
            }
          : {},
      },
      // Floating surfaces stay solid so text underneath never shows through
      MuiDialog: { styleOverrides: { paper: { backgroundColor: dark ? '#111a2e' : '#ffffff', backdropFilter: 'none' } } },
      MuiPopover: { styleOverrides: { paper: { backgroundColor: dark ? '#111a2e' : '#ffffff', backdropFilter: 'none' } } },
      MuiDrawer: { styleOverrides: { paper: { backgroundColor: dark ? '#111a2e' : '#ffffff', backdropFilter: 'none' } } },
      MuiAutocomplete: { styleOverrides: { paper: { backgroundColor: dark ? '#111a2e' : '#ffffff', backdropFilter: 'none' } } },
      MuiTabs: {
        defaultProps: { variant: 'scrollable', scrollButtons: 'auto', allowScrollButtonsMobile: true },
      },
      MuiPaper: {
        defaultProps: { elevation: 8 },
        styleOverrides: {
          root: {
            backgroundColor: dark ? 'rgba(17,26,46,0.8)' : 'rgba(255,255,255,0.74)',
            backdropFilter: 'blur(12px)',
            backgroundImage: 'none',
            border: dark ? '1px solid rgba(148,163,184,0.14)' : '1px solid rgba(15,23,42,0.06)',
            boxShadow: dark ? '0 12px 45px rgba(0, 0, 0, 0.35)' : '0 12px 45px rgba(15, 23, 42, 0.08)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            textTransform: 'none',
            paddingInline: 18,
            paddingBlock: 12,
            boxShadow: '0 8px 24px rgba(37, 99, 235, 0.18)',
          },
          containedSecondary: {
            boxShadow: '0 8px 24px rgba(14,165,233,0.18)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: dark ? '1px solid rgba(148,163,184,0.14)' : '1px solid rgba(15,23,42,0.06)',
            backgroundColor: dark ? '#111a2e' : '#ffffff',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            backgroundColor: 'transparent',
          },
        },
      },
    },
  });
};

export default buildTheme;
