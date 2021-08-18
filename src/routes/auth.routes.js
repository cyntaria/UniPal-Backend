const express = require('express');
const router = express.Router();
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');

const authController = require('../controllers/auth.controller');
const { createUserSchema } = require('../middleware/validators/userValidator.middleware');
const { validateLogin, resetPWSchema, changePWSchema, validateRefresh } = require('../middleware/validators/authValidator.middleware');

router.post('/register', createUserSchema, awaitHandlerFactory(authController.registerUser)); // localhost:3000/api/v1/auth/register
router.post('/login', validateLogin, awaitHandlerFactory(authController.userLogin)); // localhost:3000/api/v1/auth/login
router.post('/token', validateRefresh, awaitHandlerFactory(authController.refreshToken)); // localhost:3000/api/v1/auth/token

// For sending the new password after OTP verification success
router.post('/password/reset', resetPWSchema, awaitHandlerFactory(authController.resetPassword)); // localhost:3000/api/v1/auth/password/reset

// For changing password from the profile page, in case old password is known
router.post('/password/change', changePWSchema, awaitHandlerFactory(authController.changePassword)); // localhost:3000/api/v1/auth/password/change

module.exports = router;