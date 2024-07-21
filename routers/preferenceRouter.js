const express = require('express');
const router = express.Router();
const preferenceController = require('../controllers/preferencesController');

router.get('/', preferenceController.getAllPreferences);
router.post('/', preferenceController.addPreference);
router.put('/', preferenceController.updatePreference);
router.get('/results', preferenceController.getVacationResults);
router.get('/destinations', preferenceController.getDestinations);
router.get('/vacationTypes', preferenceController.getVacationTypes);

module.exports = router;
