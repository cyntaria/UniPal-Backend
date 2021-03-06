const express = require('express');
const router = express.Router();
const { auth, ownerAuth } = require('../middleware/auth.middleware');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');
const {checkValidation} = require('../middleware/validation.middleware');

const activityController = require('../controllers/activity.controller');
const { Roles } = require('../utils/enums/roles.utils');
const {
    createActivitySchema,
    updateActivitySchema,
    getActivitiesQuerySchema,
    getActivitiesAttendeesQuerySchema,
    activityOwnerCheck
} = require('../middleware/validators/activityValidator.middleware');

router.get('/',
    auth(),
    getActivitiesQuerySchema,
    checkValidation,
    awaitHandlerFactory(activityController.getAllActivities)
); // localhost:3000/api/API_VERSION/activities

router.get('/:id',
    auth(),
    awaitHandlerFactory(activityController.getActivityById)
); // localhost:3000/api/API_VERSION/activities/1

router.get('/:id/attendees',
    auth(),
    getActivitiesAttendeesQuerySchema,
    checkValidation,
    awaitHandlerFactory(activityController.getActivityAttendees)
); // localhost:3000/api/API_VERSION/activities/1/attendees

router.post('/',
    auth(Roles.Admin, Roles.ApiUser),
    createActivitySchema,
    checkValidation,
    ownerAuth([Roles.ApiUser], activityOwnerCheck),
    awaitHandlerFactory(activityController.createActivity)
); // localhost:3000/api/API_VERSION/activities

router.patch('/:id',
    auth(Roles.Admin, Roles.ApiUser),
    updateActivitySchema,
    checkValidation,
    ownerAuth([Roles.ApiUser], activityOwnerCheck),
    awaitHandlerFactory(activityController.updateActivity)
); // localhost:3000/api/API_VERSION/activities/1

router.delete('/:id',
    auth(Roles.Admin, Roles.ApiUser),
    ownerAuth([Roles.ApiUser], activityOwnerCheck),
    awaitHandlerFactory(activityController.deleteActivity)
); // localhost:3000/api/API_VERSION/activities/1

module.exports = router;