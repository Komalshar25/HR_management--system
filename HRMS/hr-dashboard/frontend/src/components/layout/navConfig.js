import { LayoutGrid, Users, CalendarClock, FileSpreadsheet, BarChart3, Network, Settings, ShieldCheck, Clock, Inbox, Wallet, Award, Briefcase } from "lucide-react";

export const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutGrid, roles: ["Employee", "Manager", "HR", "Admin"] },
  { label: "Employees", path: "/employees", icon: Users, roles: ["Manager", "HR", "Admin"] },
  { label: "Attendance", path: "/attendance", icon: CalendarClock, roles: ["Employee", "Manager", "HR", "Admin"] },
  { label: "Leaves", path: "/leave", icon: FileSpreadsheet, roles: ["Employee", "Manager", "HR", "Admin"] },
  { label: "Timesheet", path: "/timesheet", icon: Clock, roles: ["Employee", "Manager", "HR", "Admin"] },
  { label: "My Requests", path: "/requests", icon: Inbox, roles: ["Employee", "Manager", "HR", "Admin"] },
  { label: "Performance", path: "/performance", icon: Award, roles: ["Employee", "Manager", "HR", "Admin"] },
  { label: "Recruitment", path: "/recruitment", icon: Briefcase, roles: ["Manager", "HR", "Admin"] },
  { label: "Reports", path: "/analytics", icon: BarChart3, roles: ["Manager", "HR", "Admin"] },
  { label: "Team", path: "/teams", icon: Network, roles: ["Manager", "HR", "Admin"] },
  { label: "Payroll", path: "/payroll", icon: Wallet, roles: ["Employee", "Manager", "HR", "Admin"] },
  { label: "Settings", path: "/settings", icon: Settings, roles: ["Employee", "Manager", "HR", "Admin"] },
];

export const ADMIN_NAV_ITEMS = [
  { label: "Administration", path: "/settings/administration", icon: ShieldCheck, roles: ["HR", "Admin"] },
];

export const navForRole = (role) => NAV_ITEMS.filter((item) => item.roles.includes(role));
export const adminNavForRole = (role) => ADMIN_NAV_ITEMS.filter((item) => item.roles.includes(role));
