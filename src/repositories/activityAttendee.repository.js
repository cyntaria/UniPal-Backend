const ActivityAttendeeModel = require('../models/activityAttendee.model');
const {
    NotFoundException,
    CreateFailedException,
    UpdateFailedException,
    UnexpectedException
} = require('../utils/exceptions/database.exception');
const { successResponse } = require('../utils/responses.utils');

class ActivityAttendeeRepository {

    create = async(body) => {
        const result = await ActivityAttendeeModel.create(body);
        if (!result) {
            throw new CreateFailedException('Activity attendee failed to be created');
        }

        return successResponse(result, 'Activity attendee was created!');
    };

    update = async(body, filters) => {
        const result = await ActivityAttendeeModel.update(body, filters);

        if (!result) {
            throw new UnexpectedException('Something went wrong');
        }

        const { affectedRows, changedRows, info } = result;

        if (!affectedRows) throw new NotFoundException('Activity attendee not found');
        else if (affectedRows && !changedRows) throw new UpdateFailedException('Activity attendee update failed');
        
        const responseBody = {
            rows_matched: affectedRows,
            rows_changed: changedRows,
            info
        };

        return successResponse(responseBody, 'Activity attendee updated successfully');
    };

    delete = async(filters) => {
        const result = await ActivityAttendeeModel.delete(filters);
        if (!result) {
            throw new NotFoundException('Activity attendee not found');
        }

        const responseBody = {
            rows_removed: result
        };

        return successResponse(responseBody, 'Activity attendee has been deleted');
    };
}

module.exports = new ActivityAttendeeRepository;