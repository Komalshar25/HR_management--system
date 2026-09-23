import { useState, useEffect, useCallback } from "react";
import {
  getMyLeaves,
  getPendingLeaves,
  requestLeave as apiRequestLeave,
  updateLeaveStatus as apiUpdateLeaveStatus,
} from "../api/leave";
import { useAuth } from "../context/AuthContext";

const MANAGER_ROLES = ["Manager", "HR", "Admin"];

export const useLeave = () => {
  const { user } = useAuth();
  const isManager = MANAGER_ROLES.includes(user?.role);

  const [myLeaves, setMyLeaves] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const my = await getMyLeaves();
      setMyLeaves(my);
      if (isManager) {
        const pending = await getPendingLeaves();
        setPendingLeaves(pending);
      }
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [isManager]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const submitLeave = async (data) => {
    try {
      await apiRequestLeave(data);
      await refetch();
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.response?.data?.message || "Failed to submit request" };
    }
  };

  const actOnLeave = async (id, status) => {
    try {
      await apiUpdateLeaveStatus(id, status);
      await refetch();
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.response?.data?.message || "Failed to update request" };
    }
  };

  return { myLeaves, pendingLeaves, loading, error, isManager, refetch, submitLeave, actOnLeave };
};
