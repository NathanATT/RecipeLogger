const express = require('express');
const router = express.Router();
const settingController = require('../controller/settingController');


// Get the current global conversion settings
router.get('/', settingController.getSettings);

// Update the global conversion settings
router.put('/', settingController.updateSettings);

module.exports = router;