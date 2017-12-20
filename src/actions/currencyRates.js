const https = require('https');

const Logger = require('../logger.js');
const log = new Logger(Logger.lookupName(__filename));
log.debugEnabled = false;

const currencyRates = (l10n, speech, receiver) => {
    const parameters = speech.parameters;

    const request = https.request(currency().options(), function (res) {

        res.setEncoding('utf8');
        let json = "";
        res.on('data', function (chunk) {
            json += chunk;
        });
        res.on('end', function (chunk) {
            log.debug('Response: ' + json);
            const data = JSON.parse(json);
            const promises = [];
            data.currencies.forEach(function (c) {
                if (!parameters.currency || parameters.currency.includes(c.code)) {

                    const promise = new Promise((resolve, reject) => {
                        const r = c.ratesByDate[0].currencyRates.filter((i) => i.code === "TCQ").pop();
                        if(!r) {
                            resolve(l10n.format("response.currency_rate_not_found"));
                            return;
                        }
                        l10n.incline(c.description, "Р", function (s) {
                            resolve(l10n.format("response.currency_rate", s.toLowerCase(), r.sellRate, r.buyRate));
                        });
                    });
                    promises.push(promise);
                }
            });
            Promise.all(promises).then(values => {
                if(!values.length) {
                    receiver(l10n.format("response.currency_not_found"));
                    return;
                }
                receiver(values.join(". "));
            });
        });
    });

    request.write(JSON.stringify({
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
};

module.exports = currencyRates;
