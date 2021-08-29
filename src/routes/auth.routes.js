const express = require('express');
const router = express.Router();
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');

const authController = require('../controllers/auth.controller');
const { createStudentSchema } = require('../middleware/validators/studentValidator.middleware');
const { validateLogin, resetPWSchema, changePWSchema, validateRefresh } = require('../middleware/validators/authValidator.middleware');

router.post('/register', createStudentSchema, awaitHandlerFactory(authController.register)); // localhost:3000/api/v1/auth/register
router.post('/login', validateLogin, awaitHandlerFactory(authController.login)); // localhost:3000/api/v1/auth/login
router.post('/refresh-token', validateRefresh, awaitHandlerFactory(authController.refreshToken)); // localhost:3000/api/v1/auth/refresh-token

// For changing password from the profile page, in case old password is known
router.patch('/change-password', changePWSchema, awaitHandlerFactory(authController.changePassword)); // localhost:3000/api/v1/auth/password/change-password

// For sending the new password after OTP verification success
router.post('/reset-password', resetPWSchema, awaitHandlerFactory(authController.resetPassword)); // localhost:3000/api/v1/auth/reset-password


module.exports = router;