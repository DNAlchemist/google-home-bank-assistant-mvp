'use strict';

const express = require('express');
const qs = require('querystring');
const server = express();

const L10N = require('./src/l10n.js');

/////////////////////////////
////////// MODULES //////////
/////////////////////////////
const currencyRates = require('./src/actions/currencyRates.js');
const convertMoney = require('./src/actions/convertMoney.js');
const todoList = require('./src/actions/todoList.js');

const bodyParser = require('body-parser');
server.use(bodyParser.json({
    verify: function (req, res, buf, encoding) {
        // raw body for signature check
        req.rawBody = buf.toString();
    }
}));

const REST_PORT = (process.env.PORT || 5000);

const DialogflowApp = require('actions-on-google').DialogflowApp;
server.post('/webhook', (request, response) => {
    console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
    if (request.body.result) {
        processV1Request(request, response);
    } else if (request.body.queryResult) {
        console.log('Invalid Request: V2 webhook requests is not supported');
        response.status(400).end('Invalid Webhook Request (v2 requests is not supported)');
    } else {
        console.log('Invalid Request');
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

    actionHandlers[action]();

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
            console.log('Response to Dialogflow (AoG): ' + JSON.stringify(googleResponse));
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
            console.log('Response to Dialogflow: ' + JSON.stringify(responseJson));
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

server.listen(REST_PORT, function () {
    console.log(`Service is ready on port ${REST_PORT}`);
});
