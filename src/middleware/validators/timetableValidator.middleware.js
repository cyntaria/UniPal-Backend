const { body, query } = require('express-validator');
const { RequestMethods } = require('../../utils/enums/requestMethods.utils');
const { ERPRegex, ClassERPRegex } = require('../../utils/common.utils');
const TimetableModel = require('../../models/timetable.model');
const { NotFoundException } = require('../../utils/exceptions/database.exception');

exports.generateTimetablesSchema = [
    body('num_of_subjects')
        .exists()
        .withMessage('Number of subjects is required')
        .isInt({min: 1})
        .withMessage('Number of subjects has to be a whole number >= 1'),
    body('classes')
        .exists()
        .withMessage('Timetable classes are required')
        .bail()
        .isArray()
        .withMessage('Classes must be an array like [{...}, {...}, ...]')
        .bail()
        .notEmpty()
        .withMessage('Classes can\'t be empty'),
    body('classes.*')
        .exists()
        .withMessage('Class details are required for each class')
        .bail()
        .isObject()
        .withMessage('Invalid Class details found. Class details must be a JSON object'),
    body('classes.*.timeslot_1')
        .exists()
        .withMessage('Timeslots are required for each class')
        .bail(),
    body('classes.*.day_1')
        .exists()
        .withMessage('Days are required for each class')
        .bail(),
    body('classes.*.timeslot_2')
        .exists()
        .withMessage('Timeslots are required for each class')
        .bail(),
    body('classes.*.day_2')
        .exists()
        .withMessage('Days are required for each class')
        .bail(),
    body('classes.*.subject')
        .exists()
        .withMessage('Subject is required for each class')
        .bail(),
    body()
        .custom(value => {
            const updates = Object.keys(value);
            const allowUpdates = ['num_of_subjects', 'classes'];
            return updates.every(update => allowUpdates.includes(update));
        })
        .withMessage('Invalid parameters!')
];

exports.createTimetableSchema = [
    body('term_id')
        .exists()
        .withMessage('TermID is required for the class')
        .isInt({ min: 1 })
        .withMessage('Invalid Term ID found'),
    body('student_erp')
        .trim()
        .exists()
        .withMessage('Student ERP is required')
        .matches(ERPRegex)
        .withMessage('ERP must be 5 digits'),
    body('is_active')
        .optional()
        .isBoolean()
        .withMessage('Invalid boolean. Should be either 0 or 1'),
    body('classes')
        .exists()
        .withMessage('Timetable classes are required')
        .bail()
        .isArray()
        .withMessage('Classes must be an array like [5899, 5797, ...]')
        .bail()
        .notEmpty()
        .withMessage('Classes can\'t be empty'),
    body('classes.*')
        .trim()
        .exists()
        .withMessage('ClassERP is required for each class')
        .bail()
        .matches(ClassERPRegex)
        .withMessage('Invalid ClassERP found. Class ERP must be 4 digits')
];

exports.updateTimetableSchema = [
    body('is_active')
        .optional()
        .isBoolean()
        .withMessage('Invalid boolean. Should be either 0 or 1'),
    body()
        .custom(value => {
            return Object.keys(value).length !== 0;
        })
        .withMessage('Please provide required fields to update')
        .custom(value => {
            const updates = Object.keys(value);
            const allowUpdates = ['is_active'];
            return updates.every(update => allowUpdates.includes(update));
        })
        .withMessage('Invalid updates!')
];

exports.updateTimetableClassesSchema = [
    body('added')
        .optional()
        .isArray()
        .withMessage('New classes must be an array like [5899, 5797, ...]')
        .bail()
        .notEmpty()
        .withMessage('New Classes can\'t be empty'),
    body('added.*')
        .trim()
        .exists()
        .withMessage('ClassERP is required for each class')
        .bail()
        .matches(ClassERPRegex)
        .withMessage('Invalid ClassERP found. Class ERP must be 4 digits'),
    body('removed')
        .optional()
        .isArray()
        .withMessage('Removed classes must be an array like [5899, 5797, ...]')
        .bail()
        .notEmpty()
        .withMessage('Removed Classes can\'t be empty'),
    body('removed.*')
        .trim()
        .exists()
        .withMessage('ClassERP is required for each class')
        .bail()
        .matches(ClassERPRegex)
        .withMessage('Invalid ClassERP found. Class ERP must be 4 digits'),
    body()
        .custom(value => {
            return Object.keys(value).length !== 0;
        })
        .withMessage('Please provide required fields to update')
        .custom(value => {
            const updates = Object.keys(value);
            const allowUpdates = ['added', 'removed'];
            return updates.every(update => allowUpdates.includes(update));
        })
        .withMessage('Invalid updates!')
];

exports.getTimetablesQuerySchema = [
    query('student_erp')
        .optional()
        .trim()
        .matches(ERPRegex)
        .withMessage('ERP must be 5 digits'),
    query('is_active')
        .optional()
        .isBoolean()
        .withMessage('Invalid boolean. Should be either 0 or 1'),
    query('term_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Invalid Term ID found'),
    query()
        .custom(value => {
            const queryParams = Object.keys(value);
            const allowParams = ['student_erp', 'is_active', 'term_id'];
            return queryParams.every(param => allowParams.includes(param));
        })
        .withMessage('Invalid query params!')
];

exports.timetableOwnerCheck = async(req) => {
    const timetable_id = req.params.id;
    const student = req.currentStudent;

    if (req.method === RequestMethods.POST) {
        return req.body.student_erp === student.erp;
    }

    const timetable = await TimetableModel.findOne(timetable_id);
    if (!timetable) {
        throw new NotFoundException('Timetable not found');
    }

    return timetable.student_erp === student.erp;
};

exports.timetableQueryCheck = async(req) => {
    // Must have some query params
    return req.query.student_erp !== undefined;
};