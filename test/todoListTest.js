'use strict';
process.env.NODE_ENV = 'test';

const server = require('../app.js');
const assistant = require('./assistantTestKit.js');
const https = require('https');
const moment = require('moment');
require('moment-timezone');

const chai = require('chai');
const uiid = require('uuid/v4');

const todo = require('../src/services/todoService.js');

chai.should();
assistant.use(server);

const accessToken = 'c367a24e-80c8-41c6-8b55-e95c2eb4b9a5';
const dateFormat = "YYYY-MM-DDTHH:mm:ss.SSSZZ";

describe('todoList', () => {

    const afterHalfWeek = moment().tz('Europe/Moscow')
        .add(3, 'day')
        .startOf('day').add(15, 'hour');

    const afterWeek = moment().tz('Europe/Moscow')
        .add(7, 'day')
        .startOf('day').add(12, 'hour');

    const afterTwoWeeks = moment().tz('Europe/Moscow')
        .add(14, 'day')
        .startOf('day').add(12, 'hours');

    beforeEach(done => {
        todo(accessToken)
                  .getAll()
                  .then(result => Promise.all(result.listData.map((item) => todo(accessToken).remove(item.itemId))))
                  .then(() => Promise.all([
                      todo(accessToken).create("Оплата маминого телефона", afterHalfWeek, "00012", "A012806170000017", "ONCE"),
                      todo(accessToken).create("Оплата интернета", afterWeek, "00012", "A012806170000017", "ONCE"),
                      todo(accessToken).create("Оплата мобильной связи", afterTwoWeeks, "00012", "A012806170000017", "ONCE")
                  ]))
                  .then(() => done())
    });

    it('Fetch todo list for the date', (done) => {
        assistant.sendRequest('input.todoList', ['ru'], {
            accessToken: accessToken,
            parameters: {
                "date": moment().add(7, 'day').format("YYYY-MM-DD")
            }
        }, (err, res) => {
            res.assertSpeech("ru",
                "Запланированные операции: " + [
                    "Оплата интернета"
                ].map((it) => `\n     - ${it}`));
            done()
        });
    });

    it('Fetch todo list for the period', (done) => {
        assistant.sendRequest('input.todoList', ['ru'], {
            accessToken: accessToken,
            parameters: {
                "date-period": moment().format("YYYY-MM-DD") + "/" + moment().add(7, 'day').format("YYYY-MM-DD")
            }
        }, (err, res) => {
            res.assertSpeech("ru",
                "Запланированные операции: " + [
                    "Оплата маминого телефона",
                    "Оплата интернета"
                ].map((it) => `\n     - ${it}`));
            done()
        });
    });

    it('Fetch no todo list for date', (done) => {
        assistant.sendRequest('input.todoList', ['ru'], {
            accessToken: accessToken,
            parameters: {
                "date": moment().add(5, 'day').format("YYYY-MM-DD")
            }
        }, (err, res) => {
            res.assertSpeech("ru",
                "Запланированные операции: " + [].map((it) => `\n     - ${it}`));
            done()
        });
    });

    it('Fetch no todo list for period', (done) => {
        assistant.sendRequest('input.todoList', ['ru'], {
            accessToken: accessToken,
            parameters: {
                "date-period":
                    moment().add(4, 'day').format("YYYY-MM-DD") + "/" + moment().add(5, 'day').format("YYYY-MM-DD")
            }
        }, (err, res) => {
            res.assertSpeech("ru",
                "Запланированные операции: " + [].map((it) => `\n     - ${it}`));
            done()
        });
    });

});
