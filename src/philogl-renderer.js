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

import PhiloGL from 'philogl';
import React from 'react';
import ReactDOM from 'react-dom';
import throttle from 'lodash.throttle';
import flattenDeep from 'lodash.flattendeep';
import where from 'lodash.where';
import isEqual from 'lodash.isequal';

const displayName = 'PhiloGLRenderer';

const propTypes = {
  id: React.PropTypes.string,

  width: React.PropTypes.number.isRequired,
  height: React.PropTypes.number.isRequired,
  layers: React.PropTypes.array.isRequired,

  pixelRatio: React.PropTypes.number,
  // viewport
  viewport: React.PropTypes.object.isRequired,
  // camera options
  camera: React.PropTypes.object.isRequired,
  // light options
  lights: React.PropTypes.object,
  // blending options
  blending: React.PropTypes.object,
  // events, enable color picking
  events: React.PropTypes.object,

  // WebGL initialization failure callback (defaults to onError)
  onInitializationFailed: React.PropTypes.func,
  // WebGL overlay error callback
  onError: React.PropTypes.func
};

const defaultProps = {
  id: 'webgl-canvas',
  onPostRender: () => {},
  onBeforeRenderPickingScene: () => {},
  onAfterRenderPickingScene: () => {},
  onError:
    // Default onError implementation
    error => {
      /* global console */
      /* eslint-disable no-console */
      console.error('PhiloGL Error: ', error);
      /* eslint-enable no-console */
    },
  onInitializationFailed: null
};

