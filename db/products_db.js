const pool = require('../clients/postgres');

// create/update a product
async function createProduct(retail_id, retail_name, product_name, image, thumbnail_image, price_value, price_currency, shipping_cost, shipping_currency, itemHref) {
    return await pool.query("INSERT INTO products (retail_id, retail_name, product_name, image, thumbnail_image, price_value, price_currency, shipping_cost, shipping_currency, item_href) " +
        "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) " +
        "ON CONFLICT (retail_id, retail_name) " +
        "DO UPDATE SET product_name = $3, image = $4, thumbnail_image = $5, price_value = $6, price_currency = $7, shipping_cost = $8, shipping_currency = $9, item_href = $10\n " +
        "RETURNING *;", [retail_id, retail_name, product_name, image, thumbnail_image, price_value, price_currency, shipping_cost, shipping_currency, itemHref]);
}

async function getProduct(retail_id, retail_name) {
    return (await pool.query("SELECT *\n" +
        "FROM products\n" +
        "WHERE retail_id = '$1' AND retail_name = '$2';", [retail_id, retail_name])).rows[0];
}

async function getProducts(retails_ids) {
    return (await pool.query("SELECT *\n" +
        "FROM products\n" +
        "WHERE CONCAT(retail_id, '_', retail_name) = ANY ($1)\n", [retails_ids])).rows
}


async function getProductUsersAndReactions(user_id, retail_id, retail_name, limit, offset) {
    return (await pool.query("\n" +
        "WITH product_reactions_users AS (\n" +
        "    SELECT user_id,\n" +
        "           full_name,\n" +
        "           users.image,\n" +
        "           r.type,\n" +
        "           CASE\n" +
        "               WHEN (r.product_name = p.product_name AND r.product_image = p.image AND\n" +
        "                     r.product_thumbnail_image = p.thumbnail_image AND r.product_price_value = p.price_value AND\n" +
        "                     r.product_price_currency = p.price_currency AND r.product_shipping_cost = p.shipping_cost AND\n" +
        "                     r.product_shipping_currency = p.shipping_currency)\n" +
        "                   THEN TRUE\n" +
        "               ELSE FALSE END AS updated_reaction\n" +
        "    FROM reactions r\n" +
        "             JOIN products p ON r.retail_id = p.retail_id AND r.retail_name = p.retail_name\n" +
        "             JOIN users ON users.id = r.user_id\n" +
        "    WHERE r.active = TRUE\n" +
        "      and p.retail_id = $2\n" +
        "      and p.retail_name = $3\n" +
        ")\n" +
        "SELECT product_reactions_users.user_id, full_name, image, type, updated_reaction, status\n" +
        "FROM product_reactions_users\n" +
        "LEFT JOIN connections on product_reactions_users.user_id = connections.follow_id AND connections.user_id = $1 AND (status = 'active' OR status = 'pending')\n" +
        "ORDER BY status\n" +
        "OFFSET $4\n" +
        "LIMIT $5", [user_id, retail_id, retail_name,offset, limit])).rows;
}

module.exports = {createProduct, getProduct, getProducts, getProductUsersAndReactions}
