const express = require('express');
const router = express.Router();
const productService = require('../services/products-service');
const bodyParser = require("body-parser");
const camelcaseMiddleware = require("../modules/camelcase-middleware");
const googleAuthMiddleware = require("../modules/google-auth-middleware");
const nullStringMiddleware = require("../modules/null-string-middleware");

router.use(camelcaseMiddleware);
router.use(googleAuthMiddleware);
router.use(nullStringMiddleware);
router.use(bodyParser.json());

/* SEARCH products by keyword*/
router.get('/search', async(req, res) => {
    try {
        const searchResult = await productService.searchEngineLogic(req.query.q, req.query.filter, req.query.sort, req.query.userId, req.query.page);
        res.json(searchResult);
    } catch (err) {
        console.error(err);
        res.json(err);
    }
});

router.get('/reactions', async (req, res) => {
    try {
        const productUsersAndReactions = await productService.getProductUsersAndReactions(req.query.userId, req.query.retailId, req.query.retailName, req.query.limit, req.query.offset);
        res.json(productUsersAndReactions);
    } catch (err) {
        console.error(err);
        res.json(err);
    }
});

module.exports = router;
