/* Routes */
const authRouter = require('../routes/auth.routes');
const studentRouter = require('../routes/student.routes');
const hobbyRouter = require('../routes/hobby.routes');
const interestRouter = require('../routes/interest.routes');
const healthCheckRouter = require('../routes/healthCheck.routes');

class RoutesLoader {
    static initRoutes(app, version) {
        app.use(`/api/${version}/auth`, authRouter);
        app.use(`/api/${version}/students`, studentRouter);
        app.use(`/api/${version}/hobbies`, hobbyRouter);
        app.use(`/api/${version}/interests`, interestRouter);
        app.use(`/api/${version}/health`, healthCheckRouter);
    }
}

module.exports = {RoutesLoader};