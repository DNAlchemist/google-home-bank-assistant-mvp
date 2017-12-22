const https = require('https');
const qs = require('querystring');
const util = require('util');

const Logger = require('./logger.js');
const log = new Logger(Logger.lookupName(__filename));
log.debugEnabled = false;

const l10n = {
    "response.unknown": {
        "en": "I'm having trouble, can you try that again?",
        "ru": "Я не могу разобрать, что вы сказали. Не могли ли вы повторить?"
    },
    "response.default": {
        "en": "Welcome! My name is Eva, I'm an alpha bank assistant. How can I help you?",
        "ru": "Добро пожаловать! Меня зовут Ева, я ассистент альфа-банка. Чем могу вам помочь?"
    },
    "response.currency_rate_not_found": {
        "en": "currency_rate_not_found",
        "ru": "currency_rate_not_found"
    },
    "response.currency_not_found": {
        "en": "currency_not_found",
        "ru": "currency_not_found"
    },
    "response.currency_rate": {
        "en": "The purchase rate of 1 %s is %s rubles, the sale rate is %s rubles.",
        "ru": "Курс покупки 1 %s: %s рублей, курс продажи: %s рублей"
    },
    "response.convert_money": {
        "en": "By the current rate you receive %s %s.",
        "ru": "По текущему курсу Вы получите %s %s."
    },
    "response.convert_money_the_same": {
        "en": "Yor receive the same value of the money %s %s",
        "ru": "Вы получете ту же самую суммку так как запрашиваемые валюты одинаковые, %s %s"
    },
    "response.convert_money_impossible": {
        "en": "Convert from %s %s to %s impossible, try another please",
        "ru": "Конвертация из %s %s в %s невозможна, попробуйте другие валюты"
    }
};

function L10N(lang) {
    this.lang = lang;
}

/**
 * Returns a formatted localized string using the specified template and arguments
 */
L10N.prototype.format = function (str) {
    if (!l10n[str]) {
        log.error(`Localization key '${this.lang}' is not found`);
        return str;
    }
    if (!l10n[str][this.lang]) {
        log.error(`Locale ${this.lang} is not supported`);
        return str;
    }
    const template = l10n[str][this.lang];
    return util.format.apply(undefined, buildArgumentList(template, arguments))
};

function buildArgumentList(template, arguments) {
    const argumentList = [template];
    for (let i = 1; i < arguments.length; i++) {
        argumentList.push(arguments[i]);
    }
    return argumentList;
}

/**
 * Incline russian words
 * incline('Ассистент', 'Д', (str) => { assert str == 'Ассисенту' });
 */
L10N.prototype.incline = function (w, c, callback) {
    if (this.lang !== 'ru') {
        callback(w);
        return;
    }
    const request = https.request(morpher().options(w), function (res) {
        res.setEncoding('utf8');
        let json = "";
        res.on('data', function (chunk) {
            json += chunk;
        });
        res.on('end', function (chunk) {
            log.debug('Response: ' + json);
            const data = JSON.parse(json);
            callback(data[c])
        });
    });
    request.end();
};

/**
 * Options for make REST request to morpher service
 */
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

module.exports = L10N;
