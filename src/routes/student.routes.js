const express = require('express');
const router = express.Router();
const { auth, ownerAuth } = require('../middleware/auth.middleware');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');

const studentController = require('../controllers/student.controller');
const { Roles } = require('../utils/enums/roles.utils');
const { updateStudentSchema, getStudentsQuerySchema } = require('../middleware/validators/studentValidator.middleware');

router.get('/', auth(), getStudentsQuerySchema, awaitHandlerFactory(studentController.getAllStudents)); // localhost:3000/api/API_VERSION/students
router.get('/:erp', auth(), awaitHandlerFactory(studentController.getStudentById)); // localhost:3000/api/API_VERSION/students/1
router.patch('/:erp', auth(Roles.Admin, Roles.ApiUser), ownerAuth([Roles.ApiUser]), updateStudentSchema, awaitHandlerFactory(studentController.updateStudent)); // localhost:3000/api/API_VERSION/students/1
router.delete('/:erp', auth(Roles.Admin), awaitHandlerFactory(studentController.deleteStudent)); // localhost:3000/api/API_VERSION/students/1

module.exports = router;