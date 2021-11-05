const { body } = require('express-validator');

exports.createStudentStatusSchema = [
    body('student_status')
        .trim()
        .exists()
        .withMessage('Student status is required')
        .isLength({min: 3})
        .withMessage('Student status should be atleast 3 letters')
        .isAlpha('en-US', {ignore: ' -'})
        .withMessage('Student status should be all alphabets')
];

exports.updateStudentStatusSchema = [
    body('student_status')
        .trim()
        .exists()
        .withMessage('New student status is required')
        .isLength({min: 3})
        .withMessage('Student status should be atleast 3 letters')
        .isAlpha('en-US', {ignore: ' -'})
        .withMessage('Student status should be all alphabets'),
    body()
        .custom(value => {
            return Object.keys(value).length !== 0;
        })
        .withMessage('Please provide required fields to update')
        .custom(value => {
            const updates = Object.keys(value);
            const allowUpdates = ["student_status"];
            return updates.every(update => allowUpdates.includes(update));
        })
        .withMessage('Invalid updates!')
];