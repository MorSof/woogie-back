const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID = '805895933099-kstnnjis8onuvi6l6onchstamrjuvv3n.apps.googleusercontent.com'
const client = new OAuth2Client(CLIENT_ID);

async function googleAuthMiddleware(req, res, next) {
    try {
        const ticket = await client.verifyIdToken({
            idToken: req.get('Authorization'),
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];
    } catch (err) {
        res.send(401)
    }
    next();
}


module.exports = googleAuthMiddleware;
