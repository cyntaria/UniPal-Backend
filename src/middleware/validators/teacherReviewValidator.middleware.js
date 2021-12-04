const { body, query } = require('express-validator');
const { RequestMethods } = require('../../utils/enums/requestMethods.utils');
const { ERPRegex, datetimeRegex, CourseCodeRegex } = require('../../utils/common.utils');
const TeacherReviewModel = require('../../models/teacherReview.model');
const { NotFoundException, DeleteFailedException } = require('../../utils/exceptions/database.exception');

exports.createTeacherReviewSchema = [
    body('learning')
        .exists()
        .withMessage('Learning score is required')
        .isInt({min: 1, max: 5})
        .withMessage('Invalid learning score. Should be between 1-5'),
    body('grading')
        .exists()
        .withMessage('Grading score is required')
        .isInt({min: 1, max: 5})
        .withMessage('Invalid grading score. Should be between 1-5'),
    body('attendance')
        .exists()
        .withMessage('Attendance score is required')
        .isInt({min: 1, max: 5})
        .withMessage('Invalid attendance score. Should be between 1-5'),
    body('difficulty')
        .exists()
        .withMessage('Difficulty score is required')
        .isInt({min: 1, max: 5})
        .withMessage('Invalid difficulty score. Should be between 1-5'),
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
        .withMessage('Review datetime should be valid datetime of format \'YYYY-MM-DD HH:mm:ss\''),
    body('old_teacher_rating')
        .exists()
        .withMessage('Teacher\'s old rating is required')
        .isDecimal({force_decimal: false, decimal_digits: '3'})
        .withMessage('Rating should a valid decimal (0.000)')
        .isFloat({min: 0.0, max: 5.0})
        .withMessage('Rating should in range [0.1 - 5.0]'),
    body('old_total_reviews')
        .exists()
        .withMessage('Teacher\'s old total number of reviews is required')
        .isInt({ min: 0 })
        .withMessage('Old total reviews should be an int')
];

exports.deleteTeacherReviewSchema = [
    body('teacher_id')
        .exists()
        .withMessage('TeacherID is required for the teacherReview')
        .isInt({ min: 1 })
        .withMessage('Invalid Teacher ID found'),
    body('teacher_rating')
        .exists()
        .withMessage('Teacher\'s old rating is required')
        .isDecimal({force_decimal: false, decimal_digits: '3'})
        .withMessage('Rating should a valid decimal (0.000)')
        .isFloat({min: 0.0, max: 5.0})
        .withMessage('Rating should in range [0.1 - 5.0]'),
    body('review_rating')
        .exists()
        .withMessage('Deleted review\'s rating is required')
        .isDecimal({force_decimal: false, decimal_digits: '3'})
        .withMessage('Rating should a valid decimal (0.000)')
        .isFloat({min: 0.0, max: 5.0})
        .withMessage('Rating should in range [0.1 - 5.0]'),
    body('total_reviews')
        .exists()
        .withMessage('Teacher\'s old total number of reviews is required')
        .isInt({ min: 0 })
        .withMessage('Old total reviews should be an int'),
    body()
        .custom(value => {
            return Object.keys(value).length !== 0;
        })
        .withMessage('Please provide required fields to delete')
        .custom(value => {
            const deleteKeys = Object.keys(value);
            const allowedDeletes = ['teacher_id', 'teacher_rating', 'review_rating', 'total_reviews'];
            return deleteKeys.every(deleteKey => allowedDeletes.includes(deleteKey));
        })
        .withMessage('Invalid delete fields!')
];

exports.getTeacherReviewsQuerySchema = [
    query('subject_code')
        .optional()
        .trim()
        .matches(CourseCodeRegex)
        .withMessage('Subject code should be of format \'AAA000\''),
    query('teacher_id')
        .exists()
        .withMessage('TeacherID is required for the teacherReview')
        .isInt({ min: 1 })
        .withMessage('Invalid Teacher ID found'),
    query('reviewed_at')
        .optional()
        .trim()
        .matches(datetimeRegex)
        .withMessage('Review datetime should be valid datetime of format \'YYYY-MM-DD HH:mm:ss\''),
    query()
        .custom(value => {
            const queryParams = Object.keys(value);
            const allowParams = ['teacher_id', 'subject_code', 'reviewed_at'];
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

    if (req.method === RequestMethods.DELETE) {
        const teacherCheck = req.body.teacher_id === teacherReview.teacher_id;
        // eslint-disable-next-line eqeqeq
        const ratingCheck = req.body.review_rating == teacherReview.overall_rating;
        if (!teacherCheck || !ratingCheck) {
            throw new DeleteFailedException('Teacher review failed to be deleted. Inconsistent details found');
        }
    }

    return teacherReview.reviewed_by_erp === student.erp;
};