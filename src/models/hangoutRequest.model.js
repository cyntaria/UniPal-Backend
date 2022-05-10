const { DBService } = require('../db/db-service');
const { multipleColumnSet, multipleFilterSet } = require('../utils/common.utils');
const { tables } = require('../utils/tableNames.utils');
const { HangoutRequestStatus } = require('../utils/enums/hangoutRequestStatus.utils');

class HangoutRequestModel {

    findAll = async(filters) => {
        let sql = `
            SELECT 
                hangout_request_id, request_status, purpose, 
                meetup_at, meetup_spot_id, accepted_at,
                SENDER.erp, SENDER.first_name, SENDER.last_name, SENDER.profile_picture_url, SENDER.program_id, SENDER.graduation_year,
                RECEIVER.erp, RECEIVER.first_name, RECEIVER.last_name, RECEIVER.profile_picture_url, RECEIVER.program_id, RECEIVER.graduation_year
            FROM ${tables.HangoutRequests} AS hangout_request
            INNER JOIN ${tables.Students} AS sender ON hangout_request.sender_erp = SENDER.erp
            INNER JOIN ${tables.Students} AS receiver ON hangout_request.receiver_erp = RECEIVER.erp
        `;

        if (!Object.keys(filters).length) {
            return await DBService.query(sql, [], { nestTables: true });
        }

        const { filterSet, filterValues } = multipleFilterSet(filters);
        sql += ` WHERE ${filterSet}`;

        return await DBService.query(sql, [...filterValues], { nestTables: true });
    };

    findOne = async(id) => {
        const sql = `
        SELECT 
            hangout_request_id, request_status, purpose, 
            meetup_at, meetup_spot_id, accepted_at,
            SENDER.erp, SENDER.first_name, SENDER.last_name, SENDER.profile_picture_url, SENDER.program_id, SENDER.graduation_year,
            RECEIVER.erp, RECEIVER.first_name, RECEIVER.last_name, RECEIVER.profile_picture_url, RECEIVER.program_id, RECEIVER.graduation_year
        FROM ${tables.HangoutRequests} AS hangout_request
        INNER JOIN ${tables.Students} AS sender ON hangout_request.sender_erp = SENDER.erp
        INNER JOIN ${tables.Students} AS receiver ON hangout_request.receiver_erp = RECEIVER.erp
        WHERE hangout_request_id = ?
        LIMIT 1`;

        const result = await DBService.query(sql, [id], {nestTables: true});

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