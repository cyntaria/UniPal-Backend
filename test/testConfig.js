const sinon = require('sinon');

const AuthMiddleware = require('../src/middleware/auth.middleware');
const stubbedAuthMiddleware = sinon.stub(AuthMiddleware, 'auth').callsFake((roles) => {
    return (req, res, next) => next();
});

module.exports = {
    stubbedAuthMiddleware
};