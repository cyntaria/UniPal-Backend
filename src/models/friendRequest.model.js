const { DBService } = require('../db/db-service');
const { multipleColumnSet, multipleFilterSet } = require('../utils/common.utils');
const { tables } = require('../utils/tableNames.utils');
const { ConnectionStatus } = require('../utils/enums/connectionStatus.utils');

class FriendRequestModel {

    findAll = async(filters) => {
        let sql = `SELECT student_connection_id, sender_erp, receiver_erp, connection_status, sent_at, accepted_at
        FROM ${tables.StudentConnections}
        WHERE connection_status = ?`;

        if (!Object.keys(filters).length) {
            return await DBService.query(sql, [ConnectionStatus.RequestPending]);
        }

        const { filterSet, filterValues } = multipleFilterSet(filters);
        sql += ` AND ${filterSet}`;

        return await DBService.query(sql, [ConnectionStatus.RequestPending, ...filterValues]);
    }

    findOne = async(id) => {
        const sql = `SELECT * FROM ${tables.StudentConnections}
        WHERE student_connection_id = ?`;

        const result = await DBService.query(sql, [id]);

        return result[0];
    }

    create = async({ sender_erp, receiver_erp, sent_at }) => {
        const valueSet = { sender_erp, receiver_erp, sent_at };
        const { columnSet, values } = multipleColumnSet(valueSet);

        const sql = `INSERT INTO ${tables.StudentConnections} SET ${columnSet},
        student_1_erp = LEAST(?,?),
        student_2_erp = GREATEST(?,?)`;

        const result = await DBService.query(sql, [...values, sender_erp, receiver_erp, sender_erp, receiver_erp]);
        const created_friend_request = !result ? 0 : {
            student_connection_id: result.insertId,
            affected_rows: result.affectedRows
        };

        return created_friend_request;
    }

    update = async({ connection_status, accepted_at = null }, id) => {
        const columns = { connection_status, accepted_at };
        const { columnSet, values } = multipleColumnSet(columns);

        const sql = `UPDATE ${tables.StudentConnections} SET ${columnSet} WHERE student_connection_id = ?`;

        const result = await DBService.query(sql, [...values, id]);

        return result;
    }

    delete = async(id) => {
        const sql = `DELETE FROM ${tables.StudentConnections} WHERE student_connection_id = ?`;

        const result = await DBService.query(sql, [id]);
        const affectedRows = result ? result.affectedRows : 0;

        return affectedRows;
    }
}

module.exports = new FriendRequestModel;