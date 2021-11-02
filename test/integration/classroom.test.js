/* eslint-disable no-undef */
const request = require("supertest");
const expect = require('chai').expect;
const sinon = require('sinon');
const decache = require('decache');
const jwt = require('jsonwebtoken');
const {Config} = require('../../src/configs/config');

describe("Classrooms API", () => {
    const API = `/api/${Config.API_VERSION}`;
    const baseRoute = API + "/classrooms";
    const adminERP = '15030';
    const userERP = '17855';
    const existingClassroom = {
        classroom_id: 1,
        classroom: 'MTC1',
        campus_id: 1
    };
    const unknownClassroomId = 9999;
    const unknownCampusId = 9999;
    const userToken = jwt.sign({erp: userERP}, Config.SECRET_JWT); // non expiry token
    const adminToken = jwt.sign({erp: adminERP}, Config.SECRET_JWT);

    beforeEach(() => {
        this.app = require('../../src/server').setup();
    });

    context("GET /classrooms", () => {
        it("Scenario 1: Get all classrooms request successful", async() => {
            // act
            let res = await request(this.app)
                .get(baseRoute)
                .auth(adminToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            const resBody = res.body.body;
            expect(resBody).to.be.an('array');
            expect(resBody[0]).to.include.all.keys(Object.keys(existingClassroom));
        });

        it("Scenario 2: Get all classrooms request unsuccessful due to zero classrooms", async() => {
            // arrange
            decache('../../src/server');
            const ClassroomModel = require('../../src/models/classroom.model');
            const modelStub = sinon.stub(ClassroomModel, 'findAll').callsFake(() => []); // return empty classroom list
            const app = require('../../src/server').setup();

            // act
            const res = await request(app)
                .get(baseRoute)
                .auth(adminToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Classrooms not found');
            modelStub.restore();
        });

        it("Scenario 3: Get a classroom request is forbidden", async() => {
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

        it("Scenario 4: Get all classrooms request is unauthorized", async() => {
            // act
            let res = await request(this.app).get(baseRoute);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("GET /classrooms/:id", () => {
        it("Scenario 1: Get a classroom request successful", async() => {
            // act
            let res = await request(this.app)
                .get(`${baseRoute}/${existingClassroom.classroom_id}`)
                .auth(adminToken, { type: 'bearer' });

            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            const resBody = res.body.body;
            expect(resBody).to.include.all.keys(Object.keys(existingClassroom));
            expect(resBody.classroom_id).to.be.equal(existingClassroom.classroom_id); // should match initially sent id
        });

        it("Scenario 2: Get a classroom request is unsuccessful due to unknown classroom_id", async() => {
            // act
            const res = await request(this.app)
                .get(`${baseRoute}/${unknownClassroomId}`)
                .auth(adminToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Classroom not found');
        });

        it("Scenario 3: Get a classroom request is forbidden", async() => {
            // act
            const res = await request(this.app)
                .get(`${baseRoute}/${existingClassroom.classroom_id}`)
                .auth(userToken, { type: 'bearer' }); // <-- api_user token instead of admin token
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 4: Get a classroom request is unauthorized", async() => {
            // act
            let res = await request(this.app).get(`${baseRoute}/${existingClassroom.classroom_id}`);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("POST /classrooms", () => {
        const classroom = 'MCS5';
        const campus_id = 1;
        
        it("Scenario 1: Create a classroom request is successful", async() => {
            // arrange
            const data = { classroom, campus_id };
            const app = this.app;

            // act
            let res = await request(app)
                .post(baseRoute)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(201);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.body).to.include.all.keys(['classroom_id', 'affected_rows']);
            expect(res.body.body.affected_rows).to.be.equal(1);
            const newId = res.body.body.classroom_id;

            // affirm
            res = await request(app)
                .get(`${baseRoute}/${newId}`)
                .auth(adminToken, { type: 'bearer' });

            expect(res.status).to.be.equal(200);
            expect(res.body.body).to.be.eql({
                classroom_id: newId,
                ...data
            });

            // cleanup
            res = await request(app)
                .delete(`${baseRoute}/${newId}`)
                .auth(adminToken, { type: 'bearer' });
            expect(res.status).to.be.equal(200);
        });

        it("Scenario 2: Create a classroom request is unsuccessful due to unknown campus_id", async() => {
            // arrange
            const data = { classroom, campus_id: unknownCampusId };

            // act
            const res = await request(this.app)
                .post(baseRoute)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(512);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForeignKeyViolationException');
            expect(res.body.headers.message).to.contain('campus_id');
        });
        
        it("Scenario 3: Create a classroom request is incorrect", async() => {
            // arrange
            const data = {
                classrooms: classroom, // <-- a valid parameter name is 'classroom'
                campus_id
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
            expect(incorrectParams).to.include.all.members(['classroom']);
        });

        it("Scenario 4: Create a classroom request is forbidden", async() => {
            // arrange
            const data = { classroom, campus_id };

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

        it("Scenario 5: Create a classroom request is unauthorized", async() => {
            // arrange
            const data = { classroom, campus_id };

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

    context("PATCH /classrooms/:id", () => {
        const newClassroomName = 'MAS2';
        
        it("Scenario 1: Update a classroom request is successful", async() => {
            // arrange
            const data = { classroom: newClassroomName };
            const app = this.app;

            // act
            let res = await request(app)
                .patch(`${baseRoute}/${existingClassroom.classroom_id}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.body.rows_matched).to.be.equal(1);
            expect(res.body.body.rows_changed).to.be.equal(1);

            
            // affirm
            res = await request(app)
                .get(`${baseRoute}/${existingClassroom.classroom_id}`)
                .auth(adminToken, { type: 'bearer' });
            
            expect(res.status).to.be.equal(200);
            expect(res.body.body).to.be.eql({
                classroom_id: existingClassroom.classroom_id,
                classroom: newClassroomName,
                campus_id: existingClassroom.campus_id
            });
            
            // cleanup
            data.classroom = existingClassroom.classroom;
            res = await request(app)
                .patch(`${baseRoute}/${existingClassroom.classroom_id}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
            expect(res.status).to.be.equal(200);
        });

        it("Scenario 2: Update a classroom request is unsuccessful due to unknown classroom_id", async() => {
            // arrange
            const data = { classroom: newClassroomName };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${unknownClassroomId}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Classroom not found');
        });

        it("Scenario 3: Update a classroom request is unsuccessful due to unknown campus_id", async() => {
            // arrange
            const data = { campus_id: unknownCampusId };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${existingClassroom.classroom_id}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(512);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForeignKeyViolationException');
            expect(res.body.headers.message).to.contain('campus_id');
        });

        it("Scenario 4: Update a classroom request is incorrect", async() => {
            // arrange
            const data = {
                classrooms: newClassroomName // <-- a invalid update parameter
            };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${existingClassroom.classroom_id}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(422);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('InvalidPropertiesException');
            const incorrectMsg = res.body.headers.data.map(o => (o.msg));
            expect(incorrectMsg).to.include('Invalid updates!');
        });

        it("Scenario 5: Update a classroom request is forbidden", async() => {
            // arrange
            const data = { classroom: newClassroomName };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${existingClassroom.classroom_id}`)
                .auth(userToken, { type: 'bearer' }) // <-- api_user token instead of admin token
                .send(data);
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 6: Update a classroom request is unauthorized", async() => {
            // arrange
            const data = { classroom: newClassroomName };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${existingClassroom.classroom_id}`)
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("DELETE /classrooms/:id", () => {
        const classroom = 'MCS5';
        const campus_id = 1;
        
        it("Scenario 1: Delete a classroom request is successful", async() => {
            // prepare
            const data = { classroom, campus_id };
            const app = this.app;

            // create dummy
            let res = await request(app)
                .post(baseRoute)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
            expect(res.status).to.be.equal(201);

            // arrange
            const newId = res.body.body.classroom_id;

            // act
            res = await request(app)
                .delete(`${baseRoute}/${newId}`)
                .auth(adminToken, { type: 'bearer' });

            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.headers.message).to.be.equal('Classroom has been deleted');
            expect(res.body.body.rows_removed).to.be.equal(1);

            // affirm
            res = await request(app)
                .get(`${baseRoute}/${newId}`)
                .auth(adminToken, { type: 'bearer' });
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
        });

        it("Scenario 2: Delete a classroom request is unsuccessful due to unknown classroom_id", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${unknownClassroomId}`)
                .auth(adminToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Classroom not found');
        });

        it("Scenario 3: Delete a classroom request is forbidden", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${existingClassroom.classroom_id}`)
                .auth(userToken, { type: 'bearer' }); // <-- api_user token instead of admin token
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 4: Delete a classroom request is unauthorized", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${existingClassroom.classroom_id}`);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

});