// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {FixedSizeList, Float, Int} from 'apache-arrow';

import {
  Layer,
  project32,
  color,
  picking,
  log,
  _LayerColumns as LayerColumns,
  _deepEqual as deepEqual
} from '@deck.gl/core';
import {type Device, type RenderPipelineParameters} from '@luma.gl/core';
import {pbrMaterial} from '@luma.gl/shaders';
import {ScenegraphNode, GroupNode, ModelNode, Model} from '@luma.gl/engine';
import {
  GLTFAnimator,
  PBREnvironment,
  createScenegraphsFromGLTF,
  postProcessGLTF
} from '@luma.gl/engine/gltf';
import {GLTFLoader} from '@loaders.gl/scene/gltf';
import {waitForGLTFAssets} from './gltf-utils';

import {
  MESH_COLUMN_DEFINITIONS as COLUMN_DEFINITIONS,
  prepareMeshColumnTransforms,
  TRANSFORM_ACCESSORS
} from '../utils/mesh-columns';
import type {GPUVector} from '@luma.gl/graph/gpu-data';
import {MATRIX_ATTRIBUTES, shouldComposeModelMatrix} from '../utils/matrix';

import {scenegraphUniforms, ScenegraphProps} from './scenegraph-layer-uniforms';
import vs from './scenegraph-layer-vertex.glsl';
import fs from './scenegraph-layer-fragment.glsl';
import source from './scenegraph-layer.wgsl';
import {scenegraphPbrMaterial} from './scenegraph-pbr-material';

import {
  UpdateParameters,
  LayerContext,
  LayerProps,
  LayerDataSource,
  Position,
  Color,
  Accessor,
  ArrowAccessor,
  DefaultProps
} from '@deck.gl/core';

type GLTFInstantiatorOptions = Parameters<typeof createScenegraphsFromGLTF>[2];

const DEFAULT_COLOR = [255, 255, 255, 255] as const;

