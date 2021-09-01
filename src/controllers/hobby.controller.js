const {checkValidation} = require('../middleware/validation.middleware');

const HobbyRepository = require('../repositories/hobby.repository');

class HobbyController {
    getAllHobbies = async(req, res, next) => {
        const response = await HobbyRepository.findAll();
        res.send(response);
    };

    getHobbyById = async(req, res, next) => {
        const response = await HobbyRepository.findOne({ hobby_id: req.params.id });
        res.send(response);
    };

    createHobby = async(req, res, next) => {
        checkValidation(req);

        const response = await HobbyRepository.create(req.body);
        res.status(201).send(response);
    };

    updateHobby = async(req, res, next) => {
        checkValidation(req);

        const response = await HobbyRepository.update(req.body, req.params.id);
        res.send(response);
    };

    deleteHobby = async(req, res, next) => {
        const response = await HobbyRepository.delete(req.params.id);
        res.send(response);
    };
}

module.exports = new HobbyController;