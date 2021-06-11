const reactionsDB = require('../db/reactions_db');

async function createReaction(retailId, retailName, userId, type, productName, productImage, productThumbnailImage, productPriceValue, productPriceCurrency, productShippingCost, productShippingCurrency, itemHref) {
    return await reactionsDB.createReaction(retailId, retailName, userId, type, productName, productImage, productThumbnailImage, productPriceValue, productPriceCurrency, productShippingCost, productShippingCurrency, itemHref);
}

async function inactiveReaction(retail_id, retail_name, user_id) {
    return await reactionsDB.inactiveReaction(retail_id, retail_name, user_id);
}

async function getAllReactionsByUserAndType(id, userId, reactionType, offset = 0, limit = 10) {
    let products =  await reactionsDB.getAllReactionsByUserAndType(id, userId, reactionType, offset, limit);
    let newProducts = [];
    products.forEach(product => {
        newProducts.push( {
            retailId: product.retail_id,
            retailName: product.retail_name,
            productName: product.product_name,
            image: product.product_image,
            thumbnailImage: product.product_thumbnail_image,
            priceValue: product.product_price_value,
            priceCurrency: product.product_price_currency,
            itemHref: product.item_href,
            shippingCost: product.product_shipping_cost,
            shippingCurrency: product.product_shipping_currency,
            totalPrice: product.product_price_value + product.product_shipping_cost,
            reactions: {
                loved: product.loved,
                hated: product.hated,
                interested: product.interested,
                bought: product.bought,
                retailId: product.retail_id,
                retailName: product.retail_name,
                active: product.active,
                type: product.type
            }
        })
    })
    return newProducts;
}

module.exports = {createReaction, inactiveReaction, getAllReactionsByUserAndType}
