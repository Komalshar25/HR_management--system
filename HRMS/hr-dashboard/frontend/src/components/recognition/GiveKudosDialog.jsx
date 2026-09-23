import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { useAuth } from "../../context/AuthContext";
import { useSnackbar } from "../common/SnackbarProvider";
import InitialsAvatar from "../common/InitialsAvatar";
import { searchUsers } from "../../api/users";
import { giveKudos } from "../../api/recognition";
import { BADGES, BADGE_NAMES } from "./badges";

const MAX_LENGTH = 280;

const GiveKudosDialog = ({ open, onClose, onGiven, presetUser = null }) => {
  const { user } = useAuth();
  const notify = useSnackbar();
  const [recipient, setRecipient] = useState(presetUser);
  const [badge, setBadge] = useState("Team Player");
  const [message, setMessage] = useState("");
  const [input, setInput] = useState("");
  const [options, setOptions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (open) {
      setRecipient(presetUser);
      setBadge("Team Player");
      setMessage("");
      setInput("");
      setOptions([]);
    }
  }, [open, presetUser]);

  useEffect(() => {
    if (!open || presetUser || input.trim().length < 2) {
      setOptions([]);
      return undefined;
    }
    let cancelled = false;
    setSearching(true);
    const timer = setTimeout(() => {
      searchUsers(input.trim())
        .then((rows) => {
          if (!cancelled) setOptions(rows.filter((r) => r._id !== user?._id && r._id !== user?.id));
        })
        .catch(() => {
          if (!cancelled) setOptions([]);
        })
        .finally(() => {
          if (!cancelled) setSearching(false);
        });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [input, open, presetUser, user]);

  const canSend = recipient && message.trim().length > 0 && !sending;

  const handleSend = async () => {
    setSending(true);
    try {
      const kudos = await giveKudos({ to: recipient._id, badge, message: message.trim() });
      notify(`Kudos sent to ${recipient.name}`);
      onGiven?.(kudos);
      onClose();
    } catch (err) {
      notify(err.response?.data?.message || "Could not send kudos", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onClose={sending ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Give kudos</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "8px !important" }}>
        <Autocomplete
          value={recipient}
          onChange={(e, v) => setRecipient(v)}
          inputValue={recipient ? recipient.name : input}
          onInputChange={(e, v, reason) => {
            if (reason === "input") setInput(v);
            if (reason === "clear") setInput("");
          }}
          options={options}
          loading={searching}
          disabled={Boolean(presetUser)}
          filterOptions={(x) => x}
          isOptionEqualToValue={(a, b) => a._id === b._id}
          getOptionLabel={(o) => o.name || ""}
          noOptionsText={input.trim().length < 2 ? "Type at least 2 letters" : "No colleagues found"}
          renderOption={(props, o) => (
            <Box component="li" {...props} key={o._id} sx={{ display: "flex", gap: 1.5 }}>
              <InitialsAvatar name={o.name} size={30} />
              <Box>
                <Typography variant="body2" fontWeight={600}>{o.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {o.employeeId} · {o.department}
                </Typography>
              </Box>
            </Box>
          )}
          renderInput={(params) => <TextField {...params} label="Who do you want to recognise?" placeholder="Search by name or employee ID" />}
        />

        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
            Badge
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {BADGE_NAMES.map((name) => {
              const { icon: Icon, color } = BADGES[name];
              const selected = badge === name;
              return (
                <Chip
                  key={name}
                  label={name}
                  icon={<Icon size={15} color={selected ? "#fff" : color} />}
                  onClick={() => setBadge(name)}
                  sx={{
                    fontWeight: 600,
                    bgcolor: selected ? color : "transparent",
                    color: selected ? "#fff" : "text.primary",
                    border: `1px solid ${selected ? color : "rgba(128,128,128,0.3)"}`,
                    "&:hover": { bgcolor: selected ? color : "action.hover" },
                    "& .MuiChip-icon": { ml: 1 },
                  }}
                />
              );
            })}
          </Box>
        </Box>

        <TextField
          label="Message"
          placeholder="What did they do that deserves recognition?"
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, MAX_LENGTH))}
          multiline
          minRows={3}
          helperText={`${message.length}/${MAX_LENGTH}`}
          FormHelperTextProps={{ sx: { textAlign: "right" } }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} color="inherit" disabled={sending}>Cancel</Button>
        <Button variant="contained" onClick={handleSend} disabled={!canSend}>
          {sending ? "Sending..." : "Send kudos"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GiveKudosDialog;
