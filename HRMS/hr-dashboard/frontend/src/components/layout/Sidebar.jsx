import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Divider from "@mui/material/Divider";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useNavigate, useLocation } from "react-router-dom";
import { LayoutGrid, LogOut, PanelLeftClose, PanelLeftOpen, ChevronDown, Headset } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import InitialsAvatar from "../common/InitialsAvatar";
import { navForRole, adminNavForRole } from "./navConfig";

const Sidebar = ({ collapsed: collapsedProp, onToggle, onLogoutRequest, mobile = false, onNavigate }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const collapsed = mobile ? false : collapsedProp;
  const [profileAnchor, setProfileAnchor] = useState(null);

  const items = navForRole(user?.role);
  const adminItems = adminNavForRole(user?.role);

  const go = (path) => {
    navigate(path);
    if (mobile) onNavigate?.();
  };

  const NavButton = ({ item }) => {
    const active = location.pathname === item.path || location.pathname.startsWith(item.path + "/");
    const Icon = item.icon;
    const button = (
      <Box
        onClick={() => go(item.path)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: collapsed ? 0 : 1.75,
          py: 1.25,
          mx: 1,
          borderRadius: "10px",
          cursor: "pointer",
          justifyContent: collapsed ? "center" : "flex-start",
          color: active ? "#ffffff" : "#94a3b8",
          bgcolor: active ? "rgba(37,99,235,0.9)" : "transparent",
          transition: "background-color 150ms ease, color 150ms ease",
          "&:hover": {
            bgcolor: active ? "rgba(37,99,235,0.9)" : "rgba(255,255,255,0.06)",
            color: "#ffffff",
          },
        }}
      >
        <Icon size={19} strokeWidth={2} />
        {!collapsed && (
          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
            {item.label}
          </Typography>
        )}
      </Box>
    );
    return collapsed ? (
      <Tooltip title={item.label} placement="right" key={item.path}>
        {button}
      </Tooltip>
    ) : (
      <Box key={item.path}>{button}</Box>
    );
  };

  return (
    <Box
      sx={{
        width: collapsed ? 76 : 260,
        flexShrink: 0,
        bgcolor: "#0f172a",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        transition: mobile ? "none" : "width 200ms ease",
        height: mobile ? "100%" : "100vh",
        position: mobile ? "static" : "sticky",
        top: 0,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          px: collapsed ? 0 : 2,
          height: 64,
          flexShrink: 0,
        }}
      >
        {!collapsed && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: "8px",
                bgcolor: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LayoutGrid size={16} color="#fff" />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: "0.95rem" }}>HRMS</Typography>
          </Box>
        )}
        {!mobile && (
          <Box
            onClick={onToggle}
            sx={{
              cursor: "pointer",
              color: "#94a3b8",
              display: "flex",
              alignItems: "center",
              "&:hover": { color: "#fff" },
            }}
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </Box>
        )}
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

      <Box
        onClick={(e) => setProfileAnchor(e.currentTarget)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          px: collapsed ? 1 : 2,
          py: 1.75,
          cursor: "pointer",
          justifyContent: collapsed ? "center" : "flex-start",
          "&:hover": { bgcolor: "rgba(255,255,255,0.04)" },
        }}
      >
        <InitialsAvatar name={user?.name} size={collapsed ? 34 : 38} />
        {!collapsed && (
          <>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography noWrap sx={{ fontWeight: 700, fontSize: "0.85rem", color: "#fff" }}>
                {user?.name}
              </Typography>
              <Typography noWrap sx={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                {user?.role}
              </Typography>
            </Box>
            <ChevronDown size={16} color="#64748b" />
          </>
        )}
      </Box>
      <Menu anchorEl={profileAnchor} open={Boolean(profileAnchor)} onClose={() => setProfileAnchor(null)} slotProps={{ paper: { sx: { mt: 1, width: 200 } } }}>
        <MenuItem onClick={() => { setProfileAnchor(null); go("/settings"); }}>Settings</MenuItem>
        <MenuItem
          onClick={() => {
            setProfileAnchor(null);
            onLogoutRequest();
          }}
          sx={{ color: "error.main" }}
        >
          Logout
        </MenuItem>
      </Menu>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", py: 1.5, display: "flex", flexDirection: "column", gap: 0.5 }}>
        {items.map((item) => (
          <NavButton item={item} key={item.path} />
        ))}

        {adminItems.length > 0 && (
          <>
            <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", my: 1.5, mx: 2 }} />
            {!collapsed && (
              <Typography
                variant="caption"
                sx={{ px: 2.75, color: "#64748b", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", fontSize: "0.7rem" }}
              >
                Administration
              </Typography>
            )}
            <Box sx={{ mt: 0.5, display: "flex", flexDirection: "column", gap: 0.5 }}>
              {adminItems.map((item) => (
                <NavButton item={item} key={item.path} />
              ))}
            </Box>
          </>
        )}
      </Box>

      {!collapsed && !mobile && (
        <Box sx={{ mx: 1.5, mb: 1.5, p: 1.5, borderRadius: "12px", bgcolor: "rgba(255,255,255,0.04)", display: "flex", gap: 1.25 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              bgcolor: "rgba(37,99,235,0.15)",
              color: "#60a5fa",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Headset size={16} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "#fff" }}>Need Help?</Typography>
            <Typography sx={{ fontSize: "0.72rem", color: "#94a3b8", lineHeight: 1.4 }}>
              Contact HR or visit Help Center
            </Typography>
          </Box>
        </Box>
      )}

      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

      <Box
        onClick={onLogoutRequest}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: collapsed ? 0 : 2,
          py: 1.75,
          justifyContent: collapsed ? "center" : "flex-start",
          cursor: "pointer",
          color: "#94a3b8",
          "&:hover": { color: "#ef4444" },
        }}
      >
        <LogOut size={18} />
        {!collapsed && (
          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
            Logout
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default Sidebar;
