const { DBService } = require('../db/db-service');
const { multipleColumnSet, multipleFilterSet } = require('../utils/common.utils');
const { tables } = require('../utils/tableNames.utils');

class PostModel {

    static topNReactions = 3;

    findAll = async(filters) => {
        let sql = `
            SELECT 
                P.post_id, P.body, P.privacy, P.author_erp, P.posted_at,
                PR.reaction_type_id, PR.reaction_count,
                PRes.resource_id, PRes.resource_type, PRes.resource_url
            FROM ${tables.Posts} AS P
            LEFT OUTER JOIN ${tables.PostResources} AS PRes
            ON P.post_id = PRes.post_id
            LEFT OUTER JOIN (
                SELECT 
                    post_id, reaction_type_id,
                    COUNT(reaction_type_id) AS reaction_count,
                    (ROW_NUMBER() OVER (PARTITION BY post_id ORDER BY reaction_count DESC)) AS rank
                FROM ${tables.PostReactions}
                GROUP BY post_id, reaction_type_id
            ) AS PR
            ON P.post_id = PR.post_id
            WHERE (PR.reaction_type_id IS NULL OR PR.rank <= ${PostModel.topNReactions})
        `;

        if (!Object.keys(filters).length) {
            sql += ` ORDER BY P.posted_at DESC, P.post_id, PR.reaction_count DESC`;
            return await DBService.query(sql);
        }

        const { filterSet, filterValues } = multipleFilterSet(filters);
        sql += `
            AND ${filterSet}
            ORDER BY P.posted_at DESC, P.post_id, PR.reaction_count DESC
        `;

        return await DBService.query(sql, [...filterValues]);
    };

    findOne = async(filters) => {
        const { filterSet, filterValues } = multipleFilterSet(filters);

        const sql = `
            SELECT *
            FROM ${tables.Posts}
            WHERE ${filterSet}
        `;

        const result = await DBService.query(sql, [...filterValues]);

        return result[0];
    };

    findOneWithDetails = async(post_id) => {
        const sql = `
            SELECT 
                P.post_id, P.body, P.privacy, P.author_erp, P.posted_at,
                PR.reaction_type_id, PR.reaction_count, 
                PRes.resource_id, PRes.resource_type, PRes.resource_url
            FROM ${tables.Posts} AS P
            LEFT OUTER JOIN ${tables.PostResources} AS PRes
            ON P.post_id = PRes.post_id
            LEFT OUTER JOIN (
                SELECT 
                    post_id, reaction_type_id,
                    COUNT(reaction_type_id) AS reaction_count,
                    (ROW_NUMBER() OVER (PARTITION BY post_id ORDER BY reaction_count DESC)) AS rank
                FROM ${tables.PostReactions}
                GROUP BY post_id, reaction_type_id
            ) AS PR
            ON P.post_id = PR.post_id
            WHERE P.post_id = ? AND (PR.reaction_type_id IS NULL OR PR.rank <= ${PostModel.topNReactions})
            ORDER BY PR.reaction_count DESC
        `;

        const result = await DBService.query(sql, [post_id]);

        return result;
    };

    findAllReactionsByPost = async(post_id) => {
        let sql = `SELECT * 
        FROM ${tables.PostReactions}
        WHERE post_id = ?
        ORDER BY reacted_at DESC`;

        const result = await DBService.query(sql, [post_id]);

        return result;
    };

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
    };

    update = async(columns, id) => {
        const { columnSet, values } = multipleColumnSet(columns);

        const sql = `UPDATE ${tables.Posts} SET ${columnSet} WHERE post_id = ?`;

        const result = await DBService.query(sql, [...values, id]);

        return result;
    };

    delete = async(id) => {
        const sql = `DELETE FROM ${tables.Posts}
        WHERE post_id = ?`;
        const result = await DBService.query(sql, [id]);
        const affectedRows = result ? result.affectedRows : 0;

        return affectedRows;
    };
}

module.exports = new PostModel;