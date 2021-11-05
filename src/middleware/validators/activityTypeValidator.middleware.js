const { body } = require('express-validator');

exports.createActivityTypeSchema = [
    body('activity_type')
        .trim()
        .exists()
        .withMessage('Activity type is required')
        .isLength({min: 3})
        .withMessage('Activity type should be atleast 3 letters')
        .isAlpha('en-US', {ignore: ' -'})
        .withMessage('Activity type should be all alphabets')
];

exports.updateActivityTypeSchema = [
    body('activity_type')
        .trim()
        .exists()
        .withMessage('New activity type is required')
        .isLength({min: 3})
        .withMessage('Activity type should be atleast 3 letters')
        .isAlpha('en-US', {ignore: ' -'})
        .withMessage('Activity type should be all alphabets'),
    body()
        .custom(value => {
            return Object.keys(value).length !== 0;
        })
        .withMessage('Please provide required fields to update')
        .custom(value => {
            const updates = Object.keys(value);
            const allowUpdates = ["activity_type"];
            return updates.every(update => allowUpdates.includes(update));
        })
        .withMessage('Invalid updates!')
];