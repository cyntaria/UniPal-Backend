const express = require('express');
const router = express.Router();
const {auth} = require('../middleware/auth.middleware');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');
const { Roles } = require('../utils/enums/roles.utils');
const {checkValidation} = require('../middleware/validation.middleware');

const termController = require('../controllers/term.controller');
const { createTermSchema, updateTermSchema } = require('../middleware/validators/termValidator.middleware');

router.get('/',
    auth(Roles.Admin),
    awaitHandlerFactory(termController.getAllTerms)
); // localhost:3000/api/API_VERSION/terms

router.get('/:id',
    auth(Roles.Admin),
    awaitHandlerFactory(termController.getTermById)
); // localhost:3000/api/API_VERSION/terms/1

router.post('/',
    auth(Roles.Admin),
    createTermSchema,
    checkValidation,
    awaitHandlerFactory(termController.createTerm)
); // localhost:3000/api/API_VERSION/terms

router.patch('/:id',
    auth(Roles.Admin),
    updateTermSchema,
    checkValidation,
    awaitHandlerFactory(termController.updateTerm)
); // localhost:3000/api/API_VERSION/terms/1 , using patch for partial update

router.delete('/:id',
    auth(Roles.Admin),
    awaitHandlerFactory(termController.deleteTerm)
); // localhost:3000/api/API_VERSION/terms/1

module.exports = router;