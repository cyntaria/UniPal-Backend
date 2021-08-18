const { ErrorStatusCodes } = require("../errorStatusCodes.utils");
const { Config } = require("../../configs/config");

class DatabaseException extends Error {
    constructor(message, data, isOperational = false, status = 404) {
        super(message);
        if (Config.NODE_ENV === "dev") this.message = "Database Error: " + message;
        else this.message = message;
        this.name = "Database Error";
        this.isOperational = isOperational;
        this.code = this.constructor.name;
        this.status = status;
        this.data = data;
    }
}

class NotFoundException extends DatabaseException {
    constructor(message, data){
        super(message, data, true);
    }
}

class DuplicateEntryException extends DatabaseException {
    constructor(message, data){
        super(message, data, true, ErrorStatusCodes.DuplicateEntryException);
    }
}

class ForeignKeyViolationException extends DatabaseException {
    constructor(message, data){
        super(message, data, true, ErrorStatusCodes.ForeignKeyViolationException);
    }
}

class UpdateFailedException extends DatabaseException {
    constructor(message, data){
        super(message, data, true, ErrorStatusCodes.UpdateFailedException);
    }
}

class CreateFailedException extends DatabaseException {
    constructor(message, data){
        super(message, data, true, ErrorStatusCodes.CreateFailedException);
    }
}

class UnexpectedException extends DatabaseException {
    constructor(message = "Something went wrong", data){
        super(message, data);
    }
}

module.exports = {
    NotFoundException,
    DuplicateEntryException,
    ForeignKeyViolationException,
    UnexpectedException,
    UpdateFailedException,
    CreateFailedException
};