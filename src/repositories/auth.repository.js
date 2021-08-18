const { hashPassword } = require('../utils/common.utils');
const { successResponse } = require('../utils/responses.utils');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Config } = require('../configs/config');

const UserModel = require('../models/user.model');
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


class AuthRepository {

    registerUser = async(body) => {
        const pass = body.password;

        await hashPassword(body);

        const result = await UserModel.create(body);

        if (!result) {
            throw new RegistrationFailedException();
        }

        return this.userLogin(body.email, pass, true);
    };

    userLogin = async(email, pass, is_register = false) => {
        const user = await UserModel.findOne({ email });
        if (!user) {
            throw new InvalidCredentialsException('Email not registered');
        }

        const isMatch = await bcrypt.compare(pass, user.password);

        if (!isMatch) {
            throw new InvalidCredentialsException('Incorrect password');
        }

        // user matched!
        const secretKey = Config.SECRET_JWT;
        const token = jwt.sign({ user_id: user.user_id.toString() }, secretKey, {
            expiresIn: '24h'
        });

        let message = "";
        let responseBody = "";
        if (is_register){ // if registered first
            const { user_id } = user;
            message = "Registered"; // set msg to registered
            responseBody = { user_id, token };
        } else {
            user.password = undefined;
            message = "Authenticated";
            responseBody = { ...user, token };
        }
        return successResponse(responseBody, message);
    };

    refreshToken = async(body) => {
        const { email, password: pass, oldToken } = body;
        const user = await UserModel.findOne({ email });
        if (!user) {
            throw new InvalidCredentialsException('Email not registered');
        }

        const isMatch = await bcrypt.compare(pass, user.password);

        if (!isMatch) {
            throw new InvalidCredentialsException('Incorrect password');
        }

        // user matched!
        const secretKey = Config.SECRET_JWT;
        const { user_id } = jwt.decode(oldToken);
        
        if (user.user_id.toString() !== user_id){
            throw new TokenVerificationException();
        }
        
        const token = jwt.sign({ user_id: user.user_id.toString() }, secretKey, {
            expiresIn: '24h'
        });

        return successResponse({ token }, "Refreshed");
    };

    changePassword = async(body) => {
        const { email, password, new_password } = body;
        const user = await UserModel.findOne({ email: email });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            throw new InvalidCredentialsException('Incorrect old password');
        }

        let responseBody = { email: email, password: new_password };

        return this.resetPassword(responseBody);
    };

    resetPassword = async(body) => {
        await hashPassword(body);

        const { password, email } = body;

        const result = await UserModel.update({password}, {email});

        if (!result) {
            throw new UnexpectedException('Something went wrong');
        }

        const { affectedRows, changedRows, info } = result;

        if (!affectedRows) throw new NotFoundException('User not found');
        else if (affectedRows && !changedRows) throw new UpdateFailedException('Password change failed');
        
        return successResponse(info, 'Password changed successfully');
    }
}

module.exports = new AuthRepository;