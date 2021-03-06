const StudentConnectionModel = require('../models/studentConnection.model');
const {
    NotFoundException,
    CreateFailedException,
    UpdateFailedException,
    UnexpectedException
} = require('../utils/exceptions/database.exception');
const { successResponse } = require('../utils/responses.utils');

class ConnectionRequestRepository {

    findAllRequests = async(filters = {}) => {
        
        let connectionRequestList = await StudentConnectionModel.findAllRequests(filters);

        connectionRequestList = connectionRequestList.map((cRequest) => {
            const connRequestObj = {
                ...cRequest.student_connection,
                sender: cRequest.sender,
                receiver: cRequest.receiver
            };
            return connRequestObj;
        });

        return successResponse(connectionRequestList);
    };

    findAll = async(query) => {
        
        let connectionsList = await StudentConnectionModel.findAll(query);

        connectionsList = connectionsList.map((cRequest) => {
            const connRequestObj = {
                ...cRequest.student_connection,
                sender: cRequest.sender,
                receiver: cRequest.receiver
            };
            return connRequestObj;
        });

        return successResponse(connectionsList);
    };

    findOne = async(id) => {
        let connectionRequest = await StudentConnectionModel.findOne(id);
        if (!connectionRequest) {
            throw new NotFoundException('Connection request not found');
        }

        return successResponse(connectionRequest);
    };

    create = async(body) => {
        const result = await StudentConnectionModel.create(body);
        if (!result) {
            throw new CreateFailedException('Connection request failed to be created');
        }

        return successResponse(result, 'Connection request was created!');
    };

    update = async(body, id) => {
        const result = await StudentConnectionModel.update(body, id);

        if (!result) {
            throw new UnexpectedException('Something went wrong');
        }

        const { affectedRows, changedRows, info } = result;

        if (!affectedRows) throw new NotFoundException('Connection request not found');
        else if (affectedRows && !changedRows) throw new UpdateFailedException('Connection request update failed');
        
        const responseBody = {
            rows_matched: affectedRows,
            rows_changed: changedRows,
            info
        };

        return successResponse(responseBody, 'Connection request updated successfully');
    };

    delete = async(id) => {
        const result = await StudentConnectionModel.delete(id);
        if (!result) {
            throw new NotFoundException('Connection request not found');
        }

        const responseBody = {
            rows_removed: result
        };

        return successResponse(responseBody, 'Connection request has been deleted');
    };
}

module.exports = new ConnectionRequestRepository;