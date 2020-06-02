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

import {CompositeLayer, log} from '@deck.gl/core';
import ScatterplotLayer from '../scatterplot-layer/scatterplot-layer';
import PathLayer from '../path-layer/path-layer';
// Use primitive layer to avoid "Composite Composite" layers for now
import SolidPolygonLayer from '../solid-polygon-layer/solid-polygon-layer';
import {replaceInRange} from '../utils';

import {getGeojsonFeatures, separateGeojsonFeatures} from './geojson';

const defaultLineColor = [0, 0, 0, 255];
const defaultFillColor = [0, 0, 0, 255];

const defaultProps = {
  stroked: true,
  filled: true,
  extruded: false,
  wireframe: false,

  lineWidthUnits: 'meters',
  lineWidthScale: 1,
  lineWidthMinPixels: 0,
  lineWidthMaxPixels: Number.MAX_SAFE_INTEGER,
  lineJointRounded: false,
  lineMiterLimit: 4,

  elevationScale: 1,

  pointRadiusUnits: 'meters',
  pointRadiusScale: 1,
  pointRadiusMinPixels: 0, //  min point radius in pixels
  pointRadiusMaxPixels: Number.MAX_SAFE_INTEGER, // max point radius in pixels

  // Line and polygon outline color
  getLineColor: {type: 'accessor', value: defaultLineColor},
  // Point and polygon fill color
  getFillColor: {type: 'accessor', value: defaultFillColor},
  // Point radius
  getRadius: {type: 'accessor', value: 1},
  // Line and polygon outline accessors
  getLineWidth: {type: 'accessor', value: 1},
  // Polygon extrusion accessor
  getElevation: {type: 'accessor', value: 1000},
  // Optional material for 'lighting' shader module
  material: true
};

function getCoordinates(f) {
  return f.geometry.coordinates;
}

export default class GeoJsonLayer extends CompositeLayer {
  initializeState() {
    this.state = {
      features: {}
    };

    if (this.props.getLineDashArray) {
      log.removed('getLineDashArray', 'PathStyleExtension')();
    }
  }

  updateState({props, changeFlags}) {
    if (!changeFlags.dataChanged) {
      return;
    }
    const features = getGeojsonFeatures(props.data);
    const wrapFeature = this.getSubLayerRow.bind(this);

    if (Array.isArray(changeFlags.dataChanged)) {
      const oldFeatures = this.state.features;
      const newFeatures = {};
      const featuresDiff = {};
      for (const key in oldFeatures) {
        newFeatures[key] = oldFeatures[key].slice();
        featuresDiff[key] = [];
      }

      for (const dataRange of changeFlags.dataChanged) {
        const partialFeatures = separateGeojsonFeatures(features, wrapFeature, dataRange);
        for (const key in oldFeatures) {
          featuresDiff[key].push(
            replaceInRange({
              data: newFeatures[key],
              getIndex: f => f.__source.index,
              dataRange,
              replace: partialFeatures[key]
            })
          );
        }
      }
      this.setState({features: newFeatures, featuresDiff});
    } else {
      this.setState({
        features: separateGeojsonFeatures(features, wrapFeature),
        featuresDiff: {}
      });
    }
  }

