const express = require('express');
const router = express.Router();
const {auth} = require('../middleware/auth.middleware');
const awaitHandlerFactory = require('../middleware/awaitHandlerFactory.middleware');
const { Roles } = require('../utils/enums/roles.utils');
const {checkValidation} = require('../middleware/validation.middleware');

const programController = require('../controllers/program.controller');
const { createProgramSchema, updateProgramSchema } = require('../middleware/validators/programValidator.middleware');

router.get('/',
    awaitHandlerFactory(programController.getAllPrograms)
); // localhost:3000/api/API_VERSION/programs

router.get('/:id',
    auth(),
    awaitHandlerFactory(programController.getProgramById)
); // localhost:3000/api/API_VERSION/programs/1

router.post('/',
    auth(Roles.Admin),
    createProgramSchema,
    checkValidation,
    awaitHandlerFactory(programController.createProgram)
); // localhost:3000/api/API_VERSION/programs

router.patch('/:id',
    auth(Roles.Admin),
    updateProgramSchema,
    checkValidation,
    awaitHandlerFactory(programController.updateProgram)
); // localhost:3000/api/API_VERSION/programs/1 , using patch for partial update

router.delete('/:id',
    auth(Roles.Admin),
    awaitHandlerFactory(programController.deleteProgram)
); // localhost:3000/api/API_VERSION/programs/1

module.exports = router;