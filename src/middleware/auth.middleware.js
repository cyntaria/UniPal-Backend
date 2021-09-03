const {
    TokenMissingException,
    TokenVerificationException,
    TokenExpiredException,
    ForbiddenException
} = require('../utils/exceptions/auth.exception');
const StudentModel = require('../models/student.model');
const jwt = require('jsonwebtoken');
const { Config } = require('../configs/config');

exports.auth = (...roles) => {
    return async function(req, res, next) {
        try {
            const authHeader = req.headers.authorization;
            const bearer = 'Bearer ';

            if (!authHeader || !authHeader.startsWith(bearer)) {
                throw new TokenMissingException();
            }

            const token = authHeader.replace(bearer, '');
            const secretKey = Config.SECRET_JWT;

            // Verify Token
            let decoded_erp;
            jwt.verify(token, secretKey, (err, decoded) => {
                if (err) {
                    if (err.name === 'TokenExpiredError') {
                        throw new TokenExpiredException();
                    } else if (err.name === 'JsonWebTokenError') {
                        throw new TokenVerificationException();
                    }
                } else decoded_erp = decoded.erp;
            });
            const student = await StudentModel.findOne({ erp: decoded_erp });

            if (!student) {
                throw new TokenVerificationException();
            }

            // check if the current student is the owner student
            // const ownerAuthorized = req.params.erp == student.erp; //cant update self
            // if the current student is not the owner and
            // if the student role don't have the permission to do this action.
            // the student will get this error
            if (/*! ownerAuthorized || */(roles.length && !roles.includes(student.role))) {
                throw new ForbiddenException();
            }

            // if the student has permissions
            req.currentStudent = student;
            next();

        } catch (e) {
            next(e);
        }
    };
};