const { body, query } = require('express-validator');
const { datetimeRegex, ERPRegex } = require('../../utils/common.utils');
const { RequestMethods } = require('../../utils/enums/requestMethods.utils');
const { HangoutRequestStatus } = require('../../utils/enums/hangoutRequestStatus.utils');
const HangoutRequestModel = require('../../models/hangoutRequest.model');
const { NotFoundException } = require('../../utils/exceptions/database.exception');

exports.createHangoutRequestSchema = [
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
        .custom((receiver_erp, { req }) => req.body.sender_erp !== receiver_erp)
        .withMessage('Sender and receiver ERP can\'t be the same'),
    body('purpose')
        .trim()
        .exists()
        .withMessage('Purpose is required')
        .isLength({ max: 50 })
        .withMessage('Additional directions should be less than 50 characters'),
    body('meetup_at')
        .trim()
        .exists()
        .withMessage('Meetup datetime is required')
        .matches(datetimeRegex)
        .withMessage('Meetup datetime should be valid datetime of format \'YYYY-MM-DD HH:mm:ss\''),
    body('meetup_spot_id')
        .trim()
        .exists()
        .withMessage('Meetup spot is required')
        .isInt({ min: 1 })
        .withMessage('Invalid Meetup Spot ID found')
];

exports.updateHangoutRequestSchema = [
    body('request_status')
        .trim()
        .exists()
        .withMessage('Hangout status is required')
        .isIn([...Object.values(HangoutRequestStatus)])
        .withMessage('Invalid Hangout Status')
        .custom((request_status, { req }) => {
            if (request_status !== HangoutRequestStatus.RequestPending) {
                return req.body.accepted_at !== undefined;
            }
            return true;
        })
        .withMessage('\'accepted\'/\'rejected\' request status requires \'accepted_at\' datetime'),
    body('accepted_at')
        .optional({ nullable: true })
        .trim()
        .matches(datetimeRegex)
        .withMessage('Accepted datetime should be valid datetime of format \'YYYY-MM-DD HH:mm:ss\'')
        .custom((accepted_at, { req }) => {
            return req.body.request_status === HangoutRequestStatus.Accepted ||
                req.body.request_status === HangoutRequestStatus.Rejected;
        })
        .withMessage('\'accepted_at\' datetime can only be set for \'accepeted\'/\'rejected\' request status'),
    body()
        .custom(value => {
            return Object.keys(value).length !== 0;
        })
        .withMessage('Please provide required fields to update')
        .custom(value => {
            const updates = Object.keys(value);
            const allowUpdates = ["accepted_at", "request_status"];
            return updates.every(update => allowUpdates.includes(update));
        })
        .withMessage('Invalid updates!')
];

exports.getHangoutRequestQuerySchema = [
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
        .custom((receiver_erp, { req }) => req.query.sender_erp === undefined)
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

exports.hangoutRequestOwnerCheck = async (req) => {
    const student = req.currentStudent;

    if (req.method === RequestMethods.POST) {
        return req.body.sender_erp === student.erp;
    }

    if (req.params.id === undefined) {
        if (req.query.sender_erp) return req.query.sender_erp === student.erp;
        else if (req.query.receiver_erp) return req.query.receiver_erp === student.erp;
    }

    const hangout_request_id = req.params.id;

    const hangoutRequest = await HangoutRequestModel.findOne(hangout_request_id);
    if (!hangoutRequest) {
        throw new NotFoundException('Hangout request not found');
    }

    const isSender = hangoutRequest.sender.erp === student.erp;
    const isReceiver = hangoutRequest.receiver.erp === student.erp;

    if (req.method === RequestMethods.PATCH) {
        return isReceiver;
    } else if (req.method === RequestMethods.DELETE) {
        return isSender;
    }

    return isSender || isReceiver;
};