import { useMemo } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import { Network } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEmployees } from "../../hooks/useEmployees";
import InitialsAvatar from "../../components/common/InitialsAvatar";
import EmptyState from "../../components/common/EmptyState";
import { TableSkeleton } from "../../components/common/LoadingSkeleton";

const MAX_VISIBLE_MEMBERS = 15;

const Teams = () => {
  const { employees, loading } = useEmployees();
  const navigate = useNavigate();

  const groups = useMemo(() => {
    const map = new Map();
    for (const e of employees) {
      const dept = e.department || "Unassigned";
      if (!map.has(dept)) map.set(dept, []);
      map.get(dept).push(e);
    }
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [employees]);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Teams</Typography>
        <Typography variant="body2" color="text.secondary">Your organization grouped by department.</Typography>
      </Box>

      {loading ? (
        <TableSkeleton rows={4} cols={3} />
      ) : groups.length === 0 ? (
        <Paper><EmptyState icon={Network} title="No teams yet" description="Add employees to see them grouped here." /></Paper>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
          {groups.map(([dept, members]) => (
            <Paper key={dept} sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={700}>{dept}</Typography>
                <Chip label={`${members.length} member${members.length !== 1 ? "s" : ""}`} size="small" />
              </Box>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))" }, gap: 1.5 }}>
                {members.slice(0, MAX_VISIBLE_MEMBERS).map((m) => (
                  <Box
                    key={m._id}
                    onClick={() => navigate(`/employees/${m._id}`)}
                    sx={{
                      display: "flex", alignItems: "center", gap: 1.25, p: 1.25,
                      borderRadius: "10px", border: "1px solid rgba(128,128,128,0.15)", cursor: "pointer",
                      transition: "background-color 150ms ease", "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    <InitialsAvatar name={m.name} size={34} />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600} noWrap>{m.name}</Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>{m.designation}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
              {members.length > MAX_VISIBLE_MEMBERS && (
                <Typography
                  variant="body2"
                  color="primary"
                  onClick={() => navigate("/employees")}
                  sx={{ mt: 1.5, cursor: "pointer", fontWeight: 600 }}
                >
                  +{members.length - MAX_VISIBLE_MEMBERS} more — view all in Employees
                </Typography>
              )}
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Teams;
