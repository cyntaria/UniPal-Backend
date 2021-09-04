const CampusModel = require('../models/campus.model');
const {
    NotFoundException,
    CreateFailedException,
    UpdateFailedException,
    UnexpectedException
} = require('../utils/exceptions/database.exception');
const { successResponse } = require('../utils/responses.utils');

class CampusRepository {
    findAll = async(params = {}) => {
        const hasParams = Object.keys(params).length !== 0;
        let campusList = await CampusModel.findAll(hasParams ? params : {});
        if (!campusList.length) {
            throw new NotFoundException('Campuses not found');
        }

        return successResponse(campusList, "Success");
    };

    findOne = async(params) => {
        const result = await CampusModel.findOne(params);
        if (!result) {
            throw new NotFoundException('Campus not found');
        }

        return successResponse(result, "Success");
    };

    create = async(body) => {
        const result = await CampusModel.create(body);
        if (!result) {
            throw new CreateFailedException('Campus failed to be created');
        }

        return successResponse(result, 'Campus was created!');
    };

    update = async(body, id) => {
        const result = await CampusModel.update(body, id);

        if (!result) {
            throw new UnexpectedException('Something went wrong');
        }

        const { affectedRows, changedRows, info } = result;

        if (!affectedRows) throw new NotFoundException('Campus not found');
        else if (affectedRows && !changedRows) throw new UpdateFailedException('Campus update failed');
        
        const responseBody = {
            rows_matched: affectedRows,
            rows_changed: changedRows,
            info
        };

        return successResponse(responseBody, 'Campus updated successfully');
    };

    delete = async(id) => {
        const result = await CampusModel.delete(id);
        if (!result) {
            throw new NotFoundException('Campus not found');
        }

        const responseBody = {
            rows_removed: result
        };

        return successResponse(responseBody, 'Campus has been deleted');
    };
}

module.exports = new CampusRepository;