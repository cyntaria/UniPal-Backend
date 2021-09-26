/* eslint-disable no-undef */
const request = require("supertest");
const expect = require('chai').expect;
const sinon = require('sinon');
const decache = require('decache');
const jwt = require('jsonwebtoken');
const {Config} = require('../../src/configs/config');

describe("Activity Types API", () => {
    const API = `/api/${Config.API_VERSION}`;
    const baseRoute = API + "/activity-types";
    const adminERP = '15030';
    const userERP = '17855';
    const existingActivityType = {
        activity_type_id: 1,
        activity_type: 'Sports'
    };
    const unknownActivityTypeId = 2000;
    const userToken = jwt.sign({erp: userERP}, Config.SECRET_JWT); // non expiry token
    const adminToken = jwt.sign({erp: adminERP}, Config.SECRET_JWT);

    beforeEach(() => {
        this.app = require('../../src/server').setup();
    });

    context("GET /activity-types", () => {

        it("Scenario 1: Get all activity types request successful", async() => {
            // act
            let res = await request(this.app)
                .get(baseRoute)
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            const resBody = res.body.body;
            expect(resBody).to.be.an('array');
            expect(resBody[0]).to.include.keys(['activity_type_id', 'activity_type']); // deep compare two objects using 'eql'
        });

        it("Scenario 2: Get all activity types request unsuccessful", async() => {
            // arrange
            decache('../../src/server');
            const ActivityTypeModel = require('../../src/models/activityType.model');
            const modelStub = sinon.stub(ActivityTypeModel, 'findAll').callsFake(() => []); // return empty activity_type list
            const app = require('../../src/server').setup();

            // act
            const res = await request(app)
                .get(baseRoute)
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Activity types not found');
            modelStub.restore();
        });

        it("Scenario 3: Get all activity types request is unauthorized", async() => {
            // act
            let res = await request(this.app).get(baseRoute);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("GET /activity-types/:id", () => {
        it("Scenario 1: Get a activity type request successful", async() => {
            // act
            let res = await request(this.app)
                .get(`${baseRoute}/${existingActivityType.activity_type_id}`)
                .auth(userToken, { type: 'bearer' });

            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            const resBody = res.body.body;
            expect(resBody).to.include.keys(['activity_type_id', 'activity_type']);
            expect(resBody.activity_type_id).to.be.eql(existingActivityType.activity_type_id); // should match initially sent id
        });

        it("Scenario 2: Get a activity type request is unsuccessful", async() => {
            // act
            const res = await request(this.app)
                .get(`${baseRoute}/${unknownActivityTypeId}`)
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Activity type not found');
        });

        it("Scenario 3: Get a activity type request is unauthorized", async() => {
            // act
            let res = await request(this.app).get(`${baseRoute}/${existingActivityType.activity_type_id}`);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("POST /activity-types", () => {
        const activity_type = 'Photography';
        
        it("Scenario 1: Create a activity type request is successful", async() => {
            // arrange
            const data = { activity_type };
            const app = this.app;

            // act
            let res = await request(app)
                .post(baseRoute)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(201);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.body).to.include.keys(['activity_type_id', 'affected_rows']);
            expect(res.body.body.affected_rows).to.be.equal(1);
            const newId = res.body.body.activity_type_id;

            // affirm
            res = await request(app)
                .get(`${baseRoute}/${newId}`)
                .auth(userToken, { type: 'bearer' });

            expect(res.status).to.be.equal(200);
            expect(res.body.body).to.be.eql({
                activity_type_id: newId,
                activity_type: activity_type
            });

            // cleanup
            res = await request(app)
                .delete(`${baseRoute}/${newId}`)
                .auth(adminToken, { type: 'bearer' });
            expect(res.status).to.be.equal(200);
        });

        it("Scenario 2: Create a activity type request is incorrect", async() => {
            // arrange
            const data = {
                activity_types: activity_type // <-- a valid parameter name should be 'activity_type'
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
            expect(incorrectParams).to.include('activity_type');
        });

        it("Scenario 3: Create a activity type request is forbidden", async() => {
            // arrange
            const data = { activity_type };

            // act
            const res = await request(this.app)
                .post(baseRoute)
                .auth(userToken, { type: 'bearer' }) // <-- api_user token instead of admin token
                .send(data);
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 4: Create a activity type request is unauthorized", async() => {
            // arrange
            const data = { activity_type };

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

    context("PATCH /activity-types/:id", () => {
        const newActivityType = 'Photography';
        
        it("Scenario 1: Update a activity type request is successful", async() => {
            // arrange
            const data = { activity_type: newActivityType };
            const app = this.app;

            // act
            let res = await request(app)
                .patch(`${baseRoute}/${existingActivityType.activity_type_id}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.body.rows_matched).to.be.equal(1);
            expect(res.body.body.rows_changed).to.be.equal(1);

            // affirm
            res = await request(app)
                .get(`${baseRoute}/${existingActivityType.activity_type_id}`)
                .auth(userToken, { type: 'bearer' });
            
            expect(res.status).to.be.equal(200);
            expect(res.body.body).to.be.eql({
                activity_type_id: existingActivityType.activity_type_id,
                activity_type: newActivityType
            });
            
            // cleanup
            data.activity_type = existingActivityType.activity_type;
            res = await request(app)
                .patch(`${baseRoute}/${existingActivityType.activity_type_id}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
            expect(res.status).to.be.equal(200);
        });

        it("Scenario 2: Update a activity type request is unsuccessful", async() => {
            // arrange
            const data = { activity_type: newActivityType };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${unknownActivityTypeId}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Activity type not found');
        });

        it("Scenario 3: Update a activity type request is incorrect", async() => {
            // arrange
            const data = {
                activity_types: newActivityType // <-- a valid parameter name should be 'activity_type'
            };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${existingActivityType.activity_type_id}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(422);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('InvalidPropertiesException');
            const incorrectParams = res.body.headers.data.map(o => (o.param));
            expect(incorrectParams).to.include('activity_type');
        });

        it("Scenario 4: Update a activity type request is forbidden", async() => {
            // arrange
            const data = { activity_type: newActivityType };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${existingActivityType.activity_type_id}`)
                .auth(userToken, { type: 'bearer' }) // <-- api_user token instead of admin token
                .send(data);
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 5: Update a activity type request is unauthorized", async() => {
            // arrange
            const data = { activity_type: newActivityType };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${existingActivityType.activity_type_id}`)
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("DELETE /activity-types/:id", () => {
        const activity_type = 'Photography';
        
        it("Scenario 1: Delete a activity type request is successful", async() => {
            // prepare
            const data = { activity_type };
            const app = this.app;

            // create dummy
            let res = await request(app)
                .post(baseRoute)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
            expect(res.status).to.be.equal(201);

            // arrange
            const newId = res.body.body.activity_type_id;

            // act
            res = await request(app)
                .delete(`${baseRoute}/${newId}`)
                .auth(adminToken, { type: 'bearer' });

            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.headers.message).to.be.equal('Activity type has been deleted');
            expect(res.body.body.rows_removed).to.be.equal(1);

            // affirm
            res = await request(app)
                .get(`${baseRoute}/${newId}`)
                .auth(userToken, { type: 'bearer' });
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
        });

        it("Scenario 2: Delete a activity type request is unsuccessful", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${unknownActivityTypeId}`)
                .auth(adminToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Activity type not found');
        });

        it("Scenario 3: Delete a activity type request is forbidden", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${existingActivityType.activity_type_id}`)
                .auth(userToken, { type: 'bearer' }); // <-- api_user token instead of admin token
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 4: Delete a activity type request is unauthorized", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${existingActivityType.activity_type_id}`);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

});