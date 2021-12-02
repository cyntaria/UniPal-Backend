const { DBService } = require('../db/db-service');
const { multipleColumnSet, multipleFilterSet } = require('../utils/common.utils');
const { tables } = require('../utils/tableNames.utils');

class ClassroomModel {

    findAll = async(filters) => {
        let sql = `SELECT * FROM ${tables.Classrooms}`;

        if (!Object.keys(filters).length) {
            return await DBService.query(sql);
        }

        const { filterSet, filterValues } = multipleFilterSet(filters);
        sql += ` WHERE ${filterSet}`;

        return await DBService.query(sql, [...filterValues]);
    };

    findOne = async(id) => {
        const sql = `SELECT * FROM ${tables.Classrooms}
        WHERE classroom_id = ?
        LIMIT 1`;

        const result = await DBService.query(sql, [id]);

        return result[0];
    };

    create = async({ classroom, campus_id }) => {
        const valueSet = { classroom, campus_id };
        const { columnSet, values } = multipleColumnSet(valueSet);

        const sql = `INSERT INTO ${tables.Classrooms} SET ${columnSet}`;

        const result = await DBService.query(sql, [...values]);
        const created_Classroom = !result ? 0 : {
            classroom_id: result.insertId,
            affected_rows: result.affectedRows
        };

        return created_Classroom;
    };

    update = async(columns, id) => {
        const { columnSet, values } = multipleColumnSet(columns);

        const sql = `UPDATE ${tables.Classrooms} SET ${columnSet} WHERE classroom_id = ?`;

        const result = await DBService.query(sql, [...values, id]);

        return result;
    };

    delete = async(id) => {
        const sql = `DELETE FROM ${tables.Classrooms}
        WHERE classroom_id = ?`;
        const result = await DBService.query(sql, [id]);
        const affectedRows = result ? result.affectedRows : 0;

        return affectedRows;
    };
}

module.exports = new ClassroomModel;