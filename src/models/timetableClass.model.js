const { DBService } = require('../db/db-service');
const { multipleColumnSet, multipleFilterSet } = require('../utils/common.utils');
const { tables } = require('../utils/tableNames.utils');

class TimetableClassModel {

    create = async({ timetable_id, class_erp }) => {
        const valueSet = { timetable_id, class_erp };
        const { columnSet, values } = multipleColumnSet(valueSet);

        const sql = `INSERT INTO ${tables.TimetableClasses} SET ${columnSet}`;

        const result = await DBService.query(sql, [...values]);
        const created_timetable_class = !result ? 0 : {
            affected_rows: result.affectedRows
        };

        return created_timetable_class;
    };

    createMany = async(added_classes, transaction_conn = null) => {

        const sql = `INSERT INTO ${tables.TimetableClasses} (
            timetable_id, class_erp
        ) VALUES ?`;
        
        const result = await DBService.query(sql, [added_classes], {multiple: true, transaction_conn: transaction_conn});
        const affectedRows = result ? result.affectedRows : 0;

        return affectedRows;
    };

    delete = async(filters) => {
        const { filterSet, filterValues } = multipleFilterSet(filters);

        const sql = `DELETE FROM ${tables.TimetableClasses}
        WHERE ${filterSet}`;

        const result = await DBService.query(sql, [...filterValues]);
        const affectedRows = result ? result.affectedRows : 0;

        return affectedRows;
    };

    deleteMany = async(removed_classes, id, transaction_conn = null) => {
        const sql = `DELETE FROM ${tables.TimetableClasses}
        WHERE timetable_id = ? AND class_erp IN (?)`;

        const result = await DBService.query(sql, [id, removed_classes], {multiple: true, transaction_conn: transaction_conn});
        const affectedRows = result ? result.affectedRows : 0;

        return affectedRows;
    };
}

module.exports = new TimetableClassModel;