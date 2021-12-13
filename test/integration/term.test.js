/* eslint-disable no-undef */
const request = require("supertest");
const expect = require('chai').expect;
const sinon = require('sinon');
const decache = require('decache');
const jwt = require('jsonwebtoken');
const {Config} = require('../../src/configs/config');

describe("Terms API", () => {
    const API = `/api/${Config.API_VERSION}`;
    const baseRoute = API + "/terms";
    const adminERP = '15030';
    const userERP = '17855';
    const existingTerm = {
        term_id: 1,
        term: 'Fall 2021'
    };
    const unknownTermId = 9999;
    const userToken = jwt.sign({erp: userERP}, Config.SECRET_JWT); // non expiry token
    const adminToken = jwt.sign({erp: adminERP}, Config.SECRET_JWT);

    beforeEach(() => {
        this.app = require('../../src/server').setup();
    });

    context("GET /terms", () => {
        it("Scenario 1: Get all terms request successful", async() => {
            // act
            let res = await request(this.app)
                .get(baseRoute)
                .auth(adminToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            const resBody = res.body.body;
            expect(resBody).to.be.an('array');
            expect(resBody[0]).to.include.all.keys(Object.keys(existingTerm));
        });

        it("Scenario 2: Get all terms request unsuccessful due to zero terms", async() => {
            // arrange
            decache('../../src/server');
            const TermModel = require('../../src/models/term.model');
            const modelStub = sinon.stub(TermModel, 'findAll').callsFake(() => []); // return empty term list
            const app = require('../../src/server').setup();

            // act
            const res = await request(app)
                .get(baseRoute)
                .auth(adminToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Terms not found');
            modelStub.restore();
        });

        it("Scenario 3: Get a term request is forbidden", async() => {
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

        it("Scenario 4: Get all terms request is unauthorized", async() => {
            // act
            let res = await request(this.app).get(baseRoute);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("GET /terms/:id", () => {
        it("Scenario 1: Get a term request successful", async() => {
            // act
            let res = await request(this.app)
                .get(`${baseRoute}/${existingTerm.term_id}`)
                .auth(adminToken, { type: 'bearer' });

            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            const resBody = res.body.body;
            expect(resBody).to.include.all.keys(Object.keys(existingTerm));
            expect(resBody.term_id).to.be.equal(existingTerm.term_id); // should match initially sent id
        });

        it("Scenario 2: Get a term request is unsuccessful due to unknown term_id", async() => {
            // act
            const res = await request(this.app)
                .get(`${baseRoute}/${unknownTermId}`)
                .auth(adminToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Term not found');
        });

        it("Scenario 3: Get a term request is forbidden", async() => {
            // act
            const res = await request(this.app)
                .get(`${baseRoute}/${existingTerm.term_id}`)
                .auth(userToken, { type: 'bearer' }); // <-- api_user token instead of admin token
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 4: Get a term request is unauthorized", async() => {
            // act
            let res = await request(this.app).get(`${baseRoute}/${existingTerm.term_id}`);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("POST /terms", () => {
        const term = 'Spring 2022';
        
        it("Scenario 1: Create a term request is successful", async() => {
            // arrange
            const data = { term };
            const app = this.app;

            // act
            let res = await request(app)
                .post(baseRoute)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(201);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.body).to.include.all.keys(['term_id', 'affected_rows']);
            expect(res.body.body.affected_rows).to.be.equal(1);
            const newId = res.body.body.term_id;

            // affirm
            res = await request(app)
                .get(`${baseRoute}/${newId}`)
                .auth(adminToken, { type: 'bearer' });

            expect(res.status).to.be.equal(200);
            expect(res.body.body).to.be.eql({
                term_id: newId,
                ...data
            });

            // cleanup
            res = await request(app)
                .delete(`${baseRoute}/${newId}`)
                .auth(adminToken, { type: 'bearer' });
            expect(res.status).to.be.equal(200);
        });
        
        it("Scenario 2: Create a term request is incorrect", async() => {
            // arrange
            const data = {
                terms: term // <-- a valid parameter name is 'term'
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
            expect(incorrectParams).to.include.all.members(['term']);
        });

        it("Scenario 3: Create a term request is forbidden", async() => {
            // arrange
            const data = { term };

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

        it("Scenario 4: Create a term request is unauthorized", async() => {
            // arrange
            const data = { term };

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

    context("PATCH /terms/:id", () => {
        const newTermName = 'Summer 2022';
        
        it("Scenario 1: Update a term request is successful", async() => {
            // arrange
            const data = { term: newTermName };
            const app = this.app;

            // act
            let res = await request(app)
                .patch(`${baseRoute}/${existingTerm.term_id}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.body.rows_matched).to.be.equal(1);
            expect(res.body.body.rows_changed).to.be.equal(1);

            
            // affirm
            res = await request(app)
                .get(`${baseRoute}/${existingTerm.term_id}`)
                .auth(adminToken, { type: 'bearer' });
            
            expect(res.status).to.be.equal(200);
            expect(res.body.body).to.be.eql({
                term_id: existingTerm.term_id,
                term: newTermName
            });
            
            // cleanup
            data.term = existingTerm.term;
            res = await request(app)
                .patch(`${baseRoute}/${existingTerm.term_id}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
            expect(res.status).to.be.equal(200);
        });

        it("Scenario 2: Update a term request is unsuccessful due to unknown term_id", async() => {
            // arrange
            const data = { term: newTermName };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${unknownTermId}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Term not found');
        });

        it("Scenario 3: Update a term request is incorrect", async() => {
            // arrange
            const data = {
                terms: newTermName // <-- a invalid update parameter
            };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${existingTerm.term_id}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(422);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('InvalidPropertiesException');
            const incorrectParams = res.body.headers.data.map(o => (o.param));
            expect(incorrectParams).to.include.all.members(['term']);
            const incorrectMsg = res.body.headers.data.map(o => (o.msg));
            expect(incorrectMsg).to.include('Invalid updates!');
        });

        it("Scenario 4: Update a term request is forbidden", async() => {
            // arrange
            const data = { term: newTermName };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${existingTerm.term_id}`)
                .auth(userToken, { type: 'bearer' }) // <-- api_user token instead of admin token
                .send(data);
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 5: Update a term request is unauthorized", async() => {
            // arrange
            const data = { term: newTermName };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${existingTerm.term_id}`)
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("DELETE /terms/:id", () => {
        const term = 'Spring 2022';
        
        it("Scenario 1: Delete a term request is successful", async() => {
            // prepare
            const data = { term };
            const app = this.app;

            // create dummy
            let res = await request(app)
                .post(baseRoute)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
            expect(res.status).to.be.equal(201);

            // arrange
            const newId = res.body.body.term_id;

            // act
            res = await request(app)
                .delete(`${baseRoute}/${newId}`)
                .auth(adminToken, { type: 'bearer' });

            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.headers.message).to.be.equal('Term has been deleted');
            expect(res.body.body.rows_removed).to.be.equal(1);

            // affirm
            res = await request(app)
                .get(`${baseRoute}/${newId}`)
                .auth(adminToken, { type: 'bearer' });
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
        });

        it("Scenario 2: Delete a term request is unsuccessful due to unknown term_id", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${unknownTermId}`)
                .auth(adminToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Term not found');
        });

        it("Scenario 3: Delete a term request is forbidden", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${existingTerm.term_id}`)
                .auth(userToken, { type: 'bearer' }); // <-- api_user token instead of admin token
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 4: Delete a term request is unauthorized", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${existingTerm.term_id}`);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

});