const { body } = require('express-validator');

exports.createCampusSpotSchema = [
    body('campus_spot')
        .trim()
        .exists()
        .withMessage('Campus spot is required')
        .isLength({min: 3})
        .withMessage('Campus spot should be atleast 3 letters'),
    body('campus_id')
        .trim()
        .exists()
        .withMessage('Campus id is required for the spot')
        .isInt({ min: 1 })
        .withMessage('Invalid CampusID found')
];

exports.updateCampusSpotSchema = [
    body('campus_spot')
        .trim()
        .exists()
        .withMessage('New campus spot is required')
        .isLength({min: 3})
        .withMessage('Campus spot should be atleast 3 letters'),
    body()
        .custom(value => {
            return Object.keys(value).length !== 0;
        })
        .withMessage('Please provide required fields to update')
        .custom(value => {
            const updates = Object.keys(value);
            const allowUpdates = ["campus_spot"];
            return updates.every(update => allowUpdates.includes(update));
        })
        .withMessage('Invalid updates!')
];