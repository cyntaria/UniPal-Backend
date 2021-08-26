/* eslint-disable no-undef */
const request = require("supertest");
const expect = require('chai').expect;
const app = require('../src/server');

describe("Healthcheck", () => {
    it("returns OK, uptime and timestamp, if server is healthy", async() => {
        const res = await request(app).get("/api/v1/health", null);

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
    });
});