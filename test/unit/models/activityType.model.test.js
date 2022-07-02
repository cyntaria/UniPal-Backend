/* eslint-disable no-undef */
const expect = require('chai').expect;
const sinon = require('sinon');
const { DBService } = require("../../../src/db/db-service");
const { DatabaseException } = require('../../../src/utils/exceptions/database.exception');

describe("Activity Type Model", () => {
    const ActivityTypeModel = require('../../../src/models/activityType.model');
    const existingActivityTypes = [
        {
            activity_type_id: 1,
            activity_type: 'Sports'
        },
        {
            activity_type_id: 2,
            activity_type: 'Jamming'
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
            GIVEN the database has some activity types
            WHEN this function is called with empty filters
            THEN all activity types are returned
        `, async() => {
            // arrange
            dbServiceStub.returns(existingActivityTypes);

            // act
            const activityTypeList = await ActivityTypeModel.findAll({});
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string)).to.be.true;
            expect(activityTypeList).to.be.eql(existingActivityTypes);
        });

        it(`
            GIVEN the database has some activity types
            WHEN this function is called with filters specified
            THEN only matching activity types are returned
        `, async() => {
            // arrange
            const filters = {activity_type_id: 1};
            const filterCheck = (aType) => aType.activity_type_id === filters.activity_type_id;
            const filteredActivityTypes = existingActivityTypes.filter(filterCheck);
            dbServiceStub.returns(filteredActivityTypes);

            // act
            const activityTypeList = await ActivityTypeModel.findAll(filters);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match.array)).to.be.true;
            expect(activityTypeList).to.be.eql(filteredActivityTypes);
        });

        it(`
            GIVEN the database has no activity types
            WHEN this function is called
            THEN empty array is returned
        `, async() => {
            // arrange
            dbServiceStub.returns([]);

            // act
            const activityTypeList = await ActivityTypeModel.findAll({});
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string)).to.be.true;
            expect(activityTypeList).to.be.eql([]);
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
                await ActivityTypeModel.findAll({});
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
        const filters = {activity_type_id: 1};

        it(`
            GIVEN the database has some activity types
            WHEN this function is called with some filter
            THEN a single filtered activity type is returned
        `, async() => {
            // arrange
            const filterCheck = (aType) => aType.activity_type_id === filters.activity_type_id;
            const filteredActivityType = existingActivityTypes.find(filterCheck);
            dbServiceStub.returns([filteredActivityType]);

            // act
            const activityType = await ActivityTypeModel.findOne(filters);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match([filters.activity_type_id]))).to.be.true;
            expect(activityType).to.be.eql(filteredActivityType);
        });

        it(`
            GIVEN the database has no activity types
            WHEN this function is called
            THEN empty object is returned
        `, async() => {
            // arrange
            dbServiceStub.returns([]);
            
            // act
            const activityType = await ActivityTypeModel.findOne(filters);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match.array)).to.be.true;
            expect(activityType).to.be.undefined;
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
                await ActivityTypeModel.findOne(filters);
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
        const newActivityType = { activity_type: 'Lunch' };
        
        it(`
            GIVEN a new activity type
            WHEN this function is called with new data
            THEN a new activity type is created successfully
            AND it's id is returned
        `, async() => {
            // arrange
            const newId = existingActivityTypes.length + 1;
            dbServiceStub.returns({ insertId: newId, affectedRows: 1 });

            // act
            const result = await ActivityTypeModel.create(newActivityType);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match([newActivityType.activity_type]))).to.be.true;
            expect(result.activity_type_id).to.be.equal(newId);
            expect(result.affected_rows).to.be.equal(1);
        });

        it(`
            GIVEN a new activity type
            WHEN this function is called with new data
            AND the database fails to create a new activity type
            THEN 0 is returned
        `, async() => {
            // arrange
            dbServiceStub.returns(undefined);
            
            // act
            const activityType = await ActivityTypeModel.create(newActivityType);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match.array)).to.be.true;
            expect(activityType).to.be.equal(0);
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
                await ActivityTypeModel.create(newActivityType);
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
        const newActivityType = { activity_type: 'Postponed'};
        
        it(`
            GIVEN a new activity type name
            WHEN this function is called with new data and id
            THEN the specific activity type is updated successfully
            AND a result with update information is returned
        `, async() => {
            // arrange
            const existingId = existingActivityTypes[0].activity_type_id;
            dbServiceStub.returns({ affectedRows: 1, changedRows: 1, info: "Rows updated successfully" });

            // act
            const result = await ActivityTypeModel.update(newActivityType, existingId);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(
                sinon.match.string,
                sinon.match([newActivityType.activity_type, existingId])
            )).to.be.true;
            expect(result.affectedRows).to.be.equal(1);
            expect(result.changedRows).to.be.equal(1);
            expect(result.info).to.be.a.string;
        });

        it(`
            GIVEN a new activity type name
            WHEN this function is called with new data and id
            AND the database fails to find an activity type with this id
            THEN 0 affectedRows are returned in the result
        `, async() => {
            // arrange
            const existingId = existingActivityTypes[0].activity_type_id;
            dbServiceStub.returns({ affectedRows: 0, changedRows: 0, info: "Rows failed to be updated" });
            
            // act
            const result = await ActivityTypeModel.update(newActivityType, existingId);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match.array)).to.be.true;
            expect(result.affectedRows).to.be.equal(0);
            expect(result.changedRows).to.be.equal(0);
            expect(result.info).to.be.a.string;
        });

        it(`
            GIVEN a new activity type name
            WHEN this function is called with new data and id
            AND the database finds the activity type but fails to update it
            THEN 0 changedRows are returned in the result
        `, async() => {
            // arrange
            const existingId = existingActivityTypes[0].activity_type_id;
            dbServiceStub.returns({ affectedRows: 1, changedRows: 0, info: "Rows failed to be updated" });
            
            // act
            const result = await ActivityTypeModel.update(newActivityType, existingId);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match.array)).to.be.true;
            expect(result.affectedRows).to.be.equal(1);
            expect(result.changedRows).to.be.equal(0);
            expect(result.info).to.be.a.string;
        });

        it(`
            GIVEN a new activity type name
            WHEN this function is called with new data and id
            AND the database fails to update the activity type name
            THEN undefined is returned
        `, async() => {
            // arrange
            const existingId = existingActivityTypes[0].activity_type_id;
            dbServiceStub.returns(undefined);
            
            // act
            const result = await ActivityTypeModel.update(newActivityType, existingId);
    
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
            const existingId = existingActivityTypes[0].activity_type_id;

            // act
            let error;
            try {
                await ActivityTypeModel.update(newActivityType, existingId);
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
        const activityTypeId = existingActivityTypes[0].activity_type_id;

        it(`
            GIVEN the database has some activity types
            WHEN this function is called with an existing activity_type_id
            THEN that activity type is deleted
            AND number of affectedRows are returned
        `, async() => {
            // arrange
            dbServiceStub.returns({ affectedRows: 1, info: "Rows deleted successfully" });

            // act
            const result = await ActivityTypeModel.delete(activityTypeId);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match([activityTypeId]))).to.be.true;
            expect(result).to.be.equal(1);
        });

        it(`
            GIVEN the database has no activity types
            WHEN this function is called
            THEN 0 is returned
        `, async() => {
            // arrange
            dbServiceStub.returns(undefined);
            
            // act
            const result = await ActivityTypeModel.delete(activityTypeId);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match([activityTypeId]))).to.be.true;
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
                await ActivityTypeModel.delete(activityTypeId);
                expect.fail('delete should be rejected');
            } catch (err) {
                error = err;
            }
            
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match([activityTypeId]))).to.be.true;
            expect(dbServiceStub.threw(exception)).to.be.true;
            expect(error instanceof DatabaseException).to.be.true;
            expect(error.message).to.be.equal("some error");
        });
    });
});