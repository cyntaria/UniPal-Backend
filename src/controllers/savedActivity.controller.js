const SavedActivityRepository = require('../repositories/savedActivity.repository');

class SavedActivityController {

    createSavedActivity = async(req, res, next) => {
        req.body.student_erp = req.params.erp;
        const response = await SavedActivityRepository.create(req.body);
        res.status(201).send(response);
    };

    deleteSavedActivity = async(req, res, next) => {
        const filters = {
            activity_id: req.params.id,
            student_erp: req.params.erp
        };
        const response = await SavedActivityRepository.delete(filters);
        res.send(response);
    };
}

module.exports = new SavedActivityController;