/* eslint-disable no-undef */
const expect = require('chai').expect;
const sinon = require('sinon');
const { DBService } = require("../../../src/db/db-service");
const { DatabaseException } = require('../../../src/utils/exceptions/database.exception');

describe("Activity Status Model", () => {
    const ActivityStatusModel = require('../../../src/models/activityStatus.model');
    const existingActivityStatuses = [
        {
            activity_status_id: 1,
            activity_status: 'Happening'
        },
        {
            activity_status_id: 2,
            activity_status: 'Scheduled'
        }
    ];
    let dbServiceStub;
    
    beforeEach(() => {
        dbServiceStub = sinon.stub(DBService, 'query');
    });

    afterEach(() => {
        dbServiceStub.restore();
    });

    context("findAll", () => {
        it(`
            GIVEN the database has some activity statuses
            WHEN this function is called with empty filters
            THEN all activity statuses are returned
        `, async() => {
            // arrange
            dbServiceStub.returns(existingActivityStatuses);

            // act
            const activityStatusList = await ActivityStatusModel.findAll({});
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string)).to.be.true;
            expect(activityStatusList).to.be.eql(existingActivityStatuses);
        });

        it(`
            GIVEN the database has some activity statuses
            WHEN this function is called with filters specified
            THEN only matching activity statuses are returned
        `, async() => {
            // arrange
            const filters = {activity_status_id: 1};
            const filterCheck = (aStatus) => aStatus.activity_status_id === filters.activity_status_id;
            const filteredActivityStatuses = existingActivityStatuses.filter(filterCheck);
            dbServiceStub.returns(filteredActivityStatuses);

            // act
            const activityStatusList = await ActivityStatusModel.findAll(filters);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match.array)).to.be.true;
            expect(activityStatusList).to.be.eql(filteredActivityStatuses);
        });

        it(`
            GIVEN the database has no activity statuses
            WHEN this function is called
            THEN empty array is returned
        `, async() => {
            // arrange
            dbServiceStub.returns([]);

            // act
            const activityStatusList = await ActivityStatusModel.findAll({});
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string)).to.be.true;
            expect(activityStatusList).to.be.eql([]);
        });

        it(`
            GIVEN the database has some error
            WHEN this function is called
            THEN an exception is thrown
        `, async() => {
            // arrange
            const exception = new DatabaseException('some error');
            dbServiceStub.throws(exception);

            // act
            let error;
            try {
                await ActivityStatusModel.findAll({});
                expect.fail('findAll should be rejected');
            } catch (err) {
                error = err;
            }
            
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string)).to.be.true;
            expect(dbServiceStub.threw(exception)).to.be.true;
            expect(error instanceof DatabaseException).to.be.true;
            expect(error.message).to.be.equal("some error");
        });
    });

    context("findOne", () => {
        const filters = {activity_status_id: 1};

        it(`
            GIVEN the database has some activity statuses
            WHEN this function is called with some filter
            THEN a single filtered activity status is returned
        `, async() => {
            // arrange
            const filterCheck = (aStatus) => aStatus.activity_status_id === filters.activity_status_id;
            const filteredActivityStatus = existingActivityStatuses.find(filterCheck);
            dbServiceStub.returns([filteredActivityStatus]);

            // act
            const activityStatus = await ActivityStatusModel.findOne(filters);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match([filters.activity_status_id]))).to.be.true;
            expect(activityStatus).to.be.eql(filteredActivityStatus);
        });

        it(`
            GIVEN the database has no activity statuses
            WHEN this function is called
            THEN empty object is returned
        `, async() => {
            // arrange
            dbServiceStub.returns([]);
            
            // act
            const activityStatus = await ActivityStatusModel.findOne(filters);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match.array)).to.be.true;
            expect(activityStatus).to.be.undefined;
        });

        it(`
            GIVEN the database has some error
            WHEN this function is called
            THEN an exception is thrown
        `, async() => {
            // arrange
            const exception = new DatabaseException('some error');
            dbServiceStub.throws(exception);

            // act
            let error;
            try {
                await ActivityStatusModel.findOne(filters);
                expect.fail('findOne should be rejected');
            } catch (err) {
                error = err;
            }
            
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match.array)).to.be.true;
            expect(dbServiceStub.threw(exception)).to.be.true;
            expect(error instanceof DatabaseException).to.be.true;
            expect(error.message).to.be.equal("some error");
        });
    });

    context("create", () => {
        const newActivityStatus = { activity_status: 'Postponed' };
        
        it(`
            GIVEN a new activity status
            WHEN this function is called with new data
            THEN a new activity status is created successfully
            AND it's id is returned
        `, async() => {
            // arrange
            const newId = existingActivityStatuses.length + 1;
            dbServiceStub.returns({ insertId: newId, affectedRows: 1 });

            // act
            const result = await ActivityStatusModel.create(newActivityStatus);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match([newActivityStatus.activity_status]))).to.be.true;
            expect(result.activity_status_id).to.be.equal(newId);
            expect(result.affected_rows).to.be.equal(1);
        });

        it(`
            GIVEN a new activity status
            WHEN this function is called with new data
            AND the database fails to create a new activity status
            THEN 0 is returned
        `, async() => {
            // arrange
            dbServiceStub.returns(undefined);
            
            // act
            const activityStatus = await ActivityStatusModel.create(newActivityStatus);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match.array)).to.be.true;
            expect(activityStatus).to.be.equal(0);
        });

        it(`
            GIVEN the database has some error
            WHEN this function is called
            THEN an exception is thrown
        `, async() => {
            // arrange
            const exception = new DatabaseException('some error');
            dbServiceStub.throws(exception);

            // act
            let error;
            try {
                await ActivityStatusModel.create(newActivityStatus);
                expect.fail('create should be rejected');
            } catch (err) {
                error = err;
            }
            
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match.array)).to.be.true;
            expect(dbServiceStub.threw(exception)).to.be.true;
            expect(error instanceof DatabaseException).to.be.true;
            expect(error.message).to.be.equal("some error");
        });
    });

    context("update", () => {
        const newActivityStatus = { activity_status: 'Postponed'};
        
        it(`
            GIVEN a new activity status name
            WHEN this function is called with new data and id
            THEN the specific activity status is updated successfully
            AND a result with update information is returned
        `, async() => {
            // arrange
            const existingId = existingActivityStatuses[0].activity_status_id;
            dbServiceStub.returns({ affectedRows: 1, changedRows: 1, info: "Rows updated successfully" });

            // act
            const result = await ActivityStatusModel.update(newActivityStatus, existingId);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(
                sinon.match.string,
                sinon.match([newActivityStatus.activity_status, existingId])
            )).to.be.true;
            expect(result.affectedRows).to.be.equal(1);
            expect(result.changedRows).to.be.equal(1);
            expect(result.info).to.be.a.string;
        });

        it(`
            GIVEN a new activity status name
            WHEN this function is called with new data and id
            AND the database fails to find an activity status with this id
            THEN 0 affectedRows are returned in the result
        `, async() => {
            // arrange
            const existingId = existingActivityStatuses[0].activity_status_id;
            dbServiceStub.returns({ affectedRows: 0, changedRows: 0, info: "Rows failed to be updated" });
            
            // act
            const result = await ActivityStatusModel.update(newActivityStatus, existingId);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match.array)).to.be.true;
            expect(result.affectedRows).to.be.equal(0);
            expect(result.changedRows).to.be.equal(0);
            expect(result.info).to.be.a.string;
        });

        it(`
            GIVEN a new activity status name
            WHEN this function is called with new data and id
            AND the database finds the activity status but fails to update it
            THEN 0 changedRows are returned in the result
        `, async() => {
            // arrange
            const existingId = existingActivityStatuses[0].activity_status_id;
            dbServiceStub.returns({ affectedRows: 1, changedRows: 0, info: "Rows failed to be updated" });
            
            // act
            const result = await ActivityStatusModel.update(newActivityStatus, existingId);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match.array)).to.be.true;
            expect(result.affectedRows).to.be.equal(1);
            expect(result.changedRows).to.be.equal(0);
            expect(result.info).to.be.a.string;
        });

        it(`
            GIVEN a new activity status name
            WHEN this function is called with new data and id
            AND the database fails to update the activity status name
            THEN undefined is returned
        `, async() => {
            // arrange
            const existingId = existingActivityStatuses[0].activity_status_id;
            dbServiceStub.returns(undefined);
            
            // act
            const result = await ActivityStatusModel.update(newActivityStatus, existingId);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match.array)).to.be.true;
            expect(result).to.be.equal(undefined);
        });

        it(`
            GIVEN the database has some error
            WHEN this function is called
            THEN an exception is thrown
        `, async() => {
            // arrange
            const exception = new DatabaseException('some error');
            dbServiceStub.throws(exception);
            const existingId = existingActivityStatuses[0].activity_status_id;

            // act
            let error;
            try {
                await ActivityStatusModel.update(newActivityStatus, existingId);
                expect.fail('update should be rejected');
            } catch (err) {
                error = err;
            }
            
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match.array)).to.be.true;
            expect(dbServiceStub.threw(exception)).to.be.true;
            expect(error instanceof DatabaseException).to.be.true;
            expect(error.message).to.be.equal("some error");
        });
    });

    context("delete", () => {
        const activityStatusId = existingActivityStatuses[0].activity_status_id;

        it(`
            GIVEN the database has some activity statuses
            WHEN this function is called with an existing activity_status_id
            THEN that activity status is deleted
            AND number of affectedRows are returned
        `, async() => {
            // arrange
            dbServiceStub.returns({ affectedRows: 1, info: "Rows deleted successfully" });

            // act
            const result = await ActivityStatusModel.delete(activityStatusId);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match([activityStatusId]))).to.be.true;
            expect(result).to.be.equal(1);
        });

        it(`
            GIVEN the database has no activity statuses
            WHEN this function is called
            THEN 0 is returned
        `, async() => {
            // arrange
            dbServiceStub.returns(undefined);
            
            // act
            const result = await ActivityStatusModel.delete(activityStatusId);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match([activityStatusId]))).to.be.true;
            expect(result).to.be.equal(0);
        });

        it(`
            GIVEN the database has some error
            WHEN this function is called
            THEN an exception is thrown
        `, async() => {
            // arrange
            const exception = new DatabaseException('some error');
            dbServiceStub.throws(exception);

            // act
            let error;
            try {
                await ActivityStatusModel.delete(activityStatusId);
                expect.fail('delete should be rejected');
            } catch (err) {
                error = err;
            }
            
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match([activityStatusId]))).to.be.true;
            expect(dbServiceStub.threw(exception)).to.be.true;
            expect(error instanceof DatabaseException).to.be.true;
            expect(error.message).to.be.equal("some error");
        });
    });
});