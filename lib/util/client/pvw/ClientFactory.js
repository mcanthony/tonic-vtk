var merge = require('mout/src/object/merge'),
    protocolsMap = {
        ColorManager: require('./ColorManager'),
        MouseHandler: require('./MouseHandler'),
        ProxyManager: require('./ProxyManager'),
        TimeHandler: require('./TimeHandler'),
        ViewPort: require('./ViewPort'),
        ViewPortGeometryDelivery: require('./ViewPortGeometryDelivery'),
        ViewPortImageDelivery: require('./ViewPortImageDelivery'),
    };

export default function createClient(connection, protocols=[]) {
    var session = connection.getSession(),
        result = { connection, session },
        count = protocols.length;

    while(count--) {
        var name = protocols[count];
        result[name] = protocolsMap[name](session);
    }

    return result;
}
