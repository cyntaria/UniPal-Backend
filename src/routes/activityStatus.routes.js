const express = require('express');
const router = express.Router();
const {auth} = require('../middleware/auth.middleware');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');
const { Roles } = require('../utils/enums/roles.utils');
const {checkValidation} = require('../middleware/validation.middleware');

const activityStatusController = require('../controllers/activityStatus.controller');
const { createActivityStatusSchema, updateActivityStatusSchema } = require('../middleware/validators/activityStatusValidator.middleware');

router.get('/', auth(), awaitHandlerFactory(activityStatusController.getAllActivityStatuses)); // localhost:3000/api/API_VERSION/activity-statuses
router.get('/:id', auth(), awaitHandlerFactory(activityStatusController.getActivityStatusById)); // localhost:3000/api/API_VERSION/activity-statuses/1
router.post('/', auth(Roles.Admin), createActivityStatusSchema, checkValidation, awaitHandlerFactory(activityStatusController.createActivityStatus)); // localhost:3000/api/API_VERSION/activity-statuses
router.patch('/:id', auth(Roles.Admin), updateActivityStatusSchema, checkValidation, awaitHandlerFactory(activityStatusController.updateActivityStatus)); // localhost:3000/api/API_VERSION/activity-statuses/1 , using patch for partial update
router.delete('/:id', auth(Roles.Admin), awaitHandlerFactory(activityStatusController.deleteActivityStatus)); // localhost:3000/api/API_VERSION/activity-statuses/1

module.exports = router;