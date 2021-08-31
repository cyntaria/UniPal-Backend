/* eslint-disable no-undef */
const request = require("supertest");
const expect = require('chai').expect;
const jwt = require('jsonwebtoken');
const {sleep} = require('../../src/utils/common.utils');
const {Config} = require('../../src/configs/config');

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

    context("POST /auth/register", () => {
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
            expect(resBody.token).to.exist;
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

    context("POST /auth/login", () => {
        it("Scenario 1: Login request is successful", async() => {
            // given
            const studentBody = {
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
            const data = {
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
            const data = {
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
            const data = {
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

    context("POST /auth/refresh-token", () => {
        it("Scenario 1: Refresh token is successful and return a new token", async() => {
            // given
            const secretKey = Config.SECRET_JWT;
            const old_token = jwt.sign({ erp: existingERP }, secretKey, {
                expiresIn: "1" // <-- immediately expire the token (in 1ms)
            });
            const data = {
                erp: existingERP,
                password: '123',
                old_token: old_token
            };

            // wait for token to expire (in 1ms)
            await sleep(1);

            // when
            let res = await request(this.app).post(`${API}/refresh-token`).send(data);
    
            // then
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.body.token).to.exist;
            expect(res.body.body.token).to.be.not.equal(old_token);
        });

        it("Scenario 2: Refresh token is successful and returns same token", async() => {
            // given
            const secretKey = Config.SECRET_JWT;
            const old_token = jwt.sign({ erp: existingERP }, secretKey); // <-- unexpired token
            const data = {
                erp: existingERP,
                password: '123',
                old_token: old_token
            };

            // when
            let res = await request(this.app).post(`${API}/refresh-token`).send(data);
    
            // then
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.body.token).to.exist;
            expect(res.body.body.token).to.be.equal(old_token);
        });

        it("Scenario 3: Refresh token is unsuccessful due to unregisted erp", async() => {
            // given
            const data = {
                erp: 19999, // <-- no account registered on this erp
                password: '123',
                old_token: "e.e.e" // <-- token doesn't matter if erp is unregistered
            };

            // when
            const res = await request(this.app).post(`${API}/refresh-token`).send(data);
    
            // then
            expect(res.status).to.be.equal(401);
            const resHeaders = res.body.headers;
            expect(resHeaders.error).to.be.equal(1);
            expect(resHeaders.code).to.be.equal('InvalidCredentialsException');
            expect(resHeaders.message).to.be.equal('ERP not registered');
        });

        it("Scenario 4: Refresh token is unsuccessful due to incorrect password", async() => {
            // given
            const data = {
                erp: existingERP,
                password: 'incOrr3ct', // <-- incorrect password
                old_token: "e.e.e" // <-- token doesn't matter if password is incorrect
            };

            // when
            const res = await request(this.app).post(`${API}/refresh-token`).send(data);
    
            // then
            expect(res.status).to.be.equal(401);
            const resHeaders = res.body.headers;
            expect(resHeaders.error).to.be.equal(1);
            expect(resHeaders.code).to.be.equal('InvalidCredentialsException');
            expect(resHeaders.message).to.be.equal('Incorrect password');
        });

        it("Scenario 5: Refresh token is unsuccessful due to incorrect old token", async() => {
            // This test performs the same if the token has a valid format, but is
            // signed for a different erp

            // given
            const data = {
                erp: existingERP,
                password: '123',
                old_token: "e.e.e" // <-- incorrect token
            };

            // when
            const res = await request(this.app).post(`${API}/refresh-token`).send(data);
    
            // then
            expect(res.status).to.be.equal(401);
            const resHeaders = res.body.headers;
            expect(resHeaders.error).to.be.equal(1);
            expect(resHeaders.code).to.be.equal('TokenVerificationException');
            expect(resHeaders.message).to.be.equal('Invalid Token');
        });

        it("Scenario 6: Refresh token request is incorrect", async() => {
            // given
            const data = {
                erp: existingERP,
                password: '123',
                token: "e.e.e" // <-- a valid parameter name should be 'old_token'
            };

            // when
            const res = await request(this.app).post(`${API}/refresh-token`).send(data);
    
            // then
            expect(res.status).to.be.equal(422);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('InvalidPropertiesException');
            const incorrectParams = res.body.headers.data.map(o => (o.param));
            expect(incorrectParams).to.include('old_token');
        });
    });

    context("PATCH /auth/change-password", () => {
        const old_password = '123';
        const new_password = '256';

        it("Scenario 1: Change password is successful", async() => {
            // given
            let app = this.app;
            const data = {
                erp: existingERP,
                old_password,
                new_password
            };

            // when
            let res = await request(app).patch(`${API}/change-password`).send(data);
    
            // then
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.body.rows_matched).to.be.equal(1);
            expect(res.body.body.rows_changed).to.be.equal(1);

            // clean up to old state
            data.old_password = new_password;
            data.new_password = old_password;
            res = await request(app).patch(`${API}/change-password`).send(data);
            console.error(res.headers);
            expect(res.status).to.be.equal(200);
        });

        it("Scenario 2: Change password is unsuccessful due to unregisted erp", async() => {
            // given
            const data = {
                erp: 19999, // <-- no account registered on this erp
                old_password,
                new_password
            };

            // when
            const res = await request(this.app).patch(`${API}/change-password`).send(data);
    
            // then
            expect(res.status).to.be.equal(401);
            const resHeaders = res.body.headers;
            expect(resHeaders.error).to.be.equal(1);
            expect(resHeaders.code).to.be.equal('InvalidCredentialsException');
            expect(resHeaders.message).to.be.equal('ERP not registered');
        });

        it("Scenario 3: Change password is unsuccessful due to incorrect old password", async() => {
            // given
            const data = {
                erp: existingERP,
                old_password: 'incOrr3ct', // <-- incorrect password
                new_password
            };

            // when
            const res = await request(this.app).patch(`${API}/change-password`).send(data);
    
            // then
            expect(res.status).to.be.equal(401);
            const resHeaders = res.body.headers;
            expect(resHeaders.error).to.be.equal(1);
            expect(resHeaders.code).to.be.equal('InvalidCredentialsException');
            expect(resHeaders.message).to.be.equal('Incorrect old password');
        });

        it("Scenario 6: Change password request is incorrect", async() => {
            // given
            const data = {
                erp: existingERP,
                password: '123', // <-- a valid parameter name should be 'old_password'
                new_password
            };

            // when
            const res = await request(this.app).patch(`${API}/change-password`).send(data);
    
            // then
            expect(res.status).to.be.equal(422);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('InvalidPropertiesException');
            const incorrectParams = res.body.headers.data.map(o => (o.param));
            expect(incorrectParams).to.include('old_password');
        });
    });
});