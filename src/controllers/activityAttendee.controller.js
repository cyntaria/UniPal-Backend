const {checkValidation} = require('../middleware/validation.middleware');

const ActivityAttendeeRepository = require('../repositories/campusSpot.repository');

class ActivityAttendeeController {

    createActivityAttendee = async(req, res, next) => {
        checkValidation(req);

        const response = await ActivityAttendeeRepository.create(req.body);
        res.status(201).send(response);
    };

    updateActivityAttendee = async(req, res, next) => {
        checkValidation(req);

        const filters = {
            activity_id: req.params.id,
            student_erp: req.params.student_erp
        };
        const response = await ActivityAttendeeRepository.update(req.body, filters);
        res.send(response);
    };

    deleteActivityAttendee = async(req, res, next) => {
        const filters = {
            activity_id: req.params.id,
            student_erp: req.params.student_erp
        };
        const response = await ActivityAttendeeRepository.delete(filters);
        res.send(response);
    };
}

module.exports = new ActivityAttendeeController;