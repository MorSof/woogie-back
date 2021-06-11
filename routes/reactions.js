const express = require('express');
const router = express.Router();
const reactionsService = require('../services/reactions-service');
const feedService = require('../services/feed-service');
const productService = require('../services/products-service')
const bodyParser = require("body-parser");
const camelcaseMiddleware = require("../modules/camelcase-middleware");
const googleAuthMiddleware = require("../modules/google-auth-middleware");
const nullStringMiddleware = require("../modules/null-string-middleware");

router.use(camelcaseMiddleware);
router.use(googleAuthMiddleware);
router.use(nullStringMiddleware);
router.use(bodyParser.json());

/* CREATE a Reaction*/
router.post('/', async (req, res) => {
    try {
        await productService.createProduct(req.body.product.retailId, req.body.product.retailName, req.body.product.productName, req.body.product.image, req.body.product.thumbnailImage, req.body.product.priceValue,
            req.body.product.priceCurrency, req.body.product.shippingCost, req.body.product.shippingCurrency, req.body.product.itemHref);

        const newReaction = await reactionsService.createReaction(req.body.product.retailId, req.body.product.retailName, req.body.reaction.userId,
            req.body.reaction.type, req.body.product.productName, req.body.product.image, req.body.product.thumbnailImage, req.body.product.priceValue,
            req.body.product.priceCurrency, req.body.product.shippingCost, req.body.product.shippingCurrency, req.body.product.itemHref);

        res.json(newReaction);

        await feedService.addUserToReactionActions(req.body.reaction.userId, `reaction_${req.body.product.retailName}_${req.body.product.retailId}`, "reaction", req.body.product.retailId, req.body.product.retailName)
    } catch (err) {
        console.error(err);
        res.json(err);
    }
});

/* INACTIVE a Reaction*/
router.put('/inactive', async (req, res) => {
    try {
        const updatedReaction = await reactionsService.inactiveReaction(req.body.retailId, req.body.retailName, req.body.userId);
        res.json(updatedReaction);
        feedService.removeUserFromFollowersActions(req.body.userId, `reaction_${req.body.retailName}_${req.body.retailId}`);
    } catch (err) {
        console.error(err);
        res.json(err);
    }
});

/* GET all products of a user by reaction type*/
router.get('/type', async (req, res) => {
    try {
        const products = await reactionsService.getAllReactionsByUserAndType(req.query.id, req.query.userId, req.query.type, req.query.offset, req.query.limit);
        res.json(products);
    } catch (err) {
        console.error(err);
        res.json(err);
    }
})

module.exports = router;
