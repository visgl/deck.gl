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
import GridLayer from '../grid-layer';

import {pointToDensityGridData} from './grid-aggregator';

const defaultCellSize = 1;
const defaultColorRange = [
  [255, 255, 178],
  [254, 217, 118],
  [254, 178, 76],
  [253, 141, 60],
  [240, 59, 32],
  [189, 0, 38]
];
const defaultElevationRange = [0, 10];

const defaultProps = {
  cellSize: defaultCellSize,
  colorRange: defaultColorRange,
  elevationRange: defaultElevationRange
};

function noop() {}

function _needsReProjectPoints(oldProps, props) {
  return oldProps.cellSize !== props.cellSize;
}

function _ordinalScale(domain, range, value) {
  const step = (domain[1] - domain[0]) / range.length;
  const idx = Math.floor((value - domain[0]) / step);
  const clampIdx = Math.max(Math.min(idx, range.length - 1), 0);

  return range[clampIdx];
}

function _linearScale(domain, range, value) {

  return (value - domain[0]) / (domain[1] - domain[0]) * (range[1] - range[0]) + range[0];
}

export default class PointDensityGridLayer extends Layer {
  initializeState() {
    this.state = {
      gridOffset: {latOffset: 0.0089, lonOffset: 0.0113},
      layerData: [],
      countRange: null,
      pickedCell: null
    };
  }

  updateState({oldProps, props, changeFlags}) {
    if (changeFlags.dataChanged || _needsReProjectPoints(oldProps, props)) {
      const {data, cellSize} = this.props;
      const {gridOffset, layerData, countRange} = pointToDensityGridData(data, cellSize);

      Object.assign(this.state, {gridOffset, layerData, countRange});
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

  _onHoverSublayer(info) {

    this.state.pickedCell = info.picked && info.index > -1 ?
      this.state.layerData[info.index] : null;
  }

  _onGetSublayerColor(cell) {
    const {colorRange} = this.props;
    const colorDomain = this.props.colorDomain || this.state.countRange;

    return _ordinalScale(colorDomain, colorRange, cell.count);
  }

  _onGetSublayerElevation(cell) {
    const {elevationRange} = this.props;
    const elevationDomain = this.props.elevationDomain || [0, this.state.countRange[1]];
    return _linearScale(elevationDomain, elevationRange, cell.count);
  }

  renderLayers() {
    const {id} = this.props;

    // Override user's onHover and onClick props
    const handlers = {
      getColor: this._onGetSublayerColor.bind(this),
      getElevation: this._onGetSublayerElevation.bind(this),
      onHover: this._onHoverSublayer.bind(this),
      onClick: noop
    };

    return new GridLayer(Object.assign({},
      this.props, handlers, {
        id: `${id}-density-grid`,
        data: this.state.layerData,
        latOffset: this.state.gridOffset.latOffset,
        lonOffset: this.state.gridOffset.lonOffset,
        pickable: true
      }));
  }
}

PointDensityGridLayer.layerName = 'PointDensityGridLayer';
PointDensityGridLayer.defaultProps = defaultProps;
