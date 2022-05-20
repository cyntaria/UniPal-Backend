const TeacherModel = require('../models/teacher.model');
const {
    NotFoundException,
    CreateFailedException,
    UpdateFailedException,
    UnexpectedException
} = require('../utils/exceptions/database.exception');
const { successResponse } = require('../utils/responses.utils');
class TeacherRepository {
    findAll = async(filters = {}) => {
        
        let teacherList = await TeacherModel.findAll(filters);

        return successResponse(teacherList, "Success");
    };

    findOne = async(id) => {
        const result = await TeacherModel.findOne(id);
        if (!result) {
            throw new NotFoundException('Teacher not found');
        }

        return successResponse(result, "Success");
    };

    create = async(body) => {
        const result = await TeacherModel.create(body);
        if (!result) {
            throw new CreateFailedException('Teacher failed to be created');
        }

        return successResponse(result, 'Teacher was created!');
    };

    update = async(body, id) => {
        const result = await TeacherModel.update(body, id);

        if (!result) {
            throw new UnexpectedException('Something went wrong');
        }

        const { affectedRows, changedRows, info } = result;

        if (!affectedRows) throw new NotFoundException('Teacher not found');
        else if (affectedRows && !changedRows) throw new UpdateFailedException('Teacher update failed');
        
        const responseBody = {
            rows_matched: affectedRows,
            rows_changed: changedRows,
            info
        };

        return successResponse(responseBody, 'Teacher updated successfully');
    };

    delete = async(id) => {
        const result = await TeacherModel.delete(id);
        if (!result) {
            throw new NotFoundException('Teacher not found');
        }

        const responseBody = {
            rows_removed: result
        };

        return successResponse(responseBody, 'Teacher has been deleted');
    };
}

module.exports = new TeacherRepository;