const express = require('express');
const router = express.Router();
const adminModule = require('../admin/admin-db/admin-db')
const bodyParser = require("body-parser");
const camelcaseMiddleware = require("../modules/camelcase-middleware");
const googleAuthMiddleware = require("../modules/google-auth-middleware");
const nullStringMiddleware = require("../modules/null-string-middleware");

router.use(camelcaseMiddleware);
router.use(googleAuthMiddleware);
router.use(nullStringMiddleware);

router.use(bodyParser.json());

/* DELETE all tables*/
router.delete('/delete_tables', async(req, res) => {
    res.json(await adminModule.deleteAllTables());
});

/* CREATE all tables*/
router.post('/create_tables', async(req, res) => {
    res.json(await adminModule.createAllTables());
});

module.exports = router;
