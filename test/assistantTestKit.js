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
    sendRequest: function (action, langs, query, callback) {
        langs.forEach((lang) => {
            chai.request(this.server)
                .post('/webhook')
                .send(this.createQuery(lang, action, query))
                .timeout(1000)
                .end(function(err, res) {
                    callback(err, {
                        assertSpeech: function (langForCheck, text) {
                            if(lang === langForCheck) {
                                res.should.have.status(200);
                                if(text instanceof RegExp) {
                                    res.body.should.have.property('speech').match(text);
                                    return;
                                }
                                res.body.should.have.property('speech').eql(text);
                            }
                        }
                    });
                });
        })
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