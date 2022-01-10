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

        return successResponse(timetableList);
    };

    generateAll = ({ classes, num_of_subjects }) => {
        // Sort according to slot numbers
        classes.sort((cl1, cl2) => cl1.timeslot_1.slot_number - cl2.timeslot_1.slot_number);
        
        // Call sub function with default arguments
        let generated_timetables = [];
        this.findScheduleClass(new Map(), classes, num_of_subjects, generated_timetables);

        return successResponse(generated_timetables, 'Timetables were generated!');
    };

    findScheduleClass = (schedule, classes_list, num_subject_left, generated_timetables) => {

        // if all classes done OR if possible classes empty due to clashes found
        if (num_subject_left === 0 || (num_subject_left > 0 && classes_list.length === 0)) {
            const extractClasses = (classArray, timeslotMap) => {
                classArray.push(...timeslotMap.values());
                return classArray;
            };
            const classes = [...schedule.values()].reduce(extractClasses, []);
            const timetable = {
                term_id: classes[0].term_id,
                is_active: 0,
                classes
            };
            generated_timetables.push(timetable);
            return;
        }

        const curr_slot_number = classes_list[0].timeslot_1.slot_number;
        const curr_day = classes_list[0].day_1;

        for (const classItem of classes_list) {
            // Any other class matching current slot and day
            if (classItem.timeslot_1.slot_number === curr_slot_number && classItem.day_1 === curr_day) {

                // Filter out same slot and subject classes
                const sub_list = classes_list.filter((classObj) => {
                    // Check for classes with same subject and not labs
                    const isLabCheck = classObj.parent_class_erp !== classItem.class_erp;
                    const subjectSameCheck = classObj.subject.subject_code === classItem.subject.subject_code;

                    // Check for classes with same slot number on same days
                    const daySameCheck = classObj.day_1 === classItem.day_1;
                    const slotSameCheck = classObj.timeslot_1.slot_number === classItem.timeslot_1.slot_number;

                    return !(subjectSameCheck && isLabCheck) && !(slotSameCheck && daySameCheck);
                });

                const next_schedule = new Map(schedule);

                // Assign class in schedule
                if (!next_schedule.has(classItem.day_1)) {
                    next_schedule.set(classItem.day_1, new Map());
                }
                if (!next_schedule.get(classItem.day_1).has(classItem.timeslot_1.slot_number)) {
                    next_schedule.get(classItem.day_1).set(classItem.timeslot_1.slot_number, classItem);
                }

                // Find next class
                this.findScheduleClass(next_schedule, sub_list, num_subject_left - 1, generated_timetables);
            }
        }
    };

    findOne = async(timetable_id) => {
        let timetableDuplicates = await TimetableModel.findOne(timetable_id, true);
        if (!timetableDuplicates) {
            throw new NotFoundException('Timetable not found');
        }

        let timetableObject = {};

        let classes = timetableDuplicates.map((timetableRow) => {
            if (!Object.keys(timetableObject).length) {
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

        try {
            const timetable_classes = classes.map(class_erp => {
                return [timetable_id, class_erp];
            });
            const success = await TimetableClassModel.createMany(timetable_classes);
            if (!success) {
                await DBService.rollback();
                throw new CreateFailedException(`Timetable classes failed to be created`);
            }
        } catch (ex) {
            await DBService.rollback();
            throw ex;
        }

        await DBService.commit();

        return successResponse(result, 'Timetable was created!');
    };

    update = async(body, timetable_id, student_erp) => {
        await DBService.beginTransaction();

        let responseBody = {};

        try {
            // set previously active timetable to inactive
            const resultSetInActive = await TimetableModel.update({is_active: 0}, {is_active: 1, student_erp});
            
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
            
            const { affectedRows: affectedRows1, changedRows: changedRows1 } = resultSetInActive;
            const { affectedRows: affectedRows2, changedRows: changedRows2 } = resultSetActive;

            if (!affectedRows1 && !affectedRows2) throw new NotFoundException('Timetable not found');
            else if ((affectedRows1 && !changedRows1) || (affectedRows2 && !changedRows2)) throw new UpdateFailedException('Timetable update failed');
            
            responseBody = {
                rows_matched: affectedRows1 + affectedRows2,
                rows_changed: changedRows1 + changedRows2
            };
        } catch (ex) {
            await DBService.rollback();
            throw ex;
        }

        await DBService.commit();

        return successResponse(responseBody, 'Timetable updated successfully');
    };

    updateClasses = async(body, timetable_id) => {
        let rows_added = 0;
        let rows_removed = 0;

        await DBService.beginTransaction();
        
        try {
            let { added, removed } = body;
            if (added) {
                added = added.map(class_erp => [timetable_id, class_erp]);
                rows_added = await TimetableClassModel.createMany(added);
                if (!rows_added) {
                    await DBService.rollback();
                    throw new UpdateFailedException(`New timetable classes failed to be added`);
                }
            }
            if (removed) {
                removed = removed.map(class_erp => [class_erp]);
                rows_removed = await TimetableClassModel.deleteMany(removed, timetable_id);
                if (!rows_removed) {
                    await DBService.rollback();
                    throw new UpdateFailedException(`Old timetable classes failed to be removed`);
                }
            }
        } catch (ex) {
            await DBService.rollback();
            throw ex;
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