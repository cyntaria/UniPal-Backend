const express = require('express');
const router = express.Router();
const { auth, ownerAuth } = require('../middleware/auth.middleware');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');
const {checkValidation} = require('../middleware/validation.middleware');

const savedActivityController = require('../controllers/savedActivity.controller');
const { Roles } = require('../utils/enums/roles.utils');
const { createSavedActivitySchema } = require('../middleware/validators/savedActivityValidator.middleware');

router.post('/:erp/saved-activities',
    auth(Roles.Admin, Roles.ApiUser),
    ownerAuth([Roles.ApiUser]),
    createSavedActivitySchema,
    checkValidation,
    awaitHandlerFactory(savedActivityController.createSavedActivity)
); // localhost:3000/api/API_VERSION/activities/17855/saved-activities

router.delete('/:erp/saved-activities/:id',
    auth(Roles.Admin, Roles.ApiUser),
    ownerAuth([Roles.ApiUser]),
    awaitHandlerFactory(savedActivityController.deleteSavedActivity)
); // localhost:3000/api/API_VERSION/activities/17855/saved-activities/1

module.exports = router;