const { Config } = require('../configs/config');
const { failureResponse } = require('../utils/responses.utils');
const { InternalServerException } = require('../utils/exceptions/api.exception');

function errorMiddleware(err, req, res, next) {
    if (err.status === 500 || !err.message) {
        if (!err.isOperational) err = new InternalServerException('Internal server error');
    }

    let { message, code, status, data, stack } = err;

    if (Config.NODE_ENV === "dev"){
        console.log(`[Exception] ${code}, [Code] ${status}`);
        console.log(`[Error] ${message}`);
        console.log(`[Stack] ${stack}`);
    }

    const response = failureResponse(code, message, data);

    res.status(status).send(response);
}

module.exports = errorMiddleware;