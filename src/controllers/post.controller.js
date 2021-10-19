const PostRepository = require('../repositories/post.repository');

class PostController {
    getAllPosts = async(req, res, next) => {
        const response = await PostRepository.findAll(req.query);
        res.send(response);
    };

    getPostById = async(req, res, next) => {
        const response = await PostRepository.findOne(req.params.id);
        res.send(response);
    };

    getPostReactions = async(req, res, next) => {
        const response = await PostRepository.findAllReactionsByPost(req.params.id);
        res.send(response);
    };

    createPost = async(req, res, next) => {
        const response = await PostRepository.create(req.body);
        res.status(201).send(response);
    };

    updatePost = async(req, res, next) => {
        const response = await PostRepository.update(req.body, req.params.id);
        res.send(response);
    };

    deletePost = async(req, res, next) => {
        const response = await PostRepository.delete(req.params.id);
        res.send(response);
    };
}

module.exports = new PostController;