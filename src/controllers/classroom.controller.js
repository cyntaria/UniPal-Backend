const ClassroomRepository = require('../repositories/classroom.repository');

class ClassroomController {
    getAllClassrooms = async(req, res, next) => {
        const response = await ClassroomRepository.findAll();
        res.send(response);
    };

    getClassroomById = async(req, res, next) => {
        const response = await ClassroomRepository.findOne(req.params.id);
        res.send(response);
    };

    createClassroom = async(req, res, next) => {
        const response = await ClassroomRepository.create(req.body);
        res.status(201).send(response);
    };

    updateClassroom = async(req, res, next) => {
        const response = await ClassroomRepository.update(req.body, req.params.id);
        res.send(response);
    };

    deleteClassroom = async(req, res, next) => {
        const response = await ClassroomRepository.delete(req.params.id);
        res.send(response);
    };
}

module.exports = new ClassroomController;