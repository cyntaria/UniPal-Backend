const { InvalidEndpointException } = require('../utils/exceptions/api.exception');
const errorMiddleware = require('../middleware/error.middleware');
const Sentry = require("@sentry/node");

class MiddlewareLoader {
    static init(app) {
        // 404 endpoint handler
        app.all('*', (req, res, next) => {
            const err = new InvalidEndpointException();
            next(err);
        });

        // Sentry error loggin middleware
        app.use(Sentry.Handlers.errorHandler({
            shouldHandleError(_) { return true; }
        }));

        // Error middleware
        app.use(errorMiddleware);
    }
}

module.exports = { MiddlewareLoader };