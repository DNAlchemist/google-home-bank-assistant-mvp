const Logger = require('../logger.js');
const log = new Logger(Logger.lookupName(__filename));

const https = require('https');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const todoInitPayment = (app, l10n, speech, receiver) => {

    // 1. Find template itemId by template name
    // http://mvn/artifactory/snapshots/ru/alfabank/mobile/todo/reports/0.3.0-SNAPSHOT/reports-0.3.0-SNAPSHOT-docs.zip!/html/index.html
    // topic 11.4.1
    //
    // 2. Pay by the itemId
    //

    // if (!app.getUser().accessToken) {
        // receiver('You need to sign-in before using the app.');
        // return;
    // }

    let accessToken = "5857c68c-bcc1-370d-98bb-06170aeb8135"//app.getUser().accessToken;
    //log.info("That's ok, you are signed in, your access_token is " + app.getUser().accessToken);

    const request = https.request(todoApi().options({access_token: accessToken}), function (res) {

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
            // const data = JSON.parse(json);
            // const todos = [];
            // data.listData.filter((it) => {
            //     const date = new Date(it.predictedDate);
            //     const now = new Date(Date.now());
            //     console.log(`${date}, ${now.getMonth()}`);
            //     if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
            //         const promise = new Promise((resolve, reject) => {
            //             l10n.incline(l10n.format(it.amount.currency), "Р", function (s) {
            //                 resolve(`${it.itemName}: ${it.amount.value / it.amount.minorUnits} ${s}`);
            //             })
            //         });
            //         todos.push(promise);
            //     }
            // });
            // if (!todos.length) {
            //     receiver(l10n.format("response.todos_not_found"));
            //     return;
            // }
            // Promise.all(todos).then(values => {
            //     console.log(values);
            //     receiver("Запланированные на этот месяц операции: " + values.join(".\n"));
            // });
        });
    });
    // request.path = "/mobile/api/v2/todo/pay/itemId";
    // request.write(JSON.stringify({
        // operationId: "Authorization:Login"
    // }));
    request.end();
};


function todoApi() {
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

// function jmbApi() {
//     return {
//         options: function (data) {
//             return {
//                 host: 'testjmb.alfabank.ru',
//                 port: 443,
//                 path: '/FT7JMB3/gate',
//                 method: 'POST',
//                 headers: {
//                     "Authorization": "Bearer 5033747d-3693-35aa-860c-fefda2016a11"// + data.access_token
//                 }
//             }
//         }
//     }
// }

module.exports = todoInitPayment;
