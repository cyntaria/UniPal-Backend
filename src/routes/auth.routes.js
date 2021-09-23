const express = require('express');
const router = express.Router();
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');
const {checkValidation} = require('../middleware/validation.middleware');

const authController = require('../controllers/auth.controller');
const { createStudentSchema } = require('../middleware/validators/studentValidator.middleware');
const {
    validateLogin,
    resetPWSchema,
    changePWSchema,
    validateRefresh,
    forgotPWSchema,
    verifyOTPSchema
} = require('../middleware/validators/authValidator.middleware');

router.post('/register',
    createStudentSchema,
    checkValidation,
    awaitHandlerFactory(authController.register)
); // localhost:3000/api/API_VERSION/auth/register

router.post('/login',
    validateLogin,
    checkValidation,
    awaitHandlerFactory(authController.login)
); // localhost:3000/api/API_VERSION/auth/login

router.post('/refresh-token',
    validateRefresh,
    checkValidation,
    awaitHandlerFactory(authController.refreshToken)
); // localhost:3000/api/API_VERSION/auth/refresh-token

// / For requesting otp for password reset
router.post('/forgot/send-otp',
    forgotPWSchema,
    checkValidation,
    awaitHandlerFactory(authController.sendOTP)
); // localhost:3000/api/API_VERSION/auth/forgot/send-otp

// / For verifying the sent otp against the one in the database
router.post('/forgot/verify-otp',
    verifyOTPSchema,
    checkValidation,
    awaitHandlerFactory(authController.verifyOTP)
); // localhost:3000/api/API_VERSION/auth/forgot/verify-otp

// For changing password from the profile page, in case old password is known
router.patch('/change-password',
    changePWSchema,
    checkValidation,
    awaitHandlerFactory(authController.changePassword)
); // localhost:3000/api/API_VERSION/auth/password/change-password

// For sending the new password after OTP verification success
router.patch('/forgot/reset-password',
    resetPWSchema,
    checkValidation,
    awaitHandlerFactory(authController.resetPassword)
); // localhost:3000/api/API_VERSION/auth/forgot/reset-password


module.exports = router;