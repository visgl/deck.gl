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
import {
  ScenegraphNode,
  GroupNode,
  GLTFAnimator,
  GLTFEnvironment,
  createGLTFObjects
} from '@luma.gl/experimental';
import GL from '@luma.gl/constants';
import {GLTFLoader} from '@loaders.gl/gltf';
import {waitForGLTFAssets} from './gltf-utils';

import {MATRIX_ATTRIBUTES, shouldComposeModelMatrix} from '../utils/matrix';

import vs from './scenegraph-layer-vertex.glsl';
import fs from './scenegraph-layer-fragment.glsl';

import type {
  UpdateParameters,
  LayerContext,
  LayerProps,
  LayerDataSource,
  Position,
  Color,
  Accessor,
  DefaultProps
} from '@deck.gl/core';

const DEFAULT_COLOR: [number, number, number, number] = [255, 255, 255, 255];

export type ScenegraphLayerProps<DataT = any> = _ScenegraphLayerProps<DataT> & LayerProps;

type _ScenegraphLayerProps<DataT> = {
  data: LayerDataSource<DataT>;
  // TODO - define in luma.gl
  /**
   * A url for a glTF model or scenegraph loaded via a [scenegraph loader](https://loaders.gl/docs/specifications/category-scenegraph)
   */
  scenegraph: any;
  /**
   * Create a luma.gl GroupNode from the resolved scenegraph prop
   */
  getScene?: (
    scenegraph: any,
    context: {gl: WebGLRenderingContext; layer: ScenegraphLayer<DataT>}
  ) => GroupNode;
  /**
   * Create a luma.gl GLTFAnimator from the resolved scenegraph prop
   */
  getAnimator?: (
    scenegraph: any,
    context: {gl: WebGLRenderingContext; layer: ScenegraphLayer<DataT>}
  ) => GLTFAnimator;
  /**
   * (Experimental) animation configurations. Requires `_animate` on deck object.
   */
  _animations?: {
    [name: number | string | '*']: {
      /** If the animation is playing */
      playing?: boolean;
      /** Start time of the animation, default `0` */
      startTime?: number;
      /** Speed multiplier of the animation, default `1` */
      speed?: number;
    };
  } | null;
  /**
   * (Experimental) lighting mode
   * @default 'flat'
   */
  _lighting?: 'flat' | 'pbr';
  /**
   * (Experimental) lighting environment. Requires `_lighting` to be `'pbr'`.
   */
  _imageBasedLightingEnvironment?:
    | null
    | GLTFEnvironment
    | ((context: {gl: WebGLRenderingContext; layer: ScenegraphLayer<DataT>}) => GLTFEnvironment);

  /** Anchor position accessor. */
  getPosition?: Accessor<DataT, Position>;
  /** Color value or accessor.
   * @default [255, 255, 255, 255]
   */
  getColor?: Accessor<DataT, Color>;
  /**
   * Orientation in [pitch, yaw, roll] in degrees.
   * @see https://en.wikipedia.org/wiki/Euler_angles
   * @default [0, 0, 0]
   */
  getOrientation?: Accessor<DataT, [number, number, number]>;
  /**
   * Scaling factor of the model along each axis.
   * @default [1, 1, 1]
   */
  getScale?: Accessor<DataT, [number, number, number]>;
  /**
   * Translation from the anchor point, [x, y, z] in meters.
   * @default [0, 0, 0]
   */
  getTranslation?: Accessor<DataT, [number, number, number]>;
  /**
   * TransformMatrix. If specified, `getOrientation`, `getScale` and `getTranslation` are ignored.
   */
  getTransformMatrix?: Accessor<DataT, number[]>;
  /**
   * Multiplier to scale each geometry by.
   * @default 1
   */
  sizeScale?: number;
  /**
   * The minimum size in pixels for one unit of the scene.
   * @default 0
   */
  sizeMinPixels?: number;
  /**
   * The maximum size in pixels for one unit of the scene.
   * @default Number.MAX_SAFE_INTEGER
   */
  sizeMaxPixels?: number;
};

const defaultProps: DefaultProps<ScenegraphLayerProps> = {
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
  getTransformMatrix: {type: 'accessor', value: []},

  loaders: [GLTFLoader]
};

/** Render a number of instances of a complete glTF scenegraph. */
export default class ScenegraphLayer<DataT = any, ExtraPropsT extends {} = {}> extends Layer<
  ExtraPropsT & Required<_ScenegraphLayerProps<DataT>>
> {
  static defaultProps = defaultProps;
  static layerName = 'ScenegraphLayer';

  state!: {
    scenegraph: GroupNode;
    animator: GLTFAnimator;
    attributesAvailable?: boolean;
  };

  getShaders() {
    const modules = [project32, picking];

    if (this.props._lighting === 'pbr') {
      modules.push(pbr);
    }

    return super.getShaders({vs, fs, modules});
  }

  initializeState() {
    const attributeManager = this.getAttributeManager();
    // attributeManager is always defined for primitive layers
    attributeManager!.addInstanced({
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

  updateState(params: UpdateParameters<this>) {
    super.updateState(params);
    const {props, oldProps} = params;

    if (props.scenegraph !== oldProps.scenegraph) {
      this._updateScenegraph();
    } else if (props._animations !== oldProps._animations) {
      this._applyAnimationsProp(this.state.scenegraph, this.state.animator, props._animations);
    }
  }

  finalizeState(context: LayerContext) {
    super.finalizeState(context);
    this._deleteScenegraph();
  }

  private _updateScenegraph(): void {
    const props = this.props;
    const {gl} = this.context;
    let scenegraphData: any = null;
    if (props.scenegraph instanceof ScenegraphNode) {
      // Signature 1: props.scenegraph is a proper luma.gl Scenegraph
      scenegraphData = {scenes: [props.scenegraph]};
    } else if (props.scenegraph && !props.scenegraph.gltf) {
      // Converts loaders.gl gltf to luma.gl scenegraph using the undocumented @luma.gl/experimental function
      const gltf = props.scenegraph;
      const gltfObjects = createGLTFObjects(gl, gltf, this._getModelOptions());
      scenegraphData = {gltf, ...gltfObjects};

      waitForGLTFAssets(gltfObjects).then(() => this.setNeedsRedraw()); // eslint-disable-line @typescript-eslint/no-floating-promises
    } else if (props.scenegraph) {
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

  private _applyAllAttributes(scenegraph: GroupNode): void {
    if (this.state.attributesAvailable) {
      // attributeManager is always defined for primitive layers
      const allAttributes = this.getAttributeManager()!.getAttributes();
      scenegraph.traverse(model => {
        this._setModelAttributes(model.model, allAttributes);
      });
    }
  }

  private _applyAnimationsProp(
    scenegraph: GroupNode,
    animator: GLTFAnimator,
    animationsProp: any
  ): void {
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

  private _deleteScenegraph(): void {
    const {scenegraph} = this.state;
    if (scenegraph instanceof ScenegraphNode) {
      scenegraph.delete();
    }
  }

  private _getModelOptions(): any {
    const {_imageBasedLightingEnvironment} = this.props;

    let env: GLTFEnvironment | null = null;
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
        isInstanced: true,
        transpileToGLSL100: !isWebGL2(this.context.gl),
        ...this.getShaders()
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
      this.state.animator.animate(context.timeline.getTime());
      this.setNeedsRedraw();
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
          // eslint-disable-next-line camelcase
          u_Camera: model.model.getUniforms().project_uCameraPosition
        }
      });
    });
  }
}
