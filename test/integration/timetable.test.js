/* eslint-disable no-undef */
const request = require("supertest");
const expect = require('chai').expect;
const sinon = require('sinon');
const decache = require('decache');
const jwt = require('jsonwebtoken');
const {Config} = require('../../src/configs/config');

describe("Timetables API", () => {
    const API = `/api/${Config.API_VERSION}`;
    const baseRoute = API + "/timetables";
    const userERP = '17855';
    const existingTimetable = {
        timetable_id: 1,
        student_erp: userERP,
        term_id: 1,
        is_active: 1
    };
    const existingClass1 = {
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
    const existingClass2 = {
        class_erp: "5756",
        semester: "CS-3",
        parent_class_erp: null,
        day_1: "monday",
        day_2: "wednesday",
        term_id: 1,
        classroom: {
            classroom_id: 1,
            classroom: "MTC1",
            campus: {
                campus_id: 1,
                campus: "MAIN"
            }
        },
        subject: {
            subject_code: "CSE555",
            subject: "Data Structures"
        },
        teacher: {
            teacher_id: 5,
            full_name: "Imran Khan",
            average_rating: "0.000",
            total_reviews: 0
        },
        timeslot_1: {
            timeslot_id: 2,
            start_time: "10:00:00",
            end_time: "11:15:00",
            slot_number: 2
        },
        timeslot_2: {
            timeslot_id: 2,
            start_time: "10:00:00",
            end_time: "11:15:00",
            slot_number: 2
        }
    };
    const existingClass3 = {
        class_erp: "5757",
        semester: "CS-3",
        parent_class_erp: "5756",
        day_1: "monday",
        day_2: "wednesday",
        term_id: 1,
        classroom: {
            classroom_id: 4,
            classroom: "MTL4",
            campus: {
                campus_id: 1,
                campus: "MAIN"
            }
        },
        subject: {
            subject_code: "CSE555",
            subject: "Data Structures"
        },
        teacher: {
            teacher_id: 5,
            full_name: "Imran Khan",
            average_rating: "0.000",
            total_reviews: 0
        },
        timeslot_1: {
            timeslot_id: 3,
            start_time: "11:30:00",
            end_time: "12:45:00",
            slot_number: 3
        },
        timeslot_2: {
            timeslot_id: 3,
            start_time: "11:30:00",
            end_time: "12:45:00",
            slot_number: 3
        }
    };
    const unOwnedTimetableId = 5; // timetable_id(5).student_erp != userERP
    const inActiveTimetableId = 2;
    const unknownTimetableId = 99999;
    const adminERP = '15030';
    const userToken = jwt.sign({erp: userERP}, Config.SECRET_JWT); // non expiry token
    const adminToken = jwt.sign({erp: adminERP}, Config.SECRET_JWT);

    beforeEach(() => {
        this.app = require('../../src/server').setup();
    });

    context("GET /timetables", () => {
        it("Scenario 1: Get all timetables request is successful (Admin Only)", async() => {
            // act
            let res = await request(this.app)
                .get(baseRoute)
                .auth(adminToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            const resBody = res.body.body;

            expect(resBody).to.be.an('array');
            expect(resBody[0]).to.include.all.keys(Object.keys(existingTimetable)); // contain all params
        });

        it("Scenario 2: Get all timetables request successful (using query params)", async() => {
            // act
            const student_erp = userERP;
            let res = await request(this.app)
                .get(`${baseRoute}?student_erp=${student_erp}`)
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            const resBody = res.body.body;

            expect(resBody).to.be.an('array');
            expect(resBody[0].student_erp).to.be.equal(student_erp);
        });

        it("Scenario 3: Get all timetables request unsuccessful due to no student timetables", async() => {
            // arrange
            decache('../../src/server');
            const TimetableModel = require('../../src/models/timetable.model');
            const modelStub = sinon.stub(TimetableModel, 'findAll').callsFake(() => []); // return empty timetable list
            const app = require('../../src/server').setup();

            // act
            const res = await request(app)
                .get(baseRoute)
                .auth(adminToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Timetables not found');
            modelStub.restore();
        });

        it("Scenario 4: Get all timetables request is incorrect due to unknown query parameters", async() => {
            // arrange
            const student_erp = 'all'; // <-- invalid student_erp value
            
            // act
            let res = await request(this.app)
                .get(`${baseRoute}?student_erp=${student_erp}&year=2022`) // <-- `year` is an incorrect query param
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(422);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('InvalidPropertiesException');
            const incorrectParams = res.body.headers.data.map(o => (o.param));
            expect(incorrectParams).to.include('student_erp');
            const incorrectMsg = res.body.headers.data.map(o => (o.msg));
            expect(incorrectMsg).to.include('Invalid query params!');
        });

        it("Scenario 5: Get all timetables request is forbidden due to no query params", async() => {
            // act
            let res = await request(this.app)
                .get(baseRoute) // needs student_erp
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 6: Get all timetables request is unauthorized", async() => {
            // act
            let res = await request(this.app).get(baseRoute);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("GET /timetables/:id", () => {
        it("Scenario 1: Get a timetable request successful", async() => {
            // act
            let res = await request(this.app)
                .get(`${baseRoute}/${existingTimetable.timetable_id}`)
                .auth(userToken, { type: 'bearer' });

            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            const resBody = res.body.body;
            expect(resBody.timetable_id).to.be.equal(existingTimetable.timetable_id); // should match initially sent id
            expect(resBody).to.include.all.keys(Object.keys(existingTimetable)); // contain all params

            expect(resBody.classes).to.be.an('array');
            expect(resBody.classes[0]).to.include.all.keys(Object.keys(existingClass1)); // contain all params
            const exampleClass = resBody.classes[0];

            expect(exampleClass.classroom).to.not.be.undefined;
            expect(exampleClass.classroom).to.include.all.keys(Object.keys(existingClass1.classroom)); // contain all params
            
            expect(exampleClass.classroom.campus).to.not.be.undefined;
            expect(exampleClass.classroom.campus).to.include.all.keys(Object.keys(existingClass1.classroom.campus)); // contain all params

            expect(exampleClass.subject).to.not.be.undefined;
            expect(exampleClass.subject).to.include.all.keys(Object.keys(existingClass1.subject)); // contain all params

            expect(exampleClass.teacher).to.not.be.undefined;
            expect(exampleClass.teacher).to.include.all.keys(Object.keys(existingClass1.teacher)); // contain all params

            expect(exampleClass.timeslot_1).to.not.be.undefined;
            expect(exampleClass.timeslot_1).to.include.all.keys(Object.keys(existingClass1.timeslot_1)); // contain all params

            expect(exampleClass.timeslot_2).to.not.be.undefined;
            expect(exampleClass.timeslot_2).to.include.all.keys(Object.keys(existingClass1.timeslot_2)); // contain all params
        
        });

        it("Scenario 2: Get a timetable request is unsuccessful", async() => {
            // act
            const res = await request(this.app)
                .get(`${baseRoute}/${unknownTimetableId}`)
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Timetable not found');
        });

        it("Scenario 3: Get a timetable request is unauthorized", async() => {
            // act
            let res = await request(this.app).get(`${baseRoute}/${existingTimetable.timetable_id}`);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("POST /timetables", () => {
        const timetableClassERPs = [existingClass1.class_erp, existingClass2.class_erp, existingClass3.class_erp];
        const newTimetable = {
            student_erp: existingTimetable.student_erp,
            term_id: existingTimetable.term_id,
            is_active: 0,
            classes: timetableClassERPs
        };

        it("Scenario 1: Create a timetable request is successful", async() => {
            // arrange
            const data = { ...newTimetable };
            const app = this.app;

            // act
            let res = await request(app)
                .post(baseRoute)
                .auth(userToken, { type: 'bearer' }) // using his own token i.e. token erp == newTimetable.student_erp
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(201);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.body).to.include.keys(['timetable_id', 'affected_rows']);
            expect(res.body.body.affected_rows).to.be.equal(1);
            
            // affirm
            const newId = res.body.body.timetable_id;
            res = await request(app)
                .get(`${baseRoute}/${newId}`)
                .auth(userToken, { type: 'bearer' });

            expect(res.status).to.be.equal(200);
            const resBody = res.body.body;
            resBody.classes = resBody.classes.map(classItem => classItem.class_erp);
            expect(resBody).to.be.eql({
                timetable_id: newId,
                ...data
            });

            // cleanup
            res = await request(app)
                .delete(`${baseRoute}/${newId}`)
                .auth(userToken, { type: 'bearer' });
            expect(res.status).to.be.equal(200);
        });

        it("Scenario 2: Create a timetable request is incorrect", async() => {
            // arrange
            const {classes, ...timetable} = newTimetable;
            const data = {
                ...timetable,
                classessfd: classes // <-- a valid param is 'classes'
            };

            // act
            const res = await request(this.app)
                .post(baseRoute)
                .auth(userToken, { type: 'bearer' }) // using his own token i.e. token erp == newTimetable.student_erp
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(422);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('InvalidPropertiesException');
            const incorrectParams = res.body.headers.data.map(o => (o.param));
            expect(incorrectParams).to.include.members(['classes']);
        });

        it("Scenario 3: Create a timetable request is forbidden (Unowned Student ERP)", async() => {
            // arrange
            const data = { ...newTimetable };
            data.student_erp = adminERP; // <-- can be any other non-admin ERP as well, just different from userToken erp

            // act
            const res = await request(this.app)
                .post(baseRoute)
                .auth(userToken, { type: 'bearer' }) // <-- user can't create others timetables i.e. token erp != newTimetable.student_erp
                .send(data);
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 4: Create a timetable request is unauthorized", async() => {
            // arrange
            const data = { ...newTimetable };

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

    context("POST /timetables/generate", () => {
        const subRoute = "generate";
        const possibleClasses = [existingClass1, existingClass2, existingClass3];
        const num_of_subjects = possibleClasses.length;

        it("Scenario 1: Generate timetables request is successful", async() => {
            // arrange
            const data = { num_of_subjects, classes: possibleClasses };
            const app = this.app;

            // act
            let res = await request(app)
                .post(`${baseRoute}/${subRoute}`)
                .auth(userToken, { type: 'bearer' }) // using his own token i.e. token erp == newTimetable.student_erp
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            const resBody = res.body.body;

            expect(resBody).to.be.an('array');
            const exampleTimetable = resBody[0];
            
            expect(exampleTimetable).to.include.all.keys(["term_id", "is_active", "classes"]); // contain all params

            expect(exampleTimetable.classes).to.be.an('array');
            expect(exampleTimetable.classes[0]).to.include.all.keys(Object.keys(existingClass1)); // contain all params
            const exampleClass = exampleTimetable.classes[0];

            expect(exampleClass.classroom).to.not.be.undefined;
            expect(exampleClass.classroom).to.include.all.keys(Object.keys(existingClass1.classroom)); // contain all params
            
            expect(exampleClass.classroom.campus).to.not.be.undefined;
            expect(exampleClass.classroom.campus).to.include.all.keys(Object.keys(existingClass1.classroom.campus)); // contain all params

            expect(exampleClass.subject).to.not.be.undefined;
            expect(exampleClass.subject).to.include.all.keys(Object.keys(existingClass1.subject)); // contain all params

            expect(exampleClass.teacher).to.not.be.undefined;
            expect(exampleClass.teacher).to.include.all.keys(Object.keys(existingClass1.teacher)); // contain all params

            expect(exampleClass.timeslot_1).to.not.be.undefined;
            expect(exampleClass.timeslot_1).to.include.all.keys(Object.keys(existingClass1.timeslot_1)); // contain all params

            expect(exampleClass.timeslot_2).to.not.be.undefined;
            expect(exampleClass.timeslot_2).to.include.all.keys(Object.keys(existingClass1.timeslot_2)); // contain all params

        });

        it("Scenario 2: Generate timetables request is unsuccessful due to no possible timetables", async() => {
            // arrange
            const data = { num_of_subjects, classes: possibleClasses };
            decache('../../src/server');
            const TimetableRepository = require('../../src/repositories/timetable.repository');
            const modelStub = sinon.stub(TimetableRepository, 'findScheduleClass').callsFake(() => []); // return empty timetable list
            const app = require('../../src/server').setup();

            // act
            const res = await request(app)
                .post(`${baseRoute}/${subRoute}`)
                .auth(userToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Possible timetables not found');
            modelStub.restore();
        });

        it("Scenario 3: Create a timetable request is incorrect", async() => {
            // arrange
            const data = {
                subjects: num_of_subjects, // <-- a valid param is 'num_of_subjects'
                classes: [] // <-- must specify atleast 1 'class'
            };

            // act
            const res = await request(this.app)
                .post(`${baseRoute}/${subRoute}`)
                .auth(userToken, { type: 'bearer' }) // using his own token i.e. token erp == newTimetable.student_erp
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(422);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('InvalidPropertiesException');
            const incorrectParams = res.body.headers.data.map(o => (o.param));
            expect(incorrectParams).to.include.members(['num_of_subjects', 'classes']);
        });

        it("Scenario 4: Create a timetable request is unauthorized", async() => {
            // arrange
            const data = { num_of_subjects, classes: possibleClasses };

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

    context("PATCH /timetables/:id", () => {
        const updatedTimetableIsActive = 1;

        it("Scenario 1: Update a timetable request is successful (Owner)", async() => {
            // arrange
            const data = { is_active: updatedTimetableIsActive };
            const app = this.app;

            // act
            let res = await request(app)
                .patch(`${baseRoute}/${inActiveTimetableId}`)
                .auth(userToken, { type: 'bearer' }) // using his own token i.e. token erp == existingTimetable.student_erp
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.body.rows_matched).to.be.equal(2); // 1 for inactive the previous, then active new
            expect(res.body.body.rows_changed).to.be.equal(2); // 1 for inactive the previous, then active new
            
            // affirm
            res = await request(app)
                .get(`${baseRoute}/${inActiveTimetableId}`)
                .auth(userToken, { type: 'bearer' });
            
            expect(res.status).to.be.equal(200);
            expect(res.body.body.is_active).to.be.equal(updatedTimetableIsActive);
            
            // cleanup
            data.is_active = existingTimetable.is_active;
            res = await request(app)
                .patch(`${baseRoute}/${existingTimetable.timetable_id}`)
                .auth(userToken, { type: 'bearer' })
                .send(data);
            expect(res.status).to.be.equal(200);
        });

        it("Scenario 2: Update a timetable request is unsuccessful due to unknown timetable_id", async() => {
            // arrange
            const data = { is_active: updatedTimetableIsActive };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${unknownTimetableId}`)
                .auth(userToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Timetable not found');
        });

        it("Scenario 3: Update a timetable request is incorrect", async() => {
            // arrange
            const data = {
                bodysds: updatedTimetableIsActive, // <-- an valid parameter name should be 'is_active'
                is_active: "all" // <-- an invalid value for 'is_active' parameter
            };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${existingTimetable.timetable_id}`)
                .auth(userToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(422);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('InvalidPropertiesException');
            const incorrectParams = res.body.headers.data.map(o => (o.param));
            expect(incorrectParams).to.include('is_active');
            const incorrectMsg = res.body.headers.data.map(o => (o.msg));
            expect(incorrectMsg).to.include('Invalid updates!');
        });

        it("Scenario 4: Update a timetable request is forbidden (Unowned Student ERP)", async() => {
            // arrange
            const data = { is_active: updatedTimetableIsActive };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${unOwnedTimetableId}`) // <-- has a different student_erp than userToken erp
                .auth(userToken, { type: 'bearer' }) // <-- user can't change others timetables i.e. token erp != unOwnedTimetable.student_erp
                .send(data);
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 5: Update a timetable request is unauthorized", async() => {
            // arrange
            const data = { is_active: updatedTimetableIsActive };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${inActiveTimetableId}`)
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("PATCH /timetables/:id/classes", () => {
        const subRoute = "classes";
        const unAddedClassERP = "5759";
        const clashingClassERP = "5758";
        const unknownClassERP = "9999";
        const added = [unAddedClassERP];
        const removed = [clashingClassERP, existingClass1.class_erp];

        it("Scenario 1: Update a timetable request is successful (Owner)", async() => {
            // arrange
            const data = { added, removed };
            const app = this.app;

            // act
            let res = await request(app)
                .patch(`${baseRoute}/${existingTimetable.timetable_id}/${subRoute}`)
                .auth(userToken, { type: 'bearer' }) // using his own token i.e. token erp == existingTimetable.student_erp
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.body.rows_added).to.be.equal(added.length);
            expect(res.body.body.rows_removed).to.be.equal(removed.length);
            
            // affirm
            res = await request(app)
                .get(`${baseRoute}/${existingTimetable.timetable_id}`)
                .auth(userToken, { type: 'bearer' });
            
            expect(res.status).to.be.equal(200);
            const classes = res.body.body.classes;
            const classERPs = classes.map(classItem => classItem.class_erp);
            expect(classERPs).to.include.all.members(added);
            expect(classERPs).to.not.include.all.members(removed);
            
            // cleanup
            data.added = [...removed];
            data.removed = [...added];
            res = await request(app)
                .patch(`${baseRoute}/${existingTimetable.timetable_id}/${subRoute}`)
                .auth(userToken, { type: 'bearer' })
                .send(data);
            expect(res.status).to.be.equal(200);
        });

        it("Scenario 2: Update a timetable request is unsuccessful due to unknown timetable_id", async() => {
            // arrange
            const data = { added, removed };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${unknownTimetableId}/${subRoute}`)
                .auth(userToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Timetable not found');
        });

        it("Scenario 3: Update a timetable request is unsuccessful due to unknown class_erp", async() => {
            // arrange
            const data = { added: [unknownClassERP] }; // adding an unknown class erp

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${existingTimetable.timetable_id}/${subRoute}`)
                .auth(userToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(512);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForeignKeyViolationException');
            expect(res.body.headers.message).to.contain('class_erp');
        });

        it("Scenario 4: Update a timetable request is incorrect", async() => {
            // arrange
            const data = {
                added: [], // <-- 'added' should be omitted if empty
                removed: ["all"], // <-- all values in the array should match the classERP format(4 or 5 digits)
                same: [existingClass2.class_erp] // <-- not an allowed update parameter
            };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${existingTimetable.timetable_id}/${subRoute}`)
                .auth(userToken, { type: 'bearer' })
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(422);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('InvalidPropertiesException');
            const incorrectParams = res.body.headers.data.map(o => (o.param));
            expect(incorrectParams).to.include.all.members(['added', 'removed[0]']);
            const incorrectMsg = res.body.headers.data.map(o => (o.msg));
            expect(incorrectMsg).to.include('Invalid updates!');
        });

        it("Scenario 5: Update a timetable request is forbidden (Unowned Student ERP)", async() => {
            // arrange
            const data = { added, removed };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${unOwnedTimetableId}/${subRoute}`) // <-- has a different student_erp than userToken erp
                .auth(userToken, { type: 'bearer' }) // <-- user can't change others timetables i.e. token erp != unOwnedTimetable.student_erp
                .send(data);
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 6: Update a timetable request is unauthorized", async() => {
            // arrange
            const data = { added, removed };

            // act
            const res = await request(this.app)
                .patch(`${baseRoute}/${existingTimetable.timetable_id}/${subRoute}`)
                .send(data);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

    context("DELETE /timetables/:id", () => {
        const timetableClassERPs = [existingClass1.class_erp, existingClass2.class_erp, existingClass3.class_erp];
        const newTimetable = {
            student_erp: existingTimetable.student_erp,
            term_id: existingTimetable.term_id,
            is_active: 0,
            classes: timetableClassERPs
        };

        it("Scenario 1: Delete a timetable request is successful (Owner)", async() => {
            // arrange
            const data = { ...newTimetable };
            const app = this.app;

            // act
            let res = await request(app)
                .post(baseRoute)
                .auth(userToken, { type: 'bearer' })
                .send(data);
            expect(res.status).to.be.equal(201);

            // arrange
            const newId = res.body.body.timetable_id;

            // act
            res = await request(app)
                .delete(`${baseRoute}/${newId}`)
                .auth(userToken, { type: 'bearer' }); // using his own token i.e. token erp == newTimetable.student_erp

            // assert
            expect(res.status).to.be.equal(200);
            expect(res.body.headers.error).to.be.equal(0);
            expect(res.body.headers.message).to.be.equal('Timetable has been deleted');
            expect(res.body.body.rows_removed).to.be.equal(1);

            // affirm
            res = await request(app)
                .get(`${baseRoute}/${newId}`)
                .auth(userToken, { type: 'bearer' });
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
        });

        it("Scenario 2: Delete a timetable request is unsuccessful due to unknown timetable_id", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${unknownTimetableId}`)
                .auth(userToken, { type: 'bearer' });
    
            // assert
            expect(res.status).to.be.equal(404);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('NotFoundException');
            expect(res.body.headers.message).to.be.equal('Timetable not found');
        });

        it("Scenario 3: Delete a timetable request is forbidden (Unowned Student ERP)", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${unOwnedTimetableId}`) // <-- has a different student_erp than userToken erp
                .auth(userToken, { type: 'bearer' }); // <-- user can't delete others timetables i.e. token erp != unOwnedTimetable.student_erp
            
            // assert
            expect(res.status).to.be.equal(403);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('ForbiddenException');
            expect(res.body.headers.message).to.be.equal('User unauthorized for action');
        });

        it("Scenario 5: Delete a timetable request is unauthorized", async() => {
            // act
            const res = await request(this.app)
                .delete(`${baseRoute}/${existingTimetable.timetable_id}`);
    
            // assert
            expect(res.status).to.be.equal(401);
            expect(res.body.headers.error).to.be.equal(1);
            expect(res.body.headers.code).to.be.equal('TokenMissingException');
            expect(res.body.headers.message).to.be.equal('Access denied. No token credentials sent');
        });
    });

});