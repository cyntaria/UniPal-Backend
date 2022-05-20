/* eslint-disable no-undef */
const request = require("supertest");
const expect = require('chai').expect;
const sinon = require('sinon');
const decache = require('decache');
const jwt = require('jsonwebtoken');
const {Config} = require('../../src/configs/config');

describe("Activities API", () => {
    const API = `/api/${Config.API_VERSION}`;
    const baseRoute = API + "/activities";
    const userERP = '17855';
    const existingActivity = {
        activity_id: 1,
        title: 'Daily Campus Activity',
        location: "on_campus",
        privacy: "public",
        frequency: "daily",
        monday: 1,
        tuesday: 1,
        wednesday: 1,
        thursday: 1,
        friday: 1,
        saturday: 1,
        sunday: 1,
        month_number: 10,
        group_size: 100,
        happens_at: "4:30:00",
        additional_instructions: "near the stairs",
        activity_type_id: 1,
        activity_status_id: 1,
        campus_spot_id: 2,
        organizer_erp: userERP,
        created_at: "2021-09-17 15:53:40"
    };
    const unOwnedActivityId = 3;
    const unknownActivityId = 99999;
    const unknownActivityTypeId = 99999;
    const unknownActivityStatusId = 99999;
    const unknownCampusSpotId = 99999;
    const unknownOrganizerERP = 19999;
    const adminERP = '15030';
    const userToken = jwt.sign({erp: userERP}, Config.SECRET_JWT); // non expiry token
    const adminToken = jwt.sign({erp: adminERP}, Config.SECRET_JWT);

    beforeEach(() => {
        this.app = require('../../src/server').setup();
    });

    context("GET /activities", () => {
        it("Scenario 1: Get all activities request successful", async() => {
            // act
            let res = await request(this.app)
                .get(baseRoute)
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            const resBody = res.body.body;
            expect(resBody).to.be.an('array');
            expect(resBody[0]).to.include.all.keys(Object.keys(existingActivity)); // contain all params
        });

        it("Scenario 2: Get all activities request successful (using query params)", async() => {
            // act
            const privacy = 'public';
            let res = await request(this.app)
                .get(`${baseRoute}?privacy=${privacy}`)
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            const resBody = res.body.body;
            expect(resBody).to.be.an('array');
            expect(resBody[0].privacy).to.be.equal(privacy);
        });

        it("Scenario 3: Get all activities request unsuccessful", async() => {
            // arrange
            decache('../../src/server');
            const ActivityModel = require('../../src/models/activity.model');
            const modelStub = sinon.stub(ActivityModel, 'findAll').callsFake(() => []); // return empty activity list
            const app = require('../../src/server').setup();

            // act
            const res = await request(app)
                .get(baseRoute)
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.body).to.be.an('array').that.is.empty;
            modelStub.restore();
        });

        it("Scenario 4: Get all activities request is incorrect", async() => {
            // act
            const privacy = 'all'; // <-- invalid privacy value
            let res = await request(this.app)
                .get(`${baseRoute}?privacy=${privacy}&week=2`) // <-- `week` is an incorrect query param
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(422);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('InvalidPropertiesException');
            const incorrectParams = res.body.headers.data.map(o => (o.param));
            expect(incorrectParams).to.include('privacy');
            const incorrectMsg = res.body.headers.data.map(o => (o.msg));
            expect(incorrectMsg).to.include('Invalid query params!');
        });

        it("Scenario 5: Get all activities request is unauthorized", async() => {
            // act
            let res = await request(this.app).get(baseRoute);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("GET /activities/:id", () => {
        it("Scenario 1: Get a activity request successful", async() => {
            // act
            let res = await request(this.app)
                .get(`${baseRoute}/${existingActivity.activity_id}`)
                .auth(userToken, { type: 'bearer' });

            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            const resBody = res.body.body;
            expect(resBody.activity_id).to.be.eql(existingActivity.activity_id); // should match initially sent id
        });

        it("Scenario 2: Get a activity request is unsuccessful", async() => {
            // act
            const res = await request(this.app)
                .get(`${baseRoute}/${unknownActivityId}`)
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Activity not found');
        });

        it("Scenario 3: Get a activity request is unauthorized", async() => {
            // act
            let res = await request(this.app).get(`${baseRoute}/${existingActivity.activity_id}`);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("GET /activities/:id/attendees", () => {
        const subRoute = 'attendees';
        it("Scenario 1: Get an activity's attendees request successful", async() => {
            // act
            let res = await request(this.app)
                .get(`${baseRoute}/${existingActivity.activity_id}/${subRoute}`)
                .auth(userToken, { type: 'bearer' });

            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            const resBody = res.body.body;
            expect(resBody).to.be.an('array');
            expect(resBody[0].activity_id).to.be.equal(existingActivity.activity_id); // should match initially sent id
            expect(resBody[0]).to.include.keys(['student_erp', 'first_name',
                'last_name', 'profile_picture_url', 'involvement_type']);
        });

        it("Scenario 2: Get an activity's attendees request successful (using query params)", async() => {
            // act
            const involvement_type = 'going';
            const query = `involvement_type=${involvement_type}`;
            let res = await request(this.app)
                .get(`${baseRoute}/${existingActivity.activity_id}/${subRoute}?${query}`)
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            const resBody = res.body.body;
            expect(resBody).to.be.an('array');
            expect(resBody[0].involvement_type).to.be.equal(involvement_type);
        });

        it("Scenario 3: Get an activity's attendees request is unsuccessful due to unknown activity_id", async() => {
            // act
            const res = await request(this.app)
                .get(`${baseRoute}/${unknownActivityId}/${subRoute}`)
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.body).to.be.an('array').that.is.empty;
        });

        it("Scenario 4: Get an activity's attendees request is unsuccessful due to zero attendees", async() => {
            // arrange
            decache('../../src/server');
            const ActivityModel = require('../../src/models/activity.model');
            const modelStub = sinon.stub(ActivityModel, 'findAllAttendeesByActivity').callsFake(() => []); // return empty activity attendees list
            const app = require('../../src/server').setup();

            // act
            const res = await request(app)
                .get(`${baseRoute}/${existingActivity.activity_id}/${subRoute}`)
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.body).to.be.an('array').that.is.empty;
            modelStub.restore();
        });

        it("Scenario 5: Get an activity's attendees is unauthorized", async() => {
            // act
            let res = await request(this.app).get(`${baseRoute}/${existingActivity.activity_id}/${subRoute}`);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("POST /activities", () => {
        const { activity_id, month_number, group_size, ...newActivity } = existingActivity;
        const newActivityMonth = 5;
        const newActivityGroupSize = 40;

        it("Scenario 1: Create an activity request is successful (Owner)", async() => {
            // arrange
            const data = {
                ...newActivity,
                month_number: newActivityMonth,
                group_size: newActivityGroupSize
            };
            const app = this.app;

            // act
            let res = await request(app)
                .post(baseRoute)
                .auth(userToken, { type: 'bearer' }) // using his own token i.e. token erp == newActivity.organizer_erp
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(201);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.body).to.include.keys(['activity_id', 'affected_rows']);
            expect(res.body.body.affected_rows).to.be.equal(1);
            
            // affirm
            const newId = res.body.body.activity_id;
            res = await request(app)
                .get(`${baseRoute}/${newId}`)
                .auth(userToken, { type: 'bearer' });

            expect(res.status).to.be.equal(200);
            delete res.body.body.happens_at;
            delete data.happens_at;
            expect(res.body.body).to.be.eql({
                activity_id: newId,
                num_of_attendees: 0,
                ...data
            });

            // cleanup
            res = await request(app)
                .delete(`${baseRoute}/${newId}`)
                .auth(adminToken, { type: 'bearer' });
            expect(res.status).to.be.equal(200);
        });

        it("Scenario 2: Create an activity request is successful (Admin)", async() => {
            // arrange
            const data = {
                ...newActivity,
                month_number: newActivityMonth,
                group_size: newActivityGroupSize
            };
            const app = this.app;

            // act
            let res = await request(app)
                .post(baseRoute)
                .auth(adminToken, { type: 'bearer' }) // admin to create other's activities i.e. token erp != newActivity.organizer_erp
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(201);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.body).to.include.keys(['activity_id', 'affected_rows']);
            expect(res.body.body.affected_rows).to.be.equal(1);
            
            // affirm
            const newId = res.body.body.activity_id;
            res = await request(app)
                .get(`${baseRoute}/${newId}`)
                .auth(userToken, { type: 'bearer' });

            expect(res.status).to.be.equal(200);
            delete res.body.body.happens_at;
            delete data.happens_at;
            expect(res.body.body).to.be.eql({
                activity_id: newId,
                num_of_attendees: 0,
                ...data
            });

            // cleanup
            res = await request(app)
                .delete(`${baseRoute}/${newId}`)
                .auth(adminToken, { type: 'bearer' });
            expect(res.status).to.be.equal(200);
        });

        it("Scenario 3: Create an activity request is unsuccessful due to unknown activity_type_id", async() => {
            // arrange
            const invalidActivity = {...newActivity};
            invalidActivity.activity_type_id = unknownActivityTypeId; // <-- non-existent activity_type_id
            const data = {
                ...invalidActivity,
                month_number: newActivityMonth,
                group_size: newActivityGroupSize
            };

            // act
            const res = await request(this.app)
                .post(baseRoute)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(512);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForeignKeyViolationException');
            expect(res.body.headers.message).to.contains('activity_type_id');
        });

        it("Scenario 4: Create an activity request is unsuccessful due to unknown activity_status_id", async() => {
            // arrange
            const invalidActivity = {...newActivity};
            invalidActivity.activity_status_id = unknownActivityStatusId; // <-- non-existent activity_status_id
            const data = {
                ...invalidActivity,
                month_number: newActivityMonth,
                group_size: newActivityGroupSize
            };

            // act
            const res = await request(this.app)
                .post(baseRoute)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(512);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForeignKeyViolationException');
            expect(res.body.headers.message).to.contains('activity_status_id');
        });

        it("Scenario 5: Create an activity request is unsuccessful due to unknown campus_spot_id", async() => {
            // arrange
            const invalidActivity = {...newActivity};
            invalidActivity.campus_spot_id = unknownCampusSpotId; // <-- non-existent campus_spot_id
            const data = {
                ...invalidActivity,
                month_number: newActivityMonth,
                group_size: newActivityGroupSize
            };

            // act
            const res = await request(this.app)
                .post(baseRoute)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(512);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForeignKeyViolationException');
            expect(res.body.headers.message).to.contains('campus_spot_id');
        });

        it("Scenario 6: Create an activity request is unsuccessful due to unknown organizer_erp", async() => {
            // arrange
            const invalidActivity = {...newActivity};
            invalidActivity.organizer_erp = unknownOrganizerERP; // <-- non-existent organizer_erp
            const data = {
                ...invalidActivity,
                month_number: newActivityMonth,
                group_size: newActivityGroupSize
            };

            // act
            const res = await request(this.app)
                .post(baseRoute)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(512);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForeignKeyViolationException');
            expect(res.body.headers.message).to.contains('organizer_erp');
        });

        it("Scenario 7: Create an activity request is incorrect", async() => {
            // arrange
            const data = {
                ...newActivity,
                month_numbersfd: newActivityMonth // <-- a valid param is 'month_number' & 'group_size' is required
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
            expect(incorrectParams).to.include.members(['month_number', 'group_size']);
        });

        it("Scenario 8: Create an activity request is forbidden (Unowned Organizer ERP)", async() => {
            // arrange
            const invalidActivity = {...newActivity};
            invalidActivity.organizer_erp = adminERP; // <-- can be any other non-admin ERP as well, just different from userToken erp
            const data = {
                ...invalidActivity,
                month_number: newActivityMonth,
                group_size: newActivityGroupSize
            };

            // act
            const res = await request(this.app)
                .post(baseRoute)
                .auth(userToken, { type: 'bearer' }) // <-- user can't create others activities unless admin i.e. token erp != invalidActivity.organizer_erp
                .send(data);
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 9: Create an activity request is unauthorized", async() => {
            // arrange
            const data = {
                ...newActivity,
                month_number: newActivityMonth,
                group_size: newActivityGroupSize
            };

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

    context("PATCH /activities/:id", () => {
        const newActivityMonth = 5;

        it("Scenario 1: Update an activity request is successful (Owner)", async() => {
            // arrange
            const data = { month_number: newActivityMonth };
            const app = this.app;

            // act
            let res = await request(app)
                .patch(`${baseRoute}/${existingActivity.activity_id}`)
                .auth(userToken, { type: 'bearer' }) // using his own token i.e. token erp == existingActivity.organizer_erp
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.body.rows_matched).to.be.equal(1);
            expect(res.body.body.rows_changed).to.be.equal(1);
            
            // affirm
            res = await request(app)
                .get(`${baseRoute}/${existingActivity.activity_id}`)
                .auth(userToken, { type: 'bearer' });
            
            expect(res.status).to.be.equal(200);
            expect(res.body.body.month_number).to.be.equal(newActivityMonth);
            
            // cleanup
            data.month_number = existingActivity.month_number;
            res = await request(app)
                .patch(`${baseRoute}/${existingActivity.activity_id}`)
                .auth(userToken, { type: 'bearer' })
                .send(data);
            expect(res.status).to.be.equal(200);
        });

        it("Scenario 2: Update an activity request is successful (Admin)", async() => {
            // arrange
            const data = { month_number: newActivityMonth };
            const app = this.app;

            // act
            let res = await request(app)
                .patch(`${baseRoute}/${existingActivity.activity_id}`)
                .auth(adminToken, { type: 'bearer' }) // admin to edit other profiles i.e. token erp != existingActivity.organizer_erp
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.body.rows_matched).to.be.equal(1);
            expect(res.body.body.rows_changed).to.be.equal(1);
            
            // affirm
            res = await request(app)
                .get(`${baseRoute}/${existingActivity.activity_id}`)
                .auth(userToken, { type: 'bearer' });
            
            expect(res.status).to.be.equal(200);
            expect(res.body.body.month_number).to.be.equal(newActivityMonth);
            
            // cleanup
            data.month_number = existingActivity.month_number;
            res = await request(app)
                .patch(`${baseRoute}/${existingActivity.activity_id}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
            expect(res.status).to.be.equal(200);
        });

        it("Scenario 3: Update an activity request is unsuccessful due to unknown activity_id", async() => {
            // arrange
            const data = { month_number: newActivityMonth };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${unknownActivityId}`)
                .auth(adminToken, { type: 'bearer' }) // use admin token for no permission side effects
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Activity not found');
        });

        it("Scenario 4: Update an activity request is unsuccessful due to unknown activity_type_id", async() => {
            // arrange
            const data = { activity_type_id: unknownActivityTypeId }; // <-- Non-existent activity_type_id

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${existingActivity.activity_id}`)
                .auth(adminToken, { type: 'bearer' }) // use admin token for no permission side effects
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(512);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForeignKeyViolationException');
            expect(res.body.headers.message).to.contains('activity_type_id');
        });

        it("Scenario 5: Update an activity request is unsuccessful due to unknown activity_status_id", async() => {
            // arrange
            const data = { activity_status_id: unknownActivityStatusId }; // <-- Non-existent activity_status_id

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${existingActivity.activity_id}`)
                .auth(adminToken, { type: 'bearer' }) // use admin token for no permission side effects
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(512);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForeignKeyViolationException');
            expect(res.body.headers.message).to.contains('activity_status_id');
        });

        it("Scenario 6: Update an activity request is unsuccessful due to unknown campus_spot_id", async() => {
            // arrange
            const data = { campus_spot_id: unknownCampusSpotId }; // <-- Non-existent campus_spot_id

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${existingActivity.activity_id}`)
                .auth(adminToken, { type: 'bearer' }) // use admin token for no permission side effects
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(512);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForeignKeyViolationException');
            expect(res.body.headers.message).to.contains('campus_spot_id');
        });

        it("Scenario 7: Update an activity request is incorrect", async() => {
            // arrange
            const data = {
                month_numbersds: newActivityMonth, // <-- an valid parameter name should be 'month_number'
                group_size: -2 // <-- a valid 'group_size' has to be positive only
            };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${existingActivity.activity_id}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(422);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('InvalidPropertiesException');
            const incorrectParams = res.body.headers.data.map(o => (o.param));
            expect(incorrectParams).to.include('group_size');
            const incorrectMsg = res.body.headers.data.map(o => (o.msg));
            expect(incorrectMsg).to.include('Invalid updates!');
        });

        it("Scenario 8: Update an activity request is forbidden (Unowned Organizer ERP)", async() => {
            // arrange
            const data = { month_number: newActivityMonth };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${unOwnedActivityId}`) // <-- has a different organizer_erp than userToken erp
                .auth(userToken, { type: 'bearer' }) // <-- user can't change others activities i.e. token erp != unOwnedActivity.organizer_erp
                .send(data);
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 9: Update an activity request is unauthorized", async() => {
            // arrange
            const data = { month_number: newActivityMonth };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${existingActivity.activity_id}`)
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("DELETE /activities/:id", () => {
        const { activity_id, month_number, group_size, ...newActivity } = existingActivity;
        const newActivityMonth = 5;
        const newActivityGroupSize = 40;

        it("Scenario 1: Delete an activity request is successful (Owner)", async() => {
            // arrange
            const data = {
                ...newActivity,
                month_number: newActivityMonth,
                group_size: newActivityGroupSize
            };
            const app = this.app;

            // act
            let res = await request(app)
                .post(baseRoute)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
            expect(res.status).to.be.equal(201);

            // arrange
            const newId = res.body.body.activity_id;

            // act
            res = await request(app)
                .delete(`${baseRoute}/${newId}`)
                .auth(userToken, { type: 'bearer' }); // using his own token i.e. token erp == newActivity.organizer_erp

            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.headers.message).to.be.equal('Activity has been deleted');
            expect(res.body.body.rows_removed).to.be.equal(1);

            // affirm
            res = await request(app)
                .get(`${baseRoute}/${newId}`)
                .auth(userToken, { type: 'bearer' });
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
        });

        it("Scenario 2: Delete an activity request is successful (Admin)", async() => {
            // arrange
            const data = {
                ...newActivity,
                month_number: newActivityMonth,
                group_size: newActivityGroupSize
            };
            const app = this.app;

            // act
            let res = await request(app)
                .post(baseRoute)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
            expect(res.status).to.be.equal(201);

            // arrange
            const newId = res.body.body.activity_id;

            // act
            res = await request(app)
                .delete(`${baseRoute}/${newId}`)
                .auth(adminToken, { type: 'bearer' }); // admin can delete other's activities even if token erp != newActivity.organizer_erp

            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.headers.message).to.be.equal('Activity has been deleted');
            expect(res.body.body.rows_removed).to.be.equal(1);

            // affirm
            res = await request(app)
                .get(`${baseRoute}/${newId}`)
                .auth(userToken, { type: 'bearer' });
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
        });

        it("Scenario 3: Delete an activity request is unsuccessful due to unknown activity_id", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${unknownActivityId}`)
                .auth(adminToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Activity not found');
        });

        it("Scenario 4: Delete an activity request is forbidden (Unowned Organizer ERP)", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${unOwnedActivityId}`) // <-- has a different organizer_erp than userToken erp
                .auth(userToken, { type: 'bearer' }); // <-- user can't delete others activities i.e. token erp != unOwnedActivity.organizer_erp
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 5: Delete an activity request is unauthorized", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${existingActivity.activity_id}`);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

});