  /* eslint-disable complexity */
  renderLayers() {
    const {features, featuresDiff} = this.state;
    const {pointFeatures, lineFeatures, polygonFeatures, polygonOutlineFeatures} = features;

    // Layer composition props
    const {stroked, filled, extruded, wireframe, material, transitions} = this.props;

    // Rendering props underlying layer
    const {
      lineWidthUnits,
      lineWidthScale,
      lineWidthMinPixels,
      lineWidthMaxPixels,
      lineJointRounded,
      lineMiterLimit,
      pointRadiusUnits,
      pointRadiusScale,
      pointRadiusMinPixels,
      pointRadiusMaxPixels,
      elevationScale,
      lineDashJustified
    } = this.props;

    // Accessor props for underlying layers
    const {
      getLineColor,
      getFillColor,
      getRadius,
      getLineWidth,
      getLineDashArray,
      getElevation,
      updateTriggers
    } = this.props;

    const PolygonFillLayer = this.getSubLayerClass('polygons-fill', SolidPolygonLayer);
    const PolygonStrokeLayer = this.getSubLayerClass('polygons-stroke', PathLayer);
    const LineStringsLayer = this.getSubLayerClass('line-strings', PathLayer);
    const PointsLayer = this.getSubLayerClass('points', ScatterplotLayer);

    // Filled Polygon Layer
    const polygonFillLayer =
      this.shouldRenderSubLayer('polygons-fill', polygonFeatures) &&
      new PolygonFillLayer(
        {
          _dataDiff: featuresDiff.polygonFeatures && (() => featuresDiff.polygonFeatures),

          extruded,
          elevationScale,
          filled,
          wireframe,
          material,
          getElevation: this.getSubLayerAccessor(getElevation),
          getFillColor: this.getSubLayerAccessor(getFillColor),
          getLineColor: this.getSubLayerAccessor(getLineColor),

          transitions: transitions && {
            getPolygon: transitions.geometry,
            getElevation: transitions.getElevation,
            getFillColor: transitions.getFillColor,
            getLineColor: transitions.getLineColor
          }
        },
        this.getSubLayerProps({
          id: 'polygons-fill',
          updateTriggers: {
            getElevation: updateTriggers.getElevation,
            getFillColor: updateTriggers.getFillColor,
            getLineColor: updateTriggers.getLineColor
          }
        }),
        {
          data: polygonFeatures,
          getPolygon: getCoordinates
        }
      );

    const polygonLineLayer =
      !extruded &&
      stroked &&
      this.shouldRenderSubLayer('polygons-stroke', polygonOutlineFeatures) &&
      new PolygonStrokeLayer(
        {
          _dataDiff:
            featuresDiff.polygonOutlineFeatures && (() => featuresDiff.polygonOutlineFeatures),

          widthUnits: lineWidthUnits,
          widthScale: lineWidthScale,
          widthMinPixels: lineWidthMinPixels,
          widthMaxPixels: lineWidthMaxPixels,
          rounded: lineJointRounded,
          miterLimit: lineMiterLimit,
          dashJustified: lineDashJustified,

          getColor: this.getSubLayerAccessor(getLineColor),
          getWidth: this.getSubLayerAccessor(getLineWidth),
          getDashArray: this.getSubLayerAccessor(getLineDashArray),

          transitions: transitions && {
            getPath: transitions.geometry,
            getColor: transitions.getLineColor,
            getWidth: transitions.getLineWidth
          }
        },
        this.getSubLayerProps({
          id: 'polygons-stroke',
          updateTriggers: {
            getColor: updateTriggers.getLineColor,
            getWidth: updateTriggers.getLineWidth,
            getDashArray: updateTriggers.getLineDashArray
          }
        }),
        {
          data: polygonOutlineFeatures,
          getPath: getCoordinates
        }
      );

    const pathLayer =
      this.shouldRenderSubLayer('linestrings', lineFeatures) &&
      new LineStringsLayer(
        {
          _dataDiff: featuresDiff.lineFeatures && (() => featuresDiff.lineFeatures),

          widthUnits: lineWidthUnits,
          widthScale: lineWidthScale,
          widthMinPixels: lineWidthMinPixels,
          widthMaxPixels: lineWidthMaxPixels,
          rounded: lineJointRounded,
          miterLimit: lineMiterLimit,
          dashJustified: lineDashJustified,

          getColor: this.getSubLayerAccessor(getLineColor),
          getWidth: this.getSubLayerAccessor(getLineWidth),
          getDashArray: this.getSubLayerAccessor(getLineDashArray),

          transitions: transitions && {
            getPath: transitions.geometry,
            getColor: transitions.getLineColor,
            getWidth: transitions.getLineWidth
          }
        },
        this.getSubLayerProps({
          id: 'line-strings',
          updateTriggers: {
            getColor: updateTriggers.getLineColor,
            getWidth: updateTriggers.getLineWidth,
            getDashArray: updateTriggers.getLineDashArray
          }
        }),
        {
          data: lineFeatures,
          getPath: getCoordinates
        }
      );

    const pointLayer =
      this.shouldRenderSubLayer('points', pointFeatures) &&
      new PointsLayer(
        {
          _dataDiff: featuresDiff.pointFeatures && (() => featuresDiff.pointFeatures),

          stroked,
          filled,
          radiusUnits: pointRadiusUnits,
          radiusScale: pointRadiusScale,
          radiusMinPixels: pointRadiusMinPixels,
          radiusMaxPixels: pointRadiusMaxPixels,
          lineWidthUnits,
          lineWidthScale,
          lineWidthMinPixels,
          lineWidthMaxPixels,

          getFillColor: this.getSubLayerAccessor(getFillColor),
          getLineColor: this.getSubLayerAccessor(getLineColor),
          getRadius: this.getSubLayerAccessor(getRadius),
          getLineWidth: this.getSubLayerAccessor(getLineWidth),

          transitions: transitions && {
            getPosition: transitions.geometry,
            getFillColor: transitions.getFillColor,
            getLineColor: transitions.getLineColor,
            getRadius: transitions.getRadius,
            getLineWidth: transitions.getLineWidth
          }
        },
        this.getSubLayerProps({
          id: 'points',
          updateTriggers: {
            getFillColor: updateTriggers.getFillColor,
            getLineColor: updateTriggers.getLineColor,
            getRadius: updateTriggers.getRadius,
            getLineWidth: updateTriggers.getLineWidth
          }
        }),
        {
          data: pointFeatures,
          getPosition: getCoordinates,
          highlightedObjectIndex: this._getHighlightedIndex(pointFeatures)
        }
      );

    return [
      // If not extruded: flat fill layer is drawn below outlines
      !extruded && polygonFillLayer,
      polygonLineLayer,
      pathLayer,
      pointLayer,
      // If extruded: draw fill layer last for correct blending behavior
      extruded && polygonFillLayer
    ];
  }
  /* eslint-enable complexity */

  _getHighlightedIndex(data) {
    const {highlightedObjectIndex} = this.props;
    return Number.isFinite(highlightedObjectIndex)
      ? data.findIndex(d => d.__source.index === highlightedObjectIndex)
      : null;
  }
}

GeoJsonLayer.layerName = 'GeoJsonLayer';
GeoJsonLayer.defaultProps = defaultProps;
