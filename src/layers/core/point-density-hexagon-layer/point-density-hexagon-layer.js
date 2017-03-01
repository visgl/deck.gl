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
import {pointToHexbin} from './hexagon-aggregator';

const defaultRadius = 1000;
const defaultCoverage = 1;
const defaultElevationRange = [0, 1000];
const defaultElevationScale = 1;
const defaultAggregator = pointToHexbin;

const defaultProps = {
  colorRange: defaultColorRange,
  elevationRange: defaultElevationRange,
  elevationScale: defaultElevationScale,
  radius: defaultRadius,
  coverage: defaultCoverage,
  hexagonAggregator: defaultAggregator,
  getPosition: x => x.position
};

function noop() {}

function _needsReProjectPoints(oldProps, props) {
  return oldProps.radius !== props.radius;
}

function _getCountRange(hexagons) {
  return [
    Math.min.apply(null, hexagons.map(bin => bin.points.length)),
    Math.max.apply(null, hexagons.map(bin => bin.points.length))
  ];
}

export default class PointDensityHexagonLayer extends Layer {
  constructor(props) {
    if (!props.radius) {
      log.once(0, 'PointDensityHexagonLayer: radius in meter is needed to aggregate points into ' +
        'hexagonal bins, Now using 1000 meter as default');

      props.radius = defaultRadius;
    }

    super(props);
  }

  initializeState() {
    this.state = {
      hexagons: [],
      countRange: null,
      pickedCell: null
    };
  }

  updateState({oldProps, props, changeFlags}) {
    if (changeFlags.dataChanged || _needsReProjectPoints(oldProps, props)) {
      const {hexagonAggregator} = this.props;
      const {viewport} = this.context;

      const hexagons = hexagonAggregator(this.props, viewport);
      const countRange = _getCountRange(hexagons);

      Object.assign(this.state, {hexagons, countRange});
    }
  }

  getPickingInfo(opts) {
    const info = super.getPickingInfo(opts);
    const pickedCell = this.state.pickedCell;

    return Object.assign(info, {
      layer: this,
      // override index with cell index
      index: pickedCell ? pickedCell.index : -1,
      picked: Boolean(pickedCell),
      // override object with picked cell
      object: pickedCell
    });
  }

  _onHoverSublayer(info) {

    this.state.pickedCell = info.picked && info.index > -1 ?
      this.state.hexagons[info.index] : null;
  }

  _onGetSublayerColor(cell) {
    const {colorRange} = this.props;
    const colorDomain = this.props.colorDomain || this.state.countRange;

    return ordinalScale(colorDomain, colorRange, cell.points.length);
  }

  _onGetSublayerElevation(cell) {
    const {elevationRange} = this.props;
    const elevationDomain = this.props.elevationDomain || [0, this.state.countRange[1]];
    return linearScale(elevationDomain, elevationRange, cell.points.length);
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
          getColor: {colorRange: this.props.colorRange},
          getElevation: {elevationRange: this.props.elevationRange}
        }
      }));
  }
}

PointDensityHexagonLayer.layerName = 'PointDensityHexagonLayer';
PointDensityHexagonLayer.defaultProps = defaultProps;
