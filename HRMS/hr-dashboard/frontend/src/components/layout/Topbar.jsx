import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import { Search, Bell, Plus, Menu as MenuIconGlyph } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import InitialsAvatar from "../common/InitialsAvatar";
import { useLeave } from "../../hooks/useLeave";
import EmptyState from "../common/EmptyState";
import ThemeToggle from "../common/ThemeToggle";

const QUICK_ACTIONS = {
  HR: { label: "Add Employee", path: "/employees?action=add" },
  Admin: { label: "Add Employee", path: "/employees?action=add" },
  Manager: { label: "Apply Leave", path: "/leave?action=apply" },
  Employee: { label: "Apply Leave", path: "/leave?action=apply" },
};

const Topbar = ({ title, onOpenSearch, onLogoutRequest, onOpenNav }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pendingLeaves, isManager } = useLeave();
  const [notifAnchor, setNotifAnchor] = useState(null);
  const [avatarAnchor, setAvatarAnchor] = useState(null);

  const quickAction = QUICK_ACTIONS[user?.role] || QUICK_ACTIONS.Employee;

  return (
    <Box
      sx={{
        height: 64,
        px: { xs: 1.5, sm: 3 },
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        bgcolor: "background.paper",
        borderBottom: "1px solid rgba(128,128,128,0.25)",
        position: "sticky",
        top: 0,
        zIndex: 10,
        gap: 1,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
        {onOpenNav && (
          <IconButton size="small" onClick={onOpenNav}>
            <MenuIconGlyph size={20} />
          </IconButton>
        )}
        <Typography variant="h6" noWrap sx={{ fontWeight: 700, fontSize: "1.05rem" }}>
          {title}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 1.5 } }}>
        <IconButton size="small" onClick={onOpenSearch} sx={{ display: { xs: "inline-flex", sm: "none" } }}>
          <Search size={18} />
        </IconButton>
        <Box
          onClick={onOpenSearch}
          sx={{
            display: { xs: "none", sm: "flex" },
            alignItems: "center",
            gap: 1,
            px: 1.75,
            py: 0.9,
            borderRadius: "10px",
            border: "1px solid rgba(128,128,128,0.25)",
            bgcolor: "action.hover",
            cursor: "pointer",
            width: { sm: 180, md: 260 },
            color: "text.secondary",
            transition: "border-color 150ms ease",
            "&:hover": { borderColor: "primary.main" },
          }}
        >
          <Search size={16} />
          <Typography variant="body2" sx={{ flex: 1 }}>
            Search...
          </Typography>
          <Typography variant="caption" sx={{ border: "1px solid rgba(128,128,128,0.25)", px: 0.6, borderRadius: "5px" }}>
            ⌘K
          </Typography>
        </Box>

        <ThemeToggle />

        {isManager && (
          <>
            <IconButton size="small" onClick={(e) => setNotifAnchor(e.currentTarget)}>
              <Badge badgeContent={pendingLeaves.length} color="error">
                <Bell size={19} color="#94a3b8" />
              </Badge>
            </IconButton>
            <Menu anchorEl={notifAnchor} open={Boolean(notifAnchor)} onClose={() => setNotifAnchor(null)} slotProps={{ paper: { sx: { width: 320, mt: 1 } } }}>
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2" fontWeight={700}>
                  Pending Approvals
                </Typography>
              </Box>
              <Divider />
              {pendingLeaves.length === 0 ? (
                <EmptyState title="All caught up" description="No pending leave requests." sx={{ py: 3 }} />
              ) : (
                pendingLeaves.slice(0, 5).map((leave) => (
                  <MenuItem
                    key={leave._id}
                    onClick={() => {
                      setNotifAnchor(null);
                      navigate("/leave");
                    }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        {leave.user?.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {leave.leaveType} · {new Date(leave.startDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))
              )}
            </Menu>
          </>
        )}

        <IconButton
          size="small"
          onClick={() => navigate(quickAction.path)}
          sx={{ display: { xs: "inline-flex", sm: "none" }, bgcolor: "primary.main", color: "#fff", "&:hover": { bgcolor: "primary.dark" } }}
        >
          <Plus size={18} />
        </IconButton>
        <Button
          variant="contained"
          size="small"
          startIcon={<Plus size={16} />}
          onClick={() => navigate(quickAction.path)}
          sx={{ py: 0.9, display: { xs: "none", sm: "inline-flex" }, whiteSpace: "nowrap" }}
        >
          {quickAction.label}
        </Button>

        <IconButton size="small" onClick={(e) => setAvatarAnchor(e.currentTarget)}>
          <InitialsAvatar name={user?.name} size={36} />
        </IconButton>
        <Menu anchorEl={avatarAnchor} open={Boolean(avatarAnchor)} onClose={() => setAvatarAnchor(null)} slotProps={{ paper: { sx: { mt: 1, width: 220 } } }}>
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="body2" fontWeight={700}>
              {user?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
          <Divider />
          <MenuItem
            onClick={() => {
              setAvatarAnchor(null);
              navigate("/settings");
            }}
          >
            Settings
          </MenuItem>
          <MenuItem
            onClick={() => {
              setAvatarAnchor(null);
              onLogoutRequest();
            }}
            sx={{ color: "error.main" }}
          >
            Logout
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default Topbar;
