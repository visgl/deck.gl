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

import {CompositeLayer, get} from '../../../lib';
import ScatterplotLayer from '../scatterplot-layer/scatterplot-layer';
import PathLayer from '../path-layer/path-layer';
// Use primitive layer to avoid "Composite Composite" layers for now
import SolidPolygonLayer from '../solid-polygon-layer/solid-polygon-layer';

import {getGeojsonFeatures, separateGeojsonFeatures} from './geojson';

const defaultLineColor = [0x0, 0x0, 0x0, 0xFF];
const defaultFillColor = [0x0, 0x0, 0x0, 0xFF];

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

  fp64: false,

  // Line and polygon outline color
  getLineColor: f => get(f, 'properties.lineColor') || defaultLineColor,
  // Point and polygon fill color
  getFillColor: f => get(f, 'properties.fillColor') || defaultFillColor,
  // Point radius
  getRadius: f => get(f, 'properties.radius') || get(f, 'properties.size') || 1,
  // Line and polygon outline accessors
  getLineWidth: f => get(f, 'properties.lineWidth') || 1,
  // Polygon extrusion accessor
  getElevation: f => get(f, 'properties.elevation') || 1000,

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

const getCoordinates = f => get(f, 'geometry.coordinates');

export default class GeoJsonLayer extends CompositeLayer {
  initializeState() {
    this.state = {
      features: {}
    };
  }

  updateState({oldProps, props, changeFlags}) {
    if (changeFlags.dataChanged) {
      const {data} = this.props;
      const features = getGeojsonFeatures(data);
      this.state.features = separateGeojsonFeatures(features);
    }
  }

  getPickingInfo({info}) {
    return Object.assign(info, {
      // override object with picked feature
      object: (info.object && info.object.feature) || info.object
    });
  }

  renderLayers() {
    const {features} = this.state;
    const {pointFeatures, lineFeatures, polygonFeatures, polygonOutlineFeatures} = features;

    // Layer composition props
    const {id, stroked, filled, extruded, wireframe, lightSettings} = this.props;

    // Rendering props underlying layer
    const {lineWidthScale, lineWidthMinPixels, lineWidthMaxPixels,
      lineJointRounded, lineMiterLimit,
      pointRadiusScale, pointRadiusMinPixels, pointRadiusMaxPixels,
      elevationScale,
      fp64} = this.props;

    // Accessor props for underlying layers
    const {getLineColor, getFillColor, getRadius,
      getLineWidth, getElevation, updateTriggers} = this.props;

    const drawPoints = pointFeatures && pointFeatures.length > 0;
    const drawLines = lineFeatures && lineFeatures.length > 0;
    const hasPolygonLines = polygonOutlineFeatures && polygonOutlineFeatures.length > 0;
    const hasPolygon = polygonFeatures && polygonFeatures.length > 0;

    // base layer props
    const {opacity, pickable, visible, parameters, getPolygonOffset} = this.props;
    // viewport props
    const {positionOrigin, projectionMode, modelMatrix} = this.props;

    const forwardProps = {
      // Forward layer props
      opacity, pickable, visible, parameters, getPolygonOffset,
      // Forward viewport props
      projectionMode, positionOrigin, modelMatrix,
      // Forward common props
      fp64
    };

    // Filled Polygon Layer
    const polygonFillLayer = filled &&
      hasPolygon &&
      new SolidPolygonLayer(Object.assign({}, forwardProps, {
        id: `${id}-polygon-fill`,
        data: polygonFeatures,

        extruded,
        elevationScale,
        wireframe: false,
        lightSettings,
        getPolygon: getCoordinates,
        getElevation,
        getColor: getFillColor,
        updateTriggers: {
          getElevation: updateTriggers.getElevation,
          getColor: updateTriggers.getFillColor
        }
      }));

    const polygonWireframeLayer = wireframe &&
      extruded &&
      hasPolygon &&
      new SolidPolygonLayer(Object.assign({}, forwardProps, {
        id: `${id}-polygon-wireframe`,
        data: polygonFeatures,

        extruded,
        elevationScale,
        wireframe: true,
        getPolygon: getCoordinates,
        getElevation,
        getColor: getLineColor,
        updateTriggers: {
          getElevation: updateTriggers.getElevation,
          getColor: updateTriggers.getLineColor
        }
      }));

    const polygonLineLayer = !extruded &&
      stroked &&
      hasPolygonLines &&
      new PathLayer(Object.assign({}, forwardProps, {
        id: `${id}-polygon-outline`,
        data: polygonOutlineFeatures,
        widthScale: lineWidthScale,
        widthMinPixels: lineWidthMinPixels,
        widthMaxPixels: lineWidthMaxPixels,
        rounded: lineJointRounded,
        miterLimit: lineMiterLimit,

        getPath: getCoordinates,
        getColor: getLineColor,
        getWidth: getLineWidth,
        updateTriggers: {
          getColor: updateTriggers.getLineColor,
          getWidth: updateTriggers.getLineWidth
        }
      }));

    const pathLayer = drawLines && new PathLayer(Object.assign({}, forwardProps, {
      id: `${id}-line-paths`,
      data: lineFeatures,

      widthScale: lineWidthScale,
      widthMinPixels: lineWidthMinPixels,
      widthMaxPixels: lineWidthMaxPixels,
      rounded: lineJointRounded,
      miterLimit: lineMiterLimit,

      getPath: getCoordinates,
      getColor: getLineColor,
      getWidth: getLineWidth,
      updateTriggers: {
        getColor: updateTriggers.getLineColor,
        getWidth: updateTriggers.getLineWidth
      }
    }));

    const pointLayer = drawPoints && new ScatterplotLayer(Object.assign({}, forwardProps, {
      id: `${id}-points`,
      data: pointFeatures,

      radiusScale: pointRadiusScale,
      radiusMinPixels: pointRadiusMinPixels,
      radiusMaxPixels: pointRadiusMaxPixels,

      getPosition: getCoordinates,
      getColor: getFillColor,
      getRadius,
      updateTriggers: {
        getColor: updateTriggers.getFillColor,
        getRadius: updateTriggers.getRadius
      }
    }));

    return [
      // If not extruded: flat fill layer is drawn below outlines
      !extruded && polygonFillLayer,
      polygonWireframeLayer,
      polygonLineLayer,
      pathLayer,
      pointLayer,
      // If extruded: draw fill layer last for correct blending behavior
      extruded && polygonFillLayer
    ];
  }
}

GeoJsonLayer.layerName = 'GeoJsonLayer';
GeoJsonLayer.defaultProps = defaultProps;
