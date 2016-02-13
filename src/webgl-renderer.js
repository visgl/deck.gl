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
/* eslint-disable no-console */

import {createGLContext, Program, PerspectiveCamera, Scene, Events, Fx} from 'lumagl';
import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';
import throttle from 'lodash.throttle';

const DISPLAY_NAME = 'WebGLRenderer';
const PROP_TYPES = {
  id: PropTypes.string,

  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,

  initialShaders: PropTypes.array.isRequired,

  pixelRatio: PropTypes.number,
  viewport: PropTypes.object.isRequired,
  camera: PropTypes.object.isRequired,
  lights: PropTypes.object,
  blending: PropTypes.object,
  events: PropTypes.object,

  onRendererInitialized: PropTypes.func.isRequired,
  onInitializationFailed: PropTypes.func,
  onError: PropTypes.func
};

const DEFAULT_PROPS = {
  id: 'webgl-canvas',
  onPostRender: () => {},
  onBeforeRenderPickingScene: () => {},
  onAfterRenderPickingScene: () => {},
  onBeforeRenderFrame: () => {},
  onAfterRenderFrame: () => {},
  onInitializationFailed: () => {},
  onError: error => console.error('LumaGL Error: ', error)
};

export default class WebGLRenderer extends React.Component {
  static get displayName() {
    return DISPLAY_NAME;
  }

  static get propTypes() {
    return PROP_TYPES;
  }

  static get defaultProps() {
    return DEFAULT_PROPS;
  }

  constructor(props) {
    super(props);
    this._renderer = null;
  }

  componentDidMount() {
    const canvas = ReactDOM.findDOMNode(this);
    this._initWebGL(canvas);
    this.props.onRendererInitialized(this._renderer);
    this._animationLoop(this._renderer);
}

  /**
   * Initialize LumaGL library and through it WebGL
   * @param {string} canvasId
   */
  _initWebGL(canvas) {

    const gl = this._gl = createGLContext(canvas);

    this._programs = {};
    for (let program of this.props.initialShaders) {
      if (program.from === 'sources') {
        this._programs[program.id] = new Program(gl, program.vs, program.fs);
      } else {
        throw new Error("Can't handle program.from === '" + program.from + "'");
      }
    }

    this._camera = new PerspectiveCamera(this.props.camera);

    this._scene = new Scene(gl, this._programs, this._camera, {
      lights: this.props.lights,
      backgroundColor: {r:0,g:0,b:0,a:0}
    });

    Events.create(canvas, {
      cacheSize: false,
      cachePosition: false,
      centerOrigin: false,
      onClick: this._onClick.bind(this),
      onMouseMove: throttle(this._onMouseMove.bind(this), 100)
    });

    this._renderer = {
      gl: this._gl,
      programs: this._programs,
      scene: this._scene
    }

  }

  _renderPickingScene(opt) {
    const renderer = this._renderer;

    renderer.scene.models.forEach(model => {
      const program = renderer.program[model.program];
      if (model.pickable) {
        program.use();
        program.setUniform('enablePicking', 1);
        opt.o3dList.push(model);
      }
    });

    renderer.scene.renderToTexture('$picking');

    renderer.scene.models.forEach(model => {
      const program = renderer.program[model.program];
      if (model.pickable) {
        program.use();
        program.setUniform('enablePicking', 0);
      }
    });
  }

  _onClick(e) {
    const renderer = this._renderer;
    if (!renderer || !renderer.program) {
      return;
    }

    Object.keys(renderer.program).forEach(programId => {
      const program = renderer.program[programId];

      renderer.scene.pick(e.x, e.y, {
        viewport: this.props.viewport,
        pixelRatio: this.props.pixelRatio,
        pickingProgram: program
      });

      // popup selection
      if (this.props.events.onObjectClicked && program.selectedIndex >= 0) {
        this.props.events.onObjectClicked(
          program.selectedIndex, program.selectedLayerIndex, e
        );
      }
    });
  }

  _onMouseMove(e) {
    const renderer = this._renderer;
    if (!renderer || !renderer.program) {
      return;
    }

    Object.keys(renderer.program).forEach(programId => {
      const program = renderer.program[programId];

      renderer.scene.pick(e.x, e.y, {
        viewport: this.props.viewport,
        pixelRatio: this.props.pixelRatio,
        pickingProgram: program
      });

      // popup selection
      if (this.props.events.onObjectHovered && program.selectedIndex >= 0) {
        this.props.events.onObjectHovered(
          program.selectedIndex, program.selectedLayerIndex, e
        );
      }
    });
  }

  _renderFrame(renderer) {
    const {
      viewport: {x, y, width, height},
      blending: {enable, blendFunc, blendEquation},
      needRedraw, onBeforeRenderFrame, onAfterRenderFrame,
      pixelRatio
    } = this.props;

    this._renderer = renderer;
    if (!needRedraw()) {
      return;
    }

    const gl = renderer.gl;

    // clear depth and color buffers
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // update viewport to latest props
    // (typically changed by app on browser resize etc)
    gl.viewport(x * pixelRatio, y * pixelRatio, width * pixelRatio, height * pixelRatio);

    // setup bledning
    if (enable) {
      gl.enable(gl.BLEND);
      gl.blendFunc(...blendFunc.map(s => gl.get(s)));
      gl.blendEquation(gl.get(blendEquation));
    } else {
      gl.disable(gl.BLEND);
    }

    onBeforeRenderFrame();
    renderer.scene.render();
    onAfterRenderFrame();
  }

  /**
   * Main WebGL animation loop
   */
  _animationLoop(renderer) {
    this._renderFrame(renderer);
    // Keep registering ourselves for the next animation frame
    Fx.requestAnimationFrame(this._animationLoop.bind(this, renderer));
  }

  render() {
    const {id, width, height, pixelRatio} = this.props;

    const props = {
      id,
      ref: 'overlay',
      width: width * pixelRatio || 1,
      height: height * pixelRatio || 1,
      style: {
        width: width,
        height: height
      }
    };

    return <canvas {...props} />;
  }

}

/* eslint-enable no-console */
