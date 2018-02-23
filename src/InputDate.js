const Logger = require('./logger.js');
const assert = require('assert');
const log = new Logger(Logger.lookupName(__filename));

function DateComparator(parameters) {
    assert(parameters);
    this.parameters = parameters;
    assert(this.parameters)
}

DateComparator.prototype.isInterceptWith = function(date) {
    if(this.parameters["date"]) {
        const requestDate = new Date(this.parameters["date"]);
        log.debug(`Compare "${date}" with "${requestDate}"`);
        return date.getTime() === requestDate.getTime();
    }
    else if(this.parameters["date-period"]) {
        log.debug(`Compare "${date}" with "${this.parameters["date-period"]}"`);
        const period = this.parameters["date-period"].split("/");
        assert(period.length === 2, `Invalid period format: "${this.parameters["date-period"]}"`);

        const activeFrom = new Date(period[0]);
        const activeTo = new Date(period[1]);

        return date >= activeFrom && date <= activeTo;

    } else throw new Error("No date parameters found");

    throw new Error("Illegal state: missing return condition");
};

module.exports = DateComparator;
