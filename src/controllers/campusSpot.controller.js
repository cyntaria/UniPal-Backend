const CampusSpotRepository = require('../repositories/campusSpot.repository');

class CampusSpotController {
    getAllCampusSpots = async(req, res, next) => {
        const response = await CampusSpotRepository.findAll();
        res.send(response);
    };

    getCampusSpotById = async(req, res, next) => {
        const response = await CampusSpotRepository.findOne({ campus_spot_id: req.params.id });
        res.send(response);
    };

    createCampusSpot = async(req, res, next) => {
        const response = await CampusSpotRepository.create(req.body);
        res.status(201).send(response);
    };

    updateCampusSpot = async(req, res, next) => {
        const response = await CampusSpotRepository.update(req.body, req.params.id);
        res.send(response);
    };

    deleteCampusSpot = async(req, res, next) => {
        const response = await CampusSpotRepository.delete(req.params.id);
        res.send(response);
    };
}

module.exports = new CampusSpotController;