const usersDB = require('../db/users_db');
const notificationDB = require('../db/notifications_db');

async function searchUser(q, userId,  limit= 20, offset = 0){
    return await usersDB.searchUserByKeyword(q, userId, limit, offset);
}

async function getUserFollowers(id, offset = 0, limit = 50) {
    const followers = await usersDB.getUserFollowers(id, offset, limit);
     return {
        total: followers.length,
        limit: limit,
        offset: offset,
        users: followers
    };
}

async function followUser(id, follow_id){
    notificationDB.addNotification(id, follow_id, 'follow_request');    //Add notification to the user that has been follow
    return await usersDB.followUser(id, follow_id);
}

async function confirmUser(id, userId){
    notificationDB.addNotification(id, userId, 'confirmed');    //Add notification to the user that has been follow
    notificationDB.dirtyAllByUserIdAndType(userId, id, 'follow_request');
    return await usersDB.confirmUser(id, userId);
}

async function unfollowUser(id, userId){
    notificationDB.dirtyAllByUserId(id, userId);
    return await usersDB.unfollowUser(id, userId)
}

async function getUserFollowing(id, offset = 0, limit = 50){
    const following = await usersDB.getUserFollowing(id, offset, limit);
    return {
        'total': following.length,
        'limit': limit,
        'offset': offset,
        'users': following
    };
}

async function getUserFollowStat(id){
    const stats = await usersDB.getUserFollowStat(id);
    if(stats.num_of_following == null){
        stats.num_of_following = 0;
    }
    if(stats.num_of_followers == null){
        stats.num_of_followers = 0;
    }
    return stats
}

async function getConnectionStatus(id, follow_id){
    return await usersDB.getConnectionStatus(id ,follow_id);
}

async function getAllFollowRequests(id, offset = 0, limit = 10){
    const followRequests = await usersDB.getAllFollowRequests(id, offset, limit);
    return {
        'total': followRequests.length,
        'limit': limit,
        'offset': offset,
        'users': followRequests
    };
}

async function getUserReactionsStat(id){
    let json = {};
    const stats = await usersDB.getUserReactionsStat(id);
    stats.forEach((value)=> {
        json[value.type] = value.count;
    });
    return json;
}

async function getUserById(id){
    return await usersDB.getUserById(id);
}

async function getUserByEmail(email){
    return await usersDB.getUserByEmail(email);
}

async function getUserWithFollowingDetails(id, userId){
    return await usersDB.getUserWithFollowingDetails(id, userId);
}

async function createUser(first_name, last_name, email, phone_number, image){
    return await usersDB.createUser(`${first_name} ${last_name}`, first_name, last_name, email, phone_number, image);
}


module.exports = {searchUser, getUserFollowers, followUser, confirmUser, unfollowUser, getUserFollowing,
    getUserFollowStat, getConnectionStatus, getAllFollowRequests, getUserReactionsStat, getUserById, getUserByEmail, createUser,
    getUserWithFollowingDetails}
