'use strict';
const moment = require('moment');
const Logger = require('../logger.js');
const L10N = require('../l10n.js');
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
        .then(async result => {
            const names = await Promise.all(getReadableNamesByDate(l10n, result, inputDate));
            app.ask(app
                .buildRichResponse()
                .addSimpleResponse(names.join(", "))
                .addBasicCard(app.buildBasicCard(names.map(it => "\n     - " + it).join())))
        })
};

function getReadableNamesByDate(l10n, result, inputDate) {
    return result.listData
        .filter(item => inputDate.isInterceptWith(new Date(item.predictedDate)))
        .map(async i => {
            const cost = i.amount.value + " " + await l10n.incline(l10n.format(i.amount.currency), "Р");
            return `${i.itemName} на ${moment(i.predictedDate).format("YYYY-MM-DD")} в размере ${cost}`
        })
}

module.exports = todoList;
