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

import SolidPolygonLayer from '../solid-polygon-layer/solid-polygon-layer';
import PathLayer from '../path-layer/path-layer';
import * as Polygon from '../solid-polygon-layer/polygon';

var defaultLineColor = [0x0, 0x0, 0x0, 0xFF];
var defaultFillColor = [0x0, 0x0, 0x0, 0xFF];

var defaultProps = {
  stroked: true,
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

  getPolygon: function getPolygon(f) {
    return get(f, 'polygon');
  },
  // Polygon fill color
  getFillColor: function getFillColor(f) {
    return get(f, 'fillColor') || defaultFillColor;
  },
  // Point, line and polygon outline color
  getLineColor: function getLineColor(f) {
    return get(f, 'lineColor') || defaultLineColor;
  },
  // Line and polygon outline accessors
  getLineWidth: function getLineWidth(f) {
    return get(f, 'lineWidth') || 1;
  },
  // Line dash array accessor
  getLineDashArray: null,
  // Polygon extrusion accessor
  getElevation: function getElevation(f) {
    return get(f, 'elevation') || 1000;
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

var PolygonLayer = function (_CompositeLayer) {
  _inherits(PolygonLayer, _CompositeLayer);

  function PolygonLayer() {
    _classCallCheck(this, PolygonLayer);

    return _possibleConstructorReturn(this, (PolygonLayer.__proto__ || Object.getPrototypeOf(PolygonLayer)).apply(this, arguments));
  }

  _createClass(PolygonLayer, [{
    key: 'initializeState',
    value: function initializeState() {
      this.state = {
        paths: []
      };
    }
  }, {
    key: 'updateState',
    value: function updateState(_ref) {
      var _this2 = this;

      var oldProps = _ref.oldProps,
          props = _ref.props,
          changeFlags = _ref.changeFlags;

      var geometryChanged = changeFlags.dataChanged || changeFlags.updateTriggersChanged && (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getPolygon);

      if (geometryChanged) {
        var _props = this.props,
            data = _props.data,
            getPolygon = _props.getPolygon;

        this.state.paths = [];
        data.forEach(function (object) {
          var complexPolygon = Polygon.normalize(getPolygon(object));
          complexPolygon.forEach(function (polygon) {
            return _this2.state.paths.push({
              path: polygon,
              object: object
            });
          });
        });
      }
    }
  }, {
    key: 'getPickingInfo',
    value: function getPickingInfo(_ref2) {
      var info = _ref2.info;

      return Object.assign(info, {
        // override object with picked data
        object: info.object && info.object.object || info.object
      });
    }
  }, {
    key: 'renderLayers',
    value: function renderLayers() {
      // Layer composition props
      var _props2 = this.props,
          data = _props2.data,
          stroked = _props2.stroked,
          filled = _props2.filled,
          extruded = _props2.extruded,
          wireframe = _props2.wireframe,
          elevationScale = _props2.elevationScale;

      // Rendering props underlying layer

      var _props3 = this.props,
          lineWidthScale = _props3.lineWidthScale,
          lineWidthMinPixels = _props3.lineWidthMinPixels,
          lineWidthMaxPixels = _props3.lineWidthMaxPixels,
          lineJointRounded = _props3.lineJointRounded,
          lineMiterLimit = _props3.lineMiterLimit,
          lineDashJustified = _props3.lineDashJustified,
          fp64 = _props3.fp64;

      // Accessor props for underlying layers

      var _props4 = this.props,
          getFillColor = _props4.getFillColor,
          getLineColor = _props4.getLineColor,
          getLineWidth = _props4.getLineWidth,
          getLineDashArray = _props4.getLineDashArray,
          getElevation = _props4.getElevation,
          getPolygon = _props4.getPolygon,
          updateTriggers = _props4.updateTriggers,
          lightSettings = _props4.lightSettings;
      var paths = this.state.paths;


      var hasData = data && data.length > 0;

      // Filled Polygon Layer
      var polygonLayer = filled && hasData && new SolidPolygonLayer(this.getSubLayerProps({
        id: 'fill',
        data: data,
        extruded: extruded,
        elevationScale: elevationScale,

        fp64: fp64,
        wireframe: false,

        getPolygon: getPolygon,
        getElevation: getElevation,
        getColor: getFillColor,
        updateTriggers: {
          getElevation: updateTriggers.getElevation,
          getColor: updateTriggers.getFillColor
        },

        lightSettings: lightSettings
      }));

      var polygonWireframeLayer = extruded && wireframe && hasData && new SolidPolygonLayer(this.getSubLayerProps({
        id: 'wireframe',
        data: data,

        fp64: fp64,
        extruded: true,
        elevationScale: elevationScale,
        wireframe: true,

        getPolygon: getPolygon,
        getElevation: getElevation,
        getColor: getLineColor,
        updateTriggers: {
          getElevation: updateTriggers.getElevation,
          getColor: updateTriggers.getLineColor
        }
      }));

      // Polygon line layer
      var polygonLineLayer = !extruded && stroked && hasData && new PathLayer(this.getSubLayerProps({
        id: 'stroke',
        data: paths,

        fp64: fp64,
        widthScale: lineWidthScale,
        widthMinPixels: lineWidthMinPixels,
        widthMaxPixels: lineWidthMaxPixels,
        rounded: lineJointRounded,
        miterLimit: lineMiterLimit,
        dashJustified: lineDashJustified,

        getPath: function getPath(x) {
          return x.path;
        },
        getColor: function getColor(x) {
          return getLineColor(x.object);
        },
        getWidth: function getWidth(x) {
          return getLineWidth(x.object);
        },
        getDashArray: getLineDashArray && function (x) {
          return getLineDashArray(x.object);
        },
        updateTriggers: {
          getWidth: updateTriggers.getLineWidth,
          getColor: updateTriggers.getLineColor,
          getDashArray: updateTriggers.getLineDashArray
        }
      }));

      return [
      // If not extruded: flat fill layer is drawn below outlines
      !extruded && polygonLayer, polygonWireframeLayer, polygonLineLayer,
      // If extruded: draw fill layer last for correct blending behavior
      extruded && polygonLayer];
    }
  }]);

  return PolygonLayer;
}(CompositeLayer);

export default PolygonLayer;


PolygonLayer.layerName = 'PolygonLayer';
PolygonLayer.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlLWxheWVycy9wb2x5Z29uLWxheWVyL3BvbHlnb24tbGF5ZXIuanMiXSwibmFtZXMiOlsiQ29tcG9zaXRlTGF5ZXIiLCJleHBlcmltZW50YWwiLCJnZXQiLCJTb2xpZFBvbHlnb25MYXllciIsIlBhdGhMYXllciIsIlBvbHlnb24iLCJkZWZhdWx0TGluZUNvbG9yIiwiZGVmYXVsdEZpbGxDb2xvciIsImRlZmF1bHRQcm9wcyIsInN0cm9rZWQiLCJmaWxsZWQiLCJleHRydWRlZCIsImVsZXZhdGlvblNjYWxlIiwid2lyZWZyYW1lIiwibGluZVdpZHRoU2NhbGUiLCJsaW5lV2lkdGhNaW5QaXhlbHMiLCJsaW5lV2lkdGhNYXhQaXhlbHMiLCJOdW1iZXIiLCJNQVhfU0FGRV9JTlRFR0VSIiwibGluZUpvaW50Um91bmRlZCIsImxpbmVNaXRlckxpbWl0IiwibGluZURhc2hKdXN0aWZpZWQiLCJmcDY0IiwiZ2V0UG9seWdvbiIsImYiLCJnZXRGaWxsQ29sb3IiLCJnZXRMaW5lQ29sb3IiLCJnZXRMaW5lV2lkdGgiLCJnZXRMaW5lRGFzaEFycmF5IiwiZ2V0RWxldmF0aW9uIiwibGlnaHRTZXR0aW5ncyIsImxpZ2h0c1Bvc2l0aW9uIiwiYW1iaWVudFJhdGlvIiwiZGlmZnVzZVJhdGlvIiwic3BlY3VsYXJSYXRpbyIsImxpZ2h0c1N0cmVuZ3RoIiwibnVtYmVyT2ZMaWdodHMiLCJQb2x5Z29uTGF5ZXIiLCJzdGF0ZSIsInBhdGhzIiwib2xkUHJvcHMiLCJwcm9wcyIsImNoYW5nZUZsYWdzIiwiZ2VvbWV0cnlDaGFuZ2VkIiwiZGF0YUNoYW5nZWQiLCJ1cGRhdGVUcmlnZ2Vyc0NoYW5nZWQiLCJhbGwiLCJkYXRhIiwiZm9yRWFjaCIsImNvbXBsZXhQb2x5Z29uIiwibm9ybWFsaXplIiwib2JqZWN0IiwicHVzaCIsInBhdGgiLCJwb2x5Z29uIiwiaW5mbyIsIk9iamVjdCIsImFzc2lnbiIsInVwZGF0ZVRyaWdnZXJzIiwiaGFzRGF0YSIsImxlbmd0aCIsInBvbHlnb25MYXllciIsImdldFN1YkxheWVyUHJvcHMiLCJpZCIsImdldENvbG9yIiwicG9seWdvbldpcmVmcmFtZUxheWVyIiwicG9seWdvbkxpbmVMYXllciIsIndpZHRoU2NhbGUiLCJ3aWR0aE1pblBpeGVscyIsIndpZHRoTWF4UGl4ZWxzIiwicm91bmRlZCIsIm1pdGVyTGltaXQiLCJkYXNoSnVzdGlmaWVkIiwiZ2V0UGF0aCIsIngiLCJnZXRXaWR0aCIsImdldERhc2hBcnJheSIsImxheWVyTmFtZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxTQUFRQSxjQUFSLEVBQXdCQyxZQUF4QixRQUEyQyxZQUEzQztJQUNPQyxHLEdBQU9ELFksQ0FBUEMsRzs7QUFDUCxPQUFPQyxpQkFBUCxNQUE4Qiw0Q0FBOUI7QUFDQSxPQUFPQyxTQUFQLE1BQXNCLDBCQUF0QjtBQUNBLE9BQU8sS0FBS0MsT0FBWixNQUF5QixnQ0FBekI7O0FBRUEsSUFBTUMsbUJBQW1CLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLEVBQWdCLElBQWhCLENBQXpCO0FBQ0EsSUFBTUMsbUJBQW1CLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYLEVBQWdCLElBQWhCLENBQXpCOztBQUVBLElBQU1DLGVBQWU7QUFDbkJDLFdBQVMsSUFEVTtBQUVuQkMsVUFBUSxJQUZXO0FBR25CQyxZQUFVLEtBSFM7QUFJbkJDLGtCQUFnQixDQUpHO0FBS25CQyxhQUFXLEtBTFE7O0FBT25CQyxrQkFBZ0IsQ0FQRztBQVFuQkMsc0JBQW9CLENBUkQ7QUFTbkJDLHNCQUFvQkMsT0FBT0MsZ0JBVFI7QUFVbkJDLG9CQUFrQixLQVZDO0FBV25CQyxrQkFBZ0IsQ0FYRztBQVluQkMscUJBQW1CLEtBWkE7QUFhbkJDLFFBQU0sS0FiYTs7QUFlbkJD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QUhmO0FBaEJJLE9BQXRCLENBREYsQ0FERjs7QUEwQkEsYUFBTztBQUNMO0FBQ0EsT0FBQ2pCLFFBQUQsSUFBYWtELFlBRlIsRUFHTEkscUJBSEssRUFJTEMsZ0JBSks7QUFLTDtBQUNBdkQsa0JBQVlrRCxZQU5QLENBQVA7QUFRRDs7OztFQWpJdUM3RCxjOztlQUFyQnFDLFk7OztBQW9JckJBLGFBQWF3QyxTQUFiLEdBQXlCLGNBQXpCO0FBQ0F4QyxhQUFhN0IsWUFBYixHQUE0QkEsWUFBNUIiLCJmaWxlIjoicG9seWdvbi1sYXllci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNSAtIDIwMTcgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQge0NvbXBvc2l0ZUxheWVyLCBleHBlcmltZW50YWx9IGZyb20gJy4uLy4uL2NvcmUnO1xuY29uc3Qge2dldH0gPSBleHBlcmltZW50YWw7XG5pbXBvcnQgU29saWRQb2x5Z29uTGF5ZXIgZnJvbSAnLi4vc29saWQtcG9seWdvbi1sYXllci9zb2xpZC1wb2x5Z29uLWxheWVyJztcbmltcG9ydCBQYXRoTGF5ZXIgZnJvbSAnLi4vcGF0aC1sYXllci9wYXRoLWxheWVyJztcbmltcG9ydCAqIGFzIFBvbHlnb24gZnJvbSAnLi4vc29saWQtcG9seWdvbi1sYXllci9wb2x5Z29uJztcblxuY29uc3QgZGVmYXVsdExpbmVDb2xvciA9IFsweDAsIDB4MCwgMHgwLCAweEZGXTtcbmNvbnN0IGRlZmF1bHRGaWxsQ29sb3IgPSBbMHgwLCAweDAsIDB4MCwgMHhGRl07XG5cbmNvbnN0IGRlZmF1bHRQcm9wcyA9IHtcbiAgc3Ryb2tlZDogdHJ1ZSxcbiAgZmlsbGVkOiB0cnVlLFxuICBleHRydWRlZDogZmFsc2UsXG4gIGVsZXZhdGlvblNjYWxlOiAxLFxuICB3aXJlZnJhbWU6IGZhbHNlLFxuXG4gIGxpbmVXaWR0aFNjYWxlOiAxLFxuICBsaW5lV2lkdGhNaW5QaXhlbHM6IDAsXG4gIGxpbmVXaWR0aE1heFBpeGVsczogTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIsXG4gIGxpbmVKb2ludFJvdW5kZWQ6IGZhbHNlLFxuICBsaW5lTWl0ZXJMaW1pdDogNCxcbiAgbGluZURhc2hKdXN0aWZpZWQ6IGZhbHNlLFxuICBmcDY0OiBmYWxzZSxcblxuICBnZXRQb2x5Z29uOiBmID0+IGdldChmLCAncG9seWdvbicpLFxuICAvLyBQb2x5Z29uIGZpbGwgY29sb3JcbiAgZ2V0RmlsbENvbG9yOiBmID0+IGdldChmLCAnZmlsbENvbG9yJykgfHwgZGVmYXVsdEZpbGxDb2xvcixcbiAgLy8gUG9pbnQsIGxpbmUgYW5kIHBvbHlnb24gb3V0bGluZSBjb2xvclxuICBnZXRMaW5lQ29sb3I6IGYgPT4gZ2V0KGYsICdsaW5lQ29sb3InKSB8fCBkZWZhdWx0TGluZUNvbG9yLFxuICAvLyBMaW5lIGFuZCBwb2x5Z29uIG91dGxpbmUgYWNjZXNzb3JzXG4gIGdldExpbmVXaWR0aDogZiA9PiBnZXQoZiwgJ2xpbmVXaWR0aCcpIHx8IDEsXG4gIC8vIExpbmUgZGFzaCBhcnJheSBhY2Nlc3NvclxuICBnZXRMaW5lRGFzaEFycmF5OiBudWxsLFxuICAvLyBQb2x5Z29uIGV4dHJ1c2lvbiBhY2Nlc3NvclxuICBnZXRFbGV2YXRpb246IGYgPT4gZ2V0KGYsICdlbGV2YXRpb24nKSB8fCAxMDAwLFxuXG4gIC8vIE9wdGlvbmFsIHNldHRpbmdzIGZvciAnbGlnaHRpbmcnIHNoYWRlciBtb2R1bGVcbiAgbGlnaHRTZXR0aW5nczoge1xuICAgIGxpZ2h0c1Bvc2l0aW9uOiBbLTEyMi40NSwgMzcuNzUsIDgwMDAsIC0xMjIuMCwgMzguMDAsIDUwMDBdLFxuICAgIGFtYmllbnRSYXRpbzogMC4wNSxcbiAgICBkaWZmdXNlUmF0aW86IDAuNixcbiAgICBzcGVjdWxhclJhdGlvOiAwLjgsXG4gICAgbGlnaHRzU3RyZW5ndGg6IFsyLjAsIDAuMCwgMC4wLCAwLjBdLFxuICAgIG51bWJlck9mTGlnaHRzOiAyXG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFBvbHlnb25MYXllciBleHRlbmRzIENvbXBvc2l0ZUxheWVyIHtcbiAgaW5pdGlhbGl6ZVN0YXRlKCkge1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBwYXRoczogW11cbiAgICB9O1xuICB9XG5cbiAgdXBkYXRlU3RhdGUoe29sZFByb3BzLCBwcm9wcywgY2hhbmdlRmxhZ3N9KSB7XG4gICAgY29uc3QgZ2VvbWV0cnlDaGFuZ2VkID0gY2hhbmdlRmxhZ3MuZGF0YUNoYW5nZWQgfHxcbiAgICAgIChjaGFuZ2VGbGFncy51cGRhdGVUcmlnZ2Vyc0NoYW5nZWQgJiYgKFxuICAgICAgICBjaGFuZ2VGbGFncy51cGRhdGVUcmlnZ2Vyc0NoYW5nZWQuYWxsIHx8XG4gICAgICAgIGNoYW5nZUZsYWdzLnVwZGF0ZVRyaWdnZXJzQ2hhbmdlZC5nZXRQb2x5Z29uKSk7XG5cbiAgICBpZiAoZ2VvbWV0cnlDaGFuZ2VkKSB7XG4gICAgICBjb25zdCB7ZGF0YSwgZ2V0UG9seWdvbn0gPSB0aGlzLnByb3BzO1xuICAgICAgdGhpcy5zdGF0ZS5wYXRocyA9IFtdO1xuICAgICAgZGF0YS5mb3JFYWNoKG9iamVjdCA9PiB7XG4gICAgICAgIGNvbnN0IGNvbXBsZXhQb2x5Z29uID0gUG9seWdvbi5ub3JtYWxpemUoZ2V0UG9seWdvbihvYmplY3QpKTtcbiAgICAgICAgY29tcGxleFBvbHlnb24uZm9yRWFjaChwb2x5Z29uID0+IHRoaXMuc3RhdGUucGF0aHMucHVzaCh7XG4gICAgICAgICAgcGF0aDogcG9seWdvbixcbiAgICAgICAgICBvYmplY3RcbiAgICAgICAgfSkpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgZ2V0UGlja2luZ0luZm8oe2luZm99KSB7XG4gICAgcmV0dXJuIE9iamVjdC5hc3NpZ24oaW5mbywge1xuICAgICAgLy8gb3ZlcnJpZGUgb2JqZWN0IHdpdGggcGlja2VkIGRhdGFcbiAgICAgIG9iamVjdDogKGluZm8ub2JqZWN0ICYmIGluZm8ub2JqZWN0Lm9iamVjdCkgfHwgaW5mby5vYmplY3RcbiAgICB9KTtcbiAgfVxuXG4gIHJlbmRlckxheWVycygpIHtcbiAgICAvLyBMYXllciBjb21wb3NpdGlvbiBwcm9wc1xuICAgIGNvbnN0IHtkYXRhLCBzdHJva2VkLCBmaWxsZWQsIGV4dHJ1ZGVkLCB3aXJlZnJhbWUsIGVsZXZhdGlvblNjYWxlfSA9IHRoaXMucHJvcHM7XG5cbiAgICAvLyBSZW5kZXJpbmcgcHJvcHMgdW5kZXJseWluZyBsYXllclxuICAgIGNvbnN0IHtsaW5lV2lkdGhTY2FsZSwgbGluZVdpZHRoTWluUGl4ZWxzLCBsaW5lV2lkdGhNYXhQaXhlbHMsXG4gICAgICBsaW5lSm9pbnRSb3VuZGVkLCBsaW5lTWl0ZXJMaW1pdCwgbGluZURhc2hKdXN0aWZpZWQsIGZwNjR9ID0gdGhpcy5wcm9wcztcblxuICAgIC8vIEFjY2Vzc29yIHByb3BzIGZvciB1bmRlcmx5aW5nIGxheWVyc1xuICAgIGNvbnN0IHtnZXRGaWxsQ29sb3IsIGdldExpbmVDb2xvciwgZ2V0TGluZVdpZHRoLCBnZXRMaW5lRGFzaEFycmF5LCBnZXRFbGV2YXRpb24sXG4gICAgICBnZXRQb2x5Z29uLCB1cGRhdGVUcmlnZ2VycywgbGlnaHRTZXR0aW5nc30gPSB0aGlzLnByb3BzO1xuXG4gICAgY29uc3Qge3BhdGhzfSA9IHRoaXMuc3RhdGU7XG5cbiAgICBjb25zdCBoYXNEYXRhID0gZGF0YSAmJiBkYXRhLmxlbmd0aCA+IDA7XG5cbiAgICAvLyBGaWxsZWQgUG9seWdvbiBMYXllclxuICAgIGNvbnN0IHBvbHlnb25MYXllciA9IGZpbGxlZCAmJiBoYXNEYXRhICYmXG4gICAgICBuZXcgU29saWRQb2x5Z29uTGF5ZXIoXG4gICAgICAgIHRoaXMuZ2V0U3ViTGF5ZXJQcm9wcyh7XG4gICAgICAgICAgaWQ6ICdmaWxsJyxcbiAgICAgICAgICBkYXRhLFxuICAgICAgICAgIGV4dHJ1ZGVkLFxuICAgICAgICAgIGVsZXZhdGlvblNjYWxlLFxuXG4gICAgICAgICAgZnA2NCxcbiAgICAgICAgICB3aXJlZnJhbWU6IGZhbHNlLFxuXG4gICAgICAgICAgZ2V0UG9seWdvbixcbiAgICAgICAgICBnZXRFbGV2YXRpb24sXG4gICAgICAgICAgZ2V0Q29sb3I6IGdldEZpbGxDb2xvcixcbiAgICAgICAgICB1cGRhdGVUcmlnZ2Vyczoge1xuICAgICAgICAgICAgZ2V0RWxldmF0aW9uOiB1cGRhdGVUcmlnZ2Vycy5nZXRFbGV2YXRpb24sXG4gICAgICAgICAgICBnZXRDb2xvcjogdXBkYXRlVHJpZ2dlcnMuZ2V0RmlsbENvbG9yXG4gICAgICAgICAgfSxcblxuICAgICAgICAgIGxpZ2h0U2V0dGluZ3NcbiAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICBjb25zdCBwb2x5Z29uV2lyZWZyYW1lTGF5ZXIgPSBleHRydWRlZCAmJiB3aXJlZnJhbWUgJiYgaGFzRGF0YSAmJlxuICAgICAgbmV3IFNvbGlkUG9seWdvbkxheWVyKFxuICAgICAgICB0aGlzLmdldFN1YkxheWVyUHJvcHMoe1xuICAgICAgICAgIGlkOiAnd2lyZWZyYW1lJyxcbiAgICAgICAgICBkYXRhLFxuXG4gICAgICAgICAgZnA2NCxcbiAgICAgICAgICBleHRydWRlZDogdHJ1ZSxcbiAgICAgICAgICBlbGV2YXRpb25TY2FsZSxcbiAgICAgICAgICB3aXJlZnJhbWU6IHRydWUsXG5cbiAgICAgICAgICBnZXRQb2x5Z29uLFxuICAgICAgICAgIGdldEVsZXZhdGlvbixcbiAgICAgICAgICBnZXRDb2xvcjogZ2V0TGluZUNvbG9yLFxuICAgICAgICAgIHVwZGF0ZVRyaWdnZXJzOiB7XG4gICAgICAgICAgICBnZXRFbGV2YXRpb246IHVwZGF0ZVRyaWdnZXJzLmdldEVsZXZhdGlvbixcbiAgICAgICAgICAgIGdldENvbG9yOiB1cGRhdGVUcmlnZ2Vycy5nZXRMaW5lQ29sb3JcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICApO1xuXG4gICAgLy8gUG9seWdvbiBsaW5lIGxheWVyXG4gICAgY29uc3QgcG9seWdvbkxpbmVMYXllciA9ICFleHRydWRlZCAmJiBzdHJva2VkICYmIGhhc0RhdGEgJiZcbiAgICAgIG5ldyBQYXRoTGF5ZXIoXG4gICAgICAgIHRoaXMuZ2V0U3ViTGF5ZXJQcm9wcyh7XG4gICAgICAgICAgaWQ6ICdzdHJva2UnLFxuICAgICAgICAgIGRhdGE6IHBhdGhzLFxuXG4gICAgICAgICAgZnA2NCxcbiAgICAgICAgICB3aWR0aFNjYWxlOiBsaW5lV2lkdGhTY2FsZSxcbiAgICAgICAgICB3aWR0aE1pblBpeGVsczogbGluZVdpZHRoTWluUGl4ZWxzLFxuICAgICAgICAgIHdpZHRoTWF4UGl4ZWxzOiBsaW5lV2lkdGhNYXhQaXhlbHMsXG4gICAgICAgICAgcm91bmRlZDogbGluZUpvaW50Um91bmRlZCxcbiAgICAgICAgICBtaXRlckxpbWl0OiBsaW5lTWl0ZXJMaW1pdCxcbiAgICAgICAgICBkYXNoSnVzdGlmaWVkOiBsaW5lRGFzaEp1c3RpZmllZCxcblxuICAgICAgICAgIGdldFBhdGg6IHggPT4geC5wYXRoLFxuICAgICAgICAgIGdldENvbG9yOiB4ID0+IGdldExpbmVDb2xvcih4Lm9iamVjdCksXG4gICAgICAgICAgZ2V0V2lkdGg6IHggPT4gZ2V0TGluZVdpZHRoKHgub2JqZWN0KSxcbiAgICAgICAgICBnZXREYXNoQXJyYXk6IGdldExpbmVEYXNoQXJyYXkgJiYgKHggPT4gZ2V0TGluZURhc2hBcnJheSh4Lm9iamVjdCkpLFxuICAgICAgICAgIHVwZGF0ZVRyaWdnZXJzOiB7XG4gICAgICAgICAgICBnZXRXaWR0aDogdXBkYXRlVHJpZ2dlcnMuZ2V0TGluZVdpZHRoLFxuICAgICAgICAgICAgZ2V0Q29sb3I6IHVwZGF0ZVRyaWdnZXJzLmdldExpbmVDb2xvcixcbiAgICAgICAgICAgIGdldERhc2hBcnJheTogdXBkYXRlVHJpZ2dlcnMuZ2V0TGluZURhc2hBcnJheVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICk7XG5cbiAgICByZXR1cm4gW1xuICAgICAgLy8gSWYgbm90IGV4dHJ1ZGVkOiBmbGF0IGZpbGwgbGF5ZXIgaXMgZHJhd24gYmVsb3cgb3V0bGluZXNcbiAgICAgICFleHRydWRlZCAmJiBwb2x5Z29uTGF5ZXIsXG4gICAgICBwb2x5Z29uV2lyZWZyYW1lTGF5ZXIsXG4gICAgICBwb2x5Z29uTGluZUxheWVyLFxuICAgICAgLy8gSWYgZXh0cnVkZWQ6IGRyYXcgZmlsbCBsYXllciBsYXN0IGZvciBjb3JyZWN0IGJsZW5kaW5nIGJlaGF2aW9yXG4gICAgICBleHRydWRlZCAmJiBwb2x5Z29uTGF5ZXJcbiAgICBdO1xuICB9XG59XG5cblBvbHlnb25MYXllci5sYXllck5hbWUgPSAnUG9seWdvbkxheWVyJztcblBvbHlnb25MYXllci5kZWZhdWx0UHJvcHMgPSBkZWZhdWx0UHJvcHM7XG4iXX0=