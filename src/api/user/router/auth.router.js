const router = require('express').Router();
const authController = require('../controller/auth.controller');

router.post('/login', authController.login);
router.post('/registry', authController.registry);
router.post('/reset-otp', authController.resetOTP);
router.post('/confirm-account', authController.confirmAccount);
router.get('/verify-email/:token', authController.verifyEmail);

module.exports = router;
