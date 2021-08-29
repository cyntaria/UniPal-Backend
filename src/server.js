const { ExpressLoader } = require('./loaders/express.loader');
const { DatabaseLoader } = require('./loaders/database.loader');
const { RoutesLoader } = require('./loaders/routes.loader');
const { MiddlewareLoader } = require('./loaders/middleware.loader');

const setup = () => {
    // load express
    const app = ExpressLoader.init();


    // init routes
    const version = "v1";
    RoutesLoader.initRoutes(app, version);

    // init middleware
    MiddlewareLoader.init(app);

    return app;
};

// load database
DatabaseLoader.init();

module.exports = {setup};