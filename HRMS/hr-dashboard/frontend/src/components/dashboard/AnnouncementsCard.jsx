import { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { Megaphone, Pin, Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useSnackbar } from "../common/SnackbarProvider";
import EmptyState from "../common/EmptyState";
import ConfirmDialog from "../common/ConfirmDialog";
import { CardSkeleton } from "../common/LoadingSkeleton";
import { listAnnouncements, createAnnouncement, deleteAnnouncement } from "../../api/announcements";
import { timeAgo } from "../../utils/format";

const EMPTY_FORM = { title: "", body: "", pinned: false };

const AnnouncementsCard = () => {
  const { user } = useAuth();
  const notify = useSnackbar();
  const canPost = ["HR", "Admin"].includes(user?.role);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const load = useCallback(async () => {
    try {
      setItems(await listAnnouncements());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handlePost = async () => {
    setSaving(true);
    try {
      await createAnnouncement(form);
      notify("Announcement posted");
      setDialogOpen(false);
      setForm(EMPTY_FORM);
      await load();
    } catch (err) {
      notify(err.response?.data?.message || "Could not post announcement", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAnnouncement(toDelete._id);
      notify("Announcement deleted");
      await load();
    } catch (err) {
      notify(err.response?.data?.message || "Could not delete announcement", "error");
    } finally {
      setToDelete(null);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Megaphone size={18} color="#2563eb" />
          <Typography variant="subtitle1" fontWeight={700}>Announcements</Typography>
        </Box>
        {canPost && (
          <Button size="small" onClick={() => setDialogOpen(true)}>Post</Button>
        )}
      </Box>

      {loading ? (
        <CardSkeleton height={160} />
      ) : items.length === 0 ? (
        <EmptyState icon={Megaphone} title="No announcements" description="Company news will show up here." />
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75, maxHeight: 280, overflowY: "auto", pr: 0.5 }}>
          {items.map((a) => (
            <Box key={a._id} sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  {a.pinned && <Pin size={13} color="#f59e0b" />}
                  <Typography variant="body2" fontWeight={700}>{a.title}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, wordBreak: "break-word" }}>
                  {a.body}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {a.author?.name || "HR"} · {timeAgo(a.createdAt)}
                </Typography>
              </Box>
              {canPost && (
                <IconButton size="small" onClick={() => setToDelete(a)} aria-label="Delete announcement">
                  <Trash2 size={15} />
                </IconButton>
              )}
            </Box>
          ))}
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={saving ? undefined : () => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Post an announcement</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "8px !important" }}>
          <TextField
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value.slice(0, 120) })}
            fullWidth
          />
          <TextField
            label="Message"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value.slice(0, 1000) })}
            multiline
            minRows={4}
            fullWidth
            helperText={`${form.body.length}/1000`}
          />
          <FormControlLabel
            control={<Switch checked={form.pinned} onChange={(e) => setForm({ ...form, pinned: e.target.checked })} />}
            label="Pin to the top"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button color="inherit" onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={handlePost} disabled={saving || !form.title.trim() || !form.body.trim()}>
            {saving ? "Posting..." : "Post"}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete announcement?"
        message={toDelete ? `"${toDelete.title}" will be removed for everyone.` : ""}
        confirmLabel="Delete"
        confirmColor="error"
        onConfirm={handleDelete}
        onClose={() => setToDelete(null)}
      />
    </Paper>
  );
};

export default AnnouncementsCard;
