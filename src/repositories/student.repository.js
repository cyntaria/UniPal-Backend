const { hashPassword } = require('../utils/common.utils');
const { successResponse } = require('../utils/responses.utils');

const StudentModel = require('../models/student.model');
const {
    NotFoundException,
    CreateFailedException,
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

    create = async(body) => {
        await hashPassword(body);

        const result = await StudentModel.create(body);

        if (!result) {
            throw new CreateFailedException('Student failed to be created');
        }

        return successResponse(result, 'Student was created!');
    };

    update = async(body, erp) => {
        const result = await StudentModel.update(body, erp);

        if (!result) {
            throw new UnexpectedException('Something went wrong');
        }

        const { affectedRows, changedRows, info } = result;

        if (!affectedRows) throw new NotFoundException('Student not found');
        else if (affectedRows && !changedRows) throw new UpdateFailedException('Student update failed');
        
        return successResponse(info, 'Student updated successfully');
    };

    delete = async(erp) => {
        const result = await StudentModel.delete(erp);
        if (!result) {
            throw new NotFoundException('Student not found');
        }

        return successResponse({}, 'Student has been deleted');
    };
}

module.exports = new StudentRepository;