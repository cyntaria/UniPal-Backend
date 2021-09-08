const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth.middleware');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');

const studentController = require('../controllers/student.controller');
const { Roles } = require('../utils/enums/roles.utils');
const { updateStudentSchema, getStudentsQuerySchema: getStudentQuerySchema } = require('../middleware/validators/studentValidator.middleware');

router.get('/', auth(), getStudentQuerySchema, awaitHandlerFactory(studentController.getAllStudents)); // localhost:3000/api/v1/students
router.get('/:erp', auth(), getStudentQuerySchema, awaitHandlerFactory(studentController.getStudentById)); // localhost:3000/api/v1/students/1
router.patch('/:erp', auth(Roles.Admin), updateStudentSchema, awaitHandlerFactory(studentController.updateStudent)); // localhost:3000/api/v1/students/1
router.delete('/:erp', auth(Roles.Admin), awaitHandlerFactory(studentController.deleteStudent)); // localhost:3000/api/v1/students/1

module.exports = router;