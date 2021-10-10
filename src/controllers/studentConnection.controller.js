const StudentConnectionRepository = require('../repositories/studentConnection.repository');

class StudentConnectionController {

    getAllConnectionRequests = async(req, res, next) => {
        const response = await StudentConnectionRepository.findAllRequests(req.query);
        res.send(response);
    };

    getAllStudentConnections = async(req, res, next) => {
        const response = await StudentConnectionRepository.findAll(req.query);
        res.send(response);
    };

    getStudentConnectionById = async(req, res, next) => {
        const response = await StudentConnectionRepository.findOne(req.params.id);
        res.send(response);
    };

    createStudentConnectionRequest = async(req, res, next) => {
        const response = await StudentConnectionRepository.create(req.body);
        res.status(201).send(response);
    };

    updateStudentConnectionRequest = async(req, res, next) => {
        const response = await StudentConnectionRepository.update(req.body, req.params.id);
        res.send(response);
    };

    deleteStudentConnection = async(req, res, next) => {
        const response = await StudentConnectionRepository.delete(req.params.id);
        res.send(response);
    };
}

module.exports = new StudentConnectionController;