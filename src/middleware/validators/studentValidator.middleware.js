const { body } = require('express-validator');
const { Roles } = require('../../utils/enums/roles.utils');
const { Genders } = require('../../utils/enums/genders.utils');
const { yearRegex } = require('../../utils/common.utils');
const EmailValidator = require('deep-email-validator');

exports.createStudentSchema = [
    body('erp')
        .trim()
        .exists()
        .withMessage('Student ERP is required')
        .isLength({ min: 5, max: 5 })
        .withMessage('ERP must be 5 digits')
        .isString()
        .withMessage('ERP must be a string'),
    body('first_name')
        .trim()
        .exists()
        .withMessage('First name is required')
        .isLength({ min: 2 })
        .withMessage('Must be at least 2 chars long'),
    body('last_name')
        .trim()
        .exists()
        .withMessage('Last name is required')
        .isLength({ min: 2 })
        .withMessage('Must be at least 2 chars long'),
    body('gender')
        .trim()
        .exists()
        .withMessage('Gender is required')
        .isIn([...Object.values(Genders)])
        .withMessage('Invalid Gender'),
    body('contact')
        .trim()
        .exists()
        .withMessage('Contact is required')
        .isMobilePhone('en-PK', {strictMode: true})
        .withMessage('Must be a valid Pakistan mobile number along with country code'),
    body('email')
        .trim()
        .exists()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Must be a valid email')
        .custom(async(email) => {
            const {valid} = await EmailValidator.validate(email);
            return valid;
        })
        .withMessage('Email unrecognized')
        .normalizeEmail(),
    body('birthday')
        .trim()
        .exists()
        .withMessage('Birth date is required')
        .isDate({format: 'YYYY-MM-DD', strictMode: true, delimiters: ['-']})
        .withMessage('Birthday must be a valid date of format \'YYYY-MM-DD\''),
    body('password')
        .trim()
        .exists()
        .withMessage('Password is required')
        .notEmpty(),
    body('profile_picture_url')
        .trim()
        .exists()
        .withMessage('Profile picture url is required')
        .isURL()
        .withMessage('Must be a valid url'),
    body('graduation_year')
        .trim()
        .exists()
        .withMessage('Graduation year is required')
        .matches(yearRegex)
        .withMessage('Graduation year must be a valid year'),
    body('uni_email')
        .trim()
        .exists()
        .withMessage('University Email is required')
        .isEmail()
        .withMessage('Must be a valid email')
        .custom(async(email) => {
            const {valid} = await EmailValidator.validate(email);
            return valid;
        })
        .withMessage('Email unrecognized')
        .normalizeEmail(),
    body('hobby_1')
        .trim()
        .exists()
        .withMessage('Hobby 1 id is required for the student')
        .isInt({ min: 1 })
        .withMessage('Invalid HobbyID found'),
    body('hobby_2')
        .trim()
        .exists()
        .withMessage('Hobby 2 id is required for the student')
        .isInt({ min: 1 })
        .withMessage('Invalid HobbyID found'),
    body('hobby_3')
        .trim()
        .exists()
        .withMessage('Hobby 3 id is required for the student')
        .isInt({ min: 1 })
        .withMessage('Invalid HobbyID found'),
    body('interest_1')
        .trim()
        .exists()
        .withMessage('Interest 1 id is required for the student')
        .isInt({ min: 1 })
        .withMessage('Invalid InterestID found'),
    body('interest_2')
        .trim()
        .exists()
        .withMessage('Interest 2 id is required for the student')
        .isInt({ min: 1 })
        .withMessage('Invalid InterestID found'),
    body('interest_3')
        .trim()
        .exists()
        .withMessage('Interest 3 id is required for the student')
        .isInt({ min: 1 })
        .withMessage('Invalid InterestID found'),
    body('campus_id')
        .trim()
        .exists()
        .withMessage('Campus id is required for the student')
        .isInt({ min: 1 })
        .withMessage('Invalid CampusID found'),
    body('program_id')
        .trim()
        .exists()
        .withMessage('Program id is required for the student')
        .isInt({ min: 1 })
        .withMessage('Invalid ProgramID found'),
    body('favourite_campus_hangout_spot')
        .trim()
        .exists()
        .withMessage('Favourite Campus Hangout Spot is required')
        .isLength({max: 45})
        .withMessage('Should be less than 45 characters'),
    body('favourite_campus_activity')
        .trim()
        .exists()
        .withMessage('Favourite Campus Activity is required')
        .isLength({max: 45})
        .withMessage('Should be less than 45 characters'),
    body('current_status')
        .trim()
        .exists()
        .withMessage('Current Student Status id is required for the student')
        .isInt({ min: 1 })
        .withMessage('Invalid StudentStatusID found'),
    body('is_active')
        .optional()
        .trim()
        .isBoolean()
        .withMessage('Invalid boolean. Should be either 0 or 1'),
    body('role')
        .optional()
        .trim()
        .isIn([...Object.values(Roles)])
        .withMessage('Invalid Role type')
];

