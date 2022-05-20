const { successResponse } = require('../utils/responses.utils');

const { DBTransaction } = require('../db/db-transaction');
const TeacherReviewModel = require('../models/teacherReview.model');
const TeacherModel = require('../models/teacher.model');
const {
    NotFoundException,
    CreateFailedException,
    DeleteFailedException
} = require('../utils/exceptions/database.exception');
const { round, truncateDecimal } = require('../utils/common.utils');

class TeacherReviewRepository {
    findAll = async(filters = {}) => {
        
        let teacherReviewList = await TeacherReviewModel.findAll(filters);

        teacherReviewList = teacherReviewList.map((tReview) => {
            const connRequestObj = {
                ...tReview.teacher_review,
                subject: tReview.subject,
                reviewed_by: tReview.reviewed_by
            };
            return connRequestObj;
        });

        return successResponse(teacherReviewList);
    };

    findOne = async(id) => {
        let teacherReview = await TeacherReviewModel.findOne(id, true);
        if (!teacherReview) {
            throw new NotFoundException('Teacher review not found');
        }

        teacherReview = {
            ...teacherReview.teacher_review,
            subject: teacherReview.subject,
            reviewed_by: teacherReview.reviewed_by
        };

        return successResponse(teacherReview);
    };

    calculateAverageRating = (body) => {
        const { learning, grading, attendance, difficulty } = body;
        const rating = (learning + grading + attendance + difficulty) / 4;
        return truncateDecimal(rating, 3);
    };

    // uses bezhanov algorithm
    incrementTeacherRating = (newRating, oldRating, numOfReviewsOld) => {
        newRating = parseFloat(newRating);
        oldRating = parseFloat(oldRating);
        const rating = (oldRating * numOfReviewsOld + newRating) / (numOfReviewsOld + 1);
        return truncateDecimal(rating, 3);
    };

    decrementTeacherRating = (reviewRating, teacherRating, numOfReviews) => {
        teacherRating = parseFloat(teacherRating);
        reviewRating = parseFloat(reviewRating);
        // need rounding due to javascript's floating point arithmetic errors
        const unMovedAverage = round(teacherRating * numOfReviews - reviewRating, 3);
        const oldRating = unMovedAverage / (numOfReviews - 1);
        return truncateDecimal(oldRating, 3);
    };

    create = async(body) => {
        const review_rating = this.calculateAverageRating(body);
        body.overall_rating = review_rating;

        const transaction = await DBTransaction.begin();
        let result;

        try {
            result = await TeacherReviewModel.create(body, transaction.connection);
    
            if (!result) {
                throw new CreateFailedException('Teacher review failed to be created');
            }

            const { old_teacher_rating, old_total_reviews, teacher_id } = body;
            const newTeacherRating = this.incrementTeacherRating(review_rating, old_teacher_rating, old_total_reviews);
            
            const success = await TeacherModel.update({
                average_rating: newTeacherRating,
                total_reviews: old_total_reviews + 1
            }, teacher_id, transaction.connection);

            if (!success) {
                throw new CreateFailedException(`Teacher review failed to be created. Failure to update teacher rating`);
            }
        } catch (ex) {
            await transaction.rollback();
            throw ex;
        }

        await transaction.commit();

        return successResponse(result, 'Teacher review was created!');
    };

    delete = async(body, id) => {
        const transaction = await DBTransaction.begin();

        let result;
        
        try {
            result = await TeacherReviewModel.delete(id, transaction.connection);
            
            if (!result) {
                throw new NotFoundException('Teacher review not found');
            }
            const { review_rating, teacher_rating, total_reviews, teacher_id } = body;
            const oldTeacherRating = this.decrementTeacherRating(review_rating, teacher_rating, total_reviews);
            
            const success = await TeacherModel.update({
                average_rating: oldTeacherRating,
                total_reviews: total_reviews - 1
            }, teacher_id, transaction.connection);

            if (!success) {
                throw new DeleteFailedException(`Teacher review failed to be deleted. Failure to update teacher rating`);
            }
        } catch (ex) {
            await transaction.rollback();
            throw ex;
        }

        await transaction.commit();

        const responseBody = {
            rows_removed: result
        };

        return successResponse(responseBody, 'Teacher review has been deleted');
    };
}

module.exports = new TeacherReviewRepository;