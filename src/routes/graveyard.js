const express = require('express');
const router = express.Router();
const controller = require('../controller/graveyard_controller');
const projectController = require('../controller/project_controller');
const { requireAuth } = require('../middleware/auth')

router.get('/', controller.getGraveyards);
router.get('/:id', controller.getGraveyardById);

router.post('/', requireAuth, controller.createGraveyard);
router.post('/:id/projects', requireAuth, projectController.createProject);
router.patch('/:id', requireAuth, controller.updateGraveyard);


module.exports = router;
