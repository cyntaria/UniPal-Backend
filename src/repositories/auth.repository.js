const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const {
    RegistrationFailedException,
    InvalidCredentialsException,
    TokenVerificationException
} = require('../utils/exceptions/auth.exception');
const {
    NotFoundException,
    UpdateFailedException,
    UnexpectedException
} = require('../utils/exceptions/database.exception');
const { hashPassword } = require('../utils/common.utils');
const { successResponse } = require('../utils/responses.utils');
const { Config } = require('../configs/config');

const StudentModel = require('../models/student.model');

class AuthRepository {

    register = async(body) => {
        const pass = body.password;

        await hashPassword(body);

        const result = await StudentModel.create(body);

        if (!result) {
            throw new RegistrationFailedException();
        }

        return this.login(body.email, pass, true);
    };

    login = async(email, pass, is_register = false) => {
        const student = await StudentModel.findOne({ email });
        if (!student) {
            throw new InvalidCredentialsException('Email not registered');
        }

        const isMatch = await bcrypt.compare(pass, student.password);

        if (!isMatch) {
            throw new InvalidCredentialsException('Incorrect password');
        }

        // student matched!
        const secretKey = Config.SECRET_JWT;
        const token = jwt.sign({ student_erp: student.student_erp.toString() }, secretKey, {
            expiresIn: '24h'
        });

        let message = "";
        let responseBody = "";
        if (is_register){ // if registered first
            const { student_erp } = student;
            message = "Registered"; // set msg to registered
            responseBody = { student_erp, token };
        } else {
            student.password = undefined;
            message = "Authenticated";
            responseBody = { ...student, token };
        }
        return successResponse(responseBody, message);
    };

    refreshToken = async(body) => {
        const { email, password: pass, oldToken } = body;
        const student = await StudentModel.findOne({ email });
        if (!student) {
            throw new InvalidCredentialsException('Email not registered');
        }

        const isMatch = await bcrypt.compare(pass, student.password);

        if (!isMatch) {
            throw new InvalidCredentialsException('Incorrect password');
        }

        // student matched!
        const secretKey = Config.SECRET_JWT;
        const { student_erp } = jwt.decode(oldToken);
        
        if (student.student_erp.toString() !== student_erp){
            throw new TokenVerificationException();
        }
        
        const token = jwt.sign({ student_erp: student.student_erp.toString() }, secretKey, {
            expiresIn: '24h'
        });

        return successResponse({ token }, "Refreshed");
    };

    changePassword = async(body) => {
        const { email, password, new_password } = body;
        const student = await StudentModel.findOne({ email: email });

        if (!student) {
            throw new NotFoundException('Student not found');
        }

        const isMatch = await bcrypt.compare(password, student.password);

        if (!isMatch) {
            throw new InvalidCredentialsException('Incorrect old password');
        }

        let responseBody = { email: email, password: new_password };

        return this.resetPassword(responseBody);
    };

    resetPassword = async(body) => {
        await hashPassword(body);

        const { password, email } = body;

        const result = await StudentModel.update({password}, {email});

        if (!result) {
            throw new UnexpectedException('Something went wrong');
        }

        const { affectedRows, changedRows, info } = result;

        if (!affectedRows) throw new NotFoundException('Student not found');
        else if (affectedRows && !changedRows) throw new UpdateFailedException('Password change failed');
        
        return successResponse(info, 'Password changed successfully');
    }
}

module.exports = new AuthRepository;