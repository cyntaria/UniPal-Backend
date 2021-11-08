const express = require('express');
const router = express.Router();
const { auth, ownerAuth } = require('../middleware/auth.middleware');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');
const {checkValidation} = require('../middleware/validation.middleware');

const teacherReviewController = require('../controllers/teacherReview.controller');
const { Roles } = require('../utils/enums/roles.utils');
const {
    createTeacherReviewSchema,
    updateTeacherReviewSchema,
    getTeacherReviewsQuerySchema,
    teacherReviewOwnerCheck
} = require('../middleware/validators/teacherReviewValidator.middleware');

router.get('/',
    auth(),
    getTeacherReviewsQuerySchema,
    checkValidation,
    awaitHandlerFactory(teacherReviewController.getAllTeacherReviews)
); // localhost:3000/api/API_VERSION/teacher-reviews

router.get('/:id',
    auth(),
    awaitHandlerFactory(teacherReviewController.getTeacherReviewById)
); // localhost:3000/api/API_VERSION/teacher-reviews/1

router.post('/',
    auth(Roles.Admin, Roles.ApiUser),
    createTeacherReviewSchema,
    checkValidation,
    ownerAuth([Roles.Admin, Roles.ApiUser], teacherReviewOwnerCheck),
    awaitHandlerFactory(teacherReviewController.createTeacherReview)
); // localhost:3000/api/API_VERSION/teacher-reviews

router.patch('/:id',
    auth(Roles.Admin, Roles.ApiUser),
    updateTeacherReviewSchema,
    checkValidation,
    ownerAuth([Roles.ApiUser], teacherReviewOwnerCheck),
    awaitHandlerFactory(teacherReviewController.updateTeacherReview)
); // localhost:3000/api/API_VERSION/teacher-reviews/1

router.delete('/:id',
    auth(Roles.Admin, Roles.ApiUser),
    ownerAuth([Roles.ApiUser], teacherReviewOwnerCheck),
    awaitHandlerFactory(teacherReviewController.deleteTeacherReview)
); // localhost:3000/api/API_VERSION/teacher-reviews/1

module.exports = router;