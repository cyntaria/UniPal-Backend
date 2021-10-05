const express = require('express');
const router = express.Router();
const { auth, ownerAuth } = require('../middleware/auth.middleware');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');
const {checkValidation} = require('../middleware/validation.middleware');

const friendRequestController = require('../controllers/friendRequest.controller');
const { Roles } = require('../utils/enums/roles.utils');
const {
    createFriendRequestSchema,
    updateFriendRequestSchema,
    getFriendRequestQuerySchema,
    friendRequestOwnerCheck
} = require('../middleware/validators/friendRequestValidator.middleware');

router.get('/',
    auth(Roles.Admin, Roles.ApiUser),
    getFriendRequestQuerySchema,
    checkValidation,
    ownerAuth([Roles.Admin, Roles.ApiUser], friendRequestOwnerCheck),
    awaitHandlerFactory(friendRequestController.getAllFriendRequests)
); // localhost:3000/api/API_VERSION/friend-requests

router.get('/:id',
    auth(Roles.Admin, Roles.ApiUser),
    ownerAuth([Roles.Admin, Roles.ApiUser], friendRequestOwnerCheck),
    awaitHandlerFactory(friendRequestController.getFriendRequestById)
); // localhost:3000/api/API_VERSION/friend-requests/1

router.post('/',
    auth(Roles.Admin, Roles.ApiUser),
    createFriendRequestSchema,
    checkValidation,
    ownerAuth([Roles.Admin, Roles.ApiUser], friendRequestOwnerCheck),
    awaitHandlerFactory(friendRequestController.createFriendRequest)
); // localhost:3000/api/API_VERSION/friend-requests

router.patch('/:id',
    auth(Roles.Admin, Roles.ApiUser),
    updateFriendRequestSchema,
    checkValidation,
    ownerAuth([Roles.Admin, Roles.ApiUser], friendRequestOwnerCheck),
    awaitHandlerFactory(friendRequestController.updateFriendRequest)
); // localhost:3000/api/API_VERSION/friend-requests/1

router.delete('/:id',
    auth(Roles.Admin, Roles.ApiUser),
    ownerAuth([Roles.Admin, Roles.ApiUser], friendRequestOwnerCheck),
    awaitHandlerFactory(friendRequestController.deleteFriendRequest)
); // localhost:3000/api/API_VERSION/friend-requests/1

module.exports = router;