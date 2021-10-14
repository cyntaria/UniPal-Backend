const HangoutRequestModel = require('../models/hangoutRequest.model');
const {
    NotFoundException,
    CreateFailedException,
    UpdateFailedException,
    UnexpectedException
} = require('../utils/exceptions/database.exception');
const { successResponse } = require('../utils/responses.utils');

class HangoutRequestRepository {

    findAll = async(query) => {
        
        let hangoutRequestsList = await HangoutRequestModel.findAll(query);
        if (!hangoutRequestsList.length) {
            throw new NotFoundException('Hangout requests not found');
        }

        return successResponse(hangoutRequestsList);
    };

    findOne = async(id) => {
        const hangoutRequest = await HangoutRequestModel.findOne(id);
        if (!hangoutRequest) {
            throw new NotFoundException('Hangout request not found');
        }

        return successResponse(hangoutRequest);
    };

    create = async(body) => {
        const result = await HangoutRequestModel.create(body);
        if (!result) {
            throw new CreateFailedException('Hangout request failed to be created');
        }

        return successResponse(result, 'Hangout request was created!');
    };

    update = async(body, id) => {
        const result = await HangoutRequestModel.update(body, id);

        if (!result) {
            throw new UnexpectedException('Something went wrong');
        }

        const { affectedRows, changedRows, info } = result;

        if (!affectedRows) throw new NotFoundException('Hangout request not found');
        else if (affectedRows && !changedRows) throw new UpdateFailedException('Hangout request update failed');
        
        const responseBody = {
            rows_matched: affectedRows,
            rows_changed: changedRows,
            info
        };

        return successResponse(responseBody, 'Hangout request updated successfully');
    };

    delete = async(id) => {
        const result = await HangoutRequestModel.delete(id);
        if (!result) {
            throw new NotFoundException('Hangout request not found');
        }

        const responseBody = {
            rows_removed: result
        };

        return successResponse(responseBody, 'Hangout request has been deleted');
    };
}

module.exports = new HangoutRequestRepository;