const express = require('express');
const router = express.Router();
const {auth} = require('../middleware/auth.middleware');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');
const { Roles } = require('../utils/enums/roles.utils');
const {checkValidation} = require('../middleware/validation.middleware');

const classController = require('../controllers/class.controller');
const {
    createClassSchema,
    updateClassSchema,
    createManyClassSchema,
    getClassesQuerySchema
} = require('../middleware/validators/classValidator.middleware');

router.get('/',
    auth(),
    getClassesQuerySchema,
    checkValidation,
    awaitHandlerFactory(classController.getAllClasses)
); // localhost:3000/api/API_VERSION/classes

router.get('/:term_id/:class_erp',
    auth(),
    awaitHandlerFactory(classController.getClassById)
); // localhost:3000/api/API_VERSION/classes/1/5455

router.post('/',
    auth(Roles.Admin),
    createClassSchema,
    checkValidation,
    awaitHandlerFactory(classController.createClass)
); // localhost:3000/api/API_VERSION/classes

router.post('/bulk',
    auth(Roles.Admin),
    createManyClassSchema,
    checkValidation,
    awaitHandlerFactory(classController.createManyClasses)
); // localhost:3000/api/API_VERSION/classes

router.patch('/:term_id/:class_erp',
    auth(Roles.Admin),
    updateClassSchema,
    checkValidation,
    awaitHandlerFactory(classController.updateClass)
); // localhost:3000/api/API_VERSION/classes/1/5455 , using patch for partial update

router.delete('/:term_id/:class_erp',
    auth(Roles.Admin),
    awaitHandlerFactory(classController.deleteClass)
); // localhost:3000/api/API_VERSION/classes/1/5455

module.exports = router;