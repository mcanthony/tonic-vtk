export default function createMethods(session) {
    return {
        resetCamera: function(view=-1) {
            return session.call('viewport.camera.reset', [ view ]);
        },
        updateOrientationAxesVisibility: function(view=-1, showAxis=true) {
            return session.call('viewport.axes.orientation.visibility.update', [ view, showAxis ]);
        },
        updateCenterAxesVisibility: function(view=-1, showAxis=true) {
            return session.call('viewport.axes.center.visibility.update', [ view, showAxis ]);
        },
        updateCamera: function(view_id=-1, focal_point=[0,0,0], view_up=[0,1,0], position=[0,0,1]) {
            return session.call('viewport.camera.update', [ view_id, focal_point, view_up, position ]);
        }
    };
}
