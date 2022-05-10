/* eslint-disable no-undef */
const request = require("supertest");
const expect = require('chai').expect;
const jwt = require('jsonwebtoken');
const {Config} = require('../../src/configs/config');

describe("Hangout requests API", () => {
    const API = `/api/${Config.API_VERSION}`;
    const baseRoute = API + "/hangout-requests";
    const adminERP = '15030';
    const user2ERP = '17619';
    const userERP = '17855';
    const existingHangoutRequest = {
        hangout_request_id: 1,
        sender: {
            erp: userERP,
            first_name: "Abdur Rafay",
            last_name: "Saleem",
            profile_picture_url: "https://i.pinimg.com/564x/8d/e3/89/8de389c84e919d3577f47118e2627d95.jpg",
            program_id: 1,
            graduation_year: 2022
        },
        receiver: {
            erp: adminERP,
            first_name: "Mohammad Rafay",
            last_name: "Siddiqui",
            profile_picture_url: "https://i.pinimg.com/564x/8d/e3/89/8de389c84e919d3577f47118e2627d95.jpg",
            program_id: 1,
            graduation_year: 2022
        },
        purpose: 'Some purpose',
        request_status: 'request_pending',
        meetup_at: '2021-10-04 17:24:40',
        meetup_spot_id: 7,
        accepted_at: null
    };
    const unknownHangoutRequestId = 99999;
    const unknownStudentERP = 19999;
    const userToken = jwt.sign({erp: userERP}, Config.SECRET_JWT); // non expiry token
    const adminToken = jwt.sign({erp: adminERP}, Config.SECRET_JWT);

    beforeEach(() => {
        this.app = require('../../src/server').setup();
    });

    context("GET /hangout-requests", () => {

        it("Scenario 1: Get all hangout requests is successful (Sent)", async() => {
            // arrange
            const sender_erp = userERP;
            
            // act
            let res = await request(this.app)
                .get(`${baseRoute}?sender_erp=${sender_erp}`)
                .auth(userToken, { type: 'bearer' }); // userToken.erp === sender_erp
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            const resBody = res.body.body;
            expect(resBody).to.be.an('array');
            const queryCheck = hangoutRequest => hangoutRequest.sender.erp === sender_erp;
            expect(resBody.every(queryCheck)).to.be.true; // should match initially sent query params
            expect(resBody[0]).to.include.all.keys([
                'hangout_request_id',
                'sender',
                'receiver',
                'purpose',
                'request_status',
                'meetup_at',
                'meetup_spot_id',
                'accepted_at'
            ]);
            expect(resBody[0].sender).to.include.all.keys(Object.keys(existingHangoutRequest.sender));
            expect(resBody[0].receiver).to.include.all.keys(Object.keys(existingHangoutRequest.receiver));
        });

        it("Scenario 2: Get all hangout requests is successful (Receiver)", async() => {
            // arrange
            const receiver_erp = adminERP;
            
            // act
            let res = await request(this.app)
                .get(`${baseRoute}?receiver_erp=${receiver_erp}`)
                .auth(adminToken, { type: 'bearer' }); // adminToken.erp === receiver_erp
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            const resBody = res.body.body;
            expect(resBody).to.be.an('array');
            const queryCheck = hangoutRequest => hangoutRequest.receiver.erp === receiver_erp;
            expect(resBody.every(queryCheck)).to.be.true; // should match initially sent query params
            expect(resBody[0]).to.include.all.keys([
                'hangout_request_id',
                'sender',
                'receiver',
                'purpose',
                'request_status',
                'meetup_at',
                'meetup_spot_id',
                'accepted_at'
            ]);
            expect(resBody[0].sender).to.include.all.keys(Object.keys(existingHangoutRequest.sender));
            expect(resBody[0].receiver).to.include.all.keys(Object.keys(existingHangoutRequest.receiver));
        });

        it("Scenario 3: Get all hangout requests unsuccessful due to no (sent) hangout requests", async() => {
            // arrange
            const sender_erp = user2ERP;
            const fakeToken = jwt.sign({erp: sender_erp}, Config.SECRET_JWT);

            // act
            const res = await request(this.app)
                .get(`${baseRoute}?sender_erp=${sender_erp}`)
                .auth(fakeToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Hangout requests not found');
        });

        it("Scenario 4: Get all hangout requests unsuccessful due to no (received) hangout requests", async() => {
            // arrange
            const receiver_erp = user2ERP;
            const fakeToken = jwt.sign({erp: receiver_erp}, Config.SECRET_JWT);

            // act
            const res = await request(this.app)
                .get(`${baseRoute}?receiver_erp=${receiver_erp}`)
                .auth(fakeToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Hangout requests not found');
        });

        it("Scenario 5: Get all hangout requests is incorrect due to multiple query params", async() => {
            // arrange
            const sender_erp = userERP;
            const receiver_erp = user2ERP;

            // act
            let res = await request(this.app)
                .get(`${baseRoute}?sender_erp=${sender_erp}&receiver_erp=${receiver_erp}`) // <-- can't specify both sender_erp and receiver_erp
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(422);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('InvalidPropertiesException');
            const incorrectParams = res.body.headers.data.map(o => (o.param));
            expect(incorrectParams).to.include('receiver_erp');
            const incorrectMsg = res.body.headers.data.map(o => (o.msg));
            expect(incorrectMsg).to.include('Can\'t specify both sender and receiver erp');
        });

        it("Scenario 6: Get all hangout requests is incorrect due to no query params", async() => {
            // act
            let res = await request(this.app)
                .get(`${baseRoute}`) // <-- either specify sender_erp or receiver_erp
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(422);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('InvalidPropertiesException');
            const incorrectMsg = res.body.headers.data.map(o => (o.msg));
            expect(incorrectMsg).to.include('Either sender or receiver erp is required');
        });

        it("Scenario 7: Get all hangout requests is incorrect due to unknown query params", async() => {
            // arrange
            const sender_erp = '123'; // a valid erp is 5 digits

            // act
            let res = await request(this.app)
                .get(`${baseRoute}?sender_erp=${sender_erp}&request_status=accepted`) // <-- 'request_status' is invalid query param
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(422);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('InvalidPropertiesException');
            const incorrectParams = res.body.headers.data.map(o => (o.param));
            expect(incorrectParams).to.include('sender_erp');
            const incorrectMsg = res.body.headers.data.map(o => (o.msg));
            expect(incorrectMsg).to.include('Invalid query params!');
        });

        it("Scenario 8: Get request is forbidden due to querying other's sent hangout requests", async() => {
            // arrange
            const sender_erp = userERP;

            // act
            const res = await request(this.app)
                .get(`${baseRoute}?sender_erp=${sender_erp}`)
                .auth(adminToken, { type: 'bearer' }); // <-- adminToken.erp !== sender_erp
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 9: Get request is forbidden due to querying other's received hangout requests", async() => {
            // arrange
            const receiver_erp = userERP;

            // act
            const res = await request(this.app)
                .get(`${baseRoute}?receiver_erp=${receiver_erp}`)
                .auth(adminToken, { type: 'bearer' }); // <-- adminToken.erp !== receiver_erp
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 10: Get all hangout requests is unauthorized", async() => {
            // act
            let res = await request(this.app).get(`${baseRoute}`);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("POST /hangout-requests", () => {
        const sender_erp = userERP;
        const receiver_erp = user2ERP;
        const meetup_at = existingHangoutRequest.meetup_at;
        const purpose = existingHangoutRequest.purpose;
        const meetup_spot_id = existingHangoutRequest.meetup_spot_id;

        it("Scenario 1: Create a hangout request is successful (Owner)", async() => {
            // arrange
            const data = { sender_erp, receiver_erp, purpose, meetup_at, meetup_spot_id };
            const app = this.app;

            // act
            let res = await request(app)
                .post(baseRoute)
                .auth(userToken, { type: 'bearer' }) // token erp === sender_erp in body
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(201);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.body).to.include.keys(['affected_rows']);
            expect(res.body.body.affected_rows).to.be.equal(1);
            const newId = res.body.body.hangout_request_id;

            // affirm
            res = await request(app)
                .get(`${baseRoute}/${newId}`)
                .auth(userToken, { type: 'bearer' }); // token erp === sender_erp in body

            expect(res.status).to.be.equal(200);
            expect(res.body.body.hangout_request_id).to.be.equal(newId);
            expect(res.body.body.sender.erp).to.be.equal(data.sender_erp);
            expect(res.body.body.receiver.erp).to.be.equal(data.receiver_erp);

            // cleanup
            res = await request(app)
                .delete(`${baseRoute}/${newId}`)
                .auth(userToken, { type: 'bearer' }); // sender deletes it
            expect(res.status).to.be.equal(200);
        });

        it("Scenario 2: Create a hangout request is unsuccessful due to unknown receiver_erp", async() => {
            // arrange
            const data = {
                sender_erp: existingHangoutRequest.sender.erp,
                receiver_erp: unknownStudentERP,
                purpose,
                meetup_at,
                meetup_spot_id
            };
            // act
            const res = await request(this.app)
                .post(baseRoute)
                .auth(userToken, { type: 'bearer' }) // userToken erp === existingHangoutRequest.sender.erp
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(512);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForeignKeyViolationException');
            expect(res.body.headers.message).to.contain('receiver_erp');
        });

        it("Scenario 3: Create a hangout request is incorrect due to wrong key name in the body", async() => {
            // arrange
            const data = { // missing receiver_erp,
                meetup_at: 'not going', // <-- not a valid meetup_at
                purpose,
                meetup_spot_id,
                send_erp: '12345' // <-- a valid parameter name should be 'sender_erp'
            };

            // act
            const res = await request(this.app)
                .post(baseRoute)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(422);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('InvalidPropertiesException');
            const incorrectParams = res.body.headers.data.map(o => (o.param));
            expect(incorrectParams).to.include.members(['receiver_erp', 'meetup_at']);
        });

        it("Scenario 4: Create a hangout request is incorrect due to hangout request to oneself", async() => {
            // arrange
            const data = {
                sender_erp: sender_erp,
                receiver_erp: sender_erp,
                purpose,
                meetup_at,
                meetup_spot_id
            };

            // act
            const res = await request(this.app)
                .post(baseRoute)
                .auth(userToken, { type: 'bearer' }) // userToken erp === data.sender_erp
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(422);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('InvalidPropertiesException');
            const incorrectParams = res.body.headers.data.map(o => (o.param));
            expect(incorrectParams).to.include.members(['receiver_erp']);
            const incorrectMsg = res.body.headers.data.map(o => (o.msg));
            expect(incorrectMsg).to.include('Sender and receiver ERP can\'t be the same');
        });

        it("Scenario 5: Create a hangout request is forbidden due to unowned hangout request", async() => {
            // arrange
            const data = { sender_erp: adminERP, receiver_erp, purpose, meetup_at, meetup_spot_id }; // adminERP instead of userERP

            // act
            const res = await request(this.app)
                .post(baseRoute)
                .auth(userToken, { type: 'bearer' }) // <-- data.sender_erp !== userToken.erp
                .send(data);
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 6: Create a hangout request is unauthorized", async() => {
            // arrange
            const data = { sender_erp, receiver_erp, purpose, meetup_at, meetup_spot_id };

            // act
            const res = await request(this.app)
                .post(baseRoute)
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("PATCH /hangout-requests/:id", () => {
        const request_status = 'accepted';
        const hangoutRequestId = existingHangoutRequest.hangout_request_id;
        const accepted_at = '2021-10-07 17:30:40';
        
        it("Scenario 1: Update a hangout request is successful (Owner)", async() => {
            // arrange
            const data = { request_status, accepted_at };
            const app = this.app;

            // act
            let res = await request(app)
                .patch(`${baseRoute}/${hangoutRequestId}`)
                .auth(adminToken, { type: 'bearer' }) // <-- adminToken.erp == existingHangoutRequest.receiver.erp
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.body.rows_matched).to.be.equal(1);
            expect(res.body.body.rows_changed).to.be.equal(1);
            
            // affirm
            res = await request(app)
                .get(`${baseRoute}/${hangoutRequestId}`)
                .auth(adminToken, { type: 'bearer' });
            
            expect(res.status).to.be.equal(200);
            const hangoutRequest = {
                ...existingHangoutRequest
            };
            hangoutRequest.accepted_at = data.accepted_at;
            hangoutRequest.request_status = data.request_status;
            expect(res.body.body).to.be.eql(hangoutRequest);
            
            // cleanup
            data.request_status = existingHangoutRequest.request_status;
            data.accepted_at = existingHangoutRequest.accepted_at;
            res = await request(app)
                .patch(`${baseRoute}/${hangoutRequestId}`)
                .auth(adminToken, { type: 'bearer' }) // <-- adminToken.erp == existingHangoutRequest.receiver.erp
                .send(data);
            expect(res.status).to.be.equal(200);
        });

        it("Scenario 2: Update a hangout request is incorrect", async() => {
            // arrange
            const data = {
                request_status: 'ignored', // <-- not a valid request_status
                accepted_at, // can't specify accepted at unless request_status === 'accepted/reject'
                sender_erp: '12345' // <-- an invalid update parameter i.e. not allowed
            };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${hangoutRequestId}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(422);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('InvalidPropertiesException');
            const incorrectParams = res.body.headers.data.map(o => (o.param));
            expect(incorrectParams).to.include.members(['request_status', 'accepted_at']);
            const incorrectMsg = res.body.headers.data.map(o => (o.msg));
            expect(incorrectMsg).to.include.members(['Invalid updates!']);
        });

        it("Scenario 3: Update a hangout request is forbidden", async() => {
            // arrange
            const data = { request_status, accepted_at };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${hangoutRequestId}`)
                .auth(userToken, { type: 'bearer' }) // <-- userToken.erp !== existingHangoutRequest.receiver.erp
                .send(data);
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 4: Update a hangout request is unauthorized", async() => {
            // arrange
            const data = { request_status, accepted_at };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${hangoutRequestId}`)
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("DELETE /hangout-requests/:id", () => {
        const sender_erp = userERP;
        const receiver_erp = user2ERP;
        const meetup_at = existingHangoutRequest.meetup_at;
        const hangoutRequestId = existingHangoutRequest.hangout_request_id;
        const purpose = existingHangoutRequest.purpose;
        const meetup_spot_id = existingHangoutRequest.meetup_spot_id;

        it("Scenario 1: Delete a hangout request is successful (Sender cancels)", async() => {
            // prepare
            const data = { sender_erp, receiver_erp, purpose, meetup_at, meetup_spot_id };
            const app = this.app;

            // create dummy
            let res = await request(app)
                .post(baseRoute)
                .auth(userToken, { type: 'bearer' })
                .send(data);
            expect(res.status).to.be.equal(201);
            const newId = res.body.body.hangout_request_id;

            // act
            res = await request(app)
                .delete(`${baseRoute}/${newId}`)
                .auth(userToken, { type: 'bearer' }); // <-- userToken.erp === sender_erp

            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.headers.message).to.be.equal('Hangout request has been deleted');
            expect(res.body.body.rows_removed).to.be.equal(1);

            // affirm
            res = await request(app)
                .get(`${baseRoute}/${newId}`)
                .auth(userToken, { type: 'bearer' });

            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Hangout request not found');
        });

        it("Scenario 2: Delete a hangout request is unsuccessful due to unknown id", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${unknownHangoutRequestId}`)
                .auth(adminToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Hangout request not found');
        });

        it("Scenario 3: Delete a hangout request is forbidden", async() => {
            // arrange
            const forbiddenToken = jwt.sign({erp: receiver_erp}, Config.SECRET_JWT);
            
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${hangoutRequestId}`)
                .auth(forbiddenToken, { type: 'bearer' }); // forbiddenToken.erp !== receiver_erp or sender_erp
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 4: Delete a hangout request is unauthorized", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${hangoutRequestId}`);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

});