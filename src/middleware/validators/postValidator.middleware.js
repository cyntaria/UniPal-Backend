const { body, query } = require('express-validator');
const { Privacy } = require('../../utils/enums/privacy.utils');
const { ResourceType } = require('../../utils/enums/resourceType.utils');
const { RequestMethods } = require('../../utils/enums/requestMethods.utils');
const { ERPRegex, datetimeRegex } = require('../../utils/common.utils');
const PostModel = require('../../models/post.model');
const { NotFoundException } = require('../../utils/exceptions/database.exception');

exports.createPostSchema = [
    body('body')
        .trim()
        .exists()
        .withMessage('Content body is required'),
    body('privacy')
        .trim()
        .exists()
        .withMessage('Privacy is required')
        .isIn([...Object.values(Privacy)])
        .withMessage('Invalid Privacy'),
    body('author_erp')
        .trim()
        .exists()
        .withMessage('Author ERP is required')
        .matches(ERPRegex)
        .withMessage('ERP must be 5 digits'),
    body('posted_at')
        .trim()
        .exists()
        .withMessage('Posting datetime is required')
        .matches(datetimeRegex)
        .withMessage('Posting datetime should be valid datetime of format \'YYYY-MM-DD HH:mm:ss\''),
    body('resources')
        .exists()
        .withMessage('Post resources is required')
        .bail()
        .isArray()
        .withMessage('Resources must be an array like [{resource_url : "www.some-media.com", resource_type: \'image\'},{...}]')
        .bail(),
    body('resources.*.resource_url')
        .trim()
        .exists()
        .withMessage('URL is required for each resource')
        .bail()
        .isURL()
        .withMessage('Invalid Resource URL found'),
    body('resources.*.resource_type')
        .trim()
        .exists()
        .withMessage('ResourceType is required for each resource')
        .bail()
        .isIn([...Object.values(ResourceType)])
        .withMessage('Invalid ResourceType')
];

exports.updatePostSchema = [
    body('body')
        .optional()
        .trim(),
    body('privacy')
        .optional()
        .trim()
        .isIn([...Object.values(Privacy)])
        .withMessage('Invalid Privacy'),
    body()
        .custom(value => {
            return Object.keys(value).length !== 0;
        })
        .withMessage('Please provide required fields to update')
        .custom(value => {
            const updates = Object.keys(value);
            const allowUpdates = ['body', 'privacy'];
            return updates.every(update => allowUpdates.includes(update));
        })
        .withMessage('Invalid updates!')
];

exports.getPostsQuerySchema = [
    query('privacy')
        .optional()
        .trim()
        .isIn([...Object.values(Privacy)])
        .withMessage('Invalid Privacy'),
    query('author_erp')
        .optional()
        .trim()
        .matches(ERPRegex)
        .withMessage('ERP must be 5 digits'),
    query()
        .custom(value => {
            const queryParams = Object.keys(value);
            const allowParams = ['privacy', 'author_erp'];
            return queryParams.every(param => allowParams.includes(param));
        })
        .withMessage('Invalid query params!')
];

exports.postOwnerCheck = async(req) => {
    const post_id = req.params.id;
    const student = req.currentStudent;

    if (req.method === RequestMethods.POST) {
        return req.body.author_erp === student.erp;
    }

    const post = await PostModel.findOne({post_id});
    if (!post) {
        throw new NotFoundException('Post not found');
    }

    return post.author_erp === student.erp;
};