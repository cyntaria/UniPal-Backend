const { successResponse } = require('../utils/responses.utils');

const ActivityModel = require('../models/activity.model');
const {
    NotFoundException,
    CreateFailedException,
    UpdateFailedException,
    UnexpectedException
} = require('../utils/exceptions/database.exception');

class ActivityRepository {
    findAll = async(filters = {}) => {
        
        let activityList = await ActivityModel.findAll(filters);
        if (!activityList.length) {
            throw new NotFoundException('Activities not found');
        }

        return successResponse(activityList);
    };

    findOne = async(filters) => {
        const activity = await ActivityModel.findOne(filters);
        if (!activity) {
            throw new NotFoundException('Activity not found');
        }

        return successResponse(activity);
    };

    findAllAttendeesByActivity = async(params) => {
        let activityAttendees = await ActivityModel.findAllAttendeesByActivity(params);
        if (!activityAttendees.length) {
            throw new NotFoundException('Activity attendees not found');
        }

        activityAttendees = activityAttendees.map((activity) => {
            const {involvement_type, activity_id, ...attendee} = activity;
            return { activity_id, ...attendee, involvement_type};
        });

        return successResponse(activityAttendees);
    };

    create = async(body) => {
        const result = await ActivityModel.create(body);

        if (!result) {
            throw new CreateFailedException('Activity failed to be created');
        }

        return successResponse(result, 'Activity was created!');
    };

    update = async(body, id) => {
        const result = await ActivityModel.update(body, id);

        if (!result) {
            throw new UnexpectedException('Something went wrong');
        }

        const { affectedRows, changedRows, info } = result;

        if (!affectedRows) throw new NotFoundException('Activity not found');
        else if (affectedRows && !changedRows) throw new UpdateFailedException('Activity update failed');
        
        const responseBody = {
            rows_matched: affectedRows,
            rows_changed: changedRows,
            info
        };

        return successResponse(responseBody, 'Activity updated successfully');
    };

    delete = async(id) => {
        const result = await ActivityModel.delete(id);
        if (!result) {
            throw new NotFoundException('Activity not found');
        }

        const responseBody = {
            rows_removed: result
        };

        return successResponse(responseBody, 'Activity has been deleted');
    };
}

module.exports = new ActivityRepository;