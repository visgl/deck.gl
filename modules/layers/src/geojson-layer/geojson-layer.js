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
import {
  DEFAULT_CHAR_SET,
  DEFAULT_FONT_FAMILY,
  DEFAULT_FONT_WEIGHT
} from '../text-layer/font-atlas-manager';
import PathLayer from '../path-layer/path-layer';
// Use primitive layer to avoid "Composite Composite" layers for now
import SolidPolygonLayer from '../solid-polygon-layer/solid-polygon-layer';
import {replaceInRange} from '../utils';
import {binaryToFeatureForAccesor} from './geojson-binary';
import PointsLayerClassMap from './points-layer-class-map';

import {getGeojsonFeatures, separateGeojsonFeatures} from './geojson';
import {createLayerPropsFromFeatures, createLayerPropsFromBinary} from './geojson-layer-props';

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
  lineCapRounded: false,
  lineMiterLimit: 4,

  elevationScale: 1,

  pointType: 'circle',

  // Point props
  sizeUnits: 'pixels',
  sizeScale: 1,
  sizeMinPixels: 0,
  sizeMaxPixels: Number.MAX_SAFE_INTEGER,

  alphaCutoff: 0.05,
  billboard: true,
  iconAtlas: {type: 'string', value: null},
  iconMapping: {},
  onIconError: null,

  background: false,
  backgroundPadding: [0, 0],
  characterSet: DEFAULT_CHAR_SET,
  fontFamily: DEFAULT_FONT_FAMILY,
  lineHeight: 1,
  fontWeight: DEFAULT_FONT_WEIGHT,
  fontSettings: {},
  maxWidth: -1,
  outlineWidth: 0,
  outlineColor: [0, 0, 0, 255],
  wordBreak: 'break-word',

  // Point (text) alignement baseline
  getAlignmentBaseline: {type: 'accessor', value: 'center'},
  // Point (icon & text) angle
  getAngle: {type: 'accessor', value: 0},
  // Point (text) background color
  getBackgroundColor: {type: 'accessor', value: [255, 255, 255, 255]},
  // Point (text) border color
  getBorderColor: {type: 'accessor', value: [0, 0, 0, 255]},
  // Point (text) border width
  getBorderWidth: {type: 'accessor', value: 0},
  // Polygon extrusion accessor
  getElevation: {type: 'accessor', value: 1000},
  // Point (circle) and polygon fill color
  getFillColor: {type: 'accessor', value: defaultFillColor},
  // Point (icon) icon
  getIcon: {type: 'accessor', value: x => x.icon},
  // Line and polygon outline color
  getLineColor: {type: 'accessor', value: defaultLineColor},
  // Line and polygon outline accessors
  getLineWidth: {type: 'accessor', value: 1},
  // Point (icon & text) pixel offset
  getPixelOffset: {type: 'accessor', value: [0, 0]},
  // Point (icon & text) size
  getPointSize: {type: 'accessor', value: 32},
  // Point (text) text
  getText: {type: 'accessor', value: x => x.properties?.name},
  // Point (text) text anchor
  getTextAnchor: {type: 'accessor', value: 'middle'},

  // Optional material for 'lighting' shader module
  material: true,

  // deprecated
  getRadius: {deprecatedFor: 'getPointSize'},
  pointRadiusUnits: {deprecatedFor: 'sizeUnits'},
  pointRadiusScale: {deprecatedFor: 'sizeScale'},
  pointRadiusMinPixels: {deprecatedFor: 'sizeMinPixels'},
  pointRadiusMaxPixels: {deprecatedFor: 'sizeMaxPixels'}
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

  /* eslint-disable complexity, max-statements */
  renderLayers() {
    // Layer composition props
    const {stroked, filled, extruded, wireframe, material, transitions} = this.props;

    // Rendering props underlying layer
    const {
      alphaCutoff,
      background,
      backgroundPadding,
      billboard,
      characterSet,
      elevationScale,
      fontFamily,
      fontSettings,
      fontWeight,
      iconAtlas,
      iconMapping,
      lineCapRounded,
      lineDashJustified,
      lineHeight,
      lineJointRounded,
      lineMiterLimit,
      lineWidthMaxPixels,
      lineWidthMinPixels,
      lineWidthScale,
      lineWidthUnits,
      maxWidth,
      onIconError,
      outlineColor,
      outlineWidth,
      pointType,
      sizeMaxPixels,
      sizeMinPixels,
      sizeScale,
      sizeUnits,
      wordBreak
    } = this.props;

    // Accessor props for underlying layers
    const {
      getAlignmentBaseline,
      getAngle,
      getBackgroundColor,
      getBorderColor,
      getBorderWidth,
      getElevation,
      getFillColor,
      getIcon,
      getLineColor,
      getLineDashArray,
      getLineWidth,
      getPixelOffset,
      getPointSize,
      getText,
      getTextAnchor,
      updateTriggers
    } = this.props;

    const PolygonFillLayer = this.getSubLayerClass('polygons-fill', SolidPolygonLayer);
    const PolygonStrokeLayer = this.getSubLayerClass('polygons-stroke', PathLayer);
    const LineStringsLayer = this.getSubLayerClass('line-strings', PathLayer);

    let PointsLayerClass = PointsLayerClassMap[pointType];
    if (!PointsLayerClass) {
      PointsLayerClass = PointsLayerClassMap[defaultProps.pointType];
    }
    const PointsLayer = this.getSubLayerClass('points', PointsLayerClass);

    const {layerProps} = this.state;

    // Filled Polygon Layer
    const polygonFillLayer =
      this.shouldRenderSubLayer('polygons-fill', layerProps.polygons.data) &&
      new PolygonFillLayer(
        {
          extruded,
          elevationScale,
          filled,
          wireframe,
          material,
          getElevation: this.getSubLayerAccessor(getElevation),
          getFillColor: this.getSubLayerAccessor(getFillColor),
          getLineColor: this.getSubLayerAccessor(
            extruded && wireframe ? getLineColor : defaultLineColor
          ),
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
            // using a legacy API to invalid lineColor attributes
            // if (extruded && wireframe) has changed
            lineColors: extruded && wireframe,
            getLineColor: updateTriggers.getLineColor
          }
        }),
        layerProps.polygons
      );

    const polygonLineLayer =
      !extruded &&
      stroked &&
      this.shouldRenderSubLayer('polygons-stroke', layerProps.polygonsOutline.data) &&
      new PolygonStrokeLayer(
        {
          widthUnits: lineWidthUnits,
          widthScale: lineWidthScale,
          widthMinPixels: lineWidthMinPixels,
          widthMaxPixels: lineWidthMaxPixels,
          jointRounded: lineJointRounded,
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
        layerProps.polygonsOutline
      );

    const pathLayer =
      this.shouldRenderSubLayer('line-strings', layerProps.lines.data) &&
      new LineStringsLayer(
        {
          widthUnits: lineWidthUnits,
          widthScale: lineWidthScale,
          widthMinPixels: lineWidthMinPixels,
          widthMaxPixels: lineWidthMaxPixels,
          jointRounded: lineJointRounded,
          capRounded: lineCapRounded,
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
        layerProps.lines
      );

    let pointLayerProps;
    let pointLayerUpdateTriggers;
    switch (pointType) {
      case 'circle':
        pointLayerProps = {
          stroked,
          filled,
          radiusUnits: sizeUnits,
          radiusScale: sizeScale,
          radiusMinPixels: sizeMinPixels,
          radiusMaxPixels: sizeMaxPixels,
          lineWidthUnits,
          lineWidthScale,
          lineWidthMinPixels,
          lineWidthMaxPixels,

          getFillColor: this.getSubLayerAccessor(getFillColor),
          getLineColor: this.getSubLayerAccessor(getLineColor),
          getRadius: this.getSubLayerAccessor(getPointSize),
          getLineWidth: this.getSubLayerAccessor(getLineWidth),

          transitions: transitions && {
            getPosition: transitions.geometry,
            getFillColor: transitions.getFillColor,
            getLineColor: transitions.getLineColor,
            getRadius: transitions.getPointSize,
            getLineWidth: transitions.getLineWidth
          }
        };
        pointLayerUpdateTriggers = {
          getFillColor: updateTriggers.getFillColor,
          getLineColor: updateTriggers.getLineColor,
          getRadius: updateTriggers.getPointSize,
          getLineWidth: updateTriggers.getLineWidth
        };
        break;
      case 'icon':
        pointLayerProps = {
          alphaCutoff,
          billboard,
          iconAtlas,
          iconMapping,
          onIconError,
          sizeMaxPixels,
          sizeMinPixels,
          sizeScale,
          sizeUnits,

          getAngle: this.getSubLayerAccessor(getAngle),
          getColor: this.getSubLayerAccessor(getFillColor),
          getIcon: this.getSubLayerAccessor(getIcon),
          getPixelOffset: this.getSubLayerAccessor(getPixelOffset),
          getSize: this.getSubLayerAccessor(getPointSize),

          transitions: transitions && {
            getPosition: transitions.geometry,
            getAngle: transitions.getAngle,
            getColor: transitions.getFillColor,
            getPixelOffset: transitions.getPixelOffset,
            getSize: transitions.getPointSize
          }
        };
        pointLayerUpdateTriggers = {
          getAngle: updateTriggers.getAngle,
          getColor: updateTriggers.getFillColor,
          getIcon: updateTriggers.getIcon,
          getPixelOffset: updateTriggers.getPixelOffset,
          getSize: updateTriggers.getSize
        };
        break;
      case 'text':
        pointLayerProps = {
          background,
          backgroundPadding,
          billboard,
          characterSet,
          fontFamily,
          fontSettings,
          fontWeight,
          lineHeight,
          maxWidth,
          outlineColor,
          outlineWidth,
          sizeMaxPixels,
          sizeMinPixels,
          sizeScale,
          sizeUnits,
          wordBreak,

          getAlignmentBaseline: this.getSubLayerAccessor(getAlignmentBaseline),
          getAngle: this.getSubLayerAccessor(getAngle),
          getBackgroundColor: this.getSubLayerAccessor(getBackgroundColor),
          getBorderColor: this.getSubLayerAccessor(getBorderColor),
          getBorderWidth: this.getSubLayerAccessor(getBorderWidth),
          getColor: this.getSubLayerAccessor(getFillColor),
          getPixelOffset: this.getSubLayerAccessor(getPixelOffset),
          getSize: this.getSubLayerAccessor(getPointSize),
          getText: this.getSubLayerAccessor(getText),
          getTextAnchor: this.getSubLayerAccessor(getTextAnchor),

          transitions: transitions && {
            getPosition: transitions.geometry,
            getAlignmentBaseline: transitions.getAlignmentBaseline,
            getAngle: transitions.getAngle,
            getBackgroundColor: transitions.getBackgroundColor,
            getBorderColor: transitions.getBorderColor,
            getBorderWidth: transitions.getBorderWidth,
            getColor: transitions.getFillColor,
            getPixelOffset: transitions.getPixelOffset,
            getSize: transitions.getPointSize,
            getText: transitions.getText,
            getTextAnchor: transitions.getTextAnchor
          }
        };
        pointLayerUpdateTriggers = {
          getAlignmentBaseline: updateTriggers.getAlignmentBaseline,
          getAngle: updateTriggers.getAngle,
          getBackgroundColor: updateTriggers.getBackgroundColor,
          getBorderColor: updateTriggers.getBorderColor,
          getBorderWidth: updateTriggers.getBorderWidth,
          getColor: updateTriggers.getFillColor,
          getPixelOffset: updateTriggers.getPixelOffset,
          getSize: updateTriggers.getPointSize,
          getText: updateTriggers.getText,
          getTextAnchor: updateTriggers.getTextAnchor
        };
        break;
      default:
    }

    const pointsSubLayerProps = this.getSubLayerProps({
      id: 'points',
      type: PointsLayerClass,
      updateTriggers: pointLayerUpdateTriggers
    });
    const pointLayer =
      this.shouldRenderSubLayer('points', layerProps.points.data) &&
      new PointsLayer(pointLayerProps, pointsSubLayerProps, {
        ...layerProps.points,
        highlightedObjectIndex: this._getHighlightedIndex(layerProps.points.data)
      });

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
