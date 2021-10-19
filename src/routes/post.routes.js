const express = require('express');
const router = express.Router();
const { auth, ownerAuth } = require('../middleware/auth.middleware');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');
const {checkValidation} = require('../middleware/validation.middleware');

const postController = require('../controllers/post.controller');
const { Roles } = require('../utils/enums/roles.utils');
const {
    createPostSchema,
    updatePostSchema,
    getPostsQuerySchema,
    postOwnerCheck
} = require('../middleware/validators/postValidator.middleware');

router.get('/',
    auth(),
    getPostsQuerySchema,
    checkValidation,
    awaitHandlerFactory(postController.getAllPosts)
); // localhost:3000/api/API_VERSION/posts

router.get('/:id',
    auth(),
    awaitHandlerFactory(postController.getPostById)
); // localhost:3000/api/API_VERSION/posts/1

router.get('/:id/reactions',
    auth(),
    checkValidation,
    awaitHandlerFactory(postController.getPostReactions)
); // localhost:3000/api/API_VERSION/posts/1/reactions

router.post('/',
    auth(Roles.Admin, Roles.ApiUser),
    createPostSchema,
    checkValidation,
    ownerAuth([Roles.Admin, Roles.ApiUser], postOwnerCheck),
    awaitHandlerFactory(postController.createPost)
); // localhost:3000/api/API_VERSION/posts

router.patch('/:id',
    auth(Roles.Admin, Roles.ApiUser),
    updatePostSchema,
    checkValidation,
    ownerAuth([Roles.Admin, Roles.ApiUser], postOwnerCheck),
    awaitHandlerFactory(postController.updatePost)
); // localhost:3000/api/API_VERSION/posts/1

router.delete('/:id',
    auth(Roles.Admin, Roles.ApiUser),
    ownerAuth([Roles.ApiUser], postOwnerCheck),
    awaitHandlerFactory(postController.deletePost)
); // localhost:3000/api/API_VERSION/posts/1

module.exports = router;