const { successResponse } = require('../utils/responses.utils');
const { combineStudentPreferences } = require('../utils/common.utils');

const StudentModel = require('../models/student.model');
const {
    NotFoundException,
    UpdateFailedException,
    UnexpectedException
} = require('../utils/exceptions/database.exception');

class StudentRepository {
    findAll = async(filters = {}, myERP) => {
        
        let studentList = await StudentModel.findAll(filters, myERP);
        if (!studentList.length) {
            throw new NotFoundException('Students not found');
        }

        studentList = studentList.map(student => {
            const {
                password,
                student_connection_id,
                sender_erp,
                receiver_erp,
                connection_status,
                sent_at,
                accepted_at,
                student_1_erp,
                student_2_erp,
                ...restOfStudent
            } = student;

            restOfStudent.student_connection = student_connection_id === null ? null : {
                student_connection_id,
                sender_erp,
                receiver_erp,
                connection_status,
                sent_at,
                accepted_at
            };
            return combineStudentPreferences(restOfStudent);
        });

        return successResponse(studentList);
    };

    findOne = async(erp, myERP) => {
        let student;

        if (erp === myERP) student = await this.#findMyProfile(erp);
        else student = await this.#findOthersProfile(erp, myERP);

        student = combineStudentPreferences(student);
        
        return successResponse(student);
    };

    #findMyProfile = async(erp) => {
        const student = await StudentModel.findOne(erp);

        if (!student) {
            throw new NotFoundException('Profile not found');
        }

        delete student.password;

        return student;
    };

    #findOthersProfile = async(erp, myERP) => {
        const student = await StudentModel.findOtherStudent(erp, myERP);

        if (!student) {
            throw new NotFoundException('Student not found');
        }

        const {
            password,
            student_connection_id,
            sender_erp,
            receiver_erp,
            connection_status,
            sent_at,
            accepted_at,
            student_1_erp,
            student_2_erp,
            ...restOfStudent
        } = student;

        restOfStudent.student_connection = student_connection_id === null ? null : {
            student_connection_id,
            sender_erp,
            receiver_erp,
            connection_status,
            sent_at,
            accepted_at
        };

        return restOfStudent;
    };

    findAllOrganizedActivitiesByStudent = async(erp, filters) => {
        let organizedActivities = await StudentModel.findAllOrganizedActivitiesByStudent(erp, filters);
        
        if (!organizedActivities.length) {
            throw new NotFoundException('No organized activities found');
        }

        return successResponse(organizedActivities);
    };

    findAllAttendedActivitiesByStudent = async(erp, filters) => {
        let attendedActivities = await StudentModel.findAllAttendedActivitiesByStudent(erp, filters);
        if (!attendedActivities.length) {
            throw new NotFoundException('No interacted activities found');
        }

        return successResponse(attendedActivities);
    };

    findAllSavedActivitiesByStudent = async(erp, filters) => {
        let savedActivities = await StudentModel.findAllSavedActivitiesByStudent(erp, filters);
        if (!savedActivities.length) {
            throw new NotFoundException('No saved activities found');
        }

        return successResponse(savedActivities);
    };

    update = async(body, erp) => {
        const result = await StudentModel.update(body, erp);

        if (!result) {
            throw new UnexpectedException('Something went wrong');
        }

        const { affectedRows, changedRows, info } = result;

        if (!affectedRows) throw new NotFoundException('Student not found');
        else if (affectedRows && !changedRows) throw new UpdateFailedException('Student update failed');
        
        const responseBody = {
            rows_matched: affectedRows,
            rows_changed: changedRows,
            info
        };

        return successResponse(responseBody, 'Student updated successfully');
    };

    delete = async(erp) => {
        const result = await StudentModel.delete(erp);
        if (!result) {
            throw new NotFoundException('Student not found');
        }

        const responseBody = {
            rows_removed: result
        };

        return successResponse(responseBody, 'Student has been deleted');
    };
}

module.exports = new StudentRepository;