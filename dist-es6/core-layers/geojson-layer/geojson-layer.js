var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

import { CompositeLayer, experimental } from '../../core';
var get = experimental.get;

import ScatterplotLayer from '../scatterplot-layer/scatterplot-layer';
import PathLayer from '../path-layer/path-layer';
// Use primitive layer to avoid "Composite Composite" layers for now
import SolidPolygonLayer from '../solid-polygon-layer/solid-polygon-layer';

import { getGeojsonFeatures, separateGeojsonFeatures } from './geojson';

var defaultLineColor = [0x0, 0x0, 0x0, 0xFF];
var defaultFillColor = [0x0, 0x0, 0x0, 0xFF];

var defaultProps = {
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
  getLineColor: function getLineColor(f) {
    return get(f, 'properties.lineColor') || defaultLineColor;
  },
  // Point and polygon fill color
  getFillColor: function getFillColor(f) {
    return get(f, 'properties.fillColor') || defaultFillColor;
  },
  // Point radius
  getRadius: function getRadius(f) {
    return get(f, 'properties.radius') || get(f, 'properties.size') || 1;
  },
  // Line and polygon outline accessors
  getLineWidth: function getLineWidth(f) {
    return get(f, 'properties.lineWidth') || 1;
  },
  // Polygon extrusion accessor
  getElevation: function getElevation(f) {
    return get(f, 'properties.elevation') || 1000;
  },

  subLayers: {
    PointLayer: ScatterplotLayer,
    LineLayer: PathLayer,
    PolygonLayer: SolidPolygonLayer
  },

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

var getCoordinates = function getCoordinates(f) {
  return get(f, 'geometry.coordinates');
};

var GeoJsonLayer = function (_CompositeLayer) {
  _inherits(GeoJsonLayer, _CompositeLayer);

  function GeoJsonLayer() {
    _classCallCheck(this, GeoJsonLayer);

    return _possibleConstructorReturn(this, (GeoJsonLayer.__proto__ || Object.getPrototypeOf(GeoJsonLayer)).apply(this, arguments));
  }

  _createClass(GeoJsonLayer, [{
    key: 'initializeState',
    value: function initializeState() {
      this.state = {
        features: {}
      };
    }
  }, {
    key: 'updateState',
    value: function updateState(_ref) {
      var oldProps = _ref.oldProps,
          props = _ref.props,
          changeFlags = _ref.changeFlags;

      if (changeFlags.dataChanged) {
        var data = this.props.data;

        var features = getGeojsonFeatures(data);
        this.state.features = separateGeojsonFeatures(features);
      }
    }
  }, {
    key: 'getPickingInfo',
    value: function getPickingInfo(_ref2) {
      var info = _ref2.info;

      return Object.assign(info, {
        // override object with picked feature
        object: info.object && info.object.feature || info.object
      });
    }
  }, {
    key: 'renderLayers',
    value: function renderLayers() {
      var features = this.state.features;
      var pointFeatures = features.pointFeatures,
          lineFeatures = features.lineFeatures,
          polygonFeatures = features.polygonFeatures,
          polygonOutlineFeatures = features.polygonOutlineFeatures;

      // Layer composition props

      var _props = this.props,
          stroked = _props.stroked,
          filled = _props.filled,
          extruded = _props.extruded,
          wireframe = _props.wireframe,
          subLayers = _props.subLayers,
          lightSettings = _props.lightSettings;

      // Rendering props underlying layer

      var _props2 = this.props,
          lineWidthScale = _props2.lineWidthScale,
          lineWidthMinPixels = _props2.lineWidthMinPixels,
          lineWidthMaxPixels = _props2.lineWidthMaxPixels,
          lineJointRounded = _props2.lineJointRounded,
          lineMiterLimit = _props2.lineMiterLimit,
          pointRadiusScale = _props2.pointRadiusScale,
          pointRadiusMinPixels = _props2.pointRadiusMinPixels,
          pointRadiusMaxPixels = _props2.pointRadiusMaxPixels,
          elevationScale = _props2.elevationScale,
          fp64 = _props2.fp64;

      // Accessor props for underlying layers

      var _props3 = this.props,
          getLineColor = _props3.getLineColor,
          getFillColor = _props3.getFillColor,
          getRadius = _props3.getRadius,
          getLineWidth = _props3.getLineWidth,
          getElevation = _props3.getElevation,
          updateTriggers = _props3.updateTriggers;


      var drawPoints = pointFeatures && pointFeatures.length > 0;
      var drawLines = lineFeatures && lineFeatures.length > 0;
      var hasPolygonLines = polygonOutlineFeatures && polygonOutlineFeatures.length > 0;
      var hasPolygon = polygonFeatures && polygonFeatures.length > 0;

      // Filled Polygon Layer
      var polygonFillLayer = filled && hasPolygon && new subLayers.PolygonLayer(this.getSubLayerProps({
        id: 'polygon-fill',
        data: polygonFeatures,
        fp64: fp64,
        extruded: extruded,
        elevationScale: elevationScale,
        wireframe: false,
        lightSettings: lightSettings,
        getPolygon: getCoordinates,
        getElevation: getElevation,
        getColor: getFillColor,
        updateTriggers: {
          getElevation: updateTriggers.getElevation,
          getColor: updateTriggers.getFillColor
        }
      }));

      var polygonWireframeLayer = wireframe && extruded && hasPolygon && new subLayers.PolygonLayer(this.getSubLayerProps({
        id: 'polygon-wireframe',
        data: polygonFeatures,

        fp64: fp64,
        extruded: extruded,
        elevationScale: elevationScale,
        wireframe: true,
        getPolygon: getCoordinates,
        getElevation: getElevation,
        getColor: getLineColor,
        updateTriggers: {
          getElevation: updateTriggers.getElevation,
          getColor: updateTriggers.getLineColor
        }
      }));

      var polygonLineLayer = !extruded && stroked && hasPolygonLines && new subLayers.LineLayer(this.getSubLayerProps({
        id: 'polygon-outline',
        data: polygonOutlineFeatures,

        fp64: fp64,
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

      var pathLayer = drawLines && new subLayers.LineLayer(this.getSubLayerProps({
        id: 'line-paths',
        data: lineFeatures,

        fp64: fp64,
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

      var pointLayer = drawPoints && new subLayers.PointLayer(this.getSubLayerProps({
        id: 'points',
        data: pointFeatures,

        fp64: fp64,
        radiusScale: pointRadiusScale,
        radiusMinPixels: pointRadiusMinPixels,
        radiusMaxPixels: pointRadiusMaxPixels,

        getPosition: getCoordinates,
        getColor: getFillColor,
        getRadius: getRadius,
        updateTriggers: {
          getColor: updateTriggers.getFillColor,
          getRadius: updateTriggers.getRadius
        }
      }));

      return [
      // If not extruded: flat fill layer is drawn below outlines
      !extruded && polygonFillLayer, polygonWireframeLayer, polygonLineLayer, pathLayer, pointLayer,
      // If extruded: draw fill layer last for correct blending behavior
      extruded && polygonFillLayer];
    }
  }]);

  return GeoJsonLayer;
}(CompositeLayer);

export default GeoJsonLayer;


GeoJsonLayer.layerName = 'GeoJsonLayer';
GeoJsonLayer.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlLWxheWVycy9nZW9qc29uLWxheWVyL2dlb2pzb24tbGF5ZXIuanMiXSwibmFtZXMiOlsiQ29tcG9zaXRlTGF5ZXIiLCJleHBlcmltZW50YWwiLCJnZXQiLCJTY2F0dGVycGxvdExheWVyIiwiUGF0aExheWVyIiwiU29saWRQb2x5Z29uTGF5ZXIiLCJnZXRHZW9qc29uRmVhdHVyZXMiLCJzZXBhcmF0ZUdlb2pzb25GZWF0dXJlcyIsImRlZmF1bHRMaW5lQ29sb3IiLCJkZWZhdWx0RmlsbENvbG9yIiwiZGVmYXVsdFByb3BzIiwic3Ryb2tlZCIsImZpbGxlZCIsImV4dHJ1ZGVkIiwid2lyZWZyYW1lIiwibGluZVdpZHRoU2NhbGUiLCJsaW5lV2lkdGhNaW5QaXhlbHMiLCJsaW5lV2lkdGhNYXhQaXhlbHMiLCJOdW1iZXIiLCJNQVhfU0FGRV9JTlRFR0VSIiwibGluZUpvaW50Um91bmRlZCIsImxpbmVNaXRlckxpbWl0IiwiZWxldmF0aW9uU2NhbGUiLCJwb2ludFJhZGl1c1NjYWxlIiwicG9pbnRSYWRpdXNNaW5QaXhlbHMiLCJwb2ludFJhZGl1c01heFBpeGVscyIsImZwNjQiLCJnZXRMaW5lQ29sb3IiLCJmIiwiZ2V0RmlsbENvbG9yIiwiZ2V0UmFkaXVzIiwiZ2V0TGluZVdpZHRoIiwiZ2V0RWxldmF0aW9uIiwic3ViTGF5ZXJzIiwiUG9pbnRMYXllciIsIkxpbmVMYXllciIsIlBvbHlnb25MYXllciIsImxpZ2h0U2V0dGluZ3MiLCJsaWdodHNQb3NpdGlvbiIsImFtYmllbnRSYXRpbyIsImRpZmZ1c2VSYXRpbyIsInNwZWN1bGFyUmF0aW8iLCJsaWdodHNTdHJlbmd0aCIsIm51bWJlck9mTGlnaHRzIiwiZ2V0Q29vcmRpbmF0ZXMiLCJHZW9Kc29uTGF5ZXIiLCJzdGF0ZSIsImZlYXR1cmVzIiwib2xkUHJvcHMiLCJwcm9wcyIsImNoYW5nZUZsYWdzIiwiZGF0YUNoYW5nZWQiLCJkYXRhIiwiaW5mbyIsIk9iamVjdCIsImFzc2lnbiIsIm9iamVjdCIsImZlYXR1cmUiLCJwb2ludEZlYXR1cmVzIiwibGluZUZlYXR1cmVzIiwicG9seWdvbkZlYXR1cmVzIiwicG9seWdvbk91dGxpbmVGZWF0dXJlcyIsInVwZGF0ZVRyaWdnZXJzIiwiZHJhd1BvaW50cyIsImxlbmd0aCIsImRyYXdMaW5lcyIsImhhc1BvbHlnb25MaW5lcyIsImhhc1BvbHlnb24iLCJwb2x5Z29uRmlsbExheWVyIiwiZ2V0U3ViTGF5ZXJQcm9wcyIsImlkIiwiZ2V0UG9seWdvbiIsImdldENvbG9yIiwicG9seWdvbldpcmVmcmFtZUxheWVyIiwicG9seWdvbkxpbmVMYXllciIsIndpZHRoU2NhbGUiLCJ3aWR0aE1pblBpeGVscyIsIndpZHRoTWF4UGl4ZWxzIiwicm91bmRlZCIsIm1pdGVyTGltaXQiLCJnZXRQYXRoIiwiZ2V0V2lkdGgiLCJwYXRoTGF5ZXIiLCJwb2ludExheWVyIiwicmFkaXVzU2NhbGUiLCJyYWRpdXNNaW5QaXhlbHMiLCJyYWRpdXNNYXhQaXhlbHMiLCJnZXRQb3NpdGlvbiIsImxheWVyTmFtZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFRQSxjQUFSLEVBQXdCQyxZQUF4QixRQUEyQyxZQUEzQztJQUNPQyxHLEdBQU9ELFksQ0FBUEMsRzs7QUFDUCxPQUFPQyxnQkFBUCxNQUE2Qix3Q0FBN0I7QUFDQSxPQUFPQyxTQUFQLE1BQXNCLDBCQUF0QjtBQUNBO0FBQ0EsT0FBT0MsaUJBQVAsTUFBOEIsNENBQTlCOztBQUVBLFNBQVFDLGtCQUFSLEVBQTRCQyx1QkFBNUIsUUFBMEQsV0FBMUQ7O0FBRUEsSUFBTUMsbUJBQW1CLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLEVBQWdCLElBQWhCLENBQXpCO0FBQ0EsSUFBTUMsbUJBQW1CLENBQUMsR0FBRCxF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LGtCQUpvQjtBQUtwQjBELHFCQUFhN0QsZ0JBTE87QUFNcEI4RCx5QkFBaUI3RCxvQkFORztBQU9wQjhELHlCQUFpQjdELG9CQVBHOztBQVNwQjhELHFCQUFhM0MsY0FUTztBQVVwQjRCLGtCQUFVM0MsWUFWVTtBQVdwQkMsNEJBWG9CO0FBWXBCZ0Msd0JBQWdCO0FBQ2RVLG9CQUFVVixlQUFlakMsWUFEWDtBQUVkQyxxQkFBV2dDLGVBQWVoQztBQUZaO0FBWkksT0FBdEIsQ0FERixDQURGOztBQXFCQSxhQUFPO0FBQ0w7QUFDQSxPQUFDakIsUUFBRCxJQUFhdUQsZ0JBRlIsRUFHTEsscUJBSEssRUFJTEMsZ0JBSkssRUFLTFEsU0FMSyxFQU1MQyxVQU5LO0FBT0w7QUFDQXRFLGtCQUFZdUQsZ0JBUlAsQ0FBUDtBQVVEOzs7O0VBbkt1Q3BFLGM7O2VBQXJCNkMsWTs7O0FBc0tyQkEsYUFBYTJDLFNBQWIsR0FBeUIsY0FBekI7QUFDQTNDLGFBQWFuQyxZQUFiLEdBQTRCQSxZQUE1QiIsImZpbGUiOiJnZW9qc29uLWxheWVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IC0gMjAxNyBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCB7Q29tcG9zaXRlTGF5ZXIsIGV4cGVyaW1lbnRhbH0gZnJvbSAnLi4vLi4vY29yZSc7XG5jb25zdCB7Z2V0fSA9IGV4cGVyaW1lbnRhbDtcbmltcG9ydCBTY2F0dGVycGxvdExheWVyIGZyb20gJy4uL3NjYXR0ZXJwbG90LWxheWVyL3NjYXR0ZXJwbG90LWxheWVyJztcbmltcG9ydCBQYXRoTGF5ZXIgZnJvbSAnLi4vcGF0aC1sYXllci9wYXRoLWxheWVyJztcbi8vIFVzZSBwcmltaXRpdmUgbGF5ZXIgdG8gYXZvaWQgXCJDb21wb3NpdGUgQ29tcG9zaXRlXCIgbGF5ZXJzIGZvciBub3dcbmltcG9ydCBTb2xpZFBvbHlnb25MYXllciBmcm9tICcuLi9zb2xpZC1wb2x5Z29uLWxheWVyL3NvbGlkLXBvbHlnb24tbGF5ZXInO1xuXG5pbXBvcnQge2dldEdlb2pzb25GZWF0dXJlcywgc2VwYXJhdGVHZW9qc29uRmVhdHVyZXN9IGZyb20gJy4vZ2VvanNvbic7XG5cbmNvbnN0IGRlZmF1bHRMaW5lQ29sb3IgPSBbMHgwLCAweDAsIDB4MCwgMHhGRl07XG5jb25zdCBkZWZhdWx0RmlsbENvbG9yID0gWzB4MCwgMHgwLCAweDAsIDB4RkZdO1xuXG5jb25zdCBkZWZhdWx0UHJvcHMgPSB7XG4gIHN0cm9rZWQ6IHRydWUsXG4gIGZpbGxlZDogdHJ1ZSxcbiAgZXh0cnVkZWQ6IGZhbHNlLFxuICB3aXJlZnJhbWU6IGZhbHNlLFxuXG4gIGxpbmVXaWR0aFNjYWxlOiAxLFxuICBsaW5lV2lkdGhNaW5QaXhlbHM6IDAsXG4gIGxpbmVXaWR0aE1heFBpeGVsczogTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIsXG4gIGxpbmVKb2ludFJvdW5kZWQ6IGZhbHNlLFxuICBsaW5lTWl0ZXJMaW1pdDogNCxcblxuICBlbGV2YXRpb25TY2FsZTogMSxcblxuICBwb2ludFJhZGl1c1NjYWxlOiAxLFxuICBwb2ludFJhZGl1c01pblBpeGVsczogMCwgLy8gIG1pbiBwb2ludCByYWRpdXMgaW4gcGl4ZWxzXG4gIHBvaW50UmFkaXVzTWF4UGl4ZWxzOiBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUiwgLy8gbWF4IHBvaW50IHJhZGl1cyBpbiBwaXhlbHNcblxuICBmcDY0OiBmYWxzZSxcblxuICAvLyBMaW5lIGFuZCBwb2x5Z29uIG91dGxpbmUgY29sb3JcbiAgZ2V0TGluZUNvbG9yOiBmID0+IGdldChmLCAncHJvcGVydGllcy5saW5lQ29sb3InKSB8fCBkZWZhdWx0TGluZUNvbG9yLFxuICAvLyBQb2ludCBhbmQgcG9seWdvbiBmaWxsIGNvbG9yXG4gIGdldEZpbGxDb2xvcjogZiA9PiBnZXQoZiwgJ3Byb3BlcnRpZXMuZmlsbENvbG9yJykgfHwgZGVmYXVsdEZpbGxDb2xvcixcbiAgLy8gUG9pbnQgcmFkaXVzXG4gIGdldFJhZGl1czogZiA9PiBnZXQoZiwgJ3Byb3BlcnRpZXMucmFkaXVzJykgfHwgZ2V0KGYsICdwcm9wZXJ0aWVzLnNpemUnKSB8fCAxLFxuICAvLyBMaW5lIGFuZCBwb2x5Z29uIG91dGxpbmUgYWNjZXNzb3JzXG4gIGdldExpbmVXaWR0aDogZiA9PiBnZXQoZiwgJ3Byb3BlcnRpZXMubGluZVdpZHRoJykgfHwgMSxcbiAgLy8gUG9seWdvbiBleHRydXNpb24gYWNjZXNzb3JcbiAgZ2V0RWxldmF0aW9uOiBmID0+IGdldChmLCAncHJvcGVydGllcy5lbGV2YXRpb24nKSB8fCAxMDAwLFxuXG4gIHN1YkxheWVyczoge1xuICAgIFBvaW50TGF5ZXI6IFNjYXR0ZXJwbG90TGF5ZXIsXG4gICAgTGluZUxheWVyOiBQYXRoTGF5ZXIsXG4gICAgUG9seWdvbkxheWVyOiBTb2xpZFBvbHlnb25MYXllclxuICB9LFxuXG4gIC8vIE9wdGlvbmFsIHNldHRpbmdzIGZvciAnbGlnaHRpbmcnIHNoYWRlciBtb2R1bGVcbiAgbGlnaHRTZXR0aW5nczoge1xuICAgIGxpZ2h0c1Bvc2l0aW9uOiBbLTEyMi40NSwgMzcuNzUsIDgwMDAsIC0xMjIuMCwgMzguMDAsIDUwMDBdLFxuICAgIGFtYmllbnRSYXRpbzogMC4wNSxcbiAgICBkaWZmdXNlUmF0aW86IDAuNixcbiAgICBzcGVjdWxhclJhdGlvOiAwLjgsXG4gICAgbGlnaHRzU3RyZW5ndGg6IFsyLjAsIDAuMCwgMC4wLCAwLjBdLFxuICAgIG51bWJlck9mTGlnaHRzOiAyXG4gIH1cbn07XG5cbmNvbnN0IGdldENvb3JkaW5hdGVzID0gZiA9PiBnZXQoZiwgJ2dlb21ldHJ5LmNvb3JkaW5hdGVzJyk7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdlb0pzb25MYXllciBleHRlbmRzIENvbXBvc2l0ZUxheWVyIHtcbiAgaW5pdGlhbGl6ZVN0YXRlKCkge1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBmZWF0dXJlczoge31cbiAgICB9O1xuICB9XG5cbiAgdXBkYXRlU3RhdGUoe29sZFByb3BzLCBwcm9wcywgY2hhbmdlRmxhZ3N9KSB7XG4gICAgaWYgKGNoYW5nZUZsYWdzLmRhdGFDaGFuZ2VkKSB7XG4gICAgICBjb25zdCB7ZGF0YX0gPSB0aGlzLnByb3BzO1xuICAgICAgY29uc3QgZmVhdHVyZXMgPSBnZXRHZW9qc29uRmVhdHVyZXMoZGF0YSk7XG4gICAgICB0aGlzLnN0YXRlLmZlYXR1cmVzID0gc2VwYXJhdGVHZW9qc29uRmVhdHVyZXMoZmVhdHVyZXMpO1xuICAgIH1cbiAgfVxuXG4gIGdldFBpY2tpbmdJbmZvKHtpbmZvfSkge1xuICAgIHJldHVybiBPYmplY3QuYXNzaWduKGluZm8sIHtcbiAgICAgIC8vIG92ZXJyaWRlIG9iamVjdCB3aXRoIHBpY2tlZCBmZWF0dXJlXG4gICAgICBvYmplY3Q6IChpbmZvLm9iamVjdCAmJiBpbmZvLm9iamVjdC5mZWF0dXJlKSB8fCBpbmZvLm9iamVjdFxuICAgIH0pO1xuICB9XG5cbiAgcmVuZGVyTGF5ZXJzKCkge1xuICAgIGNvbnN0IHtmZWF0dXJlc30gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IHtwb2ludEZlYXR1cmVzLCBsaW5lRmVhdHVyZXMsIHBvbHlnb25GZWF0dXJlcywgcG9seWdvbk91dGxpbmVGZWF0dXJlc30gPSBmZWF0dXJlcztcblxuICAgIC8vIExheWVyIGNvbXBvc2l0aW9uIHByb3BzXG4gICAgY29uc3Qge3N0cm9rZWQsIGZpbGxlZCwgZXh0cnVkZWQsIHdpcmVmcmFtZSwgc3ViTGF5ZXJzLCBsaWdodFNldHRpbmdzfSA9IHRoaXMucHJvcHM7XG5cbiAgICAvLyBSZW5kZXJpbmcgcHJvcHMgdW5kZXJseWluZyBsYXllclxuICAgIGNvbnN0IHtsaW5lV2lkdGhTY2FsZSwgbGluZVdpZHRoTWluUGl4ZWxzLCBsaW5lV2lkdGhNYXhQaXhlbHMsXG4gICAgICBsaW5lSm9pbnRSb3VuZGVkLCBsaW5lTWl0ZXJMaW1pdCxcbiAgICAgIHBvaW50UmFkaXVzU2NhbGUsIHBvaW50UmFkaXVzTWluUGl4ZWxzLCBwb2ludFJhZGl1c01heFBpeGVscyxcbiAgICAgIGVsZXZhdGlvblNjYWxlLFxuICAgICAgZnA2NH0gPSB0aGlzLnByb3BzO1xuXG4gICAgLy8gQWNjZXNzb3IgcHJvcHMgZm9yIHVuZGVybHlpbmcgbGF5ZXJzXG4gICAgY29uc3Qge2dldExpbmVDb2xvciwgZ2V0RmlsbENvbG9yLCBnZXRSYWRpdXMsXG4gICAgICBnZXRMaW5lV2lkdGgsIGdldEVsZXZhdGlvbiwgdXBkYXRlVHJpZ2dlcnN9ID0gdGhpcy5wcm9wcztcblxuICAgIGNvbnN0IGRyYXdQb2ludHMgPSBwb2ludEZlYXR1cmVzICYmIHBvaW50RmVhdHVyZXMubGVuZ3RoID4gMDtcbiAgICBjb25zdCBkcmF3TGluZXMgPSBsaW5lRmVhdHVyZXMgJiYgbGluZUZlYXR1cmVzLmxlbmd0aCA+IDA7XG4gICAgY29uc3QgaGFzUG9seWdvbkxpbmVzID0gcG9seWdvbk91dGxpbmVGZWF0dXJlcyAmJiBwb2x5Z29uT3V0bGluZUZlYXR1cmVzLmxlbmd0aCA+IDA7XG4gICAgY29uc3QgaGFzUG9seWdvbiA9IHBvbHlnb25GZWF0dXJlcyAmJiBwb2x5Z29uRmVhdHVyZXMubGVuZ3RoID4gMDtcblxuICAgIC8vIEZpbGxlZCBQb2x5Z29uIExheWVyXG4gICAgY29uc3QgcG9seWdvbkZpbGxMYXllciA9IGZpbGxlZCAmJiBoYXNQb2x5Z29uICYmXG4gICAgICBuZXcgc3ViTGF5ZXJzLlBvbHlnb25MYXllcihcbiAgICAgICAgdGhpcy5nZXRTdWJMYXllclByb3BzKHtcbiAgICAgICAgICBpZDogJ3BvbHlnb24tZmlsbCcsXG4gICAgICAgICAgZGF0YTogcG9seWdvbkZlYXR1cmVzLFxuICAgICAgICAgIGZwNjQsXG4gICAgICAgICAgZXh0cnVkZWQsXG4gICAgICAgICAgZWxldmF0aW9uU2NhbGUsXG4gICAgICAgICAgd2lyZWZyYW1lOiBmYWxzZSxcbiAgICAgICAgICBsaWdodFNldHRpbmdzLFxuICAgICAgICAgIGdldFBvbHlnb246IGdldENvb3JkaW5hdGVzLFxuICAgICAgICAgIGdldEVsZXZhdGlvbixcbiAgICAgICAgICBnZXRDb2xvcjogZ2V0RmlsbENvbG9yLFxuICAgICAgICAgIHVwZGF0ZVRyaWdnZXJzOiB7XG4gICAgICAgICAgICBnZXRFbGV2YXRpb246IHVwZGF0ZVRyaWdnZXJzLmdldEVsZXZhdGlvbixcbiAgICAgICAgICAgIGdldENvbG9yOiB1cGRhdGVUcmlnZ2Vycy5nZXRGaWxsQ29sb3JcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgY29uc3QgcG9seWdvbldpcmVmcmFtZUxheWVyID0gd2lyZWZyYW1lICYmIGV4dHJ1ZGVkICYmIGhhc1BvbHlnb24gJiZcbiAgICAgIG5ldyBzdWJMYXllcnMuUG9seWdvbkxheWVyKFxuICAgICAgICB0aGlzLmdldFN1YkxheWVyUHJvcHMoe1xuICAgICAgICAgIGlkOiAncG9seWdvbi13aXJlZnJhbWUnLFxuICAgICAgICAgIGRhdGE6IHBvbHlnb25GZWF0dXJlcyxcblxuICAgICAgICAgIGZwNjQsXG4gICAgICAgICAgZXh0cnVkZWQsXG4gICAgICAgICAgZWxldmF0aW9uU2NhbGUsXG4gICAgICAgICAgd2lyZWZyYW1lOiB0cnVlLFxuICAgICAgICAgIGdldFBvbHlnb246IGdldENvb3JkaW5hdGVzLFxuICAgICAgICAgIGdldEVsZXZhdGlvbixcbiAgICAgICAgICBnZXRDb2xvcjogZ2V0TGluZUNvbG9yLFxuICAgICAgICAgIHVwZGF0ZVRyaWdnZXJzOiB7XG4gICAgICAgICAgICBnZXRFbGV2YXRpb246IHVwZGF0ZVRyaWdnZXJzLmdldEVsZXZhdGlvbixcbiAgICAgICAgICAgIGdldENvbG9yOiB1cGRhdGVUcmlnZ2Vycy5nZXRMaW5lQ29sb3JcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgY29uc3QgcG9seWdvbkxpbmVMYXllciA9ICFleHRydWRlZCAmJiBzdHJva2VkICYmIGhhc1BvbHlnb25MaW5lcyAmJlxuICAgICAgbmV3IHN1YkxheWVycy5MaW5lTGF5ZXIoXG4gICAgICAgIHRoaXMuZ2V0U3ViTGF5ZXJQcm9wcyh7XG4gICAgICAgICAgaWQ6ICdwb2x5Z29uLW91dGxpbmUnLFxuICAgICAgICAgIGRhdGE6IHBvbHlnb25PdXRsaW5lRmVhdHVyZXMsXG5cbiAgICAgICAgICBmcDY0LFxuICAgICAgICAgIHdpZHRoU2NhbGU6IGxpbmVXaWR0aFNjYWxlLFxuICAgICAgICAgIHdpZHRoTWluUGl4ZWxzOiBsaW5lV2lkdGhNaW5QaXhlbHMsXG4gICAgICAgICAgd2lkdGhNYXhQaXhlbHM6IGxpbmVXaWR0aE1heFBpeGVscyxcbiAgICAgICAgICByb3VuZGVkOiBsaW5lSm9pbnRSb3VuZGVkLFxuICAgICAgICAgIG1pdGVyTGltaXQ6IGxpbmVNaXRlckxpbWl0LFxuXG4gICAgICAgICAgZ2V0UGF0aDogZ2V0Q29vcmRpbmF0ZXMsXG4gICAgICAgICAgZ2V0Q29sb3I6IGdldExpbmVDb2xvcixcbiAgICAgICAgICBnZXRXaWR0aDogZ2V0TGluZVdpZHRoLFxuICAgICAgICAgIHVwZGF0ZVRyaWdnZXJzOiB7XG4gICAgICAgICAgICBnZXRDb2xvcjogdXBkYXRlVHJpZ2dlcnMuZ2V0TGluZUNvbG9yLFxuICAgICAgICAgICAgZ2V0V2lkdGg6IHVwZGF0ZVRyaWdnZXJzLmdldExpbmVXaWR0aFxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICBjb25zdCBwYXRoTGF5ZXIgPSBkcmF3TGluZXMgJiZcbiAgICAgIG5ldyBzdWJMYXllcnMuTGluZUxheWVyKFxuICAgICAgICB0aGlzLmdldFN1YkxheWVyUHJvcHMoe1xuICAgICAgICAgIGlkOiAnbGluZS1wYXRocycsXG4gICAgICAgICAgZGF0YTogbGluZUZlYXR1cmVzLFxuXG4gICAgICAgICAgZnA2NCxcbiAgICAgICAgICB3aWR0aFNjYWxlOiBsaW5lV2lkdGhTY2FsZSxcbiAgICAgICAgICB3aWR0aE1pblBpeGVsczogbGluZVdpZHRoTWluUGl4ZWxzLFxuICAgICAgICAgIHdpZHRoTWF4UGl4ZWxzOiBsaW5lV2lkdGhNYXhQaXhlbHMsXG4gICAgICAgICAgcm91bmRlZDogbGluZUpvaW50Um91bmRlZCxcbiAgICAgICAgICBtaXRlckxpbWl0OiBsaW5lTWl0ZXJMaW1pdCxcblxuICAgICAgICAgIGdldFBhdGg6IGdldENvb3JkaW5hdGVzLFxuICAgICAgICAgIGdldENvbG9yOiBnZXRMaW5lQ29sb3IsXG4gICAgICAgICAgZ2V0V2lkdGg6IGdldExpbmVXaWR0aCxcbiAgICAgICAgICB1cGRhdGVUcmlnZ2Vyczoge1xuICAgICAgICAgICAgZ2V0Q29sb3I6IHVwZGF0ZVRyaWdnZXJzLmdldExpbmVDb2xvcixcbiAgICAgICAgICAgIGdldFdpZHRoOiB1cGRhdGVUcmlnZ2Vycy5nZXRMaW5lV2lkdGhcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgY29uc3QgcG9pbnRMYXllciA9IGRyYXdQb2ludHMgJiZcbiAgICAgIG5ldyBzdWJMYXllcnMuUG9pbnRMYXllcihcbiAgICAgICAgdGhpcy5nZXRTdWJMYXllclByb3BzKHtcbiAgICAgICAgICBpZDogJ3BvaW50cycsXG4gICAgICAgICAgZGF0YTogcG9pbnRGZWF0dXJlcyxcblxuICAgICAgICAgIGZwNjQsXG4gICAgICAgICAgcmFkaXVzU2NhbGU6IHBvaW50UmFkaXVzU2NhbGUsXG4gICAgICAgICAgcmFkaXVzTWluUGl4ZWxzOiBwb2ludFJhZGl1c01pblBpeGVscyxcbiAgICAgICAgICByYWRpdXNNYXhQaXhlbHM6IHBvaW50UmFkaXVzTWF4UGl4ZWxzLFxuXG4gICAgICAgICAgZ2V0UG9zaXRpb246IGdldENvb3JkaW5hdGVzLFxuICAgICAgICAgIGdldENvbG9yOiBnZXRGaWxsQ29sb3IsXG4gICAgICAgICAgZ2V0UmFkaXVzLFxuICAgICAgICAgIHVwZGF0ZVRyaWdnZXJzOiB7XG4gICAgICAgICAgICBnZXRDb2xvcjogdXBkYXRlVHJpZ2dlcnMuZ2V0RmlsbENvbG9yLFxuICAgICAgICAgICAgZ2V0UmFkaXVzOiB1cGRhdGVUcmlnZ2Vycy5nZXRSYWRpdXNcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgcmV0dXJuIFtcbiAgICAgIC8vIElmIG5vdCBleHRydWRlZDogZmxhdCBmaWxsIGxheWVyIGlzIGRyYXduIGJlbG93IG91dGxpbmVzXG4gICAgICAhZXh0cnVkZWQgJiYgcG9seWdvbkZpbGxMYXllcixcbiAgICAgIHBvbHlnb25XaXJlZnJhbWVMYXllcixcbiAgICAgIHBvbHlnb25MaW5lTGF5ZXIsXG4gICAgICBwYXRoTGF5ZXIsXG4gICAgICBwb2ludExheWVyLFxuICAgICAgLy8gSWYgZXh0cnVkZWQ6IGRyYXcgZmlsbCBsYXllciBsYXN0IGZvciBjb3JyZWN0IGJsZW5kaW5nIGJlaGF2aW9yXG4gICAgICBleHRydWRlZCAmJiBwb2x5Z29uRmlsbExheWVyXG4gICAgXTtcbiAgfVxufVxuXG5HZW9Kc29uTGF5ZXIubGF5ZXJOYW1lID0gJ0dlb0pzb25MYXllcic7XG5HZW9Kc29uTGF5ZXIuZGVmYXVsdFByb3BzID0gZGVmYXVsdFByb3BzO1xuIl19