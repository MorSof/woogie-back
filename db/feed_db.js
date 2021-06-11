const UserModel = require('../clients/mongo');
const feedConstants = require('../constants/feed-constants.json');
const getDaysDiff = require('../utils/dates');

async function createUser(userId){
    const user = new UserModel({
        _id: userId,
        usersScore: new Map,
        actions: new Map
    })
    return await user.save();
}

async function getUser(userId){
    return await UserModel.findById(userId);
}

async function getAllUsers(){
    return await UserModel.find()
}

// Create/Update follower score
async function setUserScore(user, followId, newScore){
    user.usersScore.set(followId.toString(), newScore);
    return await user.save();
}

/*Create a generic action (follow/reaction)*/
async function createAction(userId,key,actionType,details,actionUserId, actionUserName){

    let user = await getUser(userId);

    //Take score of the actionUserId to make it the score of the new action
    let actionUserScore = user.usersScore.get(actionUserId.toString());
    user.actions.set(key, {
        actionType: actionType,
        score: actionUserScore,
        details: details,
        users: new Map([[actionUserId.toString(), actionUserName]]),
        dirty: false,
        updatedAt: Date.now(),
        createdAt: Date.now()
    });
    if(user.totalNumOfActions > feedConstants.NUM_OF_MAXIMUM_ACTIONS) {
        return await deleteMostIrrelevantAction(user);
    }
    user.totalNumOfActions = user.actions.size;
    return await user.save();
}

async function addUserToAction(userId, actionId, actionUserId, actionUserName){
    let user = await getUser(userId);
    let actionUserScore = user.usersScore.get(actionUserId.toString());
    let action = user.actions.get(actionId);
    action.users.set(actionUserId.toString(), actionUserName);
    action.score += actionUserScore == undefined? 0 : actionUserScore;
    action.dirty = false;
    action.updatedAt = Date.now();
    return await user.save();
}

async function dirtyAction(user, actionId){
    let action = user.actions.get(actionId);
    action.dirty = true;
    action.updatedAt = Date.now();
    return await user.save();
}

async function getFollowers(followersIds){
    return await UserModel.find( { _id: { $in: followersIds} } );
}

async function addUserToFollowersActions(userId, userFullName, actionId, actionType, details, followers){
    for(let i = 0; i < followers.length; i++){
        await addOrCreateUserToAction(followers[i], actionId, actionType, details, userId, userFullName);
   }
}

async function removeUserFromFollowersActions(userId, actionId, followersIds){
    let followers =  await UserModel.find( { _id: { $in: followersIds} } )
    for(let i = 0; i < followers.length; i++){
        await removeUserFromAction(followers[i],actionId,userId)
    }
}

async function addOrCreateUserToAction(user,actionId,actionType,details,userToAddId, userToAddFullName){
    if(user.actions == null || user.actions.get(actionId) == null
        || (user.actions.get(actionId).dirty && getDaysDiff(user.actions.get(actionId).updatedAt, new Date()) > feedConstants.MAX_UPDATED_AT_DAYS)) {
        await createAction(user._id, actionId, actionType, details, userToAddId, userToAddFullName);
    }
    else {
        await addUserToAction(user._id, actionId, userToAddId, userToAddFullName);
    }
    return await user.save();
}

/*Remove user from one of my actions*/
async function removeUserFromAction(user,actionId,userToRemoveId){
    let action = user.actions.get(actionId);
    if(action == null){
        return;
    }
    action.users.delete(userToRemoveId.toString());
    if(action.users.size == 0){
        user.actions.delete(actionId.toString());
    }
    return await user.save();
}

/*When unfollow a user, remove that user from all my actions*/
async function removeUserFromAllActions(userId,userToRemoveId){
    let user = await getUser(userId);
    for(let actionId of user.actions.keys()){
        await removeUserFromAction(user,actionId,userToRemoveId);
    }
    return await user.save();
}

async function getUserActions(userId, skip, limit){
    let actionsObj =  await UserModel.aggregate([
        { $match: {_id: Number(userId)} },
        { $project: {actions: { $objectToArray: "$actions" }} },
        { $unwind: '$actions' },
        { $group: {_id: '$actions.k', action: {$push: '$actions.v'}} },
        { $sort: {'action.dirty': 1, 'action.score': -1, 'action.updatedAt': -1} },
        { $skip: Number(skip) },
        { $limit: Number(limit) }
    ]);
    return actionsObj;
}

async function deleteMostIrrelevantAction(user){
    let actionsObj =  await getUserActions(user._id, user.totalNumOfActions - 1, 1);
    user.actions.delete(actionsObj[0]._id);
    return await user.save();
}

module.exports = {createUser, getUser, getAllUsers, setUserScore, createAction, addUserToAction, dirtyAction,
    removeUserFromAction, removeUserFromAllActions, addOrCreateUserToAction, removeUserFromFollowersActions,
    addUserToFollowersActions, getUserActions, getFollowers}