export default class PhiloGLRenderer extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const canvas = ReactDOM.findDOMNode(this);
    this._initWebGL(canvas.id);
  }

  componentWillReceiveProps(nextProps) {
    const philoApp = this._philoApp;

    nextProps.layers.forEach(nextLayer => {
      // find corrensponding layer
      const currLayer = where(this.props.layers, {
        layerId: nextLayer.layerId
      })[0];
      // update rendering function (esp. numInstances) if #instances changes
      if (nextLayer.options.numInstances !== currLayer.options.numInstances) {
        const newRenderFunction = this._getRenderFunction(philoApp, nextLayer);
        philoApp.primitives[currLayer.layerId].render = newRenderFunction;
      }
    });
  }

  /**
   * Initalize PhiloGL library and through it WebGL
   * @param {string} canvasId
   */
  _initWebGL(canvasId) {
    PhiloGL(canvasId, {
      program: flattenDeep(this.props.layers.map(
        // duplicate program as required by PhilgoGl
        layer => [layer.program, layer.program]
      )),
      camera: this.props.camera,
      scene: {
        lights: this.props.lights,
        renderPickingScene: this._renderPickingScene.bind(this)
      },
      events: {
        cacheSize: false,
        cachePosition: false,
        centerOrigin: false,
        onClick: this._onClick.bind(this),
        onMouseMove: throttle(this._onMouseMove.bind(this), 100)
      },
      onLoad: this._onPhiloGLLoad.bind(this),
      onError: this._onPhiloGLError.bind(this)
    });
  }

  /**
   * PhiloGL callback
   * @param {PhiloGL.WebGL.Application} philoApp
   */
  _onPhiloGLLoad(philoApp) {
    // Check that webgl initilized correctly
    if (!PhiloGL.hasWebGL() || !philoApp.gl) {
      this.props.onInitializationFailed();
      return;
    }

    // Initilize all the layers
    this.props.layers.forEach(layer => {
      this._initializeLayer(philoApp, layer);
    });

    // Clear depth buffer
    // TODO/ib why is this done on load
    const gl = philoApp.gl;
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);

    this._animationLoop(philoApp);
  }

  _onPhiloGLError(error) {
    this.props.onError(error);
  }

  _initializeLayer(philoApp, layer) {
    if (!philoApp.primitives) {
      philoApp.primitives = {};
    }

    const programOfCurrentLayer = philoApp.program[layer.primitive.id];

    philoApp.primitives[layer.primitive.id] = new PhiloGL.O3D.Model({
      // programId, not program itself
      program: layer.primitive.id,
      // whether current layer responses to mouse events
      pickable: layer.options.isPickable,
      // the pick function TODO (gnavvy) do we allow user to overwrite this?
      pick(point) {
        const x = point[0];
        const y = point[1];
        // z is used as layer index
        const z = point[2];

        const index = x !== 0 || y !== 0 ? x + y * 256 : 0;
        const target = index === 0 ? [-1, -1, -1] : [x, y, z];

        programOfCurrentLayer.use();
        programOfCurrentLayer.setUniform('selected', target);
        programOfCurrentLayer.selectedIndex = index - 1;
        programOfCurrentLayer.selectedLayerIndex = z;
      },
      // get render function per primitve (instanced? indexed?)
      render: this._getRenderFunction(philoApp, layer),
      // update buffer before rendering, -> shader attributes
      // TODO no need to setBuffer if no changes
      onBeforeRender() {
        // set attributes (positions, colors, pickingColors, etc.)
        Object.keys(layer.attributes).forEach(attrKey => {
          programOfCurrentLayer.use();
          programOfCurrentLayer.setBuffer(attrKey, layer.attributes[attrKey]);
        });

        ['vertices', 'normals', 'indices'].forEach(primKey => {
          if (layer.primitive[primKey]) {
            programOfCurrentLayer.use();
            programOfCurrentLayer.setBuffer(primKey, {
              value: layer.primitive[primKey]
            });
          }
        });
      }

    });

    const gl = philoApp.gl;

    // set buffers
    if (layer.primitive.vertices) {
      programOfCurrentLayer.setBuffer('vertices', {
        value: layer.primitive.vertices,
        size: 3
      });
    }
    if (layer.primitive.normals) {
      programOfCurrentLayer.setBuffer('normals', {
        value: layer.primitive.normals,
        size: 3
      });
    }
    if (layer.primitive.indices) {
      programOfCurrentLayer.setBuffer('indices', {
        value: layer.primitive.indices,
        bufferType: gl.ELEMENT_ARRAY_BUFFER,
        drawType: gl.STATIC_DRAW,
        size: 1
      });
    }

    // add primitve to the scene
    philoApp.scene.add(philoApp.primitives[layer.primitive.id]);
  }

  _getRenderFunction(philoApp, layer) {
    const gl = philoApp.gl;

    const primitiveDrawType = layer.primitive.drawType ?
      gl.get(layer.primitive.drawType) :
      gl.POINTS;

    if (layer.primitive.instanced) {
      const ext = gl.getExtension('ANGLE_instanced_arrays');

      if (layer.primitive.indices) {
        return () => {
          ext.drawElementsInstancedANGLE(
            // the kind of primitives to render
            primitiveDrawType,
            // the number of elements to render
            layer.primitive.indices.length,
            // the type of elements in the element array buffer
            gl.UNSIGNED_SHORT,
            // offset into the element array buffer
            0,
            // the number of instances to render
            layer.options.numInstances
          );
        };
      }
      // else if layer.primitive does not have indices
      return () => {
        // (mode, first, count, primcount);
        ext.drawArraysInstancedANGLE(
          // the kind of primitives to render
          primitiveDrawType,
          // the first element to render in the array of vector points
          0,
          // the number of elements to render
          layer.primitive.vertices.length / 3,
          // the number of instances to render
          layer.options.numInstances
        );
      };

    }

    // else if layer.primitive is not instanced
    if (layer.primitive.indices) {
      return () => {
        gl.drawElements(
          // the kind of primitives to render
          primitiveDrawType,
          // the number of elements to render
          layer.primitive.indices.length,
          // the type of elements in the element array buffer
          gl.UNSIGNED_SHORT,
          // offset into the element array buffer
          0
        );
      };
    }
    // else if layer.primitive does not have indices
    return () => {
      gl.drawArrays(
        // the kind of primitives to render
        primitiveDrawType,
        // the first element to render in the array of vector points
        0,
        // the number of instances to render
        layer.options.numInstances
      );
    };
  }

  _renderPickingScene(opt) {
    const philoApp = this._philoApp;

    Object.keys(philoApp.primitives).forEach(key => {
      const primitive = philoApp.primitives[key];

      if (primitive.pickable) {
        philoApp.program[primitive.program].use();
        philoApp.program[primitive.program].setUniform('enablePicking', 1);
        opt.o3dList.push(primitive);
      }
    });

    philoApp.scene.renderToTexture('$picking');

    Object.keys(philoApp.primitives).forEach(key => {
      const primitive = philoApp.primitives[key];

      if (primitive.pickable) {
        philoApp.program[primitive.program].use();
        philoApp.program[primitive.program].setUniform('enablePicking', 0);
      }
    });
  }

  _onClick(e) {
    const philoApp = this._philoApp;

    Object.keys(philoApp.primitives).forEach(key => {
      const primitive = philoApp.primitives[key];

      philoApp.scene.pick(e.x, e.y, {
        viewport: this.props.viewport,
        pixelRatio: this.props.pixelRatio,
        pickingProgram: philoApp.program[primitive.program]
      });

      // popup selection
      if (this.props.events.onObjectClicked) {
        const program = philoApp.program[key];
        const selectedIndex = primitive.selectedIndex || program.selectedIndex;
        if (selectedIndex >= 0) {
          this.props.events.onObjectClicked(
            selectedIndex,
            primitive.selectedLayerIndex || program.selectedLayerIndex,
            e
          );
        }
      }
    });
  }

  _onMouseMove(e) {
    const philoApp = this._philoApp;

    Object.keys(philoApp.primitives).forEach(key => {
      const primitive = philoApp.primitives[key];

      philoApp.scene.pick(e.x, e.y, {
        viewport: this.props.viewport,
        pixelRatio: this.props.pixelRatio,
        pickingProgram: philoApp.program[primitive.program]
      });

      // popup selection
      if (this.props.events.onObjectHovered) {
        const program = philoApp.program[key];
        const selectedIndex = primitive.selectedIndex || program.selectedIndex;
        if (selectedIndex >= 0) {
          this.props.events.onObjectHovered(
            selectedIndex,
            primitive.selectedLayerIndex || program.selectedLayerIndex,
            e
          );
        }
      }
    });
  }

  _renderFrame(philoApp) {
    this._philoApp = philoApp;

    const gl = philoApp.gl;

    // Clear depth and color buffers
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // update viewport to latest props
    // (typically changed by app on browser resize etc)
    gl.viewport(
      this.props.viewport.x,
      this.props.viewport.y,
      this.props.viewport.width,
      this.props.viewport.height
    );

    const blending = this.props.blending;
    if (blending && blending.enable) {
      gl.enable(gl.BLEND);
      gl.blendFunc(...blending.blendFunc.map(s => gl.get(s)));
      gl.blendEquation(gl.get(this.props.blending.blendEquation));
    } else {
      gl.disable(gl.BLEND);
    }

    this.props.layers.forEach(layer => {
      const primitive = philoApp.primitives[layer.primitive.id];

      // update instanced attributes.
      if (layer.attributes &&
          !isEqual(primitive.attributes, layer.attributes)) {
        primitive.attributes = layer.attributes;
      }

      // set uniforms
      if (layer.uniforms && !isEqual(primitive.uniforms, layer.uniforms)) {
        primitive.uniforms = layer.uniforms;
      }
    });

    // render scene
    philoApp.scene.render();
  }

  /**
   * Main WebGL animation loop
   * @param {PhiloGL.WebGL.Application} philoApp
   */
  _animationLoop(philoApp) {
    this._renderFrame(philoApp);
    // Keep registering ourselves for the next animation frame
    PhiloGL.Fx.requestAnimationFrame(this._animationLoop.bind(this, philoApp));
  }

  render() {
    return (
      <canvas
        ref='overlay'
        id={this.props.id}
        width={this.props.width * this.props.pixelRatio || 1}
        height={this.props.height * this.props.pixelRatio || 1}
      />
    );
  }

}

PhiloGLRenderer.displayName = displayName;
PhiloGLRenderer.propTypes = propTypes;
PhiloGLRenderer.defaultProps = defaultProps;
