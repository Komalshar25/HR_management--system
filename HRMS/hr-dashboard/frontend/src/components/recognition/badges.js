import { Users, Rocket, Puzzle, GraduationCap, Lightbulb } from "lucide-react";

export const BADGES = {
  "Team Player": { icon: Users, color: "#2563eb" },
  "Above & Beyond": { icon: Rocket, color: "#f59e0b" },
  "Problem Solver": { icon: Puzzle, color: "#16a34a" },
  "Great Mentor": { icon: GraduationCap, color: "#7c3aed" },
  Innovator: { icon: Lightbulb, color: "#0ea5e9" },
};

export const BADGE_NAMES = Object.keys(BADGES);
