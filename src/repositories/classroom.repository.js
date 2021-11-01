const ClassroomModel = require('../models/classroom.model');
const {
    NotFoundException,
    CreateFailedException,
    UpdateFailedException,
    UnexpectedException
} = require('../utils/exceptions/database.exception');
const { successResponse } = require('../utils/responses.utils');
class ClassroomRepository {
    findAll = async(filters = {}) => {
        
        let classroomList = await ClassroomModel.findAll(filters);
        if (!classroomList.length) {
            throw new NotFoundException('Classrooms not found');
        }

        return successResponse(classroomList, "Success");
    };

    findOne = async(id) => {
        const result = await ClassroomModel.findOne(id);
        if (!result) {
            throw new NotFoundException('Classroom not found');
        }

        return successResponse(result, "Success");
    };

    create = async(body) => {
        const result = await ClassroomModel.create(body);
        if (!result) {
            throw new CreateFailedException('Classroom failed to be created');
        }

        return successResponse(result, 'Classroom was created!');
    };

    update = async(body, id) => {
        const result = await ClassroomModel.update(body, id);

        if (!result) {
            throw new UnexpectedException('Something went wrong');
        }

        const { affectedRows, changedRows, info } = result;

        if (!affectedRows) throw new NotFoundException('Classroom not found');
        else if (affectedRows && !changedRows) throw new UpdateFailedException('Classroom update failed');
        
        const responseBody = {
            rows_matched: affectedRows,
            rows_changed: changedRows,
            info
        };

        return successResponse(responseBody, 'Classroom updated successfully');
    };

    delete = async(id) => {
        const result = await ClassroomModel.delete(id);
        if (!result) {
            throw new NotFoundException('Classroom not found');
        }

        const responseBody = {
            rows_removed: result
        };

        return successResponse(responseBody, 'Classroom has been deleted');
    };
}

module.exports = new ClassroomRepository;