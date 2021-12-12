const { body, query } = require('express-validator');
const { ClassERPRegex, CourseCodeRegex } = require('../../utils/common.utils');
const { Days } = require('../../utils/enums/days.utils');

exports.createClassSchema = [
    body('class_erp')
        .trim()
        .exists()
        .withMessage('Class ERP is required')
        .matches(ClassERPRegex)
        .withMessage('Class ERP must be 4 digits'),
    body('semester')
        .trim()
        .exists()
        .withMessage('Semester is required')
        .isLength({min: 4})
        .withMessage('Semester should be atleast 4 letters')
        .isAlphanumeric('en-US', {ignore: ' -'})
        .withMessage('Semester should be alphanumeric'),
    body('classroom_id')
        .exists()
        .withMessage('ClassroomID is required for the class')
        .isInt({ min: 1 })
        .withMessage('Invalid Classroom ID found'),
    body('subject_code')
        .trim()
        .exists()
        .withMessage('Subject code is required')
        .matches(CourseCodeRegex)
        .withMessage('Subject code should be of format \'AAA000\''),
    body('teacher_id')
        .exists()
        .withMessage('TeacherID is required for the class')
        .isInt({ min: 1 })
        .withMessage('Invalid Teacher ID found'),
    body('parent_class_erp')
        .optional()
        .trim()
        .matches(ClassERPRegex)
        .withMessage('Class ERP must be 4 digits'),
    body('timeslot_1')
        .exists()
        .withMessage('Timeslot 1 ID is required for the class')
        .isInt({ min: 1 })
        .withMessage('Invalid Timeslot ID found'),
    body('timeslot_2')
        .exists()
        .withMessage('Timeslot 2 ID is required for the class')
        .isInt({ min: 1 })
        .withMessage('Invalid Timeslot ID found'),
    body('day_1')
        .trim()
        .exists()
        .withMessage('Day 1 is required')
        .isIn([...Object.values(Days)])
        .withMessage('Invalid Day 1'),
    body('day_2')
        .trim()
        .exists()
        .withMessage('Day 2 is required')
        .isIn([...Object.values(Days)])
        .withMessage('Invalid Day 2'),
    body('term_id')
        .exists()
        .withMessage('TermID is required for the class')
        .isInt({ min: 1 })
        .withMessage('Invalid Term ID found')
];

exports.createManyClassSchema = [
    body('classes')
        .exists()
        .withMessage('Classes are required')
        .bail()
        .isArray({min: 1})
        .withMessage('Classes must be an array like [{class_erp : "5755", semester: "BBA-4", ...},[...]]')
        .bail(),
    body('classes.*')
        .notEmpty()
        .withMessage('Class details are missing')
        .bail()
        .isObject()
        .withMessage('Class must be an object like {class_erp : "5755", semester: "BBA-4", ...}')
        .bail(),
    body('classes.*.class_erp')
        .trim()
        .exists()
        .withMessage('Class ERP is required')
        .matches(ClassERPRegex)
        .withMessage('Class ERP must be 4 digits'),
    body('classes.*.semester')
        .trim()
        .exists()
        .withMessage('Semester is required')
        .isLength({min: 4})
        .withMessage('Semester should be atleast 4 letters')
        .isAlphanumeric('en-US', {ignore: ' -'})
        .withMessage('Semester should be alphanumeric'),
    body('classes.*.classroom_id')
        .exists()
        .withMessage('ClassroomID is required for the class')
        .isInt({ min: 1 })
        .withMessage('Invalid Classroom ID found'),
    body('classes.*.subject_code')
        .trim()
        .exists()
        .withMessage('Subject code is required')
        .matches(CourseCodeRegex)
        .withMessage('Subject code should be of format \'AAA000\''),
    body('classes.*.teacher_id')
        .exists()
        .withMessage('TeacherID is required for the class')
        .isInt({ min: 1 })
        .withMessage('Invalid Teacher ID found'),
    body('classes.*.timeslot_1')
        .exists()
        .withMessage('Timeslot 1 ID is required for the class')
        .isInt({ min: 1 })
        .withMessage('Invalid Timeslot ID found'),
    body('classes.*.timeslot_2')
        .exists()
        .withMessage('Timeslot 2 ID is required for the class')
        .isInt({ min: 1 })
        .withMessage('Invalid Timeslot ID found'),
    body('classes.*.day_1')
        .trim()
        .exists()
        .withMessage('Day 1 is required')
        .isIn([...Object.values(Days)])
        .withMessage('Invalid Day 1'),
    body('classes.*.day_2')
        .trim()
        .exists()
        .withMessage('Day 2 is required')
        .isIn([...Object.values(Days)])
        .withMessage('Invalid Day 2'),
    body('classes.*.term_id')
        .exists()
        .withMessage('TermID is required for the class')
        .isInt({ min: 1 })
        .withMessage('Invalid Term ID found'),
    body('classes.*.parent_class_erp')
        .exists({checkNull: true})
        .withMessage('Specify a parent class erp or make it ("") if optional')
        .matches(ClassERPRegex)
        .withMessage('Parent Class ERP must be 4 digits')
];

exports.updateClassSchema = [
    body('semester')
        .optional()
        .trim()
        .isLength({min: 4})
        .withMessage('Semester should be atleast 4 letters')
        .isAlphanumeric('en-US', {ignore: ' -'})
        .withMessage('Semester should be alphanumeric'),
    body('classroom_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Invalid Classroom ID found'),
    body('subject_code')
        .optional()
        .trim()
        .matches(CourseCodeRegex)
        .withMessage('Subject code should be of format \'AAA000\''),
    body('teacher_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Invalid Teacher ID found'),
    body('parent_class_erp')
        .optional()
        .trim()
        .matches(ClassERPRegex)
        .withMessage('Class ERP must be 4 digits'),
    body('timeslot_1')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Invalid Timeslot ID found'),
    body('timeslot_2')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Invalid Timeslot ID found'),
    body('day_1')
        .optional()
        .trim()
        .isIn([...Object.values(Days)])
        .withMessage('Invalid Day 1'),
    body('day_2')
        .optional()
        .trim()
        .isIn([...Object.values(Days)])
        .withMessage('Invalid Day 2'),
    body()
        .custom(value => {
            return Object.keys(value).length !== 0;
        })
        .withMessage('Please provide required fields to update')
        .custom(value => {
            const updates = Object.keys(value);
            const allowUpdates = ["semester", "classroom_id", "subject_code", "teacher_id",
                "parent_class_erp", "timeslot_1", "timeslot_2", "day_1", "day_2"];
            return updates.every(update => allowUpdates.includes(update));
        })
        .withMessage('Invalid updates!')
];

exports.getClassesQuerySchema = [
    query('semester')
        .optional()
        .trim()
        .isLength({min: 4})
        .withMessage('Semester should be atleast 4 letters')
        .isAlphanumeric('en-US', {ignore: ' -'})
        .withMessage('Semester should be alphanumeric'),
    query('subject_code')
        .optional()
        .trim()
        .matches(CourseCodeRegex)
        .withMessage('Subject code should be of format \'AAA000\''),
    query('teacher_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Invalid Teacher ID found'),
    query('term_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Invalid Term ID found'),
    query()
        .custom(value => {
            const queryParams = Object.keys(value);
            const allowParams = ['semester', 'subject_code', 'teacher_id', 'term_id'];
            return queryParams.every(param => allowParams.includes(param));
        })
        .withMessage('Invalid query params!')
];