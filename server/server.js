const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./utils/db');

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
app.use(express.json());

// Routes
app.use('/api/patients', patientRoutes);
app.use('/api/analyze', screeningRoutes);
app.use('/api/followups', followUpRoutes);
app.use('/api/family', familyRoutes);
app.use('/api/community-risk', communityRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api', analyticsRoutes);

// Database connection with retry logic
connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
