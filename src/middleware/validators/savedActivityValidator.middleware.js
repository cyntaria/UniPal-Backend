const { body } = require('express-validator');
const { datetimeRegex } = require('../../utils/common.utils');

exports.createSavedActivitySchema = [
    body('activity_id')
        .trim()
        .exists()
        .withMessage('Activity id is required')
        .isInt({ min: 1 })
        .withMessage('Invalid ActivityID found'),
    body('saved_at')
        .trim()
        .exists()
        .withMessage('Saved datetime is required')
        .matches(datetimeRegex)
        .withMessage('Saved datetime should be valid datetime of format \'YYYY-MM-DD HH:mm:ss\'')
];