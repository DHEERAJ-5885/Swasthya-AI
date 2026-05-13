const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./utils/db');
const authMiddleware = require('./middleware/authMiddleware');

const authRoutes = require('./routes/authRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const patientRoutes = require('./routes/patientRoutes');
const screeningRoutes = require('./routes/screeningRoutes');
const followUpRoutes = require('./routes/followUpRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const familyRoutes = require('./routes/familyRoutes');
const communityRoutes = require('./routes/communityRoutes');
const chatRoutes = require('./routes/chatRoutes');
const alertRoutes = require('./routes/alertRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Public Routes (No Auth Required)
app.use('/api/auth', authRoutes);

// Protected Routes (Auth Required)
app.use('/api/notifications', authMiddleware, notificationRoutes);
app.use('/api/patients', authMiddleware, patientRoutes);
app.use('/api/analyze', authMiddleware, screeningRoutes);
app.use('/api/followups', authMiddleware, followUpRoutes);
app.use('/api/family', authMiddleware, familyRoutes);
app.use('/api/community-risk', authMiddleware, communityRoutes);
app.use('/api/chat', authMiddleware, chatRoutes);
app.use('/api/alerts', authMiddleware, alertRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api', analyticsRoutes);

// Database connection with retry logic
connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
