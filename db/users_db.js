const pool = require('../clients/postgres');

async function searchUserByKeyword(keyword, userId, limit, offset) {

    return (await pool.query("\n" +
        "WITH searched_user AS (\n" +
        "    SELECT u.id,\n" +
        "           u.full_name,\n" +
        "           u.first_name,\n" +
        "           u.last_name,\n" +
        "           u.email,\n" +
        "           u.phone_number,\n" +
        "           u.image,\n" +
        "           u.created_at,\n" +
        "           u.updated_at,\n" +
        "           COALESCE(status, 'inactive') AS status\n" +
        "    FROM users u\n" +
        "    LEFT JOIN connections c on u.id = c.follow_id AND c.user_id = $1\n" +
        "    WHERE LOWER(full_name) LIKE LOWER($2)\n" +
        "),\n" +
        "following_user AS(\n" +
        "    SELECT c2.follow_id, following_users_details.full_name\n" +
        "    FROM users\n" +
        "    JOIN connections c2 ON users.id = c2.user_id\n" +
        "    JOIN users following_users_details ON c2.follow_id = following_users_details.id\n" +
        "    WHERE users.id = $1 AND c2.status = 'active'\n" +
        "),\n" +
        "following_searched_user AS(\n" +
        "    SELECT searched_user.id AS searched_user_id, c2.user_id searched_user_followers_id, c2.updated_at\n" +
        "    FROM searched_user\n" +
        "    JOIN connections c2 ON searched_user.id = c2.follow_id\n" +
        "    WHERE c2.status = 'active'\n" +
        "),\n" +
        "final_agg AS (\n" +
        "    SELECT searched_user_id,array_agg(fu.full_name ORDER BY updated_at DESC) AS mutual_following_users\n" +
        "    FROM following_searched_user\n" +
        "             JOIN following_user fu ON (fu.follow_id = following_searched_user.searched_user_followers_id)\n" +
        "    GROUP BY searched_user_id\n" +
        ")\n" +
        "SELECT id, full_name, image, status, mutual_following_users\n" +
        "FROM searched_user\n" +
        "LEFT JOIN final_agg ON searched_user.id = final_agg.searched_user_id\n" +
        "OFFSET $3\n" +
        "LIMIT  $4\n" +
        "\n", [userId, ('%' + keyword + '%').toLowerCase(), offset, limit])).rows;
}

async function getUserFollowers(followId, offset, limit) {
    return (await pool.query(
        "SELECT u.id, u.full_name, u.first_name, u.last_name, u.image, status " +
        "FROM connections " +
        "JOIN users u ON connections.user_id = u.id " +
        "WHERE follow_id = $1 AND status = 'active'" +
        "OFFSET $2 " +
        "LIMIT $3", [followId, offset, limit])).rows;
}

async function getAllUserFollowersIds(followId) {
    return (await pool.query(
        "SELECT ARRAY( SELECT u.id " +
        "FROM connections " +
        "JOIN users u ON connections.user_id = u.id " +
        "WHERE follow_id = $1 AND status = 'active')", [followId])).rows[0]['array'];
}

async function followUser(userId, followId) {
    // The connection is not exists in DB, Insert new connection to DB.
    return (await pool.query(
        "INSERT INTO connections (user_id, follow_id)\n" +
        "VALUES ($1, $2)\n" +
        "ON CONFLICT (user_id, follow_id)\n" +
        "DO UPDATE SET status='pending'\n" +
        "RETURNING *;\n", [userId, followId])).rows[0];
}

async function confirmUser(id, userId) {
    return (await pool.query(
        "UPDATE connections SET status = 'active'\n" +
        "WHERE user_id = $1 AND follow_id = $2\n" +
        "RETURNING user_id, follow_id, status;", [userId, id])).rows[0];
}


async function unfollowUser(userId, followId) {
    return (await pool.query(
        "UPDATE connections SET status = 'inactive'\n" +
        "WHERE user_id = $1 AND follow_id = $2" +
        "RETURNING user_id, follow_id, status;", [userId, followId])).rows[0];
}

async function getUserFollowing(userId, offset, limit) {
    return (await pool.query(
        "SELECT u.id, u.full_name, u.first_name, u.last_name, u.image, status " +
        "FROM connections " +
        "JOIN users u ON connections.follow_id = u.id " +
        "WHERE user_id = $1 AND status = 'active'" +
        "OFFSET $2 " +
        "LIMIT $3", [userId, offset, limit])).rows;
}

