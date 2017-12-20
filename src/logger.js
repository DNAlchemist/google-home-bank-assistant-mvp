const path = require('path');

function Logger(name) {
    this.name = name ? "[" + name + "]" : "";
}

Logger.prototype.debug = function (s) {
    if (this.debugEnabled === true)
        console.log(`${this.name} ${s}`);
};

Logger.prototype.info = function (s) {
    console.log(`${this.name} ${s}`);
};

Logger.prototype.error = function (s) {
    console.error(`${this.name} ${s}`);
};

Logger.lookup = (filename) => {
    return path.basename(filename)
};

module.exports = Logger;
