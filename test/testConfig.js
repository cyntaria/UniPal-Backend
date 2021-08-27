const AuthMiddleware = require('../src/middleware/auth.middleware');
const sinon = require('sinon');

const realAuthMiddleware = AuthMiddleware.auth;
const stubAuthMiddleware = sinon.stub(AuthMiddleware, 'auth').callsFake((roles) => (req, res, next) => next());

const app = require("../src/server");

module.exports = {
    realAuthMiddleware,
    stubAuthMiddleware,
    app
};