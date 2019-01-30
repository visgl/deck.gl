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

import {CompositeLayer} from '@deck.gl/core';
import {PolygonLayer} from '@deck.gl/layers';

import {getS2Polygon} from './s2-utils';

const defaultLineColor = [51, 51, 51, 255];
const defaultFillColor = [189, 226, 122, 255];

const defaultProps = {
  stroked: false,
  filled: true,
  extruded: false,
  elevationScale: 1,
  wireframe: false,

  lineWidthScale: 1,
  lineWidthMinPixels: 0,
  lineWidthMaxPixels: Number.MAX_SAFE_INTEGER,
  lineJointRounded: false,
  lineMiterLimit: 4,
  lineDashJustified: false,
  fp64: false,

  // Cell geometry
  getS2Token: {type: 'accessor', value: f => f.token},
  // Cell Polygon fill color
  getFillColor: {type: 'accessor', value: defaultFillColor},
  // Cell polygon outline color
  getLineColor: {type: 'accessor', value: defaultLineColor},
  // Cell polygon outline accessors
  getLineWidth: {type: 'accessor', value: 1},
  // Cell polygon Line dash array accessor
  getLineDashArray: {type: 'accessor', value: [0, 0]},
  // Cell polygon extrusion accessor
  getElevation: {type: 'accessor', value: 1000},

  // Optional settings for 'lighting' shader module
  lightSettings: {}
};

export default class S2Layer extends CompositeLayer {
  renderLayers() {
    // Layer prop
    const {data, getS2Token} = this.props;

    // Rendering props underlying layer
    const {
      elevationScale,
      extruded,
      wireframe,
      filled,
      stroked,
      lineWidthScale,
      lineWidthMinPixels,
      lineWidthMaxPixels,
      lineJointRounded,
      lineMiterLimit,
      lineDashJustified,
      fp64
    } = this.props;

    // Accessor props for underlying layers
    const {
      getFillColor,
      getLineColor,
      getLineWidth,
      getLineDashArray,
      getElevation,
      updateTriggers,
      lightSettings
    } = this.props;

    // Filled Polygon Layer
    const CellLayer = this.getSubLayerClass('cell', PolygonLayer);
    return new CellLayer(
      {
        getElevation,
        getFillColor,
        getLineWidth,
        getLineColor,
        getLineDashArray,
        lightSettings,
        extruded,
        wireframe,
        filled,
        stroked,
        elevationScale,
        lineWidthScale,
        lineWidthMinPixels,
        lineWidthMaxPixels,
        lineJointRounded,
        lineMiterLimit,
        lineDashJustified,
        fp64
      },
      this.getSubLayerProps({
        id: 'cell',
        updateTriggers: {
          getPolygon: updateTriggers.getPolygon,
          getElevation: updateTriggers.getElevation,
          getFillColor: updateTriggers.getFillColor,
          getLineColor: updateTriggers.getLineColor,
          getLineWidth: updateTriggers.getLineWidth
        }
      }),
      {
        data,
        getPolygon: x => getS2Polygon(getS2Token(x))
      }
    );
  }
}

S2Layer.layerName = 'S2Layer';
S2Layer.defaultProps = defaultProps;
