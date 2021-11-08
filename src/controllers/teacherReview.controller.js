const TeacherReviewRepository = require('../repositories/teacherReview.repository');

class TeacherReviewController {
    getAllTeacherReviews = async(req, res, next) => {
        const response = await TeacherReviewRepository.findAll(req.query);
        res.send(response);
    };

    getTeacherReviewById = async(req, res, next) => {
        const response = await TeacherReviewRepository.findOne(req.params.id);
        res.send(response);
    };

    createTeacherReview = async(req, res, next) => {
        const response = await TeacherReviewRepository.create(req.body);
        res.status(201).send(response);
    };

    updateTeacherReview = async(req, res, next) => {
        const response = await TeacherReviewRepository.update(req.body, req.params.id);
        res.send(response);
    };

    deleteTeacherReview = async(req, res, next) => {
        const response = await TeacherReviewRepository.delete(req.params.id);
        res.send(response);
    };
}

module.exports = new TeacherReviewController;