async function getUserFollowStat(userId) {
    return (await pool.query(
        "SELECT SUM(case when user_id = $1 then 1 else 0 end) AS num_of_following, SUM(case when follow_id = $1 then 1 else 0 end) AS num_of_followers\n" +
        "FROM connections\n" +
        "WHERE (user_id = $1 or follow_id = $1\n)" +
        "and status = 'active';", [userId])).rows[0];
}

async function getConnectionStatus(userId, followId) {
    return (await pool.query(
        "SELECT status\n" +
        "FROM connections\n" +
        "WHERE user_id = $1 AND follow_id = $2;", [userId, followId])).rows[0];
}

async function getAllFollowRequests(userId, offset, limit) {
    return (await pool.query(
        "SELECT u.id, u.full_name, u.first_name, u.last_name, u.image\n" +
        "FROM connections\n" +
        "JOIN users u ON connections.user_id = u.id\n" +
        "WHERE follow_id = $1 AND status = 'pending'\n" +
        "OFFSET $2\n" +
        "LIMIT $3\n", [userId, offset, limit])).rows;
}

async function getUserReactionsStat(userId) {
    return (await pool.query(
        "SELECT r.type,count(r.user_id)\n" +
        "FROM users\n" +
        "JOIN reactions r on users.id = r.user_id\n" +
        "WHERE user_id = $1 AND r.active = true\n" +
        "GROUP BY r.type", [userId])).rows;
}

async function getAllUsersImagesAndConnectionStatus(userId, usersIds) {
    return (await pool.query("SELECT users.id, image, COALESCE(c.status,'inactive') AS status\n" +
        "FROM users\n" +
        "LEFT JOIN connections c on users.id = c.follow_id AND c.user_id = $1\n" +
        "WHERE users.id = ANY($2)", [userId, usersIds])).rows;
}

async function getUserById(userId) {
    return (await pool.query("SELECT * FROM users WHERE id = $1", [userId])).rows[0];
}

async function getUserByEmail(userEmail) {
    return (await pool.query("SELECT * FROM users WHERE email = $1", [userEmail])).rows[0];
}

async function getUserWithFollowingDetails(id, userId) {
    return (await pool.query("" +
        "    WITH user_follow_stat AS (\n" +
        " SELECT $2::integer as user_id, SUM(case when user_id = $2 then 1 else 0 end) AS num_of_following, SUM(case when follow_id = $2 then 1 else 0 end) AS num_of_followers\n" +
        "    FROM connections c\n" +
        "    WHERE (user_id = $2 or follow_id = $2) and c.status = 'active'\n" +
        ")\n" +
        "SELECT u.id, u.full_name, u.first_name, u.last_name, u.image, u.email, u.phone_number, u.created_at, u.updated_at, coalesce(c.status, 'inactive') AS status, coalesce(num_of_following, 0) AS num_of_following, coalesce(num_of_followers, 0) AS num_of_followers\n" +
        "FROM users u\n" +
        "LEFT JOIN user_follow_stat ufs ON ufs.user_id = u.id\n" +
        "LEFT JOIN connections c on u.id = c.follow_id and c.user_id = $1 and c.follow_id = $2\n" +
        "WHERE u.id = $2", [id, userId])).rows[0];
}

async function getFollowingAndFollower(followingUserId, followerUserId) {
    return (await pool.query(
        "SELECT CASE WHEN id = $1 THEN 'following' ELSE 'follower' END AS user_type, * " +
        "FROM users " +
        "WHERE id = $1 or id = $2 ", [followingUserId, followerUserId])).rows;
}

async function createUser(full_name, first_name, last_name, email, phone_number, image) {
    return (await pool.query("INSERT INTO users (full_name, first_name, last_name, email, phone_number, image) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *", [full_name, first_name, last_name, email, phone_number, image])).rows[0];
}

module.exports = {
    searchUserByKeyword,
    getUserFollowers,
    followUser,
    confirmUser,
    unfollowUser,
    getUserFollowing,
    getUserFollowStat,
    getConnectionStatus,
    getAllFollowRequests,
    getUserReactionsStat,
    createUser,
    getUserByEmail,
    getUserById,
    getAllUserFollowersIds,
    getFollowingAndFollower,
    getAllUsersImagesAndConnectionStatus,
    getUserWithFollowingDetails,
}

