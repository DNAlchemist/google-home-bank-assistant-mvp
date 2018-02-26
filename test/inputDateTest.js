'use strict';

const InputDate = require('../src/InputDate.js');
const assert = require('assert');

describe('InputDate', () => {

    it('No date parameters', (done) => {
        const dateComparator = new InputDate({});
        try {
          dateComparator.isInterceptWith(new Date("2018-02-27"))
        } catch(e) {
            assert(e.message === "No date parameters found", e.message);
            done();
            return;
        }
        done(new Error("No exception thrown"));
    });

    it('Period intercept test', (done) => {
        const dateComparator = new InputDate({"date-period" : "2018-02-01/2018-02-25"});
        assert(dateComparator.isInterceptWith(new Date("2018-02-15")));
        done()
    });

    it('Period not intercept test', (done) => {
        const dateComparator = new InputDate({"date-period" : "2018-02-01/2018-02-25"});
        assert(!dateComparator.isInterceptWith(new Date("2018-02-27")));
        done()
    });

    it('Period intercept lower bound', (done) => {
        const dateComparator = new InputDate({"date-period" : "2018-02-01/2018-02-25"});
        assert(dateComparator.isInterceptWith(new Date("2018-02-01")));
        done()
    });

    it('Period intercept upper bound', (done) => {
        const dateComparator = new InputDate({"date-period" : "2018-02-01/2018-02-25"});
        assert(dateComparator.isInterceptWith(new Date("2018-02-25")));
        done()
    });

    it('Period intercept upper bound noon', (done) => {
        const dateComparator = new InputDate({"date-period" : "2018-02-01/2018-02-25"});
        const date = new Date("2018-02-25");
        date.setHours(12);
        assert(dateComparator.isInterceptWith(date));
        done()
    });

    it('Date equals', (done) => {
        const dateComparator = new InputDate({"date" : "2018-02-01"});
        assert(dateComparator.isInterceptWith(new Date("2018-02-01")));
        done()
    });

    it('Date equals noon', (done) => {
        const dateComparator = new InputDate({"date" : "2018-02-01"});
        const date = new Date("2018-02-01");
        date.setHours(12);
        assert(dateComparator.isInterceptWith(date));
        done()
    });

    it('Date not equals', (done) => {
        const dateComparator = new InputDate({"date" : "2018-02-01"});
        assert(!dateComparator.isInterceptWith(new Date("2018-02-02")));
        done()
    });
});
