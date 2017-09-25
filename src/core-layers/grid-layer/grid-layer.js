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

import {CompositeLayer} from '../../core';
import GridCellLayer from '../grid-cell-layer/grid-cell-layer';

import {pointToDensityGridData} from './grid-aggregator';
import {linearScale, quantizeScale} from '../../core/utils/scale-utils';
import {defaultColorRange} from '../../core/utils/color-utils';

import BinSorter from '../../core/utils/bin-sorter';

const defaultProps = {
  cellSize: 1000,
  colorRange: defaultColorRange,
  colorDomain: null,
  elevationRange: [0, 1000],
  elevationDomain: null,
  elevationScale: 1,
  lowerPercentile: 0,
  upperPercentile: 100,
  coverage: 1,
  getPosition: x => x.position,
  getColorValue: points => points.length,
  extruded: false,
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

export default class GridLayer extends CompositeLayer {
  initializeState() {
    this.state = {
      layerData: [],
      sortedBins: null,
      valueDomain: null
    };
  }

  updateState({oldProps, props, changeFlags}) {
    if (changeFlags.dataChanged || this.needsReProjectPoints(oldProps, props)) {
      // project data into hexagons, and get sortedBins
      this.getLayerData();
      this.getSortedBins();

      // this needs sortedBins to be set
      this.getValueDomain();
    } else if (this.needsReSortBins(oldProps, props)) {

      this.getSortedBins();
      this.getValueDomain();

    } else if (this.needsRecalculateColorDomain(oldProps, props)) {

      this.getValueDomain();
    }
  }

  needsReProjectPoints(oldProps, props) {
    return oldProps.cellSize !== props.cellSize;
  }

  needsRecalculateColorDomain(oldProps, props) {
    return oldProps.lowerPercentile !== props.lowerPercentile ||
      oldProps.upperPercentile !== props.upperPercentile;
  }

  needsReSortBins(oldProps, props) {
    return oldProps.getColorValue !== props.getColorValue;
  }

  getLayerData() {
    const {data, cellSize, getPosition} = this.props;
    const {layerData} = pointToDensityGridData(data, cellSize, getPosition);

    this.setState({layerData});
  }

  getSortedBins() {
    const sortedBins = new BinSorter(this.state.layerData || [], this.props.getColorValue);
    this.setState({sortedBins});
  }

  getValueDomain() {
    const {lowerPercentile, upperPercentile} = this.props;

    this.state.valueDomain = this.state.sortedBins
      .getValueRange([lowerPercentile, upperPercentile]);
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

  // for subclassing, override this method to return
  // customized sub layer props
  getSubLayerProps() {
    const {id, elevationScale, fp64, extruded, cellSize, coverage, lightSettings} = this.props;

    const forwardProps = this.getBaseLayerProps();

    // return props to the sublayer constructor
    return Object.assign({}, forwardProps, {
      id: `${id}-grid-cell`,
      data: this.state.layerData,

      fp64,
      cellSize,
      coverage,
      lightSettings,
      elevationScale,
      extruded,

      getColor: this._onGetSublayerColor.bind(this),
      getElevation: this._onGetSublayerElevation.bind(this),
      getPosition: d => d.position,
      updateTriggers: this.getUpdateTriggers()
    });
  }

  // for subclassing, override this method to return
  // customized sub layer class
  getSubLayerClass() {
    return GridCellLayer;
  }

  renderLayers() {
    const SubLayerClass = this.getSubLayerClass();

    return new SubLayerClass(
      this.getSubLayerProps()
    );
  }
}

GridLayer.layerName = 'GridLayer';
GridLayer.defaultProps = defaultProps;
