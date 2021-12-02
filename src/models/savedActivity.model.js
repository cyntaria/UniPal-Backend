const { DBService } = require('../db/db-service');
const { multipleColumnSet, multipleFilterSet } = require('../utils/common.utils');
const { tables } = require('../utils/tableNames.utils');

class SavedActivityModel {

    create = async({ activity_id, student_erp, saved_at }) => {
        const valueSet = { activity_id, student_erp, saved_at };
        const { columnSet, values } = multipleColumnSet(valueSet);

        const sql = `INSERT INTO ${tables.SavedActivities} SET ${columnSet}`;

        const result = await DBService.query(sql, [...values]);
        const created_saved_activity = !result ? 0 : {
            affected_rows: result.affectedRows
        };

        return created_saved_activity;
    };

    delete = async(filters) => {
        const { filterSet, filterValues } = multipleFilterSet(filters);

        const sql = `DELETE FROM ${tables.SavedActivities}
        WHERE ${filterSet}`;

        const result = await DBService.query(sql, [...filterValues]);
        const affectedRows = result ? result.affectedRows : 0;

        return affectedRows;
    };
}

module.exports = new SavedActivityModel;