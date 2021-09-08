const StudentStatusModel = require('../models/studentStatus.model');
const {
    NotFoundException,
    CreateFailedException,
    UpdateFailedException,
    UnexpectedException
} = require('../utils/exceptions/database.exception');
const { successResponse } = require('../utils/responses.utils');

class StudentStatusRepository {
    findAll = async(filters = {}) => {
        const hasFilters = Object.keys(filters).length !== 0;
        let studentStatusList = await StudentStatusModel.findAll(hasFilters ? filters : {});
        if (!studentStatusList.length) {
            throw new NotFoundException('Student statuses not found');
        }

        return successResponse(studentStatusList, "Success");
    };

    findOne = async(filters) => {
        const result = await StudentStatusModel.findOne(filters);
        if (!result) {
            throw new NotFoundException('Student status not found');
        }

        return successResponse(result, "Success");
    };

    create = async(body) => {
        const result = await StudentStatusModel.create(body);
        if (!result) {
            throw new CreateFailedException('Student status failed to be created');
        }

        return successResponse(result, 'Student status was created!');
    };

    update = async(body, id) => {
        const result = await StudentStatusModel.update(body, id);

        if (!result) {
            throw new UnexpectedException('Something went wrong');
        }

        const { affectedRows, changedRows, info } = result;

        if (!affectedRows) throw new NotFoundException('Student status not found');
        else if (affectedRows && !changedRows) throw new UpdateFailedException('Student status update failed');
        
        const responseBody = {
            rows_matched: affectedRows,
            rows_changed: changedRows,
            info
        };

        return successResponse(responseBody, 'Student status updated successfully');
    };

    delete = async(id) => {
        const result = await StudentStatusModel.delete(id);
        if (!result) {
            throw new NotFoundException('Student status not found');
        }

        const responseBody = {
            rows_removed: result
        };

        return successResponse(responseBody, 'Student status has been deleted');
    };
}

module.exports = new StudentStatusRepository;