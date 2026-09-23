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

// needed behind a proxy so the rate limiter sees the real client IP
app.set('trust proxy', 1);

// CLIENT_URL can hold several origins, comma separated
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

connectDB();

// fill in today's attendance on boot and every morning at 6
// (anyone who already has a record is skipped, so repeating is safe)
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
app.use('/api/attendance', attendanceRoutes);
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