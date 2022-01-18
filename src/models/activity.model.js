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
    };

    findOne = async(filters, details = false) => {
        const {activity_id} = filters;
        const { filterSet, filterValues } = multipleFilterSet(filters);
        let sql;
        let params;

        if (details) {
            sql = `SELECT *,
            (
                SELECT COUNT(activity_id)
                FROM ${tables.ActivityAttendees}
                WHERE activity_id = ?
            ) AS num_of_attendees
            FROM ${tables.Activities}
            WHERE ${filterSet}
            LIMIT 1`;
            
            params = [activity_id, ...filterValues];
        } else {
            sql = `SELECT *
            FROM ${tables.Activities}
            WHERE ${filterSet}
            LIMIT 1`;
            
            params = [...filterValues];
        }
        
        const result = await DBService.query(sql, params);

        // return back the first row (activity)
        return result[0];
    };

    findAllAttendeesByActivity = async(activity_id, filters) => {
        let sql = `SELECT activity_id, student_erp, first_name, last_name, profile_picture_url, involvement_type 
        FROM ${tables.ActivityAttendees} AS a
        INNER JOIN ${tables.Students} AS s
        ON a.student_erp = s.erp
        WHERE activity_id = ?`;

        if (!Object.keys(filters).length) {
            return await DBService.query(sql, [activity_id]);
        }

        const { filterSet, filterValues } = multipleFilterSet(filters);
        sql += ` AND ${filterSet}`;

        const result = await DBService.query(sql, [activity_id, ...filterValues]);

        return result;
    };

    create = async({
        title, location, privacy, frequency,
        monday = 0, tuesday = 0, wednesday = 0, thursday = 0, friday = 0, saturday = 0, sunday = 0,
        month_number, group_size, happens_at, additional_instructions = null,
        activity_type_id, activity_status_id, campus_spot_id = null, organizer_erp, created_at
    }) => {
        
        const valueSet = {
            title, location, privacy, frequency,
            monday, tuesday, wednesday, thursday, friday, saturday, sunday,
            month_number, group_size, happens_at, additional_instructions,
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
    };

    update = async(columns, id) => {
        const { columnSet, values } = multipleColumnSet(columns);

        const sql = `UPDATE ${tables.Activities} SET ${columnSet} WHERE activity_id = ?`;

        const result = await DBService.query(sql, [...values, id]);

        return result;
    };

    delete = async(id) => {
        const sql = `DELETE FROM ${tables.Activities}
        WHERE activity_id = ?`;
        const result = await DBService.query(sql, [id]);
        const affectedRows = result ? result.affectedRows : 0;

        return affectedRows;
    };
}

module.exports = new ActivityModel;