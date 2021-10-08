const FriendRequestRepository = require('../repositories/friendRequest.repository');

class FriendRequestController {

    getAllFriendRequests = async(req, res, next) => {
        const response = await FriendRequestRepository.findAll(req.query);
        res.send(response);
    };

    getFriendRequestById = async(req, res, next) => {
        const response = await FriendRequestRepository.findOne(req.params.id);
        res.send(response);
    };

    createFriendRequest = async(req, res, next) => {
        const response = await FriendRequestRepository.create(req.body);
        res.status(201).send(response);
    };

    updateFriendRequest = async(req, res, next) => {
        const response = await FriendRequestRepository.update(req.body, req.params.id);
        res.send(response);
    };

    deleteFriendRequest = async(req, res, next) => {
        const response = await FriendRequestRepository.delete(req.params.id);
        res.send(response);
    };
}

module.exports = new FriendRequestController;