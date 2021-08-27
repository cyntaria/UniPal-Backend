/* eslint-disable no-undef */
const request = require("supertest");
const expect = require('chai').expect;
// const { auth } = require('../src/middleware/auth.middleware');
const { app } = require('./testConfig');

describe("Authentication API", () => {
    const API = "/api/v1/auth";
    const existingERP = '17855';
    const existingEmail = 'a.rafaysaleem@gmail.com';
    const newERP = '17999';
    const newEmail = 'test@gmail.com';
    let student;

    beforeEach(() => {
        student = {
            erp: newERP,
            first_name: "Abdur Rafay",
            last_name: "Saleem",
            gender: "male",
            contact: "+923009999999",
            email: newEmail,
            birthday: "1999-09-18",
            password: "123",
            profile_picture_url: "https://i.pinimg.com/564x/8d/e3/89/8de389c84e919d3577f47118e2627d95.jpg",
            graduation_year: "2022",
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

    describe("POST /auth/register", () => {
        it("Scenario 1: Register request is successful", async() => {
            // given
            student.erp = newERP;
            student.email = newEmail;

            // when
            let res = await request(app).post(`${API}/register`, null).send(student);
    
            // then
            expect(res.status).to.be.equal(201);
            expect(res.body.headers.error).to.be.equal(0);
            const resBody = res.body.body;
            expect(resBody).to.include.keys('erp', 'token');
            expect(resBody.erp).to.be.equal(student.erp);

            // clean up
            // auth.callsFake((roles) => (req, res, next) => next());
            res = await request(app).delete(`/api/v1/students/${student.erp}`);
            expect(res.status).to.be.equal(200);
        });

        it("Scenario 2: Register request is unsuccessful due to duplicate student", async() => {
            // given
            student.erp = existingERP;
            student.email = existingEmail;

            // when
            const res = await request(app).post(`${API}/register`, null).send(student);
    
            // then
            expect(res.status).to.be.equal(409);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('DuplicateEntryException');
        });

        it("Scenario 3: Register request is incorrect", async() => {
            // given
            student.erp = 'abdfe';

            // when
            const res = await request(app).post(`${API}/register`, null).send(student);
    
            // then
            expect(res.status).to.be.equal(422);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('InvalidPropertiesException');
            const incorrectParams = res.body.headers.data.map(o => (o.param));
            expect(incorrectParams).to.include('erp');
        });
    });
});