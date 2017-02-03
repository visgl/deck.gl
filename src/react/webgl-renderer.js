// Copyright (c) 2015 Uber Technologies, Inc.
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
import React, {PropTypes, createElement} from 'react';
import autobind from './autobind';
import {createGLContext} from 'luma.gl';
/* global requestAnimationFrame, cancelAnimationFrame */

const DEFAULT_PIXEL_RATIO =
  (typeof window !== 'undefined' && window.devicePixelRatio) || 1;

const propTypes = {
  id: PropTypes.string.isRequired,

  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  style: PropTypes.object,

  pixelRatio: PropTypes.number,
  viewport: PropTypes.object.isRequired,
  events: PropTypes.object,
  gl: PropTypes.object,
  glOptions: PropTypes.object,
  debug: PropTypes.bool,

  onInitializationFailed: PropTypes.func,
  onRendererInitialized: PropTypes.func.isRequired,
  onRenderFrame: PropTypes.func,
  onMouseMove: PropTypes.func,
  onClick: PropTypes.func
};

const defaultProps = {
  style: {},
  gl: null,
  glOptions: {preserveDrawingBuffer: true},
  debug: false,
  pixelRatio: DEFAULT_PIXEL_RATIO,

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

  // Updates WebGL viewport to latest props
  // for clean logging, only calls gl.viewport if props have changed
  _updateGLViewport() {
    let {viewport: {x, y, width: w, height: h}} = this.props;
    const {pixelRatio: dpr} = this.props;
    const {gl} = this;

    x = x * dpr;
    y = y * dpr;
    w = w * dpr;
    h = h * dpr;

    if (x !== this.x || y !== this.y || w !== this.w || h !== this.h) {
      gl.viewport(x, y, w, h);
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
    }
  }

  _renderFrame() {
    const {viewport: {width, height}} = this.props;
    const {gl} = this;

    // Check for reasons not to draw
    if (!gl || !(width > 0) || !(height > 0)) {
      return;
    }

    this._updateGLViewport();

    // Call render callback
    this.props.onRenderFrame({gl});

    this.props.onAfterRender(this.refs.overlay);

  }

  render() {
    const {id, width, height, pixelRatio, style} = this.props;
    return createElement('canvas', {
      ref: 'overlay',
      key: 'overlay',
      id,
      width: width * pixelRatio,
      height: height * pixelRatio,
      style: Object.assign({}, style, {width, height})
    });
  }
}

WebGLRenderer.propTypes = propTypes;
WebGLRenderer.defaultProps = defaultProps;
