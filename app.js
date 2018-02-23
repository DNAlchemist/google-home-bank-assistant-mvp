'use strict';

const Logger = require('./src/logger.js');
const L10N = require('./src/l10n.js');

const express = require('express');
const qs = require('querystring');
const server = express();
const log = new Logger(Logger.lookupName(__filename));

/////////////////////////////
////////// MODULES //////////
/////////////////////////////
const currencyRates = require('./src/actions/currencyRates.js');
const convertMoney = require('./src/actions/convertMoney.js');
const todoList = require('./src/actions/todoList.js');
const todoInitPayment = require('./src/actions/todoInitPayment.js');

const bodyParser = require('body-parser');
server.use(bodyParser.json({
    verify: function (req, res, buf, encoding) {
        // raw body for signature check
        req.rawBody = buf.toString();
    }
}));

const DialogflowApp = require('actions-on-google').DialogflowApp;
server.post('/webhook', (request, response) => {
    log.debug('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    log.debug('Dialogflow Request body: ' + JSON.stringify(request.body));
    if (request.body.result) {
        processV1Request(request, response);
    } else if (request.body.queryResult) {
        log.error('Invalid Request: V2 webhook requests is not supported');
        response.status(400).end('Invalid Webhook Request (v2 requests is not supported)');
    } else {
        log.error('Invalid Request');
        return response.status(400).end('Invalid Webhook Request (v1 webhook request)');
    }
});

function processV1Request(request, response) {
    let action = request.body.result.action;
    let requestSource = (request.body.originalRequest) ? request.body.originalRequest.source : undefined;
    const googleAssistantRequest = 'google';
    const app = new DialogflowApp({
        request: request,
        response: response
    });

    const l10n = new L10N(request.body.lang);

    ///////////////////////////////////////////
    ////////// ACTIONS (ENTRY POINT) //////////
    ///////////////////////////////////////////
    const actionHandlers = {

        'input.welcome': () => {
            responseWith({
                speech: l10n.format('response.default'),
                text: l10n.format('response.default') + ":)"
            });
        },

        'input.currency': () => {
            currencyRates(l10n, request.body.result, (str) => {
                responseWith(str);
            });
        },

        'input.convertMoney': () => {
            convertMoney(l10n, request.body.result, (str) => {
                responseWith(str);
            });
        },

        'input.todoList': () => {
            todoList(app, l10n, request.body.result, (str) => {
                app.setContext()
                responseWith(str);
            });
        },

        'input.todoInitPayment': () => {
            todoInitPayment(app, l10n, request.body.result, (str) => {
                app.setContext()
                responseWith(str);
            });
        },

        'input.unknown': () => {
            responseWith(l10n.format('response.unknown'));
        },

        'default': () => {
            responseWith({
                speech: l10n.format('response.default'),
                text: l10n.format('response.default') + ":)"
            });
        }
    };

    if (!actionHandlers[action]) {
        console.error(`Action with name ${action} is not found`);
        action = 'default';
    }

    try {
        actionHandlers[action]();
    } catch(e) {
        log.error(`Unhandled error. ${e}`);
        log.error(e.stack);
    }

    ///////////////////////////////////////
    ////////// RESPONSE CREATORS //////////
    ///////////////////////////////////////
    function sendGoogleResponse(responseToUser) {
        if (typeof responseToUser === 'string') {
            app.ask(responseToUser);
        } else {
            let googleResponse = app.buildRichResponse().addSimpleResponse({
                speech: responseToUser.speech || responseToUser.displayText,
                displayText: responseToUser.displayText || responseToUser.speech
            });
            log.debug('Response to Dialogflow (AoG): ' + JSON.stringify(googleResponse));
            app.ask(googleResponse);
        }
    }

    function sendResponse(responseToUser) {
        if (typeof responseToUser === 'string') {
            let responseJson = {};
            responseJson.speech = responseToUser;
            responseJson.displayText = responseToUser;
            response.json(responseJson);
        } else {
            let responseJson = {};
            responseJson.speech = responseToUser.speech || responseToUser.displayText;
            responseJson.displayText = responseToUser.displayText || responseToUser.speech;
            log.debug('Response to Dialogflow: ' + JSON.stringify(responseJson));
            response.json(responseJson);
        }
    }

    function responseWith(response) {
        if (requestSource === googleAssistantRequest) {
            sendGoogleResponse(response);
        } else {
            sendResponse(response);
        }
    }
}

module.exports = server;