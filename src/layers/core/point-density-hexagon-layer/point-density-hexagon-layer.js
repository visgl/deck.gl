// Copyright (c) 2016 Uber Technologies, Inc.
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
import HexagonLayer from '../hexagon-layer/hexagon-layer';
import {log} from '../../../lib/utils';

import {quantizeScale, linearScale} from '../../../utils/scale-utils';
import {defaultColorRange} from '../../../utils/color-utils';
import {pointToHexbin} from './hexagon-aggregator';

import SortedBins from '../../../utils/sorted-bins';

const defaultProps = {
  colorRange: defaultColorRange,
  coverage: 1,
  elevationRange: [0, 1000],
  elevationScale: 1,
  lowerPercentile: 0,
  upperPercentile: 100,
  radius: 1000,
  hexagonAggregator: pointToHexbin,
  getPosition: x => x.position
};

function noop() {}

function _needsReProjectPoints(oldProps, props) {
  return oldProps.radius !== props.radius;
}

function _percentileChanged(oldProps, props) {
  return oldProps.lowerPercentile !== props.lowerPercentile ||
    oldProps.upperPercentile !== props.upperPercentile;
}
export default class PointDensityHexagonLayer extends Layer {
  constructor(props) {
    if (!props.radius) {
      log.once(0, 'PointDensityHexagonLayer: radius in meter is needed to aggregate points into ' +
        'hexagonal bins, Now using 1000 meter as default');

      props.radius = defaultProps.radius;
    }

    if (Number.isFinite(props.upperPercentile) &&
      (props.upperPercentile > 100 || props.upperPercentile < 0)) {
      log.once(0, 'PointDensityHexagonLayer: upperPercentile should be between 0 and 100. ' +
        'Assign to 100 by default');

      props.upperPercentile = defaultProps.upperPercentile;
    }

    if (Number.isFinite(props.lowerPercentile) &&
      (props.lowerPercentile > 100 || props.lowerPercentile < 0)) {
      log.once(0, 'PointDensityHexagonLayer: lowerPercentile should be between 0 and 100. ' +
        'Assign to 0 by default');

      props.lowerPercentile = defaultProps.upperPercentile;
    }

    if (props.lowerPercentile >= props.upperPercentile) {
      log.once(0, 'PointDensityHexagonLayer: lowerPercentile should not be bigger than ' +
        'upperPercentile. Assign to 0 by default');

      props.lowerPercentile = defaultProps.lowerPercentile;
    }

    super(props);
  }

  initializeState() {
    this.state = {
      hexagons: [],
      pickedCell: null,
      sortedCounts: null,
      valueDomain: null
    };
  }

  updateState({oldProps, props, changeFlags}) {
    if (changeFlags.dataChanged || _needsReProjectPoints(oldProps, props)) {
      const {hexagonAggregator} = this.props;
      const {viewport} = this.context;

      const hexagons = hexagonAggregator(this.props, viewport);
      const sortedCounts = new SortedBins(hexagons);

      Object.assign(this.state, {hexagons, sortedCounts});

      // this needs sortedCounts to be set
      this._onPercentileChange();

    } else if (_percentileChanged) {

      this._onPercentileChange();
    }
  }

  pick(opts) {
    super.pick(opts);

    const pickedCell = this.state.pickedCell;

    Object.assign(opts.info, {
      layer: this,
      // override index with cell index
      index: pickedCell ? pickedCell.index : -1,
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

  _onHoverSublayer(info) {

    this.state.pickedCell = info.picked && info.index > -1 ?
      this.state.hexagons[info.index] : null;
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
    const {id, radius} = this.props;

    return new HexagonLayer(Object.assign({},
      this.props, {
        id: `${id}-density-hexagon`,
        data: this.state.hexagons,
        radius,
        angle: Math.PI,
        getColor: this._onGetSublayerColor.bind(this),
        getElevation: this._onGetSublayerElevation.bind(this),
        // Override user's onHover and onClick props
        onHover: this._onHoverSublayer.bind(this),
        onClick: noop,
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
      }));
  }
}

PointDensityHexagonLayer.layerName = 'PointDensityHexagonLayer';
PointDensityHexagonLayer.defaultProps = defaultProps;
