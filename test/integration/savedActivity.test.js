/* eslint-disable no-undef */
const request = require("supertest");
const expect = require('chai').expect;
const jwt = require('jsonwebtoken');
const {Config} = require('../../src/configs/config');

describe("Saved Activities API", () => {
    const API = `/api/${Config.API_VERSION}`;
    const baseRoute = API + "/students";
    const subRoute = "saved-activities";
    const userERP = '17855';
    const adminERP = '15030';
    const existingSavedActivity = {
        activity_id: 1,
        student_erp: userERP,
        saved_at: '2021-09-17 15:53:40'
    };
    const ERPwithoutSavedActivities = adminERP;
    const unSavedActivityId = 2;
    const unknownActivityId = 99999;
    const unknownStudentERP = 19999;
    const userToken = jwt.sign({erp: userERP}, Config.SECRET_JWT); // non expiry token
    const adminToken = jwt.sign({erp: adminERP}, Config.SECRET_JWT);

    beforeEach(() => {
        this.app = require('../../src/server').setup();
    });

    context("POST /students/:erp/saved-activities", () => {
        const saved_at = existingSavedActivity.saved_at;
        const savedActivityId = existingSavedActivity.activity_id; // For new saved activity entry

        it("Scenario 1: Create a saved activity request is successful (Owner)", async() => {
            // arrange
            const data = { activity_id: unSavedActivityId, saved_at };
            const app = this.app;

            // act
            let res = await request(app)
                .post(`${baseRoute}/${userERP}/${subRoute}`)
                .auth(userToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(201);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.body).to.include.keys(['affected_rows']);
            expect(res.body.body.affected_rows).to.be.equal(1);

            // affirm
            res = await request(app)
                .get(`${baseRoute}/${userERP}/${subRoute}`)
                .auth(adminToken, { type: 'bearer' });
            
            expect(res.status).to.be.equal(200);
            const checkActivityId = activity => activity.activity_id === data.activity_id;
            expect(res.body.body.some(checkActivityId)).to.be.true;

            // cleanup
            res = await request(app)
                .delete(`${baseRoute}/${userERP}/${subRoute}/${data.activity_id}`)
                .auth(adminToken, { type: 'bearer' });
            expect(res.status).to.be.equal(200);
        });

        it("Scenario 1: Create a saved activity request is successful (Admin)", async() => {
            // arrange
            const data = { activity_id: savedActivityId, saved_at };
            const app = this.app;

            // act
            let res = await request(app)
                .post(`${baseRoute}/${ERPwithoutSavedActivities}/${subRoute}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(201);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.body).to.include.keys(['affected_rows']);
            expect(res.body.body.affected_rows).to.be.equal(1);

            // affirm
            res = await request(app)
                .get(`${baseRoute}/${ERPwithoutSavedActivities}/${subRoute}`)
                .auth(adminToken, { type: 'bearer' });
            
            expect(res.status).to.be.equal(200);
            const checkActivityId = activity => activity.activity_id === data.activity_id;
            expect(res.body.body.some(checkActivityId)).to.be.true;

            // cleanup
            res = await request(app)
                .delete(`${baseRoute}/${ERPwithoutSavedActivities}/${subRoute}/${data.activity_id}`)
                .auth(adminToken, { type: 'bearer' });
            expect(res.status).to.be.equal(200);
        });

        it("Scenario 2: Create a saved activity request is unsuccessful due to unknown student_erp", async() => {
            // arrange
            const data = { activity_id: savedActivityId, saved_at };

            // act
            const res = await request(this.app)
                .post(`${baseRoute}/${unknownStudentERP}/${subRoute}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(512);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForeignKeyViolationException');
            expect(res.body.headers.message).to.contains('student_erp');
        });

        it("Scenario 3: Create a saved activity request is unsuccessful due to unknown activity_id", async() => {
            // arrange
            const data = { activity_id: unknownActivityId, saved_at }; // <-- Non-existent activity_id

            // act
            const res = await request(this.app)
                .post(`${baseRoute}/${ERPwithoutSavedActivities}/${subRoute}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(512);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForeignKeyViolationException');
            expect(res.body.headers.message).to.contains('activity_id');
        });

        it("Scenario 4: Create a saved activity request is incorrect", async() => {
            // arrange
            const data = {
                id: 1, // <-- a valid parameter name should be 'activity_id'
                saved_at: 'not going' // <-- not a valid saved_at
            };

            // act
            const res = await request(this.app)
                .post(`${baseRoute}/${ERPwithoutSavedActivities}/${subRoute}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(422);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('InvalidPropertiesException');
            const incorrectParams = res.body.headers.data.map(o => (o.param));
            expect(incorrectParams).to.include.members(['saved_at', 'activity_id']);
        });

        it("Scenario 5: Create a saved activity request is forbidden", async() => {
            // arrange
            const data = { activity_id: savedActivityId, saved_at };

            // act
            const res = await request(this.app)
                .post(`${baseRoute}/${adminERP}/${subRoute}`) // <-- adminERP != userToken.erp, can be any other different erp as well
                .auth(userToken, { type: 'bearer' })
                .send(data);
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 6: Create a saved activity request is unauthorized", async() => {
            // arrange
            const data = { activity_id: savedActivityId, saved_at };

            // act
            const res = await request(this.app)
                .post(`${baseRoute}/${ERPwithoutSavedActivities}/${subRoute}`)
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("DELETE /students/:erp/saved-activities/:id", () => {
        const saved_at = existingSavedActivity.saved_at;
        const existingStudentERP = existingSavedActivity.student_erp; // For unknown activity id check
        const savedActivityId = existingSavedActivity.activity_id; // For unknown studentERP check

        it("Scenario 1: Delete a saved activity request is successful (Owner)", async() => {
            // prepare
            const data = { activity_id: savedActivityId, saved_at };
            const app = this.app;

            // create dummy
            let res = await request(app)
                .post(`${baseRoute}/${ERPwithoutSavedActivities}/${subRoute}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
            expect(res.status).to.be.equal(201);

            // act
            res = await request(app)
                .delete(`${baseRoute}/${ERPwithoutSavedActivities}/${subRoute}/${savedActivityId}`)
                .auth(adminToken, { type: 'bearer' }); // <-- userToken.erp == student_erp

            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.headers.message).to.be.equal('Saved activity has been deleted');
            expect(res.body.body.rows_removed).to.be.equal(1);

            // affirm
            res = await request(app)
                .get(`${baseRoute}/${ERPwithoutSavedActivities}/${subRoute}`)
                .auth(adminToken, { type: 'bearer' });

            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('No saved activities found');
        });

        it("Scenario 2: Delete a saved activity request is successful (Admin)", async() => {
            // prepare
            const data = { activity_id: savedActivityId, saved_at };
            const app = this.app;

            // create dummy
            let res = await request(app)
                .post(`${baseRoute}/${ERPwithoutSavedActivities}/${subRoute}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
            expect(res.status).to.be.equal(201);

            // act
            res = await request(app)
                .delete(`${baseRoute}/${ERPwithoutSavedActivities}/${subRoute}/${savedActivityId}`)
                .auth(adminToken, { type: 'bearer' }); // <-- adminToken.erp != student_erp but still bypass ownerCheck

            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.headers.message).to.be.equal('Saved activity has been deleted');
            expect(res.body.body.rows_removed).to.be.equal(1);

            // affirm
            res = await request(app)
                .get(`${baseRoute}/${ERPwithoutSavedActivities}/${subRoute}`)
                .auth(adminToken, { type: 'bearer' });

            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('No saved activities found');
        });

        it("Scenario 3: Delete a saved activity request is unsuccessful due to unknown student_erp", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${unknownStudentERP}/${subRoute}/${savedActivityId}`)
                .auth(adminToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Saved activity not found');
        });
        
        it("Scenario 4: Delete a saved activity request is unsuccessful due to unknown activity_id", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${existingStudentERP}/${subRoute}/${unknownActivityId}`)
                .auth(adminToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Saved activity not found');
        });

        it("Scenario 5: Delete a saved activity request is forbidden", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${adminERP}/${subRoute}/${savedActivityId}`)
                .auth(userToken, { type: 'bearer' }); // <-- adminERP != userToken.erp, can be any other different erp as well
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 6: Delete a saved activity request is unauthorized", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${existingStudentERP}/${subRoute}/${savedActivityId}`);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

});