const { DBService } = require('../db/db-service');
const { multipleColumnSet, multipleFilterSet } = require('../utils/common.utils');
const { tables } = require('../utils/tableNames.utils');

class TimetableModel {

    findAll = async(filters) => {
        let sql = `SELECT * FROM ${tables.Timetables}`;

        if (!Object.keys(filters).length) {
            return await DBService.query(sql);
        }

        const { filterSet, filterValues } = multipleFilterSet(filters);
        sql += ` WHERE ${filterSet}`;

        return await DBService.query(sql, [...filterValues]);
    };

    findOne = async(id) => {
        const sql = `
            SELECT 
                T.timetable_id, T.student_erp, T.term_id, T.is_active,
                CL.class_erp, CL.semester, CL.parent_class_erp, CL.day_1, CL.day_2,
                CR.classroom_id, CR.classroom,
                    CP.campus_id, CP.campus,
                S.subject_code, S.subject,
                TR.teacher_id, TR.full_name, TR.average_rating, TR.total_reviews,
                TS1.timeslot_id, TS1.start_time, TS1.end_time, TS1.slot_number,
                TS2.timeslot_id, TS2.start_time, TS2.end_time, TS2.slot_number
            FROM ${tables.Timetables} AS T 
            NATURAL JOIN ${tables.TimetableClasses} AS TC
            INNER JOIN ${tables.Classes} AS CL ON CL.class_erp = TC.class_erp
            NATURAL JOIN ${tables.Classrooms} AS CR
            NATURAL JOIN ${tables.Campuses} AS CP
            NATURAL JOIN ${tables.Subjects} AS S
            NATURAL JOIN ${tables.Teachers} AS TR
            INNER JOIN ${tables.Timeslots} AS TS1 ON TS1.timeslot_id = CL.timeslot_1
            INNER JOIN ${tables.Timeslots} AS TS2 ON TS2.timeslot_id = CL.timeslot_2
            WHERE T.timetable_id = ?
        `;

        const result = await DBService.query(sql, [id]);

        return result;
    };

    create = async({ student_erp, term_id, is_active = 0 }) => {
        const valueSet = { student_erp, term_id, is_active };
        const { columnSet, values } = multipleColumnSet(valueSet);

        const sql = `INSERT INTO ${tables.Timetables} SET ${columnSet}`;

        const result = await DBService.query(sql, [...values]);
        const created_timetable = !result ? 0 : {
            timetable_id: result.insertId,
            affected_rows: result.affectedRows
        };

        return created_timetable;
    };

    update = async(columns, filters) => {
        const { columnSet, values } = multipleColumnSet(columns);
        const { filterSet, filterValues } = multipleFilterSet(filters);

        const sql = `UPDATE ${tables.Timetables} SET ${columnSet} WHERE ${filterSet}`;

        const result = await DBService.query(sql, [...values, ...filterValues]);

        return result;
    };

    delete = async(id) => {
        const sql = `DELETE FROM ${tables.Timetables}
        WHERE timetable_id = ?`;
        const result = await DBService.query(sql, [id]);
        const affectedRows = result ? result.affectedRows : 0;

        return affectedRows;
    };
}

module.exports = new TimetableModel;