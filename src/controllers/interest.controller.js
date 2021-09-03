const {checkValidation} = require('../middleware/validation.middleware');

const InterestRepository = require('../repositories/interest.repository');

class InterestController {
    getAllInterests = async(req, res, next) => {
        const response = await InterestRepository.findAll();
        res.send(response);
    };

    getInterestById = async(req, res, next) => {
        const response = await InterestRepository.findOne({ interest_id: req.params.id });
        res.send(response);
    };

    createInterest = async(req, res, next) => {
        checkValidation(req);

        const response = await InterestRepository.create(req.body);
        res.status(201).send(response);
    };

    updateInterest = async(req, res, next) => {
        checkValidation(req);

        const response = await InterestRepository.update(req.body, req.params.id);
        res.send(response);
    };

    deleteInterest = async(req, res, next) => {
        const response = await InterestRepository.delete(req.params.id);
        res.send(response);
    };
}

module.exports = new InterestController;