/* eslint-disable no-undef */
const expect = require('chai').expect;
const sinon = require('sinon');
const { DBService } = require("../../../src/db/db-service");
const { DatabaseException } = require('../../../src/utils/exceptions/database.exception');

describe("Hobby Model", () => {
    const HobbyModel = require('../../../src/models/hobby.model');
    const existingHobbies = [
        {
            hobby_id: 1,
            hobby: 'Cricket'
        },
        {
            hobby_id: 2,
            hobby: 'Reading'
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
            GIVEN the database has some hobbies
            WHEN this function is called with empty filters
            THEN all hobbies are returned
        `, async() => {
            // arrange
            dbServiceStub.returns(existingHobbies);

            // act
            const hobbyList = await HobbyModel.findAll({});
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string)).to.be.true;
            expect(hobbyList).to.be.eql(existingHobbies);
        });

        it(`
            GIVEN the database has some hobbies
            WHEN this function is called with filters specified
            THEN only matching hobbies are returned
        `, async() => {
            // arrange
            const filters = {hobby_id: 1};
            const filterCheck = (hobby) => hobby.hobby_id === filters.hobby_id;
            const filteredHobbies = existingHobbies.filter(filterCheck);
            dbServiceStub.returns(filteredHobbies);

            // act
            const hobbyList = await HobbyModel.findAll(filters);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match.array)).to.be.true;
            expect(hobbyList).to.be.eql(filteredHobbies);
        });

        it(`
            GIVEN the database has no hobbies
            WHEN this function is called
            THEN empty array is returned
        `, async() => {
            // arrange
            dbServiceStub.returns([]);

            // act
            const hobbyList = await HobbyModel.findAll({});
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string)).to.be.true;
            expect(hobbyList).to.be.eql([]);
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
                await HobbyModel.findAll({});
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
        const filters = {hobby_id: 1};

        it(`
            GIVEN the database has some hobbies
            WHEN this function is called with some filter
            THEN a single filtered hobby is returned
        `, async() => {
            // arrange
            const filterCheck = (hobby) => hobby.hobby_id === filters.hobby_id;
            const filteredHobby = existingHobbies.find(filterCheck);
            dbServiceStub.returns([filteredHobby]);

            // act
            const hobby = await HobbyModel.findOne(filters);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match([filters.hobby_id]))).to.be.true;
            expect(hobby).to.be.eql(filteredHobby);
        });

        it(`
            GIVEN the database has no hobbies
            WHEN this function is called
            THEN empty object is returned
        `, async() => {
            // arrange
            dbServiceStub.returns([]);
            
            // act
            const hobby = await HobbyModel.findOne(filters);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match.array)).to.be.true;
            expect(hobby).to.be.undefined;
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
                await HobbyModel.findOne(filters);
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
        const newHobby = { hobby: 'Exercise' };
        
        it(`
            GIVEN a new hobby
            WHEN this function is called with new data
            THEN a new hobby is created successfully
            AND it's id is returned
        `, async() => {
            // arrange
            const newId = existingHobbies.length + 1;
            dbServiceStub.returns({ insertId: newId, affectedRows: 1 });

            // act
            const result = await HobbyModel.create(newHobby);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match([newHobby.hobby]))).to.be.true;
            expect(result.hobby_id).to.be.equal(newId);
            expect(result.affected_rows).to.be.equal(1);
        });

        it(`
            GIVEN a new hobby
            WHEN this function is called with new data
            AND the database fails to create a new hobby
            THEN 0 is returned
        `, async() => {
            // arrange
            dbServiceStub.returns(undefined);
            
            // act
            const hobby = await HobbyModel.create(newHobby);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match.array)).to.be.true;
            expect(hobby).to.be.equal(0);
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
                await HobbyModel.create(newHobby);
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
        const newHobby = { hobby: 'Swimming'};
        
        it(`
            GIVEN a new hobby name
            WHEN this function is called with new data and id
            THEN the specific hobby is updated successfully
            AND a result with update information is returned
        `, async() => {
            // arrange
            const existingId = existingHobbies[0].hobby_id;
            dbServiceStub.returns({ affectedRows: 1, changedRows: 1, info: "Rows updated successfully" });

            // act
            const result = await HobbyModel.update(newHobby, existingId);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(
                sinon.match.string,
                sinon.match([newHobby.hobby, existingId])
            )).to.be.true;
            expect(result.affectedRows).to.be.equal(1);
            expect(result.changedRows).to.be.equal(1);
            expect(result.info).to.be.a.string;
        });

        it(`
            GIVEN a new hobby name
            WHEN this function is called with new data and id
            AND the database fails to find an hobby with this id
            THEN 0 affectedRows are returned in the result
        `, async() => {
            // arrange
            const existingId = existingHobbies[0].hobby_id;
            dbServiceStub.returns({ affectedRows: 0, changedRows: 0, info: "Rows failed to be updated" });
            
            // act
            const result = await HobbyModel.update(newHobby, existingId);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match.array)).to.be.true;
            expect(result.affectedRows).to.be.equal(0);
            expect(result.changedRows).to.be.equal(0);
            expect(result.info).to.be.a.string;
        });

        it(`
            GIVEN a new hobby name
            WHEN this function is called with new data and id
            AND the database finds the hobby but fails to update it
            THEN 0 changedRows are returned in the result
        `, async() => {
            // arrange
            const existingId = existingHobbies[0].hobby_id;
            dbServiceStub.returns({ affectedRows: 1, changedRows: 0, info: "Rows failed to be updated" });
            
            // act
            const result = await HobbyModel.update(newHobby, existingId);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match.array)).to.be.true;
            expect(result.affectedRows).to.be.equal(1);
            expect(result.changedRows).to.be.equal(0);
            expect(result.info).to.be.a.string;
        });

        it(`
            GIVEN a new hobby name
            WHEN this function is called with new data and id
            AND the database fails to update the hobby name
            THEN undefined is returned
        `, async() => {
            // arrange
            const existingId = existingHobbies[0].hobby_id;
            dbServiceStub.returns(undefined);
            
            // act
            const result = await HobbyModel.update(newHobby, existingId);
    
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
            const existingId = existingHobbies[0].hobby_id;

            // act
            let error;
            try {
                await HobbyModel.update(newHobby, existingId);
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
        const hobbyId = existingHobbies[0].hobby_id;

        it(`
            GIVEN the database has some hobbies
            WHEN this function is called with an existing hobby_id
            THEN that hobby is deleted
            AND number of affectedRows are returned
        `, async() => {
            // arrange
            dbServiceStub.returns({ affectedRows: 1, info: "Rows deleted successfully" });

            // act
            const result = await HobbyModel.delete(hobbyId);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match([hobbyId]))).to.be.true;
            expect(result).to.be.equal(1);
        });

        it(`
            GIVEN the database has no hobbies
            WHEN this function is called
            THEN 0 is returned
        `, async() => {
            // arrange
            dbServiceStub.returns(undefined);
            
            // act
            const result = await HobbyModel.delete(hobbyId);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match([hobbyId]))).to.be.true;
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
                await HobbyModel.delete(hobbyId);
                expect.fail('delete should be rejected');
            } catch (err) {
                error = err;
            }
            
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match([hobbyId]))).to.be.true;
            expect(dbServiceStub.threw(exception)).to.be.true;
            expect(error instanceof DatabaseException).to.be.true;
            expect(error.message).to.be.equal("some error");
        });
    });
});