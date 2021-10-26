const { DBService } = require('../db/db-service');
const { multipleColumnSet, multipleFilterSet } = require('../utils/common.utils');
const { tables } = require('../utils/tableNames.utils');

class TimeslotModel {

    findAll = async(filters) => {
        let sql = `SELECT * FROM ${tables.Timeslots}`;

        if (!Object.keys(filters).length) {
            return await DBService.query(sql);
        }

        const { filterSet, filterValues } = multipleFilterSet(filters);
        sql += ` WHERE ${filterSet}`;

        return await DBService.query(sql, [...filterValues]);
    }

    findTimeConflicts = async({start_time, end_time}) => {
        const sql = `SELECT COUNT(*) FROM ${tables.Timeslots}
        WHERE ? BETWEEN start_time AND end_time
        OR ? BETWEEN start_time AND end_time
        OR (start_time AND end_time) BETWEEN ? AND ?`;

        const result = await DBService.query(sql, [start_time, end_time, start_time, end_time]);

        return result[0]['COUNT(*)'];
    }

    findOne = async(id) => {
        const sql = `SELECT * FROM ${tables.Timeslots}
        WHERE timeslot_id = ?
        LIMIT 1`;

        const result = await DBService.query(sql, [id]);

        return result[0];
    }

    create = async({ start_time, end_time, slot_number }) => {
        const valueSet = { start_time, end_time, slot_number };
        const { columnSet, values } = multipleColumnSet(valueSet);

        const sql = `INSERT INTO ${tables.Timeslots} SET ${columnSet}`;

        const result = await DBService.query(sql, [...values]);
        const created_timeslot = !result ? 0 : {
            timeslot_id: result.insertId,
            affected_rows: result.affectedRows
        };

        return created_timeslot;
    }

    update = async(columns, id) => {
        const { columnSet, values } = multipleColumnSet(columns);

        const sql = `UPDATE ${tables.Timeslots} SET ${columnSet} WHERE timeslot_id = ?`;

        const result = await DBService.query(sql, [...values, id]);

        return result;
    }

    delete = async(id) => {
        const sql = `DELETE FROM ${tables.Timeslots}
        WHERE timeslot_id = ?`;
        const result = await DBService.query(sql, [id]);
        const affectedRows = result ? result.affectedRows : 0;

        return affectedRows;
    }
}

module.exports = new TimeslotModel;