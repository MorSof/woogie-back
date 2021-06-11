const feed_db = require('../../../db/feed_db');
const {deleteDocuments} = require('../../../admin/admin-db/admin-db');

describe('mongo tests', () => {

    beforeEach(async () => {
        await deleteDocuments();
    });

    afterAll(async () => {
        await deleteDocuments();
    });

    describe('create', () => {
        it('create user', async () => {
            expect(await feed_db.createUser(12)).toBeDefined();
        });

        it('should create reaction action with the generic method of createAction', async () => {
            let user = await feed_db.createUser(12);
            await feed_db.setUserScore(user, 13, 5);
            const updatedUser = await feed_db.createAction(user._id,'reaction_ebay_v1|12345|12345','reaction',
                {retail_id: 'v1|12345|12345'}, 13,'Sarel Micha')
            expect(updatedUser).toBeDefined();
            expect(updatedUser.actions.get('reaction_ebay_v1|12345|12345').score).toEqual(5);
        });

        it('should create follow action with the generic method of createAction', async () => {
            jest.setTimeout(50000); //will throw error if test is taken more then 5 seconds
            let user = await feed_db.createUser(12);
            await feed_db.setUserScore(user, 13, 5);
            const updatedUser = await feed_db.createAction(12,'follow_14','follow',
                {
                    id: 14,
                    name: "Mor Soferian"
                }, 13,'Sarel Micha')
            expect(updatedUser).toBeDefined();
            expect(updatedUser.actions.get('follow_14').score).toEqual(5);
        });

        it('should throw an error when action type is not from the enum type', async () => {
            let user = await feed_db.createUser(12);
            await feed_db.setUserScore(user, 13, 5);
            await expect(feed_db.createAction(12,'reaction_ebay_v1|12345|12345','notEnumActionType',
                {retail_id: 'v1|12345|12345'}, 13,'Sarel Micha')).rejects.toThrow();
        });
    });

    describe('get', () => {

        it('get user', async () => {
            await feed_db.createUser(12);
            let user = await feed_db.getUser(12);
            expect(user).toBeDefined();
        });

        it('get all users', async () => {
            await feed_db.createUser(12);
            await feed_db.createUser(13);
            let users = await feed_db.getAllUsers();
            expect(users).toBeDefined();
        });
        
    });

    describe('update', () => {
        it('add follower score', async () => {
            let user = await feed_db.createUser(12);
            let updatedUser = await feed_db.setUserScore(user, 13, 5);
            expect(updatedUser.usersScore.get('13')).toEqual(5);
        });

        it('addUserToAction', async () => {
            let user = await feed_db.createUser(12);
            await feed_db.setUserScore(user, 13, 5);
            await feed_db.setUserScore(user, 14, 5);
            await feed_db.createAction(12,'reaction_ebay_v1|12345|12345','reaction',
                {retail_id: 'v1|12345|12345'}, 13,'Sarel Micha')
            const updatedUser = await feed_db.addUserToAction(12, 'reaction_ebay_v1|12345|12345', 14, 'Mor Soferian');
            expect(updatedUser).toBeDefined();
            expect(updatedUser.actions.get('reaction_ebay_v1|12345|12345').score).toEqual(10);
        });

        it('dirty an action', async () => {
            let oldUser1 = await feed_db.createUser(12);
            await feed_db.createAction(oldUser1._id,'reaction_ebay_v1|12345|12345','reaction',
                {retail_id: 'v1|12345|12345'}, 14,'Sarel Micha')
            let newUser1 = await feed_db.getUser(12);
            const updatedUser = await feed_db.dirtyAction(newUser1, 'reaction_ebay_v1|12345|12345');
            expect(updatedUser.actions.get('reaction_ebay_v1|12345|12345').dirty).toEqual(true);
        });

        it('should remove a specific user from action', async () => {
            await feed_db.createUser(12);
            await feed_db.createAction(12,'reaction_ebay_v1|12345|12345','reaction',
                {retail_id: 'v1|12345|12345'}, 14,'Sarel Micha');
            let user = await feed_db.createAction(12,'reaction_ebay_v1|12345|12345','reaction',
                {retail_id: 'v1|12345|12345'}, 15,'Sarel Micha')
            const updatedUser = await feed_db.removeUserFromAction(user,'reaction_ebay_v1|12345|12345',14);
            expect(updatedUser.actions.get('reaction_ebay_v1|12345|12345').users.get(14)).toBeUndefined();
        });

        it('should remove user from all actions with delete those actions', async () => {
            await feed_db.createUser(12);
            await feed_db.createAction(12,'reaction_ebay_v1|12345|12345','reaction',
                {retail_id: 'v1|12345|12345'}, 14,'Sarel Micha')
            await feed_db.createAction(12,'reaction_amazon_v1|12345|11111','reaction',
                {retail_id: 'v1|12345|11111'}, 14,'Sarel Micha')
            //User 12 is now unfollow user 14
            const updatedUser = await feed_db.removeUserFromAllActions(12,14);
            expect(updatedUser.actions.size).toEqual(0);
        });

        it('should remove user from all actions with delete only empty users actions', async () => {
            await feed_db.createUser(12);
            await feed_db.createAction(12,'reaction_ebay_v1|12345|12345','reaction',
                {retail_id: 'v1|12345|12345'}, 14,'Sarel Micha');
            await feed_db.createAction(12,'reaction_amazon_v1|12345|11111','reaction',
                {retail_id: 'v1|12345|11111'}, 14,'Sarel Micha');
            await feed_db.createAction(12,'reaction_amazon_v1|12345|11111','reaction',
                {retail_id: 'v1|12345|11111'}, 15,'Sarel Micha')
            //User 12 is now unfollow user 14
            const updatedUser = await feed_db.removeUserFromAllActions(12,14);
            expect(updatedUser.actions.size).toEqual(1);
        });


        it('should create for all followers an reaction action that made by user', async () => {
            await feed_db.createUser(12);
            await feed_db.createUser(13);
            await feed_db.createUser(14);
            //User 13 and User 14 started follow user 12

            //User 12 make a reaction on specific product
            let followers = await feed_db.getFollowers([13,14])
            await feed_db.addUserToFollowersActions(12,'Sarel Micha','reaction_ebay_v1|12345|12345','reaction',
               {retail_id: 'v1|12345|12345',},followers);

           let updatedUser1 = await feed_db.getUser(13);
            let updatedUser2 = await feed_db.getUser(14);
            expect(updatedUser1.actions.get('reaction_ebay_v1|12345|12345').users.get('12')).toBeDefined();
            expect(updatedUser2.actions.get('reaction_ebay_v1|12345|12345').users.get('12')).toBeDefined();

        });

        it('should create for all followers an follow action that made by user', async () => {
            await feed_db.createUser(12);
            await feed_db.createUser(13);
            await feed_db.createUser(14);
            //User 13 and User 14 started follow user 12

            //User 12 started follow user 18
            let followers = await feed_db.getFollowers([13,14])
            await feed_db.addUserToFollowersActions(12,'Sarel Micha','follow_18','follow',
                {
                    id: 18,
                    name:"Mosh Hashor"
                },followers);

            let updatedUser1 = await feed_db.getUser(13);
            let updatedUser2 = await feed_db.getUser(14);
            expect(updatedUser1.actions.get('follow_18').users.get('12')).toBeDefined();
            expect(updatedUser2.actions.get('follow_18').users.get('12')).toBeDefined();

        });

        it('should update for all followers an action that made by user', async () => {
            jest.setTimeout(50000); //will throw error if test is taken more then 5 seconds
            await feed_db.createUser(12);
            await feed_db.createUser(13);
            await feed_db.createUser(14);
            //User 13 and User 14 started follow user 12

            //User 14 started follow user 13

            //User 12 make a reaction on specific product - that will create an action on 13 and 14
            let followers1 = await feed_db.getFollowers([13,14])
            await feed_db.addUserToFollowersActions(12,'Sarel Micha','reaction_ebay_v1|12345|12345','reaction',
                {retail_id: 'v1|12345|12345',}, followers1);

            //That will update the action uses on 14
            //User 13 make a reaction to the same product user 12 reacted
            let followers2 = await feed_db.getFollowers([14])
            await feed_db.addUserToFollowersActions(13,'Mosh Ben Ari','reaction_ebay_v1|12345|12345','reaction',
                {retail_id: 'v1|12345|12345',}, followers2);

            let updatedUser = await feed_db.getUser(14);
            //Expect that for user 14 there will be 2 users in the specific action
            expect(updatedUser.actions.get('reaction_ebay_v1|12345|12345').users.size).toEqual(2);

        });

        it('should remove user from specific action from all followers', async () => {
            jest.setTimeout(50000); //will throw error if test is taken more then 5 seconds
            let user = await feed_db.createUser(12);
            await feed_db.createUser(13);
            await feed_db.createUser(14);
            //User 13 and User 14 started follow user 12

            await feed_db.setUserScore(user,13,5);


            //User 12 make a reaction on specific product
            let followers = await feed_db.getFollowers([13,14])
            await feed_db.addUserToFollowersActions(12,'Sarel Micha','reaction_ebay_v1|12345|12345','reaction',
                {retail_id: 'v1|12345|12345',},followers);

            //12 make unreaction to the same specific product
            await feed_db.removeUserFromFollowersActions(12,'reaction_ebay_v1|12345|12345',[13,14]);
            let updatedUser1 = await feed_db.getUser(13);
            let updatedUser2 = await feed_db.getUser(14);

            expect(updatedUser1.actions.get('reaction_ebay_v1|12345|12345')).toBeUndefined();
            expect(updatedUser2.actions.get('reaction_ebay_v1|12345|12345')).toBeUndefined();
        });
    });

    it('admin', async () => {
        jest.setTimeout(10000000); //will throw error if test is taken more then 5 seconds
        for (let i = 0 ; i < 20 ; i++) {
            let user = await feed_db.createUser(i);
            await feed_db.setUserScore(user, i+1, i+2);
            await feed_db.setUserScore(user, i+2, i+3);
            await feed_db.createAction(i,'reaction_ebay_v1|12345|12345'+i,'reaction',
                {retail_id: 'v1|12345|12345'+i}, i+1,'SarelMicha'+i);
            await feed_db.createAction(i,'follow_'+i,'follow', {id: i+1, name: "MorSoferian"+i}, i+1,'SarelMicha'+i);
            await feed_db.addUserToAction(i, 'reaction_ebay_v1|12345|12345'+i, i+2, 'MorSoferian'+i);
            await feed_db.addUserToAction(i, 'follow_'+i, i+2, 'MorSoferian'+i);
        }
        expect(true).toBeDefined();
    });

});
