const express = require('express');
const router = express.Router();
const {auth} = require('../middleware/auth.middleware');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');
const { Roles } = require('../utils/enums/roles.utils');
const {checkValidation} = require('../middleware/validation.middleware');

const campusController = require('../controllers/campus.controller');
const { createCampusSchema, updateCampusSchema } = require('../middleware/validators/campusValidator.middleware');

router.get('/', auth(), awaitHandlerFactory(campusController.getAllCampuses)); // localhost:3000/api/API_VERSION/campuses
router.get('/:id', auth(), awaitHandlerFactory(campusController.getCampusById)); // localhost:3000/api/API_VERSION/campuses/1
router.post('/', auth(Roles.Admin), createCampusSchema, checkValidation, awaitHandlerFactory(campusController.createCampus)); // localhost:3000/api/API_VERSION/campuses
router.patch('/:id', auth(Roles.Admin), updateCampusSchema, checkValidation, awaitHandlerFactory(campusController.updateCampus)); // localhost:3000/api/API_VERSION/campuses/1 , using patch for partial update
router.delete('/:id', auth(Roles.Admin), awaitHandlerFactory(campusController.deleteCampus)); // localhost:3000/api/API_VERSION/campuses/1

module.exports = router;