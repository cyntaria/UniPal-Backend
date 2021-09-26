const express = require('express');
const router = express.Router();
const { auth, ownerAuth } = require('../middleware/auth.middleware');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');
const {checkValidation} = require('../middleware/validation.middleware');

const studentController = require('../controllers/student.controller');
const { Roles } = require('../utils/enums/roles.utils');
const {
    updateStudentSchema,
    getStudentsQuerySchema,
    getOrganizedActivitiesQuerySchema,
    getAttendedActivitiesQuerySchema,
    getSavedActivitiesQuerySchema
} = require('../middleware/validators/studentValidator.middleware');

router.get('/',
    auth(),
    getStudentsQuerySchema,
    checkValidation,
    awaitHandlerFactory(studentController.getAllStudents)
); // localhost:3000/api/API_VERSION/students

router.get('/:erp',
    auth(),
    awaitHandlerFactory(studentController.getStudentById)
); // localhost:3000/api/API_VERSION/students/17855

router.get('/:erp/organized-activities',
    auth(),
    getOrganizedActivitiesQuerySchema,
    checkValidation,
    awaitHandlerFactory(studentController.getOrganizedActivities)
); // localhost:3000/api/API_VERSION/students/17855/organized-activities

router.get('/:erp/attended-activities',
    auth(),
    getAttendedActivitiesQuerySchema,
    checkValidation,
    awaitHandlerFactory(studentController.getAttendedActivities)
); // localhost:3000/api/API_VERSION/students/17855/attended-activities

router.get('/:erp/saved-activities',
    auth(Roles.Admin, Roles.ApiUser),
    ownerAuth([Roles.ApiUser]),
    getSavedActivitiesQuerySchema,
    checkValidation,
    awaitHandlerFactory(studentController.getSavedActivities)
); // localhost:3000/api/API_VERSION/activities/1/attendees

router.patch('/:erp',
    auth(Roles.Admin, Roles.ApiUser),
    ownerAuth([Roles.ApiUser]),
    updateStudentSchema,
    checkValidation,
    awaitHandlerFactory(studentController.updateStudent)
); // localhost:3000/api/API_VERSION/students/17855

router.delete('/:erp',
    auth(Roles.Admin),
    awaitHandlerFactory(studentController.deleteStudent)
); // localhost:3000/api/API_VERSION/students/17855

module.exports = router;