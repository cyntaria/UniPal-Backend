exports.successResponse = (body, message = "Success") => {
    return {
        headers: {
            error: 0,
            message
        },
        body: body
    };
};

exports.failureResponse = (code, message, data) => {
    return {
        headers: {
            error: 1,
            code,
            message,
            ...(data) && data
        },
        body: {}
    };
};