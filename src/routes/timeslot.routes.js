const express = require('express');
const router = express.Router();
const {auth} = require('../middleware/auth.middleware');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');
const { Roles } = require('../utils/enums/roles.utils');
const {checkValidation} = require('../middleware/validation.middleware');

const timeslotController = require('../controllers/timeslot.controller');
const { createTimeslotSchema, updateTimeslotSchema } = require('../middleware/validators/timeslotValidator.middleware');

router.get('/',
    auth(Roles.Admin),
    awaitHandlerFactory(timeslotController.getAllTimeslots)
); // localhost:3000/api/API_VERSION/timeslots

router.get('/:id',
    auth(Roles.Admin),
    awaitHandlerFactory(timeslotController.getTimeslotById)
); // localhost:3000/api/API_VERSION/timeslots/1

router.post('/',
    auth(Roles.Admin),
    createTimeslotSchema,
    checkValidation,
    awaitHandlerFactory(timeslotController.createTimeslot)
); // localhost:3000/api/API_VERSION/timeslots

router.patch('/:id',
    auth(Roles.Admin),
    updateTimeslotSchema,
    checkValidation,
    awaitHandlerFactory(timeslotController.updateTimeslot)
); // localhost:3000/api/API_VERSION/timeslots/1 , using patch for partial update

router.delete('/:id',
    auth(Roles.Admin),
    awaitHandlerFactory(timeslotController.deleteTimeslot)
); // localhost:3000/api/API_VERSION/timeslots/1

module.exports = router;