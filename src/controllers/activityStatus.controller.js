const {checkValidation} = require('../middleware/validation.middleware');

const ActivityStatusRepository = require('../repositories/activityStatus.repository');

class ActivityStatusController {
    getAllActivityStatuses = async(req, res, next) => {
        const response = await ActivityStatusRepository.findAll();
        res.send(response);
    };

    getActivityStatusById = async(req, res, next) => {
        const response = await ActivityStatusRepository.findOne({ activity_status_id: req.params.id });
        res.send(response);
    };

    createActivityStatus = async(req, res, next) => {
        checkValidation(req);

        const response = await ActivityStatusRepository.create(req.body);
        res.status(201).send(response);
    };

    updateActivityStatus = async(req, res, next) => {
        checkValidation(req);

        const response = await ActivityStatusRepository.update(req.body, req.params.id);
        res.send(response);
    };

    deleteActivityStatus = async(req, res, next) => {
        const response = await ActivityStatusRepository.delete(req.params.id);
        res.send(response);
    };
}

module.exports = new ActivityStatusController;