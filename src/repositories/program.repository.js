const ProgramModel = require('../models/program.model');
const {
    NotFoundException,
    CreateFailedException,
    UpdateFailedException,
    UnexpectedException
} = require('../utils/exceptions/database.exception');
const { successResponse } = require('../utils/responses.utils');

class ProgramRepository {
    findAll = async(filters = {}) => {
        
        let programList = await ProgramModel.findAll(filters);
        if (!programList.length) {
            throw new NotFoundException('Programs not found');
        }

        return successResponse(programList, "Success");
    };

    findOne = async(filters) => {
        const result = await ProgramModel.findOne(filters);
        if (!result) {
            throw new NotFoundException('Program not found');
        }

        return successResponse(result, "Success");
    };

    create = async(body) => {
        const result = await ProgramModel.create(body);
        if (!result) {
            throw new CreateFailedException('Program failed to be created');
        }

        return successResponse(result, 'Program was created!');
    };

    update = async(body, id) => {
        const result = await ProgramModel.update(body, id);

        if (!result) {
            throw new UnexpectedException('Something went wrong');
        }

        const { affectedRows, changedRows, info } = result;

        if (!affectedRows) throw new NotFoundException('Program not found');
        else if (affectedRows && !changedRows) throw new UpdateFailedException('Program update failed');
        
        const responseBody = {
            rows_matched: affectedRows,
            rows_changed: changedRows,
            info
        };

        return successResponse(responseBody, 'Program updated successfully');
    };

    delete = async(id) => {
        const result = await ProgramModel.delete(id);
        if (!result) {
            throw new NotFoundException('Program not found');
        }

        const responseBody = {
            rows_removed: result
        };

        return successResponse(responseBody, 'Program has been deleted');
    };
}

module.exports = new ProgramRepository;