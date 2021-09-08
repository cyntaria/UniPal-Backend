const { DBService } = require('../db/db-service');
const { multipleColumnSet, multipleFilterSet } = require('../utils/common.utils');
const { tables } = require('../utils/tableNames.utils');

class OTPModel {

    findAll = async(filters = {}) => {
        let sql = `SELECT * FROM ${tables.OtpCodes}`;

        if (!Object.keys(filters).length) {
            return await DBService.query(sql);
        }

        const { filterSet, filterValues } = multipleFilterSet(filters);
        sql += ` WHERE ${filterSet}`;

        return await DBService.query(sql, [...filterValues]);
    }

    findOne = async(filters) => {
        const { filterSet, filterValues } = multipleFilterSet(filters);

        const sql = `SELECT * FROM ${tables.OtpCodes}
        WHERE ${filterSet}`;

        const result = await DBService.query(sql, [...filterValues]);

        return result[0];
    }

    create = async({ erp, OTP, expiration_datetime }) => {
        const valueSet = { erp, OTP, expiration_datetime };
        const { columnSet, values } = multipleColumnSet(valueSet);

        const sql = `INSERT INTO ${tables.OtpCodes} SET ${columnSet}`;

        const result = await DBService.query(sql, [...values]);
        const created_OTP = !result ? 0 : {
            affected_rows: result.affectedRows
        };

        return created_OTP;
    }

    update = async(expiration_datetime, erp) => {

        const sql = `UPDATE ${tables.OtpCodes}
        SET expiration_datetime = ?
        WHERE erp = ?`;

        const result = await DBService.query(sql, [expiration_datetime, erp]);

        return result;
    }

    delete = async(filters) => {
        const { columnSet, values } = multipleColumnSet(filters);

        const sql = `DELETE FROM ${tables.OtpCodes}
        WHERE ${columnSet}`;

        const result = await DBService.query(sql, [...values]);
        const affectedRows = result ? result.affectedRows : 0;

        return affectedRows;
    }
}

module.exports = new OTPModel;