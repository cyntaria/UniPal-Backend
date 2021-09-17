const express = require('express');
const router = express.Router();
const { auth, ownerAuth } = require('../middleware/auth.middleware');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');

const activityController = require('../controllers/activity.controller');
const { Roles } = require('../utils/enums/roles.utils');
const {
    createActivitySchema,
    updateActivitySchema,
    getActivitiesQuerySchema,
    activityOwnerCheck
} = require('../middleware/validators/activityValidator.middleware');

router.get('/', auth(), getActivitiesQuerySchema, awaitHandlerFactory(activityController.getAllActivities)); // localhost:3000/api/API_VERSION/activities
router.get('/:id', auth(), awaitHandlerFactory(activityController.getActivityById)); // localhost:3000/api/API_VERSION/activities/1
router.post('/', auth(Roles.Admin, Roles.ApiUser), ownerAuth([Roles.ApiUser], activityOwnerCheck), createActivitySchema, awaitHandlerFactory(activityController.createActivity)); // localhost:3000/api/API_VERSION/activities
router.patch('/:id', auth(), updateActivitySchema, awaitHandlerFactory(activityController.updateActivity)); // localhost:3000/api/API_VERSION/activities/1
router.delete('/:id', auth(), awaitHandlerFactory(activityController.deleteActivity)); // localhost:3000/api/API_VERSION/activities/1

module.exports = router;