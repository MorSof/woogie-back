const request = require('supertest')
const adminModule = require('../../admin/admin-db/admin-db');
const usersRoute = require('../../routes/users')
const reactionRoute = require('../../routes/reactions')
const feedDB = require('../../db/feed_db');
const userService = require('../../services/user-service');
const feedService = require('../../services/feed-service');
const express = require("express"); // import express
const bodyParser = require('body-parser');
const testUtils = require('../tests-utils/tests-utils');
const constants = require('../../constants/feed-constants.json');
const app = express(); //an instance of an express app, a 'fake' express app

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use("/users", usersRoute); //routes
app.use("/reactions",reactionRoute);

const testSuiteUsers = () => describe('/users', () => {

    // Running the server before each test
    beforeEach(async () => {
        // server = require('../../bin/www');
        await adminModule.createAllTables();
    });
    // Closing the sever at the ned of each test
    afterEach(async () => {
        await adminModule.deleteAllTables();
    });

     describe('GET /', () => {

        it('should return 200 ok when user exists', async () => {

            await adminModule.createUsersMockup(1);

            const res = await request(app).get('/users/1');
            expect(res.status).toBe(200);
        });

        it('should return 200 ok when DB is empty', async () => {

            const res = await request(app).get('/users/1');
            expect(res.status).toBe(200);
        });

        it('should return 200 ok user is not exists', async () => {

            const res = await request(app).get('/users/100');
            expect(res.status).toBe(200);
        });

        it('should return a user with the same properties as the mockup user ', async () => {

            await adminModule.createUsersMockup(1);

            const res = await request(app).get('/users/1');

            expect(res.body).toHaveProperty('id',1);
            expect(res.body).toHaveProperty("full_name","first_name1 last_name1");
            expect(res.body).toHaveProperty("first_name","first_name1");
            expect(res.body).toHaveProperty("last_name","last_name1");
            expect(res.body).toHaveProperty("email","email1");
            expect(res.body).toHaveProperty("phone_number","phone_number1");
            expect(res.body).toHaveProperty("image","image1");

        });

        it('should return a user with the same full name as the mockup user', async () =>{

            await adminModule.createUsersMockup(1);
            const res = await request(app).get('/users/search/').query({ q: 'first_name1 last_name1' });
            expect(res.body[0]).toHaveProperty("full_name","first_name1 last_name1");

        });

        it('should return a user that his full name contains the string that was inserted to search ', async () =>{

            await adminModule.createUsersMockup(1);
            const res = await request(app).get('/users/search/').query({ q: 'first_name1 last_name1' });
            expect(res.body[0]).toHaveProperty("full_name","first_name1 last_name1");

        });

        it('should return all users that there full names contains the string that was inserted to search ', async () =>{

            await adminModule.createUsersMockup(10);
            const res = await request(app).get('/users/search/').query({ q: 'first_name' });
            expect(res.body).toHaveLength(10);

        });

        it('should return an empty array when there is no users with full name contains the string that was inserted to search ', async () =>{

            await adminModule.createUsersMockup(10);
            const res = await request(app).get('/users/search/').query({ q: 'Not exists string in db-tests' });
            expect(res.body).toHaveLength(0);

        });

        it('should return 5 users that there full names contains the string that was inserted to search ', async () =>{

            await adminModule.createUsersMockup(10);
            const res = await request(app).get('/users/search/').query({ q: 'first_name' ,limit: 5});
            expect(res.body).toHaveLength(5);
        });

        it('should return 4 users that there full names contains the string that was inserted to search ', async () =>{

            //Create 5 users in DB
            await adminModule.createUsersMockup(5);
            const res = await request(app).get('/users/search/').query({ q: 'first_name' ,limit: 5, offset : 1});
            expect(res.body).toHaveLength(4);
        });

        it('should return the 200 ok of an exists user', async () => {

            //Create 2 users in DB
            await  adminModule.createUsersMockup(2);
            //Create a connection between the 2 users.
            await adminModule.createConnectionsMockup(2);
            const res = await request(app).get('/users/2/stats/follow');
            expect(res.status).toBe(200);

        });

        it('should return the 200 ok of an exists user', async () => {

            //Create 2 users in DB
            await  adminModule.createUsersMockup(2);
            //Create a connection between the 2 users.
            await adminModule.createConnectionsMockup(2);
            const res = await request(app).get('/users/1/stats/follow');
            expect(res.status).toBe(200);

        });

        it('should return the 200 ok of an non exists user', async () => {

            //Create 2 users in DB
            await adminModule.createUsersMockup(2);
            //Create a connection between the 2 users.
            await adminModule.createConnectionsMockup(2);
            const res = await request(app).get('/users/100/stats/follow');
            expect(res.status).toBe(200);

        });
     });

     describe('FEED /',() => {

         it('should return feed of user 1 with an reaction action made by user 2', async () => {
             await adminModule.createUsersMockup(2);
             await adminModule.createConnectionsMockup(2);
             await adminModule.createReactionsMockup(2);
             const res = await request(app).get('/users/1/feed');
             expect(res.status).toBe(200);
             expect(res.body[0].users['2']).toBeDefined();
         });
         it('should increase the score of the action of user 2 in user 1 feed after user 1 navigate to user 2 page', async() => {
             await adminModule.createUsersMockup(2);
             await adminModule.createConnectionsMockup(2);
             await adminModule.createReactionsMockup(2);

             const feedBeforeScoreIncrease = await request(app).get('/users/1/feed');
             let scoreOfActionBeforeIncrease = feedBeforeScoreIncrease.body[0].score;

             await request(app).put('/users/1/feed/score').send({
                 follow_id: "2",
                 score: 5
             });

             let user = await feedDB.getUser('1');

             //User 1 get his feed
             const feedAfterScoreIncrease = await request(app).get('/users/1/feed');
             expect(feedAfterScoreIncrease.body[0].score).toEqual(scoreOfActionBeforeIncrease + 5);
         });
         it('should increase the score of the of user 2 in user 1 users scores', async() => {
             await adminModule.createUsersMockup(2);
             await adminModule.createConnectionsMockup(2);
             await adminModule.createReactionsMockup(2);

             let userBeforeUpdate = await feedDB.getUser('1');
             let oldScore = userBeforeUpdate.usersScore.get('2');

             await request(app).put('/users/1/feed/score').send({
                 follow_id: "2",
                 score: 5
             });

             //User 1 get his feed
             let userAfterUpdate = await feedDB.getUser('1');
             let newScore = userAfterUpdate.usersScore.get('2');
             expect(newScore).toEqual(oldScore + 5);
         });
         it('should decrease the score of the of user 2 in user 1 users scores', async() => {
             await adminModule.createUsersMockup(2);
             await adminModule.createConnectionsMockup(2);
             await adminModule.createReactionsMockup(2);

             let userBeforeUpdate = await feedDB.getUser('1');
             let oldScore = userBeforeUpdate.usersScore.get('2');

             await request(app).put('/users/1/feed/score').send({
                 follow_id: "2",
                 score: -2
             });

             //User 1 get his feed
             let userAfterUpdate = await feedDB.getUser('1');
             let newScore = userAfterUpdate.usersScore.get('2');
             expect(newScore).toEqual(oldScore - 2);
         });
         it('should decrease the score to 0 of user 2 in user 1 users scores when decrease score is larger than the score itself', async() => {
             await adminModule.createUsersMockup(2);
             await adminModule.createConnectionsMockup(2);
             await adminModule.createReactionsMockup(2);

             let userBeforeUpdate = await feedDB.getUser('1');
             let oldScore = userBeforeUpdate.usersScore.get('2');

             await request(app).put('/users/1/feed/score').send({
                 follow_id: "2",
                 score: -100
             });

             //User 1 get his feed
             let userAfterUpdate = await feedDB.getUser('1');
             let newScore = userAfterUpdate.usersScore.get('2');
             expect(newScore).toEqual(0);
         });
         it('should decrease the score of the action of user 2 in user 1 feed', async() => {
             await adminModule.createUsersMockup(2);
             await adminModule.createConnectionsMockup(2);
             await adminModule.createReactionsMockup(2);

             const feedBeforeScoreDecrease = await request(app).get('/users/1/feed');
             let scoreOfActionBeforeIncrease = feedBeforeScoreDecrease.body[0].score;
             //User 1 navigate to user 2 page, score will be increase in 5
             await request(app).put('/users/1/feed/score').send({
                 follow_id: "2",
                 score: -2
             });
             //User 1 get his feed
             const feedAfterScoreIncrease = await request(app).get('/users/1/feed');
             expect(feedAfterScoreIncrease.body[0].score).toEqual(scoreOfActionBeforeIncrease - 2);
         });
         it('should decrease the score to 0 of the action of user 2 in user 1 feed when decrease score is larger than the score itself', async() => {
             await adminModule.createUsersMockup(2);
             await adminModule.createConnectionsMockup(2);
             await adminModule.createReactionsMockup(2);

             await request(app).put('/users/1/feed/score').send({
                 follow_id: "2",
                 score: -100
             });

             //User 1 get his feed
             const feedAfterScoreIncrease = await request(app).get('/users/1/feed');
             expect(feedAfterScoreIncrease.body[0].score).toEqual(0);

         });
         it('should remove user 2 from user 1 action after user 1 unfollow user 2', async() => {
             await adminModule.createUsersMockup(3);
             await adminModule.createConnectionsMockup(2);
             //User 1 send a follow request to user 3
             await request(app).post('/users/1/connections/follow').send({
                 "follow_id": 3
             });
             //User 3 approve user 1
             await request(app).put('/users/3/connections/confirm-user').send({
                 "user_id": 1
             });
             //User 2 react on some product
             await testUtils.generateReactionOnSpecificProduct("1", "ebay", "2", "hated", "jeans",
                 "www.jeansImage.com", "www.jeansImage.com", 5, "USD",
                 5 , "USD");
             //User 3 react to the same product as user 2
             await testUtils.generateReactionOnSpecificProduct("1", "ebay", "3", "loved", "jeans",
                 "www.jeansImage.com", "www.jeansImage.com", 5, "USD",
                 5 , "USD");
             //User 1 unfollow user 2
             await request(app).put('/users/1/connections/unfollow').send({
                 user_id: "2"
             });
             //User 1 get his feed
             const res = await request(app).get('/users/1/feed');
             expect(res.body[0].users['2']).toBeUndefined();
         });
         it('should return feed on user 1 with a follow action made by user 2 on user 3',async () => {

             await adminModule.createUsersMockup(3);
             await adminModule.createConnectionsMockup(2);
             await adminModule.createReactionsMockup(2);
             //User 2 start follow user 3
             await request(app).post('/users/2/connections/follow').send({
                 follow_id: "3"
             });
             //User 3 approve user 2 follow request
             await request(app).put('/users/3/connections/confirm-user').send({
                 user_id: "2"
             });
            //User 1 get his feed
             const actions = await request(app).get('/users/1/feed');
             //Iterate throgh all user 1 action and look for follow_3 action
             actions.body.forEach((action) => {
                if(action.actionId === 'follow_3'){
                    expect(action.users['2']).toBeDefined();
                }
             });
         });
         it('should not delete all action if user 1 unfollow user 2 and user 2 was the only user in this action', async() => {
             await adminModule.createUsersMockup(2);
             await adminModule.createConnectionsMockup(2);
             await adminModule.createReactionsMockup(2);

             //User 1 unfollow user 2
             await request(app).put('/users/1/connections/unfollow').send({
                 user_id: "2"
             });
             //User 1 get his feed
             const res = await request(app).get('/users/1/feed');
             expect(res.body.length).toEqual(0);
         });
         it('should return the feed of user 1 when the score of the first action is higher than the second action', async() => {
             await adminModule.createUsersMockup(3);
             await adminModule.createConnectionsMockup(2);
             await adminModule.createReactionsMockup(2);

             //User 1 send follow request to user 3
             await request(app).post('/users/1/connections/follow').send({
                 follow_id: "3"
             });
             //User 3 approve user 3 follow request
             await request(app).put('/users/3/connections/confirm-user').send({
                 user_id: "1"
             });

             //User 3 make a reaction action on some product

             await testUtils.generateReactionOnSpecificProduct("1", "amazon", "3", "hated", "jeans",
                 "www.jeansImage.com", "www.jeansImage.com", 5, "USD",
                 5 , "USD");

             //User 1 navigate to user 3 page, therefore the score of user 3 in user 1 usersScore wil be increment
             //Therefore the score of the action of user 3 will be increment
             await request(app).put('/users/1/feed/score').send({
                 follow_id: "3",
                 score: 10
             });
             //User 1 get his feed
             const res = await request(app).get('/users/1/feed');
             expect(res.body[0].score).toBeGreaterThan(res.body[1].score);

         });
         it('should return the feed of user 1 when the date of the first action is newer than the second action', async() => {
             await adminModule.createUsersMockup(3);
             await adminModule.createConnectionsMockup(2);
             await adminModule.createReactionsMockup(2);

             //User 1 send follow request to user 3
             await request(app).post('/users/1/connections/follow').send({
                 follow_id: "3"
             });
             //User 3 approve user 3 follow request
             await request(app).put('/users/3/connections/confirm-user').send({
                 user_id: "1"
             });

             //User 3 make a reaction action on some product
             await testUtils.generateReactionOnSpecificProduct("1", "amazon", "3", "hated", "jeans",
                 "www.jeansImage.com", "www.jeansImage.com", 5, "USD",
                 5 , "USD");

             //User 1 get his feed
             const res = await request(app).get('/users/1/feed');
             let firstActionDate = new Date(res.body[0].updatedAt);
             let secondActionDate = new Date(res.body[1].updatedAt);
             expect(firstActionDate.getMilliseconds()).toBeGreaterThan(secondActionDate.getMilliseconds());
         });
         it('should return the feed of user 1 when the first action is not dirty and the second action is dirty', async() => {
             await adminModule.createUsersMockup(3);
             await adminModule.createConnectionsMockup(2);
             await adminModule.createReactionsMockup(2);

             //User 1 send follow request to user 3
             await request(app).post('/users/1/connections/follow').send({
                 follow_id: "3"
             });
             //User 3 approve user 3 follow request
             await request(app).put('/users/3/connections/confirm-user').send({
                 user_id: "1"
             });

             //User 3 make a reaction action on some product
             await testUtils.generateReactionOnSpecificProduct("1", "amazon", "3", "hated", "jeans",
                 "www.jeansImage.com", "www.jeansImage.com", 5, "USD",
                 5 , "USD");

             //action of user3 will get dirty
             await request(app).put('/users/1/feed/dirty').send({
                 action_id: 'reaction_amazon_1'
             });

             //User 1 get his feed
             const res = await request(app).get('/users/1/feed');

             expect(res.body[0].dirty).toEqual(false);
             expect(res.body[1].dirty).toEqual(true);
         });
         it('should return the feed of user 1 when both actions are dirty and first action have higher score than the second action', async() => {
             await adminModule.createUsersMockup(3);
             await adminModule.createConnectionsMockup(2);
             await adminModule.createReactionsMockup(2);

             //User 1 send follow request to user 3
             await request(app).post('/users/1/connections/follow').send({
                 follow_id: "3"
             });
             //User 3 approve user 3 follow request
             await request(app).put('/users/3/connections/confirm-user').send({
                 user_id: "1"
             });

             //User 3 make a reaction action on some product
             await testUtils.generateReactionOnSpecificProduct("1", "amazon", "3", "hated", "jeans",
                 "www.jeansImage.com", "www.jeansImage.com", 5, "USD",
                 5 , "USD");

             //action of user2 will get dirty
             await request(app).put('/users/1/feed/dirty').send({
                 action_id: 'reaction_ebay_2'
             });

             //action of user3 will get dirty
             await request(app).put('/users/1/feed/dirty').send({
                 action_id: 'reaction_amazon_1'
             });

             //User 3 score has been increment in user 1 feed
             await request(app).put('/users/1/feed/score').send({
                 follow_id: "3",
                 score: 100
             });

             //User 1 get his feed
             const res = await request(app).get('/users/1/feed');
             expect(res.body[0].score).toBeGreaterThan(res.body[1].score);
         });
         it('should update the action to a new action when MAX_UPDATED_AT_DAYS and the action is dirty', async() => {

             //Create user 1
             let oldUser1 = await request(app).post('/users').send({
                 first_name: "user1",
                 last_name: "user1",
                 email: "sarel1@gmail.com",
                 phone_number: "0500000",
                 image: "https://bla.bla.bla"
             });

             //Create user 2
             await request(app).post('/users').send({
                 first_name: "user2",
                 last_name: "user2",
                 email: "sarel2@gmail.com",
                 phone_number: "0500000",
                 image: "https://bla.bla.bla"
             });

             //Create user 3
             await request(app).post('/users').send({
                 first_name: "user3",
                 last_name: "user3",
                 email: "sarel3@gmail.com",
                 phone_number: "0500000",
                 image: "https://bla.bla.bla"
             });

             //User 1 send follow request to user 2
             await request(app).post('/users/1/connections/follow').send({
                 follow_id: "2"
             });
             //User 2 approve user 1 follow request
             await userService.confirmUser(1, 2);
             await feedService.confirmUser(1,2);

             //User 1 send follow request to user 3
             await request(app).post('/users/1/connections/follow').send({
                 follow_id: "3"
             });
             //User 3 approve user 1 follow request
             await userService.confirmUser(1, 3);
             await feedService.confirmUser(1,3);

             //User 2 make a reaction action on some product
             await testUtils.generateReactionOnSpecificProduct("1", "amazon", "2", "hated", "jeans",
                 "www.jeansImage.com", "www.jeansImage.com", 5, "USD",
                 5 , "USD");

             //user 1 saw user2 action so it gets dirty
             await request(app).put('/users/1/feed/dirty').send({
                 action_id: 'reaction_amazon_1'
             });

             let newUser1 = await feedDB.getUser(1);
             // X days has past so fast...

             const xDaysFromNow = new Date(newUser1.actions.get('reaction_amazon_1').updatedAt);
             xDaysFromNow.setDate(xDaysFromNow.getDate() + constants.MAX_UPDATED_AT_DAYS + 5);
             newUser1.actions.get('reaction_amazon_1').updatedAt = xDaysFromNow;
             await newUser1.save();

             //User 3 make a reaction action on the same product user 2 reacted 2 days ago
             await testUtils.generateReactionOnSpecificProduct("1", "amazon", "3", "hated", "jeans",
                 "www.jeansImage.com", "www.jeansImage.com", 5, "USD",
                 5 , "USD");

             //User 1 get his feed
             const res = await request(app).get('/users/1/feed');
             console.log(res);
             expect(res.body[0].users['2']).toBeUndefined();
             expect(res.body[0].users['3']).toBeDefined();
         });
     })
});

module.exports = testSuiteUsers;

