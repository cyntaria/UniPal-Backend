const { body } = require('express-validator');

exports.createTeacherSchema = [
    body('full_name')
        .trim()
        .exists()
        .withMessage('Full name is required')
        .isLength({ min: 2 })
        .withMessage('Full name must be at least 2 chars long')
        .isAlpha('en-US', {ignore: ' '})
        .withMessage('Full name should be all alphabets'),
    body()
        .custom(value => {
            return Object.keys(value).length !== 0;
        })
        .withMessage('Please provide required fields to create')
        .custom(value => {
            const creates = Object.keys(value);
            const allowCreates = ["full_name"];
            return creates.every(create => allowCreates.includes(create));
        })
        .withMessage('Invalid updates!')
];

exports.updateTeacherSchema = [
    body('full_name')
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage('Full name must be at least 2 chars long')
        .isAlpha('en-US', {ignore: ' '})
        .withMessage('Full name should be all alphabets'),
    body()
        .custom(value => {
            return Object.keys(value).length !== 0;
        })
        .withMessage('Please provide required fields to update')
        .custom(value => {
            const updates = Object.keys(value);
            const allowUpdates = ["full_name"];
            return updates.every(update => allowUpdates.includes(update));
        })
        .withMessage('Invalid updates!')
];