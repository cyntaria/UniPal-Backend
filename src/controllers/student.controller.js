const StudentRepository = require('../repositories/student.repository');

class StudentController {
    getAllStudents = async(req, res, next) => {
        const response = await StudentRepository.findAll(req.query);
        res.send(response);
    };

    getStudentById = async(req, res, next) => {
        const response = await StudentRepository.findOne({erp: req.params.erp});
        res.send(response);
    };

    updateStudent = async(req, res, next) => {
        const response = await StudentRepository.update(req.body, req.params.erp);
        res.send(response);
    };

    deleteStudent = async(req, res, next) => {
        const response = await StudentRepository.delete(req.params.erp);
        res.send(response);
    };
}

module.exports = new StudentController;