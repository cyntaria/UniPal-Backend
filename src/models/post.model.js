const { DBService } = require('../db/db-service');
const { multipleColumnSet, multipleFilterSet } = require('../utils/common.utils');
const { tables } = require('../utils/tableNames.utils');

class PostModel {

    static topNReactions = 3;

    findAll = async(filters) => {
        let sql = `
            SELECT 
                P.post_id, P.body, P.privacy, P.author_erp, P.posted_at,
                PU.resource_id, PU.resource_type, PU.resource_url,
                PR.reaction_type_id, PR.reaction_count
            FROM ${tables.Posts} AS P
            LEFT OUTER JOIN ${tables.PostUploads} AS PU
            ON P.post_id = PU.post_id
            LEFT OUTER JOIN (
                SELECT 
                    post_id, reaction_type_id,
                    COUNT(reaction_type_id) AS reaction_count,
                    ROW_NUMBER() OVER (PARTITION BY post_id ORDER BY reaction_count DESC) as rank
                FROM ${tables.PostReactions}
                GROUP BY post_id, reaction_type_id
            ) AS PR
            ON P.post_id = PR.post_id
            WHERE PR.reaction_type_id IS NULL OR PR.rank <= ${PostModel.topNReactions}
            ORDER BY P.post_id, PR.reaction_count DESC
        `;

        if (!Object.keys(filters).length) {
            return await DBService.query(sql);
        }

        const { filterSet, filterValues } = multipleFilterSet(filters);
        sql += ` WHERE ${filterSet}`;

        return await DBService.query(sql, [...filterValues]);
    }

    findOne = async(filters) => {
        const { filterSet, filterValues } = multipleFilterSet(filters);

        const sql = `
            SELECT 
                P.post_id, P.body, P.privacy, P.author_erp, P.posted_at,
                PU.resource_id, PU.resource_type, PU.resource_url,
                PR.reaction_type_id, COUNT(PR.reaction_type_id) AS reaction_count
            FROM ${tables.Posts} AS P
            LEFT OUTER JOIN ${tables.PostUploads} AS PU
            ON P.post_id = PU.post_id
            LEFT OUTER JOIN ${tables.PostReactions} AS PR
            ON P.post_id = PR.post_id
            WHERE ${filterSet}
            GROUP BY PR.reaction_type_id
            ORDER BY reaction_count DESC
            LIMIT ${PostModel.topNReactions}
        `;

        const result = await DBService.query(sql, [...filterValues]);

        // return back the first row (post)
        return result[0];
    }

    findAllAttendeesByPost = async(post_id, filters) => {
        let sql = `SELECT post_id, student_erp, first_name, last_name, profile_picture_url, involvement_type 
        FROM ${tables.PostAttendees} AS a
        INNER JOIN ${tables.Students} AS s
        ON a.student_erp = s.erp
        WHERE post_id = ?`;

        if (!Object.keys(filters).length) {
            return await DBService.query(sql, [post_id]);
        }

        const { filterSet, filterValues } = multipleFilterSet(filters);
        sql += ` AND ${filterSet}`;

        const result = await DBService.query(sql, [post_id, ...filterValues]);

        return result;
    }

    create = async({
        title, location, privacy, frequency,
        monday = 0, tuesday = 0, wednesday = 0, thursday = 0, friday = 0, saturday = 0, sunday = 0,
        month_number, group_size, happens_at, additional_instructions = null,
        post_type_id, post_status_id, campus_spot_id = null, organizer_erp, created_at
    }) => {
        
        const valueSet = {
            title, location, privacy, frequency,
            monday, tuesday, wednesday, thursday, friday, saturday, sunday,
            month_number, group_size, happens_at, additional_instructions,
            post_type_id, post_status_id, campus_spot_id, organizer_erp, created_at
        };
        const { columnSet, values } = multipleColumnSet(valueSet);

        const sql = `INSERT INTO ${tables.Posts} SET ${columnSet}`;

        const result = await DBService.query(sql, [...values]);
        const created_post = !result ? 0 : {
            post_id: result.insertId,
            affected_rows: result.affectedRows
        };

        return created_post;
    }

    update = async(columns, id) => {
        const { columnSet, values } = multipleColumnSet(columns);

        const sql = `UPDATE ${tables.Posts} SET ${columnSet} WHERE post_id = ?`;

        const result = await DBService.query(sql, [...values, id]);

        return result;
    }

    delete = async(id) => {
        const sql = `DELETE FROM ${tables.Posts}
        WHERE post_id = ?`;
        const result = await DBService.query(sql, [id]);
        const affectedRows = result ? result.affectedRows : 0;

        return affectedRows;
    }
}

module.exports = new PostModel;