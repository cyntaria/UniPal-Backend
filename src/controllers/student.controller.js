const { checkValidation } = require('../middleware/validation.middleware');

const StudentRepository = require('../repositories/student.repository');

class StudentController {
    getAllStudents = async(req, res, next) => {
        const response = await StudentRepository.findAll();
        res.send(response);
    };

    getStudentById = async(req, res, next) => {
        const response = await StudentRepository.findOne({erp: req.params.erp});
        res.send(response);
    };

    createStudent = async(req, res, next) => {
        checkValidation(req);
        const response = await StudentRepository.create(req.body);
        res.status(201).send(response);
    };

    updateStudent = async(req, res, next) => {
        checkValidation(req);
        const response = await StudentRepository.update(req.body, {erp: req.params.erp});
        res.send(response);
    };

    deleteStudent = async(req, res, next) => {
        const response = await StudentRepository.delete(req.params.erp);
        res.send(response);
    };
}

module.exports = new StudentController;