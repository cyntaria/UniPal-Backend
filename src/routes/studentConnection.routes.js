const express = require('express');
const router = express.Router();
const { auth, ownerAuth } = require('../middleware/auth.middleware');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');
const {checkValidation} = require('../middleware/validation.middleware');

const studentConnectionController = require('../controllers/studentConnection.controller');
const { Roles } = require('../utils/enums/roles.utils');
const {
    createConnectionRequestSchema,
    updateConnectionRequestSchema,
    getConnectionRequestQuerySchema,
    getStudentConnectionQuerySchema,
    connectionRequestOwnerCheck
} = require('../middleware/validators/studentConnectionValidator.middleware');

router.get('/',
    auth(Roles.Admin, Roles.ApiUser),
    getStudentConnectionQuerySchema,
    checkValidation,
    awaitHandlerFactory(studentConnectionController.getAllStudentConnections)
); // localhost:3000/api/API_VERSION/student-connections

router.get('/requests',
    auth(Roles.Admin, Roles.ApiUser),
    getConnectionRequestQuerySchema,
    checkValidation,
    ownerAuth([Roles.Admin, Roles.ApiUser], connectionRequestOwnerCheck),
    awaitHandlerFactory(studentConnectionController.getAllConnectionRequests)
); // localhost:3000/api/API_VERSION/student-connections

router.get('/:id',
    auth(Roles.Admin, Roles.ApiUser),
    ownerAuth([Roles.Admin, Roles.ApiUser], connectionRequestOwnerCheck),
    awaitHandlerFactory(studentConnectionController.getStudentConnectionById)
); // localhost:3000/api/API_VERSION/student-connections/1

router.post('/',
    auth(Roles.Admin, Roles.ApiUser),
    createConnectionRequestSchema,
    checkValidation,
    ownerAuth([Roles.Admin, Roles.ApiUser], connectionRequestOwnerCheck),
    awaitHandlerFactory(studentConnectionController.createStudentConnectionRequest)
); // localhost:3000/api/API_VERSION/student-connections

router.patch('/:id',
    auth(Roles.Admin, Roles.ApiUser),
    updateConnectionRequestSchema,
    checkValidation,
    ownerAuth([Roles.Admin, Roles.ApiUser], connectionRequestOwnerCheck),
    awaitHandlerFactory(studentConnectionController.updateStudentConnectionRequest)
); // localhost:3000/api/API_VERSION/student-connections/1

router.delete('/:id',
    auth(Roles.Admin, Roles.ApiUser),
    ownerAuth([Roles.Admin, Roles.ApiUser], connectionRequestOwnerCheck),
    awaitHandlerFactory(studentConnectionController.deleteStudentConnection)
); // localhost:3000/api/API_VERSION/student-connections/1

module.exports = router;