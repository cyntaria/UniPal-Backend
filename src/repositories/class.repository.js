const { successResponse } = require('../utils/responses.utils');

const ClassModel = require('../models/class.model');
const {
    NotFoundException,
    CreateFailedException,
    UpdateFailedException,
    UnexpectedException
} = require('../utils/exceptions/database.exception');

class ClassRepository {
    findAll = async(filters = {}) => {
        
        let classList = await ClassModel.findAll(filters);
        if (!classList.length) {
            throw new NotFoundException('Classes not found');
        }

        classList.map((classRow) => {
            const classObject = {
                class_erp: classRow.class_erp,
                semester: classRow.semester,
                parent_class_erp: classRow.parent_class_erp,
                day_1: classRow.day_1,
                day_2: classRow.day_2,
                classroom: {
                    classroom_id: classRow.classroom_id,
                    classroom: classRow.classroom,
                    campus: {
                        campus_id: classRow.campus_id,
                        campus: classRow.campus
                    }
                },
                subject: {
                    subject_code: classRow.subject_code,
                    subject: classRow.subject
                },
                teacher: {
                    teacher_id: classRow.teacher_id,
                    full_name: classRow.full_name,
                    average_rating: classRow.average_rating,
                    total_reviews: classRow.total_reviews
                },
                timeslot_1: {
                    timeslot_id: classRow.timeslot_id,
                    start_time: classRow.start_time,
                    end_time: classRow.end_time,
                    slot_number: classRow.slot_number
                },
                timeslot_2: {
                    timeslot_id: classRow.timeslot_id,
                    start_time: classRow.start_time,
                    end_time: classRow.end_time,
                    slot_number: classRow.slot_number
                }
            };
            return classObject;
        });

        return successResponse(classList);
    };

    findOne = async(id) => {
        const classRow = await ClassModel.findOne(id);
        if (!classRow) {
            throw new NotFoundException('Class not found');
        }

        const classObject = {
            class_erp: classRow.class_erp,
            semester: classRow.semester,
            parent_class_erp: classRow.parent_class_erp,
            day_1: classRow.day_1,
            day_2: classRow.day_2,
            classroom: {
                classroom_id: classRow.classroom_id,
                classroom: classRow.classroom,
                campus: {
                    campus_id: classRow.campus_id,
                    campus: classRow.campus
                }
            },
            subject: {
                subject_code: classRow.subject_code,
                subject: classRow.subject
            },
            teacher: {
                teacher_id: classRow.teacher_id,
                full_name: classRow.full_name,
                average_rating: classRow.average_rating,
                total_reviews: classRow.total_reviews
            },
            timeslot_1: {
                timeslot_id: classRow.timeslot_id,
                start_time: classRow.start_time,
                end_time: classRow.end_time,
                slot_number: classRow.slot_number
            },
            timeslot_2: {
                timeslot_id: classRow.timeslot_id,
                start_time: classRow.start_time,
                end_time: classRow.end_time,
                slot_number: classRow.slot_number
            }
        };

        return successResponse(classObject);
    };

    create = async(body) => {
        const result = await ClassModel.create(body);

        if (!result) {
            throw new CreateFailedException('Class failed to be created');
        }

        return successResponse(result, 'Class was created!');
    };

    createMany = async(body) => {
        const result = await ClassModel.createMany(body);

        if (!result) {
            throw new CreateFailedException('Classes failed to be created');
        }

        return successResponse(result, 'Classes were created!');
    };

    update = async(body, erp) => {
        const result = await ClassModel.update(body, erp);

        if (!result) {
            throw new UnexpectedException('Something went wrong');
        }

        const { affectedRows, changedRows, info } = result;

        if (!affectedRows) throw new NotFoundException('Class not found');
        else if (affectedRows && !changedRows) throw new UpdateFailedException('Class update failed');
        
        const responseBody = {
            rows_matched: affectedRows,
            rows_changed: changedRows,
            info
        };

        return successResponse(responseBody, 'Class updated successfully');
    };

    delete = async(erp) => {
        const result = await ClassModel.delete(erp);
        if (!result) {
            throw new NotFoundException('Class not found');
        }

        const responseBody = {
            rows_removed: result
        };

        return successResponse(responseBody, 'Class has been deleted');
    };
}

module.exports = new ClassRepository;