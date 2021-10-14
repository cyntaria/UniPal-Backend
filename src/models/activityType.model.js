const { DBService } = require('../db/db-service');
const { multipleColumnSet, multipleFilterSet } = require('../utils/common.utils');
const { tables } = require('../utils/tableNames.utils');

class ActivityTypeModel {

    findAll = async(filters) => {
        let sql = `SELECT * FROM ${tables.ActivityTypes}`;

        if (!Object.keys(filters).length) {
            return await DBService.query(sql);
        }

        const { filterSet, filterValues } = multipleFilterSet(filters);
        sql += ` WHERE ${filterSet}`;

        return await DBService.query(sql, [...filterValues]);
    }

    findOne = async(filters) => {
        const { filterSet, filterValues } = multipleFilterSet(filters);

        const sql = `SELECT * FROM ${tables.ActivityTypes}
        WHERE ${filterSet}
        LIMIT 1`;

        const result = await DBService.query(sql, [...filterValues]);

        return result[0];
    }

    create = async({ activity_type }) => {
        const valueSet = { activity_type };
        const { columnSet, values } = multipleColumnSet(valueSet);

        const sql = `INSERT INTO ${tables.ActivityTypes} SET ${columnSet}`;

        const result = await DBService.query(sql, [...values]);
        const created_activity_type = !result ? 0 : {
            activity_type_id: result.insertId,
            affected_rows: result.affectedRows
        };

        return created_activity_type;
    }

    update = async(columns, id) => {
        const { columnSet, values } = multipleColumnSet(columns);

        const sql = `UPDATE ${tables.ActivityTypes} SET ${columnSet} WHERE activity_type_id = ?`;

        const result = await DBService.query(sql, [...values, id]);

        return result;
    }

    delete = async(id) => {
        const sql = `DELETE FROM ${tables.ActivityTypes}
        WHERE activity_type_id = ?`;
        const result = await DBService.query(sql, [id]);
        const affectedRows = result ? result.affectedRows : 0;

        return affectedRows;
    }
}

module.exports = new ActivityTypeModel;