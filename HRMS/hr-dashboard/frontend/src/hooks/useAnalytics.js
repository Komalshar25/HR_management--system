import { useState, useEffect, useCallback } from "react";
import * as analyticsApi from "../api/analytics";

const useResource = (fetchFn, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(() => {
    setLoading(true);
    fetchFn()
      .then((res) => {
        setData(res);
        setError(null);
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
};

export const useOverview = () => useResource(analyticsApi.getOverview);

export const useAttendanceTrend = (range) =>
  useResource(() => analyticsApi.getAttendanceTrend(range), [range]);

export const useDepartmentBreakdown = () => useResource(analyticsApi.getDepartmentBreakdown);

export const useLeaveTrend = (range) =>
  useResource(() => analyticsApi.getLeaveTrend(range), [range]);

export const useWorkforceDistribution = () => useResource(analyticsApi.getWorkforceDistribution);
