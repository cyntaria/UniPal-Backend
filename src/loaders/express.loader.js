const express = require("express");
const cors = require("cors");
const Sentry = require("@sentry/node");
const { SentryLoader } = require("./sentry.loader");
const { Config } = require("../configs/config");

class ExpressLoader {
    static init() {
        const app = express();

        if (Config.NODE_ENV === 'production') {
            // init Sentry SDK for error logging
            SentryLoader.init(app);

            // To monitor release health of each request in session aggregates mode
            // This must be the first middleware
            app.use(Sentry.Handlers.requestHandler());

            // TracingHandler creates a trace for every incoming request
            app.use(Sentry.Handlers.tracingHandler());
        }

        // Middleware that transforms the raw string of req.body into json
        app.use(express.json());

        // parses incoming requests with JSON payloads
        app.use(cors());
        app.options("*", cors());

        return app;
    }
}

module.exports = { ExpressLoader };