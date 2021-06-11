const MinHeap = require('../utils/min-heap');
const MaxHeap = require('../utils/max-heap');
const {HeapNode} = require('../utils/heap');
const Product = require('../classes/product');
const retailFactory = require('../modules/retail-factory');
const config = require('config')
const reactionsDB = require('../db/reactions_db');
const productDB = require('../db/products_db');
const redisModule = require('../modules/redis-module');
const productsConstants = require('../constants/products-constants.json');

async function searchEngineLogic(q, filter, sort = 'price', userId, page = 0){
    const retails = [];
    // use factory to create ecommerce instances
    const cachedProducts = await redisModule.getValueByKey(q + filter + sort + page)

    if(cachedProducts == null || cachedProducts == 'null'){
        ["ebay", "ali_express", "amazon"].forEach((retailName) => {retails.push(retailFactory(retailName));});
        // active getProductByKeyWord in each instance
        let promises = [];
        retails.forEach(retail => {promises.push(retail.getProductsByKeyword(q, filter, sort, page));});
        let products = await Promise.all(promises);

        //get rid of empty arrays
        products = products.filter(productArr => productArr.length > 0)

        // sort the merge of all instance
        let sortedProducts = mergeKSortedArrays(products, products.length, ['totalPrice'], sort[0] == '-' ? true : false);

        redisModule.savePagesOnRedis(page, sortedProducts, q, filter, sort);

        const result = sortedProducts.slice(0, productsConstants.WOOGIE_OFFSET)

        // add reaction stats to each product
        await addProductsReactionsStats(result, userId);

        return result;
    }

    await addProductsReactionsStats(cachedProducts, userId);
    return cachedProducts;


}

async function addProductsReactionsStats(sortedProducts, userId){
    // fetch all ids from sorted products
    let retails_id = [];
    sortedProducts.forEach(product =>{
        retails_id.push(`${product.retailId}_${product.retailName}`);
    });
    let stats = await getProductsReactionsStats(retails_id, userId);

    if(stats == null || stats == [] || stats.length == 0){
        addEmptyReactionStatsToAllProducts(sortedProducts);
        return;
    }
    // There is at least one product with reaction
    sortedProducts.forEach(product => {
            stats.forEach(stat => {
                if (stat.retail_id == product.retailId) {
                    product.reactions = stat;
                }
            });
            if(product.reactions == null){
                product.reactions = emptyReactionStat;
            }
    });
}

function addEmptyReactionStatsToAllProducts(sortedProducts){
    sortedProducts.forEach(product => {
        product.reactions = emptyReactionStat;
    });
}

function mergeKSortedArrays(/*product[][]*/ arrays, /*int*/ k, compareValues, isDesc) {
    let nodeArr = [];
    let resultSize = 0;
    for(let i = 0; i < arrays.length; i++) {
        nodeArr[i] = new HeapNode(arrays[i][0], i, 1);
        resultSize += arrays[i].length;
    }

    // Create a heap with k heap nodes. Every heap node
    // has first element of an array
    let heap = isDesc ? new MaxHeap(nodeArr, k, compareValues) : new MinHeap(nodeArr, k, compareValues);

    let result = []; // To store output array

    // Now one by one get the minimum element from min
    // heap and replace it with next element of its array
    for(let i = 0; i < resultSize; i++) {
        // Get the minimum element and store it in result
        let root = heap.getRoot();
        result[i] = root.element;

        // Find the next element that will replace current
        // root of heap. The next element belongs to same
        // array as the current root.
        if(root.j < arrays[root.i].length)
            root.element = arrays[root.i][root.j++];

        // If root was the last element of its array
        else {
            let num = isDesc == false ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
            root.element = new Product('v1|1234|1235',null, null, null, null, num, "USD", null, num, 'USD',
                null, null, null, null, null, null, null, null, null, null);
        }
        // Replace root with next element of array
        heap.replace(root);
    }
    return result;
}

const emptyReactionStat = {
    loved: "0",
    hated: "0",
    interested: "0",
    bought: "0",
    active: false,
    type: null
}

async function createProduct(retail_id, retail_name, product_name, image, thumbnail_image, price_value, price_currency, shipping_cost, shipping_currency, itemHref){
    await productDB.createProduct(retail_id, retail_name, product_name, image, thumbnail_image, price_value, price_currency, shipping_cost, shipping_currency, itemHref)
}

async function getProductUsersAndReactions(userId, retailId, retailName, limit, offset){
    return await productDB.getProductUsersAndReactions(userId, retailId, retailName, limit, offset);
}

async function getProductsReactionsStats(retailIds, userId){
    return await reactionsDB.getProductsReactionsStats(retailIds, userId);
}


module.exports = {mergeKSortedArrays, searchEngineLogic, getProductUsersAndReactions, getProductsReactionsStats, createProduct};
