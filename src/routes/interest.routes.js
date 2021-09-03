const express = require('express');
const router = express.Router();
const {auth} = require('../middleware/auth.middleware');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');
const { Roles } = require('../utils/enums/roles.utils');

const interestController = require('../controllers/interest.controller');
const { createInterestSchema, updateInterestSchema } = require('../middleware/validators/interestValidator.middleware');

router.get('/', auth(), awaitHandlerFactory(interestController.getAllInterests)); // localhost:3000/api/v1/interests
router.get('/:id', auth(), awaitHandlerFactory(interestController.getInterestById)); // localhost:3000/api/v1/interests/1
router.post('/', auth(Roles.Admin), createInterestSchema, awaitHandlerFactory(interestController.createInterest)); // localhost:3000/api/v1/interests
router.patch('/:id', auth(Roles.Admin), updateInterestSchema, awaitHandlerFactory(interestController.updateInterest)); // localhost:3000/api/v1/interests/1 , using patch for partial update
router.delete('/:id', auth(Roles.Admin), awaitHandlerFactory(interestController.deleteInterest)); // localhost:3000/api/v1/interests/1

module.exports = router;