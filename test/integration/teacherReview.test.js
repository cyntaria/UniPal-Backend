/* eslint-disable no-undef */
const request = require("supertest");
const expect = require('chai').expect;
const sinon = require('sinon');
const decache = require('decache');
const jwt = require('jsonwebtoken');
const {Config} = require('../../src/configs/config');

describe("Teacher Reviews API", () => {
    const API = `/api/${Config.API_VERSION}`;
    const baseRoute = API + "/teacher-reviews";
    const adminERP = '15030';
    const userERP = '17855';
    const user2ERP = '17619';
    const existingTeacherReview = {
        review_id: 1,
        learning: 3,
        grading: 4,
        attendance: 3,
        difficulty: 5,
        overall_rating: "3.8",
        comment: "Overall amazing teacher. Worth it!",
        subject_code: "MKT201",
        teacher_id: 2,
        reviewed_by_erp: userERP,
        reviewed_at: "2021-11-22 21:20:40"
    };
    const unknownTeacherReviewId = 99999;
    const unknownTeacherId = 9999;
    const unknownSubjectCode = "XXX999";
    const userToken = jwt.sign({erp: userERP}, Config.SECRET_JWT); // non expiry token
    const adminToken = jwt.sign({erp: adminERP}, Config.SECRET_JWT);
    const user2Token = jwt.sign({erp: user2ERP}, Config.SECRET_JWT);

    beforeEach(() => {
        this.app = require('../../src/server').setup();
    });

    context("GET /teacher-reviews", () => {

        it("Scenario 1: Get all teacher reviews request successful", async() => {
            // arrange
            const teacher_id = existingTeacherReview.teacher_id;
            
            // act
            let res = await request(this.app)
                .get(`${baseRoute}?teacher_id=${teacher_id}`)
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            const resBody = res.body.body;
            expect(resBody).to.be.an('array');
            expect(resBody[0]).to.include.all.keys(Object.keys(existingTeacherReview));
        });

        it("Scenario 2: Get all teacher reviews request unsuccessful due to zero teacher reviews", async() => {
            // arrange
            decache('../../src/server');
            const TeacherReviewModel = require('../../src/models/teacherReview.model');
            const modelStub = sinon.stub(TeacherReviewModel, 'findAll').callsFake(() => []); // return empty teacher review list
            const app = require('../../src/server').setup();

            // act
            const res = await request(app)
                .get(`${baseRoute}?teacher_id=${existingTeacherReview.teacher_id}`)
                .auth(adminToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Teacher reviews not found');
            modelStub.restore();
        });

        it("Scenario 3: Get all teacher reviews is incorrect due to no query params", async() => {
            // act
            let res = await request(this.app)
                .get(baseRoute) // needs teacher_id
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(422);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('InvalidPropertiesException');
            const incorrectMsg = res.body.headers.data.map(o => (o.msg));
            expect(incorrectMsg).to.include('TeacherID is required for the teacherReview');
        });

        it("Scenario 4: Get all teacher reviews is incorrect due to unknown query params", async() => {
            // arrange
            const teacher_id = existingTeacherReview.teacher_id;
            const subject_code = "MM22"; // a valid subject code is 6 characters

            // act
            let res = await request(this.app)
                .get(`${baseRoute}?teacher_id=${teacher_id}&subject_code=${subject_code}&overall_rating=2.0`) // <-- 'overall_rating' is not a query param
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(422);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('InvalidPropertiesException');
            const incorrectParams = res.body.headers.data.map(o => (o.param));
            expect(incorrectParams).to.include('subject_code');
            const incorrectMsg = res.body.headers.data.map(o => (o.msg));
            expect(incorrectMsg).to.include('Invalid query params!');
        });

        it("Scenario 5: Get all teacher reviews request is unauthorized", async() => {
            // act
            let res = await request(this.app).get(baseRoute);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("GET /teacher-reviews/:id", () => {
        it("Scenario 1: Get a teacher review request successful", async() => {
            // act
            let res = await request(this.app)
                .get(`${baseRoute}/${existingTeacherReview.review_id}`)
                .auth(userToken, { type: 'bearer' });

            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            const resBody = res.body.body;
            expect(resBody).to.include.all.keys(Object.keys(existingTeacherReview));
            expect(resBody.review_id).to.be.equal(existingTeacherReview.review_id); // should match initially sent id
        });

        it("Scenario 2: Get a teacher review request is unsuccessful due to unknown review_id", async() => {
            // act
            const res = await request(this.app)
                .get(`${baseRoute}/${unknownTeacherReviewId}`)
                .auth(adminToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Teacher review not found');
        });

        it("Scenario 3: Get a teacher review request is unauthorized", async() => {
            // act
            let res = await request(this.app).get(`${baseRoute}/${existingTeacherReview.review_id}`);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("POST /teacher-reviews", () => {
        const newTeacherReview = {
            learning: 4,
            grading: 5,
            attendance: 5,
            difficulty: 3,
            comment: "Best teacher! Totally recommended",
            subject_code: "FIN201",
            teacher_id: 1,
            reviewed_by_erp: user2ERP,
            reviewed_at: "2021-11-22 21:20:40",
            old_teacher_rating: "5.0",
            old_total_reviews: 1
        };
        
        it("Scenario 1: Create a teacher review request is successful", async() => {
            // arrange
            const data = { ...newTeacherReview };
            const app = this.app;

            // act
            let res = await request(app)
                .post(baseRoute)
                .auth(user2Token, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(201);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.body).to.include.all.keys(['review_id', 'affected_rows']);
            expect(res.body.body.affected_rows).to.be.equal(1);
            
            // rearrange
            const newId = res.body.body.review_id;
            const { old_teacher_rating, old_total_reviews, ...reviewBody } = data;

            // affirm
            res = await request(app)
                .get(`${baseRoute}/${newId}`)
                .auth(user2Token, { type: 'bearer' });

            expect(res.status).to.be.equal(200);
            const { overall_rating: review_rating, ...resBody } = res.body.body;
            expect(resBody).to.be.eql({
                review_id: newId,
                ...reviewBody
            });

            // cleanup
            const TeacherReviewRepository = require('../../src/repositories/teacherReview.repository');
            const newTeacherRating = TeacherReviewRepository.incrementTeacherRating(review_rating, old_teacher_rating, old_total_reviews);
            const deleteData = {
                teacher_id: reviewBody.teacher_id,
                teacher_rating: newTeacherRating,
                total_reviews: old_total_reviews + 1,
                review_rating
            };
            res = await request(app)
                .delete(`${baseRoute}/${newId}`)
                .auth(user2Token, { type: 'bearer' })
                .send(deleteData);
            expect(res.status).to.be.equal(200);
        });

        it("Scenario 2: Create a teacher review request is unsuccessful due to unknown teacher_id", async() => {
            // arrange
            const data = { ...newTeacherReview };
            data.teacher_id = unknownTeacherId; // non existing teacher_id

            // act
            const res = await request(this.app)
                .post(baseRoute)
                .auth(user2Token, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(512);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForeignKeyViolationException');
            expect(res.body.headers.message).to.contains('teacher_id');
        });

        it("Scenario 3: Create a teacher review request is unsuccessful due to unknown subject_code", async() => {
            // arrange
            const data = { ...newTeacherReview };
            data.subject_code = unknownSubjectCode; // non existing subject_code

            // act
            const res = await request(this.app)
                .post(baseRoute)
                .auth(user2Token, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(512);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForeignKeyViolationException');
            expect(res.body.headers.message).to.contains('subject_code');
        });

        it("Scenario 4: Create a teacher review request is incorrect", async() => {
            // arrange
            const data = { ...newTeacherReview };
            delete data.old_teacher_rating; // make it missing
            data.learning = 9; // should be between 1 and 5

            // act
            const res = await request(this.app)
                .post(baseRoute)
                .auth(user2Token, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(422);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('InvalidPropertiesException');
            const incorrectParams = res.body.headers.data.map(o => (o.param));
            expect(incorrectParams).to.include.all.members(['old_teacher_rating', 'learning']);
        });

        it("Scenario 5: Create a teacher review request is forbidden", async() => {
            // arrange
            const data = { ...newTeacherReview }; // reviewed_by_erp === adminERP

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

        it("Scenario 6: Create a teacher review request is unauthorized", async() => {
            // arrange
            const data = { ...newTeacherReview };

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

    context("DELETE /teacher-reviews/:id", () => {
        const newTeacherReview = {
            learning: 4,
            grading: 5,
            attendance: 5,
            difficulty: 3,
            comment: "Best teacher! Totally recommended",
            subject_code: "FIN201",
            teacher_id: 1,
            reviewed_by_erp: user2ERP,
            reviewed_at: "2021-11-22 21:20:40",
            old_teacher_rating: "5.0",
            old_total_reviews: 1
        };
        
        it("Scenario 1: Delete a teacher review request is successful", async() => {
            // prepare
            const data = { ...newTeacherReview };
            const app = this.app;

            // create dummy
            let res = await request(app)
                .post(baseRoute)
                .auth(user2Token, { type: 'bearer' })
                .send(data);
            expect(res.status).to.be.equal(201);

            // arrange
            const {review_id: newId} = res.body.body;
            const TeacherReviewRepository = require('../../src/repositories/teacherReview.repository');
            const review_rating = 4.3;
            const newTeacherRating = TeacherReviewRepository.incrementTeacherRating(review_rating, data.old_teacher_rating, data.old_total_reviews);
            const deleteData = {
                teacher_id: data.teacher_id,
                teacher_rating: newTeacherRating,
                total_reviews: data.old_total_reviews + 1,
                review_rating
            };

            // act
            res = await request(app)
                .delete(`${baseRoute}/${newId}`)
                .auth(user2Token, { type: 'bearer' })
                .send(deleteData);

            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.headers.message).to.be.equal('Teacher review has been deleted');
            expect(res.body.body.rows_removed).to.be.equal(1);

            // affirm
            res = await request(app)
                .get(`${baseRoute}/${newId}`)
                .auth(user2Token, { type: 'bearer' });
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
        });

        it("Scenario 2: Delete a teacher review request is unsuccessful due to unknown review_id", async() => {
            // arrange
            const deleteData = {
                teacher_id: newTeacherReview.teacher_id,
                teacher_rating: newTeacherReview.old_teacher_rating,
                total_reviews: newTeacherReview.old_total_reviews,
                review_rating: 4.3
            };
            
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${unknownTeacherReviewId}`)
                .auth(user2Token, { type: 'bearer' })
                .send(deleteData);
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Teacher review not found');
        });

        it("Scenario 3: Delete a teacher review request is incorrect due to inconsistent body params", async() => {
            // arrange
            const deleteData = {
                teacher_id: unknownTeacherId, // not the same as the review being deleted
                teacher_rating: newTeacherReview.old_teacher_rating,
                total_reviews: newTeacherReview.old_total_reviews,
                review_rating: 0.0 // not the same as the review being deleted
            };

            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${existingTeacherReview.review_id}`)
                .auth(userToken, { type: 'bearer' })
                .send(deleteData);
    
            // assert
            expect(res.status).to.be.equal(500);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('DeleteFailedException');
        });

        it("Scenario 4: Delete a teacher review request is forbidden", async() => {
            // arrange
            const deleteData = {
                teacher_id: existingTeacherReview.teacher_id,
                teacher_rating: newTeacherReview.old_teacher_rating,
                total_reviews: newTeacherReview.old_total_reviews,
                review_rating: existingTeacherReview.overall_rating
            };
            
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${existingTeacherReview.review_id}`)
                .auth(user2Token, { type: 'bearer' }) // <-- api_user token instead of admin token
                .send(deleteData);
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 5: Delete a teacher review request is unauthorized", async() => {
            // arrange
            const deleteData = {
                teacher_id: newTeacherReview.teacher_id,
                teacher_rating: newTeacherReview.old_teacher_rating,
                total_reviews: newTeacherReview.old_total_reviews,
                review_rating: 4.3
            };
            
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${existingTeacherReview.review_id}`)
                .send(deleteData);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

});