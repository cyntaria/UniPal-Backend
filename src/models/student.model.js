const { DBService } = require('../db/db-service');
const { multipleColumnSet, multipleFilterSet } = require('../utils/common.utils');
const { Roles } = require('../utils/enums/roles.utils');
const { tables } = require('../utils/tableNames.utils');

class StudentModel {

    findAll = async(filters, myERP) => {
        let sql = `SELECT *
        FROM ${tables.Students} AS S
        LEFT OUTER JOIN ${tables.StudentConnections} AS SC
        ON (S.erp = SC.sender_erp AND SC.receiver_erp = ?) OR (S.erp = SC.receiver_erp AND SC.sender_erp = ?)
        WHERE S.erp != ?`;

        if (!Object.keys(filters).length) {
            return await DBService.query(sql, [myERP, myERP, myERP]);
        }

        const { filterSet, filterValues } = multipleFilterSet(filters);
        sql += ` AND ${filterSet}`;

        return await DBService.query(sql, [myERP, myERP, myERP, ...filterValues]);
    }

    findOne = async(erp) => {
        const sql = `SELECT * 
        FROM ${tables.Students}
        WHERE erp = ?
        LIMIT 1`;

        const result = await DBService.query(sql, [erp]);

        // return back the first row (student)
        return result[0];
    }

    findOtherStudent = async(erp, myERP) => {
        const sql = `SELECT *
        FROM ${tables.Students} AS S
        LEFT OUTER JOIN ${tables.StudentConnections} AS SC
        ON (S.erp = SC.sender_erp AND SC.receiver_erp = ?) OR (S.erp = SC.receiver_erp AND SC.sender_erp = ?)
        WHERE S.erp = ?
        LIMIT 1`;

        const result = await DBService.query(sql, [myERP, myERP, erp]);

        // return back the first row (student)
        return result[0];
    }

    findAllOrganizedActivitiesByStudent = async(organizer_erp, filters) => {

        let sql = `SELECT * 
        FROM ${tables.Activities}
        WHERE organizer_erp = ?`;

        if (!Object.keys(filters).length) {
            return await DBService.query(sql, [organizer_erp]);
        }

        const { filterSet, filterValues } = multipleFilterSet(filters);
        sql += ` AND ${filterSet}`;

        const result = await DBService.query(sql, [organizer_erp, ...filterValues]);

        return result;
    }

    findAllAttendedActivitiesByStudent = async(student_erp, filters) => {
        let sql = `SELECT *
        FROM ${tables.ActivityAttendees}
        NATURAL JOIN ${tables.Activities}
        WHERE student_erp = ?`;

        if (!Object.keys(filters).length) {
            return await DBService.query(sql, [student_erp]);
        }

        const { filterSet, filterValues } = multipleFilterSet(filters);
        sql += ` AND ${filterSet}`;

        const result = await DBService.query(sql, [student_erp, ...filterValues]);

        return result;
    }

    findAllSavedActivitiesByStudent = async(student_erp, filters) => {
        let sql = `SELECT * 
        FROM ${tables.SavedActivities} AS sa
        INNER JOIN ${tables.Activities} AS a
        ON sa.activity_id = a.activity_id
        WHERE student_erp = ?`;

        if (!Object.keys(filters).length) {
            return await DBService.query(sql, [student_erp]);
        }

        const { filterSet, filterValues } = multipleFilterSet(filters);
        sql += ` AND ${filterSet}`;

        const result = await DBService.query(sql, [student_erp, ...filterValues]);

        return result;
    }

    // 24 fields
    create = async({ erp, first_name, last_name, gender, contact, birthday, password,
        profile_picture_url, graduation_year, uni_email, program_id, campus_id, is_active = '1', role = Roles.ApiUser }) => {
        
        const valueSet = {
            erp, first_name, last_name,
            gender, contact, birthday,
            password, profile_picture_url, graduation_year, uni_email,
            program_id, campus_id,
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

    update = async(columns, erp) => {
        const { columnSet, values } = multipleColumnSet(columns);

        const sql = `UPDATE ${tables.Students} SET ${columnSet} WHERE erp = ?`;

        const result = await DBService.query(sql, [...values, erp]);

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