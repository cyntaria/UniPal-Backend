const { successResponse } = require('../utils/responses.utils');

const { DBService } = require('../db/db-service');
const TimetableModel = require('../models/timetable.model');
const TimetableClassModel = require('../models/timetableClass.model');
const {
    NotFoundException,
    CreateFailedException,
    UpdateFailedException,
    UnexpectedException
} = require('../utils/exceptions/database.exception');

class TimetableRepository {
    findAll = async(filters = {}) => {
        
        let timetableList = await TimetableModel.findAll(filters);
        if (!timetableList.length) {
            throw new NotFoundException('Timetables not found');
        }

        timetableList = timetableList.map((timetableRow) => {
            const timetableObject = {
                class_erp: timetableRow.class_erp,
                semester: timetableRow.semester,
                parent_class_erp: timetableRow.parent_class_erp,
                day_1: timetableRow.day_1,
                day_2: timetableRow.day_2,
                term_id: timetableRow.term_id,
                classroom: {
                    classroom_id: timetableRow.classroom_id,
                    classroom: timetableRow.classroom,
                    campus: {
                        campus_id: timetableRow.campus_id,
                        campus: timetableRow.campus
                    }
                },
                subject: {
                    subject_code: timetableRow.subject_code,
                    subject: timetableRow.subject
                },
                teacher: {
                    teacher_id: timetableRow.teacher_id,
                    full_name: timetableRow.full_name,
                    average_rating: timetableRow.average_rating,
                    total_reviews: timetableRow.total_reviews
                },
                timeslot_1: {
                    timeslot_id: timetableRow.timeslot_id,
                    start_time: timetableRow.start_time,
                    end_time: timetableRow.end_time,
                    slot_number: timetableRow.slot_number
                },
                timeslot_2: {
                    timeslot_id: timetableRow.timeslot_id,
                    start_time: timetableRow.start_time,
                    end_time: timetableRow.end_time,
                    slot_number: timetableRow.slot_number
                }
            };
            return timetableObject;
        });

        return successResponse(timetableList);
    };

    generateAll = async({classes}) => {};

    findOne = async(timetable_id) => {
        let timetableDuplicates = await TimetableModel.findOne(timetable_id);
        if (!timetableDuplicates) {
            throw new NotFoundException('Timetable not found');
        }

        let timetableObject = {};

        let classes = timetableDuplicates.map((timetableRow) => {
            if (!Object.keys(timetableObject)) {
                timetableObject.timetable_id = timetableRow.timetable_id;
                timetableObject.student_erp = timetableRow.student_erp;
                timetableObject.term_id = timetableRow.term_id;
                timetableObject.is_active = timetableRow.is_active;
            }
            const classObject = {
                class_erp: timetableRow.class_erp,
                semester: timetableRow.semester,
                term_id: timetableRow.term_id,
                parent_class_erp: timetableRow.parent_class_erp,
                day_1: timetableRow.day_1,
                day_2: timetableRow.day_2,
                classroom: {
                    classroom_id: timetableRow.classroom_id,
                    classroom: timetableRow.classroom,
                    campus: {
                        campus_id: timetableRow.campus_id,
                        campus: timetableRow.campus
                    }
                },
                subject: {
                    subject_code: timetableRow.subject_code,
                    subject: timetableRow.subject
                },
                teacher: {
                    teacher_id: timetableRow.teacher_id,
                    full_name: timetableRow.full_name,
                    average_rating: timetableRow.average_rating,
                    total_reviews: timetableRow.total_reviews
                },
                timeslot_1: {
                    timeslot_id: timetableRow.timeslot_id,
                    start_time: timetableRow.start_time,
                    end_time: timetableRow.end_time,
                    slot_number: timetableRow.slot_number
                },
                timeslot_2: {
                    timeslot_id: timetableRow.timeslot_id,
                    start_time: timetableRow.start_time,
                    end_time: timetableRow.end_time,
                    slot_number: timetableRow.slot_number
                }
            };
            return classObject;
        });

        timetableObject.classes = classes;

        return successResponse(timetableObject);
    };

    create = async(body) => {
        const {classes, ...timetableBody} = body;

        await DBService.beginTransaction();

        const result = await TimetableModel.create(timetableBody);

        if (!result) {
            await DBService.rollback();
            throw new CreateFailedException('Timetable failed to be created');
        }

        const { timetable_id } = result;

        for (const classObj of classes) {
            try {
                const success = await TimetableClassModel.create(timetable_id, classObj.class_erp);
                if (!success) {
                    await DBService.rollback();
                    throw new CreateFailedException(`Timetable class(erp: ${classObj.class_erp}) failed to be created`);
                }
            } catch (ex) {
                await DBService.rollback();
            }
        }

        await DBService.commit();

        return successResponse(result, 'Timetable was created!');
    };

    update = async(body, timetable_id) => {
        await DBService.beginTransaction();

        let responseBody = {};

        try {
            // set previously active timetable to inactive
            const resultSetInActive = await TimetableModel.update({is_active: 0}, {is_active: 1});
            
            let resultSetActive;
            if (!resultSetInActive) {
                throw new UnexpectedException('Something went wrong');
            } else {
                // set specified timetable as active
                resultSetActive = await TimetableModel.update(body, {timetable_id});

                if (!resultSetActive) {
                    throw new UnexpectedException('Something went wrong');
                }
            }
            
            const { affectedRows1, changedRows1 } = resultSetInActive;
            const { affectedRows2, changedRows2 } = resultSetActive;

            if (!affectedRows1 && !affectedRows2) throw new NotFoundException('Timetable not found');
            else if ((affectedRows1 && !changedRows1) || (affectedRows2 && !changedRows2)) throw new UpdateFailedException('Timetable update failed');
            
            responseBody = {
                rows_matched: affectedRows1 + affectedRows2,
                rows_changed: changedRows1 + changedRows2
            };
        } catch (ex) {
            await DBService.rollback();
        }

        await DBService.commit();

        return successResponse(responseBody, 'Timetable updated successfully');
    };

    updateClasses = async(body, timetable_id) => {
        await DBService.beginTransaction();

        const result = await TimetableModel.update(body, timetable_id);

        if (!result) {
            await DBService.rollback();
            throw new UnexpectedException('Something went wrong');
        }

        let rows_added = 0;
        let rows_removed = 0;

        try {
            let { added, removed } = body;
            if (added) {
                added = added.map(class_erp => {
                    return [timetable_id, class_erp];
                });
                const rowsAdded = await TimetableClassModel.createMany(added);
                if (!rowsAdded) {
                    await DBService.rollback();
                    throw new UpdateFailedException(`New timetable classes failed to be added`);
                }
            }
            if (removed) {
                const rowsRemoved = await TimetableClassModel.deleteMany(removed, timetable_id);
                if (!rowsRemoved) {
                    await DBService.rollback();
                    throw new UpdateFailedException(`Old timetable classes failed to be removed`);
                }
            }
        } catch (ex) {
            await DBService.rollback();
        }

        await DBService.commit();

        const responseBody = {
            rows_added,
            rows_removed
        };

        return successResponse(responseBody, 'Timetable classes updated successfully');
    };

    delete = async(timetable_id) => {
        const result = await TimetableModel.delete(timetable_id);
        if (!result) {
            throw new NotFoundException('Timetable not found');
        }

        const responseBody = {
            rows_removed: result
        };

        return successResponse(responseBody, 'Timetable has been deleted');
    };
}

module.exports = new TimetableRepository;