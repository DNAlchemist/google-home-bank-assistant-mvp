'use strict';

const InputDate = require('../src/InputDate.js');
const assert = require('assert');

describe('Date comparator', () => {

    it('no date parameters', (done) => {
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

    it('period intercept test', (done) => {
        const dateComparator = new InputDate({"date-period" : "2018-02-01/2018-02-25"});
        assert(dateComparator.isInterceptWith(new Date("2018-02-15")));
        done()
    });

    it('period not intercept test', (done) => {
        const dateComparator = new InputDate({"date-period" : "2018-02-01/2018-02-25"});
        assert(!dateComparator.isInterceptWith(new Date("2018-02-27")));
        done()
    });

    it('period intercept lower bound', (done) => {
        const dateComparator = new InputDate({"date-period" : "2018-02-01/2018-02-25"});
        assert(dateComparator.isInterceptWith(new Date("2018-02-25")));
        done()
    });

    it('period intercept upper bound', (done) => {
        const dateComparator = new InputDate({"date-period" : "2018-02-01/2018-02-25"});
        assert(dateComparator.isInterceptWith(new Date("2018-02-01")));
        done()
    });

    it('date equals', (done) => {
        const dateComparator = new InputDate({"date" : "2018-02-01"});
        assert(dateComparator.isInterceptWith(new Date("2018-02-01")));
        done()
    });

    it('date not equals', (done) => {
        const dateComparator = new InputDate({"date" : "2018-02-01"});
        assert(!dateComparator.isInterceptWith(new Date("2018-02-02")));
        done()
    });
});
