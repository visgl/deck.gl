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

/* global console */
import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';
import autobind from 'autobind-decorator';
import {createGLContext, PerspectiveCamera, Scene, Events, Fx, Framebuffer}
  from 'luma.gl';
import throttle from 'lodash.throttle';

const PROP_TYPES = {
  id: PropTypes.string,

  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,

  pixelRatio: PropTypes.number,
  viewport: PropTypes.object.isRequired,
  camera: PropTypes.object.isRequired,
  lights: PropTypes.object,
  blending: PropTypes.object,
  events: PropTypes.object,

  onRendererInitialized: PropTypes.func.isRequired,
  onInitializationFailed: PropTypes.func,
  onError: PropTypes.func,

  onBeforeRenderFrame: PropTypes.func,
  onAfterRenderFrame: PropTypes.func,
  onBeforeRenderPickingScene: PropTypes.func,
  onAfterRenderPickingScene: PropTypes.func,

  onNeedRedraw: PropTypes.func
};

const DEFAULT_PROPS = {
  id: 'webgl-canvas',
  onRendererInitialized: () => {},
  onInitializationFailed: () => {},
  /* eslint-disable no-console */
  onError: error => console.error('LumaGL Error: ', error),
  /* eslint-enable no-console */
  onBeforeRenderFrame: () => {},
  onAfterRenderFrame: () => {},
  onBeforeRenderPickingScene: () => {},
  onAfterRenderPickingScene: () => {},

  onNeedRedraw: () => true
};

export default class WebGLRenderer extends React.Component {

  static get propTypes() {
    return PROP_TYPES;
  }

  static get defaultProps() {
    return DEFAULT_PROPS;
  }

  constructor(props) {
    super(props);
    this.state = {
      gl: null
    };
  }

  componentDidMount() {
    const canvas = ReactDOM.findDOMNode(this);
    this._initWebGL(canvas);
    this._animationLoop();
  }

  /**
   * Initialize LumaGL library and through it WebGL
   * @param {string} canvas
   */
  _initWebGL(canvas) {

    const gl = createGLContext(canvas);

    const events = Events.create(canvas, {
      cacheSize: false,
      cachePosition: false,
      centerOrigin: false,
      onClick: this._onClick,
      onMouseMove: throttle(this._onMouseMove, 100)
    });

    const camera = new PerspectiveCamera(this.props.camera);

    // TODO - remove program parameter from scene, or move it into options
    const scene = new Scene(gl, null, camera, {
      lights: this.props.lights,
      backgroundColor: {r: 0, g: 0, b: 0, a: 0}
    });

    this.setState({gl, camera, scene, events});

    this.props.onRendererInitialized({gl, camera, scene});
  }

  _pick(x, y) {
    const {gl, scene, camera} = this.state;

    if (this._pickingFBO === undefined) {
      this._pickingFBO = new Framebuffer(gl, {
        width: gl.canvas.width,
        height: gl.canvas.height
      });
    }

    this._pickingFBO.bind();

    gl.enable(gl.SCISSOR_TEST);
    gl.scissor(x, gl.canvas.height - y, 1, 1);

    const picked = [];

    for (const model of scene.models) {
      if (model.pickable) {
        const program = model.program;
        program.use();
        program.setUniform('enablePicking', 1);
        model.onBeforeRender();
        const {view} = camera;
        const {matrix} = model;
        const worldMatrix = view.mulMat4(matrix);

        model.setState(program);

        program.setUniform('worldMatrix', worldMatrix);

        gl.clear(gl.COLOR_BUFFER_BIT);

        model.render();

        const pixel = new Uint8Array(4);
        gl.readPixels(
          x, gl.canvas.height - y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel
        );

        picked.push({
          layer: model.layer,
          data: pixel
        });

        program.setUniform('enablePicking', 0);

        model.unsetState(program);
      }
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.disable(gl.SCISSOR_TEST);
    return picked;
  }

  @autobind
  _onClick(e) {
    const picked = this._pick(e.x, e.y);
    for (const item of picked) {
      if (item.layer.onObjectClicked) {
        item.layer.onObjectClicked(item.data);
      }
    }
  }

  @autobind
  _onMouseMove(e) {
    const picked = this._pick(e.x, e.y);
    for (const item of picked) {
      if (item.layer.onObjectHovered) {
        item.layer.onObjectHovered(item.data);
      }
    }
  }

  _renderFrame() {
    const {
      viewport: {x, y, width, height},
      blending: {enable, blendFunc, blendEquation},
      onBeforeRenderFrame,
      onAfterRenderFrame,
      onNeedRedraw,
      pixelRatio
    } = this.props;

    const {gl, scene} = this.state;
    if (!gl) {
      return;
    }

    // Note: Do this after gl check, in case onNeedRedraw clears flags
    if (!onNeedRedraw()) {
      // return;
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
      gl.blendFunc(...blendFunc.map(s => gl.get(s)));
      gl.blendEquation(gl.get(blendEquation));
    } else {
      gl.disable(gl.BLEND);
    }

    onBeforeRenderFrame();
    scene.render();
    onAfterRenderFrame();
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
        id={ id }
        ref={ 'webgl-renderer-overlay' }
        width={ width * pixelRatio || 1 }
        height={ height * pixelRatio || 1 }
        style={ {width, height} }/>
    );
  }

}
