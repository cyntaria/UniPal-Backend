const { successResponse } = require('../utils/responses.utils');

const TeacherReviewModel = require('../models/teacherReview.model');
const {
    NotFoundException,
    CreateFailedException,
    UpdateFailedException,
    UnexpectedException
} = require('../utils/exceptions/database.exception');

class TeacherReviewRepository {
    findAll = async(filters = {}) => {
        
        let teacherReviewList = await TeacherReviewModel.findAll(filters);
        if (!teacherReviewList.length) {
            throw new NotFoundException('Teacher reviews not found');
        }

        return successResponse(teacherReviewList);
    };

    findOne = async(id) => {
        const teacherReview = await TeacherReviewModel.findOne(id);
        if (!teacherReview) {
            throw new NotFoundException('Teacher review not found');
        }

        return successResponse(teacherReview);
    };

    create = async(body) => {
        const result = await TeacherReviewModel.create(body);

        if (!result) {
            throw new CreateFailedException('Teacher review failed to be created');
        }

        return successResponse(result, 'Teacher review was created!');
    };

    update = async(body, id) => {
        const result = await TeacherReviewModel.update(body, id);

        if (!result) {
            throw new UnexpectedException('Something went wrong');
        }

        const { affectedRows, changedRows, info } = result;

        if (!affectedRows) throw new NotFoundException('Teacher review not found');
        else if (affectedRows && !changedRows) throw new UpdateFailedException('Teacher review update failed');
        
        const responseBody = {
            rows_matched: affectedRows,
            rows_changed: changedRows,
            info
        };

        return successResponse(responseBody, 'Teacher review updated successfully');
    };

    delete = async(id) => {
        const result = await TeacherReviewModel.delete(id);
        if (!result) {
            throw new NotFoundException('Teacher review not found');
        }

        const responseBody = {
            rows_removed: result
        };

        return successResponse(responseBody, 'Teacher review has been deleted');
    };
}

module.exports = new TeacherReviewRepository;