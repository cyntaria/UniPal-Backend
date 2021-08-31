const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');

const {
    RegistrationFailedException,
    InvalidCredentialsException,
    TokenVerificationException,
    OTPExpiredException,
    OTPGenerationException,
    OTPVerificationException
} = require('../utils/exceptions/auth.exception');
const {
    UpdateFailedException,
    UnexpectedException
} = require('../utils/exceptions/database.exception');
const { hashPassword } = require('../utils/common.utils');
const { successResponse } = require('../utils/responses.utils');
const { sendOTPEmail } = require('../utils/sendgrid.utils');
const { Config } = require('../configs/config');

const StudentModel = require('../models/student.model');
const OTPModel = require('../models/otp.model');

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
            expiresIn: Config.EXPIRY_JWT
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
                        expiresIn: Config.EXPIRY_JWT
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
            throw new InvalidCredentialsException('ERP not registered');
        }

        const isMatch = await bcrypt.compare(old_password, student.password);

        if (!isMatch) {
            throw new InvalidCredentialsException('Incorrect old password');
        }

        let responseBody = { erp, new_password };

        return this.resetPassword(responseBody);
    };

    forgotPassword = async(body) => {
        let student = await StudentModel.findOne(body); // body contains "erp" : ...
        
        if (!student) {
            throw new InvalidCredentialsException('ERP not registered');
        }
        
        await this.#removeExpiredOTP(student.erp);

        const OTP = await this.#generateOTP(student.erp);

        await sendOTPEmail(student, OTP);

        return successResponse({}, 'OTP generated and sent via email');
    }

    #generateOTP = async(erp) => {
        const OTP = `${otpGenerator.generate(4, { alphabets: false, upperCase: false, specialChars: false })}`;

        const OTPHash = await bcrypt.hash(OTP, 8);

        let expiration_datetime = new Date();
        expiration_datetime.setHours(expiration_datetime.getHours() + 1);

        const body = {erp, OTP: OTPHash, expiration_datetime};
        const result = await OTPModel.create(body);

        if (!result) throw new OTPGenerationException();

        return OTP;
    }

    #removeExpiredOTP = async(erp) => {
        const result = await OTPModel.findOne({erp});

        if (result) { // if found, delete
            const affectedRows = await OTPModel.delete({erp});

            if (!affectedRows) {
                throw new OTPGenerationException('Expired OTP could not be deleted');
            }
        }
    }

    verifyOTP = async(body) => {
        const {otp, erp} = body;
        let result = await OTPModel.findOne({erp});

        if (!result) {
            throw new OTPVerificationException("No OTP found for this ERP");
        }

        const {expiration_datetime, OTP: OTPHash} = result;

        if (expiration_datetime < new Date()) {
            throw new OTPExpiredException();
        }

        const isMatch = await bcrypt.compare(otp, OTPHash);

        if (!isMatch) {
            throw new OTPVerificationException();
        }

        result = await OTPModel.delete({erp});

        if (!result) {
            throw new OTPVerificationException('Old OTP failed to be deleted');
        }

        return successResponse({}, 'OTP verified succesfully');
    }

    resetPassword = async(body) => {
        await hashPassword(body);

        const { new_password, erp } = body;

        const result = await StudentModel.update({password: new_password}, {erp});

        if (!result) {
            throw new UnexpectedException('Something went wrong');
        }
        const { affectedRows, changedRows, info } = result;

        if (!affectedRows) throw new InvalidCredentialsException('ERP not registered');
        else if (affectedRows && !changedRows) throw new UpdateFailedException('Password reset failed');
        
        const responseBody = {
            rows_matched: affectedRows,
            rows_changed: changedRows,
            info
        };

        return successResponse(responseBody, 'Password reset successfully');
    }
}

module.exports = new AuthRepository;