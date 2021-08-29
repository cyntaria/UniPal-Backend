const { Config } = require("../../configs/config");

class ValidationException extends Error {
    constructor(message, data, status = 422) {
        super(message);
        if (Config.NODE_ENV === "dev") this.message = "Validation Error: " + message;
        else this.message = message;
        this.name = "Validation Error";
        this.code = this.constructor.name;
        this.status = status;
        this.data = data;
    }
}

class InvalidPropertiesException extends ValidationException {
    constructor(message, data){
        super(message, data);
    }
}

module.exports = { InvalidPropertiesException };