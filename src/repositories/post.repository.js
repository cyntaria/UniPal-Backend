const { successResponse } = require('../utils/responses.utils');

const PostModel = require('../models/post.model');
const {
    NotFoundException,
    CreateFailedException,
    UpdateFailedException,
    UnexpectedException
} = require('../utils/exceptions/database.exception');

class PostRepository {
    findAll = async(filters = {}) => {
        
        let postDuplicates = await PostModel.findAll(filters);
        if (!postDuplicates.length) {
            throw new NotFoundException('Posts not found');
        }

        let postsActualMap = {};
        let postsDuplicatesMap = {};

        for (const post of postDuplicates) {
            const { post_id } = post;
            const {
                resource_id, resource_url, resource_type,
                reaction_type_id, reaction_count,
                ...postDetails
            } = post;

            if (!postsDuplicatesMap[post_id]) { // if post not added to the object
                // mark true under the post_id
                postsDuplicatesMap[post_id] = {...postDetails};

                // add it to the object
                postsActualMap[post_id] = {...postDetails};

                // initialize post reactions
                if (reaction_type_id === null) postsActualMap[post_id].top_3_reactions = null;
                else {
                    postsActualMap[post_id].top_3_reactions = []; // for actual objects
                    postsDuplicatesMap[post_id].reactionsMap = {}; // for duplicate checks
                };

                // initialize post resources
                if (resource_id === null) postsActualMap[post_id].resources = null;
                else {
                    postsActualMap[post_id].resources = []; // for actual objects
                    postsDuplicatesMap[post_id].resourcesMap = {}; // for duplicate checks
                };
            }

            // load post reactions
            // if reaction not already inserted
            const reactionNotInserted = !postsDuplicatesMap[post_id].reactionsMap[reaction_type_id];
            if (reaction_type_id !== null && reactionNotInserted) {
                // mark true under the reaction_type_id
                postsDuplicatesMap[post_id].reactionsMap[reaction_type_id] = true;

                // insert reaction into list
                postsActualMap[post_id].top_3_reactions.push({
                    reaction_type_id,
                    reaction_count
                });
            }

            // load post resources
            // if resource not already inserted
            const resourceNotInserted = !postsDuplicatesMap[post_id].resourcesMap[resource_id];
            if (resource_id !== null && resourceNotInserted) {
                // mark true under the resource_id
                postsDuplicatesMap[post_id].resourcesMap[resource_id] = true;

                // insert resource into list
                postsActualMap[post_id].resources.push({
                    resource_id,
                    resource_url,
                    resource_type
                });
            }
        }

        const postsList = Object.values(postsActualMap);

        return successResponse(postsList);
    };

    findOne = async(filters) => {
        const postDuplicates = await PostModel.findOne(filters);
        if (!postDuplicates) {
            throw new NotFoundException('Post not found');
        }

        let postBody = {};

        for (const post of postDuplicates) {
            const {
                resource_id, resource_url, resource_type,
                reaction_type_id, reaction_count,
                ...postDetails
            } = post;
    
            if (Object.keys(postBody).length === 0) postBody = postDetails;

            // initialize post reactions
            if (reaction_type_id === null) postBody.top_3_reactions = null;
            else {
                postBody.top_3_reactions = []; // for actual objects
                postBody.reactionsMap = {}; // for duplicate checks
            };
    
            // initialize post resources
            if (resource_id === null) postBody.resources = null;
            else {
                postBody.resources = []; // for actual objects
                postBody.resourcesMap = {}; // for duplicate checks
            };
    
            // load post reactions
            // if reaction not already inserted
            const reactionNotInserted = !postBody.reactionsMap[reaction_type_id];
            if (reaction_type_id !== null && reactionNotInserted) {
                // mark true under the reaction_type_id
                postBody.reactionsMap[reaction_type_id] = true;
    
                // insert reaction into list
                postBody.top_3_reactions.push({
                    reaction_type_id,
                    reaction_count
                });
            }
    
            // load post resources
            // if resource not already inserted
            const resourceNotInserted = !postBody.resourcesMap[resource_id];
            if (resource_id !== null && resourceNotInserted) {
                // mark true under the resource_id
                postBody.resourcesMap[resource_id] = true;
    
                // insert resource into list
                postBody.resources.push({
                    resource_id,
                    resource_url,
                    resource_type
                });
            }
        }

        delete postBody.reactionsMap;
        delete postBody.resourcesMap;

        return successResponse(postBody);
    };

    findAllReactionsByPost = async(id, filters) => {
        let postReactions = await PostModel.findAllReactionsByPost(id, filters);
        if (!postReactions.length) {
            throw new NotFoundException('Post reactions not found');
        }

        return successResponse(postReactions);
    };

    create = async(body) => {
        const result = await PostModel.create(body);

        if (!result) {
            throw new CreateFailedException('Post failed to be created');
        }

        return successResponse(result, 'Post was created!');
    };

    update = async(body, id) => {
        const result = await PostModel.update(body, id);

        if (!result) {
            throw new UnexpectedException('Something went wrong');
        }

        const { affectedRows, changedRows, info } = result;

        if (!affectedRows) throw new NotFoundException('Post not found');
        else if (affectedRows && !changedRows) throw new UpdateFailedException('Post update failed');
        
        const responseBody = {
            rows_matched: affectedRows,
            rows_changed: changedRows,
            info
        };

        return successResponse(responseBody, 'Post updated successfully');
    };

    delete = async(id) => {
        const result = await PostModel.delete(id);
        if (!result) {
            throw new NotFoundException('Post not found');
        }

        const responseBody = {
            rows_removed: result
        };

        return successResponse(responseBody, 'Post has been deleted');
    };
}

module.exports = new PostRepository;