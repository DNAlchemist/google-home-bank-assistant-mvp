'use strict';

const REST_PORT = (process.env.PORT || 5000);
const server = require('./app.js');

server.listen(REST_PORT, function () {
    console.log(`Service is ready on port ${REST_PORT}`);
});
