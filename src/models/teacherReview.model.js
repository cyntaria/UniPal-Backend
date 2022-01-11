const { DBService } = require('../db/db-service');
const { multipleColumnSet, multipleFilterSet } = require('../utils/common.utils');
const { tables } = require('../utils/tableNames.utils');

class TeacherReviewModel {

    findAll = async(filters) => {
        let sql = `
            SELECT 
                review_id, learning, grading, attendance, difficulty,
                overall_rating, comment, reviewed_at, subject_code, teacher_id, reviewed_by_erp
            FROM ${tables.TeacherReviews} AS TR
            NATURAL JOIN ${tables.Teachers}
            NATURAL JOIN ${tables.Subjects}
            INNER JOIN ${tables.Students} AS ST ON TR.reviewed_by_erp = ST.erp
        `;

        if (!Object.keys(filters).length) {
            sql += ` ORDER BY reviewed_at DESC`;
            return await DBService.query(sql);
        }

        const { filterSet, filterValues } = multipleFilterSet(filters);
        sql += ` WHERE ${filterSet} ORDER BY reviewed_at DESC`;

        return await DBService.query(sql, [...filterValues]);
    };

    findOne = async(id) => {
        const sql = `
            SELECT
                review_id, learning, grading, attendance, difficulty,
                overall_rating, comment, reviewed_at, subject_code, teacher_id, reviewed_by_erp
            FROM ${tables.TeacherReviews} AS TR
            NATURAL JOIN ${tables.Teachers}
            NATURAL JOIN ${tables.Subjects}
            INNER JOIN ${tables.Students} AS ST ON TR.reviewed_by_erp = ST.erp
            WHERE review_id = ?
        `;

        const result = await DBService.query(sql, [id]);

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