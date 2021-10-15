const ReactionTypeRepository = require('../repositories/reactionType.repository');

class ReactionTypeController {
    getAllReactionTypes = async(req, res, next) => {
        const response = await ReactionTypeRepository.findAll();
        res.send(response);
    };

    getReactionTypeById = async(req, res, next) => {
        const response = await ReactionTypeRepository.findOne({ reaction_type_id: req.params.id });
        res.send(response);
    };

    createReactionType = async(req, res, next) => {
        const response = await ReactionTypeRepository.create(req.body);
        res.status(201).send(response);
    };

    updateReactionType = async(req, res, next) => {
        const response = await ReactionTypeRepository.update(req.body, req.params.id);
        res.send(response);
    };

    deleteReactionType = async(req, res, next) => {
        const response = await ReactionTypeRepository.delete(req.params.id);
        res.send(response);
    };
}

module.exports = new ReactionTypeController;