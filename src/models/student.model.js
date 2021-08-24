const { DBService } = require('../db/db-service');
const { multipleColumnSet, multipleFilterSet } = require('../utils/common.utils');
const { Roles } = require('../utils/enums/roles.utils');
const { tables } = require('../utils/tableNames.utils');

class StudentModel {

    findAll = async(params = {}) => {
        let sql = `SELECT * FROM ${tables.Students}`;

        if (!Object.keys(params).length) {
            return await DBService.query(sql);
        }

        const { filterSet, filterValues } = multipleFilterSet(params);
        sql += ` WHERE ${filterSet}`;

        return await DBService.query(sql, [...filterValues]);
    }

    findOne = async(params) => {
        const { filterSet, filterValues } = multipleFilterSet(params);

        const sql = `SELECT * FROM ${tables.Students}
        WHERE ${filterSet}`;

        const result = await DBService.query(sql, [...filterValues]);

        // return back the first row (student)
        return result[0];
    }

    // TODO: Check params for schema
    create = async({ full_name, email, password, role = Roles.User, contact, address }) => {
        const sql = `INSERT INTO ${tables.Students}
        (full_name, email, password, role, contact, address) VALUES (?,?,?,?,?,?)`;

        const result = await DBService.query(sql, [full_name, email, password, role, contact, address]);
        const created_student = !result ? 0 : {
            student_erp: result.insertId,
            affected_rows: result.affectedRows
        };

        return created_student;
    }

    update = async(params, filters) => {
        const { columnSet, values } = multipleColumnSet(params);
        const { filterSet, filterValues } = multipleFilterSet(filters);

        const sql = `UPDATE ${tables.Students} SET ${columnSet} WHERE ${filterSet}`;

        const result = await DBService.query(sql, [...values, ...filterValues]);

        return result;
    }

    delete = async(id) => {
        const sql = `DELETE FROM ${tables.Students}
        WHERE student_erp = ?`;
        const result = await DBService.query(sql, [id]);
        const affectedRows = result ? result.affectedRows : 0;

        return affectedRows;
    }
}

module.exports = new StudentModel;