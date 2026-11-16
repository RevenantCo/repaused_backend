const express = require('express');
const router = express.Router();
const controller= require('../controller/auth_controller');

router.post('/register', controller.register);

module.exports = router;