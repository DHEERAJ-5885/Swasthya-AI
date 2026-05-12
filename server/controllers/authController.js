const AshaWorker = require('../models/AshaWorker');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:5000/auth/google/callback';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5175';
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;
if (googleClient && GOOGLE_CLIENT_SECRET) {
  googleClient.setCredentials({ client_secret: GOOGLE_CLIENT_SECRET });
}

// Generate JWT token
const generateToken = (worker) => {
  return jwt.sign(
    { id: worker._id, name: worker.name, employeeId: worker.employeeId },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Register ASHA Worker
const register = async (req, res) => {
  try {
    const { employeeId, name, phone, password, village, email } = req.body;

    if (!employeeId || !name || !phone || !password || !village) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ error: 'Phone number must be exactly 10 digits' });
    }

    // Check if worker already exists
    const existing = await AshaWorker.findOne({ $or: [{ employeeId }, { phone }] });
    if (existing) {
      return res.status(400).json({ error: 'Employee ID or phone already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const worker = new AshaWorker({
      employeeId,
      name,
      phone,
      password: hashedPassword,
      village,
      email
    });

    await worker.save();

    const token = generateToken(worker);
    res.status(201).json({
      message: 'ASHA worker registered successfully',
      token,
      worker: { id: worker._id, name: worker.name, employeeId: worker.employeeId, village: worker.village }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login ASHA Worker
const login = async (req, res) => {
  try {
    const { employeeId, phone, password } = req.body;

    if (!employeeId || !phone || !password) {
      return res.status(400).json({ error: 'Employee ID, phone, and password required' });
    }
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ error: 'Phone number must be exactly 10 digits' });
    }

    const worker = await AshaWorker.findOne({ employeeId, phone }).select('+password');

    if (!worker) {
      return res.status(401).json({ error: 'Invalid Employee ID, phone, or password' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, worker.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid Employee ID, phone, or password' });
    }

    // Update last login
    worker.lastLogin = new Date();
    await worker.save();

    const token = generateToken(worker);
    res.json({
      message: 'Login successful',
      token,
      worker: {
        id: worker._id,
        name: worker.name,
        employeeId: worker.employeeId,
        village: worker.village,
        phone: worker.phone,
        profilePhoto: worker.profilePhoto,
        language: worker.language,
        stats: worker.stats
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get worker profile with enriched assigned patients and stats
const getProfile = async (req, res) => {
  try {
    const workerDoc = await AshaWorker.findById(req.userId).lean();
    if (!workerDoc) {
      return res.status(404).json({ error: 'Worker not found' });
    }

    // Populate assigned patients with latest screening info
    const Patient = require('../models/Patient');
    const Screening = require('../models/Screening');

    let assignedPatients = [];
    if (workerDoc.assignedPatients && workerDoc.assignedPatients.length > 0) {
      const patients = await Patient.find({ _id: { $in: workerDoc.assignedPatients } }).lean();
      assignedPatients = await Promise.all(patients.map(async (p) => {
        const latestScreening = await Screening.findOne({ patientId: p._id }).sort({ createdAt: -1 }).lean();
        return {
          ...p,
          risk: latestScreening?.result?.riskLevel || 'Unknown',
          lastScreenedAt: latestScreening?.createdAt || null
        };
      }));
    }

    // Ensure stats reflect current numbers (fallback)
    const totalPatients = assignedPatients.length;
    const highRiskPatients = assignedPatients.filter(p => p.risk === 'High' || p.risk === 'Critical').length;

    const worker = {
      ...workerDoc,
      assignedPatients,
      stats: {
        totalPatients,
        highRiskPatients,
        followUpCompletionRate: workerDoc.stats?.followUpCompletionRate || 0,
        screensThisMonth: workerDoc.stats?.screensThisMonth || 0
      }
    };

    res.json(worker);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update worker profile
const updateProfile = async (req, res) => {
  try {
    const { name, email, language, profilePhoto } = req.body;
    const worker = await AshaWorker.findByIdAndUpdate(
      req.userId,
      { name, email, language, profilePhoto },
      { new: true }
    );
    res.json(worker);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Google Sign-In
const googleStart = async (req, res) => {
  try {
    if (!googleClient) {
      return res.status(500).json({ error: 'Google Sign-In is not configured' });
    }

    const url = googleClient.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile', 'openid'],
      redirect_uri: GOOGLE_REDIRECT_URI
    });

    return res.redirect(url);
  } catch (err) {
    return res.redirect(`${FRONTEND_URL}/login?google_error=${encodeURIComponent('Unable to start Google Sign-In')}`);
  }
};

const googleCallback = async (req, res) => {
  try {
    if (!googleClient) {
      return res.redirect(`${FRONTEND_URL}/login?google_error=${encodeURIComponent('Google Sign-In is not configured')}`);
    }

    const { code, error } = req.query;
    if (error) {
      return res.redirect(`${FRONTEND_URL}/login?google_error=${encodeURIComponent(error)}`);
    }
    if (!code) {
      return res.redirect(`${FRONTEND_URL}/login?google_error=${encodeURIComponent('Missing Google authorization code')}`);
    }

    const { tokens } = await googleClient.getToken({ code, redirect_uri: GOOGLE_REDIRECT_URI });
    googleClient.setCredentials(tokens);

    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const email = payload?.email;
    const name = payload?.name;
    const googleId = payload?.sub;
    const picture = payload?.picture;

    if (!email) {
      return res.redirect(`${FRONTEND_URL}/login?google_error=${encodeURIComponent('Google account email not available')}`);
    }

    const worker = await AshaWorker.findOne({ email });
    if (!worker) {
      return res.redirect(`${FRONTEND_URL}/login?google_error=${encodeURIComponent('No ASHA worker found for this Google account. Register first.')}`);
    }

    if (!worker.googleId) worker.googleId = googleId;
    if (!worker.profilePhoto && picture) worker.profilePhoto = picture;
    if (!worker.name && name) worker.name = name;
    await worker.save();

    const token = generateToken(worker);
    const workerPayload = encodeURIComponent(JSON.stringify({
      id: worker._id,
      name: worker.name,
      employeeId: worker.employeeId,
      village: worker.village,
      phone: worker.phone,
      profilePhoto: worker.profilePhoto,
      language: worker.language,
      stats: worker.stats
    }));

    return res.redirect(`${FRONTEND_URL}/login?google_token=${encodeURIComponent(token)}&worker=${workerPayload}`);
  } catch (err) {
    return res.redirect(`${FRONTEND_URL}/login?google_error=${encodeURIComponent(err.message || 'Google Sign-In failed')}`);
  }
};

const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: 'Google ID token required' });
    }
    if (!googleClient) {
      return res.status(500).json({ error: 'Google Sign-In is not configured' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const email = payload?.email;
    const name = payload?.name;
    const googleId = payload?.sub;
    const picture = payload?.picture;

    if (!email) {
      return res.status(400).json({ error: 'Google account email not available' });
    }

    const worker = await AshaWorker.findOne({ email });
    if (!worker) {
      return res.status(404).json({ error: 'No ASHA worker found for this Google account. Register first.' });
    }

    if (!worker.googleId) {
      worker.googleId = googleId;
    }
    if (!worker.profilePhoto && picture) {
      worker.profilePhoto = picture;
    }
    await worker.save();

    const token = generateToken(worker);
    res.json({
      message: 'Login successful',
      token,
      worker: {
        id: worker._id,
        name: worker.name,
        employeeId: worker.employeeId,
        village: worker.village,
        phone: worker.phone,
        profilePhoto: worker.profilePhoto,
        language: worker.language,
        stats: worker.stats
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  googleLogin,
  googleStart,
  googleCallback
};
