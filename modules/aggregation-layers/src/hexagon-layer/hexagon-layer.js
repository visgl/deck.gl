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

import {PhongMaterial} from '@luma.gl/core';
import {CompositeLayer, log} from '@deck.gl/core';
import {ColumnLayer} from '@deck.gl/layers';

import {defaultColorRange} from '../utils/color-utils';

import {pointToHexbin} from './hexagon-aggregator';
import CPUAggregator from '../utils/cpu-aggregator';

function nop() {}

const defaultMaterial = new PhongMaterial();

const defaultProps = {
  // color
  colorDomain: null,
  colorRange: defaultColorRange,
  getColorValue: {type: 'accessor', value: null}, // default value is calcuated from `getColorWeight` and `colorAggregation`
  getColorWeight: {type: 'accessor', value: x => 1},
  colorAggregation: 'SUM',
  lowerPercentile: {type: 'number', value: 0, min: 0, max: 100},
  upperPercentile: {type: 'number', value: 100, min: 0, max: 100},
  colorScaleType: 'quantize',
  onSetColorDomain: nop,

  // elevation
  elevationDomain: null,
  elevationRange: [0, 1000],
  getElevationValue: {type: 'accessor', value: null}, // default value is calcuated from `getElevationWeight` and `elevationAggregation`
  getElevationWeight: {type: 'accessor', value: x => 1},
  elevationAggregation: 'SUM',
  elevationLowerPercentile: {type: 'number', value: 0, min: 0, max: 100},
  elevationUpperPercentile: {type: 'number', value: 100, min: 0, max: 100},
  elevationScale: {type: 'number', min: 0, value: 1},
  elevationScaleType: 'linear',
  onSetElevationDomain: nop,

  radius: {type: 'number', value: 1000, min: 1},
  coverage: {type: 'number', min: 0, max: 1, value: 1},
  extruded: false,
  hexagonAggregator: pointToHexbin,
  getPosition: {type: 'accessor', value: x => x.position},
  // Optional material for 'lighting' shader module
  material: defaultMaterial
};

export default class HexagonLayer extends CompositeLayer {
  initializeState() {
    const cpuAggregator = new CPUAggregator({
      getAggregator: props => props.hexagonAggregator,
      getCellSize: props => props.radius
    });

    this.state = {
      cpuAggregator,
      aggregatorState: cpuAggregator.state
    };
  }

  updateState({oldProps, props, changeFlags}) {
    const {cpuAggregator} = this.state;
    const oldLayerData = cpuAggregator.state.layerData;
    this.setState({
      // make a copy of the internal state of cpuAggregator for testing
      aggregatorState: cpuAggregator.updateState(
        {oldProps, props, changeFlags},
        this.context.viewport
      )
    });

    if (oldLayerData !== cpuAggregator.state.layerData) {
      const {hexagonVertices} = cpuAggregator.state.layerData;
      this.updateRadiusAngle(hexagonVertices);
    }
  }

  updateRadiusAngle(vertices) {
    let {radius} = this.props;
    let angle = 90;

    if (Array.isArray(vertices)) {
      if (vertices.length < 6) {
        log.error('HexagonCellLayer: hexagonVertices needs to be an array of 6 points')();
      }

      // calculate angle and vertices from hexagonVertices if provided
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
      angle = ((Math.acos(dx / dxy) * -Math.sign(dy)) / Math.PI) * 180 + 90;
      radius = dxy / 2 / pixelsPerMeter[0];
    }

    this.setState({angle, radius});
  }

  getPickingInfo({info}) {
    return this.state.cpuAggregator.getPickingInfo({info});
  }

  // create a method for testing
  _onGetSublayerColor(cell) {
    return this.state.cpuAggregator.getAccessor('fillColor')(cell);
  }

  // create a method for testing
  _onGetSublayerElevation(cell) {
    return this.state.cpuAggregator.getAccessor('elevation')(cell);
  }

  _getSublayerUpdateTriggers() {
    return this.state.cpuAggregator.getUpdateTriggers(this.props);
  }

  renderLayers() {
    const {elevationScale, extruded, coverage, material, transitions} = this.props;
    const {angle, radius, cpuAggregator} = this.state;

    const SubLayerClass = this.getSubLayerClass('hexagon-cell', ColumnLayer);
    const updateTriggers = this._getSublayerUpdateTriggers();

    return new SubLayerClass(
      {
        radius,
        diskResolution: 6,
        elevationScale,
        angle,
        extruded,
        coverage,
        material,

        getFillColor: this._onGetSublayerColor.bind(this),
        getElevation: this._onGetSublayerElevation.bind(this),
        transitions: transitions && {
          getFillColor: transitions.getColorValue || transitions.getColorWeight,
          getElevation: transitions.getElevationValue || transitions.getElevationWeight
        }
      },
      this.getSubLayerProps({
        id: 'hexagon-cell',
        updateTriggers
      }),
      {
        data: cpuAggregator.state.layerData.data
      }
    );
  }
}

HexagonLayer.layerName = 'HexagonLayer';
HexagonLayer.defaultProps = defaultProps;
