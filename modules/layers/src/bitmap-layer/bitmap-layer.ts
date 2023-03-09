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

import GL from '@luma.gl/constants';
import {
  Layer,
  project32,
  picking,
  CoordinateSystem,
  COORDINATE_SYSTEM,
  LayerProps,
  PickingInfo,
  GetPickingInfoParams,
  UpdateParameters,
  Color,
  Texture,
  Position,
  DefaultProps
} from '@deck.gl/core';
import {Model, Geometry} from '@luma.gl/core';
import {lngLatToWorld} from '@math.gl/web-mercator';

import createMesh from './create-mesh';

import vs from './bitmap-layer-vertex';
import fs from './bitmap-layer-fragment';

const defaultProps: DefaultProps<BitmapLayerProps> = {
  image: {type: 'image', value: null, async: true},
  bounds: {type: 'array', value: [1, 0, 0, 1], compare: true},
  _imageCoordinateSystem: COORDINATE_SYSTEM.DEFAULT,

  desaturate: {type: 'number', min: 0, max: 1, value: 0},
  // More context: because of the blending mode we're using for ground imagery,
  // alpha is not effective when blending the bitmap layers with the base map.
  // Instead we need to manually dim/blend rgb values with a background color.
  transparentColor: {type: 'color', value: [0, 0, 0, 0]},
  tintColor: {type: 'color', value: [255, 255, 255]},

  textureParameters: {type: 'object', ignore: true}
};

/** All properties supported by BitmapLayer. */
export type BitmapLayerProps = _BitmapLayerProps & LayerProps;
export type BitmapBoundingBox =
  | [left: number, bottom: number, right: number, top: number]
  | [Position, Position, Position, Position];

/** Properties added by BitmapLayer. */
type _BitmapLayerProps = {
  data: never;
  /**
   * The image to display.
   *
   * @default null
   */
  image?: string | Texture | null;

  /**
   * Supported formats:
   *  - Coordinates of the bounding box of the bitmap `[left, bottom, right, top]`
   *  - Coordinates of four corners of the bitmap, should follow the sequence of `[[left, bottom], [left, top], [right, top], [right, bottom]]`.
   *   Each position could optionally contain a third component `z`.
   * @default [1, 0, 0, 1]
   */
  bounds?: BitmapBoundingBox;

  /**
   * > Note: this prop is experimental.
   *
   * Specifies how image coordinates should be geographically interpreted.
   * @default COORDINATE_SYSTEM.DEFAULT
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
  textureParameters?: Record<number, number> | null;
};

/** Render a bitmap at specified boundaries. */
export default class BitmapLayer<ExtraPropsT extends {} = {}> extends Layer<
  ExtraPropsT & Required<_BitmapLayerProps>
> {
  static layerName = 'BitmapLayer';
  static defaultProps = defaultProps;

  state!: Layer['state'] & {
    disablePicking?: boolean;
    model?: Model;
    mesh?: any;
    coordinateConversion?: number;
    bounds?: number[];
  };

  getShaders() {
    return super.getShaders({vs, fs, modules: [project32, picking]});
  }

  initializeState() {
    const attributeManager = this.getAttributeManager()!;

    attributeManager.remove(['instancePickingColors']);
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
        type: GL.DOUBLE,
        fp64: this.use64bitPositions(),
        update: attribute => (attribute.value = this.state.mesh.positions),
        noAlloc
      },
      texCoords: {
        size: 2,
        update: attribute => (attribute.value = this.state.mesh.texCoords),
        noAlloc
      }
    });
  }

  updateState({props, oldProps, changeFlags}: UpdateParameters<this>): void {
    // setup model first
    const attributeManager = this.getAttributeManager()!;

    if (changeFlags.extensionsChanged) {
      const {gl} = this.context;
      this.state.model?.delete();
      this.state.model = this._getModel(gl);
      attributeManager.invalidateAll();
    }

    if (props.bounds !== oldProps.bounds) {
      const oldMesh = this.state.mesh;
      const mesh = this._createMesh();
      this.state.model.setVertexCount(mesh.vertexCount);
      for (const key in mesh) {
        if (oldMesh && oldMesh[key] !== mesh[key]) {
          attributeManager.invalidate(key);
        }
      }
      this.setState({mesh, ...this._getCoordinateUniforms()});
    } else if (props._imageCoordinateSystem !== oldProps._imageCoordinateSystem) {
      this.setState(this._getCoordinateUniforms());
    }
  }

  getPickingInfo(params: GetPickingInfoParams): PickingInfo {
    const {image} = this.props;
    const info: PickingInfo & {bitmap?: any} = params.info;

    if (!info.color || !image) {
      info.bitmap = null;
      return info;
    }

    const {width, height} = image as Texture;

    // Picking color doesn't represent object index in this layer
    info.index = 0;

    // Calculate uv and pixel in bitmap
    const uv = unpackUVsFromRGB(info.color);

    const pixel = [Math.floor(uv[0] * (width as number)), Math.floor(uv[1] * (height as number))];

    info.bitmap = {
      size: {width, height}, // Size of bitmap
      uv, // Floating point precision in 0-1 range
      pixel // Truncated to integer and scaled to pixel size
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

    return createMesh(normalizedBounds, this.context.viewport.resolution);
  }

  protected _getModel(gl: WebGLRenderingContext): Model {
    if (!gl) {
      return null;
    }

    /*
      0,0 --- 1,0
       |       |
      0,1 --- 1,1
    */
    return new Model(gl, {
      ...this.getShaders(),
      id: this.props.id,
      geometry: new Geometry({
        drawMode: GL.TRIANGLES,
        vertexCount: 6
      }),
      isInstanced: false
    });
  }

  draw(opts) {
    const {uniforms, moduleParameters} = opts;
    const {model, coordinateConversion, bounds, disablePicking} = this.state;
    const {image, desaturate, transparentColor, tintColor} = this.props;

    if (moduleParameters.pickingActive && disablePicking) {
      return;
    }

    // // TODO fix zFighting
    // Render the image
    if (image && model) {
      model
        .setUniforms(uniforms)
        .setUniforms({
          bitmapTexture: image,
          desaturate,
          transparentColor: transparentColor.map(x => x / 255),
          tintColor: tintColor.slice(0, 3).map(x => x / 255),
          coordinateConversion,
          bounds
        })
        .draw();
    }
  }

  _getCoordinateUniforms() {
    const {LNGLAT, CARTESIAN, DEFAULT} = COORDINATE_SYSTEM;
    let {_imageCoordinateSystem: imageCoordinateSystem} = this.props;
    if (imageCoordinateSystem !== DEFAULT) {
      const {bounds} = this.props;
      if (!isRectangularBounds(bounds)) {
        throw new Error('_imageCoordinateSystem only supports rectangular bounds');
      }

      // The default behavior (linearly interpolated tex coords)
      const defaultImageCoordinateSystem = this.context.viewport.resolution ? LNGLAT : CARTESIAN;
      imageCoordinateSystem = imageCoordinateSystem === LNGLAT ? LNGLAT : CARTESIAN;

      if (imageCoordinateSystem === LNGLAT && defaultImageCoordinateSystem === CARTESIAN) {
        // LNGLAT in Mercator, e.g. display LNGLAT-encoded image in WebMercator projection
        return {coordinateConversion: -1, bounds};
      }
      if (imageCoordinateSystem === CARTESIAN && defaultImageCoordinateSystem === LNGLAT) {
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
function unpackUVsFromRGB(color) {
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
