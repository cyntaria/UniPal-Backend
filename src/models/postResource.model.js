const { DBService } = require('../db/db-service');
const { multipleColumnSet } = require('../utils/common.utils');
const { tables } = require('../utils/tableNames.utils');

class PostResourceModel {

    create = async({ post_id, resource_url, resource_type }) => {
        const valueSet = { post_id, resource_url, resource_type };
        const { columnSet, values } = multipleColumnSet(valueSet);

        const sql = `INSERT INTO ${tables.PostResources} SET ${columnSet}`;

        const result = await DBService.query(sql, [...values]);
        const created_resource = !result ? 0 : {
            resource_id: result.insertId,
            affected_rows: result.affectedRows
        };

        return created_resource;
    }

    update = async(columns, id) => {
        const { columnSet, values } = multipleColumnSet(columns);

        const sql = `UPDATE ${tables.PostResources} 
        SET ${columnSet} 
        WHERE resource_id = ?`;

        const result = await DBService.query(sql, [...values, id]);

        return result;
    }

    delete = async(id) => {
        const sql = `DELETE FROM ${tables.PostResources}
        WHERE resource_id = ?`;

        const result = await DBService.query(sql, [id]);
        const affectedRows = result ? result.affectedRows : 0;

        return affectedRows;
    }
}

module.exports = new PostResourceModel;