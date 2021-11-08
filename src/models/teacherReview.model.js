const { DBService } = require('../db/db-service');
const { multipleColumnSet, multipleFilterSet } = require('../utils/common.utils');
const { tables } = require('../utils/tableNames.utils');

class TeacherReviewModel {

    findAll = async(filters) => {
        let sql = `SELECT * FROM ${tables.TeacherReviews}`;

        if (!Object.keys(filters).length) {
            return await DBService.query(sql);
        }

        const { filterSet, filterValues } = multipleFilterSet(filters);
        sql += ` WHERE ${filterSet}`;

        return await DBService.query(sql, [...filterValues]);
    }

    findOne = async(id) => {
        const sql = `SELECT * FROM ${tables.TeacherReviews}
        WHERE review_id = ?
        LIMIT 1`;

        const result = await DBService.query(sql, [id]);

        return result[0];
    }

    create = async({
        learning, grading, attendance, difficulty,
        overall_rating, comment, reviewed_at, subject_code, teacher_id, reviewed_by_erp
    }) => {
        
        const valueSet = {
            learning, grading, attendance, difficulty,
            overall_rating, comment, reviewed_at, subject_code, teacher_id, reviewed_by_erp
        };
        const { columnSet, values } = multipleColumnSet(valueSet);

        const sql = `INSERT INTO ${tables.TeacherReviews} SET ${columnSet}`;

        const result = await DBService.query(sql, [...values]);
        const created_activity = !result ? 0 : {
            review_id: result.insertId,
            affected_rows: result.affectedRows
        };

        return created_activity;
    }

    update = async(columns, id) => {
        const { columnSet, values } = multipleColumnSet(columns);

        const sql = `UPDATE ${tables.TeacherReviews} SET ${columnSet} WHERE review_id = ?`;

        const result = await DBService.query(sql, [...values, id]);

        return result;
    }

    delete = async(id) => {
        const sql = `DELETE FROM ${tables.TeacherReviews}
        WHERE review_id = ?`;
        const result = await DBService.query(sql, [id]);
        const affectedRows = result ? result.affectedRows : 0;

        return affectedRows;
    }
}

module.exports = new TeacherReviewModel;