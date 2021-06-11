const notificationsDB = require('../db/notifications_db');

async function dirtyNotification(notificationId){
    return await notificationsDB.dirtyNotification(notificationId);
}

async function seenNotifications(notificationIds){
    return await notificationsDB.seenNotifications(notificationIds);
}

async function addNotification(follow_id, user_id, type){
    return await notificationsDB.addNotification(follow_id, user_id, type);
}

async function getAllNotifications(userId, offset = 0, limit = 10){
    return await notificationsDB.getAllNotifications(userId, offset, limit);
}

async function dirtyAllByUserId(id, userId) {
    return await notificationsDB.dirtyAllByUserId(id, userId);
}

module.exports = {dirtyNotification, addNotification, getAllNotifications, dirtyAllByUserId, seenNotifications}
