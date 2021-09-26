/* eslint-disable no-undef */
const request = require("supertest");
const expect = require('chai').expect;
const sinon = require('sinon');
const decache = require('decache');
const jwt = require('jsonwebtoken');
const {Config} = require('../../src/configs/config');

describe("Student Statuses API", () => {
    const API = `/api/${Config.API_VERSION}`;
    const baseRoute = API + "/student-statuses";
    const adminERP = '15030';
    const userERP = '17855';
    const existingStudentStatus = {
        student_status_id: 1,
        student_status: 'Looking for a friend'
    };
    const unknownStudentStatusId = 2000;
    const userToken = jwt.sign({erp: userERP}, Config.SECRET_JWT); // non expiry token
    const adminToken = jwt.sign({erp: adminERP}, Config.SECRET_JWT);

    beforeEach(() => {
        this.app = require('../../src/server').setup();
    });

    context("GET /student-statuses", () => {

        it("Scenario 1: Get all student statuses request successful", async() => {
            // act
            let res = await request(this.app)
                .get(baseRoute)
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            const resBody = res.body.body;
            expect(resBody).to.be.an('array');
            expect(resBody[0]).to.include.keys(['student_status_id', 'student_status']); // deep compare two objects using 'eql'
        });

        it("Scenario 2: Get all student statuses request unsuccessful", async() => {
            // arrange
            decache('../../src/server');
            const StudentStatusModel = require('../../src/models/studentStatus.model');
            const modelStub = sinon.stub(StudentStatusModel, 'findAll').callsFake(() => []); // return empty student_status list
            const app = require('../../src/server').setup();

            // act
            const res = await request(app)
                .get(baseRoute)
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Student statuses not found');
            modelStub.restore();
        });

        it("Scenario 3: Get all student statuses request is unauthorized", async() => {
            // act
            let res = await request(this.app).get(baseRoute);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("GET /student-statuses/:id", () => {
        it("Scenario 1: Get a student status request successful", async() => {
            // act
            let res = await request(this.app)
                .get(`${baseRoute}/${existingStudentStatus.student_status_id}`)
                .auth(userToken, { type: 'bearer' });

            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            const resBody = res.body.body;
            expect(resBody).to.include.keys(['student_status_id', 'student_status']);
            expect(resBody.student_status_id).to.be.eql(existingStudentStatus.student_status_id); // should match initially sent id
        });

        it("Scenario 2: Get a student status request is unsuccessful", async() => {
            // act
            const res = await request(this.app)
                .get(`${baseRoute}/${unknownStudentStatusId}`)
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Student status not found');
        });

        it("Scenario 3: Get a student status request is unauthorized", async() => {
            // act
            let res = await request(this.app).get(`${baseRoute}/${existingStudentStatus.student_status_id}`);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("POST /student-statuses", () => {
        const student_status = 'Looking for help';
        
        it("Scenario 1: Create a student status request is successful", async() => {
            // arrange
            const data = { student_status };
            const app = this.app;

            // act
            let res = await request(app)
                .post(baseRoute)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(201);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.body).to.include.keys(['student_status_id', 'affected_rows']);
            expect(res.body.body.affected_rows).to.be.equal(1);
            const newId = res.body.body.student_status_id;

            // affirm
            res = await request(app)
                .get(`${baseRoute}/${newId}`)
                .auth(userToken, { type: 'bearer' });

            expect(res.status).to.be.equal(200);
            expect(res.body.body).to.be.eql({
                student_status_id: newId,
                student_status: student_status
            });

            // cleanup
            res = await request(app)
                .delete(`${baseRoute}/${newId}`)
                .auth(adminToken, { type: 'bearer' });
            expect(res.status).to.be.equal(200);
        });

        it("Scenario 2: Create a student status request is incorrect", async() => {
            // arrange
            const data = {
                student_statuses: student_status // <-- a valid parameter name should be 'student_status'
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
            expect(incorrectParams).to.include('student_status');
        });

        it("Scenario 3: Create a student status request is forbidden", async() => {
            // arrange
            const data = { student_status };

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

        it("Scenario 4: Create a student status request is unauthorized", async() => {
            // arrange
            const data = { student_status };

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

    context("PATCH /student-statuses/:id", () => {
        const newStudentStatus = 'Looking for help';
        
        it("Scenario 1: Update a student status request is successful", async() => {
            // arrange
            const data = { student_status: newStudentStatus };
            const app = this.app;

            // act
            let res = await request(app)
                .patch(`${baseRoute}/${existingStudentStatus.student_status_id}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.body.rows_matched).to.be.equal(1);
            expect(res.body.body.rows_changed).to.be.equal(1);

            
            // affirm
            res = await request(app)
                .get(`${baseRoute}/${existingStudentStatus.student_status_id}`)
                .auth(userToken, { type: 'bearer' });
            
            expect(res.status).to.be.equal(200);
            expect(res.body.body).to.be.eql({
                student_status_id: existingStudentStatus.student_status_id,
                student_status: newStudentStatus
            });
            
            // cleanup
            data.student_status = existingStudentStatus.student_status;
            res = await request(app)
                .patch(`${baseRoute}/${existingStudentStatus.student_status_id}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
            expect(res.status).to.be.equal(200);
        });

        it("Scenario 2: Update a student status request is unsuccessful", async() => {
            // arrange
            const data = { student_status: newStudentStatus };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${unknownStudentStatusId}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Student status not found');
        });

        it("Scenario 3: Update a student status request is incorrect", async() => {
            // arrange
            const data = {
                student_statuses: newStudentStatus // <-- a valid parameter name should be 'student_status'
            };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${existingStudentStatus.student_status_id}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(422);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('InvalidPropertiesException');
            const incorrectParams = res.body.headers.data.map(o => (o.param));
            expect(incorrectParams).to.include('student_status');
        });

        it("Scenario 4: Update a student status request is forbidden", async() => {
            // arrange
            const data = { student_status: newStudentStatus };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${existingStudentStatus.student_status_id}`)
                .auth(userToken, { type: 'bearer' }) // <-- api_user token instead of admin token
                .send(data);
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 5: Update a student status request is unauthorized", async() => {
            // arrange
            const data = { student_status: newStudentStatus };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${existingStudentStatus.student_status_id}`)
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("DELETE /student-statuses/:id", () => {
        const student_status = 'Looking for help';
        
        it("Scenario 1: Delete a student status request is successful", async() => {
            // prepare
            const data = { student_status };
            const app = this.app;

            // create dummy
            let res = await request(app)
                .post(baseRoute)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
            expect(res.status).to.be.equal(201);

            // arrange
            const newId = res.body.body.student_status_id;

            // act
            res = await request(app)
                .delete(`${baseRoute}/${newId}`)
                .auth(adminToken, { type: 'bearer' });

            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.headers.message).to.be.equal('Student status has been deleted');
            expect(res.body.body.rows_removed).to.be.equal(1);

            // affirm
            res = await request(app)
                .get(`${baseRoute}/${newId}`)
                .auth(userToken, { type: 'bearer' });
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
        });

        it("Scenario 2: Delete a student status request is unsuccessful", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${unknownStudentStatusId}`)
                .auth(adminToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Student status not found');
        });

        it("Scenario 3: Delete a student status request is forbidden", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${existingStudentStatus.student_status_id}`)
                .auth(userToken, { type: 'bearer' }); // <-- api_user token instead of admin token
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 4: Delete a student status request is unauthorized", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${existingStudentStatus.student_status_id}`);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

});