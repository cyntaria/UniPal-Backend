const express = require('express');
const router = express.Router();
const {auth} = require('../middleware/auth.middleware');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');
const { Roles } = require('../utils/enums/roles.utils');

const studentStatusController = require('../controllers/studentStatus.controller');
const { createStudentStatusSchema, updateStudentStatusSchema } = require('../middleware/validators/studentStatusValidator.middleware');

router.get('/', auth(), awaitHandlerFactory(studentStatusController.getAllStudentStatuses)); // localhost:3000/api/API_VERSION/student-statuses
router.get('/:id', auth(), awaitHandlerFactory(studentStatusController.getStudentStatusById)); // localhost:3000/api/API_VERSION/student-statuses/1
router.post('/', auth(Roles.Admin), createStudentStatusSchema, awaitHandlerFactory(studentStatusController.createStudentStatus)); // localhost:3000/api/API_VERSION/student-statuses
router.patch('/:id', auth(Roles.Admin), updateStudentStatusSchema, awaitHandlerFactory(studentStatusController.updateStudentStatus)); // localhost:3000/api/API_VERSION/student-statuses/1 , using patch for partial update
router.delete('/:id', auth(Roles.Admin), awaitHandlerFactory(studentStatusController.deleteStudentStatus)); // localhost:3000/api/API_VERSION/student-statuses/1

module.exports = router;