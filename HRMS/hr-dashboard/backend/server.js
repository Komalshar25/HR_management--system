require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const connectDB = require('./config/db');
const { seedTodayAttendance } = require('./jobs/seedDailyAttendance');

const authRoutes = require('./routes/authRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const userRoutes = require('./routes/userRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const appraisalRoutes = require('./routes/appraisalRoutes');
const recruitmentRoutes = require('./routes/recruitmentRoutes');
const documentRoutes = require('./routes/documentRoutes');
const kudosRoutes = require('./routes/kudosRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const errorHandler = require('./middleware/errorHandler');

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set. Refusing to start without it.');
  process.exit(1);
}

const app = express();

// Behind Render/Vercel proxies: needed so rate limiting sees the real client IP.
app.set('trust proxy', 1);

// Comma-separated list of allowed origins, e.g. "https://app.example.com,https://admin.example.com"
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

connectDB();

// Keep "today's" attendance populated automatically: once on boot (covers restarts
// mid-day), then fresh every morning. Safe to run repeatedly — it only fills in
// employees who don't already have a record for today, real clock-ins included.
seedTodayAttendance().catch((err) => console.error('[seedDailyAttendance] startup run failed:', err.message));
cron.schedule('0 6 * * *', () => {
  seedTodayAttendance().catch((err) => console.error('[seedDailyAttendance] scheduled run failed:', err.message));
});

app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'hrms-backend' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/attendance', attendanceRoutes);   // <-- THIS WAS MISSING
app.use('/api/users', userRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/appraisals', appraisalRoutes);
app.use('/api/recruitment', recruitmentRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/kudos', kudosRoutes);
app.use('/api/announcements', announcementRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});