var React = require('react'),
    Monologue = require('monologue.js'),
    TonicMouseHandler = require('tonic-mouse-handler/lib/MouseHandler.js'),
    sizeHelper = require('tonic-widgets/lib/util/SizeHelper'),
    wsClientFactory = require('../../util/client/pvw'),
    RENDER_READY_TOPIC = 'render-ready';

// ----------------------------------------------------------------------------

function onImageLoaded() {
    var image = this;

    if(image.drawToCanvas) {
        image.drawToCanvas();
    }
}

// ----------------------------------------------------------------------------

function drawToCanvasAsImage() {
    var image = this,
        component = this.component,
        canvas = React.findDOMNode(component.refs.canvasRenderer),
        ctx = canvas.getContext('2d'),
        w = component.state.width,
        h = component.state.height,
        iw = image ? image.width  : 500,
        ih = image ? image.height : 500;

    ctx.clearRect(0, 0, w, h);

    try {
        ctx.drawImage(
            image,
            0, 0, iw, ih,
            0, 0, w, h);
    } catch (err) {
    }
}

// ----------------------------------------------------------------------------

var ImageDeliveryViewPort = React.createClass({

    getInitialState() {
        return { width: 200, height: 200 };
    },

    getDefaultProps() {
        return { interactiveQuality: 50, stillQuality: 100, view: -1, modifiers: [0, 2], pressRadius: 50 };
    },

    componentWillMount() {
        this.firstDrag = true;
        this.mouseInteractionPending = false;
        this.renderOnIdleTimeout = null;
        this.lastMTime = 0;
        this.client = wsClientFactory(this.props.connection, ['MouseHandler', 'ViewPort', 'ViewPortImageDelivery']);

        this.imageToDraw = new Image();

        // Attach context to image
        this.imageToDraw.component    = this;
        this.imageToDraw.onload       = onImageLoaded;
        this.imageToDraw.drawToCanvas = drawToCanvasAsImage;

        // Listen to window resize
        window.addEventListener("resize", this.updateDimensions);
    },

    componentWillUnmount() {
        // Clean image
        this.imageToDraw.onload = null;
        this.imageToDraw.drawToCanvas = null;
        this.imageToDraw.component = null;
        this.imageToDraw = null;

        // Free mouseHandler
        this.mouseHandler.destroy();
        this.mouseHandler = null;

        // Remove window listener
        window.removeEventListener("resize", this.updateDimensions);
    },

    updateDimensions() {
        var el = this.getDOMNode().parentNode,
            innerWidth = Math.floor(sizeHelper.getInnerWidth(el)),
            innerHeight = Math.floor(sizeHelper.getInnerHeight(el));

        if(el && (this.state.width !== innerWidth || this.state.height !== innerHeight)) {
            this.setState({ width: innerWidth, height: innerHeight });
            console.log('Update size');
            return true;
        }
        return false;
    },

    componentDidMount() {
        this.updateDimensions();
        this.stillRender(false, true);

        // Attach mouse listener
        this.mouseHandler = new TonicMouseHandler(React.findDOMNode(this.refs.canvasRenderer));

        // Allow modifier via press action
        if(this.props.modifiers) {
            this.mouseHandler.toggleModifierOnPress(true, this.props.modifiers);
        }

        this.mouseHandler.attach({
            'drag' : this.dragCallback,
            'zoom' : this.zoomCallback,
            'dblclick': this.dblclickCallback
        });

        this.mouseHandler.on('modifier.change', (change, envelope) => {
            var image = this.imageToDraw,
                ctx = React.findDOMNode(this.refs.canvasRenderer).getContext('2d'),
                w = this.state.width,
                h = this.state.height;

            ctx.beginPath();
            ctx.fillStyle="#ffffff";
            ctx.lineWidth = 5;
            ctx.strokeStyle="#000000";
            ctx.arc(change.event.relative.x, change.event.relative.y, this.props.pressRadius, 0, 2 * Math.PI, false);
            ctx.fill();
            ctx.stroke();

            setTimeout(function() {
                image.drawToCanvas();
            }, 300);
        });
    },

    componentDidUpdate(nextProps, nextState) {
        this.updateDimensions();
        this.stillRender(false, true);
    },

    zoomCallback(event, envelope) {
        console.log('zoom');
        var vtkWeb_event = {
                view: this.view || this.props.view,
                action: 'move',
                charCode: 0,
                altKey:   false,
                ctrlKey:  false,
                shiftKey: false,
                metaKey:  false,
                buttonLeft:   false,
                buttonMiddle: false,
                buttonRight:  true // Zoom button
        };

        // Handle drag to pan
        if(this.firstDrag) {
            vtkWeb_event.action = 'down';
            this.firstDrag = false;
            console.log('down');
        } else if(event.isFinal) {
            vtkWeb_event.action = 'up';
            this.firstDrag = true;
            console.log('up');
        }

        vtkWeb_event.x = 0;
        vtkWeb_event.y = (1-event.scale) * this.state.height;

        if(!this.mouseInteractionPending || vtkWeb_event.action !== 'move') {
            // console.log(vtkWeb_event.action, vtkWeb_event.x, vtkWeb_event.y);
            this.mouseInteractionPending = true;
            this.client.MouseHandler
                .interaction(vtkWeb_event)
                .then(
                    (res) => {
                        // FIXME prevent render when pending one
                        if(res) {
                            this.mouseInteractionPending = false;
                            this.stillRender(!event.isFinal)
                        }
                    },
                    (error) => {
                        console.error('Interaction error', error);
                    }
                );
        }
    },

    dragCallback(event, envelope) {
        var vtkWeb_event = {
                view: this.view || this.props.view,
                action: 'move',
                charCode: 0,
                altKey:   event.modifier & 1,
                ctrlKey:  event.modifier & 8,
                shiftKey: event.modifier & 4,
                metaKey:  event.modifier & 2,
                buttonLeft:   (event.button === 0 ? true : false),
                buttonMiddle: (event.button === 1 ? true : false),
                buttonRight:  (event.button === 2 ? true : false)
            };

        // Handle drag to pan
        if(this.firstDrag) {
            vtkWeb_event.action = 'down';
            this.firstDrag = false;
        } else if(event.isFinal) {
            vtkWeb_event.action = 'up';
            this.firstDrag = true;
        }

        vtkWeb_event.x = event.deltaX / this.state.width;
        vtkWeb_event.y = 1.0 - event.deltaY / this.state.height;

        if(!this.mouseInteractionPending || vtkWeb_event.action !== 'move') {
            // console.log(vtkWeb_event.action, vtkWeb_event.x, vtkWeb_event.y);
            this.mouseInteractionPending = true;
            this.client.MouseHandler
                .interaction(vtkWeb_event)
                .then(
                    (res) => {
                        // FIXME prevent render when pending one
                        if(res) {
                            this.mouseInteractionPending = false;
                            this.stillRender(!event.isFinal)
                        }
                    },
                    (error) => {
                        console.error('Interaction error', error);
                    }
                );
        }

    },

    dblclickCallback(event, envelope) {
        this.resetCamera();
    },

    renderOnIdle() {
        if (this.renderOnIdleTimeout === null) {
            this.renderOnIdleTimeout = setTimeout(
                () => {
                    this.stillRender();
                }, 250
            );
        }
    },

    stillRender(interactive=false, force=false) {
        // clear any renderOnIdle requests that are pending since we
        // are sending a render request.
        if (this.renderOnIdleTimeout !== null) {
            clearTimeout(this.renderOnIdleTimeout);
            this.renderOnIdleTimeout = null;
        }

        this.client.ViewPortImageDelivery
            .stillRender({
                view: this.viewId || this.props.view,
                size: [ this.state.width, this.state.height ],
                mtime: (force ? 0 : this.lastMTime),
                quality: (interactive ? this.props.interactiveQuality : this.props.stillQuality),
                localTime : new Date().getTime()
            })
            .then(
                (response) => {
                    // Update last MTime
                    this.lastMTime = response.mtime;

                    // Add base64 data to the decode image
                    this.imageToDraw.src = "data:image/" + response.format  + "," + response.image;

                    if (response.stale === true) {
                        this.renderOnIdle();
                    } else {
                        this.emit(RENDER_READY_TOPIC);
                    }
                },
                (error) => {
                    console.error('Error fetching image', error);
                }
            );
    },

    resetCamera() {
        this.client.ViewPort
            .resetCamera(this.props.view)
            .then(
                (viewId) => {
                    this.viewId = viewId;
                    this.stillRender();
                },
                (error) => {
                    console.error('Reset camera', error);
                }
            );
    },

    render() {
        return (
            <canvas
                className='CanvasImageRenderer'
                ref='canvasRenderer'
                width={ this.state.width }
                height={ this.state.height }>
            </canvas>
        );
    }
});

Monologue.mixInto(ImageDeliveryViewPort);
export default ImageDeliveryViewPort;
