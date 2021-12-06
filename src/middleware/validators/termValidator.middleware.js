const { body } = require('express-validator');

exports.createTermSchema = [
    body('term')
        .trim()
        .exists()
        .withMessage('Term is required')
        .isLength({min: 5})
        .withMessage('Term should be atleast 5 letters')
        .isAlphanumeric('en-US', {ignore: ' '})
        .withMessage('Term should be all alphabets or digits')
];

exports.updateTermSchema = [
    body('term')
        .trim()
        .exists()
        .withMessage('New term is required')
        .isLength({min: 5})
        .withMessage('Term should be atleast 5 letters')
        .isAlphanumeric('en-US', {ignore: ' '})
        .withMessage('Term should be all alphabets or digits'),
    body()
        .custom(value => {
            return Object.keys(value).length !== 0;
        })
        .withMessage('Please provide required fields to update')
        .custom(value => {
            const updates = Object.keys(value);
            const allowUpdates = ["term"];
            return updates.every(update => allowUpdates.includes(update));
        })
        .withMessage('Invalid updates!')
];