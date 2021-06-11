const config = require('config');
const redis = require("redis");

let redis_client;

if (config.get("env") === 'production') {
    redis_client = redis.createClient({
        port: config.get("redis.port"),
        host: config.get("redis.host"),
        password: config.get("redis.password")
    })
} else {
    redis_client = redis.createClient({
        port: config.get("redis.port"),
        host: config.get("redis.host"),
    })
}

module.exports = redis_client;
