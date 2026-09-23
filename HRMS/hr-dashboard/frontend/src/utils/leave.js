export const LEAVE_TYPES = ["Sick", "Casual", "Annual", "Maternity", "Unpaid"];

export const ANNUAL_ALLOWANCE = {
  Sick: 12,
  Casual: 12,
  Annual: 18,
  Maternity: 90,
  Unpaid: null,
};

export const daysBetween = (start, end) => {
  const ms = new Date(end).setHours(0, 0, 0, 0) - new Date(start).setHours(0, 0, 0, 0);
  return Math.max(Math.round(ms / (1000 * 60 * 60 * 24)) + 1, 1);
};

export const computeLeaveBalance = (leaves) => {
  const usedByType = {};
  for (const leave of leaves) {
    if (leave.status !== "Approved") continue;
    const days = daysBetween(leave.startDate, leave.endDate);
    usedByType[leave.leaveType] = (usedByType[leave.leaveType] || 0) + days;
  }

  return LEAVE_TYPES.filter((type) => ANNUAL_ALLOWANCE[type] != null).map((type) => {
    const used = usedByType[type] || 0;
    const allowance = ANNUAL_ALLOWANCE[type];
    return { type, allowance, used, remaining: Math.max(allowance - used, 0) };
  });
};
