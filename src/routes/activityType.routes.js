const express = require('express');
const router = express.Router();
const {auth} = require('../middleware/auth.middleware');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');
const { Roles } = require('../utils/enums/roles.utils');
const {checkValidation} = require('../middleware/validation.middleware');

const activityTypeController = require('../controllers/activityType.controller');
const { createActivityTypeSchema, updateActivityTypeSchema } = require('../middleware/validators/activityTypeValidator.middleware');

router.get('/',
    auth(),
    awaitHandlerFactory(activityTypeController.getAllActivityTypes)
); // localhost:3000/api/API_VERSION/activity-types

router.get('/:id',
    auth(),
    awaitHandlerFactory(activityTypeController.getActivityTypeById)
); // localhost:3000/api/API_VERSION/activity-types/1

router.post('/',
    auth(Roles.Admin),
    createActivityTypeSchema,
    checkValidation,
    awaitHandlerFactory(activityTypeController.createActivityType)
); // localhost:3000/api/API_VERSION/activity-types

router.patch('/:id',
    auth(Roles.Admin),
    updateActivityTypeSchema,
    checkValidation,
    awaitHandlerFactory(activityTypeController.updateActivityType)
); // localhost:3000/api/API_VERSION/activity-types/1 , using patch for partial update

router.delete('/:id',
    auth(Roles.Admin),
    awaitHandlerFactory(activityTypeController.deleteActivityType)
); // localhost:3000/api/API_VERSION/activity-types/1

module.exports = router;