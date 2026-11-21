const express = require('express');
const router = express.Router();
const controller = require('../controller/graveyard_controller');
const { requireAuth } = require('../middleware/auth')

router.get('/', controller.getGraveyards);
router.get('/me', requireAuth, controller.getUserGraveyard);
router.get('/:id', controller.getGraveyardById);

router.post('/', requireAuth, controller.createGraveyard);
router.patch('/:id', requireAuth, controller.updateGraveyard);


module.exports = router;
