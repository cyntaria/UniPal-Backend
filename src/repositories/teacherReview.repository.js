const { successResponse } = require('../utils/responses.utils');

const { DBService } = require('../db/db-service');
const TeacherReviewModel = require('../models/teacherReview.model');
const TeacherModel = require('../models/teacher.model');
const {
    NotFoundException,
    CreateFailedException,
    UnexpectedException
} = require('../utils/exceptions/database.exception');
const { round } = require('../utils/common.utils');

class TeacherReviewRepository {
    findAll = async(filters = {}) => {
        
        let teacherReviewList = await TeacherReviewModel.findAll(filters);
        if (!teacherReviewList.length) {
            throw new NotFoundException('Teacher reviews not found');
        }

        return successResponse(teacherReviewList);
    };

    findOne = async(id) => {
        const teacherReview = await TeacherReviewModel.findOne(id);
        if (!teacherReview) {
            throw new NotFoundException('Teacher review not found');
        }

        return successResponse(teacherReview);
    };

    #calculate_average = (body) => {
        const { learning, grading, attendance, difficulty } = body;
        const rating = (learning + grading + attendance + difficulty) / 4;
        return round(rating, 1);
    };

    #increment_teacher_rating_bezhanov = (newRating, oldRating, numOfReviewsOld) => {
        const rating = (oldRating * numOfReviewsOld + newRating) / (numOfReviewsOld + 1);
        return round(rating, 1);
    };

    #decrement_teacher_rating_bezhanov = (reviewRating, teacher_rating, numOfReviews) => {
        const oldRating = (teacher_rating * numOfReviews - reviewRating) / (numOfReviews - 1);
        return round(oldRating, 1);
    };

    create = async(body) => {
        const review_rating = this.#calculate_average(body);
        body.overall_rating = review_rating;

        await DBService.beginTransaction();

        const result = await TeacherReviewModel.create(body);

        if (!result) {
            await DBService.rollback();
            throw new CreateFailedException('Teacher review failed to be created');
        }

        try {
            const { old_teacher_rating, old_total_reviews, teacher_id } = body;
            const newTeacherRating = this.#increment_teacher_rating_bezhanov(review_rating, old_teacher_rating, old_total_reviews);
            const success = await TeacherModel.update({
                average_rating: newTeacherRating,
                total_reviews: old_total_reviews + 1
            }, teacher_id);
            if (!success) {
                await DBService.rollback();
                throw new CreateFailedException(`Teacher review failed to be created. Failure to update teacher rating`);
            }
        } catch (ex) {
            await DBService.rollback();
        }

        await DBService.commit();

        return successResponse(result, 'Teacher review was created!');
    };

    delete = async(body, id) => {
        await DBService.beginTransaction();

        const result = await TeacherReviewModel.delete(id);
        
        if (!result) {
            await DBService.rollback();
            throw new NotFoundException('Teacher review not found');
        }

        try {
            const { review_rating, teacher_rating, total_reviews, teacher_id } = body;
            const oldTeacherRating = this.#decrement_teacher_rating_bezhanov(review_rating, teacher_rating, total_reviews);
            const success = await TeacherModel.update({
                average_rating: oldTeacherRating,
                total_reviews: total_reviews - 1
            }, teacher_id);
            if (!success) {
                await DBService.rollback();
                throw new UnexpectedException(`Teacher review failed to be deleted. Failure to update teacher rating`);
            }
        } catch (ex) {
            await DBService.rollback();
        }

        await DBService.commit();

        const responseBody = {
            rows_removed: result
        };

        return successResponse(responseBody, 'Teacher review has been deleted');
    };
}

module.exports = new TeacherReviewRepository;