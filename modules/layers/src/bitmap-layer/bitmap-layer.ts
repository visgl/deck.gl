// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {
  Layer,
  _GPUVectorModel as DeckGPUVectorModel,
  color as colorModule,
  project32,
  picking,
  CoordinateSystem,
  _deepEqual as deepEqual,
  LayerProps,
  PickingInfo,
  GetPickingInfoParams,
  UpdateParameters,
  Color,
  TextureSource,
  Position,
  DefaultProps
} from '@deck.gl/core';
import {GPUVectorModel} from '@luma.gl/engine';
import {BitmapLayerMesh, hasBitmapMesh, type BitmapMeshProps} from './bitmap-layer-mesh';
import type {SamplerProps, Texture} from '@luma.gl/core';
import {lngLatToWorld} from '@math.gl/web-mercator';

import createMesh from './create-mesh';
import {getMetersPerUnit} from '../utils';

import {bitmapUniforms, BitmapProps} from './bitmap-layer-uniforms';
import source from './bitmap-layer.wgsl';
import vs from './bitmap-layer-vertex';
import fs from './bitmap-layer-fragment';

const defaultProps: DefaultProps<BitmapLayerProps> = {
  positions: {type: 'object', value: null, compare: false},
  texCoords: {type: 'object', value: null, compare: false},
  indices: {type: 'object', value: null, compare: false},
  image: {type: 'image', value: null, async: true},
  bounds: {type: 'array', value: [1, 0, 0, 1], compare: true},
  _imageCoordinateSystem: 'default',
  _projectionTolerance: {type: 'number', value: 0, min: 0},

  desaturate: {type: 'number', min: 0, max: 1, value: 0},
  // More context: because of the blending mode we're using for ground imagery,
  // alpha is not effective when blending the bitmap layers with the base map.
  // Instead we need to manually dim/blend rgb values with a background color.
  transparentColor: {type: 'color', value: [0, 0, 0, 0]},
  tintColor: {type: 'color', value: [255, 255, 255]},

  textureParameters: {type: 'object', ignore: true, value: null}
};

/** All properties supported by BitmapLayer. */
export type BitmapLayerProps = _BitmapLayerProps & LayerProps;
export type BitmapBoundingBox =
  | [left: number, bottom: number, right: number, top: number]
  | [Position, Position, Position, Position];

/** Properties added by BitmapLayer. */
type _BitmapLayerProps = BitmapMeshProps & {
  data: never;
  /**
   * The image to display.
   *
   * @default null
   */
  image?: string | TextureSource | null;

  /**
   * Supported formats:
   *  - Coordinates of the bounding box of the bitmap `[left, bottom, right, top]`
   *  - Coordinates of four corners of the bitmap, should follow the sequence of `[[left, bottom], [left, top], [right, top], [right, bottom]]`.
   *   Each position could optionally contain a third component `z`.
   * @default [1, 0, 0, 1]
   */
  bounds?: BitmapBoundingBox;

  /** Sampled mesh error in map meters for a preprojecting viewport. Zero disables refinement.
   * Preserves bilinear bounds-to-UV mapping and refines the existing resolution grid.
   * Requires finite geometry away from projection seams. Throws if refinement limits are exhausted.
   * @experimental
   * @default 0
   */
  _projectionTolerance?: number;

  /**
   * > Note: this prop is experimental.
   *
   * Specifies how image coordinates should be geographically interpreted.
   * @default 'default'
   */
  _imageCoordinateSystem?: CoordinateSystem;

  /**
   * The desaturation of the bitmap. Between `[0, 1]`.
   * @default 0
   */
  desaturate?: number;

  /**
   * The color to use for transparent pixels, in `[r, g, b, a]`.
   * @default [0, 0, 0, 0]
   */
  transparentColor?: Color;

  /**
   * The color to tint the bitmap by, in `[r, g, b]`.
   * @default [255, 255, 255]
   */
  tintColor?: Color;

  /** Customize the [texture parameters](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/texParameter). */
  textureParameters?: SamplerProps | null;
};

export type BitmapLayerPickingInfo = PickingInfo<
  null,
  {
    bitmap: {
      /** Size of the original image */
      size: {
        width: number;
        height: number;
      };
      /** Hovered pixel uv in 0-1 range */
      uv: [number, number];
      /** Hovered pixel in the original image */
      pixel: [number, number];
    } | null;
  }
>;

