/* eslint-disable no-undef */
const request = require("supertest");
const expect = require('chai').expect;
const sinon = require('sinon');
const decache = require('decache');
const jwt = require('jsonwebtoken');
const {Config} = require('../../src/configs/config');

describe("Classes API", () => {
    const API = `/api/${Config.API_VERSION}`;
    const baseRoute = API + "/classes";
    const existingClass = {
        class_erp: "5755",
        semester: "CS-7",
        parent_class_erp: null,
        day_1: "tuesday",
        day_2: "thursday",
        term_id: 1,
        classroom: {
            classroom_id: 2,
            classroom: "MAC1",
            campus: {
                campus_id: 1,
                campus: "MAIN"
            }
        },
        subject: {
            subject_code: "CSE452",
            subject: "Data Warehousing"
        },
        teacher: {
            teacher_id: 4,
            full_name: "Anwar-Ul-Haq",
            average_rating: "0.000",
            total_reviews: 0
        },
        timeslot_1: {
            timeslot_id: 5,
            start_time: "14:30:00",
            end_time: "15:45:00",
            slot_number: 5
        },
        timeslot_2: {
            timeslot_id: 5,
            start_time: "14:30:00",
            end_time: "15:45:00",
            slot_number: 5
        }
    };
    const unknownClassERP = '00000';
    const unknownSubjectCode = 'MGT101';
    const unknownTeacherId = 99999;
    const unknownClassroomId = 99999;
    const unknownTermId = 99999;
    const unknownTimeslotId = 99999;
    const adminERP = '15030';
    const userERP = '17855';
    const userToken = jwt.sign({erp: userERP}, Config.SECRET_JWT); // non expiry token
    const adminToken = jwt.sign({erp: adminERP}, Config.SECRET_JWT);

    beforeEach(() => {
        this.app = require('../../src/server').setup();
    });

    context("GET /classes", () => {
        it("Scenario 1: Get all classes request successful", async() => {
            // act
            let res = await request(this.app)
                .get(baseRoute)
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            const resBody = res.body.body;

            expect(resBody).to.be.an('array');
            expect(resBody[0]).to.include.all.keys(Object.keys(existingClass)); // contain all params
            const exampleClass = resBody[0];

            expect(exampleClass.classroom).to.not.be.undefined;
            expect(exampleClass.classroom).to.include.all.keys(Object.keys(existingClass.classroom)); // contain all params
            
            expect(exampleClass.classroom.campus).to.not.be.undefined;
            expect(exampleClass.classroom.campus).to.include.all.keys(Object.keys(existingClass.classroom.campus)); // contain all params

            expect(exampleClass.subject).to.not.be.undefined;
            expect(exampleClass.subject).to.include.all.keys(Object.keys(existingClass.subject)); // contain all params

            expect(exampleClass.teacher).to.not.be.undefined;
            expect(exampleClass.teacher).to.include.all.keys(Object.keys(existingClass.teacher)); // contain all params

            expect(exampleClass.timeslot_1).to.not.be.undefined;
            expect(exampleClass.timeslot_1).to.include.all.keys(Object.keys(existingClass.timeslot_1)); // contain all params

            expect(exampleClass.timeslot_2).to.not.be.undefined;
            expect(exampleClass.timeslot_2).to.include.all.keys(Object.keys(existingClass.timeslot_2)); // contain all params
        });

        it("Scenario 2: Get all classes request successful (using query params)", async() => {
            // act
            const subject_code = 'HUM201';
            const term_id = 2;
            let res = await request(this.app)
                .get(`${baseRoute}?term_id=${term_id}&subject_code=${subject_code}`)
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            const resBody = res.body.body;
            expect(resBody).to.be.an('array');
            const termCheck = (t_id) => term_id === t_id;
            const subjectCheck = (s_code) => subject_code === s_code;
            const queryCheck = (classRow) => termCheck(classRow.term_id) && subjectCheck(classRow.subject.subject_code);
            expect(resBody.every(queryCheck)).to.be.true;
        });

        it("Scenario 3: Get all classes request unsuccessful", async() => {
            // arrange
            decache('../../src/server');
            const PostModel = require('../../src/models/class.model');
            const modelStub = sinon.stub(PostModel, 'findAll').callsFake(() => []); // return empty class list
            const app = require('../../src/server').setup();

            // act
            const res = await request(app)
                .get(baseRoute)
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Classes not found');
            modelStub.restore();
        });

        it("Scenario 4: Get all classes request is incorrect", async() => {
            // act
            const term_id = 'Spring 2021'; // <-- invalid term_id value
            let res = await request(this.app)
                .get(`${baseRoute}?term_id=${term_id}&campus=MAIN`) // <-- `campus` is an incorrect query param
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(422);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('InvalidPropertiesException');
            const incorrectParams = res.body.headers.data.map(o => (o.param));
            expect(incorrectParams).to.include('term_id');
            const incorrectMsg = res.body.headers.data.map(o => (o.msg));
            expect(incorrectMsg).to.include('Invalid query params!');
        });

        it("Scenario 5: Get all classes request is unauthorized", async() => {
            // act
            let res = await request(this.app).get(baseRoute);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("GET /classes/:term_id/:class_erp", () => {
        const subRoute = existingClass.term_id;

        it("Scenario 1: Get a class request successful", async() => {
            // act
            let res = await request(this.app)
                .get(`${baseRoute}/${subRoute}/${existingClass.class_erp}`)
                .auth(userToken, { type: 'bearer' });

            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            const resBody = res.body.body;
            expect(resBody.class_erp).to.be.eql(existingClass.class_erp); // should match initially sent id
            expect(resBody).to.include.all.keys(Object.keys(existingClass)); // contain all params
        });

        it("Scenario 2: Get a class request is unsuccessful due to unknown class_erp", async() => {
            // act
            const res = await request(this.app)
                .get(`${baseRoute}/${subRoute}/${unknownClassERP}`)
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Class not found');
        });

        it("Scenario 3: Get a class request is unsuccessful due to unknown term_id", async() => {
            // act
            const res = await request(this.app)
                .get(`${baseRoute}/${unknownTermId}/${existingClass.class_erp}`)
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Class not found');
        });

        it("Scenario 3: Get a class request is unauthorized", async() => {
            // act
            let res = await request(this.app).get(`${baseRoute}/${subRoute}/${existingClass.class_erp}`);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("POST /classes", () => {
        const newClass = {
            class_erp: '5999',
            semester: "CS-7",
            classroom_id: 2,
            subject_code: "CSE452",
            teacher_id: "4",
            timeslot_1: 5,
            timeslot_2: 5,
            day_1: "tuesday",
            day_2: "thursday",
            term_id: 1
        };
        
        it("Scenario 1: Create a class request is successful", async() => {
            // arrange
            const data = { ...newClass };
            const app = this.app;

            // act
            let res = await request(app)
                .post(baseRoute)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(201);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.body).to.include.all.keys(['affected_rows']);
            expect(res.body.body.affected_rows).to.be.equal(1);
            const newId = data.class_erp;

            // affirm
            res = await request(app)
                .get(`${baseRoute}/${data.term_id}/${newId}`)
                .auth(adminToken, { type: 'bearer' });

            expect(res.status).to.be.equal(200);
            expect(res.body.body.class_erp).to.be.equal(newId);
            expect(res.body.body.term_id).to.be.equal(data.term_id);

            // cleanup
            res = await request(app)
                .delete(`${baseRoute}/${data.term_id}/${newId}`)
                .auth(adminToken, { type: 'bearer' });
            expect(res.status).to.be.equal(200);
        });

        it("Scenario 2: Create a class request is incorrect", async() => {
            // arrange
            const data = { ...newClass };
            delete data.term_id; // term_id is required
            data.subject_code = '000'; // <-- a valid subject code should be 'XXX999'

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
            expect(incorrectParams).to.include.all.members(['term_id', 'subject_code']);
        });

        it("Scenario 3: Create a class request is unsuccessful due to unknown term_id", async() => {
            // arrange
            const data = {...newClass};
            data.term_id = unknownTermId; // <-- non-existent id

            // act
            const res = await request(this.app)
                .post(baseRoute)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(512);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForeignKeyViolationException');
            expect(res.body.headers.message).to.contains('term_id');
        });

        it("Scenario 4: Create a class request is unsuccessful due to unknown subject_code", async() => {
            // arrange
            const data = {...newClass};
            data.subject_code = unknownSubjectCode; // <-- non-existent id

            // act
            const res = await request(this.app)
                .post(baseRoute)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(512);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForeignKeyViolationException');
            expect(res.body.headers.message).to.contains('subject_code');
        });

        it("Scenario 5: Create a class request is unsuccessful due to unknown teacher_id", async() => {
            // arrange
            const data = {...newClass};
            data.teacher_id = unknownTeacherId; // <-- non-existent id

            // act
            const res = await request(this.app)
                .post(baseRoute)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(512);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForeignKeyViolationException');
            expect(res.body.headers.message).to.contains('teacher_id');
        });

        it("Scenario 6: Create a class request is unsuccessful due to unknown classroom_id", async() => {
            // arrange
            const data = {...newClass};
            data.classroom_id = unknownClassroomId; // <-- non-existent id

            // act
            const res = await request(this.app)
                .post(baseRoute)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(512);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForeignKeyViolationException');
            expect(res.body.headers.message).to.contains('classroom_id');
        });

        it("Scenario 7: Create a class request is unsuccessful due to unknown timeslot_id", async() => {
            // arrange
            const data = {...newClass};
            data.timeslot_1 = unknownTimeslotId; // <-- non-existent id

            // act
            const res = await request(this.app)
                .post(baseRoute)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(512);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForeignKeyViolationException');
            expect(res.body.headers.message).to.contains('timeslot_1');
        });

        it("Scenario 8: Create a class request is unsuccessful due to unknown parent_class_erp", async() => {
            // arrange
            const data = {...newClass};
            data.parent_class_erp = unknownClassERP; // <-- non-existent id

            // act
            const res = await request(this.app)
                .post(baseRoute)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(512);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForeignKeyViolationException');
            expect(res.body.headers.message).to.contains('parent_class_erp');
        });

        it("Scenario 9: Create a class request is forbidden", async() => {
            // arrange
            const data = { ...newClass };

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

        it("Scenario 10: Create a class request is unauthorized", async() => {
            // arrange
            const data = { ...newClass };

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

    context("POST /classes/bulk", () => {
        const subRoute = 'bulk';
        let newClasses = [];
        
        beforeEach(() => {
            newClasses = [
                {
                    class_erp: '8996',
                    semester: "CS-3",
                    classroom_id: 1,
                    subject_code: "CSE555",
                    teacher_id: 5,
                    timeslot_1: 2,
                    timeslot_2: 2,
                    day_1: "monday",
                    day_2: "wednesday",
                    term_id: 1,
                    parent_class_erp: ""
                },
                {
                    class_erp: '8997',
                    semester: "CS-3",
                    classroom_id: 4,
                    subject_code: "CSE555",
                    teacher_id: 5,
                    timeslot_1: 3,
                    timeslot_2: 3,
                    day_1: "monday",
                    day_2: "wednesday",
                    term_id: 1,
                    parent_class_erp: "8996"
                },
                {
                    class_erp: '8998',
                    semester: "ACF-2",
                    classroom_id: 3,
                    subject_code: "HUM201",
                    teacher_id: 1,
                    timeslot_1: 2,
                    timeslot_2: 2,
                    day_1: "tuesday",
                    day_2: "thursday",
                    term_id: 1,
                    parent_class_erp: ""
                },
                {
                    class_erp: '8999',
                    semester: "ECO-2",
                    classroom_id: 5,
                    subject_code: "HUM201",
                    teacher_id: 2,
                    timeslot_1: 2,
                    timeslot_2: 2,
                    day_1: "tuesday",
                    day_2: "thursday",
                    term_id: 1,
                    parent_class_erp: ""
                }
            ];
        });

        it("Scenario 1: Create many classes request is successful", async() => {
            // arrange
            const data = { classes: [...newClasses] };
            const app = this.app;

            // act
            let res = await request(app)
                .post(`${baseRoute}/${subRoute}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(201);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.body).to.include.all.keys(['affected_rows']);
            expect(res.body.body.affected_rows).to.be.equal(newClasses.length); // as many affected as classes sent
            const term_id = data.classes[0].term_id;

            // affirm
            res = await request(app)
                .get(`${baseRoute}?term_id=${term_id}`)
                .auth(adminToken, { type: 'bearer' });

            expect(res.status).to.be.equal(200);
            const classERPs = data.classes.map(classRow => (classRow.class_erp));
            const responseERPs = res.body.body.map(classRow => (classRow.class_erp));
            expect(responseERPs).to.include.all.members(classERPs);

            // cleanup
            for (const class_erp of classERPs.reverse()) { // reversing so that FK references get removed first
                res = await request(app)
                    .delete(`${baseRoute}/${term_id}/${class_erp}`)
                    .auth(adminToken, { type: 'bearer' });
                expect(res.status).to.be.equal(200);
            }
        });

        it("Scenario 2: Create many classes request is incorrect", async() => {
            // arrange
            const data = { classes: [...newClasses] };
            delete data.classes[0].term_id; // term_id is required
            data.classes[0].subject_code = '000'; // <-- a valid subject code should be 'XXX999'

            // act
            const res = await request(this.app)
                .post(`${baseRoute}/${subRoute}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(422);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('InvalidPropertiesException');
            const incorrectParams = res.body.headers.data.map(o => (o.param.split('.')[1]));
            expect(incorrectParams).to.include.all.members(['term_id', 'subject_code']);
        });

        it("Scenario 3: Create many classes request is unsuccessful due to unknown term_id", async() => {
            // arrange
            const data = {classes: [...newClasses]};
            data.classes[0].term_id = unknownTermId; // <-- non-existent id

            // act
            const res = await request(this.app)
                .post(`${baseRoute}/${subRoute}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(512);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForeignKeyViolationException');
            expect(res.body.headers.message).to.contains('term_id');
        });

        it("Scenario 4: Create many classes request is unsuccessful due to unknown subject_code", async() => {
            // arrange
            const data = {classes: [...newClasses]};
            data.classes[0].subject_code = unknownSubjectCode; // <-- non-existent id

            // act
            const res = await request(this.app)
                .post(`${baseRoute}/${subRoute}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(512);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForeignKeyViolationException');
            expect(res.body.headers.message).to.contains('subject_code');
        });

        it("Scenario 5: Create many classes request is unsuccessful due to unknown teacher_id", async() => {
            // arrange
            const data = {classes: [...newClasses]};
            data.classes[0].teacher_id = unknownTeacherId; // <-- non-existent id

            // act
            const res = await request(this.app)
                .post(`${baseRoute}/${subRoute}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(512);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForeignKeyViolationException');
            expect(res.body.headers.message).to.contains('teacher_id');
        });

        it("Scenario 6: Create many classes request is unsuccessful due to unknown classroom_id", async() => {
            // arrange
            const data = {classes: [...newClasses]};
            data.classes[0].classroom_id = unknownClassroomId; // <-- non-existent id

            // act
            const res = await request(this.app)
                .post(`${baseRoute}/${subRoute}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(512);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForeignKeyViolationException');
            expect(res.body.headers.message).to.contains('classroom_id');
        });

        it("Scenario 7: Create many classes request is unsuccessful due to unknown timeslot_id", async() => {
            // arrange
            const data = {classes: [...newClasses]};
            data.classes[0].timeslot_1 = unknownTimeslotId; // <-- non-existent id

            // act
            const res = await request(this.app)
                .post(`${baseRoute}/${subRoute}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(512);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForeignKeyViolationException');
            expect(res.body.headers.message).to.contains('timeslot_1');
        });

        it("Scenario 8: Create many classes request is unsuccessful due to unknown parent_class_erp", async() => {
            // arrange
            const data = {classes: [...newClasses]};
            data.classes[0].parent_class_erp = unknownClassERP; // <-- non-existent id

            // act
            const res = await request(this.app)
                .post(`${baseRoute}/${subRoute}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(512);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForeignKeyViolationException');
            expect(res.body.headers.message).to.contains('parent_class_erp');
        });

        it("Scenario 9: Create many classes request is forbidden", async() => {
            // arrange
            const data = {classes: [...newClasses]};

            // act
            const res = await request(this.app)
                .post(`${baseRoute}/${subRoute}`)
                .auth(userToken, { type: 'bearer' }) // <-- api_user token instead of admin token
                .send(data);
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 10: Create many classes request is unauthorized", async() => {
            // arrange
            const data = {classes: [...newClasses]};

            // act
            const res = await request(this.app)
                .post(`${baseRoute}/${subRoute}`)
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("PATCH /classes/:term_id/:class_erp", () => {
        const newClassroom = 3;
        const subRoute = existingClass.term_id;

        it("Scenario 1: Update a class request is successful", async() => {
            // arrange
            const data = { classroom_id: newClassroom };
            const app = this.app;

            // act
            let res = await request(app)
                .patch(`${baseRoute}/${subRoute}/${existingClass.class_erp}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.body.rows_matched).to.be.equal(1);
            expect(res.body.body.rows_changed).to.be.equal(1);

            // affirm
            res = await request(app)
                .get(`${baseRoute}/${subRoute}/${existingClass.class_erp}`)
                .auth(userToken, { type: 'bearer' });
            
            expect(res.status).to.be.equal(200);
            expect(res.body.body.classroom.classroom_id).to.be.equal(newClassroom);
            
            // cleanup
            data.classroom_id = existingClass.classroom.classroom_id;
            res = await request(app)
                .patch(`${baseRoute}/${subRoute}/${existingClass.class_erp}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
            expect(res.status).to.be.equal(200);
        });

        it("Scenario 2: Update a class request is unsuccessful due to unknown class_erp", async() => {
            // arrange
            const data = { classroom_id: newClassroom };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${subRoute}/${unknownClassERP}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Class not found');
        });

        it("Scenario 3: Update a class request is unsuccessful due to unknown term_id", async() => {
            // arrange
            const data = { classroom_id: newClassroom };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${unknownTermId}/${existingClass.class_erp}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Class not found');
        });

        it("Scenario 4: Update a class request is unsuccessful due to unknown subject_code", async() => {
            // arrange
            const data = { subject_code: unknownSubjectCode };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${subRoute}/${existingClass.class_erp}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(512);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForeignKeyViolationException');
            expect(res.body.headers.message).to.contains('subject_code');
        });

        it("Scenario 5: Update a class request is unsuccessful due to unknown teacher_id", async() => {
            // arrange
            const data = { teacher_id: unknownTeacherId };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${subRoute}/${existingClass.class_erp}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(512);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForeignKeyViolationException');
            expect(res.body.headers.message).to.contains('teacher_id');
        });

        it("Scenario 6: Update a class request is unsuccessful due to unknown classroom_id", async() => {
            // arrange
            const data = { classroom_id: unknownClassroomId };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${subRoute}/${existingClass.class_erp}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(512);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForeignKeyViolationException');
            expect(res.body.headers.message).to.contains('classroom_id');
        });

        it("Scenario 7: Update a class request is unsuccessful due to unknown timeslot_id", async() => {
            // arrange
            const data = { timeslot_1: unknownTimeslotId };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${subRoute}/${existingClass.class_erp}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(512);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForeignKeyViolationException');
            expect(res.body.headers.message).to.contains('timeslot_1');
        });

        it("Scenario 8: Update a class request is unsuccessful due to unknown parent_class_erp", async() => {
            // arrange
            const data = { parent_class_erp: unknownClassERP };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${subRoute}/${existingClass.class_erp}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(512);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForeignKeyViolationException');
            expect(res.body.headers.message).to.contains('parent_class_erp');
        });

        it("Scenario 9: Update a class request is incorrect", async() => {
            // arrange
            const data = {
                classroom: newClassroom, // <-- an valid parameter name should be 'classroom_id'
                subject_code: '123' // <-- a valid 'subject_code' follows format 'XXX999' only
            };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${subRoute}/${existingClass.class_erp}`)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(422);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('InvalidPropertiesException');
            const incorrectParams = res.body.headers.data.map(o => (o.param));
            expect(incorrectParams).to.include('subject_code');
            const incorrectMsg = res.body.headers.data.map(o => (o.msg));
            expect(incorrectMsg).to.include('Invalid updates!');
        });

        it("Scenario 10: Update a class request is forbidden", async() => {
            // arrange
            const data = { classroom_id: newClassroom };
            
            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${subRoute}/${existingClass.class_erp}`)
                .auth(userToken, { type: 'bearer' }) // <-- user can't change classes
                .send(data);
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 11: Update a class request is unauthorized", async() => {
            // arrange
            const data = { classroom_id: newClassroom };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${subRoute}/${existingClass.class_erp}`)
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("DELETE /classes/:term_id/:class_erp", () => {
        const newClass = {
            class_erp: 6999,
            semester: "CS-7",
            classroom_id: 2,
            subject_code: "CSE452",
            teacher_id: "4",
            timeslot_1: 5,
            timeslot_2: 5,
            day_1: "tuesday",
            day_2: "thursday",
            term_id: 1
        };
        const subRoute = newClass.term_id;

        it("Scenario 1: Delete a subject request is successful", async() => {
            // prepare
            const data = { ...newClass };
            const app = this.app;

            // create dummy
            let res = await request(app)
                .post(baseRoute)
                .auth(adminToken, { type: 'bearer' })
                .send(data);
            expect(res.status).to.be.equal(201);

            // arrange
            const newId = data.class_erp;

            // act
            res = await request(app)
                .delete(`${baseRoute}/${subRoute}/${newId}`)
                .auth(adminToken, { type: 'bearer' });

            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.headers.message).to.be.equal('Class has been deleted');
            expect(res.body.body.rows_removed).to.be.equal(1);

            // affirm
            res = await request(app)
                .get(`${baseRoute}/${subRoute}/${newId}`)
                .auth(adminToken, { type: 'bearer' });
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
        });

        it("Scenario 2: Delete a subject request is unsuccessful due to unknown class_erp", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${subRoute}/${unknownClassERP}`)
                .auth(adminToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Class not found');
        });

        it("Scenario 3: Delete a subject request is unsuccessful due to unknown term_id", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${unknownTermId}/${existingClass.class_erp}`)
                .auth(adminToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Class not found');
        });

        it("Scenario 4: Delete a subject request is forbidden", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${subRoute}/${existingClass.class_erp}`)
                .auth(userToken, { type: 'bearer' }); // <-- api_user token instead of admin token
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 5: Delete a subject request is unauthorized", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${subRoute}/${existingClass.class_erp}`);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

});