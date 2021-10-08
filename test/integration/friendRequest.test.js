/* eslint-disable no-undef */
const request = require("supertest");
const expect = require('chai').expect;
const jwt = require('jsonwebtoken');
const {Config} = require('../../src/configs/config');

describe("Friend Requests API", () => {
    const API = `/api/${Config.API_VERSION}`;
    const baseRoute = API + "/friend-requests";
    const adminERP = '15030';
    const user2ERP = '17619';
    const userERP = '17855';
    const existingFriendRequest = {
        student_connection_id: 5,
        sender_erp: userERP,
        receiver_erp: adminERP,
        connection_status: 'request_pending',
        sent_at: '2021-10-04 17:24:40',
        accepted_at: null
    };
    const unknownFriendRequestId = 99999;
    const unknownStudentERP = 19999;
    const userToken = jwt.sign({erp: userERP}, Config.SECRET_JWT); // non expiry token
    const adminToken = jwt.sign({erp: adminERP}, Config.SECRET_JWT);

    beforeEach(() => {
        this.app = require('../../src/server').setup();
    });

    context("GET /friend-requests", () => {

        it("Scenario 1: Get all friend requests is successful (Sent)", async() => {
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
            const queryCheck = friendRequest => friendRequest.sender_erp === sender_erp;
            expect(resBody.every(queryCheck)).to.be.true; // should match initially sent query params
            expect(resBody[0]).to.include.keys(['sender_erp', 'receiver_erp', 'connection_status', 'sent_at', 'accepted_at']);
        });

        it("Scenario 2: Get all friend requests is successful (Receiver)", async() => {
            // arrange
            const receiver_erp = adminERP;
            
            // act
            let res = await request(this.app)
                .get(`${baseRoute}?receiver_erp=${receiver_erp}`)
                .auth(adminToken, { type: 'bearer' }); // adminToken.erp === sender_erp
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            const resBody = res.body.body;
            expect(resBody).to.be.an('array');
            const queryCheck = friendRequest => friendRequest.receiver_erp === receiver_erp;
            expect(resBody.every(queryCheck)).to.be.true; // should match initially sent query params
            expect(resBody[0]).to.include.keys(['sender_erp', 'receiver_erp', 'connection_status', 'sent_at', 'accepted_at']);
        });

        it("Scenario 3: Get all friend requests unsuccessful due to no (sent) friend requests", async() => {
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
            expect(res.body.headers.message).to.be.equal('Friend requests not found');
        });

        it("Scenario 4: Get all friend requests unsuccessful due to no (received) friend requests", async() => {
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
            expect(res.body.headers.message).to.be.equal('Friend requests not found');
        });

        it("Scenario 5: Get all friend requests is incorrect due to multiple query params", async() => {
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

        it("Scenario 6: Get all friend requests is incorrect due to no query params", async() => {
            // act
            let res = await request(this.app)
                .get(baseRoute) // <-- either specify sender_erp or receiver_erp
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(422);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('InvalidPropertiesException');
            const incorrectMsg = res.body.headers.data.map(o => (o.msg));
            expect(incorrectMsg).to.include('Either sender or receiver erp is required');
        });

        it("Scenario 7: Get all friend requests is incorrect due to unknown query params", async() => {
            // arrange
            const sender_erp = '123'; // a valid erp is 5 digits

            // act
            let res = await request(this.app)
                .get(`${baseRoute}?sender_erp=${sender_erp}&connection_status=friends`) // <-- 'connection_status' is invalid query param
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

        it("Scenario 8: Get request is forbidden due to querying other's sent friend requests", async() => {
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

        it("Scenario 9: Get request is forbidden due to querying other's received friend requests", async() => {
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

        it("Scenario 10: Get all friend requests is unauthorized", async() => {
            // act
            let res = await request(this.app).get(baseRoute);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("POST /friend-requests", () => {
        const sender_erp = userERP;
        const receiver_erp = user2ERP;
        const sent_at = existingFriendRequest.sent_at;

        it("Scenario 1: Create a friend request is successful (Owner)", async() => {
            // arrange
            const data = { sender_erp, receiver_erp, sent_at };
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
            const newId = res.body.body.student_connection_id;

            // affirm
            res = await request(app)
                .get(`${baseRoute}/${newId}`)
                .auth(userToken, { type: 'bearer' }); // token erp === sender_erp in body

            expect(res.status).to.be.equal(200);
            expect(res.body.body).to.be.eql({
                student_connection_id: newId,
                ...data,
                connection_status: existingFriendRequest.connection_status,
                accepted_at: null,
                student_1_erp: data.receiver_erp, // 17619, bcz smaller
                student_2_erp: data.sender_erp // 17855, bcz greater
            });

            // cleanup
            res = await request(app)
                .delete(`${baseRoute}/${newId}`)
                .auth(userToken, { type: 'bearer' }); // sender deletes it
            expect(res.status).to.be.equal(200);
        });

        it("Scenario 2: Create a friend request is unsuccessful due to unknown receiver_erp", async() => {
            // arrange
            const data = {
                sender_erp: existingFriendRequest.sender_erp,
                receiver_erp: unknownStudentERP,
                sent_at
            };
            // act
            const res = await request(this.app)
                .post(baseRoute)
                .auth(userToken, { type: 'bearer' }) // userToken erp === existingFriendRequest.sender_erp
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(512);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForeignKeyViolationException');
            expect(res.body.headers.message).to.contain('receiver_erp');
        });

        it("Scenario 3: Create a friend request is unsuccessful due to already sent friend request", async() => {
            // arrange
            const data = {
                sender_erp: existingFriendRequest.sender_erp,
                receiver_erp: existingFriendRequest.receiver_erp,
                sent_at
            };
            // act
            const res = await request(this.app)
                .post(baseRoute)
                .auth(userToken, { type: 'bearer' }) // userToken erp === existingFriendRequest.sender_erp
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(409);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('DuplicateEntryException');
        });

        it("Scenario 4: Create a friend request is unsuccessful due to already received friend request", async() => {
            // arrange
            const data = {
                sender_erp: existingFriendRequest.receiver_erp,
                receiver_erp: existingFriendRequest.sender_erp, // flip receiver and sender
                sent_at
            };
            const senderToken = jwt.sign({erp: data.sender_erp}, Config.SECRET_JWT);

            // act
            const res = await request(this.app)
                .post(baseRoute)
                .auth(senderToken, { type: 'bearer' }) // senderToken erp === data.sender_erp
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(409);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('DuplicateEntryException');
        });

        it("Scenario 5: Create a friend request is incorrect due to wrong key name in the body", async() => {
            // arrange
            const data = { // missing receiver_erp
                sent_at: 'not going', // <-- not a valid sent_at
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
            expect(incorrectParams).to.include.members(['receiver_erp', 'sent_at']);
        });

        it("Scenario 6: Create a friend request is incorrect due to friend request to oneself", async() => {
            // arrange
            const data = {
                sender_erp: sender_erp,
                receiver_erp: sender_erp,
                sent_at
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

        it("Scenario 7: Create a friend request is forbidden due to unowned friend request", async() => {
            // arrange
            const data = { sender_erp: adminERP, receiver_erp, sent_at }; // adminERP instead of userERP

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

        it("Scenario 8: Create a friend request is unauthorized", async() => {
            // arrange
            const data = { sender_erp, receiver_erp, sent_at };

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

    context("PATCH /friend-requests/:id", () => {
        const connection_status = 'friends';
        const friendRequestId = existingFriendRequest.student_connection_id;
        const accepted_at = '2021-10-07 17:30:40';
        
        it("Scenario 1: Update a friend request is successful (Owner)", async() => {
            // arrange
            const data = { connection_status, accepted_at };
            const app = this.app;

            // act
            let res = await request(app)
                .patch(`${baseRoute}/${friendRequestId}`)
                .auth(adminToken, { type: 'bearer' }) // <-- adminToken.erp == existingFriendRequest.receiver_erp
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.body.rows_matched).to.be.equal(1);
            expect(res.body.body.rows_changed).to.be.equal(1);
            
            // affirm
            res = await request(app)
                .get(`${baseRoute}/${friendRequestId}`)
                .auth(adminToken, { type: 'bearer' });
            
            expect(res.status).to.be.equal(200);
            const studentConnection = {
                ...existingFriendRequest,
                student_1_erp: existingFriendRequest.receiver_erp, // 15030, bcz smaller
                student_2_erp: existingFriendRequest.sender_erp // 17855, bcz greater
            };
            studentConnection.accepted_at = data.accepted_at;
            studentConnection.connection_status = data.connection_status;
            expect(res.body.body).to.be.eql(studentConnection);
            
            // cleanup
            data.connection_status = existingFriendRequest.connection_status;
            data.accepted_at = existingFriendRequest.accepted_at;
            res = await request(app)
                .patch(`${baseRoute}/${friendRequestId}`)
                .auth(adminToken, { type: 'bearer' }) // <-- adminToken.erp == existingFriendRequest.receiver_erp
                .send(data);
            expect(res.status).to.be.equal(200);
        });

        it("Scenario 2: Update a friend request is incorrect", async() => {
            // arrange
            const data = {
                connection_status: 'ignored', // <-- not a valid connection_status
                accepted_at, // can't specify accepted at unless connection_status === 'friends'
                sender_erp: '12345' // <-- an invalid update parameter i.e. not allowed
            };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${friendRequestId}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(422);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('InvalidPropertiesException');
            const incorrectParams = res.body.headers.data.map(o => (o.param));
            expect(incorrectParams).to.include.members(['connection_status', 'accepted_at']);
            const incorrectMsg = res.body.headers.data.map(o => (o.msg));
            expect(incorrectMsg).to.include.members(['Invalid updates!']);
        });

        it("Scenario 3: Update a friend request is forbidden", async() => {
            // arrange
            const data = { connection_status, accepted_at };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${friendRequestId}`)
                .auth(userToken, { type: 'bearer' }) // <-- userToken.erp !== existingFriendRequest.receiver_erp
                .send(data);
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 4: Update a friend request is unauthorized", async() => {
            // arrange
            const data = { connection_status, accepted_at };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${friendRequestId}`)
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("DELETE /friend-requests/:id", () => {
        const sender_erp = userERP;
        const receiver_erp = user2ERP;
        const sent_at = existingFriendRequest.sent_at;
        const friendRequestId = existingFriendRequest.student_connection_id;

        it("Scenario 1: Delete a friend request is successful (Sender cancels)", async() => {
            // prepare
            const data = { sender_erp, receiver_erp, sent_at };
            const app = this.app;

            // create dummy
            let res = await request(app)
                .post(baseRoute)
                .auth(userToken, { type: 'bearer' })
                .send(data);
            expect(res.status).to.be.equal(201);
            const newId = res.body.body.student_connection_id;

            // act
            res = await request(app)
                .delete(`${baseRoute}/${newId}`)
                .auth(userToken, { type: 'bearer' }); // <-- userToken.erp === sender_erp

            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.headers.message).to.be.equal('Friend request has been deleted');
            expect(res.body.body.rows_removed).to.be.equal(1);

            // affirm
            res = await request(app)
                .get(`${baseRoute}/${newId}`)
                .auth(userToken, { type: 'bearer' });

            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Friend request not found');
        });

        it("Scenario 2: Delete a friend request is successful (Receiver rejects)", async() => {
            // prepare
            const data = { sender_erp, receiver_erp, sent_at };
            const app = this.app;
            const receiverToken = jwt.sign({erp: data.receiver_erp}, Config.SECRET_JWT);

            // create dummy
            let res = await request(app)
                .post(baseRoute)
                .auth(userToken, { type: 'bearer' })
                .send(data);
            expect(res.status).to.be.equal(201);
            const newId = res.body.body.student_connection_id;

            // act
            res = await request(app)
                .delete(`${baseRoute}/${newId}`)
                .auth(receiverToken, { type: 'bearer' }); // <-- receiverToken.erp === receiver_erp

            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.headers.message).to.be.equal('Friend request has been deleted');
            expect(res.body.body.rows_removed).to.be.equal(1);

            // affirm
            res = await request(app)
                .get(`${baseRoute}/${newId}`)
                .auth(userToken, { type: 'bearer' });

            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Friend request not found');
        });

        it("Scenario 3: Delete a friend request is unsuccessful due to unknown id", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${unknownFriendRequestId}`)
                .auth(adminToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Friend request not found');
        });

        it("Scenario 4: Delete a friend request is forbidden", async() => {
            // arrange
            const forbiddenToken = jwt.sign({erp: receiver_erp}, Config.SECRET_JWT);
            
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${friendRequestId}`)
                .auth(forbiddenToken, { type: 'bearer' }); // forbiddenToken.erp !== receiver_erp or sender_erp
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 5: Delete a friend request is unauthorized", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${friendRequestId}`);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

});