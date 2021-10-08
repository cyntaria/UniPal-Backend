const { body, query } = require('express-validator');
const { datetimeRegex, ERPRegex } = require('../../utils/common.utils');
const { RequestMethods } = require('../../utils/enums/requestMethods.utils');
const { ConnectionStatus } = require('../../utils/enums/connectionStatus.utils');
const FriendRequestModel = require('../../models/friendRequest.model');
const { NotFoundException } = require('../../utils/exceptions/database.exception');

exports.createFriendRequestSchema = [
    body('sender_erp')
        .trim()
        .exists()
        .withMessage('Sender ERP is required')
        .matches(ERPRegex)
        .withMessage('Sender ERP must be 5 digits'),
    body('receiver_erp')
        .trim()
        .exists()
        .withMessage('Receiver ERP is required')
        .matches(ERPRegex)
        .withMessage('Receiver ERP must be 5 digits')
        .custom((receiver_erp, {req}) => req.body.sender_erp !== receiver_erp)
        .withMessage('Sender and receiver ERP can\'t be the same'),
    body('sent_at')
        .trim()
        .exists()
        .withMessage('Sent datetime is required')
        .matches(datetimeRegex)
        .withMessage('Sent datetime should be valid datetime of format \'YYYY-MM-DD HH:mm:ss\'')
];

exports.updateFriendRequestSchema = [
    body('connection_status')
        .trim()
        .exists()
        .withMessage('Connection status is required')
        .isIn([...Object.values(ConnectionStatus)])
        .withMessage('Invalid Connection Status')
        .custom((connection_status, {req}) => {
            if (connection_status === ConnectionStatus.Friends) {
                return req.body.accepted_at !== undefined;
            }
            return true;
        })
        .withMessage('\'friends\' connection status requires \'accepted_at\' datetime'),
    body('accepted_at')
        .optional({ nullable: true })
        .trim()
        .matches(datetimeRegex)
        .withMessage('Accepted datetime should be valid datetime of format \'YYYY-MM-DD HH:mm:ss\'')
        .custom((accepted_at, {req}) => req.body.connection_status === ConnectionStatus.Friends)
        .withMessage('\'accepted_at\' datetime can only be set for \'friends\' connection status'),
    body()
        .custom(value => {
            return Object.keys(value).length !== 0;
        })
        .withMessage('Please provide required fields to update')
        .custom(value => {
            const updates = Object.keys(value);
            const allowUpdates = ["accepted_at", "connection_status"];
            return updates.every(update => allowUpdates.includes(update));
        })
        .withMessage('Invalid updates!')
];

exports.getFriendRequestQuerySchema = [
    query('sender_erp')
        .optional()
        .trim()
        .matches(ERPRegex)
        .withMessage('Sender ERP must be 5 digits'),
    query('receiver_erp')
        .optional()
        .trim()
        .matches(ERPRegex)
        .withMessage('Receiver ERP must be 5 digits')
        .custom((receiver_erp, {req}) => req.query.sender_erp === undefined)
        .withMessage('Can\'t specify both sender and receiver erp'),
    query()
        .custom(value => {
            return Object.keys(value).length !== 0;
        })
        .withMessage('Either sender or receiver erp is required')
        .custom(value => {
            const queryParams = Object.keys(value);
            const allowParams = ['sender_erp', 'receiver_erp'];
            return queryParams.every(param => allowParams.includes(param));
        })
        .withMessage('Invalid query params!')
];

exports.friendRequestOwnerCheck = async(req) => {
    const student = req.currentStudent;

    if (req.method === RequestMethods.POST) {
        return req.body.sender_erp === student.erp;
    }

    if (req.params.id === undefined){
        if (req.query.sender_erp) return req.query.sender_erp === student.erp;
        else if (req.query.receiver_erp) return req.query.receiver_erp === student.erp;
    }

    const friend_request_id = req.params.id;

    const friendRequest = await FriendRequestModel.findOne(friend_request_id);
    if (!friendRequest) {
        throw new NotFoundException('Friend request not found');
    }

    const isSender = friendRequest.sender_erp === student.erp;
    const isReceiver = friendRequest.receiver_erp === student.erp;
    
    if (req.method === RequestMethods.PATCH) {
        return isReceiver;
    }

    return isSender || isReceiver;
};