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
import {ScatterplotLayer, PathLayer} from '@deck.gl/layers';
// Use primitive polygon layer to avoid "Composite Composite" layers for now
import {_SolidPolygonLayer as SolidPolygonLayer} from '@deck.gl/layers';
import smartFetch from './smart-fetch';

const defaultLineColor = [0, 0, 0, 255];
const defaultFillColor = [0, 0, 0, 255];

const defaultProps = {
  stroked: true,
  filled: true,
  extruded: false,
  wireframe: false,

  lineWidthScale: 1,
  lineWidthMinPixels: 0,
  lineWidthMaxPixels: Number.MAX_SAFE_INTEGER,
  lineJointRounded: false,
  lineMiterLimit: 4,

  elevationScale: 1,

  pointRadiusScale: 1,
  pointRadiusMinPixels: 0, //  min point radius in pixels
  pointRadiusMaxPixels: Number.MAX_SAFE_INTEGER, // max point radius in pixels

  lineDashJustified: false,
  fp64: false,

  // Line and polygon outline color
  getLineColor: defaultLineColor,
  // Point and polygon fill color
  getFillColor: defaultFillColor,
  // Point radius
  getRadius: 1,
  // Line and polygon outline accessors
  getLineWidth: 1,
  // Line dash array accessor
  getLineDashArray: null,
  // Polygon extrusion accessor
  getElevation: 1000,

  subLayers: {
    PointLayer: ScatterplotLayer,
    LineLayer: PathLayer,
    PolygonLayer: SolidPolygonLayer
  },

  // Optional settings for 'lighting' shader module
  lightSettings: {},

  fetch: smartFetch
};

function getCoordinates(f) {
  return f.coordinates;
}

/**
 * Unwraps the real source feature passed into props and passes as the argument to `accessor`.
 */
export default class KMLLayer extends CompositeLayer {
  initializeState() {
    this.state = {};
  }

  updateState({oldProps, props, changeFlags}) {
    if (changeFlags.dataChanged) {
      // TBA
    }
  }

  getPickingInfo({info, sourceLayer}) {
    // `info.index` is the index within the particular sub-layer
    // We want to expose the index of the feature the user provided

    return Object.assign(info, {
      // override object with picked feature
      object: info.object,
      index: info.index
    });
  }

  /* eslint-disable complexity */
  renderLayers() {
    const {data} = this.props;
    const pointFeatures = data.markers;
    const lineFeatures = data.lines;
    // const polygonFeatures = data.polygons;
    const polygonOutlineFeatures = data.polygons;

    // Layer composition props
    const {
      stroked,
      // filled,
      extruded,
      // wireframe,
      subLayers,
      // lightSettings,
      transitions
    } = this.props;

    // Rendering props underlying layer
    const {
      lineWidthScale,
      lineWidthMinPixels,
      lineWidthMaxPixels,
      lineJointRounded,
      lineMiterLimit,
      pointRadiusScale,
      pointRadiusMinPixels,
      pointRadiusMaxPixels,
      // elevationScale,
      lineDashJustified,
      fp64
    } = this.props;

    // Accessor props for underlying layers
    const {
      getLineColor,
      getFillColor,
      getRadius,
      getLineWidth,
      getLineDashArray,
      // getElevation,
      updateTriggers
    } = this.props;

    const drawPoints = pointFeatures && pointFeatures.length > 0;
    const drawLines = lineFeatures && lineFeatures.length > 0;
    const hasPolygonLines = polygonOutlineFeatures && polygonOutlineFeatures.length > 0;
    // const hasPolygon = polygonFeatures && polygonFeatures.length > 0;

    /*
    // Filled Polygon Layer
    const polygonFillLayer =
      hasPolygon &&
      new subLayers.PolygonLayer(
        this.getSubLayerProps({
          id: 'polygon-fill',
          updateTriggers: {
            getElevation: updateTriggers.getElevation,
            getFillColor: updateTriggers.getFillColor,
            getLineColor: updateTriggers.getLineColor
          }
        }),
        {
          data: polygonFeatures,
          fp64,
          extruded,
          elevationScale,
          filled,
          wireframe,
          lightSettings,
          getPolygon: getCoordinates,
          getElevation,
          getFillColor,
          getLineColor,

          transitions: transitions && {
            getPolygon: transitions.geometry,
            getElevation: transitions.getElevation,
            getFillColor: transitions.getFillColor,
            getLineColor: transitions.getLineColor
          }
        }
      );
    */

    const polygonLineLayer =
      !extruded &&
      stroked &&
      hasPolygonLines &&
      new subLayers.LineLayer(
        this.getSubLayerProps({
          id: 'polygon-outline',
          updateTriggers: {
            getColor: updateTriggers.getLineColor,
            getWidth: updateTriggers.getLineWidth,
            getDashArray: updateTriggers.getLineDashArray
          }
        }),
        {
          data: polygonOutlineFeatures,

          fp64,
          widthScale: lineWidthScale,
          widthMinPixels: lineWidthMinPixels,
          widthMaxPixels: lineWidthMaxPixels,
          rounded: lineJointRounded,
          miterLimit: lineMiterLimit,
          dashJustified: lineDashJustified,

          getPath: getCoordinates,
          getColor: getLineColor,
          getWidth: getLineWidth,
          getDashArray: getLineDashArray,

          transitions: transitions && {
            getPath: transitions.geometry,
            getColor: transitions.getLineColor,
            getWidth: transitions.getLineWidth
          }
        }
      );

    const pathLayer =
      drawLines &&
      new subLayers.LineLayer(
        this.getSubLayerProps({
          id: 'line-paths',
          updateTriggers: {
            getColor: updateTriggers.getLineColor,
            getWidth: updateTriggers.getLineWidth,
            getDashArray: updateTriggers.getLineDashArray
          }
        }),
        {
          data: lineFeatures,

          fp64,
          widthScale: lineWidthScale,
          widthMinPixels: lineWidthMinPixels,
          widthMaxPixels: lineWidthMaxPixels,
          rounded: lineJointRounded,
          miterLimit: lineMiterLimit,
          dashJustified: lineDashJustified,

          getPath: getCoordinates,
          getColor: getLineColor,
          getWidth: getLineWidth,
          getDashArray: getLineDashArray,

          transitions: transitions && {
            getPath: transitions.geometry,
            getColor: transitions.getLineColor,
            getWidth: transitions.getLineWidth
          }
        }
      );

    const pointLayer =
      drawPoints &&
      new subLayers.PointLayer(
        this.getSubLayerProps({
          id: 'points',
          updateTriggers: {
            getColor: updateTriggers.getFillColor,
            getRadius: updateTriggers.getRadius
          }
        }),
        {
          data: pointFeatures,

          fp64,
          radiusScale: pointRadiusScale,
          radiusMinPixels: pointRadiusMinPixels,
          radiusMaxPixels: pointRadiusMaxPixels,

          getPosition: getCoordinates,
          getColor: getFillColor,
          getRadius,

          transitions: transitions && {
            getPosition: transitions.geometry,
            getColor: transitions.getFillColor,
            getRadius: transitions.getRadius
          }
        }
      );

    return [
      // If not extruded: flat fill layer is drawn below outlines
      // !extruded && polygonFillLayer,
      polygonLineLayer,
      pathLayer,
      pointLayer
      // If extruded: draw fill layer last for correct blending behavior
      // extruded && polygonFillLayer
    ];
  }
  /* eslint-enable complexity */
}

KMLLayer.layerName = 'KMLLayer';
KMLLayer.defaultProps = defaultProps;
