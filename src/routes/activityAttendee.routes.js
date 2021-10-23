const express = require('express');
const router = express.Router();
const { auth, ownerAuth } = require('../middleware/auth.middleware');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');
const {checkValidation} = require('../middleware/validation.middleware');

const activityAttendeeController = require('../controllers/activityAttendee.controller');
const { Roles } = require('../utils/enums/roles.utils');
const {
    createActivityAttendeeSchema,
    updateActivityAttendeeSchema,
    activityAttendeeOwnerCheck
} = require('../middleware/validators/activityAttendeeValidator.middleware');

router.post('/:id/attendees',
    auth(Roles.Admin, Roles.ApiUser),
    createActivityAttendeeSchema,
    checkValidation,
    ownerAuth([Roles.ApiUser], activityAttendeeOwnerCheck),
    awaitHandlerFactory(activityAttendeeController.createActivityAttendee)
); // localhost:3000/api/API_VERSION/activities/1/attendees

router.patch('/:id/attendees/:student_erp',
    auth(Roles.Admin, Roles.ApiUser),
    updateActivityAttendeeSchema,
    checkValidation,
    ownerAuth([Roles.ApiUser], activityAttendeeOwnerCheck),
    awaitHandlerFactory(activityAttendeeController.updateActivityAttendee)
); // localhost:3000/api/API_VERSION/activities/1/attendees/17855

router.delete('/:id/attendees/:student_erp',
    auth(Roles.Admin, Roles.ApiUser),
    ownerAuth([Roles.ApiUser], activityAttendeeOwnerCheck),
    awaitHandlerFactory(activityAttendeeController.deleteActivityAttendee)
); // localhost:3000/api/API_VERSION/activities/1/attendees/17855

module.exports = router;