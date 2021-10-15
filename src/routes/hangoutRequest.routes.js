const express = require('express');
const router = express.Router();
const { auth, ownerAuth } = require('../middleware/auth.middleware');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');
const {checkValidation} = require('../middleware/validation.middleware');

const hangoutRequestController = require('../controllers/hangoutRequest.controller');
const { Roles } = require('../utils/enums/roles.utils');
const {
    createHangoutRequestSchema,
    updateHangoutRequestSchema,
    getHangoutRequestQuerySchema,
    hangoutRequestOwnerCheck
} = require('../middleware/validators/hangoutRequestValidator.middleware');

router.get('/',
    auth(Roles.Admin, Roles.ApiUser),
    getHangoutRequestQuerySchema,
    checkValidation,
    ownerAuth([Roles.Admin, Roles.ApiUser], hangoutRequestOwnerCheck),
    awaitHandlerFactory(hangoutRequestController.getAllHangoutRequests)
); // localhost:3000/api/API_VERSION/hangout-requests

router.get('/:id',
    auth(Roles.Admin, Roles.ApiUser),
    ownerAuth([Roles.Admin, Roles.ApiUser], hangoutRequestOwnerCheck),
    awaitHandlerFactory(hangoutRequestController.getHangoutRequestById)
); // localhost:3000/api/API_VERSION/hangout-requests/1

router.post('/',
    auth(Roles.Admin, Roles.ApiUser),
    createHangoutRequestSchema,
    checkValidation,
    ownerAuth([Roles.Admin, Roles.ApiUser], hangoutRequestOwnerCheck),
    awaitHandlerFactory(hangoutRequestController.createHangoutRequest)
); // localhost:3000/api/API_VERSION/hangout-requests

router.patch('/:id',
    auth(Roles.Admin, Roles.ApiUser),
    updateHangoutRequestSchema,
    checkValidation,
    ownerAuth([Roles.Admin, Roles.ApiUser], hangoutRequestOwnerCheck),
    awaitHandlerFactory(hangoutRequestController.updateHangoutRequest)
); // localhost:3000/api/API_VERSION/hangout-requests/1

router.delete('/:id',
    auth(Roles.Admin, Roles.ApiUser),
    ownerAuth([Roles.Admin, Roles.ApiUser], hangoutRequestOwnerCheck),
    awaitHandlerFactory(hangoutRequestController.deleteHangoutRequest)
); // localhost:3000/api/API_VERSION/hangout-requests/1

module.exports = router;