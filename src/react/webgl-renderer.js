// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/* global window */
import React, {createElement} from 'react';
import PropTypes from 'prop-types';
import autobind from './autobind';
import {createGLContext, setParameters} from 'luma.gl';
/* global requestAnimationFrame, cancelAnimationFrame */

const propTypes = {
  id: PropTypes.string.isRequired,

  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  useDevicePixelRatio: PropTypes.bool.isRequired,
  style: PropTypes.object,

  events: PropTypes.object,
  gl: PropTypes.object,
  glOptions: PropTypes.object,
  debug: PropTypes.bool,

  onInitializationFailed: PropTypes.func,
  onRendererInitialized: PropTypes.func.isRequired,
  onRenderFrame: PropTypes.func
};

const defaultProps = {
  style: {},
  gl: null,
  glOptions: {preserveDrawingBuffer: true},
  debug: false,

  onInitializationFailed: error => {
    throw error;
  },
  onRendererInitialized: () => {},
  onRenderFrame: () => {}
};

export default class WebGLRenderer extends React.Component {
  /**
   * @classdesc
   * Small react component that uses Luma.GL to initialize a WebGL context.
   *
   * Returns a canvas, creates a basic WebGL context
   * sets up a renderloop, and registers some basic event handlers
   *
   * @class
   * @param {Object} props - see propTypes documentation
   */
  constructor(props) {
    super(props);
    this.state = {};
    this._animationFrame = null;
    this.gl = null;
    autobind(this);
  }

  componentDidMount() {
    const canvas = this.refs.overlay;
    this._initWebGL(canvas);
    this._animationLoop();
  }

  componentWillUnmount() {
    this._cancelAnimationLoop();
  }

  /**
   * Initialize LumaGL library and through it WebGL
   * @param {string} canvas
   */
  _initWebGL(canvas) {
    const {debug, glOptions} = this.props;

    // Create context if not supplied
    let gl = this.props.gl;
    if (!gl) {
      try {
        gl = createGLContext(Object.assign({canvas, debug}, glOptions));
      } catch (error) {
        this.props.onInitializationFailed(error);
        return;
      }
    }

    this.gl = gl;

    // Call callback last, in case it throws
    this.props.onRendererInitialized({canvas, gl});
  }

  /**
   * Main WebGL animation loop
   */
  _animationLoop() {
    this._renderFrame();
    // Keep registering ourselves for the next animation frame
    if (typeof window !== 'undefined') {
      this._animationFrame = requestAnimationFrame(this._animationLoop);
    }
  }

  _cancelAnimationLoop() {
    if (this._animationFrame) {
      cancelAnimationFrame(this._animationFrame);
    }
  }

  // Calculate the drawing buffer size that would cover current canvas size and device pixel ratio
  // Intention is that every pixel in the drawing buffer will have a 1-to-1 mapping with
  // actual device pixels in the hardware framebuffer, allowing us to render at the full
  // resolution of the device.
  _calculateDrawingBufferSize(canvas, {useDevicePixelRatio = true}) {
    const cssToDevicePixels = useDevicePixelRatio ? window.devicePixelRatio || 1 : 1;
    // Lookup the size the browser is displaying the canvas in CSS pixels
    // and compute a size needed to make our drawingbuffer match it in
    // device pixels.
    // We have set the canvas width and hieht from props, use props instead of accessing
    // canvas.clientWidth/clientHeight for performance reasons.
    const {width, height} = this.props;
    return {
      width: Math.floor(width * cssToDevicePixels),
      height: Math.floor(height * cssToDevicePixels),
      devicePixelRatio: cssToDevicePixels
    };
  }

  // Resizes canvas width and height to match with device drawing buffer
  _resizeDrawingBuffer(canvas, {useDevicePixelRatio = true}) {
    // Resize the render buffer of the canvas to match canvas client size
    // multiplying with dpr (Optionally can be turned off)
    const newBufferSize = this._calculateDrawingBufferSize(canvas, {useDevicePixelRatio});
    // Only update if the canvas size has not changed
    if (newBufferSize.width !== canvas.width || newBufferSize.height !== canvas.height) {
      // Note: canvas.width, canvas.height control the size of backing drawing buffer
      // and can be set indepently of canvas.clientWidth and canvas.clientHeight
      // which confusingly reflect canvas.style.width, canvas.style.height
      canvas.width = newBufferSize.width;
      canvas.height = newBufferSize.height;
    }
  }

  _renderFrame() {
    const {width, height, useDevicePixelRatio} = this.props;
    const {gl} = this;

    // Check for reasons not to draw
    if (!gl || !(width > 0) || !(height > 0)) {
      return;
    }

    this._resizeDrawingBuffer(gl.canvas, {useDevicePixelRatio});

    // Updates WebGL viewport to latest props
    setParameters(gl, {
      viewport: [0, 0, gl.canvas.width, gl.canvas.height]
    });

    // Call render callback
    this.props.onRenderFrame({gl});

    this.props.onAfterRender(this.refs.overlay);

  }

  render() {
    const {id, width, height, style} = this.props;
    return createElement('canvas', {
      ref: 'overlay',
      key: 'overlay',
      id,
      style: Object.assign({}, style, {width, height})
    });
  }
}

WebGLRenderer.propTypes = propTypes;
WebGLRenderer.defaultProps = defaultProps;
