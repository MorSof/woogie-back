const config = require('config');
const Pool = require("pg").Pool

const pool = new Pool({
    user: config.get('pg.user'),
    password: config.get('pg.password'),
    database: config.get('pg.dbName'),
    host: config.get('pg.host'),
    port: config.get('pg.port')
})

module.exports = pool;
