const { successResponse } = require('../utils/responses.utils');

const StudentModel = require('../models/student.model');
const {
    NotFoundException,
    UpdateFailedException,
    UnexpectedException
} = require('../utils/exceptions/database.exception');

class StudentRepository {
    findAll = async(filters = {}) => {
        
        let studentList = await StudentModel.findAll(filters);
        if (!studentList.length) {
            throw new NotFoundException('Students not found');
        }

        studentList = studentList.map(student => {
            const { password, ...studentWithoutPassword } = student;
            return studentWithoutPassword;
        });

        return successResponse(studentList);
    };

    findOne = async(filters) => {
        const student = await StudentModel.findOne(filters);
        if (!student) {
            throw new NotFoundException('Student not found');
        }

        const { password, ...studentWithoutPassword } = student;

        return successResponse(studentWithoutPassword);
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