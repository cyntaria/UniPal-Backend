const express = require('express');
const router = express.Router();
const { auth, ownerAuth } = require('../middleware/auth.middleware');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');
const {checkValidation} = require('../middleware/validation.middleware');

const postReactionController = require('../controllers/postReaction.controller');
const { Roles } = require('../utils/enums/roles.utils');
const {
    createPostReactionSchema,
    updatePostReactionSchema,
    postReactionOwnerCheck
} = require('../middleware/validators/postReactionValidator.middleware');

router.post('/:id/reactions',
    auth(Roles.Admin, Roles.ApiUser),
    createPostReactionSchema,
    checkValidation,
    ownerAuth([Roles.Admin, Roles.ApiUser], postReactionOwnerCheck),
    awaitHandlerFactory(postReactionController.createPostReaction)
); // localhost:3000/api/API_VERSION/posts/1/reactions

router.patch('/:id/reactions/:student_erp',
    auth(Roles.Admin, Roles.ApiUser),
    updatePostReactionSchema,
    checkValidation,
    ownerAuth([Roles.Admin, Roles.ApiUser], postReactionOwnerCheck),
    awaitHandlerFactory(postReactionController.updatePostReaction)
); // localhost:3000/api/API_VERSION/posts/1/reactions/17855

router.delete('/:id/reactions/:student_erp',
    auth(Roles.Admin, Roles.ApiUser),
    ownerAuth([Roles.ApiUser], postReactionOwnerCheck),
    awaitHandlerFactory(postReactionController.deletePostReaction)
); // localhost:3000/api/API_VERSION/posts/1/reactions/17855

module.exports = router;