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

import {Layer, log} from '@deck.gl/core';
import GL from 'luma.gl/constants';
import {Model, CylinderGeometry, fp64} from 'luma.gl';
const {fp64LowPart} = fp64;

import vs from './hexagon-cell-layer-vertex.glsl';
import fs from './hexagon-cell-layer-fragment.glsl';

const DEFAULT_COLOR = [255, 0, 255, 255];

const defaultProps = {
  hexagonVertices: null,
  radius: {type: 'number', min: 0, value: 1000},
  angle: {type: 'number', value: 0},
  coverage: {type: 'number', min: 0, max: 1, value: 1},
  elevationScale: {type: 'number', min: 0, value: 1},
  extruded: true,
  fp64: false,

  getCentroid: {type: 'accessor', value: x => x.centroid},
  getColor: {type: 'accessor', value: DEFAULT_COLOR},
  getElevation: {type: 'accessor', value: 1000},

  lightSettings: {}
};

export default class HexagonCellLayer extends Layer {
  getShaders() {
    const projectModule = this.use64bitProjection() ? 'project64' : 'project32';
    return {vs, fs, modules: [projectModule, 'lighting', 'picking']};
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
        size: 2,
        transition: true,
        accessor: 'getCentroid'
      },
      instanceElevations: {
        size: 1,
        transition: true,
        accessor: 'getElevation'
      },
      instancePositions64xyLow: {
        size: 2,
        accessor: 'getCentroid',
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
    if (props.fp64 !== oldProps.fp64) {
      const {gl} = this.context;
      if (this.state.model) {
        this.state.model.delete();
      }
      this.setState({model: this._getModel(gl)});
      this.getAttributeManager().invalidateAll();
    }

    if (
      props.hexagonVertices !== oldProps.hexagonVertices ||
      props.radius !== oldProps.radius ||
      props.angle !== oldProps.angle
    ) {
      this.updateRadiusAngle();
    }
  }

  updateRadiusAngle() {
    let {angle, radius} = this.props;
    const {hexagonVertices} = this.props;

    if (Array.isArray(hexagonVertices)) {
      if (hexagonVertices.length < 6) {
        log.error('HexagonCellLayer: hexagonVertices needs to be an array of 6 points')();
      }

      // calculate angle and vertices from hexagonVertices if provided
      const vertices = this.props.hexagonVertices;

      const vertex0 = vertices[0];
      const vertex3 = vertices[3];

      // transform to space coordinates
      const {viewport} = this.context;
      const {pixelsPerMeter} = viewport.getDistanceScales();
      const spaceCoord0 = this.projectFlat(vertex0);
      const spaceCoord3 = this.projectFlat(vertex3);

      // distance between two close centroids
      const dx = spaceCoord0[0] - spaceCoord3[0];
      const dy = spaceCoord0[1] - spaceCoord3[1];
      const dxy = Math.sqrt(dx * dx + dy * dy);

      // Calculate angle that the perpendicular hexagon vertex axis is tilted
      angle = Math.acos(dx / dxy) * -Math.sign(dy) + Math.PI / 2;
      radius = dxy / 2 / pixelsPerMeter[0];
    }

    this.setState({angle, radius});
  }

  getCylinderGeometry(radius) {
    return new CylinderGeometry({
      radius,
      topRadius: radius,
      bottomRadius: radius,
      topCap: true,
      bottomCap: true,
      height: 1,
      verticalAxis: 'z',
      nradial: 6,
      nvertical: 1
    });
  }

  _getModel(gl) {
    return new Model(
      gl,
      Object.assign({}, this.getShaders(), {
        id: this.props.id,
        geometry: this.getCylinderGeometry(1),
        isInstanced: true,
        shaderCache: this.context.shaderCache
      })
    );
  }

  draw({uniforms}) {
    const {elevationScale, extruded, coverage} = this.props;
    const {radius, angle} = this.state;

    this.state.model.render(
      Object.assign({}, uniforms, {
        radius,
        angle,
        extruded,
        coverage,
        elevationScale
      })
    );
  }

  calculateInstancePositions64xyLow(attribute) {
    const isFP64 = this.use64bitPositions();
    attribute.constant = !isFP64;

    if (!isFP64) {
      attribute.value = new Float32Array(2);
      return;
    }

    const {data, getCentroid} = this.props;
    const {value} = attribute;
    let i = 0;
    for (const object of data) {
      const position = getCentroid(object);
      value[i++] = fp64LowPart(position[0]);
      value[i++] = fp64LowPart(position[1]);
    }
  }
}

HexagonCellLayer.layerName = 'HexagonCellLayer';
HexagonCellLayer.defaultProps = defaultProps;
