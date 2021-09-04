const express = require('express');
const router = express.Router();
const {auth} = require('../middleware/auth.middleware');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');
const { Roles } = require('../utils/enums/roles.utils');

const campusController = require('../controllers/campus.controller');
const { createCampusSchema, updateCampusSchema } = require('../middleware/validators/campusValidator.middleware');

router.get('/', auth(), awaitHandlerFactory(campusController.getAllCampuses)); // localhost:3000/api/v1/campuses
router.get('/:id', auth(), awaitHandlerFactory(campusController.getCampusById)); // localhost:3000/api/v1/campuses/1
router.post('/', auth(Roles.Admin), createCampusSchema, awaitHandlerFactory(campusController.createCampus)); // localhost:3000/api/v1/campuses
router.patch('/:id', auth(Roles.Admin), updateCampusSchema, awaitHandlerFactory(campusController.updateCampus)); // localhost:3000/api/v1/campuses/1 , using patch for partial update
router.delete('/:id', auth(Roles.Admin), awaitHandlerFactory(campusController.deleteCampus)); // localhost:3000/api/v1/campuses/1

module.exports = router;