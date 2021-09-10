const { DBService } = require('../db/db-service');
const { multipleColumnSet, multipleFilterSet } = require('../utils/common.utils');
const { tables } = require('../utils/tableNames.utils');

class ActivityStatusModel {

    findAll = async(filters) => {
        let sql = `SELECT * FROM ${tables.ActivityStatuses}`;

        if (!Object.keys(filters).length) {
            return await DBService.query(sql);
        }

        const { filterSet, filterValues } = multipleFilterSet(filters);
        sql += ` WHERE ${filterSet}`;

        return await DBService.query(sql, [...filterValues]);
    }

    findOne = async(filters) => {
        const { filterSet, filterValues } = multipleFilterSet(filters);

        const sql = `SELECT * FROM ${tables.ActivityStatuses}
        WHERE ${filterSet}`;

        const result = await DBService.query(sql, [...filterValues]);

        return result[0];
    }

    create = async({ activity_status }) => {
        const valueSet = { activity_status };
        const { columnSet, values } = multipleColumnSet(valueSet);

        const sql = `INSERT INTO ${tables.ActivityStatuses} SET ${columnSet}`;

        const result = await DBService.query(sql, [...values]);
        const created_activity_status = !result ? 0 : {
            activity_status_id: result.insertId,
            affected_rows: result.affectedRows
        };

        return created_activity_status;
    }

    update = async(columns, id) => {
        const { columnSet, values } = multipleColumnSet(columns);

        const sql = `UPDATE ${tables.ActivityStatuses} SET ${columnSet} WHERE activity_status_id = ?`;

        const result = await DBService.query(sql, [...values, id]);

        return result;
    }

    delete = async(id) => {
        const sql = `DELETE FROM ${tables.ActivityStatuses}
        WHERE activity_status_id = ?`;
        const result = await DBService.query(sql, [id]);
        const affectedRows = result ? result.affectedRows : 0;

        return affectedRows;
    }
}

module.exports = new ActivityStatusModel;