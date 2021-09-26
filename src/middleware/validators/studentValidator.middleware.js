const { body, query } = require('express-validator');
const { Roles } = require('../../utils/enums/roles.utils');
const { Genders } = require('../../utils/enums/genders.utils');
const { ActivityLocation } = require('../../utils/enums/activityLocation.utils');
const { Privacy } = require('../../utils/enums/privacy.utils');
const { ActivityFrequency } = require('../../utils/enums/activityFrequency.utils');
const { InvolvementType } = require('../../utils/enums/involvementType.utils');
const { yearRegex, ERPRegex, timeRegex, datetimeRegex } = require('../../utils/common.utils');
const EmailValidator = require('deep-email-validator');

exports.createStudentSchema = [
    body('erp')
        .trim()
        .exists()
        .matches(ERPRegex)
        .withMessage('ERP must be 5 digits'),
    body('first_name')
        .trim()
        .exists()
        .withMessage('First name is required')
        .isLength({ min: 2 })
        .withMessage('Must be at least 2 chars long')
        .isAlpha('en-US', {ignore: ' '})
        .withMessage('First name should be all alphabets'),
    body('last_name')
        .trim()
        .exists()
        .withMessage('Last name is required')
        .isLength({ min: 2 })
        .withMessage('Must be at least 2 chars long')
        .isAlpha('en-US', {ignore: ' '})
        .withMessage('Last name should be all alphabets'),
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
        .notEmpty()
        .withMessage('Password must be filled'),
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
        .notEmpty()
        .withMessage('Favourite Campus Hangout Spot must be filled')
        .isLength({max: 45})
        .withMessage('Should be less than 45 chars'),
    body('favourite_campus_activity')
        .trim()
        .exists()
        .withMessage('Favourite Campus Activity is required')
        .notEmpty()
        .withMessage('Favourite Campus Activity must be filled')
        .isLength({max: 45})
        .withMessage('Should be less than 45 chars'),
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
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage('Must be at least 2 chars long')
        .isAlpha('en-US', {ignore: ' '})
        .withMessage('First name should be all alphabets'),
    body('last_name')
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage('Must be at least 2 chars long')
        .isAlpha('en-US', {ignore: ' '})
        .withMessage('Last name should be all alphabets'),
    body('gender')
        .optional()
        .trim()
        .isIn([...Object.values(Genders)])
        .withMessage('Invalid Gender'),
    body('contact')
        .optional()
        .trim()
        .isMobilePhone('en-PK', {strictMode: true})
        .withMessage('Must be a valid Pakistan mobile number along with country code'),
    body('email')
        .optional()
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
        .optional()
        .trim()
        .isDate({format: 'YYYY-MM-DD', strictMode: true, delimiters: ['-']})
        .withMessage('Birthday must be a valid date of format \'YYYY-MM-DD\''),
    body('profile_picture_url')
        .optional()
        .trim()
        .isURL()
        .withMessage('Must be a valid url'),
    body('graduation_year')
        .optional()
        .trim()
        .matches(yearRegex)
        .withMessage('Graduation year must be a valid year'),
    body('uni_email')
        .optional()
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
        .optional()
        .trim()
        .isInt({ min: 1 })
        .withMessage('Invalid HobbyID found'),
    body('hobby_2')
        .optional()
        .trim()
        .isInt({ min: 1 })
        .withMessage('Invalid HobbyID found'),
    body('hobby_3')
        .optional()
        .trim()
        .isInt({ min: 1 })
        .withMessage('Invalid HobbyID found'),
    body('interest_1')
        .optional()
        .trim()
        .isInt({ min: 1 })
        .withMessage('Invalid InterestID found'),
    body('interest_2')
        .optional()
        .trim()
        .isInt({ min: 1 })
        .withMessage('Invalid InterestID found'),
    body('interest_3')
        .optional()
        .trim()
        .isInt({ min: 1 })
        .withMessage('Invalid InterestID found'),
    body('campus_id')
        .optional()
        .trim()
        .isInt({ min: 1 })
        .withMessage('Invalid CampusID found'),
    body('program_id')
        .optional()
        .trim()
        .isInt({ min: 1 })
        .withMessage('Invalid ProgramID found'),
    body('favourite_campus_hangout_spot')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Favourite Campus Hangout Spot must be filled')
        .isLength({max: 45})
        .withMessage('Should be less than 45 chars'),
    body('favourite_campus_activity')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Favourite Campus Activity must be filled')
        .isLength({max: 45})
        .withMessage('Should be less than 45 chars'),
    body('current_status')
        .optional()
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

exports.getStudentsQuerySchema = [
    query('first_name')
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage('Must be at least 2 chars long')
        .isAlpha('en-US', {ignore: ' '})
        .withMessage('First name should be all alphabets'),
    query('last_name')
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage('Must be at least 2 chars long')
        .isAlpha('en-US', {ignore: ' '})
        .withMessage('Last name should be all alphabets'),
    query('gender')
        .optional()
        .trim()
        .isIn([...Object.values(Genders)])
        .withMessage('Invalid Gender'),
    query('birthday')
        .optional()
        .trim()
        .isDate({format: 'YYYY-MM-DD', strictMode: true, delimiters: ['-']})
        .withMessage('Birthday must be a valid date of format \'YYYY-MM-DD\''),
    query('graduation_year')
        .optional()
        .trim()
        .matches(yearRegex)
        .withMessage('Graduation year must be a valid year'),
    query('hobby_1')
        .optional()
        .trim()
        .isInt({ min: 1 })
        .withMessage('Invalid HobbyID found'),
    query('hobby_2')
        .optional()
        .trim()
        .isInt({ min: 1 })
        .withMessage('Invalid HobbyID found'),
    query('hobby_3')
        .optional()
        .trim()
        .isInt({ min: 1 })
        .withMessage('Invalid HobbyID found'),
    query('interest_1')
        .optional()
        .trim()
        .isInt({ min: 1 })
        .withMessage('Invalid InterestID found'),
    query('interest_2')
        .optional()
        .trim()
        .isInt({ min: 1 })
        .withMessage('Invalid InterestID found'),
    query('interest_3')
        .optional()
        .trim()
        .isInt({ min: 1 })
        .withMessage('Invalid InterestID found'),
    query('campus_id')
        .optional()
        .trim()
        .isInt({ min: 1 })
        .withMessage('Invalid CampusID found'),
    query('program_id')
        .optional()
        .trim()
        .isInt({ min: 1 })
        .withMessage('Invalid ProgramID found'),
    query('favourite_campus_hangout_spot')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Favourite Campus Hangout Spot must be filled')
        .isLength({max: 45})
        .withMessage('Should be less than 45 chars'),
    query('favourite_campus_activity')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Favourite Campus Activity must be filled')
        .isLength({max: 45})
        .withMessage('Should be less than 45 chars'),
    query('current_status')
        .optional()
        .trim()
        .isInt({ min: 1 })
        .withMessage('Invalid StudentStatusID found'),
    query('is_active')
        .optional()
        .trim()
        .isBoolean()
        .withMessage('Invalid boolean. Should be either 0 or 1'),
    query('role')
        .optional()
        .trim()
        .isIn([...Object.values(Roles)])
        .withMessage('Invalid Role type'),
    query()
        .custom(value => {
            const queryParams = Object.keys(value);
            const allowParams = ['first_name', 'last_name', 'gender', 'birthday',
                'graduation_year', 'uni_email', 'hobby_1', 'hobby_2', 'hobby_3',
                'interest_1', 'interest_2', 'interest_3', 'program_id', 'campus_id', 'current_user_status',
                'favourite_campus_hangout_spot', 'favourite_campus_activity', 'role'];
            return queryParams.every(param => allowParams.includes(param));
        })
        .withMessage('Invalid query params!')
];

exports.getOrganizedActivitiesQuerySchema = [
    query('location')
        .optional()
        .trim()
        .isIn([...Object.values(ActivityLocation)])
        .withMessage('Invalid Location'),
    query('frequency')
        .optional()
        .trim()
        .isIn([...Object.values(ActivityFrequency)])
        .withMessage('Invalid Frequency'),
    query('privacy')
        .optional()
        .trim()
        .isIn([...Object.values(Privacy)])
        .withMessage('Invalid Privacy'),
    query('monday')
        .optional()
        .trim()
        .isBoolean()
        .withMessage('Invalid boolean. Should be either 0 or 1'),
    query('tuesday')
        .optional()
        .trim()
        .isBoolean()
        .withMessage('Invalid boolean. Should be either 0 or 1'),
    query('wednesday')
        .optional()
        .trim()
        .isBoolean()
        .withMessage('Invalid boolean. Should be either 0 or 1'),
    query('thursday')
        .optional()
        .trim()
        .isBoolean()
        .withMessage('Invalid boolean. Should be either 0 or 1'),
    query('friday')
        .optional()
        .trim()
        .isBoolean()
        .withMessage('Invalid boolean. Should be either 0 or 1'),
    query('saturday')
        .optional()
        .trim()
        .isBoolean()
        .withMessage('Invalid boolean. Should be either 0 or 1'),
    query('sunday')
        .optional()
        .trim()
        .isBoolean()
        .withMessage('Invalid boolean. Should be either 0 or 1'),
    query('month_number')
        .optional()
        .trim()
        .isInt({min: 1, max: 12})
        .withMessage('Invalid month number'),
    query('group_size')
        .optional()
        .trim()
        .isInt({min: 0})
        .withMessage('Invalid group size'),
    query('happens_at')
        .optional()
        .trim()
        .matches(timeRegex)
        .withMessage('Activity happening time must be of valid format \'hh:mm:ss\''),
    query('activity_type_id')
        .optional()
        .trim()
        .isInt({ min: 1 })
        .withMessage('Invalid Activity Type ID found'),
    query('activity_status_id')
        .optional()
        .trim()
        .isInt({ min: 1 })
        .withMessage('Invalid Activity Status ID found'),
    query('campus_spot_id')
        .optional()
        .trim()
        .isInt({ min: 1 })
        .withMessage('Invalid Campus Spot ID found'),
    query()
        .custom(value => {
            const queryParams = Object.keys(value);
            const allowParams = ['location', 'privacy', 'frequency',
                'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
                'month_number', 'group_size', 'happens_at',
                'activity_type_id', 'activity_status_id', 'campus_spot_id'];
            return queryParams.every(param => allowParams.includes(param));
        })
        .withMessage('Invalid query params!')
];

exports.getAttendedActivitiesQuerySchema = [
    query('involvement_type')
        .optional()
        .trim()
        .isIn([...Object.values(InvolvementType)])
        .withMessage('Invalid Involvement Type'),
    query()
        .custom(value => {
            const queryParams = Object.keys(value);
            const allowParams = ['involvement_type'];
            return queryParams.every(param => allowParams.includes(param));
        })
        .withMessage('Invalid query params!')
];

exports.getSavedActivitiesQuerySchema = [
    query('location')
        .optional()
        .trim()
        .isIn([...Object.values(ActivityLocation)])
        .withMessage('Invalid Location'),
    query('frequency')
        .optional()
        .trim()
        .isIn([...Object.values(ActivityFrequency)])
        .withMessage('Invalid Frequency'),
    query('privacy')
        .optional()
        .trim()
        .isIn([...Object.values(Privacy)])
        .withMessage('Invalid Privacy'),
    query('monday')
        .optional()
        .trim()
        .isBoolean()
        .withMessage('Invalid boolean. Should be either 0 or 1'),
    query('tuesday')
        .optional()
        .trim()
        .isBoolean()
        .withMessage('Invalid boolean. Should be either 0 or 1'),
    query('wednesday')
        .optional()
        .trim()
        .isBoolean()
        .withMessage('Invalid boolean. Should be either 0 or 1'),
    query('thursday')
        .optional()
        .trim()
        .isBoolean()
        .withMessage('Invalid boolean. Should be either 0 or 1'),
    query('friday')
        .optional()
        .trim()
        .isBoolean()
        .withMessage('Invalid boolean. Should be either 0 or 1'),
    query('saturday')
        .optional()
        .trim()
        .isBoolean()
        .withMessage('Invalid boolean. Should be either 0 or 1'),
    query('sunday')
        .optional()
        .trim()
        .isBoolean()
        .withMessage('Invalid boolean. Should be either 0 or 1'),
    query('month_number')
        .optional()
        .trim()
        .isInt({min: 1, max: 12})
        .withMessage('Invalid month number'),
    query('group_size')
        .optional()
        .trim()
        .isInt({min: 0})
        .withMessage('Invalid group size'),
    query('happens_at')
        .optional()
        .trim()
        .matches(timeRegex)
        .withMessage('Activity happening time must be of valid format \'hh:mm:ss\''),
    query('activity_type_id')
        .optional()
        .trim()
        .isInt({ min: 1 })
        .withMessage('Invalid Activity Type ID found'),
    query('activity_status_id')
        .optional()
        .trim()
        .isInt({ min: 1 })
        .withMessage('Invalid Activity Status ID found'),
    query('campus_spot_id')
        .optional()
        .trim()
        .isInt({ min: 1 })
        .withMessage('Invalid Campus Spot ID found'),
    query('organizer_erp')
        .optional()
        .trim()
        .matches(ERPRegex)
        .withMessage('ERP must be 5 digits'),
    query('saved_at')
        .optional()
        .trim()
        .matches(datetimeRegex)
        .withMessage('Saved datetime should be valid datetime of format \'YYYY-MM-DD HH:mm:ss\''),
    query()
        .custom(value => {
            const queryParams = Object.keys(value);
            const allowParams = ['location', 'privacy', 'frequency',
                'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
                'month_number', 'group_size', 'happens_at', 'organizer_erp',
                'activity_type_id', 'activity_status_id', 'campus_spot_id', 'saved_at'];
            return queryParams.every(param => allowParams.includes(param));
        })
        .withMessage('Invalid query params!')
];