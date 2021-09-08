const { DBService } = require('../db/db-service');
const { multipleColumnSet, multipleFilterSet } = require('../utils/common.utils');
const { Roles } = require('../utils/enums/roles.utils');
const { tables } = require('../utils/tableNames.utils');

class StudentModel {

    findAll = async(filters = {}) => {
        let sql = `SELECT * FROM ${tables.Students}`;

        if (!Object.keys(filters).length) {
            return await DBService.query(sql);
        }

        const { filterSet, filterValues } = multipleFilterSet(filters);
        sql += ` WHERE ${filterSet}`;

        return await DBService.query(sql, [...filterValues]);
    }

    findOne = async(filters) => {
        const { filterSet, filterValues } = multipleFilterSet(filters);

        const sql = `SELECT * FROM ${tables.Students}
        WHERE ${filterSet}`;

        const result = await DBService.query(sql, [...filterValues]);

        // return back the first row (student)
        return result[0];
    }

    // 24 fields
    create = async({ erp, first_name, last_name, gender, contact, email, birthday, password,
        profile_picture_url, graduation_year, uni_email, hobby_1, hobby_2, hobby_3,
        interest_1, interest_2, interest_3, program_id, campus_id, current_status,
        favourite_campus_hangout_spot, favourite_campus_activity, is_active = '1', role = Roles.ApiUser }) => {
        
        const valueSet = {
            erp, first_name, last_name,
            gender, contact, email, birthday,
            password, profile_picture_url, graduation_year, uni_email,
            hobby_1, hobby_2, hobby_3,
            interest_1, interest_2, interest_3,
            program_id, campus_id,
            current_status,
            favourite_campus_hangout_spot,
            favourite_campus_activity,
            is_active,
            role
        };
        const { columnSet, values } = multipleColumnSet(valueSet);

        const sql = `INSERT INTO ${tables.Students} SET ${columnSet}`;

        const result = await DBService.query(sql, [...values]);
        const created_student = !result ? 0 : {
            erp: erp,
            affected_rows: result.affectedRows
        };

        return created_student;
    }

    update = async(columns, filters) => {
        const { columnSet, values } = multipleColumnSet(columns);
        const { filterSet, filterValues } = multipleFilterSet(filters);

        const sql = `UPDATE ${tables.Students} SET ${columnSet} WHERE ${filterSet}`;

        const result = await DBService.query(sql, [...values, ...filterValues]);

        return result;
    }

    delete = async(erp) => {
        const sql = `DELETE FROM ${tables.Students}
        WHERE erp = ?`;
        const result = await DBService.query(sql, [erp]);
        const affectedRows = result ? result.affectedRows : 0;

        return affectedRows;
    }
}

module.exports = new StudentModel;