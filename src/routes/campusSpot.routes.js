const express = require('express');
const router = express.Router();
const {auth} = require('../middleware/auth.middleware');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');
const { Roles } = require('../utils/enums/roles.utils');
const {checkValidation} = require('../middleware/validation.middleware');

const campusSpotController = require('../controllers/campusSpot.controller');
const { createCampusSpotSchema, updateCampusSpotSchema } = require('../middleware/validators/campusSpotValidator.middleware');

router.get('/', auth(), awaitHandlerFactory(campusSpotController.getAllCampusSpots)); // localhost:3000/api/API_VERSION/campus-spots
router.get('/:id', auth(), awaitHandlerFactory(campusSpotController.getCampusSpotById)); // localhost:3000/api/API_VERSION/campus-spots/1
router.post('/', auth(Roles.Admin), createCampusSpotSchema, checkValidation, awaitHandlerFactory(campusSpotController.createCampusSpot)); // localhost:3000/api/API_VERSION/campus-spots
router.patch('/:id', auth(Roles.Admin), updateCampusSpotSchema, checkValidation, awaitHandlerFactory(campusSpotController.updateCampusSpot)); // localhost:3000/api/API_VERSION/campus-spots/1 , using patch for partial update
router.delete('/:id', auth(Roles.Admin), awaitHandlerFactory(campusSpotController.deleteCampusSpot)); // localhost:3000/api/API_VERSION/campus-spots/1

module.exports = router;