const { body, query } = require('express-validator');
const { datetimeRegex, ERPRegex } = require('../../utils/common.utils');
const { RequestMethods } = require('../../utils/enums/requestMethods.utils');
const { ConnectionStatus } = require('../../utils/enums/connectionStatus.utils');
const StudentConnectionModel = require('../../models/studentConnection.model');
const { NotFoundException } = require('../../utils/exceptions/database.exception');

exports.createConnectionRequestSchema = [
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

exports.updateConnectionRequestSchema = [
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

exports.getConnectionRequestQuerySchema = [
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

exports.getStudentConnectionQuerySchema = [
    query('erp')
        .trim()
        .exists()
        .withMessage('ERP is required')
        .matches(ERPRegex)
        .withMessage('ERP must be 5 digits'),
    query()
        .custom(value => {
            const queryParams = Object.keys(value);
            const allowParams = ['erp'];
            return queryParams.every(param => allowParams.includes(param));
        })
        .withMessage('Invalid query params!')
];

exports.connectionRequestOwnerCheck = async(req) => {
    const student = req.currentStudent;

    if (req.method === RequestMethods.POST) {
        return req.body.sender_erp === student.erp;
    }

    if (req.params.id === undefined){
        if (req.query.sender_erp) return req.query.sender_erp === student.erp;
        else if (req.query.receiver_erp) return req.query.receiver_erp === student.erp;
    }

    const student_connection_id = req.params.id;

    const connectionRequest = await StudentConnectionModel.findOne(student_connection_id);
    if (!connectionRequest) {
        throw new NotFoundException('Connection request not found');
    }

    const isSender = connectionRequest.sender_erp === student.erp;
    const isReceiver = connectionRequest.receiver_erp === student.erp;
    
    if (req.method === RequestMethods.PATCH) {
        return isReceiver;
    }

    return isSender || isReceiver;
};