import { createContext, useContext, useState, useCallback } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const SnackbarContext = createContext(null);

export const SnackbarProvider = ({ children }) => {
  const [state, setState] = useState({ open: false, message: "", severity: "success" });

  const notify = useCallback((message, severity = "success") => {
    setState({ open: true, message, severity });
  }, []);

  const close = () => setState((s) => ({ ...s, open: false }));

  return (
    <SnackbarContext.Provider value={notify}>
      {children}
      <Snackbar
        open={state.open}
        autoHideDuration={4000}
        onClose={close}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={close} severity={state.severity} variant="filled" sx={{ borderRadius: "10px" }}>
          {state.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error("useSnackbar must be used within a SnackbarProvider");
  return ctx;
};
