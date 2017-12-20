const https = require('https');
const qs = require('querystring');

const Logger = require('./logger.js');
const log = new Logger(Logger.lookup(__filename));
log.debugEnabled = false;

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

function L10N(lang) {
    this.lang = lang;
}

L10N.prototype.format = function (str) {
    if (!l10n[str]) {
        log.error(`Localization key '${this.lang}' is not found`);
        return str;
    }
    if (!l10n[str][this.lang]) {
        log.error(`Locale ${this.lang} is not supported`);
        return str;
    }
    return l10n[str][this.lang];
};

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
