const SavedActivityModel = require('../models/savedActivity.model');
const {
    NotFoundException,
    CreateFailedException
} = require('../utils/exceptions/database.exception');
const { successResponse } = require('../utils/responses.utils');

class SavedActivityRepository {

    create = async(body) => {
        const result = await SavedActivityModel.create(body);
        if (!result) {
            throw new CreateFailedException('Saved activity failed to be created');
        }

        return successResponse(result, 'Saved activity was created!');
    };

    delete = async(filters) => {
        const result = await SavedActivityModel.delete(filters);
        if (!result) {
            throw new NotFoundException('Saved activity not found');
        }

        const responseBody = {
            rows_removed: result
        };

        return successResponse(responseBody, 'Saved activity has been deleted');
    };
}

module.exports = new SavedActivityRepository;