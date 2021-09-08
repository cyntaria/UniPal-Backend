/* eslint-disable no-undef */
const request = require("supertest");
const expect = require('chai').expect;
const sinon = require('sinon');
const decache = require('decache');
const jwt = require('jsonwebtoken');
const {Config} = require('../../src/configs/config');

describe("Students API", () => {
    const API = `/api/${Config.API_VERSION}`;
    const baseRoute = API + "/students";
    const existingStudent = {
        erp: '17855',
        first_name: "Abdur Rafay",
        last_name: "Saleem",
        gender: "male",
        contact: "+923009999999",
        email: 'a.rafaysaleem@gmail.com',
        birthday: "1999-09-18",
        profile_picture_url: "https://i.pinimg.com/564x/8d/e3/89/8de389c84e919d3577f47118e2627d95.jpg",
        graduation_year: 2022,
        uni_email: "a.rafay.17855@iba.khi.edu.pk",
        hobby_1: 1,
        hobby_2: 2,
        hobby_3: 3,
        interest_1: 1,
        interest_2: 2,
        interest_3: 3,
        campus_id: 1,
        program_id: 1,
        favourite_campus_hangout_spot: "CED",
        favourite_campus_activity: "Lifting",
        current_status: 1,
        is_active: 1,
        role: "api_user"
    };
    const newERP = '17999';
    const newEmail = 'test@gmail.com';
    const unregisteredERP = 19999;
    const adminERP = '15030';
    const userToken = jwt.sign({erp: existingStudent.erp}, Config.SECRET_JWT); // non expiry token
    const adminToken = jwt.sign({erp: adminERP}, Config.SECRET_JWT);

    beforeEach(() => {
        this.app = require('../../src/server').setup();
    });

    context("GET /students", () => {
        it("Scenario 1: Get all students request successful", async() => {
            // act
            let res = await request(this.app)
                .get(`${baseRoute}`)
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            const resBody = res.body.body;
            expect(resBody).to.be.an('array');
            expect(resBody[0]).to.include.keys(Object.keys(existingStudent)); // contain all params
        });

        it("Scenario 2: Get all students request successful (using query params)", async() => {
            // act
            let res = await request(this.app)
                .get(`${baseRoute}?first_name=${existingStudent.first_name}`)
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            const resBody = res.body.body;
            expect(resBody).to.be.an('array');
            expect(resBody[0].first_name).to.be.equal(existingStudent.first_name); // deep compare two objects using 'eql'
        });

        it("Scenario 3: Get all students request unsuccessful", async() => {
            // arrange
            decache('../../src/server');
            const StudentModel = require('../../src/models/student.model');
            const modelStub = sinon.stub(StudentModel, 'findAll').callsFake(() => []); // return empty student list
            const app = require('../../src/server').setup();

            // act
            const res = await request(app)
                .get(`${baseRoute}`)
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Students not found');
            modelStub.restore();
        });

        it("Scenario 4: Get all students request is unauthorized", async() => {
            // act
            let res = await request(this.app).get(`${baseRoute}`);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("GET /students/:erp", () => {
        it("Scenario 1: Get a student request successful", async() => {
            // act
            let res = await request(this.app)
                .get(`${baseRoute}/${existingStudent.erp}`)
                .auth(userToken, { type: 'bearer' });

            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            const resBody = res.body.body;
            expect(resBody.erp).to.be.eql(existingStudent.erp); // should match initially sent id
        });

        it("Scenario 2: Get a student request is unsuccessful", async() => {
            // act
            const res = await request(this.app)
                .get(`${baseRoute}/${unregisteredERP}`)
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Student not found');
        });

        it("Scenario 3: Get a student request is unauthorized", async() => {
            // act
            let res = await request(this.app).get(`${baseRoute}/${existingStudent.erp}`);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("PATCH /students/:erp", () => {
        const newStudentLastName = 'Test';

        it("Scenario 1: Update a student request is successful (Owner)", async() => {
            // arrange
            const data = { last_name: newStudentLastName };
            const app = this.app;

            // act
            let res = await request(app)
                .patch(`${baseRoute}/${existingStudent.erp}`)
                .auth(userToken, { type: 'bearer' }) // using his own token i.e. token erp == existingStudent.erp
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.body.rows_matched).to.be.equal(1);
            expect(res.body.body.rows_changed).to.be.equal(1);

            
            // affirm
            res = await request(app)
                .get(`${baseRoute}/${existingStudent.erp}`)
                .auth(userToken, { type: 'bearer' });
            
            expect(res.status).to.be.equal(200);
            expect(res.body.body.last_name).to.be.equal(newStudentLastName);
            
            // cleanup
            data.last_name = existingStudent.last_name;
            res = await request(app)
                .patch(`${baseRoute}/${existingStudent.erp}`)
                .auth(userToken, { type: 'bearer' })
                .send(data);
            expect(res.status).to.be.equal(200);
        });

        it("Scenario 2: Update a student request is successful (Admin)", async() => {
            // arrange
            const data = { last_name: newStudentLastName };
            const app = this.app;

            // act
            let res = await request(app)
                .patch(`${baseRoute}/${existingStudent.erp}`)
                .auth(adminToken, { type: 'bearer' }) // admin to edit other profiles i.e. token erp != existingStudent.erp
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.body.rows_matched).to.be.equal(1);
            expect(res.body.body.rows_changed).to.be.equal(1);

            
            // affirm
            res = await request(app)
                .get(`${baseRoute}/${existingStudent.erp}`)
                .auth(userToken, { type: 'bearer' });
            
            expect(res.status).to.be.equal(200);
            expect(res.body.body.last_name).to.be.equal(newStudentLastName);
            
            // cleanup
            data.last_name = existingStudent.last_name;
            res = await request(app)
                .patch(`${baseRoute}/${existingStudent.erp}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
            expect(res.status).to.be.equal(200);
        });

        it("Scenario 3: Update a student request is unsuccessful", async() => {
            // arrange
            const data = { last_name: newStudentLastName };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${unregisteredERP}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Student not found');
        });

        it("Scenario 4: Update a student request is incorrect", async() => {
            // arrange
            const data = {
                last_namesds: newStudentLastName, // <-- an valid parameter name should be 'last_name'
                first_name: 'test-user%' // <-- a valid 'first_name' contains alphabets only
            };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${existingStudent.erp}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(422);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('InvalidPropertiesException');
            const incorrectParams = res.body.headers.data.map(o => (o.param));
            expect(incorrectParams).to.include('first_name');
            const incorrectMsg = res.body.headers.data.map(o => (o.msg));
            expect(incorrectMsg).to.include('Invalid updates!');
        });

        it("Scenario 5: Update a student request is forbidden (Unowned ERP)", async() => {
            // arrange
            const data = { last_name: newStudentLastName };
            const unOwnedERP = adminERP; // <-- can be any other non-admin ERP as well, just different from existingStudent.erp
            
            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${unOwnedERP}`)
                .auth(userToken, { type: 'bearer' }) // <-- user can't change others profile i.e. token erp != otherERP
                .send(data);
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 6: Update a student request is unauthorized", async() => {
            // arrange
            const data = { last_name: newStudentLastName };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${existingStudent.erp}`)
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("DELETE /students", () => {
        const { email, erp, ...student } = existingStudent;
        student.email = newEmail;
        student.erp = newERP;
        student.password = '123';
        const registerRoute = `/api/${Config.API_VERSION}/auth/register`;

        it("Scenario 1: Delete a student request is successful", async() => {
            // prepare
            const app = this.app;

            // create dummy
            let res = await request(app)
                .post(registerRoute)
                .auth(adminToken, { type: 'bearer' })
                .send(student);
            expect(res.status).to.be.equal(201);

            // arrange
            const newId = res.body.body.erp;

            // act
            res = await request(app)
                .delete(`${baseRoute}/${newId}`)
                .auth(adminToken, { type: 'bearer' });

            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.headers.message).to.be.equal('Student has been deleted');
            expect(res.body.body.rows_removed).to.be.equal(1);

            // affirm
            res = await request(app)
                .get(`${baseRoute}/${newId}`)
                .auth(userToken, { type: 'bearer' });
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
        });

        it("Scenario 2: Delete a student request is unsuccessful", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${unregisteredERP}`)
                .auth(adminToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Student not found');
        });

        it("Scenario 3: Delete a student request is forbidden", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${existingStudent.erp}`)
                .auth(userToken, { type: 'bearer' }); // <-- api_user token instead of admin token
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 4: Delete a student request is unauthorized", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${existingStudent.erp}`);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

});