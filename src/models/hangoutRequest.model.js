const { DBService } = require('../db/db-service');
const { multipleColumnSet, multipleFilterSet } = require('../utils/common.utils');
const { tables } = require('../utils/tableNames.utils');
const { HangoutRequestStatus } = require('../utils/enums/hangoutRequestStatus.utils');

class HangoutRequestModel {

    findAll = async(filters) => {
        let sql = `SELECT * FROM ${tables.HangoutRequests}`;

        if (!Object.keys(filters).length) {
            return await DBService.query(sql);
        }

        const { filterSet, filterValues } = multipleFilterSet(filters);
        sql += ` WHERE ${filterSet}`;

        return await DBService.query(sql, [...filterValues]);
    };

    findOne = async(id) => {
        const sql = `SELECT * FROM ${tables.HangoutRequests}
        WHERE hangout_request_id = ?
        LIMIT 1`;

        const result = await DBService.query(sql, [id]);

        return result[0];
    };

    create = async({ sender_erp, receiver_erp, purpose, meetup_at, meetup_spot_id }) => {
        const valueSet = {
            sender_erp,
            receiver_erp,
            purpose,
            meetup_at,
            meetup_spot_id,
            request_status: HangoutRequestStatus.RequestPending,
            accepted_at: null
        };
        const { columnSet, values } = multipleColumnSet(valueSet);

        const sql = `INSERT INTO ${tables.HangoutRequests} SET ${columnSet}`;

        const result = await DBService.query(sql, [...values]);
        const created_hangout_request = !result ? 0 : {
            hangout_request_id: result.insertId,
            affected_rows: result.affectedRows
        };

        return created_hangout_request;
    };

    update = async({ request_status, accepted_at = null }, id) => {
        const columns = { request_status, accepted_at };
        const { columnSet, values } = multipleColumnSet(columns);

        const sql = `UPDATE ${tables.HangoutRequests} SET ${columnSet} WHERE hangout_request_id = ?`;

        const result = await DBService.query(sql, [...values, id]);

        return result;
    };

    delete = async(id) => {
        const sql = `DELETE FROM ${tables.HangoutRequests} WHERE hangout_request_id = ?`;

        const result = await DBService.query(sql, [id]);
        const affectedRows = result ? result.affectedRows : 0;

        return affectedRows;
    };
}

module.exports = new HangoutRequestModel;