const express = require('express');
const router = express.Router();
const {auth} = require('../middleware/auth.middleware');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');
const { Roles } = require('../utils/enums/roles.utils');
const {checkValidation} = require('../middleware/validation.middleware');

const classroomController = require('../controllers/classroom.controller');
const { createClassroomSchema, updateClassroomSchema } = require('../middleware/validators/classroomValidator.middleware');

router.get('/',
    auth(Roles.Admin),
    awaitHandlerFactory(classroomController.getAllClassrooms)
); // localhost:3000/api/API_VERSION/classrooms

router.get('/:id',
    auth(Roles.Admin),
    awaitHandlerFactory(classroomController.getClassroomById)
); // localhost:3000/api/API_VERSION/classrooms/1

router.post('/',
    auth(Roles.Admin),
    createClassroomSchema,
    checkValidation,
    awaitHandlerFactory(classroomController.createClassroom)
); // localhost:3000/api/API_VERSION/classrooms

router.patch('/:id',
    auth(Roles.Admin),
    updateClassroomSchema,
    checkValidation,
    awaitHandlerFactory(classroomController.updateClassroom)
); // localhost:3000/api/API_VERSION/classrooms/1 , using patch for partial update

router.delete('/:id',
    auth(Roles.Admin),
    awaitHandlerFactory(classroomController.deleteClassroom)
); // localhost:3000/api/API_VERSION/classrooms/1

module.exports = router;