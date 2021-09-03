const InterestModel = require('../models/interest.model');
const {
    NotFoundException,
    CreateFailedException,
    UpdateFailedException,
    UnexpectedException
} = require('../utils/exceptions/database.exception');
const { successResponse } = require('../utils/responses.utils');

class InterestRepository {
    findAll = async(params = {}) => {
        const hasParams = Object.keys(params).length !== 0;
        let interestList = await InterestModel.findAll(hasParams ? params : {});
        if (!interestList.length) {
            throw new NotFoundException('Interests not found');
        }

        return successResponse(interestList, "Success");
    };

    findOne = async(params) => {
        const result = await InterestModel.findOne(params);
        if (!result) {
            throw new NotFoundException('Interest not found');
        }

        return successResponse(result, "Success");
    };

    create = async(body) => {
        const result = await InterestModel.create(body);
        if (!result) {
            throw new CreateFailedException('Interest failed to be created');
        }

        return successResponse(result, 'Interest was created!');
    };

    update = async(body, id) => {
        const result = await InterestModel.update(body, id);

        if (!result) {
            throw new UnexpectedException('Something went wrong');
        }

        const { affectedRows, changedRows, info } = result;

        if (!affectedRows) throw new NotFoundException('Interest not found');
        else if (affectedRows && !changedRows) throw new UpdateFailedException('Interest update failed');
        
        const responseBody = {
            rows_matched: affectedRows,
            rows_changed: changedRows,
            info
        };

        return successResponse(responseBody, 'Interest updated successfully');
    };

    delete = async(id) => {
        const result = await InterestModel.delete(id);
        if (!result) {
            throw new NotFoundException('Interest not found');
        }

        return successResponse({}, 'Interest has been deleted');
    };
}

module.exports = new InterestRepository;