export default function createMethods(session) {
    return {
        getSceneMetaData: function(view=-1) {
            return session.call('viewport.webgl.metadata', [ view ]);
        },
        getWebGLData: function(view_id=-1, object_id, part=0) {
            return session.call('viewport.webgl.data', [ view_id, object_id, part ]);
        },
        getCachedWebGLData: function(sha) {
            return session.call('viewport.webgl.cached.data', [sha]);
        },
        getSceneMetaDataAllTimesteps: function(view=-1) {
            return session.call('viewport.webgl.metadata.alltimesteps', [view]);
        }
    };
}
