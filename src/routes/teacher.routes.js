const express = require('express');
const router = express.Router();
const {auth} = require('../middleware/auth.middleware');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');
const { Roles } = require('../utils/enums/roles.utils');
const {checkValidation} = require('../middleware/validation.middleware');

const teacherController = require('../controllers/teacher.controller');
const { createTeacherSchema, updateTeacherSchema } = require('../middleware/validators/teacherValidator.middleware');

router.get('/',
    auth(Roles.Admin),
    awaitHandlerFactory(teacherController.getAllTeachers)
); // localhost:3000/api/API_VERSION/teachers

router.get('/:id',
    auth(Roles.Admin),
    awaitHandlerFactory(teacherController.getTeacherById)
); // localhost:3000/api/API_VERSION/teachers/1

router.post('/',
    auth(Roles.Admin),
    createTeacherSchema,
    checkValidation,
    awaitHandlerFactory(teacherController.createTeacher)
); // localhost:3000/api/API_VERSION/teachers

router.patch('/:id',
    auth(Roles.Admin),
    updateTeacherSchema,
    checkValidation,
    awaitHandlerFactory(teacherController.updateTeacher)
); // localhost:3000/api/API_VERSION/teachers/1 , using patch for partial update

router.delete('/:id',
    auth(Roles.Admin),
    awaitHandlerFactory(teacherController.deleteTeacher)
); // localhost:3000/api/API_VERSION/teachers/1

module.exports = router;