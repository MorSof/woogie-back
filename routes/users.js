const express = require('express');
const router = express.Router();
const userService = require('../services/user-service');
const feedService = require('../services/feed-service');
const reactionService = require('../services/reactions-service');
const camelcaseMiddleware = require("../modules/camelcase-middleware");
const googleAuthMiddleware = require("../modules/google-auth-middleware");
const nullStringMiddleware = require("../modules/null-string-middleware");

router.use(camelcaseMiddleware);
router.use(googleAuthMiddleware);
router.use(nullStringMiddleware);

/* SEARCH users by keyword*/
router.get('/search', async (req, res) => {
    try {
        const users = await userService.searchUser(req.query.q, req.query.userId, req.query.limit, req.query.offset);
        res.json(users);
    } catch (err) {
        console.error(err);
        res.json(err);
    }
});

/* GET users followers*/
router.get('/:id/connections/followers', async (req, res) => {
    try {
        const followers = await userService.getUserFollowers(req.params.id, req.query.offset, req.query.limit)
        res.json(followers);
    } catch (err) {
        console.error(err);
        res.json(err);
    }
});

/* FOLLOW a user*/
router.post('/:id/connections/follow', async (req, res) => {
    try {
        const followStatus = await userService.followUser(req.params.id, req.body.followId);
        res.json(followStatus);
    } catch (err) {
        console.error(err);
        res.json(err);
    }
});

/* CONFIRM a user */
router.put('/:id/connections/confirm', async (req, res) => {
    try {
        const connection = await userService.confirmUser(req.params.id, req.body.userId);
        res.json(connection);
        await feedService.confirmUser(req.body.userId, req.params.id);
    } catch (err) {
        console.error(err);
        res.json(err);
    }
});

/* DECLINE a user */
router.put('/:id/connections/decline', async (req, res) => {
    try {
        const connection = await userService.unfollowUser(req.params.id, req.body.userId);
        res.json(connection);
    } catch (err) {
        console.error(err);
        res.json(err);
    }
});


/* UNFOLLOW a user */
router.put('/:id/connections/unfollow', async (req, res) => {
    try {
        const connection = await userService.unfollowUser(req.params.id, req.body.userId);
        await feedService.removeUserFromActions(req.params.id, req.body.userId);
        res.json(connection);
    } catch (err) {
        console.error(err);
        res.json(err);
    }
});

/* GET users following*/
router.get('/:id/connections/following', async (req, res) => {
    try {
        const following = await userService.getUserFollowing(req.params.id, req.query.offset, req.query.limit);
        res.json(following);
    } catch (err) {
        console.error(err);
        res.json(err);
    }
});

/* GET user follow stats*/
router.get('/:id/stats/follow', async (req, res) => {
    try {
        const stats = await userService.getUserFollowStat(req.params.id);
        res.json(stats);
    } catch (err) {
        console.error(err);
        res.json(err);
    }
});

/* GET connection status */
router.get('/:id/status', async (req, res) => {
    try {
        const status = await userService.getConnectionStatus(req.params.id, req.query.follow_id);
        res.json(status);
    } catch (err) {
        console.error(err);
        res.json(err);
    }
});

/* Get All Follow Requests */
router.get('/:id/connections/requests', async (req, res) => {
    try {
        const followRequests = await userService.getAllFollowRequests(req.params.id, req.query.offset, req.query.limit);
        res.json(followRequests);
    } catch (err) {
        console.error(err);
        res.json(err);
    }
});

/* Get user reactions statistics */
router.get('/:id/stats/reactions', async (req, res) => {
    try {
        const stats = await userService.getUserReactionsStat(req.params.id)
        res.json(stats);
    } catch (err) {
        console.error(err);
        res.json(err);
    }
});

/* GET a specific user*/
router.get('/:id', async (req, res) => {
    try {
        let user;
        req.query.id == null ?
            user = await userService.getUserById(req.params.id) :
            user = await userService.getUserWithFollowingDetails(req.query.id, req.params.id)
        res.json(user);
    } catch (err) {
        console.error(err);
        res.json(err);
    }
});

/* CREATE a user*/
router.post('/', async (req, res) => {
    try {
        const newUser = await userService.createUser(req.body.first_name, req.body.last_name, req.body.email, req.body.phone_number, req.body.image);
        await feedService.createUser(newUser.id);
        res.json(newUser);
    } catch (err) {
        console.error(err);
        res.json(err);
    }
});

router.post('/sign', async (req, res) => {

    try {
        let user = await userService.getUserByEmail(req.body.email);
        if (!user) {
            user = await userService.createUser(req.body.firstName, req.body.lastName, req.body.email, req.body.phoneNumber, req.body.image);
            await feedService.createUser(user.id);
        }
        res.json(user);

    } catch (err) {
        console.error(err);
        res.json(err);
    }
})


/* FEED*/
router.put('/:id/feed/score', async (req, res) => {
    try {
        await feedService.addUserScore(req.params.id, req.body.follow_id, req.body.score);
        res.json({status: 'success'});
    } catch (err) {
        console.error(err);
        res.json(err);
    }
});

router.get('/:id/feed', async (req, res) => {
    try {
        const actions = await feedService.getUserActions(req.params.id, req.query.page, req.query.limit);
        res.json(actions);
    } catch (err) {
        console.error(err);
        res.json(err);
    }
});

router.put('/:id/feed/dirty', async (req, res) => {
    try {
        await feedService.dirtyAction(req.params.id, req.body.action_id);
        res.json({status: 'success'});
    } catch (err) {
        console.error(err);
        res.json(err);
    }
});

module.exports = router;
