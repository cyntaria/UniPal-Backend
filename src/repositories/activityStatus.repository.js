const ActivityStatusModel = require('../models/activityStatus.model');
const {
    NotFoundException,
    CreateFailedException,
    UpdateFailedException,
    UnexpectedException
} = require('../utils/exceptions/database.exception');
const { successResponse } = require('../utils/responses.utils');

class ActivityStatusRepository {
    findAll = async(filters = {}) => {
        
        let activityStatusList = await ActivityStatusModel.findAll(filters);
        if (!activityStatusList.length) {
            throw new NotFoundException('Activity statuses not found');
        }

        return successResponse(activityStatusList, "Success");
    };

    findOne = async(filters) => {
        const result = await ActivityStatusModel.findOne(filters);
        if (!result) {
            throw new NotFoundException('Activity status not found');
        }

        return successResponse(result, "Success");
    };

    create = async(body) => {
        const result = await ActivityStatusModel.create(body);
        if (!result) {
            throw new CreateFailedException('Activity status failed to be created');
        }

        return successResponse(result, 'Activity status was created!');
    };

    update = async(body, id) => {
        const result = await ActivityStatusModel.update(body, id);

        if (!result) {
            throw new UnexpectedException('Something went wrong');
        }

        const { affectedRows, changedRows, info } = result;

        if (!affectedRows) throw new NotFoundException('Activity status not found');
        else if (affectedRows && !changedRows) throw new UpdateFailedException('Activity status update failed');
        
        const responseBody = {
            rows_matched: affectedRows,
            rows_changed: changedRows,
            info
        };

        return successResponse(responseBody, 'Activity status updated successfully');
    };

    delete = async(id) => {
        const result = await ActivityStatusModel.delete(id);
        if (!result) {
            throw new NotFoundException('Activity status not found');
        }

        const responseBody = {
            rows_removed: result
        };

        return successResponse(responseBody, 'Activity status has been deleted');
    };
}

module.exports = new ActivityStatusRepository;