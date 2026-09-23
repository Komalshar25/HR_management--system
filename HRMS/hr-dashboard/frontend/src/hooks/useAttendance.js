import { useState, useEffect, useCallback } from "react";
import {
  getMyAttendance,
  getAllAttendance,
  clockIn as apiClockIn,
  clockOut as apiClockOut,
} from "../api/attendance";

export const localDateKey = (d) => {
  const date = new Date(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const useAttendance = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyAttendance();
      setRecords(data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const today = localDateKey(new Date());
  const todaysRecords = records.filter((r) => localDateKey(r.date) === today);
  const openRecord = todaysRecords.find((r) => !r.checkOut) || null;
  const todayRecord = openRecord || todaysRecords[0] || null;

  const clockIn = async () => {
    setActionLoading(true);
    try {
      await apiClockIn();
      await refetch();
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.response?.data?.message || "Clock-in failed" };
    } finally {
      setActionLoading(false);
    }
  };

  const clockOut = async () => {
    setActionLoading(true);
    try {
      await apiClockOut();
      await refetch();
      return { ok: true };
    } catch (err) {
      return { ok: false, message: err.response?.data?.message || "Clock-out failed" };
    } finally {
      setActionLoading(false);
    }
  };

  return {
    records,
    todaysRecords,
    todayRecord,
    openRecord,
    loading,
    actionLoading,
    error,
    refetch,
    clockIn,
    clockOut,
  };
};

export const useAllAttendance = (params) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllAttendance(params);
      setRecords(data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(params)]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { records, loading, error, refetch };
};
