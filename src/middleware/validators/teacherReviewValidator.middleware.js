const { body, query } = require('express-validator');
const { TeacherReviewLocation } = require('../../utils/enums/teacherReviewLocation.utils');
const { Privacy } = require('../../utils/enums/privacy.utils');
const { TeacherReviewFrequency } = require('../../utils/enums/teacherReviewFrequency.utils');
const { InvolvementType } = require('../../utils/enums/involvementType.utils');
const { RequestMethods } = require('../../utils/enums/requestMethods.utils');
const { ERPRegex, timeRegex, datetimeRegex } = require('../../utils/common.utils');
const TeacherReviewModel = require('../../models/teacherReview.model');
const { NotFoundException } = require('../../utils/exceptions/database.exception');

exports.createTeacherReviewSchema = [
    body('learning')
        .trim()
        .exists()
        .withMessage('Learning score is required')
        .isInt({min: 1, max: 5})
        .withMessage('Invalid learning score. Should be between 1-5'),
    body('grading')
        .trim()
        .exists()
        .withMessage('Grading score is required')
        .isInt({min: 1, max: 5})
        .withMessage('Invalid grading score. Should be between 1-5'),
    body('attendance')
        .trim()
        .exists()
        .withMessage('Attendance score is required')
        .isInt({min: 1, max: 5})
        .withMessage('Invalid attendance score. Should be between 1-5'),
    body('difficulty')
        .trim()
        .exists()
        .withMessage('Difficulty score is required')
        .isInt({min: 1, max: 5})
        .withMessage('Invalid difficulty score. Should be between 1-5'),
    body('overall_rating')
        .trim()
        .exists()
        .withMessage('Overall rating is required')
        .isDecimal({force_decimal: true, decimal_digits: '1'})
        .withMessage('Rating should a valid decimal (0.0)')
        .isFloat({min: 0.1, max: 5.0})
        .withMessage('Rating should in range [0.1 - 5.0]'),
    body('comment')
        .trim()
        .exists()
        .isLength({ max: 100 })
        .withMessage('Comment should be less than 100 characters'),
    body('subject_code')
        .trim()
        .exists()
        .withMessage('Subject code is required')
        .matches(CourseCodeRegex)
        .withMessage('Subject code should be of format \'AAA000\''),
    body('teacher_id')
        .trim()
        .exists()
        .withMessage('TeacherID is required for the teacherReview')
        .isInt({ min: 1 })
        .withMessage('Invalid Teacher ID found'),
    body('reviewed_by_erp')
        .trim()
        .exists()
        .withMessage('Reviewer ERP is required')
        .matches(ERPRegex)
        .withMessage('ERP must be 5 digits'),
    body('reviewed_at')
        .trim()
        .exists()
        .withMessage('Review datetime is required')
        .matches(datetimeRegex)
        .withMessage('Review datetime should be valid datetime of format \'YYYY-MM-DD HH:mm:ss\'')
];

exports.updateTeacherReviewSchema = [
    body('learning')
        .optional()
        .trim()
        .withMessage('Learning score is required')
        .isInt({min: 1, max: 5})
        .withMessage('Invalid learning score. Should be between 1-5'),
    body('grading')
        .optional()
        .trim()
        .withMessage('Grading score is required')
        .isInt({min: 1, max: 5})
        .withMessage('Invalid grading score. Should be between 1-5'),
    body('attendance')
        .optional()
        .trim()
        .withMessage('Attendance score is required')
        .isInt({min: 1, max: 5})
        .withMessage('Invalid attendance score. Should be between 1-5'),
    body('difficulty')
        .optional()
        .trim()
        .withMessage('Difficulty score is required')
        .isInt({min: 1, max: 5})
        .withMessage('Invalid difficulty score. Should be between 1-5'),
    body('overall_rating')
        .optional()
        .trim()
        .withMessage('Overall rating is required')
        .isDecimal({force_decimal: true, decimal_digits: '1'})
        .withMessage('Rating should a valid decimal (0.0)')
        .isFloat({min: 0.1, max: 5.0})
        .withMessage('Rating should in range [0.1 - 5.0]'),
    body('comment')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Comment should be less than 100 characters'),
    body('reviewed_at')
        .optional()
        .trim()
        .withMessage('Review datetime is required')
        .matches(datetimeRegex)
        .withMessage('Review datetime should be valid datetime of format \'YYYY-MM-DD HH:mm:ss\''),
    body()
        .custom(value => {
            return Object.keys(value).length !== 0;
        })
        .withMessage('Please provide required fields to update')
        .custom(value => {
            const updates = Object.keys(value);
            const allowUpdates = ['learning', 'grading', 'attendance', 'difficulty',
                'overall_rating', 'comment', 'reviewed_at'];
            return updates.every(update => allowUpdates.includes(update));
        })
        .withMessage('Invalid updates!')
];

exports.getTeacherReviewsQuerySchema = [
    query('learning')
        .optional()
        .trim()
        .withMessage('Learning score is required')
        .isInt({min: 1, max: 5})
        .withMessage('Invalid learning score. Should be between 1-5'),
    query('grading')
        .optional()
        .trim()
        .withMessage('Grading score is required')
        .isInt({min: 1, max: 5})
        .withMessage('Invalid grading score. Should be between 1-5'),
    query('attendance')
        .optional()
        .trim()
        .withMessage('Attendance score is required')
        .isInt({min: 1, max: 5})
        .withMessage('Invalid attendance score. Should be between 1-5'),
    query('difficulty')
        .optional()
        .trim()
        .withMessage('Difficulty score is required')
        .isInt({min: 1, max: 5})
        .withMessage('Invalid difficulty score. Should be between 1-5'),
    query('overall_rating')
        .optional()
        .trim()
        .withMessage('Overall rating is required')
        .isDecimal({force_decimal: true, decimal_digits: '1'})
        .withMessage('Rating should a valid decimal (0.0)')
        .isFloat({min: 0.1, max: 5.0})
        .withMessage('Rating should in range [0.1 - 5.0]'),
    query()
        .custom(value => {
            const queryParams = Object.keys(value);
            const allowParams = ['learning', 'grading', 'attendance',
                'difficulty', 'overall_rating'];
            return queryParams.every(param => allowParams.includes(param));
        })
        .withMessage('Invalid query params!')
];

exports.teacherReviewOwnerCheck = async(req) => {
    const review_id = req.params.id;
    const student = req.currentStudent;

    if (req.method === RequestMethods.POST) {
        return req.body.reviewed_by_erp === student.erp;
    }

    const teacherReview = await TeacherReviewModel.findOne(review_id);
    if (!teacherReview) {
        throw new NotFoundException('Teacher review not found');
    }

    return teacherReview.reviewed_by_erp === student.erp;
};