const {checkValidation} = require('../middleware/validation.middleware');

const CampusRepository = require('../repositories/campus.repository');

class CampusController {
    getAllCampuses = async(req, res, next) => {
        const response = await CampusRepository.findAll();
        res.send(response);
    };

    getCampusById = async(req, res, next) => {
        const response = await CampusRepository.findOne({ campus_id: req.params.id });
        res.send(response);
    };

    createCampus = async(req, res, next) => {
        checkValidation(req);

        const response = await CampusRepository.create(req.body);
        res.status(201).send(response);
    };

    updateCampus = async(req, res, next) => {
        checkValidation(req);

        const response = await CampusRepository.update(req.body, req.params.id);
        res.send(response);
    };

    deleteCampus = async(req, res, next) => {
        const response = await CampusRepository.delete(req.params.id);
        res.send(response);
    };
}

module.exports = new CampusController;