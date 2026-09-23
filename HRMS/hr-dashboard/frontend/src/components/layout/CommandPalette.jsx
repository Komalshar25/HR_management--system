import { useState, useEffect, useMemo, useRef } from "react";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import InputBase from "@mui/material/InputBase";
import Typography from "@mui/material/Typography";
import { Search, ArrowRight, User as UserIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useEmployees } from "../../hooks/useEmployees";
import InitialsAvatar from "../common/InitialsAvatar";
import { navForRole } from "./navConfig";

const PEOPLE_SEARCH_ROLES = ["Manager", "HR", "Admin"];

const CommandPalette = ({ open, onClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const canSearchPeople = PEOPLE_SEARCH_ROLES.includes(user?.role);
  const { employees } = useEmployees();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const pageResults = useMemo(() => {
    const items = navForRole(user?.role);
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter((i) => i.label.toLowerCase().includes(q));
  }, [query, user]);

  const peopleResults = useMemo(() => {
    if (!canSearchPeople || !query) return [];
    const q = query.toLowerCase();
    return employees
      .filter(
        (e) =>
          e.name?.toLowerCase().includes(q) ||
          e.email?.toLowerCase().includes(q) ||
          e.employeeId?.toLowerCase().includes(q) ||
          e.department?.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [query, employees, canSearchPeople]);

  const flatResults = useMemo(
    () => [
      ...pageResults.map((p) => ({ type: "page", ...p })),
      ...peopleResults.map((p) => ({ type: "person", ...p })),
    ],
    [pageResults, peopleResults]
  );

  const go = (item) => {
    if (item.type === "page") navigate(item.path);
    else navigate(`/employees/${item._id}`);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (flatResults[activeIndex]) go(flatResults[activeIndex]);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: "14px", overflow: "hidden" } } }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2.5, py: 1.75, borderBottom: "1px solid rgba(128,128,128,0.25)" }}>
        <Search size={18} color="#94a3b8" />
        <InputBase
          inputRef={inputRef}
          fullWidth
          placeholder={canSearchPeople ? "Search employees or jump to a page..." : "Search pages..."}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={handleKeyDown}
          sx={{ fontSize: "0.95rem" }}
        />
        <Typography variant="caption" sx={{ color: "#94a3b8", border: "1px solid rgba(128,128,128,0.25)", px: 0.8, py: 0.2, borderRadius: "6px" }}>
          Esc
        </Typography>
      </Box>

      <Box sx={{ maxHeight: 400, overflowY: "auto", py: 1 }}>
        {peopleResults.length > 0 && (
          <Box sx={{ px: 2, pt: 1, pb: 0.5 }}>
            <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              People
            </Typography>
          </Box>
        )}
        {peopleResults.map((person, idx) => {
          const globalIdx = pageResults.length + idx;
          return (
            <Box
              key={person._id}
              onClick={() => go({ type: "person", ...person })}
              onMouseEnter={() => setActiveIndex(globalIdx)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                px: 2.5,
                py: 1,
                cursor: "pointer",
                bgcolor: activeIndex === globalIdx ? "rgba(37,99,235,0.08)" : "transparent",
              }}
            >
              <InitialsAvatar name={person.name} size={30} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600} noWrap>
                  {person.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {person.designation} · {person.department}
                </Typography>
              </Box>
              <ArrowRight size={15} color="#94a3b8" />
            </Box>
          );
        })}

        {pageResults.length > 0 && (
          <Box sx={{ px: 2, pt: peopleResults.length ? 1.5 : 1, pb: 0.5 }}>
            <Typography variant="caption" sx={{ color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Pages
            </Typography>
          </Box>
        )}
        {pageResults.map((item, idx) => {
          const Icon = item.icon;
          return (
            <Box
              key={item.path}
              onClick={() => go({ type: "page", ...item })}
              onMouseEnter={() => setActiveIndex(idx)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                px: 2.5,
                py: 1,
                cursor: "pointer",
                bgcolor: activeIndex === idx ? "rgba(37,99,235,0.08)" : "transparent",
              }}
            >
              <Icon size={17} color="#94a3b8" />
              <Typography variant="body2" fontWeight={600}>
                {item.label}
              </Typography>
            </Box>
          );
        })}

        {query && flatResults.length === 0 && (
          <Box sx={{ px: 2.5, py: 4, textAlign: "center" }}>
            <UserIcon size={22} color="#cbd5e1" style={{ marginBottom: 8 }} />
            <Typography variant="body2" color="text.secondary">
              No results for "{query}"
            </Typography>
          </Box>
        )}
      </Box>
    </Dialog>
  );
};

export default CommandPalette;
