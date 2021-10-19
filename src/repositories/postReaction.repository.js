const PostReactionModel = require('../models/postReaction.model');
const {
    NotFoundException,
    CreateFailedException,
    UpdateFailedException,
    UnexpectedException
} = require('../utils/exceptions/database.exception');
const { successResponse } = require('../utils/responses.utils');

class PostReactionRepository {

    create = async(body) => {
        const result = await PostReactionModel.create(body);
        if (!result) {
            throw new CreateFailedException('Post reaction failed to be created');
        }

        return successResponse(result, 'Post reaction was created!');
    };

    update = async(body, filters) => {
        const result = await PostReactionModel.update(body, filters);

        if (!result) {
            throw new UnexpectedException('Something went wrong');
        }

        const { affectedRows, changedRows, info } = result;

        if (!affectedRows) throw new NotFoundException('Post reaction not found');
        else if (affectedRows && !changedRows) throw new UpdateFailedException('Post reaction update failed');
        
        const responseBody = {
            rows_matched: affectedRows,
            rows_changed: changedRows,
            info
        };

        return successResponse(responseBody, 'Post reaction updated successfully');
    };

    delete = async(filters) => {
        const result = await PostReactionModel.delete(filters);
        if (!result) {
            throw new NotFoundException('Post reaction not found');
        }

        const responseBody = {
            rows_removed: result
        };

        return successResponse(responseBody, 'Post reaction has been deleted');
    };
}

module.exports = new PostReactionRepository;