const { InvalidEndpointException } = require('../utils/exceptions/api.exception');
const errorMiddleware = require('../middleware/error.middleware');
const Sentry = require("@sentry/node");
const { Config } = require('../configs/config');

class MiddlewareLoader {
    static init(app) {
        // 404 endpoint handler
        app.all('*', (req, res, next) => {
            const err = new InvalidEndpointException();
            next(err);
        });

        if (Config.NODE_ENV === 'production') {
            // Sentry error loggin middleware
            // This must be after routes loader and before error middleware
            app.use(Sentry.Handlers.errorHandler());
        }

        // Error middleware
        // This must be the last middleware
        app.use(errorMiddleware);
    }
}

module.exports = { MiddlewareLoader };