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

        return this.login(body.erp, pass, true);
    };

    login = async(erp, pass, is_register = false) => {
        const student = await StudentModel.findOne({ erp });
        if (!student) {
            throw new InvalidCredentialsException('ERP not registered');
        }

        const isMatch = await bcrypt.compare(pass, student.password);

        if (!isMatch) {
            throw new InvalidCredentialsException('Incorrect password');
        }

        // student matched!
        const secretKey = Config.SECRET_JWT;
        const token = jwt.sign({ erp }, secretKey, {
            expiresIn: '3d'
        });

        let message = "";
        let responseBody = "";
        if (is_register){ // if registered first
            message = "Registered"; // set msg to registered
        } else {
            message = "Authenticated";
        }
        student.password = undefined;
        responseBody = { ...student, token };
        return successResponse(responseBody, message);
    };

    refreshToken = async(body) => {
        const { erp, password: pass, old_token } = body;
        const student = await StudentModel.findOne({ erp });
        if (!student) {
            throw new InvalidCredentialsException('ERP not registered');
        }

        const isMatch = await bcrypt.compare(pass, student.password);

        if (!isMatch) {
            throw new InvalidCredentialsException('Incorrect password');
        }

        let token;
        
        // Check old token
        const secretKey = Config.SECRET_JWT;
        jwt.verify(old_token, secretKey, (err, decoded) => {
            if (err) {
                if (err.name === 'TokenExpiredError') { // only sign a new token if old expired
                    const {erp: decoded_erp} = jwt.decode(old_token);
                    if (erp !== decoded_erp){
                        throw new TokenVerificationException();
                    }
                    
                    // student matched! Now sign
                    token = jwt.sign({ erp }, secretKey, {
                        expiresIn: '3d'
                    });
                } else if (err.name === 'JsonWebTokenError') {
                    throw new TokenVerificationException("Invalid Token");
                }
            } else {
                token = old_token; // return same token if valid and not expired
            }
        });

        return successResponse({ token }, "Refreshed");
    };

    changePassword = async(body) => {
        const { erp, old_password, new_password } = body;
        const student = await StudentModel.findOne({ erp });

        if (!student) {
            throw new NotFoundException('Student not found');
        }

        const isMatch = await bcrypt.compare(old_password, student.password);

        if (!isMatch) {
            throw new InvalidCredentialsException('Incorrect old password');
        }

        let responseBody = { erp, password: new_password };

        return this.resetPassword(responseBody);
    };

    resetPassword = async(body) => {
        await hashPassword(body);

        const { password, erp } = body;

        const result = await StudentModel.update({password}, {erp});

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