const express = require('express');
const router = express.Router();
const Screening = require('../models/Screening');

router.get('/community-risk', async (req, res) => {
  try {
    // Count high/medium/low cases in recent screenings
    const high = await Screening.countDocuments({ 'result.riskLevel': 'High' });
    const medium = await Screening.countDocuments({ 'result.riskLevel': 'Medium' });
    const total = await Screening.countDocuments();
    
    let risk = 'Low';
    if (total > 0) {
      if ((high / total) > 0.2) risk = 'High';
      else if ((high + medium) / total > 0.3) risk = 'Moderate';
    }
    
    res.json({ risk, stats: { high, medium, total } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
