const TimeslotRepository = require('../repositories/timeslot.repository');

class TimeslotController {
    getAllTimeslots = async(req, res, next) => {
        const response = await TimeslotRepository.findAll();
        res.send(response);
    };

    getTimeslotById = async(req, res, next) => {
        const response = await TimeslotRepository.findOne(req.params.id);
        res.send(response);
    };

    createTimeslot = async(req, res, next) => {
        const response = await TimeslotRepository.create(req.body);
        res.status(201).send(response);
    };

    updateTimeslot = async(req, res, next) => {
        const response = await TimeslotRepository.update(req.body, req.params.id);
        res.send(response);
    };

    deleteTimeslot = async(req, res, next) => {
        const response = await TimeslotRepository.delete(req.params.id);
        res.send(response);
    };
}

module.exports = new TimeslotController;