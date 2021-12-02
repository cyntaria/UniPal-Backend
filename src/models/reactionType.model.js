const { DBService } = require('../db/db-service');
const { multipleColumnSet, multipleFilterSet } = require('../utils/common.utils');
const { tables } = require('../utils/tableNames.utils');

class ReactionTypeModel {

    findAll = async(filters) => {
        let sql = `SELECT * FROM ${tables.ReactionTypes}`;

        if (!Object.keys(filters).length) {
            return await DBService.query(sql);
        }

        const { filterSet, filterValues } = multipleFilterSet(filters);
        sql += ` WHERE ${filterSet}`;

        return await DBService.query(sql, [...filterValues]);
    };

    findOne = async(filters) => {
        const { filterSet, filterValues } = multipleFilterSet(filters);

        const sql = `SELECT * FROM ${tables.ReactionTypes}
        WHERE ${filterSet}
        LIMIT 1`;

        const result = await DBService.query(sql, [...filterValues]);

        return result[0];
    };

    create = async({ reaction_type }) => {
        const valueSet = { reaction_type };
        const { columnSet, values } = multipleColumnSet(valueSet);

        const sql = `INSERT INTO ${tables.ReactionTypes} SET ${columnSet}`;

        const result = await DBService.query(sql, [...values]);
        const created_reaction_type = !result ? 0 : {
            reaction_type_id: result.insertId,
            affected_rows: result.affectedRows
        };

        return created_reaction_type;
    };

    update = async(columns, id) => {
        const { columnSet, values } = multipleColumnSet(columns);

        const sql = `UPDATE ${tables.ReactionTypes} SET ${columnSet} WHERE reaction_type_id = ?`;

        const result = await DBService.query(sql, [...values, id]);

        return result;
    };

    delete = async(id) => {
        const sql = `DELETE FROM ${tables.ReactionTypes}
        WHERE reaction_type_id = ?`;
        const result = await DBService.query(sql, [id]);
        const affectedRows = result ? result.affectedRows : 0;

        return affectedRows;
    };
}

module.exports = new ReactionTypeModel;