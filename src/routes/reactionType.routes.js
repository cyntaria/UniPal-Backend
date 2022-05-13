const express = require('express');
const router = express.Router();
const {auth} = require('../middleware/auth.middleware');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');
const { Roles } = require('../utils/enums/roles.utils');
const {checkValidation} = require('../middleware/validation.middleware');

const reactionTypeController = require('../controllers/reactionType.controller');
const { createReactionTypeSchema, updateReactionTypeSchema } = require('../middleware/validators/reactionTypeValidator.middleware');

router.get('/',
    awaitHandlerFactory(reactionTypeController.getAllReactionTypes)
); // localhost:3000/api/API_VERSION/reaction-types

router.get('/:id',
    auth(),
    awaitHandlerFactory(reactionTypeController.getReactionTypeById)
); // localhost:3000/api/API_VERSION/reaction-types/1

router.post('/',
    auth(Roles.Admin),
    createReactionTypeSchema,
    checkValidation,
    awaitHandlerFactory(reactionTypeController.createReactionType)
); // localhost:3000/api/API_VERSION/reaction-types

router.patch('/:id',
    auth(Roles.Admin),
    updateReactionTypeSchema,
    checkValidation,
    awaitHandlerFactory(reactionTypeController.updateReactionType)
); // localhost:3000/api/API_VERSION/reaction-types/1 , using patch for partial update

router.delete('/:id',
    auth(Roles.Admin),
    awaitHandlerFactory(reactionTypeController.deleteReactionType)
); // localhost:3000/api/API_VERSION/reaction-types/1

module.exports = router;