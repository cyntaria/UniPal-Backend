const TimeslotModel = require('../models/timeslot.model');
const {
    NotFoundException,
    CreateFailedException,
    UpdateFailedException,
    UnexpectedException
} = require('../utils/exceptions/database.exception');
const { successResponse } = require('../utils/responses.utils');
const { parseTime } = require('../utils/common.utils');

class TimeslotRepository {
    findAll = async(filters = {}) => {
        
        let timeslotList = await TimeslotModel.findAll(filters);
        if (!timeslotList.length) {
            throw new NotFoundException('Timeslots not found');
        }

        for (const timeslot of timeslotList) {
            timeslot.start_time = parseTime(timeslot.start_time);
            timeslot.end_time = parseTime(timeslot.end_time);
        }

        return successResponse(timeslotList, "Success");
    };

    findOne = async(id) => {
        const result = await TimeslotModel.findOne(id);
        if (!result) {
            throw new NotFoundException('Timeslot not found');
        }

        result.start_time = parseTime(result.start_time);
        result.end_time = parseTime(result.end_time);

        return successResponse(result, "Success");
    };

    create = async(body) => {
        const conflicts = await TimeslotModel.findTimeConflicts(body);
        if (conflicts !== 0) {
            throw new CreateFailedException('Timeslot conflicts found');
        }

        const result = await TimeslotModel.create(body);
        if (!result) {
            throw new CreateFailedException('Timeslot failed to be created');
        }

        return successResponse(result, 'Timeslot was created!');
    };

    update = async(body, id) => {
        if (body.start_time !== undefined || body.end_time !== undefined) {
            const conflicts = await TimeslotModel.findTimeConflicts(body);

            if (conflicts !== 0) {
                throw new UpdateFailedException('Timeslot conflicts found');
            }
        }

        const result = await TimeslotModel.update(body, id);

        if (!result) {
            throw new UnexpectedException('Something went wrong');
        }

        const { affectedRows, changedRows, info } = result;

        if (!affectedRows) throw new NotFoundException('Timeslot not found');
        else if (affectedRows && !changedRows) throw new UpdateFailedException('Timeslot update failed');
        
        const responseBody = {
            rows_matched: affectedRows,
            rows_changed: changedRows,
            info
        };

        return successResponse(responseBody, 'Timeslot updated successfully');
    };

    delete = async(id) => {
        const result = await TimeslotModel.delete(id);
        if (!result) {
            throw new NotFoundException('Timeslot not found');
        }

        const responseBody = {
            rows_removed: result
        };

        return successResponse(responseBody, 'Timeslot has been deleted');
    };
}

module.exports = new TimeslotRepository;