const { DBService } = require('../db/db-service');
const { multipleColumnSet, multipleFilterSet } = require('../utils/common.utils');
const { tables } = require('../utils/tableNames.utils');
class HobbyModel {

    findAll = async(filters) => {
        let sql = `SELECT * FROM ${tables.Hobbies}`;

        if (!Object.keys(filters).length) {
            return await DBService.query(sql);
        }

        const { filterSet, filterValues } = multipleFilterSet(filters);
        sql += ` WHERE ${filterSet}`;

        return await DBService.query(sql, [...filterValues]);
    };

    findOne = async(filters) => {
        const { filterSet, filterValues } = multipleFilterSet(filters);

        const sql = `SELECT * FROM ${tables.Hobbies}
        WHERE ${filterSet}
        LIMIT 1`;

        const result = await DBService.query(sql, [...filterValues]);

        return result[0];
    };

    create = async({ hobby }) => {
        const valueSet = { hobby };
        const { columnSet, values } = multipleColumnSet(valueSet);

        const sql = `INSERT INTO ${tables.Hobbies} SET ${columnSet}`;

        const result = await DBService.query(sql, [...values]);
        const created_hobby = !result ? 0 : {
            hobby_id: result.insertId,
            affected_rows: result.affectedRows
        };

        return created_hobby;
    };

    update = async(columns, id) => {
        const { columnSet, values } = multipleColumnSet(columns);

        const sql = `UPDATE ${tables.Hobbies} SET ${columnSet} WHERE hobby_id = ?`;

        const result = await DBService.query(sql, [...values, id]);

        return result;
    };

    delete = async(id) => {
        const sql = `DELETE FROM ${tables.Hobbies}
        WHERE hobby_id = ?`;
        const result = await DBService.query(sql, [id]);
        const affectedRows = result ? result.affectedRows : 0;

        return affectedRows;
    };
}

module.exports = new HobbyModel;