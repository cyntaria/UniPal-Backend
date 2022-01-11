const { DBService } = require('../db/db-service');
const { multipleColumnSet, multipleFilterSet } = require('../utils/common.utils');
const { tables } = require('../utils/tableNames.utils');

class TeacherModel {

    findAll = async(filters) => {
        let sql = `SELECT * FROM ${tables.Teachers}`;

        if (!Object.keys(filters).length) {
            return await DBService.query(sql);
        }

        const { filterSet, filterValues } = multipleFilterSet(filters);
        sql += ` WHERE ${filterSet}`;

        return await DBService.query(sql, [...filterValues]);
    };

    findOne = async(id) => {
        const sql = `SELECT * FROM ${tables.Teachers}
        WHERE teacher_id = ?
        LIMIT 1`;

        const result = await DBService.query(sql, [id]);

        return result[0];
    };

    create = async({ full_name }) => {
        const valueSet = { full_name };
        const { columnSet, values } = multipleColumnSet(valueSet);

        const sql = `INSERT INTO ${tables.Teachers} SET ${columnSet}`;

        const result = await DBService.query(sql, [...values]);
        const created_Teacher = !result ? 0 : {
            teacher_id: result.insertId,
            affected_rows: result.affectedRows
        };

        return created_Teacher;
    };

    update = async(columns, id, transaction_conn = null) => {
        const { columnSet, values } = multipleColumnSet(columns);

        const sql = `UPDATE ${tables.Teachers} SET ${columnSet} WHERE teacher_id = ?`;

        const result = await DBService.query(sql, [...values, id], {transaction_conn: transaction_conn});

        return result;
    };

    delete = async(id) => {
        const sql = `DELETE FROM ${tables.Teachers}
        WHERE teacher_id = ?`;
        const result = await DBService.query(sql, [id]);
        const affectedRows = result ? result.affectedRows : 0;

        return affectedRows;
    };
}

module.exports = new TeacherModel;