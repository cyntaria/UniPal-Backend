const TermRepository = require('../repositories/term.repository');

class TermController {
    getAllTerms = async(req, res, next) => {
        const response = await TermRepository.findAll();
        res.send(response);
    };

    getTermById = async(req, res, next) => {
        const response = await TermRepository.findOne(req.params.id);
        res.send(response);
    };

    createTerm = async(req, res, next) => {
        const response = await TermRepository.create(req.body);
        res.status(201).send(response);
    };

    updateTerm = async(req, res, next) => {
        const response = await TermRepository.update(req.body, req.params.id);
        res.send(response);
    };

    deleteTerm = async(req, res, next) => {
        const response = await TermRepository.delete(req.params.id);
        res.send(response);
    };
}

module.exports = new TermController;