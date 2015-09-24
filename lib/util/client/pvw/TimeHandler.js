export default function createMethods(session) {
    return {
        updateTime: function(action) {
            return session.call('pv.vcr.action', [ action ]);
        },
        next: function() {
            return session.call('pv.vcr.action', [ 'next' ]);
        },
        previous: function() {
            return session.call('pv.vcr.action', [ 'prev' ]);
        },
        first: function() {
            return session.call('pv.vcr.action', [ 'first' ]);
        },
        last: function() {
            return session.call('pv.vcr.action', [ 'last' ]);
        }
    };
}
