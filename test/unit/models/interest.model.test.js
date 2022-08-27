/* eslint-disable no-undef */
const expect = require('chai').expect;
const sinon = require('sinon');
const { DBService } = require("../../../src/db/db-service");
const { DatabaseException } = require('../../../src/utils/exceptions/database.exception');

describe("Interest Model", () => {
    const InterestModel = require('../../../src/models/interest.model');
    const existingInterests = [
        {
            interest_id: 1,
            interest: 'Movies'
        },
        {
            interest_id: 2,
            interest: 'Politics'
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
            GIVEN the database has some interests
            WHEN this function is called with empty filters
            THEN all interests are returned
        `, async() => {
            // arrange
            dbServiceStub.returns(existingInterests);

            // act
            const interestList = await InterestModel.findAll({});
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string)).to.be.true;
            expect(interestList).to.be.eql(existingInterests);
        });

        it(`
            GIVEN the database has some interests
            WHEN this function is called with filters specified
            THEN only matching interests are returned
        `, async() => {
            // arrange
            const filters = {interest_id: 1};
            const filterCheck = (interest) => interest.interest_id === filters.interest_id;
            const filteredInterests = existingInterests.filter(filterCheck);
            dbServiceStub.returns(filteredInterests);

            // act
            const interestList = await InterestModel.findAll(filters);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match.array)).to.be.true;
            expect(interestList).to.be.eql(filteredInterests);
        });

        it(`
            GIVEN the database has no interests
            WHEN this function is called
            THEN empty array is returned
        `, async() => {
            // arrange
            dbServiceStub.returns([]);

            // act
            const interestList = await InterestModel.findAll({});
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string)).to.be.true;
            expect(interestList).to.be.eql([]);
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
                await InterestModel.findAll({});
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
        const filters = {interest_id: 1};

        it(`
            GIVEN the database has some interests
            WHEN this function is called with some filter
            THEN a single filtered interest is returned
        `, async() => {
            // arrange
            const filterCheck = (interest) => interest.interest_id === filters.interest_id;
            const filteredInterest = existingInterests.find(filterCheck);
            dbServiceStub.returns([filteredInterest]);

            // act
            const interest = await InterestModel.findOne(filters);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match([filters.interest_id]))).to.be.true;
            expect(interest).to.be.eql(filteredInterest);
        });

        it(`
            GIVEN the database has no interests
            WHEN this function is called
            THEN empty object is returned
        `, async() => {
            // arrange
            dbServiceStub.returns([]);
            
            // act
            const interest = await InterestModel.findOne(filters);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match.array)).to.be.true;
            expect(interest).to.be.undefined;
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
                await InterestModel.findOne(filters);
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
        const newInterest = { interest: 'Music' };
        
        it(`
            GIVEN a new interest
            WHEN this function is called with new data
            THEN a new interest is created successfully
            AND it's id is returned
        `, async() => {
            // arrange
            const newId = existingInterests.length + 1;
            dbServiceStub.returns({ insertId: newId, affectedRows: 1 });

            // act
            const result = await InterestModel.create(newInterest);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match([newInterest.interest]))).to.be.true;
            expect(result.interest_id).to.be.equal(newId);
            expect(result.affected_rows).to.be.equal(1);
        });

        it(`
            GIVEN a new interest
            WHEN this function is called with new data
            AND the database fails to create a new interest
            THEN 0 is returned
        `, async() => {
            // arrange
            dbServiceStub.returns(undefined);
            
            // act
            const interest = await InterestModel.create(newInterest);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match.array)).to.be.true;
            expect(interest).to.be.equal(0);
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
                await InterestModel.create(newInterest);
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
        const newInterest = { interest: 'Music'};
        
        it(`
            GIVEN a new interest name
            WHEN this function is called with new data and id
            THEN the specific interest is updated successfully
            AND a result with update information is returned
        `, async() => {
            // arrange
            const existingId = existingInterests[0].interest_id;
            dbServiceStub.returns({ affectedRows: 1, changedRows: 1, info: "Rows updated successfully" });

            // act
            const result = await InterestModel.update(newInterest, existingId);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(
                sinon.match.string,
                sinon.match([newInterest.interest, existingId])
            )).to.be.true;
            expect(result.affectedRows).to.be.equal(1);
            expect(result.changedRows).to.be.equal(1);
            expect(result.info).to.be.a.string;
        });

        it(`
            GIVEN a new interest name
            WHEN this function is called with new data and id
            AND the database fails to find an interest with this id
            THEN 0 affectedRows are returned in the result
        `, async() => {
            // arrange
            const existingId = existingInterests[0].interest_id;
            dbServiceStub.returns({ affectedRows: 0, changedRows: 0, info: "Rows failed to be updated" });
            
            // act
            const result = await InterestModel.update(newInterest, existingId);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match.array)).to.be.true;
            expect(result.affectedRows).to.be.equal(0);
            expect(result.changedRows).to.be.equal(0);
            expect(result.info).to.be.a.string;
        });

        it(`
            GIVEN a new interest name
            WHEN this function is called with new data and id
            AND the database finds the interest but fails to update it
            THEN 0 changedRows are returned in the result
        `, async() => {
            // arrange
            const existingId = existingInterests[0].interest_id;
            dbServiceStub.returns({ affectedRows: 1, changedRows: 0, info: "Rows failed to be updated" });
            
            // act
            const result = await InterestModel.update(newInterest, existingId);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match.array)).to.be.true;
            expect(result.affectedRows).to.be.equal(1);
            expect(result.changedRows).to.be.equal(0);
            expect(result.info).to.be.a.string;
        });

        it(`
            GIVEN a new interest name
            WHEN this function is called with new data and id
            AND the database fails to update the interest name
            THEN undefined is returned
        `, async() => {
            // arrange
            const existingId = existingInterests[0].interest_id;
            dbServiceStub.returns(undefined);
            
            // act
            const result = await InterestModel.update(newInterest, existingId);
    
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
            const existingId = existingInterests[0].interest_id;

            // act
            let error;
            try {
                await InterestModel.update(newInterest, existingId);
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
        const interestId = existingInterests[0].interest_id;

        it(`
            GIVEN the database has some interests
            WHEN this function is called with an existing interest_id
            THEN that interest is deleted
            AND number of affectedRows are returned
        `, async() => {
            // arrange
            dbServiceStub.returns({ affectedRows: 1, info: "Rows deleted successfully" });

            // act
            const result = await InterestModel.delete(interestId);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match([interestId]))).to.be.true;
            expect(result).to.be.equal(1);
        });

        it(`
            GIVEN the database has no interests
            WHEN this function is called
            THEN 0 is returned
        `, async() => {
            // arrange
            dbServiceStub.returns(undefined);
            
            // act
            const result = await InterestModel.delete(interestId);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match([interestId]))).to.be.true;
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
                await InterestModel.delete(interestId);
                expect.fail('delete should be rejected');
            } catch (err) {
                error = err;
            }
            
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match([interestId]))).to.be.true;
            expect(dbServiceStub.threw(exception)).to.be.true;
            expect(error instanceof DatabaseException).to.be.true;
            expect(error.message).to.be.equal("some error");
        });
    });
});