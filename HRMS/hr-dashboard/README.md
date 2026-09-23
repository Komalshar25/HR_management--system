HRMS Dashboard

Modern HR portal with employee self-service and manager workflows: auth & roles, attendance clock in/out, leave requests with manager approval, time tracking, performance overview cards, and responsive UI built with React + Vite + MUI.

Tech Stack

Frontend: React 18, Vite 5, MUI, Chart.js/Recharts, React Router, Axios.
Backend: Node.js/Express, MongoDB via Mongoose, JWT auth, bcrypt, date-fns/moment, CORS.
Tooling: Nodemon for backend dev, Vite dev server for frontend.

Project Structure

hr-dashboard/frontend/ — React SPA.
hr-dashboard/backend/ — Express API.
hr-dashboard/index.html — launcher/redirect.
Root package.json — minimal placeholder (not used for app runtime).

Environment Variables

Backend (hr-dashboard/backend/.env template):
PORT=5000
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<strong_secret>
Frontend (hr-dashboard/frontend/.env):
VITE_API_URL=http://localhost:5000
Note: src/services/axios.js and src/api.js default to http://localhost:5000; keep ports aligned with backend.

Prerequisites

Node.js 18+ and npm.
MongoDB instance reachable from the backend.

Setup & Run (two terminals)

Backend
cd hr-dashboard/backend
npm install
npm run dev (or npm start for production)
API base: http://localhost:5000
Frontend
cd hr-dashboard/frontend
npm install
npm run dev (Vite defaults to http://localhost:5173; --host already set)

Key API Endpoints

Auth: POST /api/auth/register, POST /api/auth/login.
Attendance: POST /api/attendance/clock-in, POST /api/attendance/clock-out, GET /api/attendance/my.
Leaves: POST /api/leaves/request, GET /api/leaves/my, GET /api/leaves/pending (manager/admin only), PATCH /api/leaves/:id/status (manager/admin only).
All protected routes expect Authorization: Bearer <token>.

Frontend Highlights

Auth flow stored in localStorage (token + user), guarded routes for /dashboard.
Dashboard (HRPortal) with sidebar navigation, live clock, attendance summary, leave management, manager approval table, time tracker, performance review table.
ErrorBoundary wraps app; UI components use MUI and Lucide icons.

Development Notes

Ensure backend CORS origin matches the Vite dev URL (http://localhost:5173 by default).
If you change backend port, update VITE_API_URL and the hard-coded base URLs in src/services/axios.js and src/api.js.
Sample data is not seeded; create users via POST /api/auth/register to log in.

Build for Production

Frontend: npm run build → dist/ static assets.
Backend: run npm start with production-ready .env; serve frontend separately (e.g., Nginx) or configure Express static serving if desired.

Testing Quick Checks

Register & login → verify token in localStorage.
Clock in/out → records appear in Attendance table.
Submit leave → appears in “My Leave Requests”; as Manager/Admin, approve/reject in “Leave Requests Awaiting My Approval”.

Troubleshooting

CORS errors: confirm ports/origin align.
JWT errors: ensure JWT_SECRET matches across environments and token is sent with Bearer prefix.
Mongo connection issues: verify MONGO_URI and network access.