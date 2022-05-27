/* eslint-disable no-undef */
const request = require("supertest");
const expect = require('chai').expect;
const sinon = require('sinon');
const decache = require('decache');
const jwt = require('jsonwebtoken');
const {Config} = require('../../src/configs/config');

describe("Timeslots API", () => {
    const API = `/api/${Config.API_VERSION}`;
    const baseRoute = API + "/timeslots";
    const adminERP = '15030';
    const userERP = '17855';
    const existingTimeslot = {
        timeslot_id: 1,
        start_time: '08:30:00',
        end_time: '09:45:00',
        slot_number: 1
    };
    const unknownTimeslotId = 9999;
    const userToken = jwt.sign({erp: userERP}, Config.SECRET_JWT); // non expiry token
    const adminToken = jwt.sign({erp: adminERP}, Config.SECRET_JWT);

    beforeEach(() => {
        this.app = require('../../src/server').setup();
    });

    context("GET /timeslots", () => {

        it("Scenario 1: Get all timeslots request successful", async() => {
            // act
            let res = await request(this.app)
                .get(baseRoute)
                .auth(adminToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            const resBody = res.body.body;
            expect(resBody).to.be.an('array');
            expect(resBody[0]).to.include.all.keys(Object.keys(existingTimeslot));
        });

        it("Scenario 2: Get all timeslots request unsuccessful due to zero timeslots", async() => {
            // arrange
            decache('../../src/server');
            const TimeslotModel = require('../../src/models/timeslot.model');
            const modelStub = sinon.stub(TimeslotModel, 'findAll').callsFake(() => []); // return empty timeslot list
            const app = require('../../src/server').setup();

            // act
            const res = await request(app)
                .get(baseRoute)
                .auth(adminToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Timeslots not found');
            modelStub.restore();
        });

        it("Scenario 3: Get a timeslot request is forbidden", async() => {
            // act
            const res = await request(this.app)
                .get(baseRoute)
                .auth(userToken, { type: 'bearer' }); // <-- api_user token instead of admin token
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });
    });

    context("GET /timeslots/:id", () => {
        it("Scenario 1: Get a timeslot request successful", async() => {
            // act
            let res = await request(this.app)
                .get(`${baseRoute}/${existingTimeslot.timeslot_id}`)
                .auth(adminToken, { type: 'bearer' });

            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            const resBody = res.body.body;
            expect(resBody).to.include.all.keys(Object.keys(existingTimeslot));
            expect(resBody.timeslot_id).to.be.equal(existingTimeslot.timeslot_id); // should match initially sent id
        });

        it("Scenario 2: Get a timeslot request is unsuccessful due to unknown timeslot_id", async() => {
            // act
            const res = await request(this.app)
                .get(`${baseRoute}/${unknownTimeslotId}`)
                .auth(adminToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Timeslot not found');
        });

        it("Scenario 4: Get a timeslot request is unauthorized", async() => {
            // act
            let res = await request(this.app).get(`${baseRoute}/${existingTimeslot.timeslot_id}`);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("POST /timeslots", () => {
        const start_time = '19:00:00';
        const end_time = '20:15:00';
        const slot_number = 8;
        
        it("Scenario 1: Create a timeslot request is successful", async() => {
            // arrange
            const data = { start_time, end_time, slot_number };
            const app = this.app;

            // act
            let res = await request(app)
                .post(baseRoute)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(201);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.body).to.include.all.keys(['timeslot_id', 'affected_rows']);
            expect(res.body.body.affected_rows).to.be.equal(1);
            const newId = res.body.body.timeslot_id;

            // affirm
            res = await request(app)
                .get(`${baseRoute}/${newId}`)
                .auth(adminToken, { type: 'bearer' });

            expect(res.status).to.be.equal(200);
            expect(res.body.body).to.be.eql({
                timeslot_id: newId,
                ...data
            });

            // cleanup
            res = await request(app)
                .delete(`${baseRoute}/${newId}`)
                .auth(adminToken, { type: 'bearer' });
            expect(res.status).to.be.equal(200);
        });

        it("Scenario 2: Create a timeslot request is unsuccessful due to timeslot conflicts", async() => {
            // arrange
            const data = { start_time: existingTimeslot.start_time, end_time, slot_number }; // start_time conflict

            // act
            const res = await request(this.app)
                .post(baseRoute)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(500);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('CreateFailedException');
            expect(res.body.headers.message).to.be.equal('Timeslot conflicts found');
        });
        
        it("Scenario 3: Create a timeslot request is incorrect", async() => {
            // arrange
            const data = {
                timeslots: start_time, // <-- a valid parameter name is 'start_time'
                end_time,
                slot_number: 'asb' // has to be an int
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
            expect(incorrectParams).to.include.all.members(['start_time', 'slot_number']);
        });

        it("Scenario 4: Create a timeslot request is forbidden", async() => {
            // arrange
            const data = { start_time, end_time, slot_number };

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

        it("Scenario 5: Create a timeslot request is unauthorized", async() => {
            // arrange
            const data = { start_time, end_time, slot_number };

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

    context("PATCH /timeslots/:id", () => {
        const newTimeslotNumber = 9;
        
        it("Scenario 1: Update a timeslot request is successful", async() => {
            // arrange
            const data = { slot_number: newTimeslotNumber };
            const app = this.app;

            // act
            let res = await request(app)
                .patch(`${baseRoute}/${existingTimeslot.timeslot_id}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.body.rows_matched).to.be.equal(1);
            expect(res.body.body.rows_changed).to.be.equal(1);

            
            // affirm
            res = await request(app)
                .get(`${baseRoute}/${existingTimeslot.timeslot_id}`)
                .auth(adminToken, { type: 'bearer' });
            
            expect(res.status).to.be.equal(200);
            expect(res.body.body).to.be.eql({
                timeslot_id: existingTimeslot.timeslot_id,
                start_time: existingTimeslot.start_time,
                end_time: existingTimeslot.end_time,
                slot_number: newTimeslotNumber
            });
            
            // cleanup
            data.slot_number = existingTimeslot.slot_number;
            res = await request(app)
                .patch(`${baseRoute}/${existingTimeslot.timeslot_id}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
            expect(res.status).to.be.equal(200);
        });

        it("Scenario 2: Update a timeslot request is unsuccessful due to unknown timeslot code", async() => {
            // arrange
            const data = { slot_number: newTimeslotNumber };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${unknownTimeslotId}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Timeslot not found');
        });

        it("Scenario 3: Update a timeslot request is unsuccessful due to timeslot conflicts", async() => {
            // arrange
            const data = { start_time: existingTimeslot.end_time }; // can't be the same time

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${existingTimeslot.timeslot_id}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(500);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('UpdateFailedException');
            expect(res.body.headers.message).to.be.equal('Timeslot conflicts found');
        });

        it("Scenario 4: Update a timeslot request is incorrect", async() => {
            // arrange
            const data = {
                timeslots: newTimeslotNumber // <-- a invalid update parameter
            };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${existingTimeslot.timeslot_id}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(422);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('InvalidPropertiesException');
            const incorrectMsg = res.body.headers.data.map(o => (o.msg));
            expect(incorrectMsg).to.include('Invalid updates!');
        });

        it("Scenario 5: Update a timeslot request is forbidden", async() => {
            // arrange
            const data = { slot_number: newTimeslotNumber };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${existingTimeslot.timeslot_id}`)
                .auth(userToken, { type: 'bearer' }) // <-- api_user token instead of admin token
                .send(data);
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 6: Update a timeslot request is unauthorized", async() => {
            // arrange
            const data = { slot_number: newTimeslotNumber };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${existingTimeslot.timeslot_id}`)
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("DELETE /timeslots/:id", () => {
        const start_time = '19:00:00';
        const end_time = '20:15:00';
        const slot_number = 8;
        
        it("Scenario 1: Delete a timeslot request is successful", async() => {
            // prepare
            const data = { start_time, end_time, slot_number };
            const app = this.app;

            // create dummy
            let res = await request(app)
                .post(baseRoute)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
            expect(res.status).to.be.equal(201);

            // arrange
            const newId = res.body.body.timeslot_id;

            // act
            res = await request(app)
                .delete(`${baseRoute}/${newId}`)
                .auth(adminToken, { type: 'bearer' });

            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.headers.message).to.be.equal('Timeslot has been deleted');
            expect(res.body.body.rows_removed).to.be.equal(1);

            // affirm
            res = await request(app)
                .get(`${baseRoute}/${newId}`)
                .auth(adminToken, { type: 'bearer' });
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
        });

        it("Scenario 2: Delete a timeslot request is unsuccessful due to unknown timeslot code", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${unknownTimeslotId}`)
                .auth(adminToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Timeslot not found');
        });

        it("Scenario 3: Delete a timeslot request is forbidden", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${existingTimeslot.timeslot_id}`)
                .auth(userToken, { type: 'bearer' }); // <-- api_user token instead of admin token
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 4: Delete a timeslot request is unauthorized", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${existingTimeslot.timeslot_id}`);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

});