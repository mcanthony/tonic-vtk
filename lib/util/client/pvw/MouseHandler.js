export default function createMethods(session) {
    return {
        interaction: function(event) {
            return session.call('viewport.mouse.interaction', [ event ]);
        }
    };
}
