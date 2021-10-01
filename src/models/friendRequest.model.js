const { DBService } = require('../db/db-service');
const { multipleColumnSet, multipleFilterSet } = require('../utils/common.utils');
const { tables } = require('../utils/tableNames.utils');

class FriendRequestModel {

    findAll = async(filters) => {
        let sql = `SELECT * FROM ${tables.FriendRequests}`;

        if (!Object.keys(filters).length) {
            return await DBService.query(sql);
        }

        const { filterSet, filterValues } = multipleFilterSet(filters);
        sql += ` WHERE ${filterSet}`;

        return await DBService.query(sql, [...filterValues]);
    }

    findOne = async(filters) => {
        const { filterSet, filterValues } = multipleFilterSet(filters);

        const sql = `SELECT * FROM ${tables.FriendRequests}
        WHERE ${filterSet}`;

        const result = await DBService.query(sql, [...filterValues]);

        return result[0];
    }

    create = async({ sender_erp, receiver_erp, sent_at }) => {
        const valueSet = { sender_erp, receiver_erp, sent_at };
        const { columnSet, values } = multipleColumnSet(valueSet);

        const sql = `INSERT INTO ${tables.FriendRequests} SET ${columnSet}`;

        const result = await DBService.query(sql, [...values]);
        const created_friend_request = !result ? 0 : {
            friend_request_id: result.insertId,
            affected_rows: result.affectedRows
        };

        return created_friend_request;
    }

    update = async(columns, id) => {
        const { columnSet, values } = multipleColumnSet(columns);

        const sql = `UPDATE ${tables.FriendRequests} SET ${columnSet} WHERE friend_request_id = ?`;

        const result = await DBService.query(sql, [...values, id]);

        return result;
    }

    delete = async(id) => {
        const sql = `DELETE FROM ${tables.FriendRequests} WHERE friend_request_id = ?`;

        const result = await DBService.query(sql, [id]);
        const affectedRows = result ? result.affectedRows : 0;

        return affectedRows;
    }
}

module.exports = new FriendRequestModel;