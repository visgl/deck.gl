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
var BinSorter = experimental.BinSorter,
    defaultColorRange = experimental.defaultColorRange,
    getQuantizeScale = experimental.getQuantizeScale,
    getLinearScale = experimental.getLinearScale;


import GridCellLayer from '../grid-cell-layer/grid-cell-layer';

import { pointToDensityGridData } from './grid-aggregator';

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

  // grid
  cellSize: 1000,
  coverage: 1,
  getPosition: function getPosition(x) {
    return x.position;
  },
  extruded: false,
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

var GridLayer = function (_CompositeLayer) {
  _inherits(GridLayer, _CompositeLayer);

  function GridLayer() {
    _classCallCheck(this, GridLayer);

    return _possibleConstructorReturn(this, (GridLayer.__proto__ || Object.getPrototypeOf(GridLayer)).apply(this, arguments));
  }

  _createClass(GridLayer, [{
    key: 'initializeState',
    value: function initializeState() {
      this.state = {
        layerData: [],
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
    key: 'updateState',
    value: function updateState(_ref) {
      var _this2 = this;

      var oldProps = _ref.oldProps,
          props = _ref.props,
          changeFlags = _ref.changeFlags;

      var dimensionChanges = this.getDimensionChanges(oldProps, props);

      if (changeFlags.dataChanged || this.needsReProjectPoints(oldProps, props)) {
        // project data into hexagons, and get sortedBins
        this.getLayerData();
      } else if (dimensionChanges) {
        dimensionChanges.forEach(function (f) {
          return typeof f === 'function' && f.apply(_this2);
        });
      }
    }
  }, {
    key: 'needsReProjectPoints',
    value: function needsReProjectPoints(oldProps, props) {
      return oldProps.cellSize !== props.cellSize;
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
    key: 'getPickingInfo',
    value: function getPickingInfo(_ref2) {
      var info = _ref2.info;
      var _state = this.state,
          sortedColorBins = _state.sortedColorBins,
          sortedElevationBins = _state.sortedElevationBins;


      var isPicked = info.picked && info.index > -1;
      var object = null;

      if (isPicked) {
        var cell = this.state.layerData[info.index];

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
    key: 'getLayerData',
    value: function getLayerData() {
      var _props = this.props,
          data = _props.data,
          cellSize = _props.cellSize,
          getPosition = _props.getPosition;

      var _pointToDensityGridDa = pointToDensityGridData(data, cellSize, getPosition),
          layerData = _pointToDensityGridDa.layerData;

      this.setState({ layerData: layerData });
      this.getSortedBins();
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

      var sortedColorBins = new BinSorter(this.state.layerData || [], getColorValue);

      this.setState({ sortedColorBins: sortedColorBins });
      this.getColorValueDomain();
    }
  }, {
    key: 'getSortedElevationBins',
    value: function getSortedElevationBins() {
      var getElevationValue = this.props.getElevationValue;

      var sortedElevationBins = new BinSorter(this.state.layerData || [], getElevationValue);
      this.setState({ sortedElevationBins: sortedElevationBins });
      this.getElevationValueDomain();
    }
  }, {
    key: 'getColorValueDomain',
    value: function getColorValueDomain() {
      var _props2 = this.props,
          lowerPercentile = _props2.lowerPercentile,
          upperPercentile = _props2.upperPercentile,
          onSetColorDomain = _props2.onSetColorDomain;


      this.state.colorValueDomain = this.state.sortedColorBins.getValueRange([lowerPercentile, upperPercentile]);

      if (typeof onSetColorDomain === 'function') {
        onSetColorDomain(this.state.colorValueDomain);
      }

      this.getColorScale();
    }
  }, {
    key: 'getElevationValueDomain',
    value: function getElevationValueDomain() {
      var _props3 = this.props,
          elevationLowerPercentile = _props3.elevationLowerPercentile,
          elevationUpperPercentile = _props3.elevationUpperPercentile,
          onSetElevationDomain = _props3.onSetElevationDomain;


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
      var _props4 = this.props,
          elevationScale = _props4.elevationScale,
          fp64 = _props4.fp64,
          extruded = _props4.extruded,
          cellSize = _props4.cellSize,
          coverage = _props4.coverage,
          lightSettings = _props4.lightSettings;

      // return props to the sublayer constructor

      return _get(GridLayer.prototype.__proto__ || Object.getPrototypeOf(GridLayer.prototype), 'getSubLayerProps', this).call(this, {
        id: 'grid-cell',
        data: this.state.layerData,

        fp64: fp64,
        cellSize: cellSize,
        coverage: coverage,
        lightSettings: lightSettings,
        elevationScale: elevationScale,
        extruded: extruded,

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
      return GridCellLayer;
    }
  }, {
    key: 'renderLayers',
    value: function renderLayers() {
      var SubLayerClass = this.getSubLayerClass();

      return new SubLayerClass(this.getSubLayerProps());
    }
  }]);

  return GridLayer;
}(CompositeLayer);

export default GridLayer;


GridLayer.layerName = 'GridLayer';
GridLayer.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlLWxheWVycy9ncmlkLWxheWVyL2dyaWQtbGF5ZXIuanMiXSwibmFtZXMiOlsiQ29tcG9zaXRlTGF5ZXIiLCJleHBlcmltZW50YWwiLCJCaW5Tb3J0ZXIiLCJkZWZhdWx0Q29sb3JSYW5nZSIsImdldFF1YW50aXplU2NhbGUiLCJnZXRMaW5lYXJTY2FsZSIsIkdyaWRDZWxsTGF5ZXIiLCJwb2ludFRvRGVuc2l0eUdyaWREYXRhIiwibm9wIiwiZGVmYXVsdFByb3BzIiwiY29sb3JEb21haW4iLCJjb2xvclJhbmdlIiwiZ2V0Q29sb3JWYWx1ZSIsInBvaW50cyIsImxlbmd0aCIsImxvd2VyUGVyY2VudGlsZSIsInVwcGVyUGVyY2VudGlsZSIsIm9uU2V0Q29sb3JEb21haW4iLCJlbGV2YXRpb25Eb21haW4iLCJlbGV2YXRpb25SYW5nZSIsImdldEVsZXZhdGlvblZhbHVlIiwiZWxldmF0aW9uTG93ZXJQZXJjZW50aWxlIiwiZWxldmF0aW9uVXBwZXJQZXJjZW50aWxlIiwiZWxldmF0aW9uU2NhbGUiLCJvblNldEVsZXZhdGlvbkRvbWFpbiIsImNlbGxTaXplIiwiY292ZXJhZ2UiLCJnZXRQb3NpdGlvbiIsIngiLCJwb3NpdGlvbiIsImV4dHJ1ZGVkIiwiZnA2NCIsImxpZ2h0U2V0dGluZ3MiLCJsaWdodHNQb3NpdGlvbiIsImFtYmllbnRSYXRpbyIsImRpZmZ1c2VSYXRpbyIsInNwZWN1bGFyUmF0aW8iLCJsaWdodHNTdHJlbmd0aCIsIm51bWJlck9mTGlnaHRzIiwiR3JpZExheWVyIiwic3RhdGUiLCJsYXllckRhdGEiLCJzb3J0ZWRDb2xvckJpbnMiLCJzb3J0ZWRFbGV2YXRpb25CaW5zIiwiY29sb3JWYWx1ZURvbWFpbiIsImVsZXZhdGlvblZhbHVlRG9tYWluIiwiY29sb3JTY2FsZUZ1bmMiLCJlbGV2YXRpb25TY2FsZUZ1bmMiLCJkaW1lbnNpb25VcGRhdGVycyIsImdldERpbWVuc2lvblVwZGF0ZXJzIiwib2xkUHJvcHMiLCJwcm9wcyIsImNoYW5nZUZsYWdzIiwiZGltZW5zaW9uQ2hhbmdlcyIsImdldERpbWVuc2lvbkNoYW5nZXMiLCJkYXRhQ2hhbmdlZCIsIm5lZWRzUmVQcm9qZWN0UG9pbnRzIiwiZ2V0TGF5ZXJEYXRhIiwiZm9yRWFjaCIsImYiLCJhcHBseSIsImdldENvbG9yIiwiaWQiLCJ0cmlnZ2VycyIsInVwZGF0ZXIiLCJnZXRTb3J0ZWRDb2xvckJpbnMiLCJnZXRDb2xvclZhbHVlRG9tYWluIiwiZ2V0Q29sb3JTY2FsZSIsImdldEVsZXZhdGlvbiIsImdldFNvcnRlZEVsZXZhdGlvbkJpbnMiLCJnZXRFbGV2YXRpb25WYWx1ZURvbWFpbiIsImdldEVsZXZhdGlvblNjYWxlIiwidXBkYXRlcnMiLCJkaW1lbnNpb25LZXkiLCJuZWVkVXBkYXRlIiwiZmluZCIsIml0ZW0iLCJzb21lIiwidCIsInB1c2giLCJpbmZvIiwiaXNQaWNrZWQiLCJwaWNrZWQiLCJpbmRleCIsIm9iamVjdCIsImNlbGwiLCJjb2xvclZhbHVlIiwiYmluTWFwIiwidmFsdWUiLCJlbGV2YXRpb25WYWx1ZSIsIk9iamVjdCIsImFzc2lnbiIsIkJvb2xlYW4iLCJ1cGRhdGVUcmlnZ2VycyIsInN0ZXAiLCJwcm9wIiwiZGF0YSIsInNldFN0YXRlIiwiZ2V0U29ydGVkQmlucyIsImdldFZhbHVlUmFuZ2UiLCJjdiIsImlzQ29sb3JWYWx1ZUluRG9tYWluIiwiY29sb3IiLCJOdW1iZXIiLCJpc0Zpbml0ZSIsImV2IiwiaXNFbGV2YXRpb25WYWx1ZUluRG9tYWluIiwiX29uR2V0U3VibGF5ZXJDb2xvciIsImJpbmQiLCJfb25HZXRTdWJsYXllckVsZXZhdGlvbiIsImdldFVwZGF0ZVRyaWdnZXJzIiwiU3ViTGF5ZXJDbGFzcyIsImdldFN1YkxheWVyQ2xhc3MiLCJnZXRTdWJMYXllclByb3BzIiwibGF5ZXJOYW1lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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QUFBLFVBQzBDTSxhQUQxQyxXQUMwQ0EsYUFEMUM7O0FBR2pCOztBQUNBLG9JQUE4QjtBQUM1QjhCLFlBQUksV0FEd0I7QUFFNUJrQyxjQUFNLEtBQUt4RCxLQUFMLENBQVdDLFNBRlc7O0FBSTVCVixrQkFKNEI7QUFLNUJOLDBCQUw0QjtBQU01QkMsMEJBTjRCO0FBTzVCTSxvQ0FQNEI7QUFRNUJULHNDQVI0QjtBQVM1Qk8sMEJBVDRCOztBQVc1QitCLGtCQUFVLEtBQUs4QyxtQkFBTCxDQUF5QkMsSUFBekIsQ0FBOEIsSUFBOUIsQ0FYa0I7QUFZNUJ4QyxzQkFBYyxLQUFLeUMsdUJBQUwsQ0FBNkJELElBQTdCLENBQWtDLElBQWxDLENBWmM7QUFhNUJmLHdCQUFnQixLQUFLaUIsaUJBQUw7QUFiWSxPQUE5QjtBQWVEOztBQUVEO0FBQ0E7Ozs7dUNBQ21CO0FBQ2pCLGFBQU94RyxhQUFQO0FBQ0Q7OzttQ0FFYztBQUNiLFVBQU15RyxnQkFBZ0IsS0FBS0MsZ0JBQUwsRUFBdEI7O0FBRUEsYUFBTyxJQUFJRCxhQUFKLENBQ0wsS0FBS0UsZ0JBQUwsRUFESyxDQUFQO0FBR0Q7Ozs7RUFwUm9DakgsYzs7ZUFBbEJ1QyxTOzs7QUF1UnJCQSxVQUFVMkUsU0FBVixHQUFzQixXQUF0QjtBQUNBM0UsVUFBVTlCLFlBQVYsR0FBeUJBLFlBQXpCIiwiZmlsZSI6ImdyaWQtbGF5ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgLSAyMDE3IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IHtDb21wb3NpdGVMYXllciwgZXhwZXJpbWVudGFsfSBmcm9tICcuLi8uLi9jb3JlJztcbmNvbnN0IHtCaW5Tb3J0ZXIsIGRlZmF1bHRDb2xvclJhbmdlLCBnZXRRdWFudGl6ZVNjYWxlLCBnZXRMaW5lYXJTY2FsZX0gPSBleHBlcmltZW50YWw7XG5cbmltcG9ydCBHcmlkQ2VsbExheWVyIGZyb20gJy4uL2dyaWQtY2VsbC1sYXllci9ncmlkLWNlbGwtbGF5ZXInO1xuXG5pbXBvcnQge3BvaW50VG9EZW5zaXR5R3JpZERhdGF9IGZyb20gJy4vZ3JpZC1hZ2dyZWdhdG9yJztcblxuZnVuY3Rpb24gbm9wKCkge31cblxuY29uc3QgZGVmYXVsdFByb3BzID0ge1xuXG4gIC8vIGNvbG9yXG4gIGNvbG9yRG9tYWluOiBudWxsLFxuICBjb2xvclJhbmdlOiBkZWZhdWx0Q29sb3JSYW5nZSxcbiAgZ2V0Q29sb3JWYWx1ZTogcG9pbnRzID0+IHBvaW50cy5sZW5ndGgsXG4gIGxvd2VyUGVyY2VudGlsZTogMCxcbiAgdXBwZXJQZXJjZW50aWxlOiAxMDAsXG4gIG9uU2V0Q29sb3JEb21haW46IG5vcCxcblxuICAvLyBlbGV2YXRpb25cbiAgZWxldmF0aW9uRG9tYWluOiBudWxsLFxuICBlbGV2YXRpb25SYW5nZTogWzAsIDEwMDBdLFxuICBnZXRFbGV2YXRpb25WYWx1ZTogcG9pbnRzID0+IHBvaW50cy5sZW5ndGgsXG4gIGVsZXZhdGlvbkxvd2VyUGVyY2VudGlsZTogMCxcbiAgZWxldmF0aW9uVXBwZXJQZXJjZW50aWxlOiAxMDAsXG4gIGVsZXZhdGlvblNjYWxlOiAxLFxuICBvblNldEVsZXZhdGlvbkRvbWFpbjogbm9wLFxuXG4gIC8vIGdyaWRcbiAgY2VsbFNpemU6IDEwMDAsXG4gIGNvdmVyYWdlOiAxLFxuICBnZXRQb3NpdGlvbjogeCA9PiB4LnBvc2l0aW9uLFxuICBleHRydWRlZDogZmFsc2UsXG4gIGZwNjQ6IGZhbHNlLFxuICAvLyBPcHRpb25hbCBzZXR0aW5ncyBmb3IgJ2xpZ2h0aW5nJyBzaGFkZXIgbW9kdWxlXG4gIGxpZ2h0U2V0dGluZ3M6IHtcbiAgICBsaWdodHNQb3NpdGlvbjogWy0xMjIuNDUsIDM3Ljc1LCA4MDAwLCAtMTIyLjAsIDM4LjAwLCA1MDAwXSxcbiAgICBhbWJpZW50UmF0aW86IDAuMDUsXG4gICAgZGlmZnVzZVJhdGlvOiAwLjYsXG4gICAgc3BlY3VsYXJSYXRpbzogMC44LFxuICAgIGxpZ2h0c1N0cmVuZ3RoOiBbMi4wLCAwLjAsIDAuMCwgMC4wXSxcbiAgICBudW1iZXJPZkxpZ2h0czogMlxuICB9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHcmlkTGF5ZXIgZXh0ZW5kcyBDb21wb3NpdGVMYXllciB7XG4gIGluaXRpYWxpemVTdGF0ZSgpIHtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgbGF5ZXJEYXRhOiBbXSxcbiAgICAgIHNvcnRlZENvbG9yQmluczogbnVsbCxcbiAgICAgIHNvcnRlZEVsZXZhdGlvbkJpbnM6IG51bGwsXG4gICAgICBjb2xvclZhbHVlRG9tYWluOiBudWxsLFxuICAgICAgZWxldmF0aW9uVmFsdWVEb21haW46IG51bGwsXG4gICAgICBjb2xvclNjYWxlRnVuYzogbm9wLFxuICAgICAgZWxldmF0aW9uU2NhbGVGdW5jOiBub3AsXG4gICAgICBkaW1lbnNpb25VcGRhdGVyczogdGhpcy5nZXREaW1lbnNpb25VcGRhdGVycygpXG4gICAgfTtcbiAgfVxuXG4gIHVwZGF0ZVN0YXRlKHtvbGRQcm9wcywgcHJvcHMsIGNoYW5nZUZsYWdzfSkge1xuICAgIGNvbnN0IGRpbWVuc2lvbkNoYW5nZXMgPSB0aGlzLmdldERpbWVuc2lvbkNoYW5nZXMob2xkUHJvcHMsIHByb3BzKTtcblxuICAgIGlmIChjaGFuZ2VGbGFncy5kYXRhQ2hhbmdlZCB8fCB0aGlzLm5lZWRzUmVQcm9qZWN0UG9pbnRzKG9sZFByb3BzLCBwcm9wcykpIHtcbiAgICAgIC8vIHByb2plY3QgZGF0YSBpbnRvIGhleGFnb25zLCBhbmQgZ2V0IHNvcnRlZEJpbnNcbiAgICAgIHRoaXMuZ2V0TGF5ZXJEYXRhKCk7XG4gICAgfSBlbHNlIGlmIChkaW1lbnNpb25DaGFuZ2VzKSB7XG4gICAgICBkaW1lbnNpb25DaGFuZ2VzLmZvckVhY2goZiA9PiB0eXBlb2YgZiA9PT0gJ2Z1bmN0aW9uJyAmJiBmLmFwcGx5KHRoaXMpKTtcbiAgICB9XG4gIH1cblxuICBuZWVkc1JlUHJvamVjdFBvaW50cyhvbGRQcm9wcywgcHJvcHMpIHtcbiAgICByZXR1cm4gb2xkUHJvcHMuY2VsbFNpemUgIT09IHByb3BzLmNlbGxTaXplO1xuICB9XG5cbiAgZ2V0RGltZW5zaW9uVXBkYXRlcnMoKSB7XG4gICAgLy8gZGltZW5zaW9uIHVwZGF0ZXJzIGFyZSBzZXF1ZW50aWFsLFxuICAgIC8vIGlmIHRoZSBmaXJzdCBvbmUgbmVlZHMgdG8gYmUgY2FsbGVkLCB0aGUgMm5kIGFuZCAzcmQgb25lIHdpbGwgYXV0b21hdGljYWxseVxuICAgIC8vIGJlIGNhbGxlZC4gZS5nLiBpZiBDb2xvclZhbHVlIG5lZWRzIHRvIGJlIHVwZGF0ZWQsIGdldENvbG9yVmFsdWVEb21haW4gYW5kIGdldENvbG9yU2NhbGVcbiAgICAvLyB3aWxsIGF1dG9tYXRpY2FsbHkgYmUgY2FsbGVkXG4gICAgcmV0dXJuIHtcbiAgICAgIGdldENvbG9yOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBpZDogJ3ZhbHVlJyxcbiAgICAgICAgICB0cmlnZ2VyczogWydnZXRDb2xvclZhbHVlJ10sXG4gICAgICAgICAgdXBkYXRlcjogdGhpcy5nZXRTb3J0ZWRDb2xvckJpbnNcbiAgICAgICAgfSwge1xuICAgICAgICAgIGlkOiAnZG9tYWluJyxcbiAgICAgICAgICB0cmlnZ2VyczogWydsb3dlclBlcmNlbnRpbGUnLCAndXBwZXJQZXJjZW50aWxlJ10sXG4gICAgICAgICAgdXBkYXRlcjogdGhpcy5nZXRDb2xvclZhbHVlRG9tYWluXG4gICAgICAgIH0sIHtcbiAgICAgICAgICBpZDogJ3NjYWxlRnVuYycsXG4gICAgICAgICAgdHJpZ2dlcnM6IFsnY29sb3JEb21haW4nLCAnY29sb3JSYW5nZSddLFxuICAgICAgICAgIHVwZGF0ZXI6IHRoaXMuZ2V0Q29sb3JTY2FsZVxuICAgICAgICB9XG4gICAgICBdLFxuICAgICAgZ2V0RWxldmF0aW9uOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBpZDogJ3ZhbHVlJyxcbiAgICAgICAgICB0cmlnZ2VyczogWydnZXRFbGV2YXRpb25WYWx1ZSddLFxuICAgICAgICAgIHVwZGF0ZXI6IHRoaXMuZ2V0U29ydGVkRWxldmF0aW9uQmluc1xuICAgICAgICB9LCB7XG4gICAgICAgICAgaWQ6ICdkb21haW4nLFxuICAgICAgICAgIHRyaWdnZXJzOiBbJ2VsZXZhdGlvbkxvd2VyUGVyY2VudGlsZScsICdlbGV2YXRpb25VcHBlclBlcmNlbnRpbGUnXSxcbiAgICAgICAgICB1cGRhdGVyOiB0aGlzLmdldEVsZXZhdGlvblZhbHVlRG9tYWluXG4gICAgICAgIH0sIHtcbiAgICAgICAgICBpZDogJ3NjYWxlRnVuYycsXG4gICAgICAgICAgdHJpZ2dlcnM6IFsnZWxldmF0aW9uRG9tYWluJywgJ2VsZXZhdGlvblJhbmdlJ10sXG4gICAgICAgICAgdXBkYXRlcjogdGhpcy5nZXRFbGV2YXRpb25TY2FsZVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfTtcbiAgfVxuXG4gIGdldERpbWVuc2lvbkNoYW5nZXMob2xkUHJvcHMsIHByb3BzKSB7XG4gICAgY29uc3Qge2RpbWVuc2lvblVwZGF0ZXJzfSA9IHRoaXMuc3RhdGU7XG4gICAgY29uc3QgdXBkYXRlcnMgPSBbXTtcblxuICAgIC8vIGdldCBkaW1lbnNpb24gdG8gYmUgdXBkYXRlZFxuICAgIGZvciAoY29uc3QgZGltZW5zaW9uS2V5IGluIGRpbWVuc2lvblVwZGF0ZXJzKSB7XG5cbiAgICAgIC8vIHJldHVybiB0aGUgZmlyc3QgdHJpZ2dlcmVkIHVwZGF0ZXIgZm9yIGVhY2ggZGltZW5zaW9uXG4gICAgICBjb25zdCBuZWVkVXBkYXRlID0gZGltZW5zaW9uVXBkYXRlcnNbZGltZW5zaW9uS2V5XVxuICAgICAgICAuZmluZChpdGVtID0+IGl0ZW0udHJpZ2dlcnMuc29tZSh0ID0+IG9sZFByb3BzW3RdICE9PSBwcm9wc1t0XSkpO1xuXG4gICAgICBpZiAobmVlZFVwZGF0ZSkge1xuICAgICAgICB1cGRhdGVycy5wdXNoKG5lZWRVcGRhdGUudXBkYXRlcik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHVwZGF0ZXJzLmxlbmd0aCA/IHVwZGF0ZXJzIDogbnVsbDtcbiAgfVxuXG4gIGdldFBpY2tpbmdJbmZvKHtpbmZvfSkge1xuICAgIGNvbnN0IHtzb3J0ZWRDb2xvckJpbnMsIHNvcnRlZEVsZXZhdGlvbkJpbnN9ID0gdGhpcy5zdGF0ZTtcblxuICAgIGNvbnN0IGlzUGlja2VkID0gaW5mby5waWNrZWQgJiYgaW5mby5pbmRleCA+IC0xO1xuICAgIGxldCBvYmplY3QgPSBudWxsO1xuXG4gICAgaWYgKGlzUGlja2VkKSB7XG4gICAgICBjb25zdCBjZWxsID0gdGhpcy5zdGF0ZS5sYXllckRhdGFbaW5mby5pbmRleF07XG5cbiAgICAgIGNvbnN0IGNvbG9yVmFsdWUgPSBzb3J0ZWRDb2xvckJpbnMuYmluTWFwW2NlbGwuaW5kZXhdICYmXG4gICAgICAgIHNvcnRlZENvbG9yQmlucy5iaW5NYXBbY2VsbC5pbmRleF0udmFsdWU7XG4gICAgICBjb25zdCBlbGV2YXRpb25WYWx1ZSA9IHNvcnRlZEVsZXZhdGlvbkJpbnMuYmluTWFwW2NlbGwuaW5kZXhdICYmXG4gICAgICAgIHNvcnRlZEVsZXZhdGlvbkJpbnMuYmluTWFwW2NlbGwuaW5kZXhdLnZhbHVlO1xuXG4gICAgICBvYmplY3QgPSBPYmplY3QuYXNzaWduKHtcbiAgICAgICAgY29sb3JWYWx1ZSxcbiAgICAgICAgZWxldmF0aW9uVmFsdWVcbiAgICAgIH0sIGNlbGwpO1xuICAgIH1cblxuICAgIC8vIGFkZCBiaW4gY29sb3JWYWx1ZSBhbmQgZWxldmF0aW9uVmFsdWUgdG8gaW5mb1xuICAgIHJldHVybiBPYmplY3QuYXNzaWduKGluZm8sIHtcbiAgICAgIHBpY2tlZDogQm9vbGVhbihvYmplY3QpLFxuICAgICAgLy8gb3ZlcnJpZGUgb2JqZWN0IHdpdGggcGlja2VkIGNlbGxcbiAgICAgIG9iamVjdFxuICAgIH0pO1xuICB9XG5cbiAgZ2V0VXBkYXRlVHJpZ2dlcnMoKSB7XG4gICAgY29uc3Qge2RpbWVuc2lvblVwZGF0ZXJzfSA9IHRoaXMuc3RhdGU7XG5cbiAgICAvLyBtZXJnZSBhbGwgZGltZW5zaW9uIHRyaWdnZXJzXG4gICAgY29uc3QgdXBkYXRlVHJpZ2dlcnMgPSB7fTtcblxuICAgIGZvciAoY29uc3QgZGltZW5zaW9uS2V5IGluIGRpbWVuc2lvblVwZGF0ZXJzKSB7XG5cbiAgICAgIHVwZGF0ZVRyaWdnZXJzW2RpbWVuc2lvbktleV0gPSB7fTtcblxuICAgICAgZm9yIChjb25zdCBzdGVwIG9mIGRpbWVuc2lvblVwZGF0ZXJzW2RpbWVuc2lvbktleV0pIHtcblxuICAgICAgICBzdGVwLnRyaWdnZXJzLmZvckVhY2gocHJvcCA9PiB7XG4gICAgICAgICAgdXBkYXRlVHJpZ2dlcnNbZGltZW5zaW9uS2V5XVtwcm9wXSA9IHRoaXMucHJvcHNbcHJvcF07XG4gICAgICAgIH0pO1xuXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHVwZGF0ZVRyaWdnZXJzO1xuICB9XG5cbiAgZ2V0TGF5ZXJEYXRhKCkge1xuICAgIGNvbnN0IHtkYXRhLCBjZWxsU2l6ZSwgZ2V0UG9zaXRpb259ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7bGF5ZXJEYXRhfSA9IHBvaW50VG9EZW5zaXR5R3JpZERhdGEoZGF0YSwgY2VsbFNpemUsIGdldFBvc2l0aW9uKTtcblxuICAgIHRoaXMuc2V0U3RhdGUoe2xheWVyRGF0YX0pO1xuICAgIHRoaXMuZ2V0U29ydGVkQmlucygpO1xuICB9XG5cbiAgZ2V0VmFsdWVEb21haW4oKSB7XG4gICAgdGhpcy5nZXRDb2xvclZhbHVlRG9tYWluKCk7XG4gICAgdGhpcy5nZXRFbGV2YXRpb25WYWx1ZURvbWFpbigpO1xuICB9XG5cbiAgZ2V0U29ydGVkQmlucygpIHtcbiAgICB0aGlzLmdldFNvcnRlZENvbG9yQmlucygpO1xuICAgIHRoaXMuZ2V0U29ydGVkRWxldmF0aW9uQmlucygpO1xuICB9XG5cbiAgZ2V0U29ydGVkQ29sb3JCaW5zKCkge1xuICAgIGNvbnN0IHtnZXRDb2xvclZhbHVlfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qgc29ydGVkQ29sb3JCaW5zID0gbmV3IEJpblNvcnRlcih0aGlzLnN0YXRlLmxheWVyRGF0YSB8fCBbXSwgZ2V0Q29sb3JWYWx1ZSk7XG5cbiAgICB0aGlzLnNldFN0YXRlKHtzb3J0ZWRDb2xvckJpbnN9KTtcbiAgICB0aGlzLmdldENvbG9yVmFsdWVEb21haW4oKTtcbiAgfVxuXG4gIGdldFNvcnRlZEVsZXZhdGlvbkJpbnMoKSB7XG4gICAgY29uc3Qge2dldEVsZXZhdGlvblZhbHVlfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qgc29ydGVkRWxldmF0aW9uQmlucyA9IG5ldyBCaW5Tb3J0ZXIodGhpcy5zdGF0ZS5sYXllckRhdGEgfHwgW10sIGdldEVsZXZhdGlvblZhbHVlKTtcbiAgICB0aGlzLnNldFN0YXRlKHtzb3J0ZWRFbGV2YXRpb25CaW5zfSk7XG4gICAgdGhpcy5nZXRFbGV2YXRpb25WYWx1ZURvbWFpbigpO1xuICB9XG5cbiAgZ2V0Q29sb3JWYWx1ZURvbWFpbigpIHtcbiAgICBjb25zdCB7bG93ZXJQZXJjZW50aWxlLCB1cHBlclBlcmNlbnRpbGUsIG9uU2V0Q29sb3JEb21haW59ID0gdGhpcy5wcm9wcztcblxuICAgIHRoaXMuc3RhdGUuY29sb3JWYWx1ZURvbWFpbiA9IHRoaXMuc3RhdGUuc29ydGVkQ29sb3JCaW5zXG4gICAgICAuZ2V0VmFsdWVSYW5nZShbbG93ZXJQZXJjZW50aWxlLCB1cHBlclBlcmNlbnRpbGVdKTtcblxuICAgIGlmICh0eXBlb2Ygb25TZXRDb2xvckRvbWFpbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgb25TZXRDb2xvckRvbWFpbih0aGlzLnN0YXRlLmNvbG9yVmFsdWVEb21haW4pO1xuICAgIH1cblxuICAgIHRoaXMuZ2V0Q29sb3JTY2FsZSgpO1xuICB9XG5cbiAgZ2V0RWxldmF0aW9uVmFsdWVEb21haW4oKSB7XG4gICAgY29uc3Qge2VsZXZhdGlvbkxvd2VyUGVyY2VudGlsZSwgZWxldmF0aW9uVXBwZXJQZXJjZW50aWxlLCBvblNldEVsZXZhdGlvbkRvbWFpbn0gPSB0aGlzLnByb3BzO1xuXG4gICAgdGhpcy5zdGF0ZS5lbGV2YXRpb25WYWx1ZURvbWFpbiA9IHRoaXMuc3RhdGUuc29ydGVkRWxldmF0aW9uQmluc1xuICAgICAgLmdldFZhbHVlUmFuZ2UoW2VsZXZhdGlvbkxvd2VyUGVyY2VudGlsZSwgZWxldmF0aW9uVXBwZXJQZXJjZW50aWxlXSk7XG5cbiAgICBpZiAodHlwZW9mIG9uU2V0RWxldmF0aW9uRG9tYWluID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBvblNldEVsZXZhdGlvbkRvbWFpbih0aGlzLnN0YXRlLmVsZXZhdGlvblZhbHVlRG9tYWluKTtcbiAgICB9XG5cbiAgICB0aGlzLmdldEVsZXZhdGlvblNjYWxlKCk7XG4gIH1cblxuICBnZXRDb2xvclNjYWxlKCkge1xuICAgIGNvbnN0IHtjb2xvclJhbmdlfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3QgY29sb3JEb21haW4gPSB0aGlzLnByb3BzLmNvbG9yRG9tYWluIHx8IHRoaXMuc3RhdGUuY29sb3JWYWx1ZURvbWFpbjtcblxuICAgIHRoaXMuc3RhdGUuY29sb3JTY2FsZUZ1bmMgPSBnZXRRdWFudGl6ZVNjYWxlKGNvbG9yRG9tYWluLCBjb2xvclJhbmdlKTtcbiAgfVxuXG4gIGdldEVsZXZhdGlvblNjYWxlKCkge1xuICAgIGNvbnN0IHtlbGV2YXRpb25SYW5nZX0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IGVsZXZhdGlvbkRvbWFpbiA9IHRoaXMucHJvcHMuZWxldmF0aW9uRG9tYWluIHx8IHRoaXMuc3RhdGUuZWxldmF0aW9uVmFsdWVEb21haW47XG5cbiAgICB0aGlzLnN0YXRlLmVsZXZhdGlvblNjYWxlRnVuYyA9IGdldExpbmVhclNjYWxlKGVsZXZhdGlvbkRvbWFpbiwgZWxldmF0aW9uUmFuZ2UpO1xuICB9XG5cbiAgX29uR2V0U3VibGF5ZXJDb2xvcihjZWxsKSB7XG4gICAgY29uc3Qge3NvcnRlZENvbG9yQmlucywgY29sb3JTY2FsZUZ1bmMsIGNvbG9yVmFsdWVEb21haW59ID0gdGhpcy5zdGF0ZTtcblxuICAgIGNvbnN0IGN2ID0gc29ydGVkQ29sb3JCaW5zLmJpbk1hcFtjZWxsLmluZGV4XSAmJiBzb3J0ZWRDb2xvckJpbnMuYmluTWFwW2NlbGwuaW5kZXhdLnZhbHVlO1xuICAgIGNvbnN0IGNvbG9yRG9tYWluID0gdGhpcy5wcm9wcy5jb2xvckRvbWFpbiB8fCBjb2xvclZhbHVlRG9tYWluO1xuXG4gICAgY29uc3QgaXNDb2xvclZhbHVlSW5Eb21haW4gPSBjdiA+PSBjb2xvckRvbWFpblswXSAmJiBjdiA8PSBjb2xvckRvbWFpbltjb2xvckRvbWFpbi5sZW5ndGggLSAxXTtcblxuICAgIC8vIGlmIGNlbGwgdmFsdWUgaXMgb3V0c2lkZSBkb21haW4sIHNldCBhbHBoYSB0byAwXG4gICAgY29uc3QgY29sb3IgPSBpc0NvbG9yVmFsdWVJbkRvbWFpbiA/IGNvbG9yU2NhbGVGdW5jKGN2KSA6IFswLCAwLCAwLCAwXTtcblxuICAgIC8vIGFkZCBhbHBoYSB0byBjb2xvciBpZiBub3QgZGVmaW5lZCBpbiBjb2xvclJhbmdlXG4gICAgY29sb3JbM10gPSBOdW1iZXIuaXNGaW5pdGUoY29sb3JbM10pID8gY29sb3JbM10gOiAyNTU7XG5cbiAgICByZXR1cm4gY29sb3I7XG4gIH1cblxuICBfb25HZXRTdWJsYXllckVsZXZhdGlvbihjZWxsKSB7XG4gICAgY29uc3Qge3NvcnRlZEVsZXZhdGlvbkJpbnMsIGVsZXZhdGlvblNjYWxlRnVuYywgZWxldmF0aW9uVmFsdWVEb21haW59ID0gdGhpcy5zdGF0ZTtcbiAgICBjb25zdCBldiA9IHNvcnRlZEVsZXZhdGlvbkJpbnMuYmluTWFwW2NlbGwuaW5kZXhdICYmXG4gICAgICBzb3J0ZWRFbGV2YXRpb25CaW5zLmJpbk1hcFtjZWxsLmluZGV4XS52YWx1ZTtcblxuICAgIGNvbnN0IGVsZXZhdGlvbkRvbWFpbiA9IHRoaXMucHJvcHMuZWxldmF0aW9uRG9tYWluIHx8IGVsZXZhdGlvblZhbHVlRG9tYWluO1xuXG4gICAgY29uc3QgaXNFbGV2YXRpb25WYWx1ZUluRG9tYWluID0gZXYgPj0gZWxldmF0aW9uRG9tYWluWzBdICYmXG4gICAgICBldiA8PSBlbGV2YXRpb25Eb21haW5bZWxldmF0aW9uRG9tYWluLmxlbmd0aCAtIDFdO1xuXG4gICAgLy8gaWYgY2VsbCB2YWx1ZSBpcyBvdXRzaWRlIGRvbWFpbiwgc2V0IGVsZXZhdGlvbiB0byAtMVxuICAgIHJldHVybiBpc0VsZXZhdGlvblZhbHVlSW5Eb21haW4gPyBlbGV2YXRpb25TY2FsZUZ1bmMoZXYpIDogLTE7XG4gIH1cblxuICAvLyBmb3Igc3ViY2xhc3NpbmcsIG92ZXJyaWRlIHRoaXMgbWV0aG9kIHRvIHJldHVyblxuICAvLyBjdXN0b21pemVkIHN1YiBsYXllciBwcm9wc1xuICBnZXRTdWJMYXllclByb3BzKCkge1xuICAgIGNvbnN0IHtlbGV2YXRpb25TY2FsZSwgZnA2NCwgZXh0cnVkZWQsIGNlbGxTaXplLCBjb3ZlcmFnZSwgbGlnaHRTZXR0aW5nc30gPSB0aGlzLnByb3BzO1xuXG4gICAgLy8gcmV0dXJuIHByb3BzIHRvIHRoZSBzdWJsYXllciBjb25zdHJ1Y3RvclxuICAgIHJldHVybiBzdXBlci5nZXRTdWJMYXllclByb3BzKHtcbiAgICAgIGlkOiAnZ3JpZC1jZWxsJyxcbiAgICAgIGRhdGE6IHRoaXMuc3RhdGUubGF5ZXJEYXRhLFxuXG4gICAgICBmcDY0LFxuICAgICAgY2VsbFNpemUsXG4gICAgICBjb3ZlcmFnZSxcbiAgICAgIGxpZ2h0U2V0dGluZ3MsXG4gICAgICBlbGV2YXRpb25TY2FsZSxcbiAgICAgIGV4dHJ1ZGVkLFxuXG4gICAgICBnZXRDb2xvcjogdGhpcy5fb25HZXRTdWJsYXllckNvbG9yLmJpbmQodGhpcyksXG4gICAgICBnZXRFbGV2YXRpb246IHRoaXMuX29uR2V0U3VibGF5ZXJFbGV2YXRpb24uYmluZCh0aGlzKSxcbiAgICAgIHVwZGF0ZVRyaWdnZXJzOiB0aGlzLmdldFVwZGF0ZVRyaWdnZXJzKClcbiAgICB9KTtcbiAgfVxuXG4gIC8vIGZvciBzdWJjbGFzc2luZywgb3ZlcnJpZGUgdGhpcyBtZXRob2QgdG8gcmV0dXJuXG4gIC8vIGN1c3RvbWl6ZWQgc3ViIGxheWVyIGNsYXNzXG4gIGdldFN1YkxheWVyQ2xhc3MoKSB7XG4gICAgcmV0dXJuIEdyaWRDZWxsTGF5ZXI7XG4gIH1cblxuICByZW5kZXJMYXllcnMoKSB7XG4gICAgY29uc3QgU3ViTGF5ZXJDbGFzcyA9IHRoaXMuZ2V0U3ViTGF5ZXJDbGFzcygpO1xuXG4gICAgcmV0dXJuIG5ldyBTdWJMYXllckNsYXNzKFxuICAgICAgdGhpcy5nZXRTdWJMYXllclByb3BzKClcbiAgICApO1xuICB9XG59XG5cbkdyaWRMYXllci5sYXllck5hbWUgPSAnR3JpZExheWVyJztcbkdyaWRMYXllci5kZWZhdWx0UHJvcHMgPSBkZWZhdWx0UHJvcHM7XG4iXX0=