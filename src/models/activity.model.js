const { DBService } = require('../db/db-service');
const { multipleColumnSet, multipleFilterSet } = require('../utils/common.utils');
const { tables } = require('../utils/tableNames.utils');

class ActivityModel {

    findAll = async(filters) => {
        let sql = `SELECT * FROM ${tables.Activities}`;

        if (!Object.keys(filters).length) {
            return await DBService.query(sql);
        }

        const { filterSet, filterValues } = multipleFilterSet(filters);
        sql += ` WHERE ${filterSet}`;

        return await DBService.query(sql, [...filterValues]);
    }

    findOne = async(filters) => {
        const { filterSet, filterValues } = multipleFilterSet(filters);

        const sql = `SELECT * FROM ${tables.Activities}
        WHERE ${filterSet}`;

        const result = await DBService.query(sql, [...filterValues]);

        // return back the first row (activity)
        return result[0];
    }

    // 24 fields
    create = async({
        location, privacy, frequency,
        monday, tuesday, wednesday, thursday, friday, saturday, sunday,
        month_number, group_size, happens_at, additional_directions,
        activity_type_id, activity_status_id, campus_spot_id, organizer_erp, created_at
    }) => {
        
        const valueSet = {
            location, privacy, frequency,
            monday, tuesday, wednesday, thursday, friday, saturday, sunday,
            month_number, group_size, happens_at, additional_directions,
            activity_type_id, activity_status_id, campus_spot_id, organizer_erp, created_at
        };
        const { columnSet, values } = multipleColumnSet(valueSet);

        const sql = `INSERT INTO ${tables.Activities} SET ${columnSet}`;

        const result = await DBService.query(sql, [...values]);
        const created_activity = !result ? 0 : {
            activity_id: result.insertId,
            affected_rows: result.affectedRows
        };

        return created_activity;
    }

    update = async(columns, id) => {
        const { columnSet, values } = multipleColumnSet(columns);

        const sql = `UPDATE ${tables.Activities} SET ${columnSet} WHERE activity_id = ?`;

        const result = await DBService.query(sql, [...values, id]);

        return result;
    }

    delete = async(id) => {
        const sql = `DELETE FROM ${tables.Activities}
        WHERE activity_id = ?`;
        const result = await DBService.query(sql, [id]);
        const affectedRows = result ? result.affectedRows : 0;

        return affectedRows;
    }
}

module.exports = new ActivityModel;