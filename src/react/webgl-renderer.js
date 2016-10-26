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
import React, {PropTypes} from 'react';
import autobind from 'autobind-decorator';
import {createGLContext} from 'luma.gl';
/* global requestAnimationFrame, cancelAnimationFrame */

const DEFAULT_PIXEL_RATIO =
  (typeof window !== 'undefined' && window.devicePixelRatio) || 1;

const PROP_TYPES = {
  id: PropTypes.string.isRequired,

  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  style: PropTypes.object,

  pixelRatio: PropTypes.number,
  viewport: PropTypes.object.isRequired,
  blending: PropTypes.object,
  events: PropTypes.object,
  gl: PropTypes.object,
  glOptions: PropTypes.object,
  debug: PropTypes.bool,

  onRendererInitialized: PropTypes.func.isRequired,
  onInitializationFailed: PropTypes.func,
  onError: PropTypes.func,

  onRenderFrame: PropTypes.func,
  onMouseMove: PropTypes.func,
  onClick: PropTypes.func
};

const DEFAULT_PROPS = {
  style: {},
  gl: null,
  glOptions: {preserveDrawingBuffer: true},
  debug: false,
  pixelRatio: DEFAULT_PIXEL_RATIO,

  onRendererInitialized: () => {},
  onInitializationFailed: error => {
    throw error;
  },
  onError: error => {
    throw error;
  },
  onRenderFrame: () => {}
};

export default class WebGLRenderer extends React.Component {

  static get propTypes() {
    return PROP_TYPES;
  }

  static get defaultProps() {
    return DEFAULT_PROPS;
  }

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
    this.state = {
      gl: null
    };
    this._animationFrame = null;
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
        gl = createGLContext({canvas, debug, ...glOptions});
      } catch (error) {
        this.props.onInitializationFailed(error);
        return;
      }
    }

    this.setState({gl});

    // Call callback last, in case it throws
    this.props.onRendererInitialized({canvas, gl});
  }

  /**
   * Main WebGL animation loop
   */
  @autobind
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

  _renderFrame() {
    const {viewport: {x, y, width, height}, pixelRatio: dpr} = this.props;
    const {gl} = this.state;

    // Check for reasons not to draw
    if (!gl || !(width > 0) || !(height > 0)) {
      return;
    }

    // update viewport to latest props
    gl.viewport(x * dpr, y * dpr, width * dpr, height * dpr);

    // Call render callback
    this.props.onRenderFrame({gl});
  }

  render() {
    const {id, width, height, pixelRatio, style} = this.props;
    return (
      <canvas
        ref={'overlay'}
        key={'overlay'}
        id={id}
        width={width * pixelRatio}
        height={height * pixelRatio}
        style={{...style, width, height}}/>
    );
  }
}
