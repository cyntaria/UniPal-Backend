const TeacherRepository = require('../repositories/teacher.repository');

class TeacherController {
    getAllTeachers = async(req, res, next) => {
        const response = await TeacherRepository.findAll();
        res.send(response);
    };

    getTeacherById = async(req, res, next) => {
        const response = await TeacherRepository.findOne(req.params.id);
        res.send(response);
    };

    createTeacher = async(req, res, next) => {
        const response = await TeacherRepository.create(req.body);
        res.status(201).send(response);
    };

    updateTeacher = async(req, res, next) => {
        const response = await TeacherRepository.update(req.body, req.params.id);
        res.send(response);
    };

    deleteTeacher = async(req, res, next) => {
        const response = await TeacherRepository.delete(req.params.id);
        res.send(response);
    };
}

module.exports = new TeacherController;