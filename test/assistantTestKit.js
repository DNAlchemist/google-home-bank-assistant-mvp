'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
const uiid = require('uuid/v4');

chai.should();
chai.use(chaiHttp);

const assistant = {
    use: function (server) {
        this.server = server;
    },
    sendRequest: function (action, lang, query, callback) {
        chai.request(this.server)
            .post('/webhook')
            .send(this.createQuery(lang, action, query))
            .timeout(10000)
            .end((err, res) => {
                callback(err, {
                    assertSpeech: function (text) {
                        res.should.have.status(200);
                        res.body.should.have.property('speech').eql(text);
                    }
                });
            });
    },
    createQuery: function (lang, action, obj) {
        const request = require('./resources/requestTemplate');
        request.id = uiid();
        request.lang = lang;
        request.timestamp = new Date().toISOString();

        request.result.action = action;
        request.result.parameters = obj.parameters || request.result.parameters;
        request.result.contexts = obj.contexts || request.result.contexts;
        return request;
    }
};

module.exports = assistant;