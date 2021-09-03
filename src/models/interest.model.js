const { DBService } = require('../db/db-service');
const { multipleColumnSet, multipleFilterSet } = require('../utils/common.utils');
const { tables } = require('../utils/tableNames.utils');

class InterestModel {

    findAll = async(params = {}) => {
        let sql = `SELECT * FROM ${tables.Interests}`;

        if (!Object.keys(params).length) {
            return await DBService.query(sql);
        }

        const { filterSet, filterValues } = multipleFilterSet(params);
        sql += ` WHERE ${filterSet}`;

        return await DBService.query(sql, [...filterValues]);
    }

    findOne = async(params) => {
        const { filterSet, filterValues } = multipleFilterSet(params);

        const sql = `SELECT * FROM ${tables.Interests}
        WHERE ${filterSet}`;

        const result = await DBService.query(sql, [...filterValues]);

        return result[0];
    }

    create = async({ interest }) => {
        const sql = `INSERT INTO ${tables.Interests}
        (interest) 
        VALUES (?)`;

        const result = await DBService.query(sql, [interest]);
        const created_interest = !result ? 0 : {
            interest_id: result.insertId,
            affected_rows: result.affectedRows
        };

        return created_interest;
    }

    update = async(params, id) => {
        const { columnSet, values } = multipleColumnSet(params);

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