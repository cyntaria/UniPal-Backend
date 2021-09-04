const {checkValidation} = require('../middleware/validation.middleware');

const StudentStatusRepository = require('../repositories/studentStatus.repository');

class StudentStatusController {
    getAllStudentStatuses = async(req, res, next) => {
        const response = await StudentStatusRepository.findAll();
        res.send(response);
    };

    getStudentStatusById = async(req, res, next) => {
        const response = await StudentStatusRepository.findOne({ student_status_id: req.params.id });
        res.send(response);
    };

    createStudentStatus = async(req, res, next) => {
        checkValidation(req);

        const response = await StudentStatusRepository.create(req.body);
        res.status(201).send(response);
    };

    updateStudentStatus = async(req, res, next) => {
        checkValidation(req);

        const response = await StudentStatusRepository.update(req.body, req.params.id);
        res.send(response);
    };

    deleteStudentStatus = async(req, res, next) => {
        const response = await StudentStatusRepository.delete(req.params.id);
        res.send(response);
    };
}

module.exports = new StudentStatusController;