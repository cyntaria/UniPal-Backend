const express = require('express');
const router = express.Router();
const {auth} = require('../middleware/auth.middleware');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');
const { Roles } = require('../utils/enums/roles.utils');
const {checkValidation} = require('../middleware/validation.middleware');

const subjectController = require('../controllers/subject.controller');
const { createSubjectSchema, updateSubjectSchema } = require('../middleware/validators/subjectValidator.middleware');

router.get('/',
    auth(),
    awaitHandlerFactory(subjectController.getAllSubjects)
); // localhost:3000/api/API_VERSION/subjects

router.get('/:code',
    auth(),
    awaitHandlerFactory(subjectController.getSubjectById)
); // localhost:3000/api/API_VERSION/subjects/PKT151

router.post('/',
    auth(Roles.Admin),
    createSubjectSchema,
    checkValidation,
    awaitHandlerFactory(subjectController.createSubject)
); // localhost:3000/api/API_VERSION/subjects

router.patch('/:code',
    auth(Roles.Admin),
    updateSubjectSchema,
    checkValidation,
    awaitHandlerFactory(subjectController.updateSubject)
); // localhost:3000/api/API_VERSION/subjects/PKT151 , using patch for partial update

router.delete('/:code',
    auth(Roles.Admin),
    awaitHandlerFactory(subjectController.deleteSubject)
); // localhost:3000/api/API_VERSION/subjects/PKT151

module.exports = router;