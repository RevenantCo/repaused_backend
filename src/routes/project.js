const express = require('express');
const router = express.Router();
const controller = require('../controller/project_controller');
const { requireAuth } = require('../middleware/auth');

router.post('/', requireAuth, controller.createProject);
router.get('/:id', controller.getProject);
router.patch('/:id', requireAuth, controller.updateProject);

module.exports = router;
