const request = require('supertest')
const adminModule = require('../../admin/admin-db/admin-db');
const reactionsRoute = require('../../routes/reactions')
const express = require("express"); // import express
const app = express(); //an instance of an express app, a 'fake' express app

app.use("/reactions", reactionsRoute); //routes

const testSuiteReactions = () => describe('/reactions', () => {

    beforeEach(async () => {
        await adminModule.createAllTables();
        await adminModule.createUsersMockup(1);
    });
    afterEach(async () => {
        //await adminModule.deleteAllTables();
    });
    describe('POST /', () => {
        it('should return 200 ok when posting a reaction', async () => {

            const res = await request(app).post('/reactions').send({
                retail_id: "1234",
                retail_name: "ebay",
                user_id: "1",
                type: "loved",
                product_name: "jeans",
                product_image: "www.jeansImage.com",
                product_thumbnail_image: "www.jeansImage.com",
                product_price_value: '10',
                product_price_currency: 'USD',
                product_shipping_cost: '10',
                product_shipping_currency: 'USD'
            });
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('id',1);
            expect(res.body).toHaveProperty("retail_id","1234");
            expect(res.body).toHaveProperty("retail_name","ebay");
            expect(res.body).toHaveProperty("user_id",1);
            expect(res.body).toHaveProperty("type","loved");
            expect(res.body).toHaveProperty("product_name","jeans");
            expect(res.body).toHaveProperty("product_image","www.jeansImage.com");
            expect(res.body).toHaveProperty("product_price_value",10);
            expect(res.body).toHaveProperty("product_price_currency","USD");
            expect(res.body).toHaveProperty("product_shipping_cost",10);
            expect(res.body).toHaveProperty("product_price_currency","USD");
            expect(res.body).toHaveProperty("active",true);
        });
    });
    describe('PUT /', () => {
        it('should return 200 ok when inactive a reaction', async () => {

             //User unreact to specific product
            const res = await request(app).put('/reactions/inactive').send({
                retail_id: "1234",
                retail_name: "ebay",
                user_id: "1",
            });
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('id',1);
            expect(res.body).toHaveProperty("retail_id","1234");
            expect(res.body).toHaveProperty("retail_name","ebay");
            expect(res.body).toHaveProperty("user_id",1);
            expect(res.body).toHaveProperty("type","loved");
            expect(res.body).toHaveProperty("active",false);
        });
    });
});

module.exports = testSuiteReactions;
