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

import {Layer} from '@deck.gl/core';
import GL from 'luma.gl/constants';
import {Model, Geometry, loadTextures} from 'luma.gl';

import BITMAP_VERTEX_SHADER from './bitmap-layer-vertex';
import BITMAP_FRAGMENT_SHADER from './bitmap-layer-fragment';

// Note: needs to match vertex shader
const MAX_BITMAPS = 11;

const defaultProps = {
  images: {type: 'array', value: []},

  desaturate: {type: 'number', min: 0, max: 1, value: 0},
  blendMode: null,
  // More context: because of the blending mode we're using for ground imagery,
  // alpha is not effective when blending the bitmap layers with the base map.
  // Instead we need to manually dim/blend rgb values with a background color.
  transparentColor: {type: 'color', value: [0, 0, 0, 0]},
  tintColor: {type: 'color', value: [255, 255, 255]},
  // accessors
  getCenter: {type: 'accessor', value: x => x.center},
  getRotation: {type: 'accessor', value: x => x.rotation}
};

/*
 * @class
 * @param {object} props
 * @param {number} props.transparentColor - color to interpret transparency to
 * @param {number} props.tintColor - color bias
 */
export default class BitmapLayer extends Layer {
  initializeState() {
    const {gl} = this.context;
    this.setState({model: this.getModel(gl)});

    const {attributeManager} = this.state;
    attributeManager.addInstanced({
      instanceCenter: {size: 3, accessor: 'getCenter'},
      instanceRotation: {size: 3, accessor: 'getRotation'},
      instanceBitmapIndex: {size: 1, update: this.calculateInstanceBitmapIndex}
    });
  }

  updateState({props, oldProps}) {
    if (props.images !== oldProps.images) {
      let changed = !oldProps.images || props.images.length !== oldProps.images.length;
      if (!changed) {
        for (let i = 0; i < props.images.length; ++i) {
          changed = changed || props.images[i] !== oldProps.images[i];
        }
      }
      if (changed) {
        this.loadMapImagesToTextures();
      }
    }
    const {desaturate} = props;
    this.state.model.setUniforms({desaturate});
  }

  getModel(gl) {
    // Two triangles making up a square to render the bitmap texture on
    const verts = [[1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0]];
    const positions = [];
    const texCoords = [];
    verts.forEach(vertex => {
      // geometry: unit square centered on origin
      positions.push(vertex[0] / 2, vertex[1] / 2, vertex[2] / 2);
      // texture: unit square with bottom left in origin
      texCoords.push(vertex[0] / 2 + 0.5, -vertex[1] / 2 + 0.5);
    });

    const model = new Model(gl, {
      id: this.props.id,
      vs: BITMAP_VERTEX_SHADER,
      fs: BITMAP_FRAGMENT_SHADER,
      shaderCache: this.context.shaderCache,
      geometry: new Geometry({
        drawMode: GL.TRIANGLES,
        vertexCount: 6,
        attributes: {
          positions: new Float32Array(positions),
          texCoords: new Float32Array(texCoords)
        }
      }),
      isInstanced: true
    });

    return model;
  }

  draw({uniforms}) {
    const {transparentColor, tintColor} = this.props;

    // TODO fix zFighting

    // Render the image
    this.state.model.render(
      Object.assign({}, uniforms, {
        transparentColor,
        tintColor
      })
    );
  }

  loadMapImagesToTextures() {
    const {model} = this.state;
    const {images} = this.props;
    for (let i = 0; i < Math.min(images.length, MAX_BITMAPS); i++) {
      loadTextures(this.context.gl, {
        urls: [images[i]]
      }).then(([texture]) => {
        return model.setUniforms({[`uBitmap${i}`]: texture});
      });
    }
  }

  getBitmapIndex(point) {
    const url = point.imageUrl;
    const idx = Math.max(this.props.images.indexOf(url), 0);
    return idx >= MAX_BITMAPS ? 0 : idx;
  }

  calculateInstanceBitmapIndex(attribute) {
    const {data} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const point of data) {
      const bitmapIndex = Number.isFinite(point.bitmapIndex)
        ? point.bitmapIndex
        : this.getBitmapIndex(point);
      value[i] = bitmapIndex;
      i += size;
    }
  }
}

BitmapLayer.layerName = 'BitmapLayer';
BitmapLayer.defaultProps = defaultProps;
