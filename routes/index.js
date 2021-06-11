const express = require('express');
const router = express.Router();
const bodyParser = require("body-parser");
router.use(bodyParser.json());

/* GET home page. */
router.get('/', function(req, res, next) {
  res.status(200).send('Hello Woogie').end();
});

module.exports = router;
