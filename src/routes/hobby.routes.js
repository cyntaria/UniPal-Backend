const express = require('express');
const router = express.Router();
const {auth} = require('../middleware/auth.middleware');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');
const {checkValidation} = require('../middleware/validation.middleware');

const hobbyController = require('../controllers/hobby.controller');
const { Roles } = require('../utils/enums/roles.utils');
const { createHobbySchema, updateHobbySchema } = require('../middleware/validators/hobbyValidator.middleware');

router.get('/', auth(), awaitHandlerFactory(hobbyController.getAllHobbies)); // localhost:3000/api/API_VERSION/hobbies
router.get('/:id', auth(), awaitHandlerFactory(hobbyController.getHobbyById)); // localhost:3000/api/API_VERSION/hobbies/1
router.post('/', auth(Roles.Admin), createHobbySchema, checkValidation, awaitHandlerFactory(hobbyController.createHobby)); // localhost:3000/api/API_VERSION/hobbies
router.patch('/:id', auth(Roles.Admin), updateHobbySchema, checkValidation, awaitHandlerFactory(hobbyController.updateHobby)); // localhost:3000/api/API_VERSION/hobbies/1 , using patch for partial update
router.delete('/:id', auth(Roles.Admin), awaitHandlerFactory(hobbyController.deleteHobby)); // localhost:3000/api/API_VERSION/hobbies/1

module.exports = router;