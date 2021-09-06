const { Config } = require("../../configs/config");
const { ErrorStatusCodes } = require("../errorStatusCodes.utils");

class ApiException extends Error {
    constructor(message, data, status = ErrorStatusCodes.Unauthorized) {
        super(message);
        if (Config.NODE_ENV === "dev") this.message = "Api Error: " + message;
        else this.message = message;
        this.name = "Api Error";
        this.code = this.constructor.name;
        this.status = status;
        this.data = data;
    }
}

class InternalServerException extends ApiException {
    constructor(message, data){
        super(message, data, ErrorStatusCodes.InternalServerError);
    }
}

class InvalidEndpointException extends ApiException {
    constructor(message = "Endpoint Not Found", data){
        super(message, data, ErrorStatusCodes.NotFound);
    }
}

class UnimplementedException extends ApiException {
    constructor(message = "API unimplemented", data){
        super(message, data, ErrorStatusCodes.NotFound);
    }
}

class HealthCheckFailedException extends ApiException {
    constructor(data){
        super("API failed to run", data, ErrorStatusCodes.HealthCheckFailed);
    }
}

module.exports = {
    InternalServerException,
    InvalidEndpointException,
    UnimplementedException,
    HealthCheckFailedException
};