var autobahn = require('autobahn'),
    Monologue = require('monologue.js'),
    CONNECTION_READY_TOPIC = 'connection.ready',
    CONNECTION_CLOSE_TOPIC = 'connection.close';

function getTransportObject(url) {
    var idx = url.indexOf(':'),
        protocol = url.substring(0, idx);
    if (protocol === 'ws' || protocol === 'wss') {
        return {
            'type': 'websocket',
            'url': url,
        };
    } else if (protocol === 'http' || protocol === 'https') {
        return {
            'type': 'longpoll',
            'url': url,
            request_timeout: 300000
        };
    } else {
        throw "Unknown protocol (" + protocol + ") for url (" + url + ").  Unable to create transport object.";
    }
}

export default class AutobahnConnection {
    constructor(urls, secret="vtkweb-secret") {
        this.urls = urls;
        this.secret = secret;
        this.connection = null;
    }

    connect() {
        var uriList = [].concat(this.urls),
            transports = [];

        for (var i = 0; i < uriList.length; i+=1) {
            var url = uriList[i],
                transport = null;
            try {
                transport = getTransportObject(url);
                transports.push(transport);
            } catch (transportCreateError) {
                console.error(transportCreateError);
            }
        }

        this.connection = new autobahn.Connection({
            max_retries: 0,
            transports: transports,
            realm: "vtkweb",
            authmethods: ["wampcra"],
            authid: "vtkweb",
            onchallenge: (session, method, extra) => {
                if (method === "wampcra") {
                    var secretKey = autobahn.auth_cra.derive_key(this.secret, "salt123");
                    return autobahn.auth_cra.sign(secretKey, extra.challenge);
                } else {
                    throw "don't know how to authenticate using '" + method + "'";
                }
            }
        });

        this.connection.onopen = (session, details) => {
            this.session = session;
            this.emit(CONNECTION_READY_TOPIC, this);
        }

        this.connection.onclose = (reason, details) => {
            this.emit(CONNECTION_CLOSE_TOPIC, this);
            this.connection = null;
            return true; // true => Stop retry
        }

        this.connection.open();
    }

    onConnectionReady(callback) {
        return this.on(CONNECTION_READY_TOPIC, callback);
    }

    onConnectionClose(callback) {
        return this.on(CONNECTION_CLOSE_TOPIC, callback);
    }

    getSession() {
        return this.session;
    }

    destroy(timeout=10) {
        this.off();
        if(this.session) {
            this.session.call('application.exit.later', [timeout]);
        }
        if(this.connection) {
            this.connection.close();
        }
        this.connection = null;
    }
}

Monologue.mixInto(AutobahnConnection);
