const { DBService } = require('../db/db-service');
const { multipleColumnSet, multipleFilterSet } = require('../utils/common.utils');
const { tables } = require('../utils/tableNames.utils');

class TeacherReviewModel {

    findAll = async(filters) => {
        let sql = `
            SELECT 
                review_id, learning, grading, attendance, difficulty,
                overall_rating, comment, reviewed_at, teacher_id,
                subject.subject_code, subject.subject,
                reviewed_by.erp, reviewed_by.first_name, reviewed_by.last_name,
                reviewed_by.profile_picture_url, reviewed_by.program_id, reviewed_by.graduation_year
            FROM ${tables.TeacherReviews} AS teacher_review
            NATURAL JOIN ${tables.Subjects} AS subject
            INNER JOIN ${tables.Students} AS reviewed_by ON teacher_review.reviewed_by_erp = reviewed_by.erp
        `;

        if (!Object.keys(filters).length) {
            sql += ` ORDER BY reviewed_at DESC`;
            return await DBService.query(sql, [], { nestTables: true });
        }

        const { filterSet, filterValues } = multipleFilterSet(filters);
        sql += ` WHERE ${filterSet} ORDER BY reviewed_at DESC`;

        return await DBService.query(sql, [...filterValues], { nestTables: true });
    };

    findOne = async(id, details = false) => {
        let sql;
        if (details) {
            sql = `
                SELECT
                    review_id, learning, grading, attendance, difficulty,
                    overall_rating, comment, reviewed_at, teacher_id,
                    subject.subject_code, subject.subject,
                    reviewed_by.erp, reviewed_by.first_name, reviewed_by.last_name,
                    reviewed_by.profile_picture_url, reviewed_by.program_id, reviewed_by.graduation_year
                FROM ${tables.TeacherReviews} AS teacher_review
                NATURAL JOIN ${tables.Subjects} AS subject
                INNER JOIN ${tables.Students} AS reviewed_by ON teacher_review.reviewed_by_erp = reviewed_by.erp
                WHERE review_id = ?
                LIMIT 1
            `;
        } else {
            sql = `
                SELECT *
                FROM ${tables.TeacherReviews} AS teacher_review
                WHERE review_id = ?
                LIMIT 1
            `;
        }

        const result = await DBService.query(sql, [id], { nestTables: true });

        return result[0];
    };

    create = async({
        learning, grading, attendance, difficulty,
        overall_rating, comment, reviewed_at, subject_code, teacher_id, reviewed_by_erp
    }, transaction_conn = null) => {
        
        const valueSet = {
            learning, grading, attendance, difficulty,
            overall_rating, comment, reviewed_at, subject_code, teacher_id, reviewed_by_erp
        };
        const { columnSet, values } = multipleColumnSet(valueSet);

        const sql = `INSERT INTO ${tables.TeacherReviews} SET ${columnSet}`;

        const result = await DBService.query(sql, [...values], {transaction_conn: transaction_conn});
        const created_activity = !result ? 0 : {
            review_id: result.insertId,
            affected_rows: result.affectedRows
        };

        return created_activity;
    };

    delete = async(id, transaction_conn = null) => {
        const sql = `DELETE FROM ${tables.TeacherReviews}
        WHERE review_id = ?`;
        const result = await DBService.query(sql, [id], {transaction_conn: transaction_conn});
        const affectedRows = result ? result.affectedRows : 0;

        return affectedRows;
    };
}

module.exports = new TeacherReviewModel;