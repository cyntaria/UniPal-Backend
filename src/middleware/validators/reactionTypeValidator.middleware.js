const { body } = require('express-validator');

exports.createReactionTypeSchema = [
    body('reaction_type')
        .trim()
        .exists()
        .withMessage('Reaction type is required')
        .isLength({min: 3})
        .withMessage('Reaction type should be atleast 3 letters')
        .isAlpha('en-US', {ignore: ' -'})
        .withMessage('Reaction type should be all alphabets')
];

exports.updateReactionTypeSchema = [
    body('reaction_type')
        .exists()
        .withMessage('New reaction type is required')
        .isLength({min: 3})
        .withMessage('Reaction type should be atleast 3 letters')
        .isAlpha('en-US', {ignore: ' -'})
        .withMessage('Reaction type should be all alphabets'),
    body()
        .custom(value => {
            return Object.keys(value).length !== 0;
        })
        .withMessage('Please provide required fields to update')
        .custom(value => {
            const updates = Object.keys(value);
            const allowUpdates = ["reaction_type"];
            return updates.every(update => allowUpdates.includes(update));
        })
        .withMessage('Invalid updates!')
];