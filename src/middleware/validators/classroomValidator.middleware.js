const { body } = require('express-validator');

exports.createClassroomSchema = [
    body('classroom')
        .trim()
        .exists()
        .withMessage('Classroom name is required')
        .isLength({ min: 2, max: 10 })
        .withMessage('Classroom name should between 2-10 characters'),
    body('campus_id')
        .exists()
        .withMessage('Campus id is required for the classroom')
        .isInt({ min: 1 })
        .withMessage('Invalid Campus ID found')
];

exports.updateClassroomSchema = [
    body('classroom')
        .optional()
        .trim()
        .isLength({ max: 10 })
        .withMessage('Classroom name should be less than 10 characters'),
    body('campus_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Invalid Campus ID found'),
    body()
        .custom(value => {
            return Object.keys(value).length !== 0;
        })
        .withMessage('Please provide required fields to update')
        .custom(value => {
            const updates = Object.keys(value);
            const allowUpdates = ["classroom", "campus_id"];
            return updates.every(update => allowUpdates.includes(update));
        })
        .withMessage('Invalid updates!')
];