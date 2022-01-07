const TimetableRepository = require('../repositories/timetable.repository');

class TimetableController {
    getAllTimetables = async(req, res, next) => {
        const response = await TimetableRepository.findAll(req.query);
        res.send(response);
    };

    generateTimetables = async(req, res, next) => {
        const response = await TimetableRepository.generateAll(req.body);
        res.send(response);
    };

    getTimetableById = async(req, res, next) => {
        const response = await TimetableRepository.findOne(req.params.id);
        res.send(response);
    };

    createTimetable = async(req, res, next) => {
        const response = await TimetableRepository.create(req.body);
        res.status(201).send(response);
    };

    updateTimetable = async(req, res, next) => {
        const response = await TimetableRepository.update(req.body, req.params.id);
        res.send(response);
    };

    updateTimetableClasses = async(req, res, next) => {
        const response = await TimetableRepository.updateClasses(req.body, req.params.id);
        res.send(response);
    };

    deleteTimetable = async(req, res, next) => {
        const response = await TimetableRepository.delete(req.params.id);
        res.send(response);
    };
}

module.exports = new TimetableController;