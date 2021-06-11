const pool = require('../clients/postgres');

async function addNotification(id, follow_id, type){
    pool.query("INSERT INTO notifications (sender_id, receiver_id, type)\n" +
        "VALUES ($1, $2, $3)\n" +
        "ON CONFLICT (sender_id, receiver_id, type)\n" +
        "DO UPDATE SET seen = false, dirty = false\n" +
        "RETURNING *;", [id, follow_id, type]);
}

async function dirtyNotification(notificationId){
    return (await pool.query("" +
        "UPDATE notifications SET dirty = true, seen = true\n" +
        "WHERE id = $1\n" +
        "RETURNING *;", [notificationId])).rows[0];
}

async function seenNotifications(notificationIds){
    return (await pool.query("" +
        "UPDATE notifications SET seen = true\n" +
        "WHERE id = ANY($1)\n" +
        "RETURNING *;", [notificationIds])).rows;
}

async function getAllNotifications(userId, offset, limit){
    return (await pool.query(
        "SELECT notifications.id, receiver_id, sender_id, full_name AS sender_fullname, image AS sender_image, type, dirty, seen,\n" +
        "       CASE WHEN type = 'follow_request' THEN MAX(c.status ORDER BY c.updated_at DESC ) ELSE null END AS connection_status\n" +
        "        FROM notifications\n" +
        "        LEFT JOIN users u on notifications.sender_id = u.id\n" +
        "        LEFT JOIN connections c on notifications.sender_id = c.user_id \n" +
        "           AND notifications.receiver_id = c.follow_id\n" +
        "           AND c.status != 'unfollow'\n" +
        "        WHERE receiver_id = $1\n" +
        "group by notifications.id, receiver_id, sender_id, full_name, image, type, dirty\n" +
        "ORDER BY notifications.updated_at DESC\n" +
        "OFFSET $2\n" +
        "LIMIT $3", [userId, offset, limit])).rows
}

async function dirtyAllByUserId(id, userId){
    return (await pool.query("UPDATE notifications SET dirty = true, seen = true\n" +
        "WHERE receiver_id = $1 AND sender_id = $2\n" +
        "RETURNING *;",[id, userId])).rows[0];
}

async function dirtyAllByUserIdAndType(id, userId, type){
    return (await pool.query("UPDATE notifications SET dirty = true, seen = true\n" +
        "WHERE receiver_id = $1 AND sender_id = $2 AND type = $3\n" +
        "RETURNING *;",[id, userId, type])).rows[0];
}

module.exports = {addNotification, dirtyNotification,getAllNotifications, dirtyAllByUserId, dirtyAllByUserIdAndType, seenNotifications}
