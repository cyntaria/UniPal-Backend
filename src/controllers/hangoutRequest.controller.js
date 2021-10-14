const HangoutRequestRepository = require('../repositories/hangoutRequest.repository');

class HangoutRequestController {

    getAllHangoutRequests = async(req, res, next) => {
        const response = await HangoutRequestRepository.findAll(req.query);
        res.send(response);
    };

    getHangoutRequestById = async(req, res, next) => {
        const response = await HangoutRequestRepository.findOne(req.params.id);
        res.send(response);
    };

    createHangoutRequest = async(req, res, next) => {
        const response = await HangoutRequestRepository.create(req.body);
        res.status(201).send(response);
    };

    updateHangoutRequest = async(req, res, next) => {
        const response = await HangoutRequestRepository.update(req.body, req.params.id);
        res.send(response);
    };

    deleteHangoutRequest = async(req, res, next) => {
        const response = await HangoutRequestRepository.delete(req.params.id);
        res.send(response);
    };
}

module.exports = new HangoutRequestController;