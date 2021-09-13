const CampusSpotModel = require('../models/campusSpot.model');
const {
    NotFoundException,
    CreateFailedException,
    UpdateFailedException,
    UnexpectedException
} = require('../utils/exceptions/database.exception');
const { successResponse } = require('../utils/responses.utils');

class CampusSpotRepository {
    findAll = async(filters = {}) => {
        
        let campusSpotList = await CampusSpotModel.findAll(filters);
        if (!campusSpotList.length) {
            throw new NotFoundException('Campus spots not found');
        }

        return successResponse(campusSpotList, "Success");
    };

    findOne = async(filters) => {
        const result = await CampusSpotModel.findOne(filters);
        if (!result) {
            throw new NotFoundException('Campus spot not found');
        }

        return successResponse(result, "Success");
    };

    create = async(body) => {
        const result = await CampusSpotModel.create(body);
        if (!result) {
            throw new CreateFailedException('Campus spot failed to be created');
        }

        return successResponse(result, 'Campus spot was created!');
    };

    update = async(body, id) => {
        const result = await CampusSpotModel.update(body, id);

        if (!result) {
            throw new UnexpectedException('Something went wrong');
        }

        const { affectedRows, changedRows, info } = result;

        if (!affectedRows) throw new NotFoundException('Campus spot not found');
        else if (affectedRows && !changedRows) throw new UpdateFailedException('Campus spot update failed');
        
        const responseBody = {
            rows_matched: affectedRows,
            rows_changed: changedRows,
            info
        };

        return successResponse(responseBody, 'Campus spot updated successfully');
    };

    delete = async(id) => {
        const result = await CampusSpotModel.delete(id);
        if (!result) {
            throw new NotFoundException('Campus spot not found');
        }

        const responseBody = {
            rows_removed: result
        };

        return successResponse(responseBody, 'Campus spot has been deleted');
    };
}

module.exports = new CampusSpotRepository;