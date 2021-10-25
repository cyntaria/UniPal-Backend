const { body } = require('express-validator');

exports.createActivityStatusSchema = [
    body('activity_status')
        .trim()
        .exists()
        .withMessage('Activity status is required')
        .isLength({min: 3})
        .withMessage('Activity status should be atleast 3 letters')
        .isAlpha('en-US', {ignore: ' -'})
        .withMessage('Activity status should be all alphabets')
];

exports.updateActivityStatusSchema = [
    body('activity_status')
        .exists()
        .withMessage('New activity status is required')
        .isLength({min: 3})
        .withMessage('Activity status should be atleast 3 letters')
        .isAlpha('en-US', {ignore: ' -'})
        .withMessage('Activity status should be all alphabets'),
    body()
        .custom(value => {
            return Object.keys(value).length !== 0;
        })
        .withMessage('Please provide required fields to update')
        .custom(value => {
            const updates = Object.keys(value);
            const allowUpdates = ["activity_status"];
            return updates.every(update => allowUpdates.includes(update));
        })
        .withMessage('Invalid updates!')
];