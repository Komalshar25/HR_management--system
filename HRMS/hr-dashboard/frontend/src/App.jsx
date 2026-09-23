import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import LandingPage from "./pages/LandingPage";
import ErrorBoundary from "./components/ErrorBoundary";
import AppShell from "./components/layout/AppShell";
import RequireRole from "./components/layout/RequireRole";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import EmployeeProfile from "./pages/EmployeeProfile";
import Attendance from "./pages/Attendance";
import LeaveManagement from "./pages/LeaveManagement";
import Analytics from "./pages/Analytics";
import Teams from "./pages/Teams";
import Settings from "./pages/Settings";
import Administration from "./pages/Settings/Administration";
import Timesheet from "./pages/Timesheet";
import MyRequests from "./pages/Requests";
import Payroll from "./pages/Payroll";
import Performance from "./pages/Performance";
import Recruitment from "./pages/Recruitment";

const MANAGER_ROLES = ["Manager", "HR", "Admin"];

function App() {
  const { user } = useAuth();

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <Signup />} />

        <Route element={user ? <AppShell /> : <Navigate to="/login" replace />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/employees"
            element={
              <RequireRole roles={MANAGER_ROLES}>
                <Employees />
              </RequireRole>
            }
          />
          <Route
            path="/employees/:id"
            element={
              <RequireRole roles={MANAGER_ROLES}>
                <EmployeeProfile />
              </RequireRole>
            }
          />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/leave" element={<LeaveManagement />} />
          <Route path="/timesheet" element={<Timesheet />} />
          <Route path="/requests" element={<MyRequests />} />
          <Route path="/payroll" element={<Payroll />} />
          <Route path="/performance" element={<Performance />} />
          <Route
            path="/recruitment"
            element={
              <RequireRole roles={MANAGER_ROLES}>
                <Recruitment />
              </RequireRole>
            }
          />
          <Route
            path="/analytics"
            element={
              <RequireRole roles={MANAGER_ROLES}>
                <Analytics />
              </RequireRole>
            }
          />
          <Route
            path="/teams"
            element={
              <RequireRole roles={MANAGER_ROLES}>
                <Teams />
              </RequireRole>
            }
          />
          <Route path="/settings" element={<Settings />} />
          <Route
            path="/settings/administration"
            element={
              <RequireRole roles={["HR", "Admin"]}>
                <Administration />
              </RequireRole>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
