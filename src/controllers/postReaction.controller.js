const PostReactionRepository = require('../repositories/postReaction.repository');

class PostReactionController {

    createPostReaction = async(req, res, next) => {
        req.body.post_id = req.params.id;
        const response = await PostReactionRepository.create(req.body);
        res.status(201).send(response);
    };

    updatePostReaction = async(req, res, next) => {
        const filters = {
            post_id: req.params.id,
            student_erp: req.params.student_erp
        };
        const response = await PostReactionRepository.update(req.body, filters);
        res.send(response);
    };

    deletePostReaction = async(req, res, next) => {
        const filters = {
            post_id: req.params.id,
            student_erp: req.params.student_erp
        };
        const response = await PostReactionRepository.delete(filters);
        res.send(response);
    };
}

module.exports = new PostReactionController;