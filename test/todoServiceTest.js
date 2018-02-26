'use strict';
process.env.NODE_ENV = 'test';

const todo = require('../src/services/todoService.js');
const moment = require('moment');
require('moment-timezone');

const chai = require('chai');
chai.should();

const uiid = require('uuid/v4');

const accessToken = 'c367a24e-80c8-41c6-8b55-e95c2eb4b9a5';
const dateFormat = "YYYY-MM-DDTHH:mm:ss.SSSZZ";

const afterWeek = moment().tz('Europe/Moscow')
    .add(7, 'day')
    .startOf('day').add(12, 'hour');

const afterTwoWeeks = moment().tz('Europe/Moscow')
    .add(14, 'day')
    .startOf('day').add(12, 'hours');

describe('todoService', () => {

    it('Full todo service test', (done) => {
        todo(accessToken)
            .getAll()
            .then(result => Promise.all(result.listData.map((item) => todo(accessToken).remove(item.itemId))))
            .then(() => todo(accessToken).getAll())
            .then(result => result.listData.should.deep.equal([]))
            .then(() => Promise.all([
                todo(accessToken).create("Оплата мобильной связи", afterWeek, "00012", "A012806170000017", "ONCE"),
                todo(accessToken).create("Оплата интернета", afterTwoWeeks, "00012", "A012806170000017", "ONCE")
            ]))
            .then(() => todo(accessToken).getAll())
            .then(result => {
                result.listData
                    .map(item => Object({itemName: item.itemName, date: item.predictedDate}))
                    .should.deep.equal([
                    {
                        "itemName": "Оплата мобильной связи",
                        date: moment(afterWeek)/*this is a bug stub*/.add(3, 'hours')/**/.format(dateFormat)
                    },
                    {
                        "itemName": "Оплата интернета",
                        date: moment(afterTwoWeeks)/*this is a bug stub*/.add(3, 'hours')/**/.format(dateFormat)
                    }
                ]);
                return Promise.resolve(result.listData.find(item => item.itemName === "Оплата мобильной связи"))
            })
            .then(item => todo(accessToken).remove(item.itemId))
            .then(() => todo(accessToken).getAll())
            .then(result => result.listData
                .map(item => Object({itemName: item.itemName, date: item.predictedDate}))
                .should.deep.equal([
                    {
                        "itemName": "Оплата интернета",
                        date: moment(afterTwoWeeks)/*this is a bug stub*/.add(3, 'hours')/**/.format(dateFormat)
                    }
                ])
            )
            .then(() => done())
            .catch(done)

    }).timeout(5000);
});
