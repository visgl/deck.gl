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

const defaultProps = {
  ...getDefaultProps(POINT_LAYER.circle),
  ...getDefaultProps(POINT_LAYER.icon),
  ...getDefaultProps(POINT_LAYER.text),
  ...getDefaultProps(LINE_LAYER),
  ...getDefaultProps(POLYGON_LAYER),

  // Overwrite sub layer defaults
  stroked: true,
  filled: true,
  extruded: false,
  wireframe: false,
  iconAtlas: {type: 'object', value: null},
  iconMapping: {type: 'object', value: {}},
  getIcon: {type: 'accessor', value: f => f.properties.icon},
  getText: {type: 'accessor', value: f => f.properties.text},

  // Self props
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
    const pointLayerIdPrefix = `${this.id}-points-`;
    const sourceIsPoints = info.sourceLayer.id.startsWith(pointLayerIdPrefix);
    for (const layer of this.getSubLayers()) {
      if (layer.id.startsWith(pointLayerIdPrefix) === sourceIsPoints) {
        layer.updateAutoHighlight(info);
      }
    }
  }

  _renderPolygonLayer() {
    const {extruded, wireframe} = this.props;
    const {layerProps} = this.state;
    const id = 'polygons-fill';

    const PolygonFillLayer =
      this.shouldRenderSubLayer(id, layerProps.polygons.data) &&
      this.getSubLayerClass(id, POLYGON_LAYER.type);

    if (PolygonFillLayer) {
      const forwardedProps = forwardProps(this, POLYGON_LAYER.props);
      // Avoid building the lineColors attribute if wireframe is off
      const useLineColor = extruded && wireframe;
      if (!useLineColor) {
        delete forwardedProps.getLineColor;
      }
      // using a legacy API to invalid lineColor attributes
      forwardedProps.updateTriggers.lineColors = useLineColor;

      return new PolygonFillLayer(
        forwardedProps,
        this.getSubLayerProps({
          id,
          updateTriggers: forwardedProps.updateTriggers
        }),
        layerProps.polygons
      );
    }
    return null;
  }

  _renderLineLayers() {
    const {extruded, stroked} = this.props;
    const {layerProps} = this.state;
    const polygonStrokeLayerId = 'polygons-stroke';
    const lineStringsLayerId = 'linestrings';

    const PolygonStrokeLayer =
      !extruded &&
      stroked &&
      this.shouldRenderSubLayer(polygonStrokeLayerId, layerProps.polygonsOutline.data) &&
      this.getSubLayerClass(polygonStrokeLayerId, LINE_LAYER.type);
    const LineStringsLayer =
      this.shouldRenderSubLayer(lineStringsLayerId, layerProps.lines.data) &&
      this.getSubLayerClass(lineStringsLayerId, LINE_LAYER.type);

    if (PolygonStrokeLayer || LineStringsLayer) {
      const forwardedProps = forwardProps(this, LINE_LAYER.props);

      return [
        PolygonStrokeLayer &&
          new PolygonStrokeLayer(
            forwardedProps,
            this.getSubLayerProps({
              id: polygonStrokeLayerId,
              updateTriggers: forwardedProps.updateTriggers
            }),
            layerProps.polygonsOutline
          ),

        LineStringsLayer &&
          new LineStringsLayer(
            forwardedProps,
            this.getSubLayerProps({
              id: lineStringsLayerId,
              updateTriggers: forwardedProps.updateTriggers
            }),
            layerProps.lines
          )
      ];
    }
    return null;
  }

  _renderPointLayers() {
    const {pointType} = this.props;
    const {layerProps, binary} = this.state;
    let {highlightedObjectIndex} = this.props;

    if (!binary && Number.isFinite(highlightedObjectIndex)) {
      highlightedObjectIndex = layerProps.points.data.findIndex(
        d => d.__source.index === highlightedObjectIndex
      );
    }

    // Avoid duplicate sub layer ids
    const types = new Set(pointType.split('+'));
    const pointLayers = [];
    for (const type of types) {
      const id = `points-${type}`;
      const PointLayerMapping = POINT_LAYER[type];
      const PointsLayer =
        PointLayerMapping &&
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
              highlightedObjectIndex
            }),
            layerProps.points
          )
        );
      }
    }
    return pointLayers;
  }

  renderLayers() {
    const {extruded} = this.props;

    const polygonFillLayer = this._renderPolygonLayer();
    const lineLayers = this._renderLineLayers();
    const pointLayers = this._renderPointLayers();

    return [
      // If not extruded: flat fill layer is drawn below outlines
      !extruded && polygonFillLayer,
      lineLayers,
      pointLayers,
      // If extruded: draw fill layer last for correct blending behavior
      extruded && polygonFillLayer
    ];
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
