const config = require('config');
const redis = require("redis");

let redis_client;

if (process.env.NODE_ENV === 'production') {
    redis_client = redis.createClient({
        port: process.env.REDIS_PORT,
        host: process.env.REDIS_HOST,
        password: process.env.REDIS_PASSWORD
    })
} else {
    redis_client = redis.createClient({
        port: process.env.REDIS_PORT,
        host: process.env.REDIS_HOST,
    })
}

module.exports = redis_client;
