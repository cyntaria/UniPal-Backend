const ReactionTypeModel = require('../models/reactionType.model');
const {
    NotFoundException,
    CreateFailedException,
    UpdateFailedException,
    UnexpectedException
} = require('../utils/exceptions/database.exception');
const { successResponse } = require('../utils/responses.utils');

class ReactionTypeRepository {
    findAll = async(filters = {}) => {
        
        let reactionTypeList = await ReactionTypeModel.findAll(filters);
        if (!reactionTypeList.length) {
            throw new NotFoundException('Reaction types not found');
        }

        return successResponse(reactionTypeList, "Success");
    };

    findOne = async(reaction_type_id) => {
        const result = await ReactionTypeModel.findOne(reaction_type_id);
        if (!result) {
            throw new NotFoundException('Reaction type not found');
        }

        return successResponse(result, "Success");
    };

    create = async(body) => {
        const result = await ReactionTypeModel.create(body);
        if (!result) {
            throw new CreateFailedException('Reaction type failed to be created');
        }

        return successResponse(result, 'Reaction type was created!');
    };

    update = async(body, id) => {
        const result = await ReactionTypeModel.update(body, id);

        if (!result) {
            throw new UnexpectedException('Something went wrong');
        }

        const { affectedRows, changedRows, info } = result;

        if (!affectedRows) throw new NotFoundException('Reaction type not found');
        else if (affectedRows && !changedRows) throw new UpdateFailedException('Reaction type update failed');
        
        const responseBody = {
            rows_matched: affectedRows,
            rows_changed: changedRows,
            info
        };

        return successResponse(responseBody, 'Reaction type updated successfully');
    };

    delete = async(id) => {
        const result = await ReactionTypeModel.delete(id);
        if (!result) {
            throw new NotFoundException('Reaction type not found');
        }

        const responseBody = {
            rows_removed: result
        };

        return successResponse(responseBody, 'Reaction type has been deleted');
    };
}

module.exports = new ReactionTypeRepository;