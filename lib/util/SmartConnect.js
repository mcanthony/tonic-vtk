var Monologue = require('monologue.js'),
    merge = require('mout/src/object/merge'),
    Launcher = require('./Launcher'),
    AutobahnConnection = require('./AutobahnConnection'),
    CONNECTION_READY_TOPIC = 'connection.ready',
    CONNECTION_CLOSE_TOPIC = 'connection.close',
    CONNECTION_ERROR_TOPIC = 'connection.error',
    DEFAULT_SESSION_MANAGER_URL = [location.protocol, "//", location.hostname, ":", location.port, "/paraview/"].join(''),
    DEFAULT_SESSION_URL = [(location.protocol === 'https') ? "wss" : "ws", "://", location.hostname, ":", location.port, "/ws"].join('');


function autobahnConnect(self) {
    var wsConnection = new AutobahnConnection(self.config.sessionURL, self.config.secret);
    self.subscriptions.push(wsConnection.onConnectionReady(self.readyForwarder));
    self.subscriptions.push(wsConnection.onConnectionClose(self.closeForwarder));
    wsConnection.connect();

    // Add to the garbage collector
    self.gc.push(wsConnection);
}

export default class SmartConnect {
    constructor(config) {
        this.config = config;
        this.gc = [];
        this.subscriptions = [];
        this.session = null;

        // Event forwarders
        var self = this;
        this.readyForwarder = function(data, envelope) {
            self.session = data.getSession();
            self.emit(CONNECTION_READY_TOPIC, data);
        };
        this.errorForwarder = function(data, envelope) {
            self.emit(CONNECTION_ERROR_TOPIC, data);
        };
        this.closeForwarder = function(data, envelope) {
            self.emit(CONNECTION_CLOSE_TOPIC, data);
        };
    }

    connect() {
        if(this.config.sessionURL) {
            // We have a direct connection URL
            autobahnConnect(this);
        } else {
            // We need to use the Launcher
            var launcher = new Launcher(this.config.sessionManagerURL || '/paraview');

            this.subscriptions.push(launcher.onProcessReady( (data, envelope) => {
                this.config = merge(this.config, data);
                autobahnConnect(this);
            }));
            this.subscriptions.push(launcher.onError( (data, envelope) => {
                // Try to use standard connection URL
                this.config.sessionURL = DEFAULT_SESSION_URL;
                autobahnConnect(this);
            }));

            launcher.start(this.config);

            // Add to the garbage collector
            this.gc.push(launcher);
        }
    }

    onConnectionReady(callback) {
        return this.on(CONNECTION_READY_TOPIC, callback);
    }

    onConnectionClose(callback) {
        return this.on(CONNECTION_CLOSE_TOPIC, callback);
    }

    onConnectionError(callback) {
        return this.on(CONNECTION_ERROR_TOPIC, callback);
    }

    getSession() {
        return this.session;
    }

    destroy() {
        this.off();
        while(this.subscriptions.length) {
            this.subscriptions.pop().unsubscribe();
        }

        if(this.session) {
            this.session.close();
        }
        this.session = null;

        this.readyForwarder = null;
        this.errorForwarder = null;
        this.closeForwarder = null;

        while(this.gc.length) {
            this.gc.pop().destroy();
        }
    }
}

Monologue.mixInto(SmartConnect);

