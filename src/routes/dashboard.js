const express = require('express');
const router = express.Router();
const controller = require('../controller/dashboard_controller');
const { requireAuth } = require('../middleware/auth')



router.get('/', requireAuth, controller.getDashboard);


module.exports = router;