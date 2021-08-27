const { checkValidation } = require('../middleware/validation.middleware');

const AuthRepository = require('../repositories/auth.repository');

class AuthController {

    register = async(req, res, next) => {
        checkValidation(req);
        const response = await AuthRepository.register(req.body);
        res.status(201).send(response);
    };

    login = async(req, res, next) => {
        checkValidation(req);
        const response = await AuthRepository.login(req.body.erp, req.body.password);
        res.send(response);
    };

    refreshToken = async(req, res, next) => {
        checkValidation(req);
        const response = await AuthRepository.refreshToken(req.body);
        res.send(response);
    };

    changePassword = async(req, res, next) => {
        checkValidation(req);
        const response = await AuthRepository.changePassword(req.body);
        res.send(response);
    };

    resetPassword = async(req, res, next) => {
        checkValidation(req);
        const response = await AuthRepository.resetPassword(req.body);
        res.send(response);
    }
}

module.exports = new AuthController;