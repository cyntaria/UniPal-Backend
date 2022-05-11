const { ErrorStatusCodes } = require("../errorStatusCodes.utils");
const { Config } = require("../../configs/config");

class DatabaseException extends Error {
    constructor(message, data, isOperational = false, status = ErrorStatusCodes.InternalServerError) {
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
        super(message, data, true, ErrorStatusCodes.NotFound);
    }
}

class DuplicateEntryException extends DatabaseException {
    constructor(message, data){
        super(message, data, true, ErrorStatusCodes.DuplicateEntry);
    }
}

class ForeignKeyViolationException extends DatabaseException {
    constructor(message, data){
        super(message, data, true, ErrorStatusCodes.ForeignKeyViolation);
    }
}

class UpdateFailedException extends DatabaseException {
    constructor(message, data){
        super(message, data, true);
    }
}

class CreateFailedException extends DatabaseException {
    constructor(message, data){
        super(message, data, true);
    }
}

class DeleteFailedException extends DatabaseException {
    constructor(message, data){
        super(message, data, true);
    }
}

class UnexpectedException extends DatabaseException {
    constructor(message = "Something went wrong", data){
        super(message, data);
    }
}

module.exports = {
    DatabaseException,
    NotFoundException,
    DuplicateEntryException,
    ForeignKeyViolationException,
    UnexpectedException,
    UpdateFailedException,
    CreateFailedException,
    DeleteFailedException
};