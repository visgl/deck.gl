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
import GridCellLayer from '../grid-cell-layer/grid-cell-layer';

import {pointToDensityGridData} from './grid-aggregator';
import {linearScale, quantizeScale} from '../../../utils/scale-utils';
import {defaultColorRange} from '../../../utils/color-utils';

const defaultCellSize = 1000;
const defaultElevationRange = [0, 1000];
const defaultElevationScale = 1;

const defaultProps = {
  cellSize: defaultCellSize,
  colorRange: defaultColorRange,
  colorDomain: null,
  elevationRange: defaultElevationRange,
  elevationDomain: null,
  elevationScale: defaultElevationScale,
  getPosition: x => x.position,
  extruded: false,
  fp64: false
};

function _needsReProjectPoints(oldProps, props) {
  return oldProps.cellSize !== props.cellSize;
}

export default class GridLayer extends Layer {
  initializeState() {
    this.state = {
      gridOffset: {yOffset: 0.0089, xOffset: 0.0113},
      layerData: [],
      countRange: null
    };
  }

  updateState({oldProps, props, changeFlags}) {
    if (changeFlags.dataChanged || _needsReProjectPoints(oldProps, props)) {
      const {data, cellSize, getPosition} = this.props;

      const {gridOffset, layerData, countRange} =
        pointToDensityGridData(data, cellSize, getPosition);

      Object.assign(this.state, {gridOffset, layerData, countRange});
    }
  }

  getPickingInfo({info}) {
    const pickedCell = info.picked && info.index > -1 ?
      this.state.layerData[info.index] : null;

    return Object.assign(info, {
      picked: Boolean(pickedCell),
      // override object with picked cell
      object: pickedCell
    });
  }

  _onGetSublayerColor(cell) {
    const {colorRange} = this.props;
    const colorDomain = this.props.colorDomain || this.state.countRange;

    return quantizeScale(colorDomain, colorRange, cell.count);
  }

  _onGetSublayerElevation(cell) {
    const {elevationRange} = this.props;
    const elevationDomain = this.props.elevationDomain || [0, this.state.countRange[1]];
    return linearScale(elevationDomain, elevationRange, cell.count);
  }

  renderLayers() {
    const {id, elevationScale, fp64, extruded} = this.props;

    // base layer props
    const {opacity, pickable, visible, projectionMode} = this.props;

    // viewport props
    const {positionOffset, modelMatrix} = this.props;

    return new GridCellLayer({
      id: `${id}-grid-cell`,
      data: this.state.layerData,
      latOffset: this.state.gridOffset.yOffset,
      lonOffset: this.state.gridOffset.xOffset,
      elevationScale,
      extruded,
      fp64,
      opacity,
      pickable,
      visible,
      projectionMode,
      positionOffset,
      modelMatrix,
      getColor: this._onGetSublayerColor.bind(this),
      getElevation: this._onGetSublayerElevation.bind(this),
      getPosition: d => d.position,
      updateTriggers: {
        getColor: {colorRange: this.props.colorRange},
        getElevation: {elevationRange: this.props.elevationRange}
      }
    });
  }
}

GridLayer.layerName = 'GridLayer';
GridLayer.defaultProps = defaultProps;
