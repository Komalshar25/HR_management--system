import { useState, useMemo, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Alert from "@mui/material/Alert";
import TablePagination from "@mui/material/TablePagination";
import { Search, Plus, LayoutGrid, List as ListIcon, Users } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEmployees } from "../../hooks/useEmployees";
import { useAuth } from "../../context/AuthContext";
import { createUser } from "../../api/users";
import DataTable from "../../components/common/DataTable";
import InitialsAvatar from "../../components/common/InitialsAvatar";
import StatusChip from "../../components/common/StatusChip";
import { useSnackbar } from "../../components/common/SnackbarProvider";
import { TableSkeleton } from "../../components/common/LoadingSkeleton";

const ROLES = ["Employee", "Manager", "HR", "Admin"];

const AddEmployeeDialog = ({ open, onClose, onCreated }) => {
  const notify = useSnackbar();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Employee", department: "", designation: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createUser(form);
      notify(`${form.name} added successfully`);
      setForm({ name: "", email: "", password: "", role: "Employee", department: "", designation: "" });
      onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ fontWeight: 700 }}>Add Employee</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Full Name" required fullWidth value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField label="Email" type="email" required fullWidth value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <TextField label="Temporary Password" type="password" required fullWidth value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} fullWidth>
            {ROLES.map((r) => (
              <MenuItem key={r} value={r}>{r}</MenuItem>
            ))}
          </Select>
          <TextField label="Department" fullWidth value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Engineering" />
          <TextField label="Designation" fullWidth value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} placeholder="Software Developer" />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} color="inherit">Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>Add Employee</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const Employees = () => {
  const { user } = useAuth();
  const canAdd = ["HR", "Admin"].includes(user?.role);
  const { employees, loading, refetch } = useEmployees();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [role, setRole] = useState("all");
  const [sort, setSort] = useState("name");
  const [view, setView] = useState("table");
  const [addOpen, setAddOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  useEffect(() => {
    if (canAdd && searchParams.get("action") === "add") {
      setAddOpen(true);
      searchParams.delete("action");
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const departments = useMemo(
    () => Array.from(new Set(employees.map((e) => e.department).filter(Boolean))),
    [employees]
  );

  const filtered = useMemo(() => {
    let list = employees;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) => e.name?.toLowerCase().includes(q) || e.email?.toLowerCase().includes(q) || e.employeeId?.toLowerCase().includes(q)
      );
    }
    if (department !== "all") list = list.filter((e) => e.department === department);
    if (role !== "all") list = list.filter((e) => e.role === role);
    return [...list].sort((a, b) => (a[sort] || "").localeCompare(b[sort] || ""));
  }, [employees, search, department, role, sort]);

  useEffect(() => {
    setPage(0);
  }, [search, department, role, sort, view]);

  const paginated = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage]
  );

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Employees</Typography>
          <Typography variant="body2" color="text.secondary">Manage and view your organization's workforce.</Typography>
        </Box>
        {canAdd && (
          <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => setAddOpen(true)}>
            Add Employee
          </Button>
        )}
      </Box>

      <Paper sx={{ p: 2, mb: 2.5, display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
        <TextField
          size="small"
          placeholder="Search by name, email, or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flex: 1, minWidth: 220 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><Search size={16} /></InputAdornment> }}
        />
        <Select size="small" value={department} onChange={(e) => setDepartment(e.target.value)} sx={{ minWidth: 160 }}>
          <MenuItem value="all">All Departments</MenuItem>
          {departments.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
        </Select>
        <Select size="small" value={role} onChange={(e) => setRole(e.target.value)} sx={{ minWidth: 140 }}>
          <MenuItem value="all">All Roles</MenuItem>
          {ROLES.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
        </Select>
        <Select size="small" value={sort} onChange={(e) => setSort(e.target.value)} sx={{ minWidth: 140 }}>
          <MenuItem value="name">Sort: Name</MenuItem>
          <MenuItem value="department">Sort: Department</MenuItem>
          <MenuItem value="role">Sort: Role</MenuItem>
        </Select>
        <ToggleButtonGroup size="small" exclusive value={view} onChange={(e, v) => v && setView(v)}>
          <ToggleButton value="table"><ListIcon size={16} /></ToggleButton>
          <ToggleButton value="grid"><LayoutGrid size={16} /></ToggleButton>
        </ToggleButtonGroup>
      </Paper>

      {loading ? (
        <TableSkeleton rows={6} cols={6} />
      ) : view === "table" ? (
        <>
          <DataTable
            rows={paginated}
            emptyTitle="No employees found"
            emptyDescription="Try adjusting your search or filters."
            emptyIcon={Users}
            onRowClick={(row) => navigate(`/employees/${row._id}`)}
            columns={[
              { key: "employee", label: "Employee", render: (r) => (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                  <InitialsAvatar name={r.name} size={32} />
                  <Box>
                    <Typography variant="body2" fontWeight={600}>{r.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{r.designation}</Typography>
                  </Box>
                </Box>
              ) },
              { key: "employeeId", label: "Employee ID" },
              { key: "department", label: "Department" },
              { key: "role", label: "Role" },
              { key: "email", label: "Email" },
              { key: "status", label: "Status", render: () => <StatusChip status="Active" /> },
            ]}
          />
          {filtered.length > 0 && (
            <TablePagination
              component={Paper}
              sx={{ mt: 1.5 }}
              count={filtered.length}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              rowsPerPageOptions={[25, 50, 100]}
            />
          )}
        </>
      ) : filtered.length === 0 ? (
        <Paper><Box sx={{ p: 4 }}><Typography align="center" color="text.secondary">No employees found</Typography></Box></Paper>
      ) : (
        <>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))" }, gap: 2 }}>
          {paginated.map((emp) => (
            <Paper
              key={emp._id}
              onClick={() => navigate(`/employees/${emp._id}`)}
              sx={{ p: 2.5, cursor: "pointer", transition: "transform 150ms ease", "&:hover": { transform: "translateY(-2px)" } }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                <InitialsAvatar name={emp.name} size={44} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography fontWeight={700} noWrap>{emp.name}</Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>{emp.designation}</Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary" display="block">{emp.employeeId} · {emp.department}</Typography>
              <Box sx={{ mt: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <StatusChip status="Active" />
                <Typography variant="caption" color="text.secondary">{emp.role}</Typography>
              </Box>
            </Paper>
          ))}
        </Box>
        <TablePagination
          component={Paper}
          sx={{ mt: 1.5 }}
          count={filtered.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[25, 50, 100]}
        />
        </>
      )}

      <AddEmployeeDialog open={addOpen} onClose={() => setAddOpen(false)} onCreated={refetch} />
    </Box>
  );
};

export default Employees;
