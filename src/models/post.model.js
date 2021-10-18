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

    findAllReactionsByPost = async(post_id, filters) => {
        let sql = `SELECT post_id, reaction_type_id, student_erp, reacted_at 
        FROM ${tables.PostReactions}
        WHERE post_id = ?`;

        if (!Object.keys(filters).length) {
            return await DBService.query(sql, [post_id]);
        }

        const { filterSet, filterValues } = multipleFilterSet(filters);
        sql += ` AND ${filterSet}`;

        const result = await DBService.query(sql, [post_id, ...filterValues]);

        return result;
    }

    create = async({ body, privacy, author_erp, posted_at }) => {
        
        const valueSet = { body, privacy, author_erp, posted_at };
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