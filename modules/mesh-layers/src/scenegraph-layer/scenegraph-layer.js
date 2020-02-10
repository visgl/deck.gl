// Copyright (c) 2019 Uber Technologies, Inc.
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

import {Layer, project32, picking, log} from '@deck.gl/core';
import {isWebGL2} from '@luma.gl/core';
import {pbr} from '@luma.gl/shadertools';
import {ScenegraphNode, createGLTFObjects} from '@luma.gl/experimental';
import GL from '@luma.gl/constants';
import {waitForGLTFAssets} from './gltf-utils';

import {MATRIX_ATTRIBUTES, shouldComposeModelMatrix} from '../utils/matrix';

import vs from './scenegraph-layer-vertex.glsl';
import fs from './scenegraph-layer-fragment.glsl';

const DEFAULT_COLOR = [255, 255, 255, 255];

const defaultProps = {
  scenegraph: {type: 'object', value: null, async: true},
  getScene: gltf => {
    if (gltf && gltf.scenes) {
      // gltf post processor replaces `gltf.scene` number with the scene `object`
      return typeof gltf.scene === 'object' ? gltf.scene : gltf.scenes[gltf.scene || 0];
    }
    return gltf;
  },
  getAnimator: scenegraph => scenegraph && scenegraph.animator,
  _animations: null,

  sizeScale: {type: 'number', value: 1, min: 0},
  sizeMinPixels: {type: 'number', min: 0, value: 0},
  sizeMaxPixels: {type: 'number', min: 0, value: Number.MAX_SAFE_INTEGER},

  getPosition: {type: 'accessor', value: x => x.position},
  getColor: {type: 'accessor', value: DEFAULT_COLOR},

  // flat or pbr
  _lighting: 'flat',
  // _lighting must be pbr for this to work
  _imageBasedLightingEnvironment: null,

  // yaw, pitch and roll are in degrees
  // https://en.wikipedia.org/wiki/Euler_angles
  // [pitch, yaw, roll]
  getOrientation: {type: 'accessor', value: [0, 0, 0]},
  getScale: {type: 'accessor', value: [1, 1, 1]},
  getTranslation: {type: 'accessor', value: [0, 0, 0]},
  // 4x4 matrix
  getTransformMatrix: {type: 'accessor', value: []}
};

export default class ScenegraphLayer extends Layer {
  initializeState() {
    const attributeManager = this.getAttributeManager();
    attributeManager.addInstanced({
      instancePositions: {
        size: 3,
        type: GL.DOUBLE,
        fp64: this.use64bitPositions(),
        accessor: 'getPosition',
        transition: true
      },
      instanceColors: {
        type: GL.UNSIGNED_BYTE,
        size: this.props.colorFormat.length,
        accessor: 'getColor',
        normalized: true,
        defaultValue: DEFAULT_COLOR,
        transition: true
      },
      instanceModelMatrix: MATRIX_ATTRIBUTES
    });
  }

  updateState(params) {
    super.updateState(params);
    const {props, oldProps} = params;

    if (props.scenegraph !== oldProps.scenegraph) {
      this._updateScenegraph(props);
    } else if (props._animations !== oldProps._animations) {
      this._applyAnimationsProp(this.state.scenegraph, this.state.animator, props._animations);
    }
  }

  finalizeState() {
    super.finalizeState();
    this._deleteScenegraph();
  }

  _updateScenegraph(props) {
    const {gl} = this.context;
    let scenegraphData;
    if (props.scenegraph instanceof ScenegraphNode) {
      // Signature 1: props.scenegraph is a proper luma.gl Scenegraph
      scenegraphData = {scenes: [props.scenegraph]};
    } else if (props.scenegraph && !props.scenegraph.gltf) {
      // Converts loaders.gl gltf to luma.gl scenegraph using the undocumented @luma.gl/experimental function
      const gltf = props.scenegraph;
      const gltfObjects = createGLTFObjects(gl, gltf, this.getLoadOptions());
      scenegraphData = Object.assign({gltf}, gltfObjects);

      waitForGLTFAssets(gltfObjects).then(() => this.setNeedsRedraw());
    } else {
      // DEPRECATED PATH: Assumes this data was loaded through GLTFScenegraphLoader
      log.deprecated(
        'ScenegraphLayer.props.scenegraph',
        'Use GLTFLoader instead of GLTFScenegraphLoader'
      )();
      scenegraphData = props.scenegraph;
    }

    const options = {layer: this, gl};
    const scenegraph = props.getScene(scenegraphData, options);
    const animator = props.getAnimator(scenegraphData, options);

    if (scenegraph instanceof ScenegraphNode) {
      this._deleteScenegraph();
      this._applyAllAttributes(scenegraph);
      this._applyAnimationsProp(scenegraph, animator, props._animations);
      this.setState({scenegraph, animator});
    } else if (scenegraph !== null) {
      log.warn('invalid scenegraph:', scenegraph)();
    }
  }

