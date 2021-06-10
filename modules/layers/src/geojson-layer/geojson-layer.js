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
import {replaceInRange} from '../utils';
import {binaryToFeatureForAccesor} from './geojson-binary';
import {
  POINT_LAYER,
  LINE_LAYER,
  POLYGON_LAYER,
  getDefaultProps,
  forwardProps
} from './sub-layer-map';

import {getGeojsonFeatures, separateGeojsonFeatures} from './geojson';
import {createLayerPropsFromFeatures, createLayerPropsFromBinary} from './geojson-layer-props';

function parsePointType(pointType) {
  const types = new Set();
  for (const type of pointType.split('+')) {
    if (type in POINT_LAYER) {
      types.add(type);
    }
  }
  return Array.from(types);
}

const defaultProps = {
  ...getDefaultProps(POINT_LAYER.circle),
  ...getDefaultProps(POINT_LAYER.icon),
  ...getDefaultProps(POINT_LAYER.text),
  ...getDefaultProps(LINE_LAYER),
  ...getDefaultProps(POLYGON_LAYER),

  stroked: true,
  filled: true,
  extruded: false,
  wireframe: false,
  pointType: 'circle',

  // TODO: deprecated, remove in v9
  getRadius: {deprecatedFor: 'getPointRadius'}
};

export default class GeoJsonLayer extends CompositeLayer {
  initializeState() {
    this.state = {
      layerProps: {},
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
    const {data} = this.props;
    const binary = data && 'points' in data && 'polygons' in data && 'lines' in data;

    this.setState({binary});

    if (binary) {
      this._updateStateBinary({props, changeFlags});
    } else {
      this._updateStateJSON({props, changeFlags});
    }
  }

  _updateStateBinary({props, changeFlags}) {
    const layerProps = createLayerPropsFromBinary(props.data, this.encodePickingColor);
    this.setState({layerProps});
  }

  _updateStateJSON({props, changeFlags}) {
    const features = getGeojsonFeatures(props.data);
    const wrapFeature = this.getSubLayerRow.bind(this);
    let newFeatures = {};
    const featuresDiff = {};

    if (Array.isArray(changeFlags.dataChanged)) {
      const oldFeatures = this.state.features;
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
    } else {
      newFeatures = separateGeojsonFeatures(features, wrapFeature);
    }

    const layerProps = createLayerPropsFromFeatures(newFeatures, featuresDiff);

    this.setState({
      features: newFeatures,
      featuresDiff,
      layerProps
    });
  }

  _updateAutoHighlight(info) {
    // All sub layers except the points layer use source feature index to encode the picking color
    // The points layer uses indices from the points data array.
    const sourceIsPoints = info.sourceLayer.id.endsWith('points');
    for (const layer of this.getSubLayers()) {
      if (layer.id.endsWith('points') === sourceIsPoints) {
        layer.updateAutoHighlight(info);
      }
    }
  }

  /* eslint-disable complexity */
  renderLayers() {
    const {pointType, extruded, stroked, wireframe} = this.props;
    const {layerProps} = this.state;

    const PolygonFillLayer =
      this.shouldRenderSubLayer('polygons-fill', layerProps.polygons.data) &&
      this.getSubLayerClass('polygons-fill', POLYGON_LAYER.type);
    const PolygonStrokeLayer =
      !extruded &&
      stroked &&
      this.shouldRenderSubLayer('polygons-stroke', layerProps.polygonsOutline.data) &&
      this.getSubLayerClass('polygons-stroke', LINE_LAYER.type);
    const LineStringsLayer =
      this.shouldRenderSubLayer('linestrings', layerProps.lines.data) &&
      this.getSubLayerClass('linestrings', LINE_LAYER.type);

    // Filled Polygon Layer
    let polygonFillLayer = null;
    if (PolygonFillLayer) {
      const forwardedProps = forwardProps(this, POLYGON_LAYER.props);
      // Avoid building the lineColors attribute if wireframe is off
      const useLineColor = extruded && wireframe;
      if (!useLineColor) {
        delete forwardedProps.getLineColor;
      }
      // using a legacy API to invalid lineColor attributes
      forwardedProps.updateTriggers.lineColors = useLineColor;

      polygonFillLayer = new PolygonFillLayer(
        forwardedProps,
        this.getSubLayerProps({
          id: 'polygons-fill',
          updateTriggers: forwardedProps.updateTriggers
        }),
        layerProps.polygons
      );
    }

    let polygonLineLayer = null;
    let pathLayer = null;
    if (PolygonStrokeLayer || LineStringsLayer) {
      const forwardedProps = forwardProps(this, LINE_LAYER.props);

      polygonLineLayer =
        PolygonStrokeLayer &&
        new PolygonStrokeLayer(
          forwardedProps,
          this.getSubLayerProps({
            id: 'polygons-stroke',
            updateTriggers: forwardedProps.updateTriggers
          }),
          layerProps.polygonsOutline
        );

      pathLayer =
        LineStringsLayer &&
        new LineStringsLayer(
          forwardedProps,
          this.getSubLayerProps({
            id: 'linestrings',
            updateTriggers: forwardedProps.updateTriggers
          }),
          layerProps.lines
        );
    }

    const pointLayers = [];
    for (const type of parsePointType(pointType)) {
      const id = `points-${type}`;
      const PointLayerMapping = POINT_LAYER[type];
      const PointsLayer =
        this.shouldRenderSubLayer(id, layerProps.points.data) &&
        this.getSubLayerClass(id, PointLayerMapping.type);
      if (PointsLayer) {
        const forwardedProps = forwardProps(this, PointLayerMapping.props);

        pointLayers.push(
          new PointsLayer(
            forwardedProps,
            this.getSubLayerProps({
              id,
              updateTriggers: forwardedProps.updateTriggers,
              highlightedObjectIndex: this._getHighlightedIndex(layerProps.points.data)
            }),
            layerProps.points
          )
        );
      }
    }

    return [
      // If not extruded: flat fill layer is drawn below outlines
      !extruded && polygonFillLayer,
      polygonLineLayer,
      pathLayer,
      pointLayers,
      // If extruded: draw fill layer last for correct blending behavior
      extruded && polygonFillLayer
    ];
  }

  _getHighlightedIndex(data) {
    const {highlightedObjectIndex} = this.props;
    const {binary} = this.state;

    if (!binary) {
      return Number.isFinite(highlightedObjectIndex)
        ? data.findIndex(d => d.__source.index === highlightedObjectIndex)
        : null;
    }
    return highlightedObjectIndex;
  }

  getSubLayerAccessor(accessor) {
    const {binary} = this.state;
    if (!binary || typeof accessor !== 'function') {
      return super.getSubLayerAccessor(accessor);
    }

    return (object, info) => {
      const {data, index} = info;
      const feature = binaryToFeatureForAccesor(data, index);
      return accessor(feature, info);
    };
  }
}

GeoJsonLayer.layerName = 'GeoJsonLayer';
GeoJsonLayer.defaultProps = defaultProps;
