const redis_client = require('../clients/redis')
const productsConstants = require('../constants/products-constants.json');

//Middleware Function to Check Cache
redisMiddleware = {
    checkProductSearch: (req, res, next) => {
        redis_client.get(req.query.q, (err, data) => {
            if (err) {
                console.log(err);
                res.status(500).send(err);
            }
            //if no match found
            if (data != null) {
                res.send(JSON.parse(data));
            } else {
                //proceed to next middleware function
                next();
            }
        });
    },
    checkAccessToken: (req, res, next) => {
        redis_client.get("ebay_access_token", (err, data) => {
            if (err) {
                console.log(err);
                res.status(500).send(err);
            }
            console.log(data)
            if (data != null) {
                req.app.set('ebay_access_token', data);
            }
            next();
        });
    }
}

function getValueByKey(key){
    return new Promise((resolve, reject) => {
        redis_client.get(key, (err, data) => {
            if (err) {
                console.log(err);
                reject(err);
            }
            console.log('fetched from redis');
            resolve(JSON.parse(data));
        });
    })
 }

 function setKeyValue(key, seconds, value){
     redis_client.setex(key, seconds, JSON.stringify(value));
 }

 function savePagesOnRedis(page, sortedProducts, q, filter, sort){
     for (let i = page; i < Math.ceil(sortedProducts.length / productsConstants.WOOGIE_OFFSET); i++) {
         let productsOffset = i === Math.ceil((sortedProducts.length / productsConstants.WOOGIE_OFFSET) - 1) ? (sortedProducts.length % productsConstants.WOOGIE_OFFSET) : productsConstants.WOOGIE_OFFSET;
         setKeyValue(q + filter + sort + i, 3600, sortedProducts.slice(i * productsConstants.WOOGIE_OFFSET, (i * productsConstants.WOOGIE_OFFSET) + productsOffset));
     }
 }

module.exports = {getValueByKey, setKeyValue, redisMiddleware, savePagesOnRedis};
