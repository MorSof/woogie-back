const pool = require('../clients/postgres');

async function createReaction(retail_id, retail_name, user_id, type, product_name, product_image, product_thumbnail_image, product_price_value, product_price_currency, product_shipping_cost, product_shipping_currency, itemHref) {
    return (await pool.query("INSERT INTO reactions (retail_id, retail_name, user_id, type, product_name, product_image, product_thumbnail_image, product_price_value,product_price_currency, product_shipping_cost, product_shipping_currency, item_href, active) " +
        "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) " +
        "ON CONFLICT (retail_id, retail_name, user_id) " +
        "DO UPDATE SET type = $4, product_name = $5, product_image = $6, product_thumbnail_image = $7, product_price_value = $8, product_price_currency = $9, product_shipping_cost = $10, product_shipping_currency = $11, item_href = $12, active = $13" +
        "RETURNING *;", [retail_id, retail_name, user_id, type, product_name, product_image, product_thumbnail_image, product_price_value, product_price_currency, product_shipping_cost, product_shipping_currency, itemHref, true])).rows[0];
}

async function inactiveReaction(retail_id, retail_name, user_id) {
    return (await pool.query("" +
        "UPDATE reactions SET active = false\n" +
        "WHERE retail_id = $1 AND retail_name = $2 AND user_id = $3\n" +
        "RETURNING *;", [retail_id, retail_name, user_id])).rows[0];
}

async function getProductsReactionsStats(retail_ids, user_id) {

    return (await pool.query("WITH reactions_user AS (\n" +
        "            SELECT active, type, retail_id\n" +
        "            FROM reactions\n" +
        "            WHERE user_id = $2 AND CONCAT(retail_id, '_', retail_name) = ANY ($1)\n" +
        "        ),\n" +
        "        reactions_stats AS (\n" +
        "            SELECT retail_id,\n" +
        "                   retail_name,\n" +
        "                   SUM(case when type = 'hated' then 1 else 0 end)      as hated,\n" +
        "                   SUM(case when type = 'loved' then 1 else 0 end)      as loved,\n" +
        "                   SUM(case when type = 'bought' then 1 else 0 end)     as bought,\n" +
        "                   SUM(case when type = 'interested' then 1 else 0 end) as interested\n" +
        "            FROM reactions r\n" +
        "            WHERE CONCAT(retail_id, '_', retail_name) = ANY ($1) AND active = true\n" +
        "            GROUP BY retail_id, retail_name\n" +
        "        )\n" +
        "        SELECT p.retail_id, p.retail_name, hated, loved, bought, interested, product_name, image, thumbnail_image, price_value, price_currency, shipping_cost, shipping_currency, item_href, created_at, updated_at, coalesce(active, false) AS active, reactions_user.type\n" +
        "        FROM reactions_stats\n" +
        "        LEFT JOIN reactions_user ON reactions_user.retail_id = reactions_stats.retail_id\n" +
        "        JOIN products p ON reactions_stats.retail_id = p.retail_id AND reactions_stats.retail_name = p.retail_name", [retail_ids, user_id])).rows;
}

async function getAllReactionsByUserAndType(id, userId, reactionType, offset, limit) {
    return (await pool.query("WITH user_reactions AS (\n" +
        "    SELECT  *\n" +
        "    FROM reactions\n" +
        "    WHERE user_id = $2 AND type = $3\n" +
        "), reactions_stats AS (\n" +
        "    SELECT user_reactions.retail_id,\n" +
        "           user_reactions.retail_name,\n" +
        "           user_reactions.product_shipping_currency,\n" +
        "           user_reactions.product_shipping_cost,\n" +
        "           user_reactions.product_price_currency,\n" +
        "           user_reactions.product_price_value,\n" +
        "           user_reactions.updated_at,\n" +
        "           user_reactions.created_at,\n" +
        "           user_reactions.product_thumbnail_image,\n" +
        "           user_reactions.product_image,\n" +
        "           user_reactions.product_name,\n" +
        "           user_reactions.item_href,\n" +
        "           COUNT(case when reactions.type = 'hated' then user_reactions.type end)      as hated,\n" +
        "           COUNT(case when reactions.type = 'loved' then user_reactions.type end)      as loved,\n" +
        "           COUNT(case when reactions.type = 'bought' then user_reactions.type end)     as bought,\n" +
        "           COUNT(case when reactions.type = 'interested' then user_reactions.type end) as interested\n" +
        "    FROM user_reactions\n" +
        "             JOIN reactions ON user_reactions.retail_id = reactions.retail_id\n" +
        "        AND user_reactions.retail_name = reactions.retail_name\n" +
        "    GROUP BY user_reactions.retail_id, user_reactions.retail_name,\n" +
        "             user_reactions.product_shipping_currency, user_reactions.product_shipping_cost,\n" +
        "             user_reactions.product_price_currency, user_reactions.product_price_value, user_reactions.updated_at,\n" +
        "             user_reactions.created_at, user_reactions.product_thumbnail_image,\n" +
        "             user_reactions.product_image, user_reactions.product_name, user_reactions.item_href\n" +
        ")\n" +
        "SELECT reactions_stats.retail_id, reactions_stats.retail_name,\n" +
        "             reactions_stats.product_shipping_currency, reactions_stats.product_shipping_cost,\n" +
        "             reactions_stats.product_price_currency, reactions_stats.product_price_value, reactions_stats.updated_at,\n" +
        "             reactions_stats.created_at, reactions_stats.product_thumbnail_image,\n" +
        "             reactions_stats.product_image, reactions_stats.product_name, reactions_stats.item_href, COALESCE(reactions.active, false) AS active , reactions.type,\n" +
        "       hated, loved, bought, interested\n" +
        "FROM reactions_stats\n" +
        "LEFT JOIN reactions ON reactions_stats.retail_id = reactions.retail_id\n" +
        "        AND reactions_stats.retail_name = reactions.retail_name\n" +
        "        AND reactions.user_id = $1\n" +
        "OFFSET $4\n" +
        "LIMIT $5", [id, userId, reactionType, offset, limit])).rows;
}


module.exports = {createReaction, inactiveReaction, getProductsReactionsStats, getAllReactionsByUserAndType}
