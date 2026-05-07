const express = require('express');
const router = express.Router();
const { createFollowUp, getFollowUps, markComplete } = require('../controllers/followUpController');

router.post('/', createFollowUp);
router.get('/', getFollowUps);
router.put('/:id/complete', markComplete);

module.exports = router;
