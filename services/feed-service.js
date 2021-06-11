const feedDB = require('../db/feed_db');
const usersDB = require('../db/users_db');
const reactionDB = require('../db/reactions_db');

async function confirmUser(followingUserId, followerUserId){
    await addUserScore(followingUserId, followerUserId, 5);
    await addUserToFollowActions(followingUserId, followerUserId);
}

async function addUserToFollowerActions(followingUser, actionId, actionType, details){
    //Get all user's followers ids from postgres
    const followersIds = await usersDB.getAllUserFollowersIds(followingUser.id);
    //add the follow action to all user's followers
    const followers = await feedDB.getFollowers(followersIds);
    await feedDB.addUserToFollowersActions(followingUser.id, followingUser.full_name, actionId, actionType, details, followers);
}

async function addUserToFollowActions(followingUserId, followerUserId){
    //Get the user that created the follow request for getting his full name
    const users = await usersDB.getFollowingAndFollower(followingUserId, followerUserId);
    let followingUser, followerUser;
    if(users.length < 2){
        throw "feed service - followingUserId or followerUserId are not exists"
    }
    if(users[0].user_type == 'following'){
        followingUser = users[0];
        followerUser = users[1];
    } else {
        followingUser = users[1];
        followerUser = users[0];
    }
    await addUserToFollowerActions(followingUser, `follow_${followerUser.id}`, 'follow', {id: followerUser.id, full_name: followerUser.full_name});
}

async function addUserToReactionActions(user_id, actionId, actionType, retail_id, retail_name) {
    //Get the user that created the reaction for getting his full name
    const followingUser = await usersDB.getUserById(user_id);
    await addUserToFollowerActions(followingUser, actionId, actionType, {retail_id: retail_id, retail_name: retail_name});
}

async function createUser(id) {
    await feedDB.createUser(id);
}


async function removeUserFromActions(user_id, userToBeRemovedId) {

    //Remove the unfollowed user from all users actions
    await feedDB.removeUserFromAllActions(user_id, userToBeRemovedId);
    //Remove user follow action from all the user's followers
    await removeUserFromFollowersActions(user_id, `follow_${userToBeRemovedId}`);
}

async function removeUserFromFollowersActions(user_id,actionId) {

    //Get all user's followers ids from postgres
    const followersIds = await usersDB.getAllUserFollowersIds(user_id);
    //Remove the reaction action from all user's followers actions
    await feedDB.removeUserFromFollowersActions(user_id,actionId, followersIds);

}

async function addUserScore(userId, followId, score){
    let user = await feedDB.getUser(userId);
    let userScore = user.usersScore.get(followId.toString());
    let newScore = 0;
    if(userScore){ // if the user exists add to their current score
        let addedScore = score + userScore;
        if(addedScore > 0) newScore = addedScore;
        addActionScore(user, followId, score);
    }else { //if the user doesnt exists, create new score
        if(score >= 0 ) newScore = score;
    }
    await feedDB.setUserScore(user, followId, newScore);
}

function addActionScore(user, followId, score){
    user.actions.forEach((actionValue) => {
        if(actionValue.users.get(followId.toString())){
            if(score + actionValue.score > 0) actionValue.score += score
            else actionValue.score = 0;
        }
    })
}

async function dirtyAction(userId, actionId){
    let user = await feedDB.getUser(userId);
    await feedDB.dirtyAction(user,actionId);
}

async function getUserActions(user_id,page = 0,limit = 50){

    // Get all user actions in feed
    const actions =  await feedDB.getUserActions(user_id,page,limit);

    //
    actions.forEach((action, index) => {
        action.action[0].actionId = action._id
        actions[index] = action.action[0];
    })

    // Get all products retails ids and retails names and concat them
    const retails_ids = [];
    const users_ids = [];
    actions.forEach(action => {
       if(action.actionType == 'reaction'){
           retails_ids.push(`${action.details.retail_id}_${action.details.retail_name}`);
       } else if(action.actionType == 'follow'){
           users_ids.push(action.details.id);
       }
   });

    // Get all products from postgres products table according to retail id and retail name
    const productsStats = await reactionDB.getProductsReactionsStats(retails_ids, user_id);

    // Get all user's from postgres user's table according to user id
    const users = await usersDB.getAllUsersImagesAndConnectionStatus(user_id, users_ids);

    // inject each product and stat to each reaction action
    actions.forEach(action => {
            productsStats.forEach(product => {
                   if(product.retail_id == action.details.retail_id && product.retail_name == action.details.retail_name){
                       action.details.product_name = product.product_name;
                       action.details.image = product.image;
                       action.details.thumbnail_image = product.thumbnail_image;
                       action.details.price_value = product.price_value;
                       action.details.price_currency = product.price_currency;
                       action.details.shipping_cost = product.shipping_cost;
                       action.details.shipping_currency = product.shipping_currency;
                       action.details.totalPrice = product.price_value + product.shipping_cost;
                       action.details.itemHref = product.item_href;
                       action.details.reactions = {
                           hated:  product.hated,
                           loved: product.loved,
                           bought: product.bought,
                           interested: product.interested,
                           active : product.active,
                           type : product.type,
                       }
                   }
            });
            users.forEach(user => {
               if(user.id == action.details.id){
                   action.details.image = user.image;
                   action.details.status = user.status
               }
            });
    });
    return actions;
}

module.exports = {removeUserFromActions,removeUserFromFollowersActions, createUser, addUserToReactionActions, getUserActions, confirmUser,addUserScore, dirtyAction}
