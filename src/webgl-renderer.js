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

/* eslint-disable no-console, no-try-catch */
/* global console */
import React, {PropTypes} from 'react';
import autobind from 'autobind-decorator';
import {createGLContext, Camera, Scene, addEvents, Fx, glGet} from 'luma.gl';
import throttle from 'lodash.throttle';

const PROP_TYPES = {
  id: PropTypes.string,

  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,

  pixelRatio: PropTypes.number,
  viewport: PropTypes.object.isRequired,
  camera: PropTypes.instanceOf(Camera).isRequired,
  scene: PropTypes.instanceOf(Scene),
  blending: PropTypes.object,
  events: PropTypes.object,
  gl: PropTypes.object,
  debug: PropTypes.bool,

  onRendererInitialized: PropTypes.func.isRequired,
  onInitializationFailed: PropTypes.func,
  onError: PropTypes.func,

  onBeforeRenderFrame: PropTypes.func,
  onAfterRenderFrame: PropTypes.func,
  onBeforeRenderPickingScene: PropTypes.func,
  onAfterRenderPickingScene: PropTypes.func,

  onNeedRedraw: PropTypes.func,
  onMouseMove: PropTypes.func,
  onClick: PropTypes.func
};

const DEFAULT_PROPS = {
  id: 'webgl-canvas',
  scene: null,

  gl: null,
  debug: false,

  onRendererInitialized: () => {},
  onInitializationFailed: error => console.error(error),
  onError: error => {
    throw error;
  },
  onBeforeRenderFrame: () => {},
  onAfterRenderFrame: () => {},
  onBeforeRenderPickingScene: () => {},
  onAfterRenderPickingScene: () => {},

  onNeedRedraw: () => true,
  onMouseMove: () => {},
  onClick: () => {}
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
   * Returns a canvas, creates a basic WebGL context, a camera and a scene,
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
  }

  componentDidMount() {
    const canvas = this.refs.overlay;
    this._initWebGL(canvas);
  }

  /**
   * Initialize LumaGL library and through it WebGL
   * @param {string} canvas
   */
  _initWebGL(canvas) {
    const {debug} = this.props;
    let {gl} = this.props;
    if (!gl) {
      try {
        gl = createGLContext({
          canvas,
          debug,
          preserveDrawingBuffer: true
        });
      } catch (error) {
        this.props.onInitializationFailed(error);
        return;
      }
    }

    const events = addEvents(canvas, {
      cacheSize: false,
      cachePosition: false,
      centerOrigin: false,
      onClick: this._onClick,
      onMouseMove: throttle(this._onMouseMove, 100)
    });

    this.setState({gl, events});

    this._animationLoop();

    // Call callback last, in case it throws
    this.props.onRendererInitialized({gl});
  }

  // TODO - move this back to luma.gl/scene.js
  /* eslint-disable max-statements */
  _pick(x, y) {
    const {gl} = this.state;
    const {camera, scene, pixelRatio} = this.props;

    const pickedModels = scene.pickModels(gl, {
      camera,
      x: x * pixelRatio,
      y: y * pixelRatio
    });

    return pickedModels;
  }

  @autobind
  _onClick(event) {
    const picked = this._pick(event.x, event.y);
    this.props.onClick({...event, picked});
  }

  @autobind
  _onMouseMove(event) {
    const picked = this._pick(event.x, event.y);
    this.props.onMouseMove({...event, picked});
  }

  _renderFrame() {
    const {
      viewport: {x, y, width, height},
      blending: {enable, blendFunc, blendEquation},
      pixelRatio,
      camera,
      scene
    } = this.props;

    const {gl} = this.state;
    if (!gl || !scene) {
      return;
    }

    // Note: Do this after gl check, in case onNeedRedraw clears flags
    if (!this.props.onNeedRedraw()) {
      return;
    }

    // clear depth and color buffers
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // update viewport to latest props
    // (typically changed by app on browser resize etc)
    gl.viewport(
      x * pixelRatio,
      y * pixelRatio,
      width * pixelRatio,
      height * pixelRatio
    );

    // setup bledning
    if (enable) {
      gl.enable(gl.BLEND);
      gl.blendFunc(...blendFunc.map(s => glGet(gl, s)));
      gl.blendEquation(glGet(gl, blendEquation));
    } else {
      gl.disable(gl.BLEND);
    }

    this.props.onBeforeRenderFrame();
    scene.render({camera});
    this.props.onAfterRenderFrame();
  }

  /**
   * Main WebGL animation loop
   */
  @autobind
  _animationLoop() {
    this._renderFrame();
    // Keep registering ourselves for the next animation frame
    Fx.requestAnimationFrame(this._animationLoop);
  }

  render() {
    const {id, width, height, pixelRatio} = this.props;
    return (
      <canvas
        ref={ 'overlay' }
        id={ id }
        width={ width * pixelRatio || 1 }
        height={ height * pixelRatio || 1 }
        style={ {width, height} }/>
    );
  }

}
