import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

const ConfirmDialog = ({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  confirmColor = "primary",
  onConfirm,
  onClose,
  loading = false,
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
    <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
    <DialogContent>
      <DialogContentText>{message}</DialogContentText>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2.5 }}>
      <Button onClick={onClose} color="inherit">
        Cancel
      </Button>
      <Button
        onClick={onConfirm}
        variant="contained"
        color={confirmColor}
        disabled={loading}
        autoFocus
      >
        {confirmLabel}
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDialog;
