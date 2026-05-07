const express = require('express');
const router = express.Router();
const { createScreening, getScreenings } = require('../controllers/screeningController');

router.post('/', createScreening);
router.get('/:patientId', getScreenings);

module.exports = router;
