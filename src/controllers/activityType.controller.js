const ActivityTypeRepository = require('../repositories/activityType.repository');

class ActivityTypeController {
    getAllActivityTypes = async(req, res, next) => {
        const response = await ActivityTypeRepository.findAll();
        res.send(response);
    };

    getActivityTypeById = async(req, res, next) => {
        const response = await ActivityTypeRepository.findOne({ activity_type_id: req.params.id });
        res.send(response);
    };

    createActivityType = async(req, res, next) => {
        const response = await ActivityTypeRepository.create(req.body);
        res.status(201).send(response);
    };

    updateActivityType = async(req, res, next) => {
        const response = await ActivityTypeRepository.update(req.body, req.params.id);
        res.send(response);
    };

    deleteActivityType = async(req, res, next) => {
        const response = await ActivityTypeRepository.delete(req.params.id);
        res.send(response);
    };
}

module.exports = new ActivityTypeController;