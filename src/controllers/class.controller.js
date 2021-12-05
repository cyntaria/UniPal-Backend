const ClassRepository = require('../repositories/class.repository');

class ClassController {
    getAllClasses = async(req, res, next) => {
        const response = await ClassRepository.findAll(req.query);
        res.send(response);
    };

    getClassById = async(req, res, next) => {
        const response = await ClassRepository.findOne(req.params.class_erp);
        res.send(response);
    };

    createClass = async(req, res, next) => {
        const response = await ClassRepository.create(req.body);
        res.status(201).send(response);
    };

    createManyClasses = async(req, res, next) => {
        const response = await ClassRepository.createMany(req.body);
        res.status(201).send(response);
    };

    updateClass = async(req, res, next) => {
        const response = await ClassRepository.update(req.body, req.params.class_erp);
        res.send(response);
    };

    deleteClass = async(req, res, next) => {
        const response = await ClassRepository.delete(req.params.class_erp);
        res.send(response);
    };
}

module.exports = new ClassController;