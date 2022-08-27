/* eslint-disable no-undef */
const expect = require('chai').expect;
const sinon = require('sinon');
const { DBService } = require("../../../src/db/db-service");
const { DatabaseException } = require('../../../src/utils/exceptions/database.exception');

describe("Campus Spot Model", () => {
    const CampusSpotModel = require('../../../src/models/campusSpot.model');
    const existingCampusSpots = [
        {
            campus_spot_id: 1,
            campus_spot: 'Round about',
            campus_id: 1
        },
        {
            campus_spot_id: 2,
            campus_spot: 'Tabba',
            campus_id: 2
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
            GIVEN the database has some campus spots
            WHEN this function is called with empty filters
            THEN all campus spots are returned
        `, async() => {
            // arrange
            dbServiceStub.returns(existingCampusSpots);

            // act
            const campusSpotList = await CampusSpotModel.findAll({});
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string)).to.be.true;
            expect(campusSpotList).to.be.eql(existingCampusSpots);
        });

        it(`
            GIVEN the database has some campus spots
            WHEN this function is called with campus_spot_id specified
            THEN only matching campus spots are returned
        `, async() => {
            // arrange
            const filters = {campus_spot_id: 1};
            const filterCheck = (cSpot) => cSpot.campus_spot_id === filters.campus_spot_id;
            const filteredCampusSpots = existingCampusSpots.filter(filterCheck);
            dbServiceStub.returns(filteredCampusSpots);

            // act
            const campusSpotList = await CampusSpotModel.findAll(filters);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match.array)).to.be.true;
            expect(campusSpotList).to.be.eql(filteredCampusSpots);
        });

        it(`
            GIVEN the database has some campus spots
            WHEN this function is called with campus_id specified
            THEN only matching campus spots are returned
        `, async() => {
            // arrange
            const filters = {campus_id: 1};
            const filterCheck = (cSpot) => cSpot.campus_id === filters.campus_id;
            const filteredCampusSpots = existingCampusSpots.filter(filterCheck);
            dbServiceStub.returns(filteredCampusSpots);

            // act
            const campusSpotList = await CampusSpotModel.findAll(filters);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match.array)).to.be.true;
            expect(campusSpotList).to.be.eql(filteredCampusSpots);
        });

        it(`
            GIVEN the database has no campus spots
            WHEN this function is called
            THEN empty array is returned
        `, async() => {
            // arrange
            dbServiceStub.returns([]);

            // act
            const campusSpotList = await CampusSpotModel.findAll({});
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string)).to.be.true;
            expect(campusSpotList).to.be.eql([]);
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
                await CampusSpotModel.findAll({});
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
        const filters = {campus_spot_id: 1};

        it(`
            GIVEN the database has some campus spots
            WHEN this function is called with some filter
            THEN a single filtered campus spot is returned
        `, async() => {
            // arrange
            const filterCheck = (cSpot) => cSpot.campus_spot_id === filters.campus_spot_id;
            const filteredCampusSpot = existingCampusSpots.find(filterCheck);
            dbServiceStub.returns([filteredCampusSpot]);

            // act
            const campusSpot = await CampusSpotModel.findOne(filters);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match([filters.campus_spot_id]))).to.be.true;
            expect(campusSpot).to.be.eql(filteredCampusSpot);
        });

        it(`
            GIVEN the database has no campus spots
            WHEN this function is called
            THEN empty object is returned
        `, async() => {
            // arrange
            dbServiceStub.returns([]);
            
            // act
            const campusSpot = await CampusSpotModel.findOne(filters);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match.array)).to.be.true;
            expect(campusSpot).to.be.undefined;
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
                await CampusSpotModel.findOne(filters);
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
        const newCampusSpot = { campus_spot: 'Adamjee', campus_id: 1 };
        
        it(`
            GIVEN a new campus spot
            WHEN this function is called with new data
            THEN a new campus spot is created successfully
            AND it's id is returned
        `, async() => {
            // arrange
            const newId = existingCampusSpots.length + 1;
            dbServiceStub.returns({ insertId: newId, affectedRows: 1 });

            // act
            const result = await CampusSpotModel.create(newCampusSpot);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(
                sinon.match.string,
                sinon.match([newCampusSpot.campus_spot, newCampusSpot.campus_id])
            )).to.be.true;
            expect(result.campus_spot_id).to.be.equal(newId);
            expect(result.affected_rows).to.be.equal(1);
        });

        it(`
            GIVEN a new campus spot
            WHEN this function is called with new data
            AND the database fails to create a new campus spot
            THEN 0 is returned
        `, async() => {
            // arrange
            dbServiceStub.returns(undefined);
            
            // act
            const campusSpot = await CampusSpotModel.create(newCampusSpot);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match.array)).to.be.true;
            expect(campusSpot).to.be.equal(0);
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
                await CampusSpotModel.create(newCampusSpot);
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
        const newCampusSpot = { campus_spot: 'Adamjee'};
        
        it(`
            GIVEN a new campus spot name
            WHEN this function is called with new data and id
            THEN the specific campus spot is updated successfully
            AND a result with update information is returned
        `, async() => {
            // arrange
            const existingId = existingCampusSpots[0].campus_spot_id;
            dbServiceStub.returns({ affectedRows: 1, changedRows: 1, info: "Rows updated successfully" });

            // act
            const result = await CampusSpotModel.update(newCampusSpot, existingId);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(
                sinon.match.string,
                sinon.match([newCampusSpot.campus_spot, existingId])
            )).to.be.true;
            expect(result.affectedRows).to.be.equal(1);
            expect(result.changedRows).to.be.equal(1);
            expect(result.info).to.be.a.string;
        });

        it(`
            GIVEN a new campus spot name
            WHEN this function is called with new data and id
            AND the database fails to find an campus spot with this id
            THEN 0 affectedRows are returned in the result
        `, async() => {
            // arrange
            const existingId = existingCampusSpots[0].campus_spot_id;
            dbServiceStub.returns({ affectedRows: 0, changedRows: 0, info: "Rows failed to be updated" });
            
            // act
            const result = await CampusSpotModel.update(newCampusSpot, existingId);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match.array)).to.be.true;
            expect(result.affectedRows).to.be.equal(0);
            expect(result.changedRows).to.be.equal(0);
            expect(result.info).to.be.a.string;
        });

        it(`
            GIVEN a new campus spot name
            WHEN this function is called with new data and id
            AND the database finds the campus spot but fails to update it
            THEN 0 changedRows are returned in the result
        `, async() => {
            // arrange
            const existingId = existingCampusSpots[0].campus_spot_id;
            dbServiceStub.returns({ affectedRows: 1, changedRows: 0, info: "Rows failed to be updated" });
            
            // act
            const result = await CampusSpotModel.update(newCampusSpot, existingId);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match.array)).to.be.true;
            expect(result.affectedRows).to.be.equal(1);
            expect(result.changedRows).to.be.equal(0);
            expect(result.info).to.be.a.string;
        });

        it(`
            GIVEN a new campus spot name
            WHEN this function is called with new data and id
            AND the database fails to update the campus spot name
            THEN undefined is returned
        `, async() => {
            // arrange
            const existingId = existingCampusSpots[0].campus_spot_id;
            dbServiceStub.returns(undefined);
            
            // act
            const result = await CampusSpotModel.update(newCampusSpot, existingId);
    
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
            const existingId = existingCampusSpots[0].campus_spot_id;

            // act
            let error;
            try {
                await CampusSpotModel.update(newCampusSpot, existingId);
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
        const campusSpotId = existingCampusSpots[0].campus_spot_id;

        it(`
            GIVEN the database has some campus spots
            WHEN this function is called with an existing campus_spot_id
            THEN that campus spot is deleted
            AND number of affectedRows are returned
        `, async() => {
            // arrange
            dbServiceStub.returns({ affectedRows: 1, info: "Rows deleted successfully" });

            // act
            const result = await CampusSpotModel.delete(campusSpotId);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match([campusSpotId]))).to.be.true;
            expect(result).to.be.equal(1);
        });

        it(`
            GIVEN the database has no campus spots
            WHEN this function is called
            THEN 0 is returned
        `, async() => {
            // arrange
            dbServiceStub.returns(undefined);
            
            // act
            const result = await CampusSpotModel.delete(campusSpotId);
    
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match([campusSpotId]))).to.be.true;
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
                await CampusSpotModel.delete(campusSpotId);
                expect.fail('delete should be rejected');
            } catch (err) {
                error = err;
            }
            
            // assert
            expect(dbServiceStub.calledOnce).to.be.true;
            expect(dbServiceStub.calledWithExactly(sinon.match.string, sinon.match([campusSpotId]))).to.be.true;
            expect(dbServiceStub.threw(exception)).to.be.true;
            expect(error instanceof DatabaseException).to.be.true;
            expect(error.message).to.be.equal("some error");
        });
    });
});