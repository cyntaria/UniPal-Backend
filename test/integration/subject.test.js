/* eslint-disable no-undef */
const request = require("supertest");
const expect = require('chai').expect;
const sinon = require('sinon');
const decache = require('decache');
const jwt = require('jsonwebtoken');
const {Config} = require('../../src/configs/config');

describe("Subjects API", () => {
    const API = `/api/${Config.API_VERSION}`;
    const baseRoute = API + "/subjects";
    const adminERP = '15030';
    const userERP = '17855';
    const existingSubject = {
        subject_code: 'MTS101',
        subject: 'Calculus 1'
    };
    const unknownSubjectId = 'MGT101';
    const userToken = jwt.sign({erp: userERP}, Config.SECRET_JWT); // non expiry token
    const adminToken = jwt.sign({erp: adminERP}, Config.SECRET_JWT);

    beforeEach(() => {
        this.app = require('../../src/server').setup();
    });

    context("GET /subjects", () => {

        it("Scenario 1: Get all subjects request successful", async() => {
            // act
            let res = await request(this.app)
                .get(baseRoute)
                .auth(adminToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            const resBody = res.body.body;
            expect(resBody).to.be.an('array');
            expect(resBody[0]).to.include.all.keys(['subject_code', 'subject']);
        });

        it("Scenario 2: Get all subjects request unsuccessful due to zero subjects", async() => {
            // arrange
            decache('../../src/server');
            const SubjectModel = require('../../src/models/subject.model');
            const modelStub = sinon.stub(SubjectModel, 'findAll').callsFake(() => []); // return empty subject list
            const app = require('../../src/server').setup();

            // act
            const res = await request(app)
                .get(baseRoute)
                .auth(adminToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Subjects not found');
            modelStub.restore();
        });

        it("Scenario 3: Get a subject request is forbidden", async() => {
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

        it("Scenario 4: Get all subjects request is unauthorized", async() => {
            // act
            let res = await request(this.app).get(baseRoute);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("GET /subjects/:id", () => {
        it("Scenario 1: Get a subject request successful", async() => {
            // act
            let res = await request(this.app)
                .get(`${baseRoute}/${existingSubject.subject_code}`)
                .auth(adminToken, { type: 'bearer' });

            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            const resBody = res.body.body;
            expect(resBody).to.include.all.keys(['subject_code', 'subject']);
            expect(resBody.subject_code).to.be.equal(existingSubject.subject_code); // should match initially sent id
        });

        it("Scenario 2: Get a subject request is unsuccessful due to unknown subject", async() => {
            // act
            const res = await request(this.app)
                .get(`${baseRoute}/${unknownSubjectId}`)
                .auth(adminToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Subject not found');
        });

        it("Scenario 3: Get a subject request is forbidden", async() => {
            // act
            const res = await request(this.app)
                .get(`${baseRoute}/${existingSubject.subject_code}`)
                .auth(userToken, { type: 'bearer' }); // <-- api_user token instead of admin token
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 4: Get a subject request is unauthorized", async() => {
            // act
            let res = await request(this.app).get(`${baseRoute}/${existingSubject.subject_code}`);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("POST /subjects", () => {
        const subject = 'Financial Management';
        const subject_code = 'FIN401';
        
        it("Scenario 1: Create a subject request is successful", async() => {
            // arrange
            const data = { subject, subject_code };
            const app = this.app;

            // act
            let res = await request(app)
                .post(baseRoute)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(201);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.body).to.include.all.keys(['affected_rows']);
            expect(res.body.body.affected_rows).to.be.equal(1);
            const newId = data.subject_code;

            // affirm
            res = await request(app)
                .get(`${baseRoute}/${newId}`)
                .auth(adminToken, { type: 'bearer' });

            expect(res.status).to.be.equal(200);
            expect(res.body.body).to.be.eql({
                subject_code: newId,
                subject: subject
            });

            // cleanup
            res = await request(app)
                .delete(`${baseRoute}/${newId}`)
                .auth(adminToken, { type: 'bearer' });
            expect(res.status).to.be.equal(200);
        });

        it("Scenario 2: Create a subject request is incorrect", async() => {
            // arrange
            const data = {
                subjects: subject // <-- a valid parameter name should be 'subject'
                // subject_code is required
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
            expect(incorrectParams).to.include.all.members(['subject', 'subject_code']);
        });

        it("Scenario 3: Create a subject request is forbidden", async() => {
            // arrange
            const data = { subject, subject_code };

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

        it("Scenario 4: Create a subject request is unauthorized", async() => {
            // arrange
            const data = { subject, subject_code };

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

    context("PATCH /subjects/:id", () => {
        const newSubject = 'Financial Management';
        
        it("Scenario 1: Update a subject request is successful", async() => {
            // arrange
            const data = { subject: newSubject };
            const app = this.app;

            // act
            let res = await request(app)
                .patch(`${baseRoute}/${existingSubject.subject_code}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.body.rows_matched).to.be.equal(1);
            expect(res.body.body.rows_changed).to.be.equal(1);

            
            // affirm
            res = await request(app)
                .get(`${baseRoute}/${existingSubject.subject_code}`)
                .auth(adminToken, { type: 'bearer' });
            
            expect(res.status).to.be.equal(200);
            expect(res.body.body).to.be.eql({
                subject_code: existingSubject.subject_code,
                subject: newSubject
            });
            
            // cleanup
            data.subject = existingSubject.subject;
            res = await request(app)
                .patch(`${baseRoute}/${existingSubject.subject_code}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
            expect(res.status).to.be.equal(200);
        });

        it("Scenario 2: Update a subject request is unsuccessful due to unknown subject code", async() => {
            // arrange
            const data = { subject: newSubject };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${unknownSubjectId}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Subject not found');
        });

        it("Scenario 3: Update a subject request is incorrect", async() => {
            // arrange
            const data = {
                subjects: newSubject // <-- a valid parameter name should be 'subject'
            };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${existingSubject.subject_code}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(422);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('InvalidPropertiesException');
            const incorrectParams = res.body.headers.data.map(o => (o.param));
            expect(incorrectParams).to.include('subject');
        });

        it("Scenario 4: Update a subject request is forbidden", async() => {
            // arrange
            const data = { subject: newSubject };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${existingSubject.subject_code}`)
                .auth(userToken, { type: 'bearer' }) // <-- api_user token instead of admin token
                .send(data);
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 5: Update a subject request is unauthorized", async() => {
            // arrange
            const data = { subject: newSubject };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${existingSubject.subject_code}`)
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("DELETE /subjects/:id", () => {
        const subject = 'Financial Institutions And Markets';
        const subject_code = 'FIN301';
        
        it("Scenario 1: Delete a subject request is successful", async() => {
            // prepare
            const data = { subject, subject_code };
            const app = this.app;

            // create dummy
            let res = await request(app)
                .post(baseRoute)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
            expect(res.status).to.be.equal(201);

            // arrange
            const newId = data.subject_code;

            // act
            res = await request(app)
                .delete(`${baseRoute}/${newId}`)
                .auth(adminToken, { type: 'bearer' });

            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.headers.message).to.be.equal('Subject has been deleted');
            expect(res.body.body.rows_removed).to.be.equal(1);

            // affirm
            res = await request(app)
                .get(`${baseRoute}/${newId}`)
                .auth(adminToken, { type: 'bearer' });
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
        });

        it("Scenario 2: Delete a subject request is unsuccessful due to unknown subject code", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${unknownSubjectId}`)
                .auth(adminToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Subject not found');
        });

        it("Scenario 3: Delete a subject request is forbidden", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${existingSubject.subject_code}`)
                .auth(userToken, { type: 'bearer' }); // <-- api_user token instead of admin token
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 4: Delete a subject request is unauthorized", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${existingSubject.subject_code}`);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

});