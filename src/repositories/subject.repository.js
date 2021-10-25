const SubjectModel = require('../models/subject.model');
const {
    NotFoundException,
    CreateFailedException,
    UpdateFailedException,
    UnexpectedException
} = require('../utils/exceptions/database.exception');
const { successResponse } = require('../utils/responses.utils');

class SubjectRepository {
    findAll = async(filters = {}) => {
        
        let subjectList = await SubjectModel.findAll(filters);
        if (!subjectList.length) {
            throw new NotFoundException('Subjects not found');
        }

        return successResponse(subjectList, "Success");
    };

    findOne = async(subject_code) => {
        const result = await SubjectModel.findOne(subject_code);
        if (!result) {
            throw new NotFoundException('Subject not found');
        }

        return successResponse(result, "Success");
    };

    create = async(body) => {
        const result = await SubjectModel.create(body);
        if (!result) {
            throw new CreateFailedException('Subject failed to be created');
        }

        return successResponse(result, 'Subject was created!');
    };

    update = async(body, code) => {
        const result = await SubjectModel.update(body, code);

        if (!result) {
            throw new UnexpectedException('Something went wrong');
        }

        const { affectedRows, changedRows, info } = result;

        if (!affectedRows) throw new NotFoundException('Subject not found');
        else if (affectedRows && !changedRows) throw new UpdateFailedException('Subject update failed');
        
        const responseBody = {
            rows_matched: affectedRows,
            rows_changed: changedRows,
            info
        };

        return successResponse(responseBody, 'Subject updated successfully');
    };

    delete = async(code) => {
        const result = await SubjectModel.delete(code);
        if (!result) {
            throw new NotFoundException('Subject not found');
        }

        const responseBody = {
            rows_removed: result
        };

        return successResponse(responseBody, 'Subject has been deleted');
    };
}

module.exports = new SubjectRepository;