const { successResponse } = require('../utils/responses.utils');

const { DBTransaction } = require('../db/db-transaction');
const PostModel = require('../models/post.model');
const PostResourceModel = require('../models/postResource.model');
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

        let postsActualMap = new Map();
        let postsDuplicatesMap = new Map();

        for (const post of postDuplicates) {
            const { post_id } = post;
            const {
                resource_id, resource_url, resource_type,
                reaction_type_id, reaction_count,
                ...postDetails
            } = post;

            if (!postsDuplicatesMap.has(post_id)) { // if post not added to the object
                // mark true under the post_id
                postsDuplicatesMap.set(post_id, {...postDetails});

                // add it to the object
                postsActualMap.set(post_id, {...postDetails});

                // initialize post reactions
                if (reaction_type_id === null) postsActualMap.get(post_id).top_3_reactions = null;
                else {
                    postsActualMap.get(post_id).top_3_reactions = []; // for actual objects
                    postsDuplicatesMap.get(post_id).reactionsMap = new Map(); // for duplicate checks
                };

                // initialize post resources
                if (resource_id === null) postsActualMap.get(post_id).resources = null;
                else {
                    postsActualMap.get(post_id).resources = []; // for actual objects
                    postsDuplicatesMap.get(post_id).resourcesMap = new Map(); // for duplicate checks
                };
            }

            // load post reactions
            if (reaction_type_id !== null) {
                // if reaction not already inserted
                const reactionNotInserted = !postsDuplicatesMap.get(post_id).reactionsMap.has(reaction_type_id);

                if (reactionNotInserted) {
                    // mark true under the reaction_type_id
                    postsDuplicatesMap.get(post_id).reactionsMap.set(reaction_type_id, true);
    
                    // insert reaction into list
                    postsActualMap.get(post_id).top_3_reactions.push({
                        reaction_type_id,
                        reaction_count
                    });
                }
            }

            // load post resources
            if (resource_id !== null) {
                // if resource not already inserted
                const resourceNotInserted = !postsDuplicatesMap.get(post_id).resourcesMap.has(resource_id);

                if (resourceNotInserted) {
                    // mark true under the resource_id
                    postsDuplicatesMap.get(post_id).resourcesMap.set(resource_id, true);
    
                    // insert resource into list
                    postsActualMap.get(post_id).resources.push({
                        resource_id,
                        resource_url,
                        resource_type
                    });
                }

            }
        }

        const postsList = [...postsActualMap.values()];

        return successResponse(postsList);
    };

    findOne = async(id) => {
        const postDuplicates = await PostModel.findOneWithDetails(id);
        if (!postDuplicates.length) {
            throw new NotFoundException('Post not found');
        }

        let postBody = {};

        for (const post of postDuplicates) {
            const {
                resource_id, resource_url, resource_type,
                reaction_type_id, reaction_count,
                ...postDetails
            } = post;
    
            if (Object.keys(postBody).length === 0) { // if post details not added
                // add post details
                postBody = postDetails;

                // initialize post reactions
                if (reaction_type_id === null) postBody.top_3_reactions = null;
                else {
                    postBody.top_3_reactions = []; // for actual objects
                    postBody.reactionsMap = new Map(); // for duplicate checks
                };
        
                // initialize post resources
                if (resource_id === null) postBody.resources = null;
                else {
                    postBody.resources = []; // for actual objects
                    postBody.resourcesMap = new Map(); // for duplicate checks
                };
            }
    
            // load post reactions
            if (reaction_type_id !== null) {
                // if reaction not already inserted
                const reactionNotInserted = !postBody.reactionsMap.has(reaction_type_id);

                if (reactionNotInserted) {
                    // mark true under the reaction_type_id
                    postBody.reactionsMap.set(reaction_type_id, true);
        
                    // insert reaction into list
                    postBody.top_3_reactions.push({
                        reaction_type_id,
                        reaction_count
                    });
                }
            }
    
            // load post resources
            if (resource_id !== null) {
                // if resource not already inserted
                const resourceNotInserted = !postBody.resourcesMap.has(resource_id);

                if (resourceNotInserted) {
                    // mark true under the resource_id
                    postBody.resourcesMap.set(resource_id, true);
        
                    // insert resource into list
                    postBody.resources.push({
                        resource_id,
                        resource_url,
                        resource_type
                    });
                }
            }
        }

        delete postBody.reactionsMap;
        delete postBody.resourcesMap;

        return successResponse(postBody);
    };

    findAllReactionsByPost = async(id) => {
        let postReactions = await PostModel.findAllReactionsByPost(id);
        if (!postReactions.length) {
            throw new NotFoundException('Post reactions not found');
        }

        return successResponse(postReactions);
    };

    create = async(body) => {
        const {resources, ...postBody} = body;

        const transaction = await DBTransaction.begin();
        let result;

        try {
            result = await PostModel.create(postBody, transaction.connection);

            if (!result) {
                throw new CreateFailedException('Post failed to be created');
            }

            const { post_id } = result;

            for (const resource of resources) {
                const postResource = {
                    post_id,
                    resource_url: resource.resource_url,
                    resource_type: resource.resource_type
                };
                const success = await PostResourceModel.create(postResource, transaction.connection);
                if (!success) {
                    throw new CreateFailedException(`Post resource(id: ${resource.resource_url}, resource_type: ${resource.resource_type}) failed to be created`);
                }
            }
        } catch (ex) {
            await transaction.rollback();
            throw ex;
        }

        await transaction.commit();

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