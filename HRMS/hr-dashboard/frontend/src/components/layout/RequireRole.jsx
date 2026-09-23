import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const RequireRole = ({ roles, children }) => {
  const { user } = useAuth();
  if (!roles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

export default RequireRole;
