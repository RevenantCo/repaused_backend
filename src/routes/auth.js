const express = require('express');
const router = express.Router();
const {requireAuth} = require('../middleware/auth')
const controller= require('../controller/auth_controller');

router.post('/register', controller.register);
router.post('/login', controller.login);
router.patch('/update-profile', requireAuth, controller.updateProfile);
router.delete('/delete-account', requireAuth, controller.deleteAccount);
router.get('/check-nickname', controller.checkNickname);
router.get('/check-github-username', controller.checkGithubUsername);


module.exports = router;