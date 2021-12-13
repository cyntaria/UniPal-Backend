const TermModel = require('../models/term.model');
const {
    NotFoundException,
    CreateFailedException,
    UpdateFailedException,
    UnexpectedException
} = require('../utils/exceptions/database.exception');
const { successResponse } = require('../utils/responses.utils');

class TermRepository {
    findAll = async(filters = {}) => {
        
        let termList = await TermModel.findAll(filters);
        if (!termList.length) {
            throw new NotFoundException('Terms not found');
        }

        return successResponse(termList, "Success");
    };

    findOne = async(term_id) => {
        const result = await TermModel.findOne(term_id);
        if (!result) {
            throw new NotFoundException('Term not found');
        }

        return successResponse(result, "Success");
    };

    create = async(body) => {
        const result = await TermModel.create(body);
        if (!result) {
            throw new CreateFailedException('Term failed to be created');
        }

        return successResponse(result, 'Term was created!');
    };

    update = async(body, id) => {
        const result = await TermModel.update(body, id);

        if (!result) {
            throw new UnexpectedException('Something went wrong');
        }

        const { affectedRows, changedRows, info } = result;

        if (!affectedRows) throw new NotFoundException('Term not found');
        else if (affectedRows && !changedRows) throw new UpdateFailedException('Term update failed');
        
        const responseBody = {
            rows_matched: affectedRows,
            rows_changed: changedRows,
            info
        };

        return successResponse(responseBody, 'Term updated successfully');
    };

    delete = async(id) => {
        const result = await TermModel.delete(id);
        if (!result) {
            throw new NotFoundException('Term not found');
        }

        const responseBody = {
            rows_removed: result
        };

        return successResponse(responseBody, 'Term has been deleted');
    };
}

module.exports = new TermRepository;