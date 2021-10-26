const { body } = require('express-validator');

exports.createProgramSchema = [
    body('program')
        .trim()
        .exists()
        .withMessage('Program name is required')
        .isLength({min: 3})
        .withMessage('Program name should be atleast 3 letters')
        .isAlpha('en-US', {ignore: ' -'})
        .withMessage('Program name should be all alphabets')
];

exports.updateProgramSchema = [
    body('program')
        .exists()
        .withMessage('New program name is required')
        .isLength({min: 3})
        .withMessage('Program name should be atleast 3 letters')
        .isAlpha('en-US', {ignore: ' -'})
        .withMessage('Program name should be all alphabets'),
    body()
        .custom(value => {
            return Object.keys(value).length !== 0;
        })
        .withMessage('Please provide required fields to update')
        .custom(value => {
            const updates = Object.keys(value);
            const allowUpdates = ["program"];
            return updates.every(update => allowUpdates.includes(update));
        })
        .withMessage('Invalid updates!')
];