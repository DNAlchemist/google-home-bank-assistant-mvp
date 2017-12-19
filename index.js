'use strict';

const express = require('express');
const https = require('https');
const qs = require('querystring');

const server = express();

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
    console.log('Dialogflow Request headers: ' + json(request.headers));
    console.log('Dialogflow Request body: ' + json(request.body));
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

const l10n = {
    "response.unknown": {
        "en": "I'm having trouble, can you try that again?",
        "ru": "Я не могу разобрать, что вы сказали. Не могли ли вы повторить?"
    },
    "response.default": {
        "en": "Welcome! My name is Eva, I'm an alpha bank assistant. How can I help you?",
        "ru": "Добро пожаловать! Меня зовут Ева, я ассистент альфа-банка. Чем могу вам помочь?"
    }
};

function processV1Request(request, response) {
    let action = request.body.result.action;
    let requestSource = (request.body.originalRequest) ? request.body.originalRequest.source : undefined;
    const googleAssistantRequest = 'google';
    const app = new DialogflowApp({
        request: request,
        response: response
    });

    // Localization //
    const locale = request.body.lang;
    console.log("LANG = " + locale);
    const dict = (str) => {
        if (!l10n[str][locale]) {
            console.error(`Locale ${locale} is not supported`);
            return str;
        }
        return l10n[str][locale];
    };

    // Actions (entry point) //
    const actionHandlers = {

        'input.welcome': () => {
            responseWith({
                speech: dict('response.default'),
                text: dict('response.default') + ":)"
            });
        },

        'input.currency': () => {
            currencyRates(request.body.result, (str) => {
                responseWith(str);
            });
        },

        'input.unknown': () => {
            responseWith('response.unknown');
        },

        'default': () => {
            responseWith({
                speech: dict('response.default'),
                text: dict('response.default') + ":)"
            });
        }
    };

    if (!actionHandlers[action]) {
        action = 'default';
    }

    actionHandlers[action]();

    function sendGoogleResponse(responseToUser) {
        if (typeof responseToUser === 'string') {
            app.ask(responseToUser);
        } else {
            let googleResponse = app.buildRichResponse().addSimpleResponse({
                speech: responseToUser.speech || responseToUser.displayText,
                displayText: responseToUser.displayText || responseToUser.speech
            });
            console.log('Response to Dialogflow (AoG): ' + json(googleResponse));
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
            console.log('Response to Dialogflow: ' + json(responseJson));
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

/////////////////////////////
////////// MODULES //////////
/////////////////////////////
function currencyRates(speech, receiver) {
    const parameters = speech.parameters;

    const DEBUG = false;

    function debug(s) {
        if (DEBUG) {
            console.log(s);
        }
    }

    const request = https.request(currency().options(), function (res) {
        res.setEncoding('utf8');
        let json = "";
        res.on('data', function (chunk) {
            json += chunk;
        });
        res.on('end', function (chunk) {
            debug('Response: ' + json);
            const data = JSON.parse(json);
            const promises = [];
            data.currencies.forEach(function (c) {
                if (!parameters.currency || c.code === parameters.currency) {

                    const promise = new Promise((resolve, reject) => {
                        const r = fetch(c.ratesByDate[0].currencyRates, "code", "CBK");
                        incline(r.description, "Д", function (s) {
                            resolve(c.description + " - " + r.rate + " по " + s);
                        });
                    });
                    promises.push(promise);
                }
            });
            Promise.all(promises).then(values => {
                receiver(values.join(". "));
            });
        });
    });

    request.write(json({
        operationId: "Currency:GetCurrencyRates"
    }));
    request.end();

    function currency() {
        return {
            options: function () {
                return {
                    host: 'alfa-mobile.alfabank.ru',
                    port: 443,
                    path: '/ALFAJMB/gate',
                    method: 'POST',
                    headers: {
                        "jmb-protocol-version": "1.0",
                        "jmb-protocol-service": "Currency"
                    }
                }
            }
        }
    }
}


/////////////////////////////
///////// UTILITIES /////////
/////////////////////////////

/**
 * Convert javascript object to json
 */
function json(jsObject) {
    return JSON.stringify(jsObject)
}

/**
 * Extract the first element from the array, satisfying the condition
 * for example:
 * array = [ { a: 1, b: 2 }, {a: 3, b: 4, c: 5}
 * assert fetch(array, 'a', 1) == { a: 1, b: 2 }
 */
function fetch(array, field, value) {
    for (let i = 0; i < array.length; i++) {
        if (array[i][field] === value) {
            return array[i];
        }
    }
}

/**
 * Global debug function
 */
const DEBUG = false;

function debug(s) {
    if (DEBUG) {
        console.log(s);
    }
}

/////////////////////////////
///////// INCLINING /////////
/////////////////////////////
/**
 * Incline russian words
 * incline('Ассистент', 'Д', (str) => { assert str == 'Ассисенту' });
 */
function incline(w, c, callback) {
    const request = https.request(morpher().options(w), function (res) {
        res.setEncoding('utf8');
        let json = "";
        res.on('data', function (chunk) {
            json += chunk;
        });
        res.on('end', function (chunk) {
            debug('Response: ' + json);
            const data = JSON.parse(json);
            callback(data[c])
        });
    });
    request.end();
}

function morpher() {
    return {
        options: function (w) {
            return {
                host: 'ws3.morpher.ru',
                port: 443,
                path: '/russian/declension?' + qs.stringify({
                    s: w
                }),
                method: 'GET',
                headers: {
                    "Accept": "application/json"
                }
            }
        }
    }
}
