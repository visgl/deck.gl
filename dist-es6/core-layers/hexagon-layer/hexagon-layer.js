var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

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
import HexagonCellLayer from '../hexagon-cell-layer/hexagon-cell-layer';

var log = experimental.log,
    BinSorter = experimental.BinSorter,
    getQuantizeScale = experimental.getQuantizeScale,
    getLinearScale = experimental.getLinearScale,
    defaultColorRange = experimental.defaultColorRange;


import { pointToHexbin } from './hexagon-aggregator';

function nop() {}

var defaultProps = {
  // color
  colorDomain: null,
  colorRange: defaultColorRange,
  getColorValue: function getColorValue(points) {
    return points.length;
  },
  lowerPercentile: 0,
  upperPercentile: 100,
  onSetColorDomain: nop,

  // elevation
  elevationDomain: null,
  elevationRange: [0, 1000],
  getElevationValue: function getElevationValue(points) {
    return points.length;
  },
  elevationLowerPercentile: 0,
  elevationUpperPercentile: 100,
  elevationScale: 1,
  onSetElevationDomain: nop,

  radius: 1000,
  coverage: 1,
  extruded: false,
  hexagonAggregator: pointToHexbin,
  getPosition: function getPosition(x) {
    return x.position;
  },
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

var HexagonLayer = function (_CompositeLayer) {
  _inherits(HexagonLayer, _CompositeLayer);

  function HexagonLayer(props) {
    _classCallCheck(this, HexagonLayer);

    if (!props.hexagonAggregator && !props.radius) {
      log.once(0, 'HexagonLayer: Default hexagonAggregator requires radius prop to be set, ' + 'Now using 1000 meter as default');

      props.radius = defaultProps.radius;
    }

    if (Number.isFinite(props.upperPercentile) && (props.upperPercentile > 100 || props.upperPercentile < 0)) {
      log.once(0, 'HexagonLayer: upperPercentile should be between 0 and 100. ' + 'Assign to 100 by default');

      props.upperPercentile = defaultProps.upperPercentile;
    }

    if (Number.isFinite(props.lowerPercentile) && (props.lowerPercentile > 100 || props.lowerPercentile < 0)) {
      log.once(0, 'HexagonLayer: lowerPercentile should be between 0 and 100. ' + 'Assign to 0 by default');

      props.lowerPercentile = defaultProps.upperPercentile;
    }

    if (props.lowerPercentile >= props.upperPercentile) {
      log.once(0, 'HexagonLayer: lowerPercentile should not be bigger than ' + 'upperPercentile. Assign to 0 by default');

      props.lowerPercentile = defaultProps.lowerPercentile;
    }

    return _possibleConstructorReturn(this, (HexagonLayer.__proto__ || Object.getPrototypeOf(HexagonLayer)).call(this, props));
  }

  _createClass(HexagonLayer, [{
    key: 'initializeState',
    value: function initializeState() {
      this.state = {
        hexagons: [],
        hexagonVertices: null,
        sortedColorBins: null,
        sortedElevationBins: null,
        colorValueDomain: null,
        elevationValueDomain: null,
        colorScaleFunc: nop,
        elevationScaleFunc: nop,
        dimensionUpdaters: this.getDimensionUpdaters()
      };
    }
  }, {
    key: 'shouldUpdateState',
    value: function shouldUpdateState(_ref) {
      var changeFlags = _ref.changeFlags;

      return changeFlags.somethingChanged;
    }
  }, {
    key: 'updateState',
    value: function updateState(_ref2) {
      var _this2 = this;

      var oldProps = _ref2.oldProps,
          props = _ref2.props,
          changeFlags = _ref2.changeFlags;

      var dimensionChanges = this.getDimensionChanges(oldProps, props);

      if (changeFlags.dataChanged || this.needsReProjectPoints(oldProps, props)) {
        // project data into hexagons, and get sortedColorBins
        this.getHexagons();
      } else if (dimensionChanges) {
        dimensionChanges.forEach(function (f) {
          return typeof f === 'function' && f.apply(_this2);
        });
      }
    }
  }, {
    key: 'needsReProjectPoints',
    value: function needsReProjectPoints(oldProps, props) {
      return oldProps.radius !== props.radius || oldProps.hexagonAggregator !== props.hexagonAggregator;
    }
  }, {
    key: 'getDimensionUpdaters',
    value: function getDimensionUpdaters() {
      // dimension updaters are sequential,
      // if the first one needs to be called, the 2nd and 3rd one will automatically
      // be called. e.g. if ColorValue needs to be updated, getColorValueDomain and getColorScale
      // will automatically be called
      return {
        getColor: [{
          id: 'value',
          triggers: ['getColorValue'],
          updater: this.getSortedColorBins
        }, {
          id: 'domain',
          triggers: ['lowerPercentile', 'upperPercentile'],
          updater: this.getColorValueDomain
        }, {
          id: 'scaleFunc',
          triggers: ['colorDomain', 'colorRange'],
          updater: this.getColorScale
        }],
        getElevation: [{
          id: 'value',
          triggers: ['getElevationValue'],
          updater: this.getSortedElevationBins
        }, {
          id: 'domain',
          triggers: ['elevationLowerPercentile', 'elevationUpperPercentile'],
          updater: this.getElevationValueDomain
        }, {
          id: 'scaleFunc',
          triggers: ['elevationDomain', 'elevationRange'],
          updater: this.getElevationScale
        }]
      };
    }
  }, {
    key: 'getDimensionChanges',
    value: function getDimensionChanges(oldProps, props) {
      var dimensionUpdaters = this.state.dimensionUpdaters;

      var updaters = [];

      // get dimension to be updated
      for (var dimensionKey in dimensionUpdaters) {

        // return the first triggered updater for each dimension
        var needUpdate = dimensionUpdaters[dimensionKey].find(function (item) {
          return item.triggers.some(function (t) {
            return oldProps[t] !== props[t];
          });
        });

        if (needUpdate) {
          updaters.push(needUpdate.updater);
        }
      }

      return updaters.length ? updaters : null;
    }
  }, {
    key: 'getHexagons',
    value: function getHexagons() {
      var hexagonAggregator = this.props.hexagonAggregator;
      var viewport = this.context.viewport;

      var _hexagonAggregator = hexagonAggregator(this.props, viewport),
          hexagons = _hexagonAggregator.hexagons,
          hexagonVertices = _hexagonAggregator.hexagonVertices;

      this.setState({ hexagons: hexagons, hexagonVertices: hexagonVertices });
      this.getSortedBins();
    }
  }, {
    key: 'getPickingInfo',
    value: function getPickingInfo(_ref3) {
      var info = _ref3.info;
      var _state = this.state,
          sortedColorBins = _state.sortedColorBins,
          sortedElevationBins = _state.sortedElevationBins;

      var isPicked = info.picked && info.index > -1;

      var object = null;
      if (isPicked) {

        var cell = this.state.hexagons[info.index];

        var colorValue = sortedColorBins.binMap[cell.index] && sortedColorBins.binMap[cell.index].value;
        var elevationValue = sortedElevationBins.binMap[cell.index] && sortedElevationBins.binMap[cell.index].value;

        object = Object.assign({
          colorValue: colorValue,
          elevationValue: elevationValue
        }, cell);
      }

      // add bin colorValue and elevationValue to info
      return Object.assign(info, {
        picked: Boolean(object),
        // override object with picked cell
        object: object
      });
    }
  }, {
    key: 'getUpdateTriggers',
    value: function getUpdateTriggers() {
      var _this3 = this;

      var dimensionUpdaters = this.state.dimensionUpdaters;

      // merge all dimension triggers

      var updateTriggers = {};

      var _loop = function _loop(dimensionKey) {

        updateTriggers[dimensionKey] = {};

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = dimensionUpdaters[dimensionKey][Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var step = _step.value;


            step.triggers.forEach(function (prop) {
              updateTriggers[dimensionKey][prop] = _this3.props[prop];
            });
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      };

      for (var dimensionKey in dimensionUpdaters) {
        _loop(dimensionKey);
      }

      return updateTriggers;
    }
  }, {
    key: 'getValueDomain',
    value: function getValueDomain() {
      this.getColorValueDomain();
      this.getElevationValueDomain();
    }
  }, {
    key: 'getSortedBins',
    value: function getSortedBins() {
      this.getSortedColorBins();
      this.getSortedElevationBins();
    }
  }, {
    key: 'getSortedColorBins',
    value: function getSortedColorBins() {
      var getColorValue = this.props.getColorValue;

      var sortedColorBins = new BinSorter(this.state.hexagons || [], getColorValue);

      this.setState({ sortedColorBins: sortedColorBins });
      this.getColorValueDomain();
    }
  }, {
    key: 'getSortedElevationBins',
    value: function getSortedElevationBins() {
      var getElevationValue = this.props.getElevationValue;

      var sortedElevationBins = new BinSorter(this.state.hexagons || [], getElevationValue);
      this.setState({ sortedElevationBins: sortedElevationBins });
      this.getElevationValueDomain();
    }
  }, {
    key: 'getColorValueDomain',
    value: function getColorValueDomain() {
      var _props = this.props,
          lowerPercentile = _props.lowerPercentile,
          upperPercentile = _props.upperPercentile,
          onSetColorDomain = _props.onSetColorDomain;


      this.state.colorValueDomain = this.state.sortedColorBins.getValueRange([lowerPercentile, upperPercentile]);

      if (typeof onSetColorDomain === 'function') {
        onSetColorDomain(this.state.colorValueDomain);
      }

      this.getColorScale();
    }
  }, {
    key: 'getElevationValueDomain',
    value: function getElevationValueDomain() {
      var _props2 = this.props,
          elevationLowerPercentile = _props2.elevationLowerPercentile,
          elevationUpperPercentile = _props2.elevationUpperPercentile,
          onSetElevationDomain = _props2.onSetElevationDomain;


      this.state.elevationValueDomain = this.state.sortedElevationBins.getValueRange([elevationLowerPercentile, elevationUpperPercentile]);

      if (typeof onSetElevationDomain === 'function') {
        onSetElevationDomain(this.state.elevationValueDomain);
      }

      this.getElevationScale();
    }
  }, {
    key: 'getColorScale',
    value: function getColorScale() {
      var colorRange = this.props.colorRange;

      var colorDomain = this.props.colorDomain || this.state.colorValueDomain;

      this.state.colorScaleFunc = getQuantizeScale(colorDomain, colorRange);
    }
  }, {
    key: 'getElevationScale',
    value: function getElevationScale() {
      var elevationRange = this.props.elevationRange;

      var elevationDomain = this.props.elevationDomain || this.state.elevationValueDomain;

      this.state.elevationScaleFunc = getLinearScale(elevationDomain, elevationRange);
    }
  }, {
    key: '_onGetSublayerColor',
    value: function _onGetSublayerColor(cell) {
      var _state2 = this.state,
          sortedColorBins = _state2.sortedColorBins,
          colorScaleFunc = _state2.colorScaleFunc,
          colorValueDomain = _state2.colorValueDomain;


      var cv = sortedColorBins.binMap[cell.index] && sortedColorBins.binMap[cell.index].value;
      var colorDomain = this.props.colorDomain || colorValueDomain;

      var isColorValueInDomain = cv >= colorDomain[0] && cv <= colorDomain[colorDomain.length - 1];

      // if cell value is outside domain, set alpha to 0
      var color = isColorValueInDomain ? colorScaleFunc(cv) : [0, 0, 0, 0];

      // add alpha to color if not defined in colorRange
      color[3] = Number.isFinite(color[3]) ? color[3] : 255;

      return color;
    }
  }, {
    key: '_onGetSublayerElevation',
    value: function _onGetSublayerElevation(cell) {
      var _state3 = this.state,
          sortedElevationBins = _state3.sortedElevationBins,
          elevationScaleFunc = _state3.elevationScaleFunc,
          elevationValueDomain = _state3.elevationValueDomain;

      var ev = sortedElevationBins.binMap[cell.index] && sortedElevationBins.binMap[cell.index].value;

      var elevationDomain = this.props.elevationDomain || elevationValueDomain;

      var isElevationValueInDomain = ev >= elevationDomain[0] && ev <= elevationDomain[elevationDomain.length - 1];

      // if cell value is outside domain, set elevation to -1
      return isElevationValueInDomain ? elevationScaleFunc(ev) : -1;
    }

    // for subclassing, override this method to return
    // customized sub layer props

  }, {
    key: 'getSubLayerProps',
    value: function getSubLayerProps() {
      var _props3 = this.props,
          radius = _props3.radius,
          elevationScale = _props3.elevationScale,
          extruded = _props3.extruded,
          coverage = _props3.coverage,
          lightSettings = _props3.lightSettings,
          fp64 = _props3.fp64;

      // return props to the sublayer constructor

      return _get(HexagonLayer.prototype.__proto__ || Object.getPrototypeOf(HexagonLayer.prototype), 'getSubLayerProps', this).call(this, {
        id: 'hexagon-cell',
        data: this.state.hexagons,

        fp64: fp64,
        hexagonVertices: this.state.hexagonVertices,
        radius: radius,
        elevationScale: elevationScale,
        angle: Math.PI,
        extruded: extruded,
        coverage: coverage,
        lightSettings: lightSettings,

        getColor: this._onGetSublayerColor.bind(this),
        getElevation: this._onGetSublayerElevation.bind(this),
        updateTriggers: this.getUpdateTriggers()
      });
    }

    // for subclassing, override this method to return
    // customized sub layer class

  }, {
    key: 'getSubLayerClass',
    value: function getSubLayerClass() {
      return HexagonCellLayer;
    }
  }, {
    key: 'renderLayers',
    value: function renderLayers() {
      var SubLayerClass = this.getSubLayerClass();

      return new SubLayerClass(this.getSubLayerProps());
    }
  }]);

  return HexagonLayer;
}(CompositeLayer);

export default HexagonLayer;


HexagonLayer.layerName = 'HexagonLayer';
HexagonLayer.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlLWxheWVycy9oZXhhZ29uLWxheWVyL2hleGFnb24tbGF5ZXIuanMiXSwibmFtZXMiOlsiQ29tcG9zaXRlTGF5ZXIiLCJleHBlcmltZW50YWwiLCJIZXhhZ29uQ2VsbExheWVyIiwibG9nIiwiQmluU29ydGVyIiwiZ2V0UXVhbnRpemVTY2FsZSIsImdldExpbmVhclNjYWxlIiwiZGVmYXVsdENvbG9yUmFuZ2UiLCJwb2ludFRvSGV4YmluIiwibm9wIiwiZGVmYXVsdFByb3BzIiwiY29sb3JEb21haW4iLCJjb2xvclJhbmdlIiwiZ2V0Q29sb3JWYWx1ZSIsInBvaW50cyIsImxlbmd0aCIsImxvd2VyUGVyY2VudGlsZSIsInVwcGVyUGVyY2VudGlsZSIsIm9uU2V0Q29sb3JEb21haW4iLCJlbGV2YXRpb25Eb21haW4iLCJlbGV2YXRpb25SYW5nZSIsImdldEVsZXZhdGlvblZhbHVlIiwiZWxldmF0aW9uTG93ZXJQZXJjZW50aWxlIiwiZWxldmF0aW9uVXBwZXJQZXJjZW50aWxlIiwiZWxldmF0aW9uU2NhbGUiLCJvblNldEVsZXZhdGlvbkRvbWFpbiIsInJhZGl1cyIsImNvdmVyYWdlIiwiZXh0cnVkZWQiLCJoZXhhZ29uQWdncmVnYXRvciIsImdldFBvc2l0aW9uIiwieCIsInBvc2l0aW9uIiwiZnA2NCIsImxpZ2h0U2V0dGluZ3MiLCJsaWdodHNQb3NpdGlvbiIsImFtYmllbnRSYXRpbyIsImRpZmZ1c2VSYXRpbyIsInNwZWN1bGFyUmF0aW8iLCJsaWdodHNTdHJlbmd0aCIsIm51bWJlck9mTGlnaHRzIiwiSGV4YWdvbkxheWVyIiwicHJvcHMiLCJvbmNlIiwiTnVtYmVyIiwiaXNGaW5pdGUiLCJzdGF0ZSIsImhleGFnb25zIiwiaGV4YWdvblZlcnRpY2VzIiwic29ydGVkQ29sb3JCaW5zIiwic29ydGVkRWxldmF0aW9uQmlucyIsImNvbG9yVmFsdWVEb21haW4iLCJlbGV2YXRpb25WYWx1ZURvbWFpbiIsImNvbG9yU2NhbGVGdW5jIiwiZWxldmF0aW9uU2NhbGVGdW5jIiwiZGltZW5zaW9uVXBkYXRlcnMiLCJnZXREaW1lbnNpb25VcGRhdGVycyIsImNoYW5nZUZsYWdzIiwic29tZXRoaW5nQ2hhbmdlZCIsIm9sZFByb3BzIiwiZGltZW5zaW9uQ2hhbmdlcyIsImdldERpbWVuc2lvbkNoYW5nZXMiLCJkYXRhQ2hhbmdlZCIsIm5lZWRzUmVQcm9qZWN0UG9pbnRzIiwiZ2V0SGV4YWdvbnMiLCJmb3JFYWNoIiwiZiIsImFwcGx5IiwiZ2V0Q29sb3IiLCJpZCIsInRyaWdnZXJzIiwidXBkYXRlciIsImdldFNvcnRlZENvbG9yQmlucyIsImdldENvbG9yVmFsdWVEb21haW4iLCJnZXRDb2xvclNjYWxlIiwiZ2V0RWxldmF0aW9uIiwiZ2V0U29ydGVkRWxldmF0aW9uQmlucyIsImdldEVsZXZhdGlvblZhbHVlRG9tYWluIiwiZ2V0RWxldmF0aW9uU2NhbGUiLCJ1cGRhdGVycyIsImRpbWVuc2lvbktleSIsIm5lZWRVcGRhdGUiLCJmaW5kIiwiaXRlbSIsInNvbWUiLCJ0IiwicHVzaCIsInZpZXdwb3J0IiwiY29udGV4dCIsInNldFN0YXRlIiwiZ2V0U29ydGVkQmlucyIsImluZm8iLCJpc1BpY2tlZCIsInBpY2tlZCIsImluZGV4Iiwib2JqZWN0IiwiY2VsbCIsImNvbG9yVmFsdWUiLCJiaW5NYXAiLCJ2YWx1ZSIsImVsZXZhdGlvblZhbHVlIiwiT2JqZWN0IiwiYXNzaWduIiwiQm9vbGVhbiIsInVwZGF0ZVRyaWdnZXJzIiwic3RlcCIsInByb3AiLCJnZXRWYWx1ZVJhbmdlIiwiY3YiLCJpc0NvbG9yVmFsdWVJbkRvbWFpbiIsImNvbG9yIiwiZXYiLCJpc0VsZXZhdGlvblZhbHVlSW5Eb21haW4iLCJkYXRhIiwiYW5nbGUiLCJNYXRoIiwiUEkiLCJfb25HZXRTdWJsYXllckNvbG9yIiwiYmluZCIsIl9vbkdldFN1YmxheWVyRWxldmF0aW9uIiwiZ2V0VXBkYXRlVHJpZ2dlcnMiLCJTdWJMYXllckNsYXNzIiwiZ2V0U3ViTGF5ZXJD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b0JBQ3lELEtBQUtyRSxLQUQ5RDtBQUFBLFVBQ1ZoQixNQURVLFdBQ1ZBLE1BRFU7QUFBQSxVQUNGRixjQURFLFdBQ0ZBLGNBREU7QUFBQSxVQUNjSSxRQURkLFdBQ2NBLFFBRGQ7QUFBQSxVQUN3QkQsUUFEeEIsV0FDd0JBLFFBRHhCO0FBQUEsVUFDa0NPLGFBRGxDLFdBQ2tDQSxhQURsQztBQUFBLFVBQ2lERCxJQURqRCxXQUNpREEsSUFEakQ7O0FBR2pCOztBQUNBLDBJQUE4QjtBQUM1Qm9DLFlBQUksY0FEd0I7QUFFNUI0QyxjQUFNLEtBQUtuRSxLQUFMLENBQVdDLFFBRlc7O0FBSTVCZCxrQkFKNEI7QUFLNUJlLHlCQUFpQixLQUFLRixLQUFMLENBQVdFLGVBTEE7QUFNNUJ0QixzQkFONEI7QUFPNUJGLHNDQVA0QjtBQVE1QjBGLGVBQU9DLEtBQUtDLEVBUmdCO0FBUzVCeEYsMEJBVDRCO0FBVTVCRCwwQkFWNEI7QUFXNUJPLG9DQVg0Qjs7QUFhNUJrQyxrQkFBVSxLQUFLaUQsbUJBQUwsQ0FBeUJDLElBQXpCLENBQThCLElBQTlCLENBYmtCO0FBYzVCM0Msc0JBQWMsS0FBSzRDLHVCQUFMLENBQTZCRCxJQUE3QixDQUFrQyxJQUFsQyxDQWRjO0FBZTVCZCx3QkFBZ0IsS0FBS2dCLGlCQUFMO0FBZlksT0FBOUI7QUFpQkQ7O0FBRUQ7QUFDQTs7Ozt1Q0FDbUI7QUFDakIsYUFBT3RILGdCQUFQO0FBQ0Q7OzttQ0FFYztBQUNiLFVBQU11SCxnQkFBZ0IsS0FBS0MsZ0JBQUwsRUFBdEI7O0FBRUEsYUFBTyxJQUFJRCxhQUFKLENBQ0wsS0FBS0UsZ0JBQUwsRUFESyxDQUFQO0FBR0Q7Ozs7RUEvVHVDM0gsYzs7ZUFBckJ5QyxZOzs7QUFrVXJCQSxhQUFhbUYsU0FBYixHQUF5QixjQUF6QjtBQUNBbkYsYUFBYS9CLFlBQWIsR0FBNEJBLFlBQTVCIiwiZmlsZSI6ImhleGFnb24tbGF5ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgLSAyMDE3IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IHtDb21wb3NpdGVMYXllciwgZXhwZXJpbWVudGFsfSBmcm9tICcuLi8uLi9jb3JlJztcbmltcG9ydCBIZXhhZ29uQ2VsbExheWVyIGZyb20gJy4uL2hleGFnb24tY2VsbC1sYXllci9oZXhhZ29uLWNlbGwtbGF5ZXInO1xuXG5jb25zdCB7bG9nLCBCaW5Tb3J0ZXIsIGdldFF1YW50aXplU2NhbGUsIGdldExpbmVhclNjYWxlLCBkZWZhdWx0Q29sb3JSYW5nZX0gPSBleHBlcmltZW50YWw7XG5cbmltcG9ydCB7cG9pbnRUb0hleGJpbn0gZnJvbSAnLi9oZXhhZ29uLWFnZ3JlZ2F0b3InO1xuXG5mdW5jdGlvbiBub3AoKSB7fVxuXG5jb25zdCBkZWZhdWx0UHJvcHMgPSB7XG4gIC8vIGNvbG9yXG4gIGNvbG9yRG9tYWluOiBudWxsLFxuICBjb2xvclJhbmdlOiBkZWZhdWx0Q29sb3JSYW5nZSxcbiAgZ2V0Q29sb3JWYWx1ZTogcG9pbnRzID0+IHBvaW50cy5sZW5ndGgsXG4gIGxvd2VyUGVyY2VudGlsZTogMCxcbiAgdXBwZXJQZXJjZW50aWxlOiAxMDAsXG4gIG9uU2V0Q29sb3JEb21haW46IG5vcCxcblxuICAvLyBlbGV2YXRpb25cbiAgZWxldmF0aW9uRG9tYWluOiBudWxsLFxuICBlbGV2YXRpb25SYW5nZTogWzAsIDEwMDBdLFxuICBnZXRFbGV2YXRpb25WYWx1ZTogcG9pbnRzID0+IHBvaW50cy5sZW5ndGgsXG4gIGVsZXZhdGlvbkxvd2VyUGVyY2VudGlsZTogMCxcbiAgZWxldmF0aW9uVXBwZXJQZXJjZW50aWxlOiAxMDAsXG4gIGVsZXZhdGlvblNjYWxlOiAxLFxuICBvblNldEVsZXZhdGlvbkRvbWFpbjogbm9wLFxuXG4gIHJhZGl1czogMTAwMCxcbiAgY292ZXJhZ2U6IDEsXG4gIGV4dHJ1ZGVkOiBmYWxzZSxcbiAgaGV4YWdvbkFnZ3JlZ2F0b3I6IHBvaW50VG9IZXhiaW4sXG4gIGdldFBvc2l0aW9uOiB4ID0+IHgucG9zaXRpb24sXG4gIGZwNjQ6IGZhbHNlLFxuICAvLyBPcHRpb25hbCBzZXR0aW5ncyBmb3IgJ2xpZ2h0aW5nJyBzaGFkZXIgbW9kdWxlXG4gIGxpZ2h0U2V0dGluZ3M6IHtcbiAgICBsaWdodHNQb3NpdGlvbjogWy0xMjIuNDUsIDM3Ljc1LCA4MDAwLCAtMTIyLjAsIDM4LjAwLCA1MDAwXSxcbiAgICBhbWJpZW50UmF0aW86IDAuMDUsXG4gICAgZGlmZnVzZVJhdGlvOiAwLjYsXG4gICAgc3BlY3VsYXJSYXRpbzogMC44LFxuICAgIGxpZ2h0c1N0cmVuZ3RoOiBbMi4wLCAwLjAsIDAuMCwgMC4wXSxcbiAgICBudW1iZXJPZkxpZ2h0czogMlxuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBIZXhhZ29uTGF5ZXIgZXh0ZW5kcyBDb21wb3NpdGVMYXllciB7XG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgaWYgKCFwcm9wcy5oZXhhZ29uQWdncmVnYXRvciAmJiAhcHJvcHMucmFkaXVzKSB7XG4gICAgICBsb2cub25jZSgwLCAnSGV4YWdvbkxheWVyOiBEZWZhdWx0IGhleGFnb25BZ2dyZWdhdG9yIHJlcXVpcmVzIHJhZGl1cyBwcm9wIHRvIGJlIHNldCwgJyArXG4gICAgICAgICdOb3cgdXNpbmcgMTAwMCBtZXRlciBhcyBkZWZhdWx0Jyk7XG5cbiAgICAgIHByb3BzLnJhZGl1cyA9IGRlZmF1bHRQcm9wcy5yYWRpdXM7XG4gICAgfVxuXG4gICAgaWYgKE51bWJlci5pc0Zpbml0ZShwcm9wcy51cHBlclBlcmNlbnRpbGUpICYmXG4gICAgICAocHJvcHMudXBwZXJQZXJjZW50aWxlID4gMTAwIHx8IHByb3BzLnVwcGVyUGVyY2VudGlsZSA8IDApKSB7XG4gICAgICBsb2cub25jZSgwLCAnSGV4YWdvbkxheWVyOiB1cHBlclBlcmNlbnRpbGUgc2hvdWxkIGJlIGJldHdlZW4gMCBhbmQgMTAwLiAnICtcbiAgICAgICAgJ0Fzc2lnbiB0byAxMDAgYnkgZGVmYXVsdCcpO1xuXG4gICAgICBwcm9wcy51cHBlclBlcmNlbnRpbGUgPSBkZWZhdWx0UHJvcHMudXBwZXJQZXJjZW50aWxlO1xuICAgIH1cblxuICAgIGlmIChOdW1iZXIuaXNGaW5pdGUocHJvcHMubG93ZXJQZXJjZW50aWxlKSAmJlxuICAgICAgKHByb3BzLmxvd2VyUGVyY2VudGlsZSA+IDEwMCB8fCBwcm9wcy5sb3dlclBlcmNlbnRpbGUgPCAwKSkge1xuICAgICAgbG9nLm9uY2UoMCwgJ0hleGFnb25MYXllcjogbG93ZXJQZXJjZW50aWxlIHNob3VsZCBiZSBiZXR3ZWVuIDAgYW5kIDEwMC4gJyArXG4gICAgICAgICdBc3NpZ24gdG8gMCBieSBkZWZhdWx0Jyk7XG5cbiAgICAgIHByb3BzLmxvd2VyUGVyY2VudGlsZSA9IGRlZmF1bHRQcm9wcy51cHBlclBlcmNlbnRpbGU7XG4gICAgfVxuXG4gICAgaWYgKHByb3BzLmxvd2VyUGVyY2VudGlsZSA+PSBwcm9wcy51cHBlclBlcmNlbnRpbGUpIHtcbiAgICAgIGxvZy5vbmNlKDAsICdIZXhhZ29uTGF5ZXI6IGxvd2VyUGVyY2VudGlsZSBzaG91bGQgbm90IGJlIGJpZ2dlciB0aGFuICcgK1xuICAgICAgICAndXBwZXJQZXJjZW50aWxlLiBBc3NpZ24gdG8gMCBieSBkZWZhdWx0Jyk7XG5cbiAgICAgIHByb3BzLmxvd2VyUGVyY2VudGlsZSA9IGRlZmF1bHRQcm9wcy5sb3dlclBlcmNlbnRpbGU7XG4gICAgfVxuXG4gICAgc3VwZXIocHJvcHMpO1xuICB9XG5cbiAgaW5pdGlhbGl6ZVN0YXRlKCkge1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBoZXhhZ29uczogW10sXG4gICAgICBoZXhhZ29uVmVydGljZXM6IG51bGwsXG4gICAgICBzb3J0ZWRDb2xvckJpbnM6IG51bGwsXG4gICAgICBzb3J0ZWRFbGV2YXRpb25CaW5zOiBudWxsLFxuICAgICAgY29sb3JWYWx1ZURvbWFpbjogbnVsbCxcbiAgICAgIGVsZXZhdGlvblZhbHVlRG9tYWluOiBudWxsLFxuICAgICAgY29sb3JTY2FsZUZ1bmM6IG5vcCxcbiAgICAgIGVsZXZhdGlvblNjYWxlRnVuYzogbm9wLFxuICAgICAgZGltZW5zaW9uVXBkYXRlcnM6IHRoaXMuZ2V0RGltZW5zaW9uVXBkYXRlcnMoKVxuICAgIH07XG4gIH1cblxuICBzaG91bGRVcGRhdGVTdGF0ZSh7Y2hhbmdlRmxhZ3N9KSB7XG4gICAgcmV0dXJuIGNoYW5nZUZsYWdzLnNvbWV0aGluZ0NoYW5nZWQ7XG4gIH1cblxuICB1cGRhdGVTdGF0ZSh7b2xkUHJvcHMsIHByb3BzLCBjaGFuZ2VGbGFnc30pIHtcbiAgICBjb25zdCBkaW1lbnNpb25DaGFuZ2VzID0gdGhpcy5nZXREaW1lbnNpb25DaGFuZ2VzKG9sZFByb3BzLCBwcm9wcyk7XG5cbiAgICBpZiAoY2hhbmdlRmxhZ3MuZGF0YUNoYW5nZWQgfHwgdGhpcy5uZWVkc1JlUHJvamVjdFBvaW50cyhvbGRQcm9wcywgcHJvcHMpKSB7XG4gICAgICAvLyBwcm9qZWN0IGRhdGEgaW50byBoZXhhZ29ucywgYW5kIGdldCBzb3J0ZWRDb2xvckJpbnNcbiAgICAgIHRoaXMuZ2V0SGV4YWdvbnMoKTtcblxuICAgIH0gZWxzZSBpZiAoZGltZW5zaW9uQ2hhbmdlcykge1xuICAgICAgZGltZW5zaW9uQ2hhbmdlcy5mb3JFYWNoKGYgPT4gdHlwZW9mIGYgPT09ICdmdW5jdGlvbicgJiYgZi5hcHBseSh0aGlzKSk7XG4gICAgfVxuICB9XG5cbiAgbmVlZHNSZVByb2plY3RQb2ludHMob2xkUHJvcHMsIHByb3BzKSB7XG4gICAgcmV0dXJuIG9sZFByb3BzLnJhZGl1cyAhPT0gcHJvcHMucmFkaXVzIHx8XG4gICAgICBvbGRQcm9wcy5oZXhhZ29uQWdncmVnYXRvciAhPT0gcHJvcHMuaGV4YWdvbkFnZ3JlZ2F0b3I7XG4gIH1cblxuICBnZXREaW1lbnNpb25VcGRhdGVycygpIHtcbiAgICAvLyBkaW1lbnNpb24gdXBkYXRlcnMgYXJlIHNlcXVlbnRpYWwsXG4gICAgLy8gaWYgdGhlIGZpcnN0IG9uZSBuZWVkcyB0byBiZSBjYWxsZWQsIHRoZSAybmQgYW5kIDNyZCBvbmUgd2lsbCBhdXRvbWF0aWNhbGx5XG4gICAgLy8gYmUgY2FsbGVkLiBlLmcuIGlmIENvbG9yVmFsdWUgbmVlZHMgdG8gYmUgdXBkYXRlZCwgZ2V0Q29sb3JWYWx1ZURvbWFpbiBhbmQgZ2V0Q29sb3JTY2FsZVxuICAgIC8vIHdpbGwgYXV0b21hdGljYWxseSBiZSBjYWxsZWRcbiAgICByZXR1cm4ge1xuICAgICAgZ2V0Q29sb3I6IFtcbiAgICAgICAge1xuICAgICAgICAgIGlkOiAndmFsdWUnLFxuICAgICAgICAgIHRyaWdnZXJzOiBbJ2dldENvbG9yVmFsdWUnXSxcbiAgICAgICAgICB1cGRhdGVyOiB0aGlzLmdldFNvcnRlZENvbG9yQmluc1xuICAgICAgICB9LCB7XG4gICAgICAgICAgaWQ6ICdkb21haW4nLFxuICAgICAgICAgIHRyaWdnZXJzOiBbJ2xvd2VyUGVyY2VudGlsZScsICd1cHBlclBlcmNlbnRpbGUnXSxcbiAgICAgICAgICB1cGRhdGVyOiB0aGlzLmdldENvbG9yVmFsdWVEb21haW5cbiAgICAgICAgfSwge1xuICAgICAgICAgIGlkOiAnc2NhbGVGdW5jJyxcbiAgICAgICAgICB0cmlnZ2VyczogWydjb2xvckRvbWFpbicsICdjb2xvclJhbmdlJ10sXG4gICAgICAgICAgdXBkYXRlcjogdGhpcy5nZXRDb2xvclNjYWxlXG4gICAgICAgIH1cbiAgICAgIF0sXG4gICAgICBnZXRFbGV2YXRpb246IFtcbiAgICAgICAge1xuICAgICAgICAgIGlkOiAndmFsdWUnLFxuICAgICAgICAgIHRyaWdnZXJzOiBbJ2dldEVsZXZhdGlvblZhbHVlJ10sXG4gICAgICAgICAgdXBkYXRlcjogdGhpcy5nZXRTb3J0ZWRFbGV2YXRpb25CaW5zXG4gICAgICAgIH0sIHtcbiAgICAgICAgICBpZDogJ2RvbWFpbicsXG4gICAgICAgICAgdHJpZ2dlcnM6IFsnZWxldmF0aW9uTG93ZXJQZXJjZW50aWxlJywgJ2VsZXZhdGlvblVwcGVyUGVyY2VudGlsZSddLFxuICAgICAgICAgIHVwZGF0ZXI6IHRoaXMuZ2V0RWxldmF0aW9uVmFsdWVEb21haW5cbiAgICAgICAgfSwge1xuICAgICAgICAgIGlkOiAnc2NhbGVGdW5jJyxcbiAgICAgICAgICB0cmlnZ2VyczogWydlbGV2YXRpb25Eb21haW4nLCAnZWxldmF0aW9uUmFuZ2UnXSxcbiAgICAgICAgICB1cGRhdGVyOiB0aGlzLmdldEVsZXZhdGlvblNjYWxlXG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9O1xuICB9XG5cbiAgZ2V0RGltZW5zaW9uQ2hhbmdlcyhvbGRQcm9wcywgcHJvcHMpIHtcbiAgICBjb25zdCB7ZGltZW5zaW9uVXBkYXRlcnN9ID0gdGhpcy5zdGF0ZTtcbiAgICBjb25zdCB1cGRhdGVycyA9IFtdO1xuXG4gICAgLy8gZ2V0IGRpbWVuc2lvbiB0byBiZSB1cGRhdGVkXG4gICAgZm9yIChjb25zdCBkaW1lbnNpb25LZXkgaW4gZGltZW5zaW9uVXBkYXRlcnMpIHtcblxuICAgICAgLy8gcmV0dXJuIHRoZSBmaXJzdCB0cmlnZ2VyZWQgdXBkYXRlciBmb3IgZWFjaCBkaW1lbnNpb25cbiAgICAgIGNvbnN0IG5lZWRVcGRhdGUgPSBkaW1lbnNpb25VcGRhdGVyc1tkaW1lbnNpb25LZXldXG4gICAgICAgIC5maW5kKGl0ZW0gPT4gaXRlbS50cmlnZ2Vycy5zb21lKHQgPT4gb2xkUHJvcHNbdF0gIT09IHByb3BzW3RdKSk7XG5cbiAgICAgIGlmIChuZWVkVXBkYXRlKSB7XG4gICAgICAgIHVwZGF0ZXJzLnB1c2gobmVlZFVwZGF0ZS51cGRhdGVyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdXBkYXRlcnMubGVuZ3RoID8gdXBkYXRlcnMgOiBudWxsO1xuICB9XG5cbiAgZ2V0SGV4YWdvbnMoKSB7XG4gICAgY29uc3Qge2hleGFnb25BZ2dyZWdhdG9yfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge3ZpZXdwb3J0fSA9IHRoaXMuY29udGV4dDtcbiAgICBjb25zdCB7aGV4YWdvbnMsIGhleGFnb25WZXJ0aWNlc30gPSBoZXhhZ29uQWdncmVnYXRvcih0aGlzLnByb3BzLCB2aWV3cG9ydCk7XG4gICAgdGhpcy5zZXRTdGF0ZSh7aGV4YWdvbnMsIGhleGFnb25WZXJ0aWNlc30pO1xuICAgIHRoaXMuZ2V0U29ydGVkQmlucygpO1xuICB9XG5cbiAgZ2V0UGlja2luZ0luZm8oe2luZm99KSB7XG4gICAgY29uc3Qge3NvcnRlZENvbG9yQmlucywgc29ydGVkRWxldmF0aW9uQmluc30gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IGlzUGlja2VkID0gaW5mby5waWNrZWQgJiYgaW5mby5pbmRleCA+IC0xO1xuXG4gICAgbGV0IG9iamVjdCA9IG51bGw7XG4gICAgaWYgKGlzUGlja2VkKSB7XG5cbiAgICAgIGNvbnN0IGNlbGwgPSB0aGlzLnN0YXRlLmhleGFnb25zW2luZm8uaW5kZXhdO1xuXG4gICAgICBjb25zdCBjb2xvclZhbHVlID0gc29ydGVkQ29sb3JCaW5zLmJpbk1hcFtjZWxsLmluZGV4XSAmJlxuICAgICAgICBzb3J0ZWRDb2xvckJpbnMuYmluTWFwW2NlbGwuaW5kZXhdLnZhbHVlO1xuICAgICAgY29uc3QgZWxldmF0aW9uVmFsdWUgPSBzb3J0ZWRFbGV2YXRpb25CaW5zLmJpbk1hcFtjZWxsLmluZGV4XSAmJlxuICAgICAgICBzb3J0ZWRFbGV2YXRpb25CaW5zLmJpbk1hcFtjZWxsLmluZGV4XS52YWx1ZTtcblxuICAgICAgb2JqZWN0ID0gT2JqZWN0LmFzc2lnbih7XG4gICAgICAgIGNvbG9yVmFsdWUsXG4gICAgICAgIGVsZXZhdGlvblZhbHVlXG4gICAgICB9LCBjZWxsKTtcbiAgICB9XG5cbiAgICAvLyBhZGQgYmluIGNvbG9yVmFsdWUgYW5kIGVsZXZhdGlvblZhbHVlIHRvIGluZm9cbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihpbmZvLCB7XG4gICAgICBwaWNrZWQ6IEJvb2xlYW4ob2JqZWN0KSxcbiAgICAgIC8vIG92ZXJyaWRlIG9iamVjdCB3aXRoIHBpY2tlZCBjZWxsXG4gICAgICBvYmplY3RcbiAgICB9KTtcbiAgfVxuXG4gIGdldFVwZGF0ZVRyaWdnZXJzKCkge1xuICAgIGNvbnN0IHtkaW1lbnNpb25VcGRhdGVyc30gPSB0aGlzLnN0YXRlO1xuXG4gICAgLy8gbWVyZ2UgYWxsIGRpbWVuc2lvbiB0cmlnZ2Vyc1xuICAgIGNvbnN0IHVwZGF0ZVRyaWdnZXJzID0ge307XG5cbiAgICBmb3IgKGNvbnN0IGRpbWVuc2lvbktleSBpbiBkaW1lbnNpb25VcGRhdGVycykge1xuXG4gICAgICB1cGRhdGVUcmlnZ2Vyc1tkaW1lbnNpb25LZXldID0ge307XG5cbiAgICAgIGZvciAoY29uc3Qgc3RlcCBvZiBkaW1lbnNpb25VcGRhdGVyc1tkaW1lbnNpb25LZXldKSB7XG5cbiAgICAgICAgc3RlcC50cmlnZ2Vycy5mb3JFYWNoKHByb3AgPT4ge1xuICAgICAgICAgIHVwZGF0ZVRyaWdnZXJzW2RpbWVuc2lvbktleV1bcHJvcF0gPSB0aGlzLnByb3BzW3Byb3BdO1xuICAgICAgICB9KTtcblxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB1cGRhdGVUcmlnZ2VycztcbiAgfVxuXG4gIGdldFZhbHVlRG9tYWluKCkge1xuICAgIHRoaXMuZ2V0Q29sb3JWYWx1ZURvbWFpbigpO1xuICAgIHRoaXMuZ2V0RWxldmF0aW9uVmFsdWVEb21haW4oKTtcbiAgfVxuXG4gIGdldFNvcnRlZEJpbnMoKSB7XG4gICAgdGhpcy5nZXRTb3J0ZWRDb2xvckJpbnMoKTtcbiAgICB0aGlzLmdldFNvcnRlZEVsZXZhdGlvbkJpbnMoKTtcbiAgfVxuXG4gIGdldFNvcnRlZENvbG9yQmlucygpIHtcbiAgICBjb25zdCB7Z2V0Q29sb3JWYWx1ZX0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHNvcnRlZENvbG9yQmlucyA9IG5ldyBCaW5Tb3J0ZXIodGhpcy5zdGF0ZS5oZXhhZ29ucyB8fCBbXSwgZ2V0Q29sb3JWYWx1ZSk7XG5cbiAgICB0aGlzLnNldFN0YXRlKHtzb3J0ZWRDb2xvckJpbnN9KTtcbiAgICB0aGlzLmdldENvbG9yVmFsdWVEb21haW4oKTtcbiAgfVxuXG4gIGdldFNvcnRlZEVsZXZhdGlvbkJpbnMoKSB7XG4gICAgY29uc3Qge2dldEVsZXZhdGlvblZhbHVlfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qgc29ydGVkRWxldmF0aW9uQmlucyA9IG5ldyBCaW5Tb3J0ZXIodGhpcy5zdGF0ZS5oZXhhZ29ucyB8fCBbXSwgZ2V0RWxldmF0aW9uVmFsdWUpO1xuICAgIHRoaXMuc2V0U3RhdGUoe3NvcnRlZEVsZXZhdGlvbkJpbnN9KTtcbiAgICB0aGlzLmdldEVsZXZhdGlvblZhbHVlRG9tYWluKCk7XG4gIH1cblxuICBnZXRDb2xvclZhbHVlRG9tYWluKCkge1xuICAgIGNvbnN0IHtsb3dlclBlcmNlbnRpbGUsIHVwcGVyUGVyY2VudGlsZSwgb25TZXRDb2xvckRvbWFpbn0gPSB0aGlzLnByb3BzO1xuXG4gICAgdGhpcy5zdGF0ZS5jb2xvclZhbHVlRG9tYWluID0gdGhpcy5zdGF0ZS5zb3J0ZWRDb2xvckJpbnNcbiAgICAgIC5nZXRWYWx1ZVJhbmdlKFtsb3dlclBlcmNlbnRpbGUsIHVwcGVyUGVyY2VudGlsZV0pO1xuXG4gICAgaWYgKHR5cGVvZiBvblNldENvbG9yRG9tYWluID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBvblNldENvbG9yRG9tYWluKHRoaXMuc3RhdGUuY29sb3JWYWx1ZURvbWFpbik7XG4gICAgfVxuXG4gICAgdGhpcy5nZXRDb2xvclNjYWxlKCk7XG4gIH1cblxuICBnZXRFbGV2YXRpb25WYWx1ZURvbWFpbigpIHtcbiAgICBjb25zdCB7ZWxldmF0aW9uTG93ZXJQZXJjZW50aWxlLCBlbGV2YXRpb25VcHBlclBlcmNlbnRpbGUsIG9uU2V0RWxldmF0aW9uRG9tYWlufSA9IHRoaXMucHJvcHM7XG5cbiAgICB0aGlzLnN0YXRlLmVsZXZhdGlvblZhbHVlRG9tYWluID0gdGhpcy5zdGF0ZS5zb3J0ZWRFbGV2YXRpb25CaW5zXG4gICAgICAuZ2V0VmFsdWVSYW5nZShbZWxldmF0aW9uTG93ZXJQZXJjZW50aWxlLCBlbGV2YXRpb25VcHBlclBlcmNlbnRpbGVdKTtcblxuICAgIGlmICh0eXBlb2Ygb25TZXRFbGV2YXRpb25Eb21haW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIG9uU2V0RWxldmF0aW9uRG9tYWluKHRoaXMuc3RhdGUuZWxldmF0aW9uVmFsdWVEb21haW4pO1xuICAgIH1cblxuICAgIHRoaXMuZ2V0RWxldmF0aW9uU2NhbGUoKTtcbiAgfVxuXG4gIGdldENvbG9yU2NhbGUoKSB7XG4gICAgY29uc3Qge2NvbG9yUmFuZ2V9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCBjb2xvckRvbWFpbiA9IHRoaXMucHJvcHMuY29sb3JEb21haW4gfHwgdGhpcy5zdGF0ZS5jb2xvclZhbHVlRG9tYWluO1xuXG4gICAgdGhpcy5zdGF0ZS5jb2xvclNjYWxlRnVuYyA9IGdldFF1YW50aXplU2NhbGUoY29sb3JEb21haW4sIGNvbG9yUmFuZ2UpO1xuICB9XG5cbiAgZ2V0RWxldmF0aW9uU2NhbGUoKSB7XG4gICAgY29uc3Qge2VsZXZhdGlvblJhbmdlfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgZWxldmF0aW9uRG9tYWluID0gdGhpcy5wcm9wcy5lbGV2YXRpb25Eb21haW4gfHwgdGhpcy5zdGF0ZS5lbGV2YXRpb25WYWx1ZURvbWFpbjtcblxuICAgIHRoaXMuc3RhdGUuZWxldmF0aW9uU2NhbGVGdW5jID0gZ2V0TGluZWFyU2NhbGUoZWxldmF0aW9uRG9tYWluLCBlbGV2YXRpb25SYW5nZSk7XG4gIH1cblxuICBfb25HZXRTdWJsYXllckNvbG9yKGNlbGwpIHtcbiAgICBjb25zdCB7c29ydGVkQ29sb3JCaW5zLCBjb2xvclNjYWxlRnVuYywgY29sb3JWYWx1ZURvbWFpbn0gPSB0aGlzLnN0YXRlO1xuXG4gICAgY29uc3QgY3YgPSBzb3J0ZWRDb2xvckJpbnMuYmluTWFwW2NlbGwuaW5kZXhdICYmIHNvcnRlZENvbG9yQmlucy5iaW5NYXBbY2VsbC5pbmRleF0udmFsdWU7XG4gICAgY29uc3QgY29sb3JEb21haW4gPSB0aGlzLnByb3BzLmNvbG9yRG9tYWluIHx8IGNvbG9yVmFsdWVEb21haW47XG5cbiAgICBjb25zdCBpc0NvbG9yVmFsdWVJbkRvbWFpbiA9IGN2ID49IGNvbG9yRG9tYWluWzBdICYmIGN2IDw9IGNvbG9yRG9tYWluW2NvbG9yRG9tYWluLmxlbmd0aCAtIDFdO1xuXG4gICAgLy8gaWYgY2VsbCB2YWx1ZSBpcyBvdXRzaWRlIGRvbWFpbiwgc2V0IGFscGhhIHRvIDBcbiAgICBjb25zdCBjb2xvciA9IGlzQ29sb3JWYWx1ZUluRG9tYWluID8gY29sb3JTY2FsZUZ1bmMoY3YpIDogWzAsIDAsIDAsIDBdO1xuXG4gICAgLy8gYWRkIGFscGhhIHRvIGNvbG9yIGlmIG5vdCBkZWZpbmVkIGluIGNvbG9yUmFuZ2VcbiAgICBjb2xvclszXSA9IE51bWJlci5pc0Zpbml0ZShjb2xvclszXSkgPyBjb2xvclszXSA6IDI1NTtcblxuICAgIHJldHVybiBjb2xvcjtcbiAgfVxuXG4gIF9vbkdldFN1YmxheWVyRWxldmF0aW9uKGNlbGwpIHtcbiAgICBjb25zdCB7c29ydGVkRWxldmF0aW9uQmlucywgZWxldmF0aW9uU2NhbGVGdW5jLCBlbGV2YXRpb25WYWx1ZURvbWFpbn0gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IGV2ID0gc29ydGVkRWxldmF0aW9uQmlucy5iaW5NYXBbY2VsbC5pbmRleF0gJiZcbiAgICAgIHNvcnRlZEVsZXZhdGlvbkJpbnMuYmluTWFwW2NlbGwuaW5kZXhdLnZhbHVlO1xuXG4gICAgY29uc3QgZWxldmF0aW9uRG9tYWluID0gdGhpcy5wcm9wcy5lbGV2YXRpb25Eb21haW4gfHwgZWxldmF0aW9uVmFsdWVEb21haW47XG5cbiAgICBjb25zdCBpc0VsZXZhdGlvblZhbHVlSW5Eb21haW4gPSBldiA+PSBlbGV2YXRpb25Eb21haW5bMF0gJiZcbiAgICAgIGV2IDw9IGVsZXZhdGlvbkRvbWFpbltlbGV2YXRpb25Eb21haW4ubGVuZ3RoIC0gMV07XG5cbiAgICAvLyBpZiBjZWxsIHZhbHVlIGlzIG91dHNpZGUgZG9tYWluLCBzZXQgZWxldmF0aW9uIHRvIC0xXG4gICAgcmV0dXJuIGlzRWxldmF0aW9uVmFsdWVJbkRvbWFpbiA/IGVsZXZhdGlvblNjYWxlRnVuYyhldikgOiAtMTtcbiAgfVxuXG4gIC8vIGZvciBzdWJjbGFzc2luZywgb3ZlcnJpZGUgdGhpcyBtZXRob2QgdG8gcmV0dXJuXG4gIC8vIGN1c3RvbWl6ZWQgc3ViIGxheWVyIHByb3BzXG4gIGdldFN1YkxheWVyUHJvcHMoKSB7XG4gICAgY29uc3Qge3JhZGl1cywgZWxldmF0aW9uU2NhbGUsIGV4dHJ1ZGVkLCBjb3ZlcmFnZSwgbGlnaHRTZXR0aW5ncywgZnA2NH0gPSB0aGlzLnByb3BzO1xuXG4gICAgLy8gcmV0dXJuIHByb3BzIHRvIHRoZSBzdWJsYXllciBjb25zdHJ1Y3RvclxuICAgIHJldHVybiBzdXBlci5nZXRTdWJMYXllclByb3BzKHtcbiAgICAgIGlkOiAnaGV4YWdvbi1jZWxsJyxcbiAgICAgIGRhdGE6IHRoaXMuc3RhdGUuaGV4YWdvbnMsXG5cbiAgICAgIGZwNjQsXG4gICAgICBoZXhhZ29uVmVydGljZXM6IHRoaXMuc3RhdGUuaGV4YWdvblZlcnRpY2VzLFxuICAgICAgcmFkaXVzLFxuICAgICAgZWxldmF0aW9uU2NhbGUsXG4gICAgICBhbmdsZTogTWF0aC5QSSxcbiAgICAgIGV4dHJ1ZGVkLFxuICAgICAgY292ZXJhZ2UsXG4gICAgICBsaWdodFNldHRpbmdzLFxuXG4gICAgICBnZXRDb2xvcjogdGhpcy5fb25HZXRTdWJsYXllckNvbG9yLmJpbmQodGhpcyksXG4gICAgICBnZXRFbGV2YXRpb246IHRoaXMuX29uR2V0U3VibGF5ZXJFbGV2YXRpb24uYmluZCh0aGlzKSxcbiAgICAgIHVwZGF0ZVRyaWdnZXJzOiB0aGlzLmdldFVwZGF0ZVRyaWdnZXJzKClcbiAgICB9KTtcbiAgfVxuXG4gIC8vIGZvciBzdWJjbGFzc2luZywgb3ZlcnJpZGUgdGhpcyBtZXRob2QgdG8gcmV0dXJuXG4gIC8vIGN1c3RvbWl6ZWQgc3ViIGxheWVyIGNsYXNzXG4gIGdldFN1YkxheWVyQ2xhc3MoKSB7XG4gICAgcmV0dXJuIEhleGFnb25DZWxsTGF5ZXI7XG4gIH1cblxuICByZW5kZXJMYXllcnMoKSB7XG4gICAgY29uc3QgU3ViTGF5ZXJDbGFzcyA9IHRoaXMuZ2V0U3ViTGF5ZXJDbGFzcygpO1xuXG4gICAgcmV0dXJuIG5ldyBTdWJMYXllckNsYXNzKFxuICAgICAgdGhpcy5nZXRTdWJMYXllclByb3BzKClcbiAgICApO1xuICB9XG59XG5cbkhleGFnb25MYXllci5sYXllck5hbWUgPSAnSGV4YWdvbkxheWVyJztcbkhleGFnb25MYXllci5kZWZhdWx0UHJvcHMgPSBkZWZhdWx0UHJvcHM7XG4iXX0=