export default function createMethods(session) {
    return {
        create: function(functionName, parentId) {
            return session.call('pv.proxy.manager.create', [ functionName, parentId ]);
        },
        open: function(relativePath) {
            return session.call('pv.proxy.manager.create.reader', [ relativePath ]);
        },
        get: function(proxyId) {
            return session.call('pv.proxy.manager.get', [ proxyId ]);
        },
        findProxyId: function(groupName, proxyName) {
            return session.call('pv.proxy.manager.find.id', [ groupName, proxyName ]);
        },
        update: function(propsList) {
            return session.call('pv.proxy.manager.update', [ propsList ]);
        },
        delete: function(proxyId) {
            return session.call('pv.proxy.manager.delete', [ proxyId ]);
        },
        list: function(viewId=-1) {
            return session.call('pv.proxy.manager.list', [ viewId ]);
        },
        available: function(type='sources') {
            return session.call('pv.proxy.manager.available', [ type ]);
        },
        availableSources: function() {
            return session.call('pv.proxy.manager.available', [ 'sources' ]);
        },
        availableFilters: function() {
            return session.call('pv.proxy.manager.available', [ 'filters' ]);
        }
    };
}
