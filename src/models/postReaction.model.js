const { DBService } = require('../db/db-service');
const { multipleColumnSet, multipleFilterSet } = require('../utils/common.utils');
const { tables } = require('../utils/tableNames.utils');

class PostReactionModel {

    create = async({ post_id, reaction_type_id, student_erp, reacted_at }) => {
        const valueSet = { post_id, reaction_type_id, student_erp, reacted_at };
        const { columnSet, values } = multipleColumnSet(valueSet);

        const sql = `INSERT INTO ${tables.PostReactions} SET ${columnSet}`;

        const result = await DBService.query(sql, [...values]);
        const created_resource = !result ? 0 : {
            affected_rows: result.affectedRows
        };

        return created_resource;
    }

    update = async(columns, filters) => {
        const { columnSet, values } = multipleColumnSet(columns);
        const { filterSet, filterValues } = multipleFilterSet(filters);

        const sql = `UPDATE ${tables.PostReactions} 
        SET ${columnSet} 
        WHERE ${filterSet}`;

        const result = await DBService.query(sql, [...values, ...filterValues]);

        return result;
    }

    delete = async(filters) => {
        const { filterSet, filterValues } = multipleFilterSet(filters);

        const sql = `DELETE FROM ${tables.PostReactions}
        WHERE ${filterSet}`;

        const result = await DBService.query(sql, [...filterValues]);
        const affectedRows = result ? result.affectedRows : 0;

        return affectedRows;
    }
}

module.exports = new PostReactionModel;