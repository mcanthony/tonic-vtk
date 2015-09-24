export default function createMethods(session) {
    return {
        stillRender: function(options={size:[400,400], view: -1}) {
            return session.call('viewport.image.render', [ options ]);
        }
    };
}
