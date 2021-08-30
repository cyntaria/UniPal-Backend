const { body } = require('express-validator');
const { ERPRegex, OTPRegex } = require('../../utils/common.utils');

exports.changePWSchema = [
    body('erp')
        .trim()
        .exists()
        .matches(ERPRegex)
        .withMessage('ERP must be 5 digits'),
    body('old_password')
        .trim()
        .exists()
        .withMessage('Old password is required')
        .notEmpty()
        .withMessage('Old password must be filled'),
    body('new_password')
        .trim()
        .exists()
        .withMessage('New password field is required')
        .notEmpty()
        .withMessage('New password must be filled')
        .custom((value, { req }) => value !== req.body.password)
        .withMessage('New password can\'t be the same as the old password')
];

exports.forgotPWSchema = [
    body('erp')
        .trim()
        .exists()
        .matches(ERPRegex)
        .withMessage('ERP must be 5 digits')
];

exports.verifyOTPSchema = [
    body('erp')
        .trim()
        .exists()
        .matches(ERPRegex)
        .withMessage('ERP must be 5 digits'),
    body('otp')
        .trim()
        .exists()
        .withMessage('otp is required')
        .matches(OTPRegex)
        .withMessage('otp must be 4 digits')
        .isString()
        .withMessage('otp must be a string')
];

exports.resetPWSchema = [
    body('erp')
        .trim()
        .exists()
        .matches(ERPRegex)
        .withMessage('ERP must be 5 digits'),
    body('password')
        .trim()
        .exists()
        .withMessage('Password is required')
        .notEmpty()
        .withMessage('Password must be filled')
];

exports.validateLogin = [
    body('erp')
        .trim()
        .exists()
        .matches(ERPRegex)
        .withMessage('ERP must be 5 digits'),
    body('password')
        .trim()
        .exists()
        .withMessage('Password is required')
        .notEmpty()
        .withMessage('Password must be filled')
];

exports.validateRefresh = [
    body('erp')
        .trim()
        .exists()
        .matches(ERPRegex)
        .withMessage('ERP must be 5 digits'),
    body('password')
        .trim()
        .exists()
        .withMessage('Password is required')
        .notEmpty()
        .withMessage('Password must be filled'),
    body('old_token')
        .trim()
        .exists()
        .withMessage('Old token is required for refreshing')
        .isJWT()
        .withMessage('Invalid token format')
];