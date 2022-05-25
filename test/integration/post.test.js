/* eslint-disable no-undef */
const request = require("supertest");
const expect = require('chai').expect;
const sinon = require('sinon');
const decache = require('decache');
const jwt = require('jsonwebtoken');
const {Config} = require('../../src/configs/config');

describe("Posts API", () => {
    const API = `/api/${Config.API_VERSION}`;
    const baseRoute = API + "/posts";
    const userERP = '17855';
    const existingPost = {
        post_id: 1,
        body: "Some post content body",
        privacy: "public",
        author: {
            erp: userERP,
            first_name: "Abdur Rafay",
            last_name: "Saleem",
            profile_picture_url: "https://i.pinimg.com/564x/8d/e3/89/8de389c84e919d3577f47118e2627d95.jpg",
            program_id: 1,
            graduation_year: 2022
        },
        posted_at: "2021-09-17 15:53:40",
        top_3_reactions: [
            {
                reaction_type_id: 2,
                reaction_count: 3
            }
        ],
        resources: [
            {
                resource_id: 1,
                resource_url: "www.google.com/images",
                resource_type: "image"
            },
            {
                resource_id: 2,
                resource_url: "www.youtube.com",
                resource_type: "video"
            }
        ]
    };
    const unOwnedPostId = 6; // post_id(6).author.erp != userERP
    const unknownPostId = 99999;
    const adminERP = '15030';
    const userToken = jwt.sign({erp: userERP}, Config.SECRET_JWT); // non expiry token
    const adminToken = jwt.sign({erp: adminERP}, Config.SECRET_JWT);

    beforeEach(() => {
        this.app = require('../../src/server').setup();
    });

    context("GET /posts", () => {
        it("Scenario 1: Get all posts request successful", async() => {
            // act
            let res = await request(this.app)
                .get(baseRoute)
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            const resBody = res.body.body;

            expect(resBody).to.be.an('array');
            expect(resBody[0]).to.include.all.keys(Object.keys(existingPost)); // contain all params
            const examplePost = resBody[0];

            expect(examplePost.author).to.include.all.keys(Object.keys(existingPost.author));

            expect(examplePost.resources).to.be.an('array');
            expect(examplePost.resources[0]).to.include.all.keys(Object.keys(existingPost.resources[0])); // contain all params
            
            expect(examplePost.top_3_reactions).to.be.an('array');
            expect(examplePost.top_3_reactions[0]).to.include.all.keys(Object.keys(existingPost.top_3_reactions[0])); // contain all params
        
            const noReactionOrResourceCheck = post => post.resources === null && post.top_3_reactions === null;
            expect(resBody.some(noReactionOrResourceCheck)).to.be.true; // match atleast one post like this
        });

        it("Scenario 2: Get all posts request successful (using query params)", async() => {
            // act
            const author_erp = userERP;
            let res = await request(this.app)
                .get(`${baseRoute}?author_erp=${author_erp}`)
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            const resBody = res.body.body;
            expect(resBody).to.be.an('array');
            expect(resBody[0].author).to.include.all.keys(Object.keys(existingPost.author));
            expect(resBody[0].author.erp).to.be.equal(author_erp);
        });

        it("Scenario 3: Get all posts request unsuccessful", async() => {
            // arrange
            decache('../../src/server');
            const PostModel = require('../../src/models/post.model');
            const modelStub = sinon.stub(PostModel, 'findAll').callsFake(() => []); // return empty post list
            const app = require('../../src/server').setup();

            // act
            const res = await request(app)
                .get(baseRoute)
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.body).to.be.an('array').that.is.empty;
            modelStub.restore();
        });

        it("Scenario 4: Get all posts request is incorrect", async() => {
            // act
            const privacy = 'all'; // <-- invalid privacy value
            let res = await request(this.app)
                .get(`${baseRoute}?privacy=${privacy}&week=2`) // <-- `week` is an incorrect query param
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(422);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('InvalidPropertiesException');
            const incorrectParams = res.body.headers.data.map(o => (o.param));
            expect(incorrectParams).to.include('privacy');
            const incorrectMsg = res.body.headers.data.map(o => (o.msg));
            expect(incorrectMsg).to.include('Invalid query params!');
        });

        it("Scenario 5: Get all posts request is unauthorized", async() => {
            // act
            let res = await request(this.app).get(baseRoute);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("GET /posts/:id", () => {
        it("Scenario 1: Get a post request successful", async() => {
            // act
            let res = await request(this.app)
                .get(`${baseRoute}/${existingPost.post_id}`)
                .auth(userToken, { type: 'bearer' });

            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            const resBody = res.body.body;
            expect(resBody.post_id).to.be.equal(existingPost.post_id); // should match initially sent id
            expect(resBody).to.include.all.keys(Object.keys(existingPost)); // contain all params
            expect(resBody.author).to.include.all.keys(Object.keys(existingPost.author));
        });

        it("Scenario 2: Get a post request is unsuccessful", async() => {
            // act
            const res = await request(this.app)
                .get(`${baseRoute}/${unknownPostId}`)
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Post not found');
        });

        it("Scenario 3: Get a post request is unauthorized", async() => {
            // act
            let res = await request(this.app).get(`${baseRoute}/${existingPost.post_id}`);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("GET /posts/:id/reactions", () => {
        const subRoute = 'reactions';

        it("Scenario 1: Get a post's reactions request successful", async() => {
            // act
            let res = await request(this.app)
                .get(`${baseRoute}/${existingPost.post_id}/${subRoute}`)
                .auth(userToken, { type: 'bearer' });

            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            const resBody = res.body.body;
            expect(resBody).to.be.an('array');
            expect(resBody[0]).to.include.all.keys(['post_id', 'reaction_type_id', 'student_erp', 'reacted_at']);
            expect(resBody[0].post_id).to.be.equal(existingPost.post_id); // should match initially sent id
        });

        it("Scenario 2: Get a post's reactions request is unsuccessful due to unknown post_id", async() => {
            // act
            const res = await request(this.app)
                .get(`${baseRoute}/${unknownPostId}/${subRoute}`)
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.body).to.be.an('array').that.is.empty;
        });

        it("Scenario 3: Get a post's reactions request is unsuccessful due to zero reactions", async() => {
            // arrange
            decache('../../src/server');
            const PostModel = require('../../src/models/post.model');
            const modelStub = sinon.stub(PostModel, 'findAllReactionsByPost').callsFake(() => []); // return empty post reactions list
            const app = require('../../src/server').setup();

            // act
            const res = await request(app)
                .get(`${baseRoute}/${existingPost.post_id}/${subRoute}`)
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.body).to.be.an('array').that.is.empty;
            modelStub.restore();
        });

        it("Scenario 4: Get a post's reactions is unauthorized", async() => {
            // act
            let res = await request(this.app).get(`${baseRoute}/${existingPost.post_id}/${subRoute}`);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("POST /posts", () => {
        const { post_id, top_3_reactions, resources, author, ...newPost } = existingPost;
        newPost.resources = resources.map(resource => ({
            resource_url: resource.resource_url,
            resource_type: resource.resource_type
        }));
        newPost.author_erp = author.erp;

        it("Scenario 1: Create a post request is successful (Owner)", async() => {
            // arrange
            const data = { ...newPost };
            const app = this.app;

            // act
            let res = await request(app)
                .post(baseRoute)
                .auth(userToken, { type: 'bearer' }) // using his own token i.e. token erp == newPost.author_erp
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(201);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.body).to.include.keys(['post_id', 'affected_rows']);
            expect(res.body.body.affected_rows).to.be.equal(1);
            
            // affirm
            const newId = res.body.body.post_id;
            res = await request(app)
                .get(`${baseRoute}/${newId}`)
                .auth(userToken, { type: 'bearer' });

            expect(res.status).to.be.equal(200);
            const resBody = res.body.body;
            resBody.resources = resBody.resources.map(resource => (
                {
                    resource_url: resource.resource_url,
                    resource_type: resource.resource_type
                }
            ));

            expect(resBody.author.erp).to.be.equal(data.author_erp);
            delete resBody.author;
            delete data.author_erp;

            expect(resBody).to.be.eql({
                post_id: newId,
                top_3_reactions: null,
                ...data
            });

            // cleanup
            res = await request(app)
                .delete(`${baseRoute}/${newId}`)
                .auth(adminToken, { type: 'bearer' });
            expect(res.status).to.be.equal(200);
        });

        it("Scenario 2: Create a post request is incorrect", async() => {
            // arrange
            const {resources, ...post} = newPost;
            const data = {
                ...post,
                resourcessfd: resources // <-- a valid param is 'resources'
            };

            // act
            const res = await request(this.app)
                .post(baseRoute)
                .auth(userToken, { type: 'bearer' }) // using his own token i.e. token erp == newPost.author_erp
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(422);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('InvalidPropertiesException');
            const incorrectParams = res.body.headers.data.map(o => (o.param));
            expect(incorrectParams).to.include.members(['resources']);
        });

        it("Scenario 3: Create a post request is forbidden (Unowned Author ERP)", async() => {
            // arrange
            const data = { ...newPost };
            data.author_erp = adminERP; // <-- can be any other non-admin ERP as well, just different from userToken erp

            // act
            const res = await request(this.app)
                .post(baseRoute)
                .auth(userToken, { type: 'bearer' }) // <-- user can't create others posts i.e. token erp != newPost.author_erp
                .send(data);
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 4: Create a post request is unauthorized", async() => {
            // arrange
            const data = { ...newPost };

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

    context("PATCH /posts/:id", () => {
        const updatedPostBody = "Updated post body";

        it("Scenario 1: Update a post request is successful (Owner)", async() => {
            // arrange
            const data = { body: updatedPostBody };
            const app = this.app;

            // act
            let res = await request(app)
                .patch(`${baseRoute}/${existingPost.post_id}`)
                .auth(userToken, { type: 'bearer' }) // using his own token i.e. token erp == existingPost.author_erp
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.body.rows_matched).to.be.equal(1);
            expect(res.body.body.rows_changed).to.be.equal(1);
            
            // affirm
            res = await request(app)
                .get(`${baseRoute}/${existingPost.post_id}`)
                .auth(userToken, { type: 'bearer' });
            
            expect(res.status).to.be.equal(200);
            expect(res.body.body.body).to.be.equal(updatedPostBody);
            
            // cleanup
            data.body = existingPost.body;
            res = await request(app)
                .patch(`${baseRoute}/${existingPost.post_id}`)
                .auth(userToken, { type: 'bearer' })
                .send(data);
            expect(res.status).to.be.equal(200);
        });

        it("Scenario 2: Update a post request is unsuccessful due to unknown post_id", async() => {
            // arrange
            const data = { body: updatedPostBody };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${unknownPostId}`)
                .auth(userToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Post not found');
        });

        it("Scenario 3: Update a post request is incorrect", async() => {
            // arrange
            const data = {
                bodysds: updatedPostBody, // <-- an valid parameter name should be 'body'
                privacy: "all" // <-- an invalid 'privacy' value
            };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${existingPost.post_id}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(422);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('InvalidPropertiesException');
            const incorrectParams = res.body.headers.data.map(o => (o.param));
            expect(incorrectParams).to.include('privacy');
            const incorrectMsg = res.body.headers.data.map(o => (o.msg));
            expect(incorrectMsg).to.include('Invalid updates!');
        });

        it("Scenario 4: Update a post request is forbidden (Unowned Author ERP)", async() => {
            // arrange
            const data = { body: updatedPostBody };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${unOwnedPostId}`) // <-- has a different author_erp than userToken erp
                .auth(userToken, { type: 'bearer' }) // <-- user can't change others posts i.e. token erp != unOwnedPost.author_erp
                .send(data);
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 5: Update a post request is unauthorized", async() => {
            // arrange
            const data = { body: updatedPostBody };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${existingPost.post_id}`)
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("DELETE /posts/:id", () => {
        const { post_id, top_3_reactions, resources, author, ...newPost } = existingPost;
        newPost.resources = resources.map(resource => ({
            resource_url: resource.resource_url,
            resource_type: resource.resource_type
        }));
        newPost.author_erp = author.erp;

        it("Scenario 1: Delete a post request is successful (Owner)", async() => {
            // arrange
            const data = { ...newPost };
            const app = this.app;

            // act
            let res = await request(app)
                .post(baseRoute)
                .auth(userToken, { type: 'bearer' })
                .send(data);
            expect(res.status).to.be.equal(201);

            // arrange
            const newId = res.body.body.post_id;

            // act
            res = await request(app)
                .delete(`${baseRoute}/${newId}`)
                .auth(userToken, { type: 'bearer' }); // using his own token i.e. token erp == newPost.author_erp

            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.headers.message).to.be.equal('Post has been deleted');
            expect(res.body.body.rows_removed).to.be.equal(1);

            // affirm
            res = await request(app)
                .get(`${baseRoute}/${newId}`)
                .auth(userToken, { type: 'bearer' });
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
        });

        it("Scenario 2: Delete a post request is successful (Admin)", async() => {
            // arrange
            const data = { ...newPost };
            const app = this.app;

            // act
            let res = await request(app)
                .post(baseRoute)
                .auth(userToken, { type: 'bearer' })
                .send(data);
            expect(res.status).to.be.equal(201);

            // arrange
            const newId = res.body.body.post_id;

            // act
            res = await request(app)
                .delete(`${baseRoute}/${newId}`)
                .auth(adminToken, { type: 'bearer' }); // admin can delete other's posts even if token erp != newPost.author_erp

            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.headers.message).to.be.equal('Post has been deleted');
            expect(res.body.body.rows_removed).to.be.equal(1);

            // affirm
            res = await request(app)
                .get(`${baseRoute}/${newId}`)
                .auth(userToken, { type: 'bearer' });
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
        });

        it("Scenario 3: Delete a post request is unsuccessful due to unknown post_id", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${unknownPostId}`)
                .auth(adminToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Post not found');
        });

        it("Scenario 4: Delete a post request is forbidden (Unowned Author ERP)", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${unOwnedPostId}`) // <-- has a different author_erp than userToken erp
                .auth(userToken, { type: 'bearer' }); // <-- user can't delete others posts i.e. token erp != unOwnedPost.author_erp
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 5: Delete a post request is unauthorized", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${existingPost.post_id}`);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

});