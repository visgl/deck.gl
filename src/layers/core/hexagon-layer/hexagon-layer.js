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

import {Layer} from '../../../lib';
import HexagonCellLayer from '../hexagon-cell-layer/hexagon-cell-layer';
import {log} from '../../../lib/utils';

import {quantizeScale, linearScale} from '../../../utils/scale-utils';
import {defaultColorRange} from '../../../utils/color-utils';
import {pointToHexbin} from './hexagon-aggregator';

import BinSorter from '../../../utils/bin-sorter';

const defaultProps = {
  colorDomain: null,
  colorRange: defaultColorRange,
  elevationDomain: null,
  elevationRange: [0, 1000],
  elevationScale: 1,
  lowerPercentile: 0,
  upperPercentile: 100,
  radius: 1000,
  coverage: 1,
  extruded: false,
  hexagonAggregator: pointToHexbin,
  getPosition: x => x.position,
  fp64: false,
  // Optional settings for 'lighting' shader module
  lightSettings: {
    lightsPosition: [-122.45, 37.75, 8000, -122.0, 38.00, 5000],
    ambientRatio: 0.05,
    diffuseRatio: 0.6,
    specularRatio: 0.8,
    lightsStrength: [2.0, 0.0, 0.0, 0.0],
    numberOfLights: 2
  }
};

function _needsReProjectPoints(oldProps, props) {
  return oldProps.radius !== props.radius;
}

function _percentileChanged(oldProps, props) {
  return oldProps.lowerPercentile !== props.lowerPercentile ||
    oldProps.upperPercentile !== props.upperPercentile;
}

export default class HexagonLayer extends Layer {
  constructor(props) {
    if (!props.radius) {
      log.once(0, 'HexagonLayer: radius in meter is needed to aggregate points into ' +
        'hexagonal bins, Now using 1000 meter as default');

      props.radius = defaultProps.radius;
    }

    if (Number.isFinite(props.upperPercentile) &&
      (props.upperPercentile > 100 || props.upperPercentile < 0)) {
      log.once(0, 'HexagonLayer: upperPercentile should be between 0 and 100. ' +
        'Assign to 100 by default');

      props.upperPercentile = defaultProps.upperPercentile;
    }

    if (Number.isFinite(props.lowerPercentile) &&
      (props.lowerPercentile > 100 || props.lowerPercentile < 0)) {
      log.once(0, 'HexagonLayer: lowerPercentile should be between 0 and 100. ' +
        'Assign to 0 by default');

      props.lowerPercentile = defaultProps.upperPercentile;
    }

    if (props.lowerPercentile >= props.upperPercentile) {
      log.once(0, 'HexagonLayer: lowerPercentile should not be bigger than ' +
        'upperPercentile. Assign to 0 by default');

      props.lowerPercentile = defaultProps.lowerPercentile;
    }

    super(props);
  }

  initializeState() {
    this.state = {
      hexagons: [],
      countRange: null,
      sortedCounts: null,
      valueDomain: null
    };
  }

  updateState({oldProps, props, changeFlags}) {
    if (changeFlags.dataChanged || _needsReProjectPoints(oldProps, props)) {
      const {hexagonAggregator} = this.props;
      const {viewport} = this.context;

      const hexagons = hexagonAggregator(this.props, viewport);
      const sortedCounts = new BinSorter(hexagons);

      Object.assign(this.state, {hexagons, sortedCounts});

      // this needs sortedCounts to be set
      this._onPercentileChange();

    } else if (_percentileChanged(oldProps, props)) {

      this._onPercentileChange();
    }
  }

  getPickingInfo({info}) {
    const pickedCell = info.picked && info.index > -1 ?
      this.state.hexagons[info.index] : null;

    return Object.assign(info, {
      picked: Boolean(pickedCell),
      // override object with picked cell
      object: pickedCell
    });
  }

  _onPercentileChange() {
    const {lowerPercentile, upperPercentile} = this.props;

    this.state.valueDomain = this.state.sortedCounts
      .getCountRange([lowerPercentile, upperPercentile]);
  }

  _onGetSublayerColor(cell) {
    const {colorRange} = this.props;
    const {valueDomain} = this.state;

    const colorDomain = this.props.colorDomain || valueDomain;
    const count = cell.points.length;
    const color = quantizeScale(colorDomain, colorRange, count);

    // if cell count is outside domain, set alpha to 0
    const alpha = count >= valueDomain[0] && count <= valueDomain[1] ?
      (Number.isFinite(color[3]) ? color[3] : 255) : 0;

    return color.concat([alpha]);
  }

  _onGetSublayerElevation(cell) {
    const {elevationDomain, elevationRange} = this.props;
    const {sortedCounts} = this.state;

    // elevation is not affected by percentile
    const domain = elevationDomain || [0, sortedCounts.getMaxCount()];
    return linearScale(domain, elevationRange, cell.points.length);
  }

  renderLayers() {
    const {id, radius, elevationScale, extruded, coverage, lightSettings, fp64} = this.props;

    // base layer props
    const {opacity, pickable, visible} = this.props;

    // viewport props
    const {positionOrigin, projectionMode, modelMatrix} = this.props;

    return new HexagonCellLayer({
      id: `${id}-hexagon-cell`,
      data: this.state.hexagons,
      radius,
      elevationScale,
      angle: Math.PI,
      extruded,
      coverage,
      lightSettings,
      fp64,
      opacity,
      pickable,
      visible,
      projectionMode,
      positionOrigin,
      modelMatrix,
      getColor: this._onGetSublayerColor.bind(this),
      getElevation: this._onGetSublayerElevation.bind(this),
      updateTriggers: {
        getColor: {
          colorRange: this.props.colorRange,
          colorDomain: this.props.colorDomain,
          lowerPercentile: this.props.lowerPercentile,
          upperPercentile: this.props.upperPercentile
        },
        getElevation: {
          elevationRange: this.props.elevationRange,
          elevationDomain: this.props.elevationDomain
        }
      }
    });
  }
}

HexagonLayer.layerName = 'HexagonLayer';
HexagonLayer.defaultProps = defaultProps;
