const StudentRepository = require('../repositories/student.repository');

class StudentController {
    getAllStudents = async(req, res, next) => {
        const response = await StudentRepository.findAll(req.query, req.currentStudent.erp);
        res.send(response);
    };

    getStudentById = async(req, res, next) => {
        const response = await StudentRepository.findOne(req.params.erp, req.currentStudent.erp);
        res.send(response);
    };

    getOrganizedActivities = async(req, res, next) => {
        const response = await StudentRepository.findAllOrganizedActivitiesByStudent(req.params.erp, req.query);
        res.send(response);
    };

    getAttendedActivities = async(req, res, next) => {
        const response = await StudentRepository.findAllAttendedActivitiesByStudent(req.params.erp, req.query);
        res.send(response);
    };

    getSavedActivities = async(req, res, next) => {
        const response = await StudentRepository.findAllSavedActivitiesByStudent(req.params.erp, req.query);
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