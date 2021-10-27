/* Routes */
const authRouter = require('../routes/auth.routes');
const studentRouter = require('../routes/student.routes');
const hobbyRouter = require('../routes/hobby.routes');
const interestRouter = require('../routes/interest.routes');
const campusRouter = require('../routes/campus.routes');
const programRouter = require('../routes/program.routes');
const studentStatusRouter = require('../routes/studentStatus.routes');
const activityStatusRouter = require('../routes/activityStatus.routes');
const activityTypeRouter = require('../routes/activityType.routes');
const campusSpotRouter = require('../routes/campusSpot.routes');
const activityRouter = require('../routes/activity.routes');
const activityAttendeeRouter = require('../routes/activityAttendee.routes');
const savedActivityRouter = require('../routes/savedActivity.routes');
const studentConnectionRouter = require('../routes/studentConnection.routes');
const hangoutRequestRouter = require('../routes/hangoutRequest.routes');
const reactionTypeRouter = require('../routes/reactionType.routes');
const postReactionRouter = require('../routes/postReaction.routes');
const postRouter = require('../routes/post.routes');
const subjectRouter = require('../routes/subject.routes');
const timeslotRouter = require('../routes/timeslot.routes');
const healthCheckRouter = require('../routes/healthCheck.routes');

class RoutesLoader {
    static initRoutes(app, version) {
        app.use(`/api/${version}/auth`, authRouter);
        app.use(`/api/${version}/students`, studentRouter);
        app.use(`/api/${version}/students`, savedActivityRouter);
        app.use(`/api/${version}/hobbies`, hobbyRouter);
        app.use(`/api/${version}/interests`, interestRouter);
        app.use(`/api/${version}/campuses`, campusRouter);
        app.use(`/api/${version}/programs`, programRouter);
        app.use(`/api/${version}/student-statuses`, studentStatusRouter);
        app.use(`/api/${version}/activity-statuses`, activityStatusRouter);
        app.use(`/api/${version}/activity-types`, activityTypeRouter);
        app.use(`/api/${version}/activities`, activityRouter);
        app.use(`/api/${version}/activities`, activityAttendeeRouter);
        app.use(`/api/${version}/campus-spots`, campusSpotRouter);
        app.use(`/api/${version}/student-connections`, studentConnectionRouter);
        app.use(`/api/${version}/hangout-requests`, hangoutRequestRouter);
        app.use(`/api/${version}/reaction-types`, reactionTypeRouter);
        app.use(`/api/${version}/posts`, postRouter);
        app.use(`/api/${version}/posts`, postReactionRouter);
        app.use(`/api/${version}/subjects`, subjectRouter);
        app.use(`/api/${version}/timeslots`, timeslotRouter);
        app.use(`/api/${version}/health`, healthCheckRouter);
    }
}

module.exports = {RoutesLoader};