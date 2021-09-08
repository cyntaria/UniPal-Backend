/* eslint-disable no-undef */
const request = require("supertest");
const expect = require('chai').expect;
const sinon = require('sinon');
const decache = require('decache');
const jwt = require('jsonwebtoken');
const {Config} = require('../../src/configs/config');

describe("Campuses API", () => {
    const API = `/api/${Config.API_VERSION}`;
    const baseRoute = API + "/campuses";
    const adminERP = '15030';
    const userERP = '17855';
    const existingCampus = {
        campus_id: 1,
        campus: 'MAIN',
        location_url: 'https://maps.app.goo.gl/LvH61VeZZVfyggHw6'
    };
    const unknownCampusId = 2000;
    const userToken = jwt.sign({erp: userERP}, Config.SECRET_JWT); // non expiry token
    const adminToken = jwt.sign({erp: adminERP}, Config.SECRET_JWT);

    beforeEach(() => {
        this.app = require('../../src/server').setup();
    });

    context("GET /campuses", () => {

        it("Scenario 1: Get all campuses request successful", async() => {
            // act
            let res = await request(this.app)
                .get(`${baseRoute}`)
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            const resBody = res.body.body;
            expect(resBody).to.be.an('array');
            expect(resBody[0]).to.include.keys(['campus_id', 'campus', 'location_url']); // deep compare two objects using 'eql'
        });

        it("Scenario 2: Get all campuses request unsuccessful", async() => {
            // arrange
            decache('../../src/server');
            const CampusModel = require('../../src/models/campus.model');
            const modelStub = sinon.stub(CampusModel, 'findAll').callsFake(() => []); // return empty campus list
            const app = require('../../src/server').setup();

            // act
            const res = await request(app)
                .get(`${baseRoute}`)
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Campuses not found');
            modelStub.restore();
        });

        it("Scenario 3: Get all campuses request is unauthorized", async() => {
            // act
            let res = await request(this.app).get(`${baseRoute}`);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("GET /campuses/:id", () => {
        it("Scenario 1: Get a campus request successful", async() => {
            // act
            let res = await request(this.app)
                .get(`${baseRoute}/${existingCampus.campus_id}`)
                .auth(userToken, { type: 'bearer' });

            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            const resBody = res.body.body;
            expect(resBody).to.include.keys(['campus_id', 'campus', 'location_url']);
            expect(resBody.campus_id).to.be.eql(existingCampus.campus_id); // should match initially sent id
        });

        it("Scenario 2: Get a campus request is unsuccessful", async() => {
            // act
            const res = await request(this.app)
                .get(`${baseRoute}/${unknownCampusId}`)
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Campus not found');
        });

        it("Scenario 3: Get a campus request is unauthorized", async() => {
            // act
            let res = await request(this.app).get(`${baseRoute}/${existingCampus.campus_id}`);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("POST /campuses", () => {
        const campus = 'SUKKUR';
        const location_url = 'https://maps.app.goo.gl/LvH61VeZZVfyggHw6';
        
        it("Scenario 1: Create a campus request is successful", async() => {
            // arrange
            const data = { campus, location_url };
            const app = this.app;

            // act
            let res = await request(app)
                .post(`${baseRoute}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(201);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.body).to.include.keys(['campus_id', 'affected_rows']);
            expect(res.body.body.affected_rows).to.be.equal(1);
            const newId = res.body.body.campus_id;

            // affirm
            res = await request(app)
                .get(`${baseRoute}/${newId}`)
                .auth(userToken, { type: 'bearer' });

            expect(res.status).to.be.equal(200);
            expect(res.body.body).to.be.eql({
                campus_id: newId,
                campus: campus,
                location_url: location_url
            });

            // cleanup
            res = await request(app)
                .delete(`${baseRoute}/${newId}`)
                .auth(adminToken, { type: 'bearer' });
            expect(res.status).to.be.equal(200);
        });

        it("Scenario 2: Create a campus request is incorrect", async() => {
            // arrange
            const data = {
                campuses: campus, // <-- a valid parameter name should be 'campus'
                location_url: 'https://maps.app.goo.gl/LvH61VeZZVfyggHw6'
            };

            // act
            const res = await request(this.app)
                .post(`${baseRoute}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(422);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('InvalidPropertiesException');
            const incorrectParams = res.body.headers.data.map(o => (o.param));
            expect(incorrectParams).to.include('campus');
        });

        it("Scenario 3: Create a campus request is forbidden", async() => {
            // arrange
            const data = { campus, location_url };

            // act
            const res = await request(this.app)
                .post(`${baseRoute}`)
                .auth(userToken, { type: 'bearer' }) // <-- api_user token instead of admin token
                .send(data);
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 4: Create a campus request is unauthorized", async() => {
            // arrange
            const data = { campus, location_url };

            // act
            const res = await request(this.app)
                .post(`${baseRoute}`)
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("PATCH /campuses/:id", () => {
        const newCampus = 'SUKKUR';

        it("Scenario 1: Update a campus request is successful", async() => {
            // arrange
            const data = { campus: newCampus };
            const app = this.app;

            // act
            let res = await request(app)
                .patch(`${baseRoute}/${existingCampus.campus_id}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.body.rows_matched).to.be.equal(1);
            expect(res.body.body.rows_changed).to.be.equal(1);

            
            // affirm
            res = await request(app)
                .get(`${baseRoute}/${existingCampus.campus_id}`)
                .auth(userToken, { type: 'bearer' });
            
            expect(res.status).to.be.equal(200);
            expect(res.body.body).to.be.eql({
                campus_id: existingCampus.campus_id,
                campus: newCampus,
                location_url: existingCampus.location_url
            });
            
            // cleanup
            data.campus = existingCampus.campus;
            res = await request(app)
                .patch(`${baseRoute}/${existingCampus.campus_id}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
            expect(res.status).to.be.equal(200);
        });

        it("Scenario 2: Update a campus request is unsuccessful", async() => {
            // arrange
            const data = { campus: newCampus };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${unknownCampusId}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Campus not found');
        });

        it("Scenario 3: Update a campus request is incorrect", async() => {
            // arrange
            const data = {
                campuses: newCampus // <-- an valid parameter name should be 'campus'
            };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${existingCampus.campus_id}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(422);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('InvalidPropertiesException');
            const incorrectParams = res.body.headers.data.map(o => (o.msg));
            expect(incorrectParams).to.include('Invalid updates!');
        });

        it("Scenario 4: Update a campus request is forbidden", async() => {
            // arrange
            const data = { campus: newCampus };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${existingCampus.campus_id}`)
                .auth(userToken, { type: 'bearer' }) // <-- api_user token instead of admin token
                .send(data);
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 5: Update a campus request is unauthorized", async() => {
            // arrange
            const data = { campus: newCampus };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${existingCampus.campus_id}`)
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("DELETE /campuses", () => {
        const campus = 'SUKKUR';
        const location_url = 'https://maps.app.goo.gl/LvH61VeZZVfyggHw6';
        
        it("Scenario 1: Delete a campus request is successful", async() => {
            // prepare
            const data = { campus, location_url };
            const app = this.app;

            // create dummy
            let res = await request(app)
                .post(`${baseRoute}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
            expect(res.status).to.be.equal(201);

            // arrange
            const newId = res.body.body.campus_id;

            // act
            res = await request(app)
                .delete(`${baseRoute}/${newId}`)
                .auth(adminToken, { type: 'bearer' });

            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.headers.message).to.be.equal('Campus has been deleted');
            expect(res.body.body.rows_removed).to.be.equal(1);

            // affirm
            res = await request(app)
                .get(`${baseRoute}/${newId}`)
                .auth(userToken, { type: 'bearer' });
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
        });

        it("Scenario 2: Delete a campus request is unsuccessful", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${unknownCampusId}`)
                .auth(adminToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Campus not found');
        });

        it("Scenario 3: Delete a campus request is forbidden", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${existingCampus.campus_id}`)
                .auth(userToken, { type: 'bearer' }); // <-- api_user token instead of admin token
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 4: Delete a campus request is unauthorized", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${existingCampus.campus_id}`);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

});