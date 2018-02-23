'use strict';
process.env.NODE_ENV = 'test';

const server = require('../app.js');
const assistant = require('./assistantTestKit.js');

assistant.use(server);

describe('currencyRates', () => {
    it('Fetch currency rates USD', (done) => {
        assistant.sendRequest('input.currency', ['ru'], {
            parameters: {
                date: "2017-12-20",
                currency: ["USD"]
            }
        }, (err, res) => {
            res.assertSpeech("ru", /Курс покупки 1 доллара: \d\d.\d рублей, курс продажи: \d\d.\d рублей/);
            done()
        });
    })
});