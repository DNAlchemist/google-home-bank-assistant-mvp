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
                            console.log(res.body)
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

        if(obj.accessToken) {
            request.originalRequest = {
                data: {
                      user: {
                          lastSeen: "2017-12-21T10:53:48Z",
                          accessToken: obj.accessToken,
                          locale: lang,
                          userId: "ABwppHEBJIHRIfKHPY14MI1dzRPpv57BZ6nawLyt6O80-bd87Stb3YrNQ7_B9TCcUf0LnvK0uZESjL9h_Xc"
                      }
                }
            }
        }
        return request;
    }
};

module.exports = assistant;
