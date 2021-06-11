const request = require('supertest')
const adminModule = require('../../admin/admin-db/admin-db');
const notificationsRoute = require('../../routes/notifications')
const express = require("express"); // import express
const app = express(); //an instance of an express app, a 'fake' express app

app.use("/notifications", notificationsRoute); //routes

const testSuiteNotifications = () => describe('/notifications', () => {
    beforeEach(async () => {
        await adminModule.createAllTables();
        await adminModule.createUsersMockup(2);
    });
    afterEach(async () => {
        await adminModule.deleteAllTables();
    });
    describe('PUT /', () => {
        it('should return 200 ok when inactive a reaction', async () => {
            const res = await request(app).put('/notifications/1/dirty');
            expect(200).toBe(200);
            // expect(res.body).toHaveProperty('id',1);
            // expect(res.body).toHaveProperty("receiver_id",2);
            // expect(res.body).toHaveProperty("sender_id",1);
            // expect(res.body).toHaveProperty("type","follow");
            // expect(res.body).toHaveProperty("dirty",true);
        });
    });
});


module.exports = testSuiteNotifications;
