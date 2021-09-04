const { body } = require('express-validator');

exports.createCampusSchema = [
    body('campus')
        .trim()
        .exists()
        .withMessage('Campus name is required')
        .isLength({min: 2})
        .withMessage('Campus name should be atleast 2 letters')
        .isAlpha('en-US', {ignore: ' -'})
        .withMessage('Campus name should be all alphabets'),
    body('location_url')
        .trim()
        .exists()
        .withMessage('Location url is required')
        .isURL()
        .withMessage('Must be a valid url')
];

exports.updateCampusSchema = [
    body('campus')
        .optional()
        .trim()
        .isLength({min: 2})
        .withMessage('Campus name should be atleast 2 letters')
        .isAlpha('en-US', {ignore: ' -'})
        .withMessage('Campus name should be all alphabets'),
    body('location_url')
        .optional()
        .trim()
        .isURL()
        .withMessage('Must be a valid url'),
    body()
        .custom(value => {
            return Object.keys(value).length !== 0;
        })
        .withMessage('Please provide required fields to update')
        .custom(value => {
            const updates = Object.keys(value);
            const allowUpdates = ["campus", "location_url"];
            return updates.every(update => allowUpdates.includes(update));
        })
        .withMessage('Invalid updates!')
];