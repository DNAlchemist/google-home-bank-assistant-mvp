const Logger = require('../logger.js');
const log = new Logger(Logger.lookupName(__filename));

const todoList = (app, l10n, speech, receiver) => {
    if (app.getSignInStatus() !== app.SignInStatus.OK) {
        receiver('You need to sign-in before using the app.');
    } else {
        receiver("That's ok, you are signed in, your access_token is " + app.getUser().accessToken);
        let accessToken = app.getUser().accessToken;
    }
};

module.exports = todoList;
