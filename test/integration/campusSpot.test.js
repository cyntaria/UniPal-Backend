/* eslint-disable no-undef */
const request = require("supertest");
const expect = require('chai').expect;
const sinon = require('sinon');
const decache = require('decache');
const jwt = require('jsonwebtoken');
const {Config} = require('../../src/configs/config');

describe("Campus Spots API", () => {
    const API = `/api/${Config.API_VERSION}`;
    const baseRoute = API + "/campus-spots";
    const adminERP = '15030';
    const userERP = '17855';
    const existingCampusSpot = {
        campus_spot_id: 6,
        campus_id: 1,
        campus_spot: 'Courtyard'
    };
    const unknownCampusId = 9999;
    const unknownCampusSpotId = 9999;
    const userToken = jwt.sign({erp: userERP}, Config.SECRET_JWT); // non expiry token
    const adminToken = jwt.sign({erp: adminERP}, Config.SECRET_JWT);

    beforeEach(() => {
        this.app = require('../../src/server').setup();
    });

    context("GET /campus-spots", () => {

        it("Scenario 1: Get all campus spots request successful", async() => {
            // act
            let res = await request(this.app)
                .get(baseRoute)
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            const resBody = res.body.body;
            expect(resBody).to.be.an('array');
            expect(resBody[0]).to.include.keys(['campus_spot_id', 'campus_spot', 'campus_id']); // deep compare two objects using 'eql'
        });

        it("Scenario 2: Get all campus spots request unsuccessful", async() => {
            // arrange
            decache('../../src/server');
            const CampusSpotModel = require('../../src/models/campusSpot.model');
            const modelStub = sinon.stub(CampusSpotModel, 'findAll').callsFake(() => []); // return empty campus_spot list
            const app = require('../../src/server').setup();

            // act
            const res = await request(app)
                .get(baseRoute)
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Campus spots not found');
            modelStub.restore();
        });

        it("Scenario 3: Get all campus spots request is unauthorized", async() => {
            // act
            let res = await request(this.app).get(baseRoute);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("GET /campus-spots/:id", () => {
        it("Scenario 1: Get a campus spot request successful", async() => {
            // act
            let res = await request(this.app)
                .get(`${baseRoute}/${existingCampusSpot.campus_spot_id}`)
                .auth(userToken, { type: 'bearer' });

            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            const resBody = res.body.body;
            expect(resBody).to.include.keys(['campus_spot_id', 'campus_spot', 'campus_id']);
            expect(resBody.campus_spot_id).to.be.equal(existingCampusSpot.campus_spot_id); // should match initially sent id
        });

        it("Scenario 2: Get a campus spot request is unsuccessful", async() => {
            // act
            const res = await request(this.app)
                .get(`${baseRoute}/${unknownCampusSpotId}`)
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Campus spot not found');
        });

        it("Scenario 3: Get a campus spot request is unauthorized", async() => {
            // act
            let res = await request(this.app).get(`${baseRoute}/${existingCampusSpot.campus_spot_id}`);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("POST /campus-spots", () => {
        const campus_spot = 'Garden (SC)';
        const campus_id = existingCampusSpot.campus_id;
        
        it("Scenario 1: Create a campus spot request is successful", async() => {
            // arrange
            const data = { campus_spot, campus_id };
            const app = this.app;

            // act
            let res = await request(app)
                .post(baseRoute)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(201);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.body).to.include.keys(['campus_spot_id', 'affected_rows']);
            expect(res.body.body.affected_rows).to.be.equal(1);
            const newId = res.body.body.campus_spot_id;

            // affirm
            res = await request(app)
                .get(`${baseRoute}/${newId}`)
                .auth(userToken, { type: 'bearer' });

            expect(res.status).to.be.equal(200);
            expect(res.body.body).to.be.eql({
                campus_spot_id: newId,
                campus_spot,
                campus_id
            });

            // cleanup
            res = await request(app)
                .delete(`${baseRoute}/${newId}`)
                .auth(adminToken, { type: 'bearer' });
            expect(res.status).to.be.equal(200);
        });

        it("Scenario 2: Create a campus spot request is unsuccessful", async() => {
            // arrange
            const data = { campus_spot, campus_id: unknownCampusId }; // <-- Non-existent campus_id

            // act
            const res = await request(this.app)
                .post(baseRoute)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(512);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForeignKeyViolationException');
            expect(res.body.headers.message).to.contains('campus_id');
        });

        it("Scenario 3: Create a campus spot request is incorrect", async() => {
            // arrange
            const data = {
                campus_spots: campus_spot // <-- a valid parameter name should be 'campus_spot'
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
            expect(incorrectParams).to.include('campus_spot');
        });

        it("Scenario 4: Create a campus spot request is forbidden", async() => {
            // arrange
            const data = { campus_spot, campus_id };

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

        it("Scenario 5: Create a campus spot request is unauthorized", async() => {
            // arrange
            const data = { campus_spot, campus_id };

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

    context("PATCH /campus-spots/:id", () => {
        const newCampusSpot = 'Garden (SC)';
        
        it("Scenario 1: Update a campus spot request is successful", async() => {
            // arrange
            const data = { campus_spot: newCampusSpot };
            const app = this.app;

            // act
            let res = await request(app)
                .patch(`${baseRoute}/${existingCampusSpot.campus_spot_id}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.body.rows_matched).to.be.equal(1);
            expect(res.body.body.rows_changed).to.be.equal(1);
            
            // affirm
            res = await request(app)
                .get(`${baseRoute}/${existingCampusSpot.campus_spot_id}`)
                .auth(userToken, { type: 'bearer' });
            
            expect(res.status).to.be.equal(200);
            expect(res.body.body).to.be.eql({
                campus_spot_id: existingCampusSpot.campus_spot_id,
                campus_id: existingCampusSpot.campus_id,
                campus_spot: newCampusSpot
            });
            
            // cleanup
            data.campus_spot = existingCampusSpot.campus_spot;
            res = await request(app)
                .patch(`${baseRoute}/${existingCampusSpot.campus_spot_id}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
            expect(res.status).to.be.equal(200);
        });

        it("Scenario 2: Update a campus spot request is unsuccessful", async() => {
            // arrange
            const data = { campus_spot: newCampusSpot };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${unknownCampusSpotId}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Campus spot not found');
        });

        it("Scenario 3: Update a campus spot request is incorrect", async() => {
            // arrange
            const data = {
                campus_spots: newCampusSpot // <-- a valid parameter name should be 'campus_spot'
            };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${existingCampusSpot.campus_spot_id}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(422);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('InvalidPropertiesException');
            const incorrectParams = res.body.headers.data.map(o => (o.param));
            expect(incorrectParams).to.include('campus_spot');
        });

        it("Scenario 4: Update a campus spot request is forbidden", async() => {
            // arrange
            const data = { campus_spot: newCampusSpot };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${existingCampusSpot.campus_spot_id}`)
                .auth(userToken, { type: 'bearer' }) // <-- api_user token instead of admin token
                .send(data);
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 5: Update a campus spot request is unauthorized", async() => {
            // arrange
            const data = { campus_spot: newCampusSpot };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${existingCampusSpot.campus_spot_id}`)
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("DELETE /campus-spots/:id", () => {
        const campus_spot = 'Garden (SC)';
        const campus_id = existingCampusSpot.campus_id;

        it("Scenario 1: Delete a campus spot request is successful", async() => {
            // prepare
            const data = { campus_spot, campus_id };
            const app = this.app;

            // create dummy
            let res = await request(app)
                .post(baseRoute)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
            expect(res.status).to.be.equal(201);

            // arrange
            const newId = res.body.body.campus_spot_id;

            // act
            res = await request(app)
                .delete(`${baseRoute}/${newId}`)
                .auth(adminToken, { type: 'bearer' });

            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.headers.message).to.be.equal('Campus spot has been deleted');
            expect(res.body.body.rows_removed).to.be.equal(1);

            // affirm
            res = await request(app)
                .get(`${baseRoute}/${newId}`)
                .auth(userToken, { type: 'bearer' });
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
        });

        it("Scenario 2: Delete a campus spot request is unsuccessful", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${unknownCampusSpotId}`)
                .auth(adminToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Campus spot not found');
        });

        it("Scenario 3: Delete a campus spot request is forbidden", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${existingCampusSpot.campus_spot_id}`)
                .auth(userToken, { type: 'bearer' }); // <-- api_user token instead of admin token
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 4: Delete a campus spot request is unauthorized", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${existingCampusSpot.campus_spot_id}`);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

});