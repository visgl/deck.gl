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
import {Layer, project32, picking, COORDINATE_SYSTEM} from '@deck.gl/core';
import {Model, Geometry} from '@luma.gl/core';
import {lngLatToWorld} from '@math.gl/web-mercator';

import createMesh from './create-mesh';

import vs from './bitmap-layer-vertex';
import fs from './bitmap-layer-fragment';

const defaultProps = {
  image: {type: 'image', value: null, async: true},
  bounds: {type: 'array', value: [1, 0, 0, 1], compare: true},
  _imageCoordinateSystem: COORDINATE_SYSTEM.DEFAULT,

  desaturate: {type: 'number', min: 0, max: 1, value: 0},
  // More context: because of the blending mode we're using for ground imagery,
  // alpha is not effective when blending the bitmap layers with the base map.
  // Instead we need to manually dim/blend rgb values with a background color.
  transparentColor: {type: 'color', value: [0, 0, 0, 0]},
  tintColor: {type: 'color', value: [255, 255, 255]}
};

/*
 * @class
 * @param {object} props
 * @param {number} props.transparentColor - color to interpret transparency to
 * @param {number} props.tintColor - color bias
 */
export default class BitmapLayer extends Layer {
  getShaders() {
    return super.getShaders({vs, fs, modules: [project32, picking]});
  }

  initializeState() {
    const attributeManager = this.getAttributeManager();

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

  updateState({props, oldProps, changeFlags}) {
    // setup model first
    if (changeFlags.extensionsChanged) {
      const {gl} = this.context;
      this.state.model?.delete();
      this.state.model = this._getModel(gl);
      this.getAttributeManager().invalidateAll();
    }

    const attributeManager = this.getAttributeManager();

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

  getPickingInfo({info}) {
    const {image} = this.props;

    if (!info.color || !image) {
      info.bitmap = null;
      return info;
    }

    const {width, height} = image;

    // Picking color doesn't represent object index in this layer
    info.index = 0;

    // Calculate uv and pixel in bitmap
    const uv = unpackUVsFromRGB(info.color);

    const pixel = [Math.floor(uv[0] * width), Math.floor(uv[1] * height)];

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

  _updateAutoHighlight(info) {
    super._updateAutoHighlight({
      ...info,
      color: this.encodePickingColor(0)
    });
  }

  _createMesh() {
    const {bounds} = this.props;

    let normalizedBounds = bounds;
    // bounds as [minX, minY, maxX, maxY]
    if (Number.isFinite(bounds[0])) {
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

  _getModel(gl) {
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
      if (!Number.isFinite(bounds[0])) {
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

BitmapLayer.layerName = 'BitmapLayer';
BitmapLayer.defaultProps = defaultProps;

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
