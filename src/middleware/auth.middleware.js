const {
    TokenMissingException,
    TokenVerificationException,
    TokenExpiredException,
    ForbiddenException
} = require('../utils/exceptions/auth.exception');
const StudentModel = require('../models/student.model');
const jwt = require('jsonwebtoken');
const { Config } = require('../configs/config');

exports.auth = (...allowedRoles) => {
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
            const student = await StudentModel.findOne(decoded_erp);

            if (!student) {
                throw new TokenVerificationException();
            }

            // if the student role don't have the permission to do this action.
            // the student will get this error
            if (allowedRoles.length && !allowedRoles.includes(student.role)) {
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

exports.ownerAuth = (checkedRoles = [], customOwnerCheck = null) => {
    return async function(req, res, next) {
        try {
            const student = req.currentStudent;

            if (!student) {
                throw new TokenVerificationException();
            }

            // if the current student role has to be checked for ownership
            const isChecked = checkedRoles.includes(student.role);

            if (isChecked){ // if needs owner check
                // check if the current student is the owner student
                let isOwner;
                if (customOwnerCheck) isOwner = await customOwnerCheck(req);
                else isOwner = req.params.erp === student.erp; // can update self
    
                // if not the owner
                // the student will get this error
                if (!isOwner) throw new ForbiddenException();
            }
            
            next();

        } catch (e) {
            next(e);
        }
    };
};