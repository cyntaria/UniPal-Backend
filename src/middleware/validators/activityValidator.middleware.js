const { body, query } = require('express-validator');
const { ActivityLocation } = require('../../utils/enums/activityLocation.utils');
const { Privacy } = require('../../utils/enums/privacy.utils');
const { ActivityFrequency } = require('../../utils/enums/activityFrequency.utils');
const { ERPRegex, timeRegex, datetimeRegex } = require('../../utils/common.utils');

exports.createActivitySchema = [
    body('location')
        .trim()
        .exists()
        .withMessage('Location is required')
        .isIn([...Object.values(ActivityLocation)])
        .withMessage('Invalid Location'),
    body('frequency')
        .trim()
        .exists()
        .withMessage('Frequency is required')
        .isIn([...Object.values(ActivityFrequency)])
        .withMessage('Invalid Frequency'),
    body('privacy')
        .trim()
        .exists()
        .withMessage('Privacy is required')
        .isIn([...Object.values(Privacy)])
        .withMessage('Invalid Privacy'),
    body('monday')
        .optional()
        .trim()
        .isBoolean()
        .withMessage('Invalid boolean. Should be either 0 or 1'),
    body('tuesday')
        .optional()
        .trim()
        .isBoolean()
        .withMessage('Invalid boolean. Should be either 0 or 1'),
    body('wednesday')
        .optional()
        .trim()
        .isBoolean()
        .withMessage('Invalid boolean. Should be either 0 or 1'),
    body('thursday')
        .optional()
        .trim()
        .isBoolean()
        .withMessage('Invalid boolean. Should be either 0 or 1'),
    body('friday')
        .optional()
        .trim()
        .isBoolean()
        .withMessage('Invalid boolean. Should be either 0 or 1'),
    body('saturday')
        .optional()
        .trim()
        .isBoolean()
        .withMessage('Invalid boolean. Should be either 0 or 1'),
    body('sunday')
        .optional()
        .trim()
        .isBoolean()
        .withMessage('Invalid boolean. Should be either 0 or 1'),
    body()
        .custom((body, {req}) => {
            const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
            const checkDaysDefined = (day) => day in body;
            if (!days.every(checkDaysDefined)) req.body.monday = 1; // if no day specified, default to monday
            return true;
        }),
    body('month_number')
        .trim()
        .exists()
        .withMessage('Month number is required')
        .isInt({min: 1, max: 12})
        .withMessage('Invalid month number'),
    body('group_size')
        .trim()
        .exists()
        .withMessage('Group size is required')
        .isInt({min: 0})
        .withMessage('Invalid group size'),
    body('happens_at')
        .trim()
        .exists()
        .withMessage('Activity happening time is required')
        .matches(timeRegex)
        .withMessage('Activity happening time must be of valid format \'hh:mm\''),
    body('additional_directions')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Additional directions should be less than 100 characters'),
    body('activity_type_id')
        .trim()
        .exists()
        .withMessage('Activity type id is required for the activity')
        .isInt({ min: 1 })
        .withMessage('Invalid Activity Type ID found'),
    body('activity_status_id')
        .trim()
        .exists()
        .withMessage('Activity status id is required for the activity')
        .isInt({ min: 1 })
        .withMessage('Invalid Activity Status ID found'),
    body('campus_spot_id')
        .optional()
        .trim()
        .isInt({ min: 1 })
        .withMessage('Invalid Campus Spot ID found'),
    body('organizer_erp')
        .trim()
        .exists()
        .withMessage('Organizer ERP is required')
        .matches(ERPRegex)
        .withMessage('ERP must be 5 digits'),
    body('created_at')
        .trim()
        .exists()
        .withMessage('Creation datetime is required')
        .matches(datetimeRegex)
        .withMessage('Creation datetime should be valid datetime of format \'YYYY-MM-DD HH:mm:ss\'')
];

exports.updateActivitySchema = [
    body('location')
        .optional()
        .trim()
        .isIn([...Object.values(ActivityLocation)])
        .withMessage('Invalid Location'),
    body('frequency')
        .optional()
        .trim()
        .isIn([...Object.values(ActivityFrequency)])
        .withMessage('Invalid Frequency'),
    body('privacy')
        .optional()
        .trim()
        .isIn([...Object.values(Privacy)])
        .withMessage('Invalid Privacy'),
    body('monday')
        .optional()
        .trim()
        .isBoolean()
        .withMessage('Invalid boolean. Should be either 0 or 1'),
    body('tuesday')
        .optional()
        .trim()
        .isBoolean()
        .withMessage('Invalid boolean. Should be either 0 or 1'),
    body('wednesday')
        .optional()
        .trim()
        .isBoolean()
        .withMessage('Invalid boolean. Should be either 0 or 1'),
    body('thursday')
        .optional()
        .trim()
        .isBoolean()
        .withMessage('Invalid boolean. Should be either 0 or 1'),
    body('friday')
        .optional()
        .trim()
        .isBoolean()
        .withMessage('Invalid boolean. Should be either 0 or 1'),
    body('saturday')
        .optional()
        .trim()
        .isBoolean()
        .withMessage('Invalid boolean. Should be either 0 or 1'),
    body('sunday')
        .optional()
        .trim()
        .isBoolean()
        .withMessage('Invalid boolean. Should be either 0 or 1'),
    body('month_number')
        .optional()
        .trim()
        .isInt({min: 1, max: 12})
        .withMessage('Invalid month number'),
    body('group_size')
        .optional()
        .trim()
        .isInt({min: 0})
        .withMessage('Invalid group size'),
    body('happens_at')
        .optional()
        .trim()
        .matches(timeRegex)
        .withMessage('Activity happening time must be of valid format \'hh:mm\''),
    body('additional_directions')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Additional directions should be less than 100 characters'),
    body('activity_type_id')
        .optional()
        .trim()
        .isInt({ min: 1 })
        .withMessage('Invalid Activity Type ID found'),
    body('activity_status_id')
        .optional()
        .trim()
        .isInt({ min: 1 })
        .withMessage('Invalid Activity Status ID found'),
    body('campus_spot_id')
        .optional()
        .trim()
        .isInt({ min: 1 })
        .withMessage('Invalid Campus Spot ID found'),
    body()
        .custom(value => {
            return Object.keys(value).length !== 0;
        })
        .withMessage('Please provide required fields to update')
        .custom(value => {
            const updates = Object.keys(value);
            const allowUpdates = ['location', 'privacy', 'frequency',
                'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
                'month_number', 'group_size', 'happens_at', 'additional_directions',
                'activity_type_id', 'activity_status_id', 'campus_spot_id'];
            return updates.every(update => allowUpdates.includes(update));
        })
        .withMessage('Invalid updates!')
];

exports.getActivitiesQuerySchema = [
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
        .withMessage('Activity happening time must be of valid format \'hh:mm\''),
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
    query()
        .custom(value => {
            const queryParams = Object.keys(value);
            const allowParams = ['location', 'privacy', 'frequency',
                'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
                'month_number', 'group_size', 'happens_at', 'additional_directions',
                'activity_type_id', 'activity_status_id', 'campus_spot_id'];
            return queryParams.every(param => allowParams.includes(param));
        })
        .withMessage('Invalid query params!')
];

exports.activityOwnerCheck = (body, erp) => body.organizer_erp === erp;