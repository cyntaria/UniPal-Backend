const { DBService } = require('../db/db-service');
const { multipleColumnSet, multipleFilterSet } = require('../utils/common.utils');
const { tables } = require('../utils/tableNames.utils');

class StudentStatusModel {

    findAll = async(filters = {}) => {
        let sql = `SELECT * FROM ${tables.StudentStatuses}`;

        if (!Object.keys(filters).length) {
            return await DBService.query(sql);
        }

        const { filterSet, filterValues } = multipleFilterSet(filters);
        sql += ` WHERE ${filterSet}`;

        return await DBService.query(sql, [...filterValues]);
    }

    findOne = async(filters) => {
        const { filterSet, filterValues } = multipleFilterSet(filters);

        const sql = `SELECT * FROM ${tables.StudentStatuses}
        WHERE ${filterSet}`;

        const result = await DBService.query(sql, [...filterValues]);

        return result[0];
    }

    create = async({ student_status }) => {
        const valueSet = { student_status };
        const { columnSet, values } = multipleColumnSet(valueSet);

        const sql = `INSERT INTO ${tables.StudentStatuses} SET ${columnSet}`;

        const result = await DBService.query(sql, [...values]);
        const created_student_status = !result ? 0 : {
            student_status_id: result.insertId,
            affected_rows: result.affectedRows
        };

        return created_student_status;
    }

    update = async(columns, id) => {
        const { columnSet, values } = multipleColumnSet(columns);

        const sql = `UPDATE ${tables.StudentStatuses} SET ${columnSet} WHERE student_status_id = ?`;

        const result = await DBService.query(sql, [...values, id]);

        return result;
    }

    delete = async(id) => {
        const sql = `DELETE FROM ${tables.StudentStatuses}
        WHERE student_status_id = ?`;
        const result = await DBService.query(sql, [id]);
        const affectedRows = result ? result.affectedRows : 0;

        return affectedRows;
    }
}

module.exports = new StudentStatusModel;