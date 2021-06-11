const {keysToCamel} = require("../utils/object-manipulations");

function camelcaseMiddleware(req, res, next) {
    let originalSend = res.send;
    res.send = function () {
        if (arguments[0] != null && !arguments[0].includes('<!DOCTYPE html>')) {
            arguments[0] = JSON.stringify(keysToCamel(JSON.parse(arguments[0])));
        }
            originalSend.apply(res, arguments);
    };
    next();

}

module.exports = camelcaseMiddleware;
