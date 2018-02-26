'use strict';
const https = require('https');
const dateFormat = "YYYY-MM-DDTHH:mm:ss.SSSZZ";

function todo(accessToken) {
    return {
        create: (name, date, categoryId, reference, regularity) => {
            return new Promise((resolve, reject) => {
                const request = https.request({
                    host: 'testsense.alfabank.ru',
                    port: 443,
                    path: '/mobile/api/v2/todo',
                    method: 'POST',
                    headers: {
                        "Authorization": "Bearer " + accessToken,
                        "Content-Type": "application/json"
                    }
                }, (response) => {
                    if (response.statusCode === 200) {
                        resolve();
                    } else {
                        reject(new Error(`Invalid response status code ${response.statusCode}`));
                    }
                });
                request.on('error', (e) => reject(e));
                request.write(JSON.stringify({
                    "date": date.format(dateFormat),
                    "name": name,
                    "categoryId": categoryId,
                    "reference": reference,
                    "regularity": regularity
                }));
                request.end();
            });
        },
        getAll: () => {
            return new Promise((resolve, reject) => {
                const request = https.request({
                    host: 'testsense.alfabank.ru',
                    port: 443,
                    path: '/mobile/api/v2/todo',
                    method: 'GET',
                    headers: {
                        "Authorization": "Bearer " + accessToken
                    }
                }, (response) => {
                    if (response.statusCode !== 200) {
                        reject(new Error(`Invalid response status code ${response.statusCode}`));
                    }

                    let json = "";
                    response.on('data', (chunk) => json += chunk);
                    response.on('end', () => resolve(JSON.parse(json)));
                });
                request.on('error', (e) => reject(e));
                request.end();
            });
        },
        remove: (itemId) => {
            return new Promise((resolve, reject) => {
                const request = https.request({
                    host: 'testsense.alfabank.ru',
                    port: 443,
                    path: `/mobile/api/v2/todo/${itemId}`,
                    method: 'DELETE',
                    headers: {
                        "Authorization": "Bearer " + accessToken
                    }
                }, (response) => {
                    if (response.statusCode !== 200) {
                        reject(new Error(`Invalid response status code ${response.statusCode}`));
                    } else {
                        resolve();
                    }
                });
                request.on('error', (e) => reject(e));
                request.end();
            });
        }
    }
}

module.exports = todo;
