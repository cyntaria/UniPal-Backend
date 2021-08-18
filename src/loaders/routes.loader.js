/* Routes */
const authRouter = require('../routes/auth.routes');
const userRouter = require('../routes/user.routes');
const healthCheckRouter = require('../routes/healthCheck.routes');

class RoutesLoader {
    static initRoutes(app, version) {
        app.use(`/api/${version}/auth`, authRouter);
        app.use(`/api/${version}/users`, userRouter);
        app.use(`/api/${version}/health`, healthCheckRouter);
    }
}

exports = {RoutesLoader};