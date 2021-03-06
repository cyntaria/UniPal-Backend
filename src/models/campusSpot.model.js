const { DBService } = require('../db/db-service');
const { multipleColumnSet, multipleFilterSet } = require('../utils/common.utils');
const { tables } = require('../utils/tableNames.utils');

class CampusSpotModel {

    findAll = async(filters) => {
        let sql = `SELECT * FROM ${tables.CampusSpots}`;

        if (!Object.keys(filters).length) {
            return await DBService.query(sql);
        }

        const { filterSet, filterValues } = multipleFilterSet(filters);
        sql += ` WHERE ${filterSet}`;

        return await DBService.query(sql, [...filterValues]);
    };

    findOne = async(filters) => {
        const { filterSet, filterValues } = multipleFilterSet(filters);

        const sql = `SELECT * FROM ${tables.CampusSpots}
        WHERE ${filterSet}
        LIMIT 1`;

        const result = await DBService.query(sql, [...filterValues]);

        return result[0];
    };

    create = async({ campus_spot, campus_id }) => {
        const valueSet = { campus_spot, campus_id };
        const { columnSet, values } = multipleColumnSet(valueSet);

        const sql = `INSERT INTO ${tables.CampusSpots} SET ${columnSet}`;

        const result = await DBService.query(sql, [...values]);
        const created_campus_spot = !result ? 0 : {
            campus_spot_id: result.insertId,
            affected_rows: result.affectedRows
        };

        return created_campus_spot;
    };

    update = async(columns, id) => {
        const { columnSet, values } = multipleColumnSet(columns);

        const sql = `UPDATE ${tables.CampusSpots} SET ${columnSet} WHERE campus_spot_id = ?`;

        const result = await DBService.query(sql, [...values, id]);

        return result;
    };

    delete = async(id) => {
        const sql = `DELETE FROM ${tables.CampusSpots}
        WHERE campus_spot_id = ?`;
        const result = await DBService.query(sql, [id]);
        const affectedRows = result ? result.affectedRows : 0;

        return affectedRows;
    };
}

module.exports = new CampusSpotModel;