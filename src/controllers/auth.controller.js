const AuthRepository = require('../repositories/auth.repository');
const { Roles } = require('../utils/enums/roles.utils');

class AuthController {

    register = async(req, res, next) => {
        const response = await AuthRepository.register(req.body);
        res.status(201).send(response);
    };

    registerAdmin = async(req, res, next) => {
        req.body.role = Roles.Admin;
        const response = await AuthRepository.register(req.body);
        res.status(201).send(response);
    };

    login = async(req, res, next) => {
        const response = await AuthRepository.login(req.body.erp, req.body.password);
        res.send(response);
    };

    refreshToken = async(req, res, next) => {
        const response = await AuthRepository.refreshToken(req.body);
        res.send(response);
    };

    changePassword = async(req, res, next) => {
        const response = await AuthRepository.changePassword(req.body);
        res.send(response);
    };

    sendOTP = async(req, res, next) => {
        const response = await AuthRepository.sendOTP(req.body);
        res.send(response);
    };

    verifyOTP = async(req, res, next) => {
        const response = await AuthRepository.verifyOTP(req.body);
        res.send(response);
    };

    resetPassword = async(req, res, next) => {
        const response = await AuthRepository.resetPassword(req.body);
        res.send(response);
    };
}

module.exports = new AuthController;