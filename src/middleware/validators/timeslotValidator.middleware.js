const { body } = require('express-validator');
const { timeRegex } = require('../../utils/common.utils');

exports.createTimeslotSchema = [
    body('start_time')
        .trim()
        .exists()
        .withMessage('Start time is required')
        .matches(timeRegex)
        .withMessage('Start time must be of valid format \'hh:mm:ss\''),
    body('end_time')
        .trim()
        .exists()
        .withMessage('End time is required')
        .matches(timeRegex)
        .withMessage('End time must be of valid format \'hh:mm:ss\''),
    body('slot_number')
        .trim()
        .exists()
        .withMessage('Slot number is required')
        .isInt({min: 1})
        .withMessage('Slot number has to be a whole number >= 1')
];

exports.updateTimeslotSchema = [
    body('start_time')
        .optional()
        .trim()
        .matches(timeRegex)
        .withMessage('Start time must be of valid format \'hh:mm:ss\''),
    body('end_time')
        .optional()
        .trim()
        .matches(timeRegex)
        .withMessage('End time must be of valid format \'hh:mm:ss\''),
    body('slot_number')
        .optional()
        .trim()
        .isInt({min: 1})
        .withMessage('Slot number has to be a whole number >= 1'),
    body()
        .custom(value => {
            return Object.keys(value).length !== 0;
        })
        .withMessage('Please provide required fields to update')
        .custom(value => {
            const updates = Object.keys(value);
            const allowUpdates = ["start_time", "end_time", "slot_number"];
            return updates.every(update => allowUpdates.includes(update));
        })
        .withMessage('Invalid updates!')
];