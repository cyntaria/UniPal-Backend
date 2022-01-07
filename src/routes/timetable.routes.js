const express = require('express');
const router = express.Router();
const {auth, ownerAuth} = require('../middleware/auth.middleware');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');
const { Roles } = require('../utils/enums/roles.utils');
const {checkValidation} = require('../middleware/validation.middleware');

const timetableController = require('../controllers/timetable.controller');
const {
    getTimetablesQuerySchema,
    timetableQueryCheck,
    createTimetableSchema,
    generateTimetablesSchema,
    updateTimetableSchema,
    updateTimetableClassesSchema,
    timetableOwnerCheck
} = require('../middleware/validators/timetableValidator.middleware');

router.get('/',
    auth(Roles.Admin, Roles.ApiUser),
    getTimetablesQuerySchema,
    checkValidation,
    ownerAuth([Roles.ApiUser], timetableQueryCheck),
    awaitHandlerFactory(timetableController.getAllTimetables)
); // localhost:3000/api/API_VERSION/timetables

router.get('/:id',
    auth(),
    awaitHandlerFactory(timetableController.getTimetableById)
); // localhost:3000/api/API_VERSION/timetables/1

router.post('/',
    auth(Roles.ApiUser, Roles.Admin),
    createTimetableSchema,
    checkValidation,
    ownerAuth([Roles.ApiUser, Roles.Admin], timetableOwnerCheck),
    awaitHandlerFactory(timetableController.createTimetable)
); // localhost:3000/api/API_VERSION/timetables

router.post('/generate',
    auth(),
    generateTimetablesSchema,
    checkValidation,
    awaitHandlerFactory(timetableController.generateTimetables)
); // localhost:3000/api/API_VERSION/timetables/generate

router.patch('/:id',
    auth(Roles.ApiUser, Roles.Admin),
    updateTimetableSchema,
    checkValidation,
    ownerAuth([Roles.ApiUser, Roles.Admin], timetableOwnerCheck),
    awaitHandlerFactory(timetableController.updateTimetable)
); // localhost:3000/api/API_VERSION/timetables/1, using patch for partial update

router.patch('/:id/classes',
    auth(Roles.ApiUser, Roles.Admin),
    updateTimetableClassesSchema,
    checkValidation,
    ownerAuth([Roles.ApiUser, Roles.Admin], timetableOwnerCheck),
    awaitHandlerFactory(timetableController.updateTimetableClasses)
); // localhost:3000/api/API_VERSION/timetables/1/classes, using patch for partial update

router.delete('/:id',
    auth(Roles.ApiUser, Roles.Admin),
    ownerAuth([Roles.ApiUser, Roles.Admin], timetableOwnerCheck),
    awaitHandlerFactory(timetableController.deleteTimetable)
); // localhost:3000/api/API_VERSION/timetables/1

module.exports = router;