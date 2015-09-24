var Viewport = require('../../Viewport/ImageDeliveryViewport'),
    SmartConnect = require('tonic-ws-connect/lib/SmartConnect'),
    React = require('react'),
    container = document.createElement("div"),
    component = null,
    connection = null;

// Configure container
container.style.width = '100%'
container.style.height = '100%'
container.style.position = 'absolute'

// Add container to body
document.body.style.margin = '0';
document.body.style.padding = '0';
document.body.style.overflow = 'hidden';
document.body.style.background = '#eee';

document.body.appendChild(container);

// Start and create a connection to ParaViewWeb
var smartConnect = new SmartConnect({ application: 'pvw' });

smartConnect.onConnectionReady(function(connection) {
    component = React.render(
        React.createElement(
            Viewport,
            { connection }),
        container);

    // Add something in the 3D scene
    connection.session.call('pv.proxy.manager.create', [ 'Cone', 0 ]);
});

smartConnect.onConnectionClose(function(data) {
    console.log('Close', data);
});

smartConnect.onConnectionError(function(data) {
    console.log('Error', data);
});

smartConnect.connect();



