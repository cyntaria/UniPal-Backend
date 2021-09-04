const { DBService } = require('../db/db-service');
const { multipleColumnSet, multipleFilterSet } = require('../utils/common.utils');
const { tables } = require('../utils/tableNames.utils');

class CampusModel {

    findAll = async(params = {}) => {
        let sql = `SELECT * FROM ${tables.Campuses}`;

        if (!Object.keys(params).length) {
            return await DBService.query(sql);
        }

        const { filterSet, filterValues } = multipleFilterSet(params);
        sql += ` WHERE ${filterSet}`;

        return await DBService.query(sql, [...filterValues]);
    }

    findOne = async(params) => {
        const { filterSet, filterValues } = multipleFilterSet(params);

        const sql = `SELECT * FROM ${tables.Campuses}
        WHERE ${filterSet}`;

        const result = await DBService.query(sql, [...filterValues]);

        return result[0];
    }

    create = async({ campus }) => {
        const sql = `INSERT INTO ${tables.Campuses}
        (campus) 
        VALUES (?)`;

        const result = await DBService.query(sql, [campus]);
        const created_campus = !result ? 0 : {
            campus_id: result.insertId,
            affected_rows: result.affectedRows
        };

        return created_campus;
    }

    update = async(params, id) => {
        const { columnSet, values } = multipleColumnSet(params);

        const sql = `UPDATE ${tables.Campuses} SET ${columnSet} WHERE campus_id = ?`;

        const result = await DBService.query(sql, [...values, id]);

        return result;
    }

    delete = async(id) => {
        const sql = `DELETE FROM ${tables.Campuses}
        WHERE campus_id = ?`;
        const result = await DBService.query(sql, [id]);
        const affectedRows = result ? result.affectedRows : 0;

        return affectedRows;
    }
}

module.exports = new CampusModel;