const express = require('express');
const router = express.Router();
const {auth} = require('../middleware/auth.middleware');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');
const { Roles } = require('../utils/enums/roles.utils');
const {checkValidation} = require('../middleware/validation.middleware');

const interestController = require('../controllers/interest.controller');
const { createInterestSchema, updateInterestSchema } = require('../middleware/validators/interestValidator.middleware');

router.get('/', auth(), awaitHandlerFactory(interestController.getAllInterests)); // localhost:3000/api/API_VERSION/interests
router.get('/:id', auth(), awaitHandlerFactory(interestController.getInterestById)); // localhost:3000/api/API_VERSION/interests/1
router.post('/', auth(Roles.Admin), createInterestSchema, checkValidation, awaitHandlerFactory(interestController.createInterest)); // localhost:3000/api/API_VERSION/interests
router.patch('/:id', auth(Roles.Admin), updateInterestSchema, checkValidation, awaitHandlerFactory(interestController.updateInterest)); // localhost:3000/api/API_VERSION/interests/1 , using patch for partial update
router.delete('/:id', auth(Roles.Admin), awaitHandlerFactory(interestController.deleteInterest)); // localhost:3000/api/API_VERSION/interests/1

module.exports = router;