export type ScenegraphLayerProps<DataT = unknown> = _ScenegraphLayerProps<DataT> & LayerProps;

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
    context: {device?: Device; layer: ScenegraphLayer<DataT>}
  ) => GroupNode;
  /**
   * Create a luma.gl GLTFAnimator from the resolved scenegraph prop
   */
  getAnimator?: (
    scenegraph: any,
    context: {device?: Device; layer: ScenegraphLayer<DataT>}
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
    | PBREnvironment
    | ((context: {
        device?: Device;
        /** @deprecated Use `device.handle`. */
        gl?: WebGL2RenderingContext;
        layer: ScenegraphLayer<DataT>;
      }) => PBREnvironment);

  /** @experimental GPU-resident column. */
  positions?: GPUVector | null;
  /** @experimental GPU-resident column. */
  colors?: GPUVector | null;
  /** Anchor position constant, callback, or Arrow XY/XYZ column. */
  getPosition?: ArrowAccessor<DataT, Position, FixedSizeList<Int | Float>>;
  /** Color value or accessor.
   * Accepts a constant, row callback, or numeric Arrow column.
   * @default [255, 255, 255, 255]
   */
  getColor?: ArrowAccessor<DataT, Color, FixedSizeList<Int | Float>>;
  /**
   * Orientation in [pitch, yaw, roll] in degrees.
   * @see https://en.wikipedia.org/wiki/Euler_angles
   * @default [0, 0, 0]
   */
  getOrientation?: Accessor<DataT, Readonly<[number, number, number]>>;
  /**
   * Scaling factor of the model along each axis.
   * @default [1, 1, 1]
   */
  getScale?: Accessor<DataT, Readonly<[number, number, number]>>;
  /**
   * Translation from the anchor point, [x, y, z] in meters.
   * @default [0, 0, 0]
   */
  getTranslation?: Accessor<DataT, Readonly<[number, number, number]>>;
  /**
   * TransformMatrix. If specified, `getOrientation`, `getScale` and `getTranslation` are ignored.
   */
  getTransformMatrix?: Accessor<DataT, number[]>;
  /**
   * Called after the layer has rendered for the first time.
   * Used by Tile3DLayer to signal that a tile's sublayer is visible,
   * allowing parent tiles to be safely deselected during transitions.
   */
  onFirstDraw?: () => void;
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

  onFirstDraw: {type: 'function', value: () => {}},
  sizeScale: {type: 'number', value: 1, min: 0},
  sizeMinPixels: {type: 'number', min: 0, value: 0},
  sizeMaxPixels: {type: 'number', min: 0, value: Number.MAX_SAFE_INTEGER},

  positions: {type: 'object', value: null, optional: true},
  colors: {type: 'object', value: null, optional: true},
  getPosition: {type: 'accessor', arrow: true, value: (x: any) => x.position},
  getColor: {type: 'accessor', arrow: true, value: DEFAULT_COLOR},

  // flat or pbr
  _lighting: 'flat',
  // _lighting must be pbr for this to work
  _imageBasedLightingEnvironment: undefined,

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
    columns?: LayerColumns;
    scenegraph: GroupNode | null;
    animator: GLTFAnimator | null;
    materials?: {destroy(): void}[] | null;
    models: Model[];
    firstDrawSignaled: boolean;
  } & Layer['state'];

  getShaders() {
    const defines: {LIGHTING_PBR?: 1} = {};
    let pbr;
    const isWebGPU = this.context.device?.type === 'webgpu';

    if (this.props._lighting === 'pbr') {
      // The stock pbrMaterial module supplies the existing GLSL PBR path.
      // WebGPU uses a Scenegraph-specific wrapper because its WGSL source must
      // adapt the PBR position/normal inputs and camera binding to deck.gl's
      // project module.
      pbr = isWebGPU ? scenegraphPbrMaterial : pbrMaterial;
      defines.LIGHTING_PBR = 1;
    } else if (isWebGPU) {
      // The flat WGSL path can still sample a glTF base-color texture, so it
      // needs the Scenegraph PBR module's sampler bindings even though
      // LIGHTING_PBR is not enabled.
      pbr = scenegraphPbrMaterial;
    } else {
      // The flat GLSL shader declares pbr_baseColorSampler itself. Register a
      // name-only module so the glTF material binding is still routed to that
      // sampler without injecting the full PBR lighting module.
      pbr = {name: 'pbrMaterial'};
    }

    const modules = [project32, color, picking, scenegraphUniforms, pbr];
    return super.getShaders({defines, vs, fs, source, modules});
  }

  initializeState() {
    const attributeManager = this.getAttributeManager();
    const supportsTransitions = this.context.device.type !== 'webgpu';
    // attributeManager is always defined for primitive layers
    attributeManager!.addInstanced({
      instancePositions: {
        size: 3,
        type: 'float64',
        fp64: this.use64bitPositions(),
        ...this.usePositionTransforms(),
        accessor: 'getPosition',
        transition: supportsTransitions
      },
      instanceColors: {
        type: 'unorm8',
        size: this.props.colorFormat.length,
        accessor: 'getColor',
        defaultValue: DEFAULT_COLOR,
        transition: supportsTransitions
      },
      instanceModelMatrix: MATRIX_ATTRIBUTES
    });
  }

  updateState(params: UpdateParameters<this>) {
    super.updateState(params);
    const {props, oldProps} = params;

    this.updateColumns(params);

    if (props.scenegraph !== oldProps.scenegraph) {
      this._updateScenegraph();
    } else if (props._animations !== oldProps._animations) {
      this._applyAnimationsProp(this.state.animator, props._animations);
    }
  }

  finalizeState(context: LayerContext) {
    this.state.columns?.destroy();
    super.finalizeState(context);
    this._destroyScenegraphAssets();
  }

  get isLoaded(): boolean {
    return Boolean(this.state?.scenegraph && !this.state.columns?.loading && super.isLoaded);
  }

  /** Uses the prepared column length when callers omit an explicit instance count. */
  override getNumInstances(): number {
    return this.state?.columns && !Number.isFinite(this.props.numInstances)
      ? this.state.columns.length
      : super.getNumInstances();
  }

  /** Uses converted positions for bounds while columns are active. */
  override getBounds() {
    return this.state?.columns ? this.state.columns.getBounds() : super.getBounds();
  }

  /** Converts instance columns independently of glTF assets and animation. */
  private updateColumns(params: UpdateParameters<this>): void {
    if (!Object.keys(this.resolveColumns(COLUMN_DEFINITIONS)).length) {
      if (!this.state.columns) return;
      this.state.columns.destroy();
      this.state.columns = undefined;
      this.internalState!.attributeManager = this._getAttributeManager();
      this.initializeState();
      return;
    }
    if (this.props.extensions.length || Object.keys(this.props.transitions || {}).length) {
      throw new Error('Scenegraph columns do not support extensions or transitions');
    }
    if (!this.state.columns) {
      this.internalState!.attributeManager?.finalize();
      this.internalState!.attributeManager = null;
      this.state.columns = new LayerColumns(this.context.device, COLUMN_DEFINITIONS, 'Scenegraph');
    }
    const transformsChanged = TRANSFORM_ACCESSORS.some(
      name =>
        !deepEqual(params.props[name], params.oldProps[name], 1) &&
        (typeof params.props[name] !== 'function' || typeof params.oldProps[name] !== 'function')
    );
    void this.state.columns.updateIfNeeded(
      {
        ...params,
        changeFlags: {
          ...params.changeFlags,
          dataChanged:
            params.changeFlags.dataChanged || (transformsChanged ? 'transforms changed' : false)
        }
      },
      {
        dataLoading: this.internalState!.isAsyncPropLoading('data'),
        changed: () => {
          this.setState({});
          this.setNeedsUpdate();
        },
        failed: error => this.raiseError(error, 'converting scenegraph columns'),
        prepareFallbacks: (rows, length, own) =>
          prepareMeshColumnTransforms(this.context.device, this.props, rows, length, own),
        positionOptions: {
          transform: this.usePositionTransforms().transform?.bind(this),
          fp64: this.use64bitPositions()
        }
      }
    );
  }

  private _updateScenegraph(): void {
    const props = this.props;
    const {device} = this.context;
    let scenegraphData: any = null;
    if (props.scenegraph instanceof ScenegraphNode) {
      // Signature 1: props.scenegraph is a proper luma.gl Scenegraph
      scenegraphData = {scenes: [props.scenegraph]};
    } else if (props.scenegraph && typeof props.scenegraph === 'object') {
      // Converts loaders.gl glTF data to a luma.gl scenegraph.
      const gltf = props.scenegraph;

      // Tiles3DLoader already processes GLTF
      const processedGLTF = gltf.json ? postProcessGLTF(gltf) : gltf;

      const gltfObjects = createScenegraphsFromGLTF(device, processedGLTF, this._getModelOptions());
      scenegraphData = gltfObjects;

      waitForGLTFAssets(gltfObjects)
        .then(() => this.setNeedsRedraw())
        .catch(ex => {
          this.raiseError(ex, 'loading glTF');
        });
    }

    const options = {layer: this, device: this.context.device};
    const scenegraph = props.getScene(scenegraphData, options);
    const animator = props.getAnimator(scenegraphData, options);

    if (scenegraph instanceof GroupNode) {
      this._destroyScenegraphAssets();

      this._applyAnimationsProp(animator, props._animations);

      const models: Model[] = [];
      scenegraph.traverse(node => {
        if (node instanceof ModelNode) {
          models.push(node.model);
        }
      });

      this.setState({
        scenegraph,
        animator,
        materials: scenegraphData?.materials || null,
        models,
        firstDrawSignaled: false
      });
      this.getAttributeManager()?.invalidateAll();
    } else if (scenegraph !== null) {
      log.warn('invalid scenegraph:', scenegraph)();
    }
  }

  private _destroyScenegraphAssets(): void {
    this.state.scenegraph?.destroy();
    this.state.materials?.forEach(material => material.destroy());
    this.state.scenegraph = null;
    this.state.animator = null;
    this.state.materials = null;
    this.state.models = [];
  }

  private _applyAnimationsProp(animator: GLTFAnimator | null, animationsProp: any): void {
    if (!animator || !animationsProp) {
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
          const findResult = animations.find(({animation}) => animation.name === key);
          if (findResult) {
            Object.assign(findResult, value);
          } else {
            log.warn(`animation ${key} not found`)();
          }
        }
      });
  }

  private _getModelOptions(): GLTFInstantiatorOptions {
    const {_imageBasedLightingEnvironment} = this.props;

    let env: PBREnvironment | undefined;
    if (_imageBasedLightingEnvironment) {
      if (typeof _imageBasedLightingEnvironment === 'function') {
        env = _imageBasedLightingEnvironment({
          device: this.context.device,
          gl: this.context.gl,
          layer: this
        });
      } else {
        env = _imageBasedLightingEnvironment;
      }
    }

    const parameters =
      this.context.device.type === 'webgpu'
        ? ({
            depthWriteEnabled: true,
            depthCompare: 'less-equal'
          } satisfies RenderPipelineParameters)
        : undefined;

    return {
      imageBasedLightingEnvironment: env,
      modelOptions: {
        id: this.props.id,
        isInstanced: true,
        bufferLayout:
          this.state.columns?.getBufferLayouts() ?? this.getAttributeManager()!.getBufferLayouts(),
        parameters,
        ...this.getShaders()
      },
      // tangents are not supported
      useTangents: false
    };
  }

  draw({context}) {
    if (!this.state.scenegraph || (this.state.columns?.loading && !this.state.columns.length))
      return;

    if (this.props._animations && this.state.animator) {
      this.state.animator.setTime(context.timeline.getTime());
      this.setNeedsRedraw();
    }

    const {viewport, renderPass} = this.context;
    const {sizeScale, sizeMinPixels, sizeMaxPixels, coordinateSystem} = this.props;
    const pbrProjectionProps = {
      camera: viewport.cameraPosition as [number, number, number]
    };

    const numInstances = this.getNumInstances();
    this.state.scenegraph.traverse((node, {worldMatrix}) => {
      if (node instanceof ModelNode) {
        const {model} = node;
        model.setInstanceCount(numInstances);

        const scenegraphProps: ScenegraphProps = {
          rowIndexOffset: 0,
          sizeScale,
          sizeMinPixels,
          sizeMaxPixels,
          composeModelMatrix: shouldComposeModelMatrix(
            viewport,
            this.state.sourceCrs?.signature || coordinateSystem,
            Boolean(this.state.preproject)
          )
            ? 1
            : 0,
          sceneModelMatrix: worldMatrix
        };

        model.shaderInputs.setProps({
          pbrProjection: pbrProjectionProps,
          scenegraph: scenegraphProps
        });
        if (this.state.columns) {
          this.state.columns.draw(model, renderPass, (offset, rowCount) => {
            model.setInstanceCount(Math.min(rowCount, Math.max(0, numInstances - offset)));
            model.shaderInputs.setProps({scenegraph: {rowIndexOffset: offset}});
          });
        } else {
          model.draw(renderPass);
        }
      }
    });

    if (!this.state.firstDrawSignaled) {
      this.state.firstDrawSignaled = true;
      this.props.onFirstDraw?.();
    }
  }
}
