import { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import TablePagination from "@mui/material/TablePagination";
import { Plus, ShieldCheck, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useEmployees } from "../../hooks/useEmployees";
import { updateUserRole } from "../../api/users";
import { useSnackbar } from "../../components/common/SnackbarProvider";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import DataTable from "../../components/common/DataTable";
import InitialsAvatar from "../../components/common/InitialsAvatar";
import StatusChip from "../../components/common/StatusChip";
import { TableSkeleton } from "../../components/common/LoadingSkeleton";

const ROLES = ["Employee", "Manager", "HR", "Admin"];

const Administration = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";
  const { employees, loading, refetch } = useEmployees();
  const notify = useSnackbar();
  const navigate = useNavigate();
  const [pendingChange, setPendingChange] = useState(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((e) =>
      [e.name, e.email, e.department, e.role, e.employeeId].some((v) => v && String(v).toLowerCase().includes(q))
    );
  }, [employees, query]);

  const pageRows = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage]
  );

  const handleRoleChange = (emp, role) => {
    if (role === emp.role) return;
    setPendingChange({ emp, role });
  };

  const confirmChange = async () => {
    const { emp, role } = pendingChange;
    try {
      await updateUserRole(emp._id, role);
      notify(`${emp.name}'s role updated to ${role}`);
      refetch();
    } catch (err) {
      notify(err.response?.data?.message || "Failed to update role", "error");
    } finally {
      setPendingChange(null);
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Administration</Typography>
          <Typography variant="body2" color="text.secondary">
            {isAdmin ? "Manage employee roles and system access." : "Organization roster overview."}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => navigate("/employees?action=add")}>
          Add Employee
        </Button>
      </Box>

      <TextField
        size="small"
        placeholder="Search by name, email, department or role"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setPage(0); }}
        sx={{ mb: 2, width: { xs: "100%", sm: 380 } }}
        slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment> } }}
      />

      {loading ? (
        <TableSkeleton rows={6} cols={5} />
      ) : (
        <>
        <DataTable
          rows={pageRows}
          emptyTitle="No employees"
          emptyIcon={ShieldCheck}
          columns={[
            { key: "employee", label: "Employee", render: (r) => (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                <InitialsAvatar name={r.name} size={30} />
                <Typography variant="body2" fontWeight={600}>{r.name}</Typography>
              </Box>
            ) },
            { key: "email", label: "Email" },
            { key: "department", label: "Department" },
            { key: "role", label: "Role", render: (r) =>
              isAdmin ? (
                <Select
                  size="small"
                  value={r.role}
                  onChange={(e) => handleRoleChange(r, e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  sx={{ minWidth: 130 }}
                >
                  {ROLES.map((role) => <MenuItem key={role} value={role}>{role}</MenuItem>)}
                </Select>
              ) : (
                <StatusChip status={r.role} />
              )
            },
          ]}
        />
        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(e, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[10, 25, 50]}
        />
        </>
      )}

      {pendingChange && (
        <ConfirmDialog
          open={!!pendingChange}
          title="Change role?"
          message={`Change ${pendingChange.emp.name}'s role from ${pendingChange.emp.role} to ${pendingChange.role}?`}
          confirmLabel="Change Role"
          onClose={() => setPendingChange(null)}
          onConfirm={confirmChange}
        />
      )}
    </Box>
  );
};

export default Administration;
