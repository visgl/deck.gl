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

import {ordinalScale, linearScale} from '../../../utils/scale-utils';
import {defaultColorRange} from '../../../utils/color-utils';
import {getSortedCounts, getCountRangeFromPercentile} from '../../../utils/aggregation-utils';
import {pointToHexbin} from './hexagon-aggregator';

const defaultRadius = 1000;
const defaultCoverage = 1;
const defaultElevationRange = [0, 1000];
const defaultElevationScale = 1;
const defaultAggregator = pointToHexbin;
const defaultLowerPercentile = 0;
const defaultUpperPercentile = 100;

const defaultProps = {
  colorRange: defaultColorRange,
  coverage: defaultCoverage,
  elevationRange: defaultElevationRange,
  elevationScale: defaultElevationScale,
  lowerPercentile: defaultLowerPercentile,
  upperPercentile: defaultUpperPercentile,
  radius: defaultRadius,
  hexagonAggregator: defaultAggregator,
  getPosition: x => x.position
};

function noop() {}

function _needsReProjectPoints(oldProps, props) {
  return oldProps.radius !== props.radius;
}

function _percentilChanged(oldProps, props) {
  return oldProps.lowerPercentile !== props.lowerPercentile ||
    oldProps.upperPercentile !== props.upperPercentile;
}
export default class PointDensityHexagonLayer extends Layer {
  constructor(props) {
    if (!props.radius) {
      log.once(0, 'PointDensityHexagonLayer: radius in meter is needed to aggregate points into ' +
        'hexagonal bins, Now using 1000 meter as default');

      props.radius = defaultRadius;
    }

    if (Number.isFinite(props.upperPercentile) &&
      (props.upperPercentile > 100 || props.upperPercentile < 0)) {
      log.once(0, 'PointDensityHexagonLayer: upperPercentile should be between 0 and 100. ' +
        'Assign to 100 by default');

      props.upperPercentile = defaultUpperPercentile;
    }

    if (Number.isFinite(props.lowerPercentile) &&
      (props.lowerPercentile > 100 || props.lowerPercentile < 0)) {
      log.once(0, 'PointDensityHexagonLayer: lowerPercentile should be between 0 and 100. ' +
        'Assign to 0 by default');

      props.lowerPercentile = defaultLowerPercentile;
    }

    if (props.lowerPercentile >= props.upperPercentile) {
      log.once(0, 'PointDensityHexagonLayer: lowerPercentile should not be bigger than ' +
        'upperPercentile. Assign to 0 by default');

      props.lowerPercentile = defaultLowerPercentile;
    }

    super(props);
  }

  initializeState() {
    this.state = {
      hexagons: [],
      pickedCell: null,
      sortedCounts: null,
      countDomainByPercentile: null
    };
  }

  updateState({oldProps, props, changeFlags}) {
    if (changeFlags.dataChanged || _needsReProjectPoints(oldProps, props)) {
      const {hexagonAggregator} = this.props;
      const {viewport} = this.context;

      const hexagons = hexagonAggregator(this.props, viewport);
      const sortedCounts = getSortedCounts(hexagons);

      Object.assign(this.state, {hexagons, sortedCounts});

      // this needs sortedCounts to be set
      this._onPercentileChange();

    } else if (_percentilChanged) {

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
    const [lower, upper] = [this.props.lowerPercentile, this.props.upperPercentile];

    this.state.countDomainByPercentile =
      getCountRangeFromPercentile(this.state.sortedCounts, [lower, upper]);
  }

  _onHoverSublayer(info) {

    this.state.pickedCell = info.picked && info.index > -1 ?
      this.state.hexagons[info.index] : null;
  }

  _onGetSublayerColor(cell) {
    const {colorRange} = this.props;
    const {countDomainByPercentile} = this.state;
    const colorDomain = this.props.colorDomain || countDomainByPercentile;
    const count = cell.points.length;

    const color = ordinalScale(colorDomain, colorRange, count);

    // if cell count is outside domain, set alpha to 0
    const alpha = count >= countDomainByPercentile[0] && count <= countDomainByPercentile[1] ?
      (Number.isFinite(color[3]) ? color[3] : 255) : 0;

    return color.concat([alpha]);
  }

  _onGetSublayerElevation(cell) {
    const {elevationDomain, elevationRange} = this.props;
    const {sortedCounts} = this.state;

    // elevation is not affected by percentile
    const domain = elevationDomain || [0, sortedCounts[sortedCounts.length - 1].counts];
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