exports.updateStudentSchema = [
    body('first_name')
        .trim()
        .isLength({ min: 2 })
        .withMessage('Must be at least 2 chars long'),
    body('last_name')
        .trim()
        .isLength({ min: 2 })
        .withMessage('Must be at least 2 chars long'),
    body('gender')
        .trim()
        .isIn([...Object.values(Genders)])
        .withMessage('Invalid Gender'),
    body('contact')
        .trim()
        .isMobilePhone('en-PK', {strictMode: true})
        .withMessage('Must be a valid Pakistan mobile number along with country code'),
    body('email')
        .trim()
        .isEmail()
        .withMessage('Must be a valid email')
        .custom(async(email) => {
            const {valid} = await EmailValidator.validate(email);
            return valid;
        })
        .withMessage('Email unrecognized')
        .normalizeEmail(),
    body('birthday')
        .trim()
        .isDate({format: 'YYYY-MM-DD', strictMode: true, delimiters: ['-']})
        .withMessage('Birthday must be a valid date of format \'YYYY-MM-DD\''),
    body('profile_picture_url')
        .trim()
        .isURL()
        .withMessage('Must be a valid url'),
    body('graduation_year')
        .trim()
        .matches(yearRegex)
        .withMessage('Graduation year must be a valid year'),
    body('uni_email')
        .trim()
        .isEmail()
        .withMessage('Must be a valid email')
        .custom(async(email) => {
            const {valid} = await EmailValidator.validate(email);
            return valid;
        })
        .withMessage('Email unrecognized')
        .normalizeEmail(),
    body('hobby_1')
        .trim()
        .isInt({ min: 1 })
        .withMessage('Invalid HobbyID found'),
    body('hobby_2')
        .trim()
        .isInt({ min: 1 })
        .withMessage('Invalid HobbyID found'),
    body('hobby_3')
        .trim()
        .isInt({ min: 1 })
        .withMessage('Invalid HobbyID found'),
    body('interest_1')
        .trim()
        .isInt({ min: 1 })
        .withMessage('Invalid InterestID found'),
    body('interest_2')
        .trim()
        .isInt({ min: 1 })
        .withMessage('Invalid InterestID found'),
    body('interest_3')
        .trim()
        .isInt({ min: 1 })
        .withMessage('Invalid InterestID found'),
    body('campus_id')
        .trim()
        .isInt({ min: 1 })
        .withMessage('Invalid CampusID found'),
    body('program_id')
        .trim()
        .isInt({ min: 1 })
        .withMessage('Invalid ProgramID found'),
    body('favourite_campus_hangout_spot')
        .trim()
        .isLength({max: 45})
        .withMessage('Should be less than 45 characters'),
    body('favourite_campus_activity')
        .trim()
        .isLength({max: 45})
        .withMessage('Should be less than 45 characters'),
    body('current_status')
        .trim()
        .isInt({ min: 1 })
        .withMessage('Invalid StudentStatusID found'),
    body('is_active')
        .optional()
        .trim()
        .isBoolean()
        .withMessage('Invalid boolean. Should be either 0 or 1'),
    body('role')
        .optional()
        .trim()
        .isIn([...Object.values(Roles)])
        .withMessage('Invalid Role type'),
    body()
        .custom(value => {
            return Object.keys(value).length !== 0;
        })
        .withMessage('Please provide required fields to update')
        .custom(value => {
            const updates = Object.keys(value);
            const allowUpdates = ['first_name', 'last_name', 'gender', 'contact', 'email', 'birthday',
                'profile_picture_url', 'graduation_year', 'uni_email', 'hobby_1', 'hobby_2', 'hobby_3',
                'interest_1', 'interest_2', 'interest_3', 'program_id', 'campus_id', 'current_user_status',
                'favourite_campus_hangout_spot', 'favourite_campus_activity', 'is_active', 'role'];
            return updates.every(update => allowUpdates.includes(update));
        })
        .withMessage('Invalid updates!')
];