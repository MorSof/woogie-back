const Product = require("../../classes/product");
const reactionsService = require('../../services/reactions-service');
const productService = require('../../services/products-service');
const feedService = require('../../services/feed-service');


function generateProductsWithPriceOnly(priceValue, shippingCost){
    return new Product('v1|1234|1235', null, null, null, null, priceValue, "USD", null, shippingCost, 'USD',
        null, null, null, null, null, null, null, null, null, null);
}

function isProductsSortedAsc(products, compareValues){
    for (let i = 0; i < products.length - 1; i++) {
        if (products[i].compareByMulKeys(products[i+1], compareValues) > 0) {
            return false;
        }
    }
    return true;
}

function isProductsSortedDesc(products, compareValues){
    for (let i = 0; i < products.length - 1; i++) {
        if (products[i].compareByMulKeys(products[i+1], compareValues) < 0) {
            return false;
        }
    }
    return true;
}

async function generateReactionOnSpecificProduct(retail_id, retail_name, user_id, type, product_name, product_image,  product_thumbnail_image
, product_price_value, product_price_currency, product_shipping_cost, product_shipping_currency){

    await productService.createProduct(retail_id, retail_name, product_name, product_image, product_thumbnail_image, product_price_value,
       product_price_currency, product_shipping_cost, product_shipping_currency);

    await reactionsService.createReaction(retail_id, retail_name, user_id,
        type, product_name, product_image, product_thumbnail_image, product_price_value,
        product_price_currency, product_shipping_cost, product_shipping_currency);

    await feedService.addUserToReactionActions(user_id, `reaction_${retail_name}_${retail_id}`, "reaction", retail_id, retail_name)
}

module.exports = {generateProductsWithPriceOnly, isProductsSortedAsc, isProductsSortedDesc, generateReactionOnSpecificProduct};
