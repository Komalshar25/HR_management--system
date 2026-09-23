import { useState, useEffect, useCallback } from "react";
import { listUsers } from "../api/users";

let cache = null;

export const useEmployees = () => {
  const [employees, setEmployees] = useState(cache || []);
  const [loading, setLoading] = useState(!cache);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listUsers();
      cache = data;
      setEmployees(data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!cache) refetch();
  }, [refetch]);

  return { employees, loading, error, refetch };
};
