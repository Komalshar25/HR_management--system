const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");

const NUMERIC_FIELDS_BY_FILE = {
  "departments.csv": new Set(["dept_id"]),
  "employees.csv": new Set(["emp_id", "dept_id", "salary"]),
  "attendance.csv": new Set(["attendance_id", "emp_id"]),
  "leave_requests.csv": new Set(["leave_id", "emp_id", "days"]),
  "payroll.csv": new Set(["payroll_id", "emp_id", "basic_salary", "bonus"]),
  "appraisals.csv": new Set(["appraisal_id", "emp_id", "rating"]),
  "recruitment.csv": new Set(["recruit_id"]),
};

const cache = {};

const loadCsv = (filename) => {
  if (cache[filename]) return cache[filename];

  const filePath = path.join(DATA_DIR, filename);
  const raw = fs.readFileSync(filePath, "utf8").replace(/^﻿/, "");
  const lines = raw.split(/\r?\n/).filter((line) => line.trim().length > 0);
  const headers = lines[0].split(",");
  const numericFields = NUMERIC_FIELDS_BY_FILE[filename] || new Set();

  const rows = lines.slice(1).map((line) => {
    const cells = line.split(",");
    const row = {};
    headers.forEach((header, i) => {
      const value = cells[i];
      row[header] = numericFields.has(header) ? Number(value) : value;
    });
    return row;
  });

  cache[filename] = rows;
  return rows;
};

module.exports = {
  loadDepartments: () => loadCsv("departments.csv"),
  loadEmployees: () => loadCsv("employees.csv"),
  loadAttendance: () => loadCsv("attendance.csv"),
  loadLeaveRequests: () => loadCsv("leave_requests.csv"),
  loadPayroll: () => loadCsv("payroll.csv"),
  loadAppraisals: () => loadCsv("appraisals.csv"),
  loadRecruitment: () => loadCsv("recruitment.csv"),
};
