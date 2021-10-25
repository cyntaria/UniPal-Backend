const { body } = require('express-validator');

exports.createInterestSchema = [
    body('interest')
        .trim()
        .exists()
        .withMessage('Interest name is required')
        .isLength({min: 3})
        .withMessage('Interest name should be atleast 3 letters')
        .isAlpha('en-US', {ignore: ' -'})
        .withMessage('Interest name should be all alphabets')
];

exports.updateInterestSchema = [
    body('interest')
        .exists()
        .withMessage('New interest name is required')
        .isLength({min: 3})
        .withMessage('Interest name should be atleast 3 letters')
        .isAlpha('en-US', {ignore: ' -'})
        .withMessage('Interest name should be all alphabets'),
    body()
        .custom(value => {
            return Object.keys(value).length !== 0;
        })
        .withMessage('Please provide required fields to update')
        .custom(value => {
            const updates = Object.keys(value);
            const allowUpdates = ["interest"];
            return updates.every(update => allowUpdates.includes(update));
        })
        .withMessage('Invalid updates!')
];