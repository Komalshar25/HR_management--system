import { useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useAuth } from "../../context/AuthContext";
import { updateMe } from "../../api/users";
import { useSnackbar } from "../../components/common/SnackbarProvider";
import InitialsAvatar from "../../components/common/InitialsAvatar";

const Settings = () => {
  const { user, refreshUser } = useAuth();
  const notify = useSnackbar();
  const [form, setForm] = useState({
    name: user?.name || "",
    department: user?.department || "",
    designation: user?.designation || "",
    dateOfBirth: user?.dateOfBirth ? String(user.dateOfBirth).slice(0, 10) : "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateMe(form);
      refreshUser?.(updated);
      notify("Profile updated");
    } catch (err) {
      notify(err.response?.data?.message || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Settings</Typography>
        <Typography variant="body2" color="text.secondary">Manage your account details.</Typography>
      </Box>

      <Paper sx={{ p: 3, maxWidth: 520 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <InitialsAvatar name={user?.name} size={56} />
          <Box>
            <Typography fontWeight={700}>{user?.name}</Typography>
            <Typography variant="caption" color="text.secondary">{user?.email} · {user?.employeeId}</Typography>
          </Box>
        </Box>

        <Box component="form" onSubmit={handleSave} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} fullWidth />
          <TextField label="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} fullWidth />
          <TextField label="Designation" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} fullWidth />
          <TextField
            label="Date of birth"
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
            fullWidth
            slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: new Date().toISOString().slice(0, 10) } }}
            helperText="Optional. Your birthday shows up in the company celebrations card."
          />
          <TextField label="Role" value={user?.role || ""} disabled fullWidth helperText="Contact an administrator to change your role." />
          <Button type="submit" variant="contained" disabled={saving} sx={{ alignSelf: "flex-start" }}>
            Save Changes
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Settings;
