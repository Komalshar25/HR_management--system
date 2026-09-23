import { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import CommandPalette from "./CommandPalette";
import { useAuth } from "../../context/AuthContext";
import ConfirmDialog from "../common/ConfirmDialog";
import { NAV_ITEMS, ADMIN_NAV_ITEMS } from "./navConfig";
import pageIllustration from "../../assets/page-illustration.png";

const titleFor = (pathname) => {
  if (pathname.startsWith("/employees/")) return "Employee Profile";
  const all = [...NAV_ITEMS, ...ADMIN_NAV_ITEMS];
  const match = all.find((i) => pathname === i.path || pathname.startsWith(i.path + "/"));
  return match?.label || "Dashboard";
};

const AppShell = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("sidebarCollapsed") === "1");
  const [searchOpen, setSearchOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  const handleKeyDown = useCallback((e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      setSearchOpen(true);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ "& .MuiDrawer-paper": { width: 260, boxSizing: "border-box", border: "none" } }}
        >
          <Sidebar mobile onNavigate={() => setMobileNavOpen(false)} onLogoutRequest={() => { setMobileNavOpen(false); setLogoutOpen(true); }} />
        </Drawer>
      ) : (
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} onLogoutRequest={() => setLogoutOpen(true)} />
      )}

      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", position: "relative", zIndex: 0 }}>
        <Box
          aria-hidden
          sx={{
            position: "sticky",
            top: 0,
            height: "100vh",
            mb: "-100vh",
            zIndex: -1,
            pointerEvents: "none",
            backgroundImage: `url(${pageIllustration})`,
            backgroundSize: "100% auto",
            backgroundPosition: "center bottom",
            backgroundRepeat: "no-repeat",
            opacity: theme.palette.mode === "dark" ? 0.3 : 0.9,
          }}
        />
        <Topbar
          title={titleFor(location.pathname)}
          onOpenSearch={() => setSearchOpen(true)}
          onLogoutRequest={() => setLogoutOpen(true)}
          onOpenNav={isMobile ? () => setMobileNavOpen(true) : undefined}
        />
        <Box sx={{ flex: 1, p: { xs: 1.5, sm: 3 }, minWidth: 0 }}>
          <Outlet />
        </Box>
      </Box>

      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />

      <ConfirmDialog
        open={logoutOpen}
        title="Logout"
        message="Are you sure you want to log out?"
        confirmLabel="Logout"
        confirmColor="error"
        onClose={() => setLogoutOpen(false)}
        onConfirm={() => {
          setLogoutOpen(false);
          logout();
          navigate("/login");
        }}
      />
    </Box>
  );
};

export default AppShell;
