const SubjectRepository = require('../repositories/subject.repository');

class SubjectController {
    getAllSubjects = async(req, res, next) => {
        const response = await SubjectRepository.findAll();
        res.send(response);
    };

    getSubjectById = async(req, res, next) => {
        const response = await SubjectRepository.findOne(req.params.code);
        res.send(response);
    };

    createSubject = async(req, res, next) => {
        const response = await SubjectRepository.create(req.body);
        res.status(201).send(response);
    };

    updateSubject = async(req, res, next) => {
        const response = await SubjectRepository.update(req.body, req.params.code);
        res.send(response);
    };

    deleteSubject = async(req, res, next) => {
        const response = await SubjectRepository.delete(req.params.code);
        res.send(response);
    };
}

module.exports = new SubjectController;