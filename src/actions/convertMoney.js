const https = require('https');

const Logger = require('../logger.js');
const plural = require('../CurrencyUtils.js');
const log = new Logger(Logger.lookupName(__filename));
log.debugEnabled = true;

const convertMoney = (l10n, speech, receiver) => {
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

            let sourceMoney = parameters.sourceMoney;
            let resultMoney = {};

            resultMoney.currency = parameters.resultCurrency;
            log.debug(`sourceMoney = ${JSON.stringify(sourceMoney)}`)
            log.debug(`resultMoney = ${JSON.stringify(resultMoney)}`)

            if (sourceMoney.currency === resultMoney.currency) {
                receiver(l10n.format("response.convert_money_the_same", sourceMoney.amount, plural(sourceMoney.currency, sourceMoney.amount, l10n.lang)))
            }


            let sourceMoneyObject = data.currencies.filter(function (cur) {
                return cur.code === sourceMoney.currency;
            });

            log.debug(`sourceMoneyObject = ${JSON.stringify(sourceMoneyObject[0])}`);

            let sellRateObject = sourceMoneyObject[0].ratesByDate[0].currencyRates.filter(function (cur) {
                return cur.code === "TCQ";
            });

            log.debug(`sellRateObject = ${JSON.stringify(sellRateObject)}`);

            let sellRate = sellRateObject[0].sellRate;

            log.debug(`sellRate = ${sellRate}`);

            if (resultMoney.currency !== "RUB") {
                let resultMoneyObject = data.currencies.filter(function (cur) {
                    return cur.code === resultMoney.currency;
                });
                let buyRate = resultMoneyObject[0].ratesByDate[0].currencyRates[0].buyRate;

                log.debug(`buyRate = ${buyRate}`);

                resultMoney.amount = (sourceMoney.amount * sellRate / buyRate * 100) / 100;
            } else {
                resultMoney.amount = Math.round(sourceMoney.amount * sellRate * 100) / 100;
            }

            log.debug(`resultMoney = ${JSON.stringify(resultMoney)}`);

            receiver(l10n.format("response.convert_money", resultMoney.amount, plural(resultMoney.currency, resultMoney.amount, l10n.lang)))
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

module.exports = convertMoney;
