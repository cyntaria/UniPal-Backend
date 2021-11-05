const { body } = require('express-validator');
const { CourseCodeRegex } = require('../../utils/common.utils');

exports.createSubjectSchema = [
    body('subject_code')
        .trim()
        .exists()
        .withMessage('Subject code is required')
        .matches(CourseCodeRegex)
        .withMessage('Subject code should be of format \'AAA000\''),
    body('subject')
        .trim()
        .exists()
        .withMessage('Subject name is required')
        .isLength({min: 3})
        .withMessage('Subject name should be atleast 3 letters')
        .isAlphanumeric('en-US', {ignore: ' -'})
        .withMessage('Subject name should be alphanumeric')
];

exports.updateSubjectSchema = [
    body('subject')
        .trim()
        .exists()
        .withMessage('New subject name is required')
        .isLength({min: 3})
        .withMessage('Subject name should be atleast 3 letters')
        .isAlphanumeric('en-US', {ignore: ' -'})
        .withMessage('Subject name should be alphanumeric'),
    body()
        .custom(value => {
            return Object.keys(value).length !== 0;
        })
        .withMessage('Please provide required fields to update')
        .custom(value => {
            const updates = Object.keys(value);
            const allowUpdates = ["subject"];
            return updates.every(update => allowUpdates.includes(update));
        })
        .withMessage('Invalid updates!')
];