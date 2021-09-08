const { DBService } = require('../db/db-service');
const { multipleColumnSet, multipleFilterSet } = require('../utils/common.utils');
const { tables } = require('../utils/tableNames.utils');

class InterestModel {

    findAll = async(filters = {}) => {
        let sql = `SELECT * FROM ${tables.Interests}`;

        if (!Object.keys(filters).length) {
            return await DBService.query(sql);
        }

        const { filterSet, filterValues } = multipleFilterSet(filters);
        sql += ` WHERE ${filterSet}`;

        return await DBService.query(sql, [...filterValues]);
    }

    findOne = async(filters) => {
        const { filterSet, filterValues } = multipleFilterSet(filters);

        const sql = `SELECT * FROM ${tables.Interests}
        WHERE ${filterSet}`;

        const result = await DBService.query(sql, [...filterValues]);

        return result[0];
    }

    create = async({ interest }) => {
        const valueSet = { interest };
        const { columnSet, values } = multipleColumnSet(valueSet);

        const sql = `INSERT INTO ${tables.Interests} SET ${columnSet}`;

        const result = await DBService.query(sql, [...values]);
        const created_interest = !result ? 0 : {
            interest_id: result.insertId,
            affected_rows: result.affectedRows
        };

        return created_interest;
    }

    update = async(columns, id) => {
        const { columnSet, values } = multipleColumnSet(columns);

        const sql = `UPDATE ${tables.Interests} SET ${columnSet} WHERE interest_id = ?`;

        const result = await DBService.query(sql, [...values, id]);

        return result;
    }

    delete = async(id) => {
        const sql = `DELETE FROM ${tables.Interests}
        WHERE interest_id = ?`;
        const result = await DBService.query(sql, [id]);
        const affectedRows = result ? result.affectedRows : 0;

        return affectedRows;
    }
}

module.exports = new InterestModel;