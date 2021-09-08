/* eslint-disable no-undef */
const request = require("supertest");
const expect = require('chai').expect;
const app = require('../../src/index'); // we are interested in health of our main express instance
const { Config } = require('../../src/configs/config');

describe("Healthcheck", () => {
    let originalDateNow;
    const now = Date.now();

    beforeEach(() => {
        originalDateNow = Date.now;
        Date.now = () => { return now; };
    });
  
    afterEach(() => {
        Date.now = originalDateNow;
    });

    it("returns OK, uptime and timestamp, if server is healthy", async() => {
        const res = await request(app).get(`/api/${Config.API_VERSION}/health`, null);

        // status check
        expect(res.status).to.be.equal(200);

        // error check
        expect(res.body.headers.error).to.be.equal(0);
        
        // params check
        const resBody = res.body.body;
        expect(resBody).to.include.keys("health", "uptime", "timestamp");

        // health check
        expect(resBody.health).to.be.equal('OK');

        // uptime check
        const uptime = Number.parseFloat(resBody.uptime);
        expect(uptime).to.be.gt(0);

        // timestamp check
        const timestamp = new Date(now).toJSON();
        expect(resBody.timestamp).to.be.equal(timestamp);
    });
});