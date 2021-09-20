/* eslint-disable no-undef */
const request = require("supertest");
const expect = require('chai').expect;
const sinon = require('sinon');
const decache = require('decache');
const jwt = require('jsonwebtoken');
const {Config} = require('../../src/configs/config');

describe("Activity Attendees API", () => {
    const API = `/api/${Config.API_VERSION}`;
    const baseRoute = API + "/activities";
    const subRoute = "attendees";
    const adminERP = '15030';
    const userERP = '17855';
    const existingActivityAttendee = {
        activity_id: 1,
        student_erp: userERP,
        involvement_type: 'going'
    };
    const activityIdWithoutAttendees = 2;
    const unknownActivityId = 99999;
    const unknownStudentERP = 19999;
    const userToken = jwt.sign({erp: userERP}, Config.SECRET_JWT); // non expiry token
    const adminToken = jwt.sign({erp: adminERP}, Config.SECRET_JWT);

    beforeEach(() => {
        this.app = require('../../src/server').setup();
    });

    context("POST /activities/:id/attendees", () => {
        const involvement_type = 'will_try';
        const activity_id = activityIdWithoutAttendees;
        const student_erp = userERP;

        it("Scenario 1: Create an activity attendee request is successful", async() => {
            // arrange
            const data = { student_erp, involvement_type };
            const app = this.app;

            // act
            let res = await request(app)
                .post(`${baseRoute}/${activity_id}/${subRoute}`)
                .auth(userToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(201);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.body).to.include.keys(['affected_rows']);
            expect(res.body.body.affected_rows).to.be.equal(1);

            // affirm
            res = await request(app)
                .get(`${baseRoute}/${activity_id}/${subRoute}`)
                .auth(userToken, { type: 'bearer' });

            expect(res.status).to.be.equal(200);
            const resBody = res.body.body;
            expect(resBody).to.be.an('array');
            expect(resBody).to.include.members([{
                activity_id,
                ...data
            }]); // contain all params

            // cleanup
            res = await request(app)
                .delete(`${baseRoute}/${activity_id}/${subRoute}/${student_erp}`)
                .auth(adminToken, { type: 'bearer' });
            expect(res.status).to.be.equal(200);
        });

        it("Scenario 2: Create an activity attendee request is unsuccessful", async() => {
            // arrange
            const data = { student_erp: unknownStudentERP, involvement_type }; // <-- Non-existent student_erp

            // act
            const res = await request(this.app)
                .post(`${baseRoute}/${activity_id}/${subRoute}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(512);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForeignKeyViolationException');
            expect(res.body.headers.message).to.contains('student_erp');
        });

        it("Scenario 3: Create an activity attendee request is incorrect", async() => {
            // arrange
            const data = {
                involvement_type: 'not going', // <-- not a valid involvement_type
                erp: '12345' // <-- a valid parameter name should be 'student_erp'
            };

            // act
            const res = await request(this.app)
                .post(`${baseRoute}/${activity_id}/${subRoute}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(422);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('InvalidPropertiesException');
            const incorrectParams = res.body.headers.data.map(o => (o.param));
            expect(incorrectParams).to.include.members(['involvement_type', 'student_erp']);
            const incorrectMsg = res.body.headers.data.map(o => (o.msg));
            expect(incorrectMsg).to.include('Invalid params!');
        });

        it("Scenario 4: Create an activity attendee request is forbidden", async() => {
            // arrange
            const data = { student_erp: adminERP, involvement_type }; // <-- adminERP != userToken.erp, can be any other different erp as well

            // act
            const res = await request(this.app)
                .post(`${baseRoute}/${activity_id}/${subRoute}`)
                .auth(userToken, { type: 'bearer' })
                .send(data);
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 5: Create an activity attendee request is unauthorized", async() => {
            // arrange
            const data = { student_erp, involvement_type };

            // act
            const res = await request(this.app)
                .post(`${baseRoute}/${activity_id}/${subRoute}`)
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("PATCH /activities/:id", () => {
        const involvement_type = 'will_try';
        const activity_id = existingActivityAttendee.activity_id;
        const student_erp = existingActivityAttendee.student_erp;
        
        it("Scenario 1: Update an activity attendee request is successful (Owner)", async() => {
            // arrange
            const data = { involvement_type };
            const app = this.app;

            // act
            let res = await request(app)
                .patch(`${baseRoute}/${activity_id}/${subRoute}/${student_erp}`)
                .auth(userToken, { type: 'bearer' }) // <-- userToken.erp == student_erp
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.body.rows_matched).to.be.equal(1);
            expect(res.body.body.rows_changed).to.be.equal(1);
            
            // affirm
            res = await request(app)
                .get(`${baseRoute}/${activity_id}/${subRoute}`)
                .auth(userToken, { type: 'bearer' });
            
            expect(res.status).to.be.equal(200);
            const resBody = res.body.body;
            expect(resBody).to.be.an('array');
            expect(resBody).to.include.members([{
                activity_id,
                student_erp,
                ...data
            }]); // contain all params
            
            // cleanup
            data.involvement_type = existingActivityAttendee.involvement_type;
            res = await request(app)
                .patch(`${baseRoute}/${activity_id}/${subRoute}/${student_erp}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
            expect(res.status).to.be.equal(200);
        });

        it("Scenario 2: Update an activity attendee request is successful (Admin)", async() => {
            // arrange
            const data = { involvement_type };
            const app = this.app;

            // act
            let res = await request(app)
                .patch(`${baseRoute}/${activity_id}/${subRoute}/${student_erp}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.body.rows_matched).to.be.equal(1);
            expect(res.body.body.rows_changed).to.be.equal(1);
            
            // affirm
            res = await request(app)
                .get(`${baseRoute}/${activity_id}/${subRoute}`)
                .auth(userToken, { type: 'bearer' });
            
            expect(res.status).to.be.equal(200);
            const resBody = res.body.body;
            expect(resBody).to.be.an('array');
            expect(resBody).to.include.members([{
                activity_id,
                student_erp,
                ...data
            }]); // contain all params
            
            // cleanup
            data.involvement_type = existingActivityAttendee.involvement_type;
            res = await request(app)
                .patch(`${baseRoute}/${activity_id}/${subRoute}/${student_erp}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
            expect(res.status).to.be.equal(200);
        });

        it("Scenario 3: Update an activity attendee request is unsuccessful due to unknown activity_id", async() => {
            // arrange
            const data = { involvement_type };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${unknownActivityId}/${subRoute}/${student_erp}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Activity attendee not found');
        });

        it("Scenario 4: Update an activity attendee request is unsuccessful due to unknown student_erp", async() => {
            // arrange
            const data = { involvement_type };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${activity_id}/${subRoute}/${unknownStudentERP}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Activity attendee not found');
        });

        it("Scenario 5: Update an activity attendee request is incorrect", async() => {
            // arrange
            const data = {
                involvement_type: 'not going', // <-- not a valid involvement_type
                erp: '12345' // <-- an invalid update parameter i.e. not allowed
            };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${activity_id}/${subRoute}/${student_erp}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(422);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('InvalidPropertiesException');
            const incorrectParams = res.body.headers.data.map(o => (o.param));
            expect(incorrectParams).to.include.members(['involvement_type']);
            const incorrectMsg = res.body.headers.data.map(o => (o.msg));
            expect(incorrectMsg).to.include('Invalid params!');
        });

        it("Scenario 6: Update an activity attendee request is forbidden", async() => {
            // arrange
            const data = { involvement_type };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${activity_id}/${subRoute}/${adminERP}`)
                .auth(userToken, { type: 'bearer' }) // <-- adminERP != userToken.erp, can be any other different erp as well
                .send(data);
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 7: Update an activity attendee request is unauthorized", async() => {
            // arrange
            const data = { involvement_type };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${activity_id}/${subRoute}/${student_erp}`)
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("DELETE /activities", () => {
        const activity_attendee = 'Garden (SC)';
        const campus_id = existingActivityAttendee.campus_id;

        it("Scenario 1: Delete an activity attendee request is successful", async() => {
            // prepare
            const data = { activity_attendee, campus_id };
            const app = this.app;

            // create dummy
            let res = await request(app)
                .post(baseRoute)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
            expect(res.status).to.be.equal(201);

            // arrange
            const newId = res.body.body.activity_attendee_id;

            // act
            res = await request(app)
                .delete(`${baseRoute}/${newId}`)
                .auth(adminToken, { type: 'bearer' });

            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.headers.message).to.be.equal('Activity attendee has been deleted');
            expect(res.body.body.rows_removed).to.be.equal(1);

            // affirm
            res = await request(app)
                .get(`${baseRoute}/${newId}`)
                .auth(userToken, { type: 'bearer' });
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
        });

        it("Scenario 2: Delete an activity attendee request is unsuccessful", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${unknownActivityAttendeeId}`)
                .auth(adminToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Activity attendee not found');
        });

        it("Scenario 3: Delete an activity attendee request is forbidden", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${existingActivityAttendee.activity_attendee_id}`)
                .auth(userToken, { type: 'bearer' }); // <-- api_user token instead of admin token
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 4: Delete an activity attendee request is unauthorized", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${existingActivityAttendee.activity_attendee_id}`);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

});