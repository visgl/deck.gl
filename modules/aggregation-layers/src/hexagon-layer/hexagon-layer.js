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

import {log} from '@deck.gl/core';
import {ColumnLayer} from '@deck.gl/layers';

import {defaultColorRange} from '../utils/color-utils';

import {pointToHexbin} from './hexagon-aggregator';
import CPUAggregator from '../utils/cpu-aggregator';
import AggregationLayer from '../aggregation-layer';

function nop() {}

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
  material: true,

  // data filter
  _filterData: {type: 'function', value: null, optional: true}
};

export default class HexagonLayer extends AggregationLayer {
  shouldUpdateState({changeFlags}) {
    return changeFlags.somethingChanged;
  }
  initializeState() {
    const cpuAggregator = new CPUAggregator({
      getAggregator: props => props.hexagonAggregator,
      getCellSize: props => props.radius
    });

    this.state = {
      cpuAggregator,
      aggregatorState: cpuAggregator.state,
      hexagonVertices: null
    };
    const attributeManager = this.getAttributeManager();
    attributeManager.add({
      positions: {size: 3, accessor: 'getPosition'}
    });
    // color and elevation attributes can't be added as attributes
    // they are calculated using 'getValue' accessor that takes an array of pints.
  }

  updateState(opts) {
    super.updateState(opts);
    const {cpuAggregator, hexagonVertices: oldVertices} = this.state;

    if (opts.changeFlags.propsOrDataChanged) {
      this.setState({
        // make a copy of the internal state of cpuAggregator for testing
        aggregatorState: cpuAggregator.updateState(opts, {
          viewport: this.context.viewport,
          attributes: this.getAttributes()
        })
      });
    }

    // if user provided custom aggregator and returns hexagonVertices,
    // Need to recalculate radius and angle based on vertices
    const {hexagonVertices} = cpuAggregator.state.layerData || {};

    if (hexagonVertices && oldVertices !== hexagonVertices) {
      const vertices = this.convertLatLngToMeterOffset(hexagonVertices);
      if (vertices) {
        this.setState({
          hexagonVertices,
          vertices
        });
      }
    } else {
      // update radius angle by viewport
      this.updateRadiusAngle();
    }
  }

  updateRadiusAngle(vertices) {
    const {viewport} = this.context;
    const {unitsPerMeter} = viewport.getDistanceScales();
    const {cpuAggregator} = this.state;

    if (cpuAggregator.state.layerData && cpuAggregator.state.layerData.radiusCommon) {
      const {radiusCommon} = cpuAggregator.state.layerData;
      const radius = radiusCommon / unitsPerMeter[0];

      // convert radius in common to meter
      this.setState({angle: 90, radius});
    }
  }

  convertLatLngToMeterOffset(hexagonVertices) {
    const {viewport} = this.context;
    if (Array.isArray(hexagonVertices) && hexagonVertices.length === 6) {
      // get centroid of hexagons
      const vertex0 = hexagonVertices[0];
      const vertex3 = hexagonVertices[3];

      const centroid = [(vertex0[0] + vertex3[0]) / 2, (vertex0[1] + vertex3[1]) / 2];
      const centroidFlat = viewport.projectFlat(centroid);

      const {metersPerUnit} = viewport.getDistanceScales(centroid);

      // offset all points by centroid to meter offset
      const vertices = hexagonVertices.map(vt => {
        const vtFlat = viewport.projectFlat(vt);

        return [
          (vtFlat[0] - centroidFlat[0]) * metersPerUnit[0],
          (vtFlat[1] - centroidFlat[1]) * metersPerUnit[1]
        ];
      });

      return vertices;
    }

    log.error('HexagonLayer: hexagonVertices needs to be an array of 6 points')();
    return null;
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
    const {angle, radius, cpuAggregator, vertices} = this.state;

    const SubLayerClass = this.getSubLayerClass('hexagon-cell', ColumnLayer);
    const updateTriggers = this._getSublayerUpdateTriggers();

    const geometry = vertices && vertices.length ? {vertices, radius: 1} : {radius, angle};
    return new SubLayerClass(
      {
        ...geometry,
        diskResolution: 6,
        elevationScale,
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
