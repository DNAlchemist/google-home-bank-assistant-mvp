'use strict';
const Logger = require('../logger.js');
const InputDate = require('../InputDate.js');
const log = new Logger(Logger.lookupName(__filename));

const todo = require('../services/todoService.js');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const todoList = (app, l10n, speech, receiver) => {
    if (!app.getUser() || !app.getUser().accessToken) {
        app.askForSignIn();
        return;
    }

    const accessToken = app.getUser().accessToken;
    log.debug("That's ok, you are signed in, your access_token is " + app.getUser().accessToken);

    const inputDate = new InputDate(speech.parameters);

    todo(accessToken)
        .getAll()
        .then(result => receiver("Запланированные операции: " + getReadableNamesByDate(result, inputDate)))
};

function getReadableNamesByDate(result, inputDate) {
    return result.listData
        .filter(item => inputDate.isInterceptWith(new Date(item.predictedDate)))
        .map(item => `\n     - ${item.itemName}`)
}

module.exports = todoList;