  _applyAllAttributes(scenegraph) {
    if (this.state.attributesAvailable) {
      const allAttributes = this.getAttributeManager().getAttributes();
      scenegraph.traverse(model => {
        this._setModelAttributes(model.model, allAttributes);
      });
    }
  }

  _applyAnimationsProp(scenegraph, animator, animationsProp) {
    if (!scenegraph || !animator || !animationsProp) {
      return;
    }

    const animations = animator.getAnimations();

    // sort() to ensure '*' comes first so that other values can override
    Object.keys(animationsProp)
      .sort()
      .forEach(key => {
        // Key can be:
        //  - number for index number
        //  - name for animation name
        //  - * to affect all animations
        const value = animationsProp[key];

        if (key === '*') {
          animations.forEach(animation => {
            Object.assign(animation, value);
          });
        } else if (Number.isFinite(Number(key))) {
          const number = Number(key);
          if (number >= 0 && number < animations.length) {
            Object.assign(animations[number], value);
          } else {
            log.warn(`animation ${key} not found`)();
          }
        } else {
          const findResult = animations.find(({name}) => name === key);
          if (findResult) {
            Object.assign(findResult, value);
          } else {
            log.warn(`animation ${key} not found`)();
          }
        }
      });
  }

  _deleteScenegraph() {
    const {scenegraph} = this.state;
    if (scenegraph instanceof ScenegraphNode) {
      scenegraph.delete();
    }
  }

  getLoadOptions() {
    const modules = [project32, picking];
    const {_lighting, _imageBasedLightingEnvironment} = this.props;

    if (_lighting === 'pbr') {
      modules.push(pbr);
    }

    let env = null;
    if (_imageBasedLightingEnvironment) {
      if (typeof _imageBasedLightingEnvironment === 'function') {
        env = _imageBasedLightingEnvironment({gl: this.context.gl, layer: this});
      } else {
        env = _imageBasedLightingEnvironment;
      }
    }

    return {
      gl: this.context.gl,
      waitForFullLoad: true,
      imageBasedLightingEnvironment: env,
      modelOptions: {
        vs,
        fs,
        modules,
        isInstanced: true,
        transpileToGLSL100: !isWebGL2(this.context.gl)
      },
      // tangents are not supported
      useTangents: false
    };
  }

  updateAttributes(changedAttributes) {
    this.setState({attributesAvailable: true});
    if (!this.state.scenegraph) return;

    this.state.scenegraph.traverse(model => {
      this._setModelAttributes(model.model, changedAttributes);
    });
  }

  draw({moduleParameters = null, parameters = {}, context}) {
    if (!this.state.scenegraph) return;

    if (this.props._animations && this.state.animator) {
      this.state.animator.animate(context.animationProps.time);
    }

    const {viewport} = this.context;
    const {sizeScale, sizeMinPixels, sizeMaxPixels, opacity, coordinateSystem} = this.props;
    const numInstances = this.getNumInstances();
    this.state.scenegraph.traverse((model, {worldMatrix}) => {
      model.model.setInstanceCount(numInstances);
      model.updateModuleSettings(moduleParameters);
      model.draw({
        parameters,
        uniforms: {
          sizeScale,
          opacity,
          sizeMinPixels,
          sizeMaxPixels,
          composeModelMatrix: shouldComposeModelMatrix(viewport, coordinateSystem),
          sceneModelMatrix: worldMatrix,
          // Needed for PBR (TODO: find better way to get it)
          u_Camera: model.model.getUniforms().project_uCameraPosition
        }
      });
    });
  }
}

ScenegraphLayer.layerName = 'ScenegraphLayer';
ScenegraphLayer.defaultProps = defaultProps;
