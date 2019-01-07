// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
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

import {Layer} from '@deck.gl/layers';
import GL from 'luma.gl/constants';
import {Model, Geometry, Texture2D} from 'luma.gl';

import BITMAP_VERTEX_SHADER from './bitmap-layer-vertex.glsl';
import BITMAP_FRAGMENT_SHADER from './bitmap-layer-fragment.glsl';

// Note: needs to match vertex shader
const MAX_BITMAPS = 11;

function degreeToRadian(degree) {
  return degree * (Math.PI / 180);
}

// Save a global timestamp and subtract it from all times to avoid
// loss of precision during subtraction
const globalTimestamp = new Date();

const defaultProps = {
  // core props
  images: [],
  imageSize: [1, 1],
  desaturate: 0,
  scale: 1,
  // animation props
  time: 0,
  angularVelocityMultiplier: 1,
  // accessors (angles are degrees)
  getPosition: x => x.position,
  getOffset: x => x.offset || [0, 0],
  getStartAngle: x => 0,
  getEndAngle: x => 0,
  getStartTime: x => globalTimestamp,
  getEndTime: x => globalTimestamp + 1
};

export default class BitmapLayer extends Layer {
  getShaders() {
    return {
      vs: BITMAP_VERTEX_SHADER,
      fs: BITMAP_FRAGMENT_SHADER,
      modules: ['picking']
    };
  }

  initializeState() {
    const {gl} = this.context;
    this.setState({model: this.getModel(gl)});

    const attributeManager = this.getAttributeManager();
    attributeManager.addInstanced({
      instancePositions: {size: 4, update: this.calculateInstancePositions},
      instanceAngle: {size: 2, update: this.calculateInstanceAngle},
      instanceTimes: {size: 2, update: this.calculateInstanceTimes},
      instanceBitmapType: {size: 1, update: this.calculateInstanceBitmapType}
    });

    this.loadMapImagesToTextures();
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
    this.calculateRadius();
    const {imageSize, desaturate} = props;
    const {model} = this.state;
    model.setUniforms({imageSize, desaturate});
  }

  calculateRadius(props) {
    // use scale if specified
    if (this.props.scale) {
      this.state.scale = this.props.scale;
      return;
    }

    const pixel0 = this.project([-122, 37.5]);
    const pixel1 = this.project([-122, 37.5006]);

    const dx = pixel0[0] - pixel1[0];
    const dy = pixel0[1] - pixel1[1];

    this.state.scale = Math.sqrt(dx * dx + dy * dy);
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

    const model = new Model(
      gl,
      Object.assign({}, this.getShaders(), {
        id: this.props.id,
        geometry: new Geometry({
          drawMode: GL.TRIANGLES,
          positions: new Float32Array(positions),
          texCoords: new Float32Array(texCoords)
        }),
        isInstanced: true
      })
    );

    return model;
  }

  loadTexture(gl, model, bitmapName, filename) {
    /* global Image */
    const image = new Image();
    image.crossOrigin = 'Anonymous';
    image.onload = () => {
      model.setUniforms({
        [bitmapName]: new Texture2D(gl, {
          unpackFlipY: false
        }).setImageData({data: image})
      });
    };
    image.onerror = (error = '') => {
      throw new Error(`Could not load texture ${bitmapName} from ${image.src} ${error}`);
    };
    image.crossOrigin = 'Anonymous';
    image.src = filename;
  }

  loadMapImagesToTextures() {
    const {gl} = this.context;
    const {model} = this.state;
    for (let i = 0; i < MAX_BITMAPS; i++) {
      const image = this.props.images[i];
      if (typeof image === 'string') {
        // Url, load the image
        this.loadTexture(gl, model, `uBitmap${i}`, image);
      } else if (image instanceof Texture2D) {
        model.setUniforms({[`uBitmap${i}`]: image});
      } else {
        model.setUniforms({[`uBitmap${i}`]: new Texture2D(gl)});
      }
    }
  }

  getBitmapType(point) {
    const url = point.imageUrl;
    const idx = Math.max(this.props.images.indexOf(url), 0);
    return idx >= MAX_BITMAPS ? 0 : idx;
  }

  calculateInstancePositions(attribute, props) {
    const {data, getPosition, getOffset} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const point of data) {
      const position = getPosition(point);
      const offset = getOffset(point);
      value[i + 0] = position[0] || 0;
      value[i + 1] = position[1] || 0;
      value[i + 2] = offset[0] || 0;
      value[i + 3] = offset[1] || 0;
      i += size;
    }
  }

  calculateInstanceTimes(attribute) {
    const {data, getStartTime, getEndTime} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const point of data) {
      const startTime = getStartTime(point);
      const endTime = getEndTime(point);
      value[i + 0] = startTime - globalTimestamp;
      value[i + 1] = endTime - globalTimestamp;
      i += size;
    }
  }

  calculateInstanceAngle(attribute) {
    const {data, getStartAngle, getEndAngle} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const point of data) {
      const startAngle = getStartAngle(point);
      const endAngle = getEndAngle(point);
      value[i + 0] = -degreeToRadian(startAngle);
      value[i + 1] = -degreeToRadian(endAngle);
      i += size;
    }
  }

  calculateInstanceBitmapType(attribute) {
    const {data} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const point of data) {
      const bitmapType = Number.isFinite(point.bitmapType)
        ? point.bitmapType
        : this.getBitmapType(point);
      value[i] = bitmapType;
      i += size;
    }
  }
}

BitmapLayer.layerName = 'BitmapLayer';
BitmapLayer.defaultProps = defaultProps;
