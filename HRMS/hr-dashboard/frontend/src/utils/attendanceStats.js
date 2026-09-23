import { localDateKey } from "../hooks/useAttendance";

const LATE_HOUR = 9;
const LATE_MINUTE = 30;
const MS_PER_HOUR = 1000 * 60 * 60;

export const isLateCheckIn = (checkIn) => {
  if (!checkIn) return false;
  const d = new Date(checkIn);
  return d.getHours() > LATE_HOUR || (d.getHours() === LATE_HOUR && d.getMinutes() > LATE_MINUTE);
};

const isWeekday = (date) => {
  const day = date.getDay();
  return day !== 0 && day !== 6;
};

const weekdaysInMonth = (year, month) => {
  const date = new Date(year, month, 1);
  let count = 0;
  while (date.getMonth() === month) {
    if (isWeekday(date)) count++;
    date.setDate(date.getDate() + 1);
  }
  return count;
};

const isOnApprovedLeave = (dateKey, leaves) =>
  leaves.some((l) => {
    if (l.status !== "Approved") return false;
    const start = localDateKey(l.startDate);
    const end = localDateKey(l.endDate);
    return dateKey >= start && dateKey <= end;
  });

const recordsByDateKey = (records) => {
  const map = new Map();
  for (const r of records) {
    const key = localDateKey(r.date);
    const existing = map.get(key);
    if (!existing || (r.checkIn && (!existing.checkIn || new Date(r.checkIn) < new Date(existing.checkIn)))) {
      map.set(key, r);
    }
  }
  return map;
};

// Counts each elapsed weekday of the month as present, late, absent or on leave.
// totalWorkdays is the whole month, so the ratios show progress through the month.
export const computeMonthlySummary = (records, leaves, referenceDate = new Date(), joinedOn = null) => {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const today = localDateKey(referenceDate);
  const totalWorkdays = weekdaysInMonth(year, month);
  const byDate = recordsByDateKey(records);
  const joinKey = joinedOn ? localDateKey(joinedOn) : null;

  let present = 0;
  let late = 0;
  let absent = 0;
  let leave = 0;

  const cursor = new Date(year, month, 1);
  while (cursor.getMonth() === month) {
    const key = localDateKey(cursor);
    if (isWeekday(cursor) && key <= today && (!joinKey || key >= joinKey)) {
      if (isOnApprovedLeave(key, leaves)) {
        leave++;
      } else if (byDate.has(key)) {
        const rec = byDate.get(key);
        if (rec.status === "Absent") absent++;
        else if (rec.status === "Leave") leave++;
        else if (isLateCheckIn(rec.checkIn)) late++;
        else present++;
      } else if (key < today) {
        absent++;
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  const tracked = present + late + absent + leave;
  const pct = (n) => (tracked > 0 ? Math.round((n / tracked) * 1000) / 10 : 0);

  return {
    present,
    late,
    absent,
    leave,
    totalWorkdays,
    tracked,
    presentPct: pct(present),
    latePct: pct(late),
    absentPct: pct(absent),
    leavePct: pct(leave),
  };
};

export const percentChange = (current, previous) => {
  if (previous === 0 || previous == null) return null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
};

const isPresentRecord = (r) => !r.status || r.status === "Present";

export const avgHoursPerDay = (records) => {
  const present = records.filter(isPresentRecord);
  if (present.length === 0) return 0;
  const totalMs = present.reduce((sum, r) => sum + (r.hoursWorked || 0), 0);
  return totalMs / present.length / MS_PER_HOUR;
};

export const avgCheckInMinutes = (records) => {
  const present = records.filter((r) => isPresentRecord(r) && r.checkIn);
  if (present.length === 0) return null;
  const total = present.reduce((sum, r) => {
    const d = new Date(r.checkIn);
    return sum + d.getHours() * 60 + d.getMinutes();
  }, 0);
  return total / present.length;
};

export const formatMinutesAsTime = (minutes) => {
  if (minutes == null) return "—";
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
};

const recordsWithinMonth = (records, year, month) =>
  records.filter((r) => {
    const d = new Date(r.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

// This month vs last month numbers for the Attendance page KPI row.
export const computeAttendanceStats = (records, referenceDate = new Date()) => {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  const prevDate = new Date(year, month - 1, 1);

  const thisMonthRecords = recordsWithinMonth(records, year, month);
  const lastMonthRecords = recordsWithinMonth(records, prevDate.getFullYear(), prevDate.getMonth());

  const thisMonthLate = thisMonthRecords.filter((r) => isLateCheckIn(r.checkIn)).length;
  const lastMonthLate = lastMonthRecords.filter((r) => isLateCheckIn(r.checkIn)).length;

  const thisAvgHours = avgHoursPerDay(thisMonthRecords);
  const lastAvgHours = avgHoursPerDay(lastMonthRecords);

  const thisAvgCheckIn = avgCheckInMinutes(thisMonthRecords);
  const lastAvgCheckIn = avgCheckInMinutes(lastMonthRecords);

  return {
    lateArrivals: thisMonthLate,
    lateArrivalsDelta: percentChange(thisMonthLate, lastMonthLate),
    avgHours: thisAvgHours,
    avgHoursDelta: percentChange(thisAvgHours, lastAvgHours),
    avgCheckIn: thisAvgCheckIn,
    avgCheckInDeltaMinutes:
      thisAvgCheckIn != null && lastAvgCheckIn != null ? Math.round(thisAvgCheckIn - lastAvgCheckIn) : null,
  };
};

const startOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day + 6) % 7; // Monday = 0
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export const computeWeeklyHours = (records, weekOffset = 0, referenceDate = new Date()) => {
  const base = new Date(referenceDate);
  base.setDate(base.getDate() + weekOffset * 7);
  const weekStart = startOfWeek(base);

  const byDate = recordsByDateKey(records);
  return WEEKDAY_LABELS.map((label, i) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    const key = localDateKey(date);
    const record = byDate.get(key);
    const ms = record?.hoursWorked || 0;
    return { day: label, date: key, ms, hours: ms / MS_PER_HOUR };
  });
};

// Day-by-day list for the last `limit` weekdays. Days with no check-in show as
// Absent (or Leave when an approved leave covers them).
export const buildRecentLedger = (records, leaves, referenceDate = new Date(), limit = 10) => {
  const byDate = recordsByDateKey(records);
  const today = localDateKey(referenceDate);
  const entries = [];
  const cursor = new Date(referenceDate);

  while (entries.length < limit) {
    const key = localDateKey(cursor);
    if (isWeekday(cursor)) {
      const record = byDate.get(key);
      const onLeave = isOnApprovedLeave(key, leaves);
      let status;
      if (record && record.status === "Absent") status = "Absent";
      else if (record && record.status === "Leave") status = "Leave";
      else if (record) status = isLateCheckIn(record.checkIn) ? "Late" : record.checkOut ? "Present" : "Working";
      else if (onLeave) status = "Leave";
      else if (key < today) status = "Absent";
      else status = null;

      if (status) {
        entries.push({
          id: key,
          date: cursor.toISOString(),
          checkIn: record?.checkIn || null,
          checkOut: record?.checkOut || null,
          hoursWorked: record?.hoursWorked || 0,
          status,
        });
      }
    }
    cursor.setDate(cursor.getDate() - 1);
    if (cursor < new Date(referenceDate.getFullYear() - 1, 0, 1)) break;
  }

  return entries;
};

export const formatHoursMinutes = (ms) => {
  if (!ms) return "0h";
  const totalMinutes = Math.round(ms / (1000 * 60));
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};
