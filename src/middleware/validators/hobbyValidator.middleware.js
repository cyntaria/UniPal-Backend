const { body } = require('express-validator');

exports.createHobbySchema = [
    body('hobby')
        .trim()
        .exists()
        .withMessage('Hobby name is required')
        .isLength({min: 3})
        .withMessage('Hobby name should be atleast 3 letters')
        .isAlpha('en-US', {ignore: ' -'})
        .withMessage('Hobby name should be all alphabets')
];

exports.updateHobbySchema = [
    body('hobby')
        .optional()
        .trim()
        .isLength({min: 3})
        .withMessage('Hobby name should be atleast 3 letters')
        .isAlpha('en-US', {ignore: ' -'})
        .withMessage('Hobby name should be all alphabets'),
    body()
        .custom(value => {
            return Object.keys(value).length !== 0;
        })
        .withMessage('Please provide required fields to update')
        .custom(value => {
            const updates = Object.keys(value);
            const allowUpdates = ["hobby"];
            return updates.every(update => allowUpdates.includes(update));
        })
        .withMessage('Invalid updates!')
];