const { body } = require('express-validator');
const { RequestMethods } = require('../../utils/enums/requestMethods.utils');
const { ERPRegex, datetimeRegex } = require('../../utils/common.utils');

exports.createPostReactionSchema = [
    body('student_erp')
        .trim()
        .exists()
        .withMessage('Student ERP is required')
        .matches(ERPRegex)
        .withMessage('ERP must be 5 digits'),
    body('reaction_type_id')
        .trim()
        .exists()
        .withMessage('Reaction type id is required for the post')
        .isInt({ min: 1 })
        .withMessage('Invalid Reaction Type ID found'),
    body('reacted_at')
        .trim()
        .exists()
        .withMessage('Reaction datetime is required')
        .matches(datetimeRegex)
        .withMessage('Reaction datetime should be valid datetime of format \'YYYY-MM-DD HH:mm:ss\'')
];

exports.updatePostReactionSchema = [
    body('reaction_type_id')
        .trim()
        .exists()
        .withMessage('Reaction type id is required')
        .isInt({ min: 1 })
        .withMessage('Invalid Reaction Type ID found'),
    body('reacted_at')
        .trim()
        .exists()
        .withMessage('Reaction datetime is required')
        .matches(datetimeRegex)
        .withMessage('Reaction datetime should be valid datetime of format \'YYYY-MM-DD HH:mm:ss\''),
    body()
        .custom(value => {
            return Object.keys(value).length !== 0;
        })
        .withMessage('Please provide required fields to update')
        .custom(value => {
            const updates = Object.keys(value);
            const allowUpdates = ["reaction_type_id", "reacted_at"];
            return updates.every(update => allowUpdates.includes(update));
        })
        .withMessage('Invalid updates!')
];

exports.postReactionOwnerCheck = (req) => {
    const student = req.currentStudent;

    if (req.method === RequestMethods.POST) {
        return req.body.student_erp === student.erp;
    }

    const student_erp = req.params.student_erp;

    return student.erp === student_erp;
};