const ActivityTypeModel = require('../models/activityType.model');
const {
    NotFoundException,
    CreateFailedException,
    UpdateFailedException,
    UnexpectedException
} = require('../utils/exceptions/database.exception');
const { successResponse } = require('../utils/responses.utils');

class ActivityTypeRepository {
    findAll = async(filters = {}) => {
        
        let activityTypeList = await ActivityTypeModel.findAll(filters);
        if (!activityTypeList.length) {
            throw new NotFoundException('Activity types not found');
        }

        return successResponse(activityTypeList, "Success");
    };

    findOne = async(filters) => {
        const result = await ActivityTypeModel.findOne(filters);
        if (!result) {
            throw new NotFoundException('Activity type not found');
        }

        return successResponse(result, "Success");
    };

    create = async(body) => {
        const result = await ActivityTypeModel.create(body);
        if (!result) {
            throw new CreateFailedException('Activity type failed to be created');
        }

        return successResponse(result, 'Activity type was created!');
    };

    update = async(body, id) => {
        const result = await ActivityTypeModel.update(body, id);

        if (!result) {
            throw new UnexpectedException('Something went wrong');
        }

        const { affectedRows, changedRows, info } = result;

        if (!affectedRows) throw new NotFoundException('Activity type not found');
        else if (affectedRows && !changedRows) throw new UpdateFailedException('Activity type update failed');
        
        const responseBody = {
            rows_matched: affectedRows,
            rows_changed: changedRows,
            info
        };

        return successResponse(responseBody, 'Activity type updated successfully');
    };

    delete = async(id) => {
        const result = await ActivityTypeModel.delete(id);
        if (!result) {
            throw new NotFoundException('Activity type not found');
        }

        const responseBody = {
            rows_removed: result
        };

        return successResponse(responseBody, 'Activity type has been deleted');
    };
}

module.exports = new ActivityTypeRepository;