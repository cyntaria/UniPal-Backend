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
    // const unknownFriendRequestId = 99999;
    // const unknownStudentERP = 19999;
    const userToken = jwt.sign({erp: userERP}, Config.SECRET_JWT); // non expiry token
    const adminToken = jwt.sign({erp: adminERP}, Config.SECRET_JWT);

    beforeEach(() => {
        this.app = require('../../src/server').setup();
    });

    context("POST /friend-requests", () => {
        const sender_erp = userERP;
        const receiver_erp = user2ERP;
        const sent_at = existingFriendRequest.sent_at;

        it("Scenario 1: Create a friend request request is successful (Owner)", async() => {
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

        it("Scenario 2: Create a friend request request is unsuccessful due to already sent friend request", async() => {
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

        it("Scenario 3: Create a friend request request is unsuccessful due to already received friend request", async() => {
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

        it("Scenario 4: Create a friend request request is incorrect due to wrong key name in the body", async() => {
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

        it("Scenario 5: Create a friend request request is incorrect due to friend request to oneself", async() => {
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

        it("Scenario 6: Create a friend request request is forbidden due to unowned friend request", async() => {
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

        it("Scenario 7: Create a friend request request is unauthorized", async() => {
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

    // context("PATCH /friend-requests/:sender_erp", () => {
    //     const involvement_type = 'will_try';
    //     const activity_id = existingFriendRequest.activity_id;
    //     const sender_erp = existingFriendRequest.sender_erp;
        
    //     it("Scenario 1: Update a friend request request is successful (Owner)", async() => {
    //         // arrange
    //         const data = { involvement_type };
    //         const app = this.app;

    //         // act
    //         let res = await request(app)
    //             .patch(`${baseRoute}/${activity_id}/${subRoute}/${sender_erp}`)
    //             .auth(userToken, { type: 'bearer' }) // <-- userToken.erp == sender_erp
    //             .send(data);
    
    //         // assert
    //         expect(res.status).to.be.equal(200);
    //         expect(res.body.headers.error).to.be.equal(0);
    //         expect(res.body.body.rows_matched).to.be.equal(1);
    //         expect(res.body.body.rows_changed).to.be.equal(1);
            
    //         // affirm
    //         const query = `involvement_type=${involvement_type}`;
    //         res = await request(app)
    //             .get(`${baseRoute}/${activity_id}/${subRoute}?${query}`)
    //             .auth(userToken, { type: 'bearer' });
            
    //         expect(res.status).to.be.equal(200);
    //         const studentERPs = res.body.body.map(o => (o.sender_erp));
    //         expect(studentERPs).to.include(sender_erp);
            
    //         // cleanup
    //         data.involvement_type = existingFriendRequest.involvement_type;
    //         res = await request(app)
    //             .patch(`${baseRoute}/${activity_id}/${subRoute}/${sender_erp}`)
    //             .auth(adminToken, { type: 'bearer' })
    //             .send(data);
    //         expect(res.status).to.be.equal(200);
    //     });

    //     it("Scenario 2: Update a friend request request is successful (Admin)", async() => {
    //         // arrange
    //         const data = { involvement_type };
    //         const app = this.app;

    //         // act
    //         let res = await request(app)
    //             .patch(`${baseRoute}/${activity_id}/${subRoute}/${sender_erp}`)
    //             .auth(adminToken, { type: 'bearer' })
    //             .send(data);
    
    //         // assert
    //         expect(res.status).to.be.equal(200);
    //         expect(res.body.headers.error).to.be.equal(0);
    //         expect(res.body.body.rows_matched).to.be.equal(1);
    //         expect(res.body.body.rows_changed).to.be.equal(1);
            
    //         // affirm
    //         const query = `involvement_type=${involvement_type}`;
    //         res = await request(app)
    //             .get(`${baseRoute}/${activity_id}/${subRoute}?${query}`)
    //             .auth(userToken, { type: 'bearer' });
            
    //         expect(res.status).to.be.equal(200);
    //         const studentERPs = res.body.body.map(o => (o.sender_erp));
    //         expect(studentERPs).to.include(sender_erp);
            
    //         // cleanup
    //         data.involvement_type = existingFriendRequest.involvement_type;
    //         res = await request(app)
    //             .patch(`${baseRoute}/${activity_id}/${subRoute}/${sender_erp}`)
    //             .auth(adminToken, { type: 'bearer' })
    //             .send(data);
    //         expect(res.status).to.be.equal(200);
    //     });

    //     it("Scenario 3: Update a friend request request is unsuccessful due to unknown activity_id", async() => {
    //         // arrange
    //         const data = { involvement_type };

    //         // act
    //         const res = await request(this.app)
    //             .patch(`${baseRoute}/${unknownActivityId}/${subRoute}/${sender_erp}`)
    //             .auth(adminToken, { type: 'bearer' })
    //             .send(data);
    
    //         // assert
    //         expect(res.status).to.be.equal(404);
    //         expect(res.body.headers.error).to.be.equal(1);
    //         expect(res.body.headers.code).to.be.equal('NotFoundException');
    //         expect(res.body.headers.message).to.be.equal('Friend request not found');
    //     });

    //     it("Scenario 4: Update a friend request request is unsuccessful due to unknown sender_erp", async() => {
    //         // arrange
    //         const data = { involvement_type };

    //         // act
    //         const res = await request(this.app)
    //             .patch(`${baseRoute}/${activity_id}/${subRoute}/${unknownStudentERP}`)
    //             .auth(adminToken, { type: 'bearer' })
    //             .send(data);
    
    //         // assert
    //         expect(res.status).to.be.equal(404);
    //         expect(res.body.headers.error).to.be.equal(1);
    //         expect(res.body.headers.code).to.be.equal('NotFoundException');
    //         expect(res.body.headers.message).to.be.equal('Friend request not found');
    //     });

    //     it("Scenario 5: Update a friend request request is incorrect", async() => {
    //         // arrange
    //         const data = {
    //             involvement_type: 'not going', // <-- not a valid involvement_type
    //             erp: '12345' // <-- an invalid update parameter i.e. not allowed
    //         };

    //         // act
    //         const res = await request(this.app)
    //             .patch(`${baseRoute}/${activity_id}/${subRoute}/${sender_erp}`)
    //             .auth(adminToken, { type: 'bearer' })
    //             .send(data);
    
    //         // assert
    //         expect(res.status).to.be.equal(422);
    //         expect(res.body.headers.error).to.be.equal(1);
    //         expect(res.body.headers.code).to.be.equal('InvalidPropertiesException');
    //         const incorrectParams = res.body.headers.data.map(o => (o.param));
    //         expect(incorrectParams).to.include.members(['involvement_type']);
    //         const incorrectMsg = res.body.headers.data.map(o => (o.msg));
    //         expect(incorrectMsg).to.include.members(['Invalid updates!']);
    //     });

    //     it("Scenario 6: Update a friend request request is forbidden", async() => {
    //         // arrange
    //         const data = { involvement_type };

    //         // act
    //         const res = await request(this.app)
    //             .patch(`${baseRoute}/${activity_id}/${subRoute}/${adminERP}`)
    //             .auth(userToken, { type: 'bearer' }) // <-- adminERP != userToken.erp, can be any other different erp as well
    //             .send(data);
            
    //         // assert
    //         expect(res.status).to.be.equal(403);
    //         expect(res.body.headers.error).to.be.equal(1);
    //         expect(res.body.headers.code).to.be.equal('ForbiddenException');
    //         expect(res.body.headers.message).to.be.equal('User unauthorized for action');
    //     });

    //     it("Scenario 7: Update a friend request request is unauthorized", async() => {
    //         // arrange
    //         const data = { involvement_type };

    //         // act
    //         const res = await request(this.app)
    //             .patch(`${baseRoute}/${activity_id}/${subRoute}/${sender_erp}`)
    //             .send(data);
    
    //         // assert
    //         expect(res.status).to.be.equal(401);
    //         expect(res.body.headers.error).to.be.equal(1);
    //         expect(res.body.headers.code).to.be.equal('TokenMissingException');
    //         expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
    //     });
    // });

    // context("DELETE /friend-requests/:sender_erp", () => {
    //     const involvement_type = 'will_try';
    //     const activity_id = activityIdWithoutAttendees;
    //     const existingActivityId = existingFriendRequest.activity_id;
    //     const sender_erp = userERP;

    //     it("Scenario 1: Delete a friend request request is successful (Owner)", async() => {
    //         // prepare
    //         const data = { sender_erp, involvement_type };
    //         const app = this.app;

    //         // create dummy
    //         let res = await request(app)
    //             .post(baseRoute)
    //             .auth(adminToken, { type: 'bearer' })
    //             .send(data);
    //         expect(res.status).to.be.equal(201);

    //         // act
    //         res = await request(app)
    //             .delete(`${baseRoute}/${activity_id}/${subRoute}/${sender_erp}`)
    //             .auth(userToken, { type: 'bearer' }); // <-- userToken.erp == sender_erp

    //         // assert
    //         expect(res.status).to.be.equal(200);
    //         expect(res.body.headers.error).to.be.equal(0);
    //         expect(res.body.headers.message).to.be.equal('Friend request has been deleted');
    //         expect(res.body.body.rows_removed).to.be.equal(1);

    //         // affirm
    //         res = await request(app)
    //             .get(`${baseRoute}/${activity_id}/${subRoute}`)
    //             .auth(userToken, { type: 'bearer' });

    //         // assert
    //         expect(res.status).to.be.equal(404);
    //         expect(res.body.headers.error).to.be.equal(1);
    //         expect(res.body.headers.code).to.be.equal('NotFoundException');
    //         expect(res.body.headers.message).to.be.equal('Friend requests not found');
    //     });

    //     it("Scenario 2: Delete a friend request request is successful (Admin)", async() => {
    //         // prepare
    //         const data = { sender_erp, involvement_type };
    //         const app = this.app;

    //         // create dummy
    //         let res = await request(app)
    //             .post(baseRoute)
    //             .auth(adminToken, { type: 'bearer' })
    //             .send(data);
    //         expect(res.status).to.be.equal(201);

    //         // act
    //         res = await request(app)
    //             .delete(`${baseRoute}/${activity_id}/${subRoute}/${sender_erp}`)
    //             .auth(adminToken, { type: 'bearer' }); // <-- adminToken.erp != sender_erp but still bypass ownerCheck

    //         // assert
    //         expect(res.status).to.be.equal(200);
    //         expect(res.body.headers.error).to.be.equal(0);
    //         expect(res.body.headers.message).to.be.equal('Friend request has been deleted');
    //         expect(res.body.body.rows_removed).to.be.equal(1);

    //         // affirm
    //         res = await request(app)
    //             .get(`${baseRoute}/${activity_id}/${subRoute}`)
    //             .auth(userToken, { type: 'bearer' });

    //         // assert
    //         expect(res.status).to.be.equal(404);
    //         expect(res.body.headers.error).to.be.equal(1);
    //         expect(res.body.headers.code).to.be.equal('NotFoundException');
    //         expect(res.body.headers.message).to.be.equal('Friend requests not found');
    //     });

    //     it("Scenario 3: Delete a friend request request is unsuccessful due to unknown activity_id", async() => {
    //         // act
    //         const res = await request(this.app)
    //             .delete(`${baseRoute}/${unknownActivityId}/${subRoute}/${sender_erp}`)
    //             .auth(adminToken, { type: 'bearer' });
    
    //         // assert
    //         expect(res.status).to.be.equal(404);
    //         expect(res.body.headers.error).to.be.equal(1);
    //         expect(res.body.headers.code).to.be.equal('NotFoundException');
    //         expect(res.body.headers.message).to.be.equal('Friend request not found');
    //     });
        
    //     it("Scenario 4: Delete a friend request request is unsuccessful due to unknown sender_erp", async() => {
    //         // act
    //         const res = await request(this.app)
    //             .delete(`${baseRoute}/${existingActivityId}/${subRoute}/${unknownStudentERP}`)
    //             .auth(adminToken, { type: 'bearer' });
    
    //         // assert
    //         expect(res.status).to.be.equal(404);
    //         expect(res.body.headers.error).to.be.equal(1);
    //         expect(res.body.headers.code).to.be.equal('NotFoundException');
    //         expect(res.body.headers.message).to.be.equal('Friend request not found');
    //     });

    //     it("Scenario 5: Delete a friend request request is forbidden", async() => {
    //         // act
    //         const res = await request(this.app)
    //             .delete(`${baseRoute}/${existingActivityId}/${subRoute}/${adminERP}`)
    //             .auth(userToken, { type: 'bearer' }); // <-- adminERP != userToken.erp, can be any other different erp as well
            
    //         // assert
    //         expect(res.status).to.be.equal(403);
    //         expect(res.body.headers.error).to.be.equal(1);
    //         expect(res.body.headers.code).to.be.equal('ForbiddenException');
    //         expect(res.body.headers.message).to.be.equal('User unauthorized for action');
    //     });

    //     it("Scenario 6: Delete a friend request request is unauthorized", async() => {
    //         // act
    //         const res = await request(this.app)
    //             .delete(`${baseRoute}/${existingActivityId}/${subRoute}/${sender_erp}`);
    
    //         // assert
    //         expect(res.status).to.be.equal(401);
    //         expect(res.body.headers.error).to.be.equal(1);
    //         expect(res.body.headers.code).to.be.equal('TokenMissingException');
    //         expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
    //     });
    // });

});