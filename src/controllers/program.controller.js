const ProgramRepository = require('../repositories/program.repository');

class ProgramController {
    getAllPrograms = async(req, res, next) => {
        const response = await ProgramRepository.findAll();
        res.send(response);
    };

    getProgramById = async(req, res, next) => {
        const response = await ProgramRepository.findOne({ program_id: req.params.id });
        res.send(response);
    };

    createProgram = async(req, res, next) => {
        const response = await ProgramRepository.create(req.body);
        res.status(201).send(response);
    };

    updateProgram = async(req, res, next) => {
        const response = await ProgramRepository.update(req.body, req.params.id);
        res.send(response);
    };

    deleteProgram = async(req, res, next) => {
        const response = await ProgramRepository.delete(req.params.id);
        res.send(response);
    };
}

module.exports = new ProgramController;