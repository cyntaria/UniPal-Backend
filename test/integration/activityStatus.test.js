/* eslint-disable no-undef */
const request = require("supertest");
const expect = require('chai').expect;
const sinon = require('sinon');
const decache = require('decache');
const jwt = require('jsonwebtoken');
const {Config} = require('../../src/configs/config');

describe("Activity Statuses API", () => {
    const API = `/api/${Config.API_VERSION}`;
    const baseRoute = API + "/activity-statuses";
    const adminERP = '15030';
    const userERP = '17855';
    const existingActivityStatus = {
        activity_status_id: 1,
        activity_status: 'Happening'
    };
    const unknownActivityStatusId = 2000;
    const userToken = jwt.sign({erp: userERP}, Config.SECRET_JWT); // non expiry token
    const adminToken = jwt.sign({erp: adminERP}, Config.SECRET_JWT);

    beforeEach(() => {
        this.app = require('../../src/server').setup();
    });

    context("GET /activity-statuses", () => {

        it("Scenario 1: Get all activity statuses request successful", async() => {
            // act
            let res = await request(this.app)
                .get(baseRoute);
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            const resBody = res.body.body;
            expect(resBody).to.be.an('array');
            expect(resBody[0]).to.include.keys(['activity_status_id', 'activity_status']); // deep compare two objects using 'eql'
        });

        it("Scenario 2: Get all activity statuses request unsuccessful", async() => {
            // arrange
            decache('../../src/server');
            const ActivityStatusModel = require('../../src/models/activityStatus.model');
            const modelStub = sinon.stub(ActivityStatusModel, 'findAll').callsFake(() => []); // return empty activity_status list
            const app = require('../../src/server').setup();

            // act
            const res = await request(app)
                .get(baseRoute);
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Activity statuses not found');
            modelStub.restore();
        });
    });

    context("GET /activity-statuses/:id", () => {
        it("Scenario 1: Get a activity status request successful", async() => {
            // act
            let res = await request(this.app)
                .get(`${baseRoute}/${existingActivityStatus.activity_status_id}`)
                .auth(userToken, { type: 'bearer' });

            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            const resBody = res.body.body;
            expect(resBody).to.include.keys(['activity_status_id', 'activity_status']);
            expect(resBody.activity_status_id).to.be.eql(existingActivityStatus.activity_status_id); // should match initially sent id
        });

        it("Scenario 2: Get a activity status request is unsuccessful", async() => {
            // act
            const res = await request(this.app)
                .get(`${baseRoute}/${unknownActivityStatusId}`)
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Activity status not found');
        });

        it("Scenario 3: Get a activity status request is unauthorized", async() => {
            // act
            let res = await request(this.app).get(`${baseRoute}/${existingActivityStatus.activity_status_id}`);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("POST /activity-statuses", () => {
        const activity_status = 'Postponed';
        
        it("Scenario 1: Create a activity status request is successful", async() => {
            // arrange
            const data = { activity_status };
            const app = this.app;

            // act
            let res = await request(app)
                .post(baseRoute)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(201);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.body).to.include.keys(['activity_status_id', 'affected_rows']);
            expect(res.body.body.affected_rows).to.be.equal(1);
            const newId = res.body.body.activity_status_id;

            // affirm
            res = await request(app)
                .get(`${baseRoute}/${newId}`)
                .auth(userToken, { type: 'bearer' });

            expect(res.status).to.be.equal(200);
            expect(res.body.body).to.be.eql({
                activity_status_id: newId,
                activity_status: activity_status
            });

            // cleanup
            res = await request(app)
                .delete(`${baseRoute}/${newId}`)
                .auth(adminToken, { type: 'bearer' });
            expect(res.status).to.be.equal(200);
        });

        it("Scenario 2: Create a activity status request is incorrect", async() => {
            // arrange
            const data = {
                activity_statuses: activity_status // <-- a valid parameter name should be 'activity_status'
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
            expect(incorrectParams).to.include('activity_status');
        });

        it("Scenario 3: Create a activity status request is forbidden", async() => {
            // arrange
            const data = { activity_status };

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

        it("Scenario 4: Create a activity status request is unauthorized", async() => {
            // arrange
            const data = { activity_status };

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

    context("PATCH /activity-statuses/:id", () => {
        const newActivityStatus = 'Postponed';
        
        it("Scenario 1: Update a activity status request is successful", async() => {
            // arrange
            const data = { activity_status: newActivityStatus };
            const app = this.app;

            // act
            let res = await request(app)
                .patch(`${baseRoute}/${existingActivityStatus.activity_status_id}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.body.rows_matched).to.be.equal(1);
            expect(res.body.body.rows_changed).to.be.equal(1);

            // affirm
            res = await request(app)
                .get(`${baseRoute}/${existingActivityStatus.activity_status_id}`)
                .auth(userToken, { type: 'bearer' });
            
            expect(res.status).to.be.equal(200);
            expect(res.body.body).to.be.eql({
                activity_status_id: existingActivityStatus.activity_status_id,
                activity_status: newActivityStatus
            });
            
            // cleanup
            data.activity_status = existingActivityStatus.activity_status;
            res = await request(app)
                .patch(`${baseRoute}/${existingActivityStatus.activity_status_id}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
            expect(res.status).to.be.equal(200);
        });

        it("Scenario 2: Update a activity status request is unsuccessful", async() => {
            // arrange
            const data = { activity_status: newActivityStatus };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${unknownActivityStatusId}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Activity status not found');
        });

        it("Scenario 3: Update a activity status request is incorrect", async() => {
            // arrange
            const data = {
                activity_statuses: newActivityStatus // <-- a valid parameter name should be 'activity_status'
            };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${existingActivityStatus.activity_status_id}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(422);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('InvalidPropertiesException');
            const incorrectParams = res.body.headers.data.map(o => (o.param));
            expect(incorrectParams).to.include('activity_status');
        });

        it("Scenario 4: Update a activity status request is forbidden", async() => {
            // arrange
            const data = { activity_status: newActivityStatus };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${existingActivityStatus.activity_status_id}`)
                .auth(userToken, { type: 'bearer' }) // <-- api_user token instead of admin token
                .send(data);
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 5: Update a activity status request is unauthorized", async() => {
            // arrange
            const data = { activity_status: newActivityStatus };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${existingActivityStatus.activity_status_id}`)
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("DELETE /activity-statuses/:id", () => {
        const activity_status = 'Postponed';
        
        it("Scenario 1: Delete a activity status request is successful", async() => {
            // prepare
            const data = { activity_status };
            const app = this.app;

            // create dummy
            let res = await request(app)
                .post(baseRoute)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
            expect(res.status).to.be.equal(201);

            // arrange
            const newId = res.body.body.activity_status_id;

            // act
            res = await request(app)
                .delete(`${baseRoute}/${newId}`)
                .auth(adminToken, { type: 'bearer' });

            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.headers.message).to.be.equal('Activity status has been deleted');
            expect(res.body.body.rows_removed).to.be.equal(1);

            // affirm
            res = await request(app)
                .get(`${baseRoute}/${newId}`)
                .auth(userToken, { type: 'bearer' });
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
        });

        it("Scenario 2: Delete a activity status request is unsuccessful", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${unknownActivityStatusId}`)
                .auth(adminToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Activity status not found');
        });

        it("Scenario 3: Delete a activity status request is forbidden", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${existingActivityStatus.activity_status_id}`)
                .auth(userToken, { type: 'bearer' }); // <-- api_user token instead of admin token
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 4: Delete a activity status request is unauthorized", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${existingActivityStatus.activity_status_id}`);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

});