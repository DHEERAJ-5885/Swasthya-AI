const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
require('dotenv').config();

const AshaWorker = require('./models/AshaWorker');
const Patient = require('./models/Patient');

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data (optional)
    // await AshaWorker.deleteMany({});
    // await Patient.deleteMany({});

    // Check if demo account exists
    const existingWorker = await AshaWorker.findOne({ employeeId: 'ASH-001' });
    if (existingWorker) {
      console.log('Demo ASHA worker already exists');
    } else {
      // Create demo ASHA worker
      const hashedPassword = await bcryptjs.hash('password123', 10);
      const worker = new AshaWorker({
        employeeId: 'ASH-001',
        name: 'Anita Kumari',
        phone: '9876543210',
        village: 'Rampur',
        email: 'anita@swasthya.com',
        password: hashedPassword,
        language: 'English',
        profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
        stats: {
          totalPatients: 45,
          highRiskPatients: 8,
          followUpCompletionRate: 92,
          screensThisMonth: 12
        }
      });
      await worker.save();
      console.log('✅ Demo ASHA worker created');
    }

    // Create some demo patients
    const demoPatients = [
      {
        name: 'Ramesh Kumar',
        gender: 'Male',
        age: 52,
        phone: '9876543211',
        village: 'Rampur',
        healthId: 'HLTH-001',
        familyId: 'FAM-001',
        riskLevel: 'high',
        conditions: ['Hypertension', 'Diabetes'],
        lastScreening: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        name: 'Priya Singh',
        gender: 'Female',
        age: 38,
        phone: '9876543212',
        village: 'Rampur',
        healthId: 'HLTH-002',
        familyId: 'FAM-001',
        riskLevel: 'medium',
        conditions: ['Prediabetes'],
        lastScreening: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      },
      {
        name: 'Suresh Patel',
        gender: 'Male',
        age: 65,
        phone: '9876543213',
        village: 'Rampur',
        healthId: 'HLTH-003',
        familyId: 'FAM-002',
        riskLevel: 'high',
        conditions: ['Heart Disease', 'High Cholesterol'],
        lastScreening: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    ];

    for (const patientData of demoPatients) {
      const exists = await Patient.findOne({ healthId: patientData.healthId });
      if (!exists) {
        const patient = new Patient(patientData);
        await patient.save();
        console.log(`✅ Demo patient created: ${patientData.name}`);
      }
    }

    console.log('✨ Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
