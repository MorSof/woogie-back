const {nullStringToUndefined} = require("../utils/object-manipulations");

function nullStringMiddleware(req, res, next) {
    req.query = nullStringToUndefined(req.query);
    next();
}

module.exports = nullStringMiddleware;
