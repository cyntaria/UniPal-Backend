/* eslint-disable no-undef */
const request = require("supertest");
const expect = require('chai').expect;

// importing this file causes the stub to take effect
const { stubbedAuthMiddleware } = require('../testConfig');

describe("Authentication API", () => {
    const API = "/api/v1/auth";
    const existingERP = '17855';
    const existingEmail = 'arafaysaleem@gmail.com';
    const newERP = '17999';
    const newEmail = 'test@gmail.com';

    beforeEach(() => {
        this.app = require('../../src/server').setup();
    });

    after(() => {
        stubbedAuthMiddleware.restore();
    });

    describe("POST /auth/register", () => {
        let studentBody;

        beforeEach(() => {
            studentBody = {
                erp: newERP,
                first_name: "Abdur Rafay",
                last_name: "Saleem",
                gender: "male",
                contact: "+923009999999",
                email: newEmail,
                birthday: "1999-09-18",
                password: "123",
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
        });

        it("Scenario 1: Register request is successful", async() => {
            // given
            studentBody.erp = newERP;
            studentBody.email = newEmail;

            // when
            let res = await request(this.app).post(`${API}/register`).send(studentBody);
    
            // then
            expect(res.status).to.be.equal(201);
            expect(res.body.headers.error).to.be.equal(0);
            const resBody = res.body.body;
            expect(resBody).to.include.keys('token');
            delete resBody.token;
            delete studentBody.password; // omit token and password
            expect(resBody).to.be.eql(studentBody); // deep compare two objects using 'eql'

            // Use these two lines to remove the stub effect
            // decache('../../src/server');
            // const app = require('../../src/server').setup();

            // clean up
            res = await request(this.app).delete(`/api/v1/students/${studentBody.erp}`);
            expect(res.status).to.be.equal(200);
        });

        it("Scenario 2: Register request is unsuccessful due to duplicate student", async() => {
            // given
            studentBody.erp = existingERP;
            studentBody.email = existingEmail;

            // when
            const res = await request(this.app).post(`${API}/register`).send(studentBody);
    
            // then
            expect(res.status).to.be.equal(409);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('DuplicateEntryException');
        });

        it("Scenario 3: Register request is incorrect", async() => {
            // given
            studentBody.erp = 'abdfe';

            // when
            const res = await request(this.app).post(`${API}/register`).send(studentBody);
    
            // then
            expect(res.status).to.be.equal(422);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('InvalidPropertiesException');
            const incorrectParams = res.body.headers.data.map(o => (o.param));
            expect(incorrectParams).to.include('erp');
        });
    });

    describe("POST /auth/login", () => {
        it("Scenario 1: Login request is successful", async() => {
            // given
            studentBody = {
                erp: existingERP,
                first_name: "Abdur Rafay",
                last_name: "Saleem",
                gender: "male",
                contact: "+923009999999",
                email: existingEmail,
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
            data = {
                erp: existingERP,
                password: '123'
            };

            // when
            let res = await request(this.app).post(`${API}/login`).send(data);
    
            // then
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            const resBody = res.body.body;
            expect(resBody).to.include.keys('token');
            delete resBody.token;
            expect(resBody).to.be.eql(studentBody);
        });

        it("Scenario 2: Login request is unsuccessful due to missing student", async() => {
            // given
            data = {
                erp: 19999, // <-- no account registered on this erp
                password: '123'
            };

            // when
            const res = await request(this.app).post(`${API}/login`).send(data);
    
            // then
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('InvalidCredentialsException');
        });

        it("Scenario 3: Login request is incorrect", async() => {
            // given
            data = {
                email: existingEmail, // <-- email is an unrecognized parameter
                password: '123'
            };

            // when
            const res = await request(this.app).post(`${API}/login`).send(data);
    
            // then
            expect(res.status).to.be.equal(422);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('InvalidPropertiesException');
            const incorrectParams = res.body.headers.data.map(o => (o.param));
            expect(incorrectParams).to.include('erp');
        });
    });
});