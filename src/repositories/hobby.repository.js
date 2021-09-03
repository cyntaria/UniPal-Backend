const HobbyModel = require('../models/hobby.model');
const {
    NotFoundException,
    CreateFailedException,
    UpdateFailedException,
    UnexpectedException
} = require('../utils/exceptions/database.exception');
const { successResponse } = require('../utils/responses.utils');

class HobbyRepository {
    findAll = async(params = {}) => {
        const hasParams = Object.keys(params).length !== 0;
        let hobbyList = await HobbyModel.findAll(hasParams ? params : {});
        if (!hobbyList.length) {
            throw new NotFoundException('Hobbies not found');
        }

        return successResponse(hobbyList, "Success");
    };

    findOne = async(params) => {
        const result = await HobbyModel.findOne(params);
        if (!result) {
            throw new NotFoundException('Hobby not found');
        }

        return successResponse(result, "Success");
    };

    create = async(body) => {
        const result = await HobbyModel.create(body);
        if (!result) {
            throw new CreateFailedException('Hobby failed to be created');
        }

        return successResponse(result, 'Hobby was created!');
    };

    update = async(body, id) => {
        const result = await HobbyModel.update(body, id);

        if (!result) {
            throw new UnexpectedException('Something went wrong');
        }

        const { affectedRows, changedRows, info } = result;

        if (!affectedRows) throw new NotFoundException('Hobby not found');
        else if (affectedRows && !changedRows) throw new UpdateFailedException('Hobby update failed');
        
        const responseBody = {
            rows_matched: affectedRows,
            rows_changed: changedRows,
            info
        };

        return successResponse(responseBody, 'Hobby updated successfully');
    };

    delete = async(id) => {
        const result = await HobbyModel.delete(id);
        if (!result) {
            throw new NotFoundException('Hobby not found');
        }

        const responseBody = {
            rows_removed: result
        };

        return successResponse(responseBody, 'Hobby has been deleted');
    };
}

module.exports = new HobbyRepository;