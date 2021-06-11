const express = require('express');
const router = express.Router();
const notificationService = require('../services/notifications-service')
const bodyParser = require("body-parser");
const camelcaseMiddleware = require("../modules/camelcase-middleware");
const googleAuthMiddleware = require("../modules/google-auth-middleware");
const nullStringMiddleware = require("../modules/null-string-middleware");

router.use(camelcaseMiddleware);
router.use(googleAuthMiddleware);
router.use(nullStringMiddleware);
router.use(bodyParser.json());

/* DIRTY notification*/
router.put('/:id/dirty' ,async(req, res) => {
    try{
        const updatedNotification = await notificationService.dirtyNotification(req.params.id);
        res.json(updatedNotification);
    }catch(err){
        console.error(err);
        res.json(err);
    }
});

/* SEEN notification*/
router.put('/seen', async(req, res) => {
    try{
        const updatedNotifications = await notificationService.seenNotifications(req.body.ids);
        res.json(updatedNotifications);
    }catch(err){
        console.error(err);
        res.json(err);
    }
});

/* GET all notification */
router.get('/', async (req, res) => {
   try{

       const allNotifications = await notificationService.getAllNotifications(
           req.query.userId, req.query.offset, req.query.limit);
       res.json(allNotifications);
   }catch(err){
       console.error(err);
       res.json(err);
   }
});

module.exports = router;
