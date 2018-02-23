const Logger = require('../logger.js');
const log = new Logger(Logger.lookupName(__filename));

const https = require('https');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const todoList = (app, l10n, speech, receiver) => {
    if (!app.getUser() || !app.getUser().accessToken) {
        receiver('You need to sign-in before using the app.');
        return;
    }

    let accessToken = app.getUser().accessToken;
    log.info("That's ok, you are signed in, your access_token is " + app.getUser().accessToken);

    const request = https.request(todo().options({access_token: accessToken}), function (res) {

        res.setEncoding('utf8');
        let json = "";

        res.on('error', function (e) {
            console.error('error');
            console.error(e);
        });
        res.on('data', function (chunk) {
            json += chunk;
        });
        res.on('end', function (chunk) {
            log.info('Response: ' + json);
            const data = JSON.parse(json);
            const todos = [];
            data.listData.filter((it) => {
                const date = new Date(it.predictedDate);
                const now = new Date(Date.now());
                console.log(`${date}, ${now.getMonth()}`);
                if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
                    const promise = new Promise((resolve, reject) => {
                        l10n.incline(l10n.format(it.amount.currency), "Р", function (s) {
                            resolve(`${it.itemName}: ${it.amount.value / it.amount.minorUnits} ${s}`);
                        })
                    });
                    todos.push(promise);
                }
            });
            if (!todos.length) {
                receiver(l10n.format("response.todos_not_found"));
                return;
            }
            Promise.all(todos).then(values => {
                console.log(values);
                receiver("Запланированные на этот месяц операции: " + values.join(".\n"));
            });
        });
        
        // const promises = [];
        // data.currencies.forEach(function (c) {
        //     if (!parameters.currency.length || parameters.currency.includes(c.code)) {
        //
        //         const promise = new Promise((resolve, reject) => {
        //             const r = c.ratesByDate[0].currencyRates.filter((i) => i.code === "TCQ").pop();
        //             if(!r) {
        //                 resolve(l10n.format("response.currency_rate_not_found"));
        //                 return;
        //             }
        //             l10n.incline(c.description, "Р", function (s) {
        //                 resolve(l10n.format("response.currency_rate", s.toLowerCase(), r.sellRate, r.buyRate));
        //             });
        //         });
        //         promises.push(promise);
        //     }
        // });
        // Promise.all(promises).then(values => {
        //     if(!values.length) {
        //         receiver(l10n.format("response.currency_not_found"));
        //         return;
        //     }
        //     receiver(values.join(". "));
        // });
        // });
    });

    request.end();
};


function todo() {
    return {
        options: function (data) {
            return {
                host: 'testsense.alfabank.ru',
                port: 443,
                path: '/mobile/api/v2/todo',
                method: 'GET',
                headers: {
                    "Authorization": "Bearer " + data.access_token
                }
            }
        }
    }
}

module.exports = todoList;
