const FriendRequestModel = require('../models/friendRequest.model');
const {
    NotFoundException,
    CreateFailedException,
    UpdateFailedException,
    UnexpectedException
} = require('../utils/exceptions/database.exception');
const { successResponse } = require('../utils/responses.utils');

class FriendRequestRepository {

    findAll = async(filters = {}) => {
        
        let friendRequestList = await FriendRequestModel.findAll(filters);
        if (!friendRequestList.length) {
            throw new NotFoundException('Friend requests not found');
        }

        return successResponse(friendRequestList);
    };

    findOne = async(filters) => {
        const friendRequest = await FriendRequestModel.findOne(filters);
        if (!friendRequest) {
            throw new NotFoundException('Friend request not found');
        }

        return successResponse(friendRequest);
    };

    create = async(body) => {
        const result = await FriendRequestModel.create(body);
        if (!result) {
            throw new CreateFailedException('Friend request failed to be created');
        }

        return successResponse(result, 'Friend request was created!');
    };

    update = async(body, id) => {
        const result = await FriendRequestModel.update(body, id);

        if (!result) {
            throw new UnexpectedException('Something went wrong');
        }

        const { affectedRows, changedRows, info } = result;

        if (!affectedRows) throw new NotFoundException('Friend request not found');
        else if (affectedRows && !changedRows) throw new UpdateFailedException('Friend request update failed');
        
        const responseBody = {
            rows_matched: affectedRows,
            rows_changed: changedRows,
            info
        };

        return successResponse(responseBody, 'Friend request updated successfully');
    };

    delete = async(id) => {
        const result = await FriendRequestModel.delete(id);
        if (!result) {
            throw new NotFoundException('Friend request not found');
        }

        const responseBody = {
            rows_removed: result
        };

        return successResponse(responseBody, 'Friend request has been deleted');
    };
}

module.exports = new FriendRequestRepository;