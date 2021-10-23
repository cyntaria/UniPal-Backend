/* eslint-disable no-undef */
const request = require("supertest");
const expect = require('chai').expect;
const jwt = require('jsonwebtoken');
const {Config} = require('../../src/configs/config');

describe("Post Reactions API", () => {
    const API = `/api/${Config.API_VERSION}`;
    const baseRoute = API + "/posts";
    const subRoute = "reactions";
    const adminERP = '15030';
    const userERP = '17855';
    const existingPostReaction = {
        post_id: 4,
        reaction_type_id: 2,
        student_erp: userERP,
        reacted_at: "2021-09-17 15:53:40"
    };
    const postIdWithoutReactions = 9;
    const unknownPostId = 99999;
    const unknownStudentERP = 19999;
    const userToken = jwt.sign({erp: userERP}, Config.SECRET_JWT); // non expiry token
    const adminToken = jwt.sign({erp: adminERP}, Config.SECRET_JWT);

    beforeEach(() => {
        this.app = require('../../src/server').setup();
    });

    context("POST /posts/:id/reactions", () => {
        const {post_id, ...newPostReaction} = existingPostReaction;

        it("Scenario 1: Create a post reaction request is successful", async() => {
            // arrange
            const data = { ...newPostReaction };
            const app = this.app;

            // act
            let res = await request(app)
                .post(`${baseRoute}/${postIdWithoutReactions}/${subRoute}`)
                .auth(userToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(201);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.body).to.include.keys(['affected_rows']);
            expect(res.body.body.affected_rows).to.be.equal(1);

            // affirm
            res = await request(app)
                .get(`${baseRoute}/${postIdWithoutReactions}/${subRoute}`)
                .auth(userToken, { type: 'bearer' });
            
            expect(res.status).to.be.equal(200);
            const checkStudentERP = reaction => reaction.student_erp === data.student_erp;
            expect(res.body.body.some(checkStudentERP)).to.be.true;

            // cleanup
            res = await request(app)
                .delete(`${baseRoute}/${postIdWithoutReactions}/${subRoute}/${data.student_erp}`)
                .auth(adminToken, { type: 'bearer' });
            expect(res.status).to.be.equal(200);
        });

        it("Scenario 2: Create a post reaction request is unsuccessful due to unknown post id", async() => {
            // arrange
            const data = { ...newPostReaction };

            // act
            const res = await request(this.app)
                .post(`${baseRoute}/${unknownPostId}/${subRoute}`)
                .auth(userToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(512);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForeignKeyViolationException');
            expect(res.body.headers.message).to.contains('post_id');
        });

        it("Scenario 3: Create a post reaction request is incorrect", async() => {
            // arrange
            const data = { ...newPostReaction };
            data.reaction_type_id = 'not going'; // <-- not a valid reaction_type_id

            // act
            const res = await request(this.app)
                .post(`${baseRoute}/${postIdWithoutReactions}/${subRoute}`)
                .auth(userToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(422);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('InvalidPropertiesException');
            const incorrectParams = res.body.headers.data.map(o => (o.param));
            expect(incorrectParams).to.include.members(['reaction_type_id']);
        });

        it("Scenario 4: Create a post reaction request is forbidden", async() => {
            // arrange
            const data = { ...newPostReaction };
            data.student_erp = adminERP; // <-- adminERP != userToken.erp, can be any other different erp as well

            // act
            const res = await request(this.app)
                .post(`${baseRoute}/${postIdWithoutReactions}/${subRoute}`)
                .auth(userToken, { type: 'bearer' })
                .send(data);
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 5: Create a post reaction request is unauthorized", async() => {
            // arrange
            const data = { ...newPostReaction };

            // act
            const res = await request(this.app)
                .post(`${baseRoute}/${postIdWithoutReactions}/${subRoute}`)
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("PATCH /posts/:id/reactions/:student_erp", () => {
        const reaction_type_id = 6;
        const reacted_at = existingPostReaction.reacted_at;
        const post_id = existingPostReaction.post_id;
        const student_erp = existingPostReaction.student_erp;
        
        it("Scenario 1: Update a post reaction request is successful (Owner)", async() => {
            // arrange
            const data = { reaction_type_id, reacted_at };
            const app = this.app;

            // act
            let res = await request(app)
                .patch(`${baseRoute}/${post_id}/${subRoute}/${student_erp}`)
                .auth(userToken, { type: 'bearer' }) // <-- userToken.erp == student_erp
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.body.rows_matched).to.be.equal(1);
            expect(res.body.body.rows_changed).to.be.equal(1);
            
            // affirm
            res = await request(app)
                .get(`${baseRoute}/${post_id}/${subRoute}`)
                .auth(userToken, { type: 'bearer' });
            
            expect(res.status).to.be.equal(200);
            const checkStudentERP = reaction => reaction.student_erp === student_erp;
            const reaction = res.body.body.filter(checkStudentERP)[0];
            expect(reaction).to.be.eql({
                post_id,
                student_erp,
                ...data
            });

            // cleanup
            data.reaction_type_id = existingPostReaction.reaction_type_id;
            data.reacted_at = existingPostReaction.reacted_at;
            res = await request(app)
                .patch(`${baseRoute}/${post_id}/${subRoute}/${student_erp}`)
                .auth(userToken, { type: 'bearer' })
                .send(data);
            expect(res.status).to.be.equal(200);
        });

        it("Scenario 2: Update a post reaction request is unsuccessful due to unknown post_id", async() => {
            // arrange
            const data = { reaction_type_id, reacted_at };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${unknownPostId}/${subRoute}/${student_erp}`)
                .auth(userToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Post reaction not found');
        });

        it("Scenario 3: Update a post reaction request is incorrect", async() => {
            // arrange
            const data = { // missing reqd parameter reacted_at
                reaction_type_id: 'not going', // <-- not a valid reaction_type_id
                erp: '12345' // <-- an invalid update parameter i.e. not allowed
            };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${post_id}/${subRoute}/${student_erp}`)
                .auth(userToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(422);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('InvalidPropertiesException');
            const incorrectParams = res.body.headers.data.map(o => (o.param));
            expect(incorrectParams).to.include.members(['reaction_type_id', 'reacted_at']);
            const incorrectMsg = res.body.headers.data.map(o => (o.msg));
            expect(incorrectMsg).to.include.members(['Invalid updates!']);
        });

        it("Scenario 4: Update a post reaction request is forbidden", async() => {
            // arrange
            const data = { reaction_type_id, reacted_at };
            const user2ERP = '17619';

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${post_id}/${subRoute}/${user2ERP}`)
                .auth(userToken, { type: 'bearer' }) // <-- user2ERP != userToken.erp, can be any other different erp as well
                .send(data);
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 5: Update a post reaction request is unauthorized", async() => {
            // arrange
            const data = { reaction_type_id, reacted_at };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${post_id}/${subRoute}/${student_erp}`)
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("DELETE /posts/:id/reactions/:student_erp", () => {
        const {post_id, ...newPostReaction} = existingPostReaction;

        it("Scenario 1: Delete a post reaction request is successful (Owner)", async() => {
            // prepare
            const data = { ...newPostReaction };
            const app = this.app;

            // create dummy
            let res = await request(app)
                .post(`${baseRoute}/${postIdWithoutReactions}/${subRoute}`)
                .auth(userToken, { type: 'bearer' })
                .send(data);
            expect(res.status).to.be.equal(201);

            // act
            res = await request(app)
                .delete(`${baseRoute}/${postIdWithoutReactions}/${subRoute}/${data.student_erp}`)
                .auth(userToken, { type: 'bearer' }); // <-- userToken.erp == data.student_erp

            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.headers.message).to.be.equal('Post reaction has been deleted');
            expect(res.body.body.rows_removed).to.be.equal(1);

            // affirm
            res = await request(app)
                .delete(`${baseRoute}/${postIdWithoutReactions}/${subRoute}/${data.student_erp}`)
                .auth(userToken, { type: 'bearer' });

            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Post reaction not found');
        });

        it("Scenario 2: Delete a post reaction request is successful (Admin)", async() => {
            // prepare
            const data = { ...newPostReaction };
            const app = this.app;

            // create dummy
            let res = await request(app)
                .post(`${baseRoute}/${postIdWithoutReactions}/${subRoute}`)
                .auth(userToken, { type: 'bearer' })
                .send(data);
            expect(res.status).to.be.equal(201);

            // act
            res = await request(app)
                .delete(`${baseRoute}/${postIdWithoutReactions}/${subRoute}/${data.student_erp}`)
                .auth(adminToken, { type: 'bearer' }); // <-- adminToken.erp != data.student_erp but still bypass

            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.headers.message).to.be.equal('Post reaction has been deleted');
            expect(res.body.body.rows_removed).to.be.equal(1);

            // affirm
            res = await request(app)
                .delete(`${baseRoute}/${postIdWithoutReactions}/${subRoute}/${data.student_erp}`)
                .auth(adminToken, { type: 'bearer' });

            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Post reaction not found');
        });

        it("Scenario 3: Delete a post reaction request is unsuccessful due to unknown post_id", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${unknownPostId}/${subRoute}/${newPostReaction.student_erp}`)
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Post reaction not found');
        });
        
        it("Scenario 4: Delete a post reaction request is unsuccessful due to unknown student_erp", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${existingPostReaction.post_id}/${subRoute}/${unknownStudentERP}`)
                .auth(adminToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Post reaction not found');
        });

        it("Scenario 5: Delete a post reaction request is forbidden (Unowned Post Reaction)", async() => {
            // arrange
            const user2ERP = '17619';
            
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${existingPostReaction.post_id}/${subRoute}/${user2ERP}`)
                .auth(userToken, { type: 'bearer' }); // <-- user2ERP != userToken.erp, can be any other different erp as well
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 6: Delete a post reaction request is unauthorized", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${existingPostReaction.post_id}/${subRoute}/${existingPostReaction.student_erp}`);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

});