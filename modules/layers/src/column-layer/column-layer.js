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

import {Layer, log, createIterable} from '@deck.gl/core';
import GL from '@luma.gl/constants';
import {Model, CylinderGeometry, fp64, PhongMaterial} from '@luma.gl/core';
const {fp64LowPart} = fp64;
const defaultMaterial = new PhongMaterial();

import vs from './column-layer-vertex.glsl';
import fs from './column-layer-fragment.glsl';

const DEFAULT_COLOR = [255, 0, 255, 255];

const defaultProps = {
  diskResolution: {type: 'number', min: 4, value: 20},
  vertices: null,
  radius: {type: 'number', min: 0, value: 1000},
  angle: {type: 'number', value: 0},
  offset: {type: 'array', value: [0, 0]},
  coverage: {type: 'number', min: 0, max: 1, value: 1},
  elevationScale: {type: 'number', min: 0, value: 1},
  extruded: true,
  fp64: false,

  getPosition: {type: 'accessor', value: x => x.position},
  getColor: {type: 'accessor', value: DEFAULT_COLOR},
  getElevation: {type: 'accessor', value: 1000},

  material: defaultMaterial
};

export default class ColumnLayer extends Layer {
  getShaders() {
    const projectModule = this.use64bitProjection() ? 'project64' : 'project32';
    return {vs, fs, modules: [projectModule, 'gouraud-lighting', 'picking']};
  }

  /**
   * DeckGL calls initializeState when GL context is available
   * Essentially a deferred constructor
   */
  initializeState() {
    const attributeManager = this.getAttributeManager();
    /* eslint-disable max-len */
    attributeManager.addInstanced({
      instancePositions: {
        size: 3,
        transition: true,
        accessor: 'getPosition'
      },
      instanceElevations: {
        size: 1,
        transition: true,
        accessor: 'getElevation'
      },
      instancePositions64xyLow: {
        size: 2,
        accessor: 'getPosition',
        update: this.calculateInstancePositions64xyLow
      },
      instanceColors: {
        size: 4,
        type: GL.UNSIGNED_BYTE,
        transition: true,
        accessor: 'getColor',
        defaultValue: DEFAULT_COLOR
      }
    });
    /* eslint-enable max-len */
  }

  updateState({props, oldProps, changeFlags}) {
    super.updateState({props, oldProps, changeFlags});
    if (props.fp64 !== oldProps.fp64 || props.diskResolution !== oldProps.diskResolution) {
      const {gl} = this.context;
      if (this.state.model) {
        this.state.model.delete();
      }
      this.setState({model: this._getModel(gl)});
      this.getAttributeManager().invalidateAll();
    }

    if (props.vertices !== oldProps.vertices) {
      this._updateVertices(props.vertices);
    }
  }

  getGeometry(diskResolution) {
    return new CylinderGeometry({
      radius: 1,
      topCap: false,
      bottomCap: true,
      height: 2,
      verticalAxis: 'z',
      nradial: diskResolution,
      nvertical: 1
    });
  }

  _getModel(gl) {
    return new Model(
      gl,
      Object.assign({}, this.getShaders(), {
        id: this.props.id,
        geometry: this.getGeometry(this.props.diskResolution),
        isInstanced: true,
        shaderCache: this.context.shaderCache
      })
    );
  }

  _updateVertices(vertices) {
    if (!vertices) {
      return;
    }

    const {diskResolution} = this.props;
    log.assert(vertices.length >= diskResolution);

    const {model} = this.state;
    const geometry = this.getGeometry(this.props.diskResolution);
    const positions = geometry.attributes.POSITION;
    let i = 0;
    for (let loopIndex = 0; loopIndex < 3; loopIndex++) {
      for (let j = 0; j <= diskResolution; j++) {
        const p = vertices[j] || vertices[0]; // auto close loop
        // replace x and y in geometry
        positions.value[i++] = p[0];
        positions.value[i++] = p[1];
        i++;
      }
    }
    model.setProps({geometry});
  }

  draw({uniforms}) {
    const {elevationScale, extruded, offset, coverage, radius, angle} = this.props;

    this.state.model
      .setUniforms(
        Object.assign({}, uniforms, {
          radius,
          angle: (angle / 180) * Math.PI,
          offset,
          extruded,
          coverage,
          elevationScale
        })
      )
      .draw();
  }

  calculateInstancePositions64xyLow(attribute) {
    const isFP64 = this.use64bitPositions();
    attribute.constant = !isFP64;

    if (!isFP64) {
      attribute.value = new Float32Array(2);
      return;
    }

    const {data, getPosition} = this.props;
    const {value} = attribute;
    let i = 0;
    const {iterable, objectInfo} = createIterable(data);
    for (const object of iterable) {
      objectInfo.index++;
      const position = getPosition(object, objectInfo);
      value[i++] = fp64LowPart(position[0]);
      value[i++] = fp64LowPart(position[1]);
    }
  }
}

ColumnLayer.layerName = 'ColumnLayer';
ColumnLayer.defaultProps = defaultProps;
