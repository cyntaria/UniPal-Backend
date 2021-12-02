const { DBService } = require('../db/db-service');
const { multipleColumnSet, multipleFilterSet } = require('../utils/common.utils');
const { tables } = require('../utils/tableNames.utils');

class SubjectModel {

    findAll = async(filters) => {
        let sql = `SELECT * FROM ${tables.Subjects}`;

        if (!Object.keys(filters).length) {
            return await DBService.query(sql);
        }

        const { filterSet, filterValues } = multipleFilterSet(filters);
        sql += ` WHERE ${filterSet}`;

        return await DBService.query(sql, [...filterValues]);
    };

    findOne = async(subject_code) => {
        const sql = `SELECT * FROM ${tables.Subjects}
        WHERE subject_code = ?
        LIMIT 1`;

        const result = await DBService.query(sql, [subject_code]);

        return result[0];
    };

    create = async({ subject_code, subject }) => {
        const valueSet = { subject_code, subject };
        const { columnSet, values } = multipleColumnSet(valueSet);

        const sql = `INSERT INTO ${tables.Subjects} SET ${columnSet}`;

        const result = await DBService.query(sql, [...values]);
        const created_subject = !result ? 0 : {
            affected_rows: result.affectedRows
        };

        return created_subject;
    };

    update = async(columns, id) => {
        const { columnSet, values } = multipleColumnSet(columns);

        const sql = `UPDATE ${tables.Subjects} SET ${columnSet} WHERE subject_code = ?`;

        const result = await DBService.query(sql, [...values, id]);

        return result;
    };

    delete = async(id) => {
        const sql = `DELETE FROM ${tables.Subjects}
        WHERE subject_code = ?`;
        const result = await DBService.query(sql, [id]);
        const affectedRows = result ? result.affectedRows : 0;

        return affectedRows;
    };
}

module.exports = new SubjectModel;