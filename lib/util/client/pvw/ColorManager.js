export default function createMethods(session) {
    return {
        getScalarBarVisibilities: function(proxyIdList) {
            return session.call('pv.color.manager.scalarbar.visibility.get', [ proxyIdList ]);
        },
        setScalarBarVisibilities: function(proxyIdMap) {
            return session.call('pv.color.manager.scalarbar.visibility.set', [ proxyIdMap ]);
        },
        rescaleTransferFunction: function(options) {
            return session.call('pv.color.manager.rescale.transfer.function', [ options ]);
        },
        getCurrentScalarRange: function(proxyId) {
            return session.call('pv.color.manager.scalar.range.get', [ proxyId ]);
        },
        colorBy: function(representation, colorMode, arrayLocation='POINTS', arrayName='', vectorMode='Magnitude', vectorComponent=0, rescale=false) {
            return session.call('pv.color.manager.color.by', [ representation, colorMode, arrayLocation, arrayName, vectorMode, vectorComponent, rescale ]);
        },
        setOpacityFunctionPoints: function(arrayName, pointArray) {
            return session.call('pv.color.manager.opacity.points.set', [ arrayName, pointArray]);
        },
        getRgbPoints: function(arrayName) {
            return session.call('pv.color.manager.rgb.points.get', [arrayName]);
        },
        setRgbPoints: function(arrayName, rgbInfo) {
            return session.call('pv.color.manager.rgb.points.set', [arrayName, rgbInfo]);
        },
        getLutImage: function(representation, numSamples, customRange=null) {
            return session.call('pv.color.manager.lut.image.get', [representation, numSamples, customRange]);
        },
        setSurfaceOpacity: function(representation, enabled) {
            return session.call('pv.color.manager.surface.opacity.set', [representation, enabled]);
        },
        getSurfaceOpacity: function(representation) {
            return session.call('pv.color.manager.surface.opacity.get', [representation]);
        },
        selectColorMap: function(representation, paletteName) {
            return session.call('pv.color.manager.select.preset', [representation, paletteName]);
        },
        listColorMapNames: function() {
            return session.call('pv.color.manager.list.preset', []);
        }
    };
}