/** Render a bitmap at specified boundaries. */
export default class BitmapLayer<ExtraPropsT extends {} = {}> extends Layer<
  ExtraPropsT & Required<_BitmapLayerProps>
> {
  static layerName = 'BitmapLayer';
  static defaultProps = defaultProps;

  state!: {
    subdivisionStep?: number;
    disablePicking?: boolean;
    model?: GPUVectorModel;
    typedMesh?: BitmapLayerMesh;
    mesh?: any;
    coordinateConversion: number;
    bounds: [number, number, number, number];
  } & Layer['state'];

  getShaders() {
    return super.getShaders({
      vs,
      fs,
      source,
      modules: [colorModule, project32, picking, bitmapUniforms]
    });
  }

  /** Uses mesh vertices as rows for extension attributes. */
  getNumInstances(): number {
    return this.state?.typedMesh?.getVertexCount() ?? super.getNumInstances();
  }

  /** Includes pending Arrow conversion in the layer loading state. */
  get isLoaded(): boolean {
    return !this.state?.typedMesh?.loading && super.isLoaded;
  }

  /** Uses CPU mesh bounds, or the supplied footprint for GPU-only positions. */
  getBounds(): [number[], number[]] | null {
    if (!this.state?.typedMesh) return super.getBounds();
    if (this.state.typedMesh.bounds) return this.state.typedMesh.bounds;
    const {bounds} = this.props;
    if (isRectangularBounds(bounds))
      return [
        [Math.min(bounds[0], bounds[2]), Math.min(bounds[1], bounds[3]), 0],
        [Math.max(bounds[0], bounds[2]), Math.max(bounds[1], bounds[3]), 0]
      ];
    return [0, 1].map(side =>
      [0, 1, 2].map(i => Math[side ? 'max' : 'min'](...bounds.map(point => point[i] || 0)))
    ) as [number[], number[]];
  }

  /** Cancels mesh preparation and releases converted buffers on removal. */
  finalizeState(context) {
    super.finalizeState(context);
    this.state.typedMesh?.destroy();
  }

  initializeState() {
    this.initializeMeshAttributes();
  }

  private initializeMeshAttributes(): void {
    const attributeManager = this.getAttributeManager()!;

    const noAlloc = true;

    attributeManager.add({
      indices: {
        size: 1,
        isIndexed: true,
        update: attribute => (attribute.value = this.state.mesh.indices),
        noAlloc
      },
      positions: {
        size: 3,
        type: 'float64',
        fp64: this.use64bitPositions(),
        ...this.usePositionTransforms(),
        update: function (this: BitmapLayer, attribute) {
          const {positions, projectedPositions} = this.state.mesh;
          if (projectedPositions) {
            // The mesh refiner already applied modelMatrix and projection exactly once.
            attribute.value = projectedPositions;
            return;
          }
          const {transform} = attribute.settings;
          if (!transform) {
            attribute.value = positions;
            return;
          }
          // Custom updaters do not run Attribute's accessor transform. Keep the source
          // mesh untouched so projection/modelMatrix changes always start from input space.
          const projected = new Float64Array(positions.length);
          for (let i = 0; i < positions.length; i += 3) {
            projected.set(transform.call(this, positions.subarray(i, i + 3)), i);
          }
          attribute.value = projected;
        },
        noAlloc
      },
      texCoords: {
        size: 2,
        update: attribute => (attribute.value = this.state.mesh.texCoords),
        noAlloc
      }
    });
  }

  updateState(params: UpdateParameters<this>): void {
    if (hasBitmapMesh(this.props)) {
      if (this.props._projectionTolerance) {
        throw new Error('_projectionTolerance is not supported with bitmap mesh inputs');
      }
      this.updateMeshState(params);
      return;
    }
    const {props, oldProps, changeFlags} = params;
    const leavingMesh = Boolean(this.state.typedMesh);
    if (leavingMesh) {
      this.state.model?.destroy();
      this.state.typedMesh!.destroy();
      this.state.typedMesh = undefined;
      this.initializeMeshAttributes();
    }
    // setup model first
    const attributeManager = this.getAttributeManager()!;

    if (leavingMesh || changeFlags.extensionsChanged) {
      this.state.model?.destroy();
      this.state.model = this._getModel();
      attributeManager.invalidateAll();
    }

    const subdivisionStep = this.getSubdivisionStep();
    if (
      leavingMesh ||
      props.bounds !== oldProps.bounds ||
      changeFlags.projectionChanged ||
      this.state.subdivisionStep !== subdivisionStep ||
      props._projectionTolerance !== oldProps._projectionTolerance ||
      (this.state.preproject &&
        (!deepEqual(props.modelMatrix, oldProps.modelMatrix, 1) ||
          !deepEqual(props.coordinateOrigin, oldProps.coordinateOrigin, 1)))
    ) {
      const oldMesh = this.state.mesh;
      const mesh = this._createMesh();
      this.state.model!.setVertexCount(mesh.vertexCount);
      for (const key in mesh) {
        if (oldMesh && oldMesh[key] !== mesh[key]) {
          attributeManager.invalidate(key);
        }
      }
      this.setState({mesh, subdivisionStep, ...this._getCoordinateUniforms()});
    } else if (props._imageCoordinateSystem !== oldProps._imageCoordinateSystem) {
      this.setState(this._getCoordinateUniforms());
    }
  }

  /** Converts changed mesh inputs while retaining the last successful replacement. */
  private updateMeshState({props, oldProps, changeFlags}: UpdateParameters<this>): void {
    const enteringMesh = !this.state.typedMesh;
    if (enteringMesh) {
      this.getAttributeManager()!.remove(['indices', 'positions', 'texCoords']);
      this.state.typedMesh = new BitmapLayerMesh(this.context.device);
    }
    if (enteringMesh || changeFlags.extensionsChanged) {
      this.state.model?.destroy();
      this.state.model = new DeckGPUVectorModel(this.context.device, {
        ...this.getShaders(),
        id: this.props.id,
        topology: 'triangle-list',
        isInstanced: false,
        inferDrawCount: 'no',
        vertexCount: 0
      });
      this.state.typedMesh!.bind(this.state.model);
    }
    if (
      enteringMesh ||
      changeFlags.projectionChanged ||
      !deepEqual(props.modelMatrix, oldProps.modelMatrix, 1) ||
      !deepEqual(props.coordinateOrigin, oldProps.coordinateOrigin, 1) ||
      props.positions !== oldProps.positions ||
      props.texCoords !== oldProps.texCoords ||
      props.indices !== oldProps.indices
    ) {
      void this.state.typedMesh!.update(
        props,
        {
          transform: this.usePositionTransforms().transform?.bind(this),
          fp64: this.use64bitPositions()
        },
        () => {
          this.state.typedMesh!.bind(this.state.model!);
          this.getAttributeManager()!.invalidateAll();
          this.setState({coordinateConversion: 0, bounds: [0, 0, 0, 0]});
          this.setNeedsUpdate();
        },
        error => this.raiseError(error, 'preparing bitmap mesh')
      );
    }
  }

  getPickingInfo(params: GetPickingInfoParams): BitmapLayerPickingInfo {
    const {image} = this.props;
    const info = params.info as BitmapLayerPickingInfo;

    if (!info.color || !image) {
      info.bitmap = null;
      return info;
    }

    const {width, height} = image as Texture;

    // Picking color doesn't represent object index in this layer
    info.index = 0;

    // Calculate uv and pixel in bitmap
    const uv = unpackUVsFromRGB(info.color);

    info.bitmap = {
      size: {width, height},
      uv,
      pixel: [Math.floor(uv[0] * width), Math.floor(uv[1] * height)]
    };

    return info;
  }

  // Override base Layer multi-depth picking logic
  disablePickingIndex() {
    this.setState({disablePicking: true});
  }

  restorePickingColors() {
    this.setState({disablePicking: false});
  }

  protected _updateAutoHighlight(info) {
    super._updateAutoHighlight({
      ...info,
      color: this.encodePickingColor(0)
    });
  }

  protected _createMesh() {
    const {bounds} = this.props;

    let normalizedBounds = bounds;
    // bounds as [minX, minY, maxX, maxY]
    if (isRectangularBounds(bounds)) {
      /*
        (minX0, maxY3) ---- (maxX2, maxY3)
               |                  |
               |                  |
               |                  |
        (minX0, minY1) ---- (maxX2, minY1)
     */
      normalizedBounds = [
        [bounds[0], bounds[1]],
        [bounds[0], bounds[3]],
        [bounds[2], bounds[3]],
        [bounds[2], bounds[1]]
      ];
    }

    const tolerance = this.props._projectionTolerance;
    const transform = this.usePositionTransforms().transform?.bind(this);
    if (tolerance && !transform) {
      throw new Error('_projectionTolerance requires a preprojecting viewport');
    }
    const projectionToleranceScale = tolerance ? getMetersPerUnit(this.state.packedCrs) : null;
    if (tolerance && !projectionToleranceScale) {
      throw new Error('_projectionTolerance requires projected coordinates with linear units');
    }
    return createMesh(
      normalizedBounds,
      this.getSubdivisionStep(),
      tolerance ? {transform: transform!, tolerance, scale: projectionToleranceScale!} : undefined
    );
  }

  protected _getModel(): GPUVectorModel {
    /*
      0,0 --- 1,0
       |       |
      0,1 --- 1,1
    */
    const bufferLayout =
      this.context.device.type === 'webgpu'
        ? this.getAttributeManager()!
            .getBufferLayouts({isInstanced: false})
            // WebGPU index buffers are bound separately from vertex buffer layouts.
            .filter(layout => layout.name !== 'indices')
        : this.getAttributeManager()!.getBufferLayouts();

    return new DeckGPUVectorModel(this.context.device, {
      ...this.getShaders(),
      id: this.props.id,
      bufferLayout,
      topology: 'triangle-list',
      isInstanced: false
    });
  }

  draw(opts) {
    const {shaderModuleProps} = opts;
    const {model, coordinateConversion, bounds, disablePicking} = this.state;
    const {image, desaturate, transparentColor, tintColor} = this.props;

    if (shaderModuleProps.picking.isActive && disablePicking) {
      return;
    }

    // // TODO fix zFighting
    // Render the image
    if (image && model) {
      const bitmapProps: BitmapProps = {
        bitmapTexture: image as Texture,
        bounds,
        coordinateConversion,
        desaturate,
        tintColor: tintColor.slice(0, 3).map(x => x / 255) as [number, number, number],
        transparentColor: transparentColor.map(x => x / 255) as [number, number, number, number]
      };
      model.shaderInputs.setProps({bitmap: bitmapProps});
      model.draw(this.context.renderPass);
    }
  }

  _getCoordinateUniforms() {
    let {_imageCoordinateSystem: imageCoordinateSystem} = this.props;
    // Preprojection has already converted the mesh positions to common space.
    // Geographic/Mercator fragment conversions cannot use these coordinates.
    if (!this.state.preproject && imageCoordinateSystem !== 'default') {
      const {bounds} = this.props;
      if (!isRectangularBounds(bounds)) {
        throw new Error('_imageCoordinateSystem only supports rectangular bounds');
      }

      // The default behavior (linearly interpolated tex coords)
      const defaultImageCoordinateSystem =
        this.context.viewport.isGeospatial && this.context.viewport.crs?.signature !== 'OSMTile512'
          ? 'lnglat'
          : 'cartesian';
      imageCoordinateSystem = imageCoordinateSystem === 'lnglat' ? 'lnglat' : 'cartesian';

      if (imageCoordinateSystem === 'lnglat' && defaultImageCoordinateSystem === 'cartesian') {
        // LNGLAT in Mercator, e.g. display LNGLAT-encoded image in WebMercator projection
        return {coordinateConversion: -1, bounds};
      }
      if (imageCoordinateSystem === 'cartesian' && defaultImageCoordinateSystem === 'lnglat') {
        // Mercator in LNGLAT, e.g. display WebMercator encoded image in Globe projection
        const bottomLeft = lngLatToWorld([bounds[0], bounds[1]]);
        const topRight = lngLatToWorld([bounds[2], bounds[3]]);
        return {
          coordinateConversion: 1,
          bounds: [bottomLeft[0], bottomLeft[1], topRight[0], topRight[1]]
        };
      }
    }
    return {
      coordinateConversion: 0,
      bounds: [0, 0, 0, 0]
    };
  }
}

/**
 * Decode uv floats from rgb bytes where b contains 4-bit fractions of uv
 * @param {number[]} color
 * @returns {number[]} uvs
 * https://stackoverflow.com/questions/30242013/glsl-compressing-packing-multiple-0-1-colours-var4-into-a-single-var4-variab
 */
function unpackUVsFromRGB(color: Uint8Array): [number, number] {
  const [u, v, fracUV] = color;
  const vFrac = (fracUV & 0xf0) / 256;
  const uFrac = (fracUV & 0x0f) / 16;
  return [(u + uFrac) / 256, (v + vFrac) / 256];
}

function isRectangularBounds(
  bounds: [number, number, number, number] | [Position, Position, Position, Position]
): bounds is [number, number, number, number] {
  return Number.isFinite(bounds[0]);
}
