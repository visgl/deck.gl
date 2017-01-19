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

import {Layer} from '../../../lib';
import {assembleShaders, lightingSetUniforms} from '../../../shader-utils';
import CircleGeometry from './circle';
import {GL, Model, Geometry, SphereGeometry} from 'luma.gl';
import {readFileSync} from 'fs';
import {join} from 'path';

const DEFAULT_RADIUS = 30;
const DEFAULT_COLOR = [255, 0, 255, 255];

const defaultGetPosition = x => x.position;
const defaultGetRadius = x => x.radius || DEFAULT_RADIUS;
const defaultGetColor = x => x.color || DEFAULT_COLOR;

const defaultProps = {
  getPosition: defaultGetPosition,
  getRadius: defaultGetRadius,
  getColor: defaultGetColor,
  radius: 30,  //  point radius in meters
  radiusMinPixels: 0, //  min point radius in pixels
  radiusMaxPixels: Number.MAX_SAFE_INTEGER, // max point radius in pixels
  drawOutline: false,
  strokeWidth: 1,
  geometry: 'sphere'
};

export default class ScatterplotLayer extends Layer {
  constructor(props) {
    super(Object.assign({}, defaultProps, props));
  }

  getShaders(id) {
    return {
      vs: readFileSync(join(__dirname, './scatterplot-layer-vertex.glsl'), 'utf8'),
      fs: readFileSync(join(__dirname, './scatterplot-layer-fragment.glsl'), 'utf8'),
      lighting: true
    };
  }

  initializeState() {
    /* eslint-disable */
    const {gl} = this.context;
    const model = this._getModel(gl);
    this.setState({model});

    const {attributeManager} = this.state;
    attributeManager.addInstanced({
      instancePositions: {size: 3, update: this.calculateInstancePositions},
      instanceRadius: {size: 1, update: this.calculateInstanceRadius},
      instanceColors: {size: 4, type: GL.UNSIGNED_BYTE, update: this.calculateInstanceColors}
    });
  }

  updateState({props, oldProps}) {
    if (props.drawOutline !== oldProps.drawOutline && props.geometry === 'circle') {
      // TODO - this may only work on circle geometries
      // We should probably maintain two primitives to handle outlines
      this.state.model.geometry.drawMode =
        props.drawOutline ? GL.LINE_LOOP : GL.TRIANGLE_FAN;
    }
    lightingSetUniforms(this, props);
  }

  draw({uniforms}) {
    const {gl} = this.context;
    const lineWidth = this.screenToDevicePixels(this.props.strokeWidth);
    gl.lineWidth(lineWidth);
    this.state.model.render(Object.assign({}, uniforms, {
      radius: this.props.radius,
      radiusMinPixels: this.props.radiusMinPixels,
      radiusMaxPixels: this.props.radiusMaxPixels
    }));
    // Setting line width back to 1 is here to workaround a Google Chrome bug
    // gl.clear() and gl.isEnabled() will return GL_INVALID_VALUE even with
    // correct parameter
    // This is not happening on Safari and Firefox
    gl.lineWidth(1.0);
  }

  _getModel(gl) {
    const shaders = assembleShaders(gl, this.getShaders());
    return new Model({
      gl,
      id: this.props.id,
      vs: shaders.vs,
      fs: shaders.fs,
      geometry: this._getGeometry(),
      isInstanced: true
    });
  }

  // At the moment, geometry prop is only checked on layer creation
  _getGeometry() {
    switch (this.props.geometry) {
    case 'circle': return new CircleGeometry();
    case 'sphere': return new SphereGeometry();
    default:
      // allow app to pass any luma.gl Geometry instance
      assert(geometry instanceof Geometry, 'invalid geometry prop');
      return geometry;
    }
  }

  calculateInstancePositions(attribute) {
    const {data, getPosition} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const point of data) {
      const position = getPosition(point);
      value[i + 0] = position[0] || 0;
      value[i + 1] = position[1] || 0;
      value[i + 2] = position[2] || 0;
      i += size;
    }
  }

  calculateInstanceRadius(attribute) {
    const {data, getRadius} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const point of data) {
      const radius = getRadius(point);
      value[i + 0] = isNaN(radius) ? 1 : radius;
      i += size;
    }
  }

  calculateInstanceColors(attribute) {
    const {data, getColor} = this.props;
    const {value, size} = attribute;
    let i = 0;
    for (const point of data) {
      const color = getColor(point);
      value[i + 0] = color[0] || 0;
      value[i + 1] = color[1] || 0;
      value[i + 2] = color[2] || 0;
      value[i + 3] = isNaN(color[3]) ? DEFAULT_COLOR[3] : color[3];
      i += size;
    }
  }
}

ScatterplotLayer.layerName = 'ScatterplotLayer';
