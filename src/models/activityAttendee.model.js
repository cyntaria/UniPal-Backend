const { DBService } = require('../db/db-service');
const { multipleColumnSet, multipleFilterSet } = require('../utils/common.utils');
const { tables } = require('../utils/tableNames.utils');

class ActivityAttendeeModel {

    create = async({ activity_id, student_erp, involvement_type }) => {
        const valueSet = { activity_id, student_erp, involvement_type };
        const { columnSet, values } = multipleColumnSet(valueSet);

        const sql = `INSERT INTO ${tables.ActivityAttendees} SET ${columnSet}`;

        const result = await DBService.query(sql, [...values]);
        const created_activity_attendee = !result ? 0 : {
            affected_rows: result.affectedRows
        };

        return created_activity_attendee;
    };

    update = async(columns, filters) => {
        const { columnSet, values } = multipleColumnSet(columns);
        const { filterSet, filterValues } = multipleFilterSet(filters);

        const sql = `UPDATE ${tables.ActivityAttendees} 
        SET ${columnSet} 
        WHERE ${filterSet}`;

        const result = await DBService.query(sql, [...values, ...filterValues]);

        return result;
    };

    delete = async(filters) => {
        const { filterSet, filterValues } = multipleFilterSet(filters);

        const sql = `DELETE FROM ${tables.ActivityAttendees}
        WHERE ${filterSet}`;

        const result = await DBService.query(sql, [...filterValues]);
        const affectedRows = result ? result.affectedRows : 0;

        return affectedRows;
    };
}

module.exports = new ActivityAttendeeModel;