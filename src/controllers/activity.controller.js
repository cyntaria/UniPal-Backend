const ActivityRepository = require('../repositories/activity.repository');

class ActivityController {
    getAllActivities = async(req, res, next) => {
        const response = await ActivityRepository.findAll(req.query);
        res.send(response);
    };

    getActivityById = async(req, res, next) => {
        const response = await ActivityRepository.findOne({activity_id: req.params.id});
        res.send(response);
    };

    getActivityAttendees = async(req, res, next) => {
        const filters = {
            activity_id: req.params.id,
            ...req.query
        };
        const response = await ActivityRepository.findAllAttendeesByActivity(filters);
        res.send(response);
    };

    createActivity = async(req, res, next) => {
        const response = await ActivityRepository.create(req.body);
        res.status(201).send(response);
    };

    updateActivity = async(req, res, next) => {
        const response = await ActivityRepository.update(req.body, req.params.id);
        res.send(response);
    };

    deleteActivity = async(req, res, next) => {
        const response = await ActivityRepository.delete(req.params.id);
        res.send(response);
    };
}

module.exports = new ActivityController;