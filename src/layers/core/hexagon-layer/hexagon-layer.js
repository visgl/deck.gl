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

import {CompositeLayer} from '../../../lib';
import HexagonCellLayer from '../hexagon-cell-layer/hexagon-cell-layer';
import {log} from '../../../lib/utils';

import {quantizeScale, linearScale} from '../../../utils/scale-utils';
import {defaultColorRange} from '../../../utils/color-utils';
import {pointToHexbin} from './hexagon-aggregator';

import BinSorter from '../../../utils/bin-sorter';

const defaultProps = {
  colorDomain: null,
  colorRange: defaultColorRange,
  getColorValue: points => points.length,
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
  return oldProps.radius !== props.radius || oldProps.hexagonAggregator !== props.hexagonAggregator;
}

function _percentileChanged(oldProps, props) {
  return oldProps.lowerPercentile !== props.lowerPercentile ||
    oldProps.upperPercentile !== props.upperPercentile;
}

function _needsReSortBins(oldProps, props) {
  return oldProps.getColorValue !== props.getColorValue;
}

export default class HexagonLayer extends CompositeLayer {
  constructor(props) {
    if (!props.hexagonAggregator && !props.radius) {
      log.once(0, 'HexagonLayer: Default hexagonAggregator requires radius prop to be set, ' +
        'Now using 1000 meter as default');

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
      hexagonVertices: null,
      sortedBins: null,
      valueDomain: null
    };
  }

  shouldUpdateState({changeFlags}) {
    return changeFlags.somethingChanged;
  }

  updateState({oldProps, props, changeFlags}) {
    if (changeFlags.dataChanged || _needsReProjectPoints(oldProps, props)) {
      // project data into hexagons, and get sortedBins
      this.getHexagons();
      this.getSortedBins();

      // this needs sortedBins to be set
      this.getValueDomain();

    } else if (_needsReSortBins(oldProps, props)) {

      this.getSortedBins();
      this.getValueDomain();

    } else if (_percentileChanged(oldProps, props)) {

      this.getValueDomain();
    }
  }

  getHexagons() {
    const {hexagonAggregator} = this.props;
    const {viewport} = this.context;
    const {hexagons, hexagonVertices} = hexagonAggregator(this.props, viewport);
    this.setState({hexagons, hexagonVertices});
  }

  getSortedBins() {
    const sortedBins = new BinSorter(this.state.hexagons || [], this.props.getColorValue);
    this.setState({sortedBins});
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

  getUpdateTriggers() {
    return {
      getColor: {
        colorRange: this.props.colorRange,
        colorDomain: this.props.colorDomain,
        getColorValue: this.props.getColorValue,
        lowerPercentile: this.props.lowerPercentile,
        upperPercentile: this.props.upperPercentile
      },
      getElevation: {
        elevationRange: this.props.elevationRange,
        elevationDomain: this.props.elevationDomain
      }
    };
  }

  getValueDomain() {
    const {lowerPercentile, upperPercentile} = this.props;

    this.state.valueDomain = this.state.sortedBins
      .getValueRange([lowerPercentile, upperPercentile]);
  }

  _onGetSublayerColor(cell) {
    const {colorRange} = this.props;
    const {valueDomain, sortedBins} = this.state;
    const value = sortedBins.binMap[cell.index] && sortedBins.binMap[cell.index].value;

    const colorDomain = this.props.colorDomain || valueDomain;
    const color = quantizeScale(colorDomain, colorRange, value);

    // if cell value is outside domain, set alpha to 0
    const alpha = value >= valueDomain[0] && value <= valueDomain[1] ?
      (Number.isFinite(color[3]) ? color[3] : 255) : 0;

    // add final alpha to color
    color[3] = alpha;

    return color;
  }

  _onGetSublayerElevation(cell) {
    const {elevationDomain, elevationRange} = this.props;
    const {sortedBins} = this.state;

    // elevation is based on counts, it is not affected by percentile
    const domain = elevationDomain || [0, sortedBins.maxCount];
    return linearScale(domain, elevationRange, cell.points.length);
  }

  renderLayers() {
    const {id, radius, elevationScale, extruded, coverage, lightSettings, fp64} = this.props;

    // base layer props
    const {opacity, pickable, visible, getPolygonOffset} = this.props;

    // viewport props
    const {positionOrigin, projectionMode, modelMatrix} = this.props;

    return new HexagonCellLayer({
      id: `${id}-hexagon-cell`,
      data: this.state.hexagons,
      hexagonVertices: this.state.hexagonVertices,
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
      getPolygonOffset,
      projectionMode,
      positionOrigin,
      modelMatrix,
      getColor: this._onGetSublayerColor.bind(this),
      getElevation: this._onGetSublayerElevation.bind(this),
      updateTriggers: this.getUpdateTriggers()
    });
  }
}

HexagonLayer.layerName = 'HexagonLayer';
HexagonLayer.defaultProps = defaultProps;
