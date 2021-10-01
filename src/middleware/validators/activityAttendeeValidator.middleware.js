const { body } = require('express-validator');
const { InvolvementType } = require('../../utils/enums/involvementType.utils');
const { RequestMethods } = require('../../utils/enums/requestMethods.utils');
const { ERPRegex } = require('../../utils/common.utils');
const { ForbiddenException } = require('../../utils/exceptions/auth.exception');

exports.createActivityAttendeeSchema = [
    body('student_erp')
        .trim()
        .exists()
        .withMessage('Student ERP is required')
        .matches(ERPRegex)
        .withMessage('ERP must be 5 digits'),
    body('involvement_type')
        .trim()
        .exists()
        .withMessage('Involvement Type is required')
        .isIn([...Object.values(InvolvementType)])
        .withMessage('Invalid Involvement Type')
];

exports.updateActivityAttendeeSchema = [
    body('involvement_type')
        .optional()
        .trim()
        .isIn([...Object.values(InvolvementType)])
        .withMessage('Invalid Involvement Type'),
    body()
        .custom(value => {
            return Object.keys(value).length !== 0;
        })
        .withMessage('Please provide required fields to update')
        .custom(value => {
            const updates = Object.keys(value);
            const allowUpdates = ["involvement_type"];
            return updates.every(update => allowUpdates.includes(update));
        })
        .withMessage('Invalid updates!')
];

exports.activityAttendeeOwnerCheck = (req) => {
    const student = req.currentStudent;

    if (req.method === RequestMethods.POST) {
        return req.body.student_erp === student.erp;
    }

    const student_erp = req.params.student_erp;

    if (student.erp !== student_erp) throw new ForbiddenException();
    else return true;
};