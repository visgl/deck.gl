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

import { COORDINATE_SYSTEM, Layer, experimental } from '../../core';
var fp64ify = experimental.fp64ify,
    enable64bitSupport = experimental.enable64bitSupport;

import { GL, Model, CubeGeometry } from 'luma.gl';

import vs from './grid-cell-layer-vertex.glsl';
import vs64 from './grid-cell-layer-vertex-64.glsl';
import fs from './grid-cell-layer-fragment.glsl';

var DEFAULT_COLOR = [255, 0, 255, 255];

var defaultProps = {
  cellSize: 1000,
  coverage: 1,
  elevationScale: 1,
  extruded: true,
  fp64: false,

  getPosition: function getPosition(x) {
    return x.position;
  },
  getElevation: function getElevation(x) {
    return x.elevation;
  },
  getColor: function getColor(x) {
    return x.color;
  },

  lightSettings: {
    lightsPosition: [-122.45, 37.65, 8000, -122.45, 37.20, 1000],
    ambientRatio: 0.4,
    diffuseRatio: 0.6,
    specularRatio: 0.8,
    lightsStrength: [1.0, 0.0, 0.8, 0.0],
    numberOfLights: 2
  }
};

var GridCellLayer = function (_Layer) {
  _inherits(GridCellLayer, _Layer);

  function GridCellLayer() {
    _classCallCheck(this, GridCellLayer);

    return _possibleConstructorReturn(this, (GridCellLayer.__proto__ || Object.getPrototypeOf(GridCellLayer)).apply(this, arguments));
  }

  _createClass(GridCellLayer, [{
    key: 'getShaders',

    /**
     * A generic GridLayer that takes latitude longitude delta of cells as a uniform
     * and the min lat lng of cells. grid can be 3d when pass in a height
     * and set enable3d to true
     *
     * @param {array} props.data -
     * @param {boolean} props.extruded - enable grid elevation
     * @param {number} props.cellSize - grid cell size in meters
     * @param {function} props.getPosition - position accessor, returned as [minLng, minLat]
     * @param {function} props.getElevation - elevation accessor
     * @param {function} props.getColor - color accessor, returned as [r, g, b, a]
     */

    value: function getShaders() {
      var shaderCache = this.context.shaderCache;

      return enable64bitSupport(this.props) ? { vs: vs64, fs: fs, modules: ['project64', 'lighting', 'picking'], shaderCache: shaderCache } : { vs: vs, fs: fs, modules: ['lighting', 'picking'], shaderCache: shaderCache }; // 'project' module added by default.
    }
  }, {
    key: 'initializeState',
    value: function initializeState() {
      var gl = this.context.gl;

      this.setState({ model: this._getModel(gl) });

      var attributeManager = this.state.attributeManager;
      /* eslint-disable max-len */

      attributeManager.addInstanced({
        instancePositions: { size: 4, accessor: ['getPosition', 'getElevation'], update: this.calculateInstancePositions },
        instanceColors: { size: 4, type: GL.UNSIGNED_BYTE, accessor: 'getColor', update: this.calculateInstanceColors }
      });
      /* eslint-enable max-len */
    }
  }, {
    key: 'updateAttribute',
    value: function updateAttribute(_ref) {
      var props = _ref.props,
          oldProps = _ref.oldProps,
          changeFlags = _ref.changeFlags;

      if (props.fp64 !== oldProps.fp64) {
        var attributeManager = this.state.attributeManager;

        attributeManager.invalidateAll();

        if (props.fp64 && props.coordinateSystem === COORDINATE_SYSTEM.LNGLAT) {
          attributeManager.addInstanced({
            instancePositions64xyLow: {
              size: 2,
              accessor: 'getPosition',
              update: this.calculateInstancePositions64xyLow
            }
          });
        } else {
          attributeManager.remove(['instancePositions64xyLow']);
        }
      }
    }
  }, {
    key: 'updateState',
    value: function updateState(_ref2) {
      var props = _ref2.props,
          oldProps = _ref2.oldProps,
          changeFlags = _ref2.changeFlags;

      _get(GridCellLayer.prototype.__proto__ || Object.getPrototypeOf(GridCellLayer.prototype), 'updateState', this).call(this, { props: props, oldProps: oldProps, changeFlags: changeFlags });
      // Re-generate model if geometry changed
      if (props.fp64 !== oldProps.fp64) {
        var gl = this.context.gl;

        this.setState({ model: this._getModel(gl) });
      }
      this.updateAttribute({ props: props, oldProps: oldProps, changeFlags: changeFlags });
      this.updateUniforms();
    }
  }, {
    key: '_getModel',
    value: function _getModel(gl) {
      return new Model(gl, Object.assign({}, this.getShaders(), {
        id: this.props.id,
        geometry: new CubeGeometry(),
        isInstanced: true,
        shaderCache: this.context.shaderCache
      }));
    }
  }, {
    key: 'updateUniforms',
    value: function updateUniforms() {
      var _props = this.props,
          opacity = _props.opacity,
          extruded = _props.extruded,
          elevationScale = _props.elevationScale,
          coverage = _props.coverage,
          lightSettings = _props.lightSettings;
      var model = this.state.model;


      model.setUniforms(Object.assign({}, {
        extruded: extruded,
        elevationScale: elevationScale,
        opacity: opacity,
        coverage: coverage
      }, lightSettings));
    }
  }, {
    key: 'draw',
    value: function draw(_ref3) {
      var uniforms = _ref3.uniforms;
      var viewport = this.context.viewport;
      // TODO - this should be a standard uniform in project package

      var _viewport$getDistance = viewport.getDistanceScales(),
          pixelsPerMeter = _viewport$getDistance.pixelsPerMeter;

      // cellSize needs to be updated on every draw call
      // because it is based on viewport


      _get(GridCellLayer.prototype.__proto__ || Object.getPrototypeOf(GridCellLayer.prototype), 'draw', this).call(this, { uniforms: Object.assign({
          cellSize: this.props.cellSize * pixelsPerMeter[0]
        }, uniforms) });
    }
  }, {
    key: 'calculateInstancePositions',
    value: function calculateInstancePositions(attribute) {
      var _props2 = this.props,
          data = _props2.data,
          getPosition = _props2.getPosition,
          getElevation = _props2.getElevation;
      var value = attribute.value,
          size = attribute.size;

      var i = 0;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var object = _step.value;

          var position = getPosition(object);
          var elevation = getElevation(object) || 0;
          value[i + 0] = position[0];
          value[i + 1] = position[1];
          value[i + 2] = 0;
          value[i + 3] = elevation;
          i += size;
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
    }
  }, {
    key: 'calculateInstancePositions64xyLow',
    value: function calculateInstancePositions64xyLow(attribute) {
      var _props3 = this.props,
          data = _props3.data,
          getPosition = _props3.getPosition;
      var value = attribute.value;

      var i = 0;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = data[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var point = _step2.value;

          var position = getPosition(point);
          value[i++] = fp64ify(position[0])[1];
          value[i++] = fp64ify(position[1])[1];
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }
    }
  }, {
    key: 'calculateInstanceColors',
    value: function calculateInstanceColors(attribute) {
      var _props4 = this.props,
          data = _props4.data,
          getColor = _props4.getColor;
      var value = attribute.value,
          size = attribute.size;

      var i = 0;
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = data[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var object = _step3.value;

          var color = getColor(object) || DEFAULT_COLOR;
          value[i + 0] = color[0];
          value[i + 1] = color[1];
          value[i + 2] = color[2];
          value[i + 3] = Number.isFinite(color[3]) ? color[3] : DEFAULT_COLOR[3];
          i += size;
        }
      } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }
        } finally {
          if (_didIteratorError3) {
            throw _iteratorError3;
          }
        }
      }
    }
  }]);

  return GridCellLayer;
}(Layer);

export default GridCellLayer;


GridCellLayer.layerName = 'GridCellLayer';
GridCellLayer.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlLWxheWVycy9ncmlkLWNlbGwtbGF5ZXIvZ3JpZC1jZWxsLWxheWVyLmpzIl0sIm5hbWVzIjpbIkNPT1JESU5BVEVfU1lTVEVNIiwiTGF5ZXIiLCJleHBlcmltZW50YWwiLCJmcDY0aWZ5IiwiZW5hYmxlNjRiaXRTdXBwb3J0IiwiR0wiLCJNb2RlbCIsIkN1YmVHZW9tZXRyeSIsInZzIiwidnM2NCIsImZzIiwiREVGQVVMVF9DT0xPUiIsImRlZmF1bHRQcm9wcyIsImNlbGxTaXplIiwiY292ZXJhZ2UiLCJlbGV2YXRpb25TY2FsZSIsImV4dHJ1ZGVkIiwiZnA2NCIsImdldFBvc2l0aW9uIiwieCIsInBvc2l0aW9uIiwiZ2V0RWxldmF0aW9uIiwiZWxldmF0aW9uIiwiZ2V0Q29sb3IiLCJjb2xvciIsImxpZ2h0U2V0dGluZ3MiLCJsaWdodHNQb3NpdGlvbiIsImFtYmllbnRSYXRpbyIsImRpZmZ1c2VSYXRpbyIsInNwZWN1bGFyUmF0aW8iLCJsaWdodHNTdHJlbmd0aCIsIm51bWJlck9mTGlnaHRzIiwiR3JpZENlbGxMYXllciIsInNoYWRlckNhY2hlIiwiY29udGV4dCIsInByb3BzIiwibW9kdWxlcyIsImdsIiwic2V0U3RhdGUiLCJtb2RlbCIsIl9nZXRNb2RlbCIsImF0dHJpYnV0ZU1hbmFnZXIiLCJzdGF0ZSIsImFkZEluc3RhbmNlZCIsImluc3RhbmNlUG9zaXRpb25zIiwic2l6ZSIsImFjY2Vzc29yIiwidXBkYXRlIiwiY2FsY3VsYXRlSW5zdGFuY2VQb3NpdGlvbnMiLCJpbnN0YW5jZUNvbG9ycyIsInR5cGUiLCJVTlNJR05FRF9CWVRFIiwiY2FsY3VsYXRlSW5zdGFuY2VDb2xvcnMiLCJvbGRQcm9wcyIsImNoYW5nZUZsYWdzIiwiaW52YWxpZGF0ZUFsbCIsImNvb3JkaW5hdGVTeXN0ZW0iLCJMTkdMQVQiLCJpbnN0YW5jZVBvc2l0aW9uczY0eHlMb3ciLCJjYWxjdWxhdGVJbnN0YW5jZVBvc2l0aW9uczY0eHlMb3ciLCJyZW1vdmUiLCJ1cGRhdGVBdHRyaWJ1dGUiLCJ1cGRhdGVVbmlmb3JtcyIsIk9iamVjdCIsImFzc2lnbiIsImdldFNoYWRlcnMiLCJpZCIsImdlb21ldHJ5IiwiaXNJbnN0YW5jZWQiLCJvcGFjaXR5Iiwic2V0VW5pZm9ybXMiLCJ1bmlmb3JtcyIsInZpZXdwb3J0IiwiZ2V0RGlzdGFuY2VTY2FsZXMiLCJwaXhlbHNQZXJNZXRlciIsImF0dHJpYnV0ZSIsImRhdGEiLCJ2YWx1ZSIsImkiLCJvYmplY3QiLCJwb2ludCIsIk51bWJlciIsImlzRmluaXRlIiwibGF5ZXJOYW1lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBUUEsaUJBQVIsRUFBMkJDLEtBQTNCLEVBQWtDQyxZQUFsQyxRQUFxRCxZQUFyRDtJQUNPQyxPLEdBQStCRCxZLENBQS9CQyxPO0lBQVNDLGtCLEdBQXNCRixZLENBQXRCRSxrQjs7QUFDaEIsU0FBUUMsRUFBUixFQUFZQyxLQUFaLEVBQW1CQyxZQUFuQixRQUFzQyxTQUF0Qzs7QUFFQSxPQUFPQyxFQUFQLE1BQWUsK0JBQWY7QUFDQSxPQUFPQyxJQUFQLE1BQWlCLGtDQUFqQjtBQUNBLE9BQU9DLEVBQVAsTUFBZSxpQ0FBZjs7QUFFQSxJQUFNQyxnQkFBZ0IsQ0FBQyxHQUFELEVBQU0sQ0FBTixFQUFTLEdBQVQsRUFBYyxHQUFkLENBQXRCOztBQUVBLElBQU1DLGVBQWU7QUFDbkJDLFlBQVUsSUFEUztBQUVuQkMsWUFBVSxDQUZTO0FBR25CQyxrQkFBZ0IsQ0FIRztBQUluQkMsWUFBVSxJQUpTO0FBS25CQyxRQUFNLEtBTGE7O0FBT25CQyxlQUFhO0FBQUEsV0FBS0MsRUFBRUMsUUFBUDtBQUFBLEdBUE07QUFRbkJDLGdCQUFjO0FBQUEsV0FBS0YsRUFBRUcsU0FBUDtBQUFBLEdBUks7QUFTbkJD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LENBQWdCMUQsTUFBTSxDQUFOLENBQWhCLElBQTRCQSxNQUFNLENBQU4sQ0FBNUIsR0FBdUNiLGNBQWMsQ0FBZCxDQUF0RDtBQUNBbUUsZUFBS2pDLElBQUw7QUFDRDtBQVhnQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBWWxDOzs7O0VBM0l3QzVDLEs7O2VBQXRCK0IsYTs7O0FBOElyQkEsY0FBY21ELFNBQWQsR0FBMEIsZUFBMUI7QUFDQW5ELGNBQWNwQixZQUFkLEdBQTZCQSxZQUE3QiIsImZpbGUiOiJncmlkLWNlbGwtbGF5ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgLSAyMDE3IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IHtDT09SRElOQVRFX1NZU1RFTSwgTGF5ZXIsIGV4cGVyaW1lbnRhbH0gZnJvbSAnLi4vLi4vY29yZSc7XG5jb25zdCB7ZnA2NGlmeSwgZW5hYmxlNjRiaXRTdXBwb3J0fSA9IGV4cGVyaW1lbnRhbDtcbmltcG9ydCB7R0wsIE1vZGVsLCBDdWJlR2VvbWV0cnl9IGZyb20gJ2x1bWEuZ2wnO1xuXG5pbXBvcnQgdnMgZnJvbSAnLi9ncmlkLWNlbGwtbGF5ZXItdmVydGV4Lmdsc2wnO1xuaW1wb3J0IHZzNjQgZnJvbSAnLi9ncmlkLWNlbGwtbGF5ZXItdmVydGV4LTY0Lmdsc2wnO1xuaW1wb3J0IGZzIGZyb20gJy4vZ3JpZC1jZWxsLWxheWVyLWZyYWdtZW50Lmdsc2wnO1xuXG5jb25zdCBERUZBVUxUX0NPTE9SID0gWzI1NSwgMCwgMjU1LCAyNTVdO1xuXG5jb25zdCBkZWZhdWx0UHJvcHMgPSB7XG4gIGNlbGxTaXplOiAxMDAwLFxuICBjb3ZlcmFnZTogMSxcbiAgZWxldmF0aW9uU2NhbGU6IDEsXG4gIGV4dHJ1ZGVkOiB0cnVlLFxuICBmcDY0OiBmYWxzZSxcblxuICBnZXRQb3NpdGlvbjogeCA9PiB4LnBvc2l0aW9uLFxuICBnZXRFbGV2YXRpb246IHggPT4geC5lbGV2YXRpb24sXG4gIGdldENvbG9yOiB4ID0+IHguY29sb3IsXG5cbiAgbGlnaHRTZXR0aW5nczoge1xuICAgIGxpZ2h0c1Bvc2l0aW9uOiBbLTEyMi40NSwgMzcuNjUsIDgwMDAsIC0xMjIuNDUsIDM3LjIwLCAxMDAwXSxcbiAgICBhbWJpZW50UmF0aW86IDAuNCxcbiAgICBkaWZmdXNlUmF0aW86IDAuNixcbiAgICBzcGVjdWxhclJhdGlvOiAwLjgsXG4gICAgbGlnaHRzU3RyZW5ndGg6IFsxLjAsIDAuMCwgMC44LCAwLjBdLFxuICAgIG51bWJlck9mTGlnaHRzOiAyXG4gIH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEdyaWRDZWxsTGF5ZXIgZXh0ZW5kcyBMYXllciB7XG4gIC8qKlxuICAgKiBBIGdlbmVyaWMgR3JpZExheWVyIHRoYXQgdGFrZXMgbGF0aXR1ZGUgbG9uZ2l0dWRlIGRlbHRhIG9mIGNlbGxzIGFzIGEgdW5pZm9ybVxuICAgKiBhbmQgdGhlIG1pbiBsYXQgbG5nIG9mIGNlbGxzLiBncmlkIGNhbiBiZSAzZCB3aGVuIHBhc3MgaW4gYSBoZWlnaHRcbiAgICogYW5kIHNldCBlbmFibGUzZCB0byB0cnVlXG4gICAqXG4gICAqIEBwYXJhbSB7YXJyYXl9IHByb3BzLmRhdGEgLVxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IHByb3BzLmV4dHJ1ZGVkIC0gZW5hYmxlIGdyaWQgZWxldmF0aW9uXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBwcm9wcy5jZWxsU2l6ZSAtIGdyaWQgY2VsbCBzaXplIGluIG1ldGVyc1xuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBwcm9wcy5nZXRQb3NpdGlvbiAtIHBvc2l0aW9uIGFjY2Vzc29yLCByZXR1cm5lZCBhcyBbbWluTG5nLCBtaW5MYXRdXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IHByb3BzLmdldEVsZXZhdGlvbiAtIGVsZXZhdGlvbiBhY2Nlc3NvclxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBwcm9wcy5nZXRDb2xvciAtIGNvbG9yIGFjY2Vzc29yLCByZXR1cm5lZCBhcyBbciwgZywgYiwgYV1cbiAgICovXG5cbiAgZ2V0U2hhZGVycygpIHtcbiAgICBjb25zdCB7c2hhZGVyQ2FjaGV9ID0gdGhpcy5jb250ZXh0O1xuICAgIHJldHVybiBlbmFibGU2NGJpdFN1cHBvcnQodGhpcy5wcm9wcykgP1xuICAgICAge3ZzOiB2czY0LCBmcywgbW9kdWxlczogWydwcm9qZWN0NjQnLCAnbGlnaHRpbmcnLCAncGlja2luZyddLCBzaGFkZXJDYWNoZX0gOlxuICAgICAge3ZzLCBmcywgbW9kdWxlczogWydsaWdodGluZycsICdwaWNraW5nJ10sIHNoYWRlckNhY2hlfTsgLy8gJ3Byb2plY3QnIG1vZHVsZSBhZGRlZCBieSBkZWZhdWx0LlxuICB9XG5cbiAgaW5pdGlhbGl6ZVN0YXRlKCkge1xuICAgIGNvbnN0IHtnbH0gPSB0aGlzLmNvbnRleHQ7XG4gICAgdGhpcy5zZXRTdGF0ZSh7bW9kZWw6IHRoaXMuX2dldE1vZGVsKGdsKX0pO1xuXG4gICAgY29uc3Qge2F0dHJpYnV0ZU1hbmFnZXJ9ID0gdGhpcy5zdGF0ZTtcbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBtYXgtbGVuICovXG4gICAgYXR0cmlidXRlTWFuYWdlci5hZGRJbnN0YW5jZWQoe1xuICAgICAgaW5zdGFuY2VQb3NpdGlvbnM6IHtzaXplOiA0LCBhY2Nlc3NvcjogWydnZXRQb3NpdGlvbicsICdnZXRFbGV2YXRpb24nXSwgdXBkYXRlOiB0aGlzLmNhbGN1bGF0ZUluc3RhbmNlUG9zaXRpb25zfSxcbiAgICAgIGluc3RhbmNlQ29sb3JzOiB7c2l6ZTogNCwgdHlwZTogR0wuVU5TSUdORURfQllURSwgYWNjZXNzb3I6ICdnZXRDb2xvcicsIHVwZGF0ZTogdGhpcy5jYWxjdWxhdGVJbnN0YW5jZUNvbG9yc31cbiAgICB9KTtcbiAgICAvKiBlc2xpbnQtZW5hYmxlIG1heC1sZW4gKi9cbiAgfVxuXG4gIHVwZGF0ZUF0dHJpYnV0ZSh7cHJvcHMsIG9sZFByb3BzLCBjaGFuZ2VGbGFnc30pIHtcbiAgICBpZiAocHJvcHMuZnA2NCAhPT0gb2xkUHJvcHMuZnA2NCkge1xuICAgICAgY29uc3Qge2F0dHJpYnV0ZU1hbmFnZXJ9ID0gdGhpcy5zdGF0ZTtcbiAgICAgIGF0dHJpYnV0ZU1hbmFnZXIuaW52YWxpZGF0ZUFsbCgpO1xuXG4gICAgICBpZiAocHJvcHMuZnA2NCAmJiBwcm9wcy5jb29yZGluYXRlU3lzdGVtID09PSBDT09SRElOQVRFX1NZU1RFTS5MTkdMQVQpIHtcbiAgICAgICAgYXR0cmlidXRlTWFuYWdlci5hZGRJbnN0YW5jZWQoe1xuICAgICAgICAgIGluc3RhbmNlUG9zaXRpb25zNjR4eUxvdzoge1xuICAgICAgICAgICAgc2l6ZTogMixcbiAgICAgICAgICAgIGFjY2Vzc29yOiAnZ2V0UG9zaXRpb24nLFxuICAgICAgICAgICAgdXBkYXRlOiB0aGlzLmNhbGN1bGF0ZUluc3RhbmNlUG9zaXRpb25zNjR4eUxvd1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhdHRyaWJ1dGVNYW5hZ2VyLnJlbW92ZShbXG4gICAgICAgICAgJ2luc3RhbmNlUG9zaXRpb25zNjR4eUxvdydcbiAgICAgICAgXSk7XG4gICAgICB9XG5cbiAgICB9XG4gIH1cblxuICB1cGRhdGVTdGF0ZSh7cHJvcHMsIG9sZFByb3BzLCBjaGFuZ2VGbGFnc30pIHtcbiAgICBzdXBlci51cGRhdGVTdGF0ZSh7cHJvcHMsIG9sZFByb3BzLCBjaGFuZ2VGbGFnc30pO1xuICAgIC8vIFJlLWdlbmVyYXRlIG1vZGVsIGlmIGdlb21ldHJ5IGNoYW5nZWRcbiAgICBpZiAocHJvcHMuZnA2NCAhPT0gb2xkUHJvcHMuZnA2NCkge1xuICAgICAgY29uc3Qge2dsfSA9IHRoaXMuY29udGV4dDtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe21vZGVsOiB0aGlzLl9nZXRNb2RlbChnbCl9KTtcbiAgICB9XG4gICAgdGhpcy51cGRhdGVBdHRyaWJ1dGUoe3Byb3BzLCBvbGRQcm9wcywgY2hhbmdlRmxhZ3N9KTtcbiAgICB0aGlzLnVwZGF0ZVVuaWZvcm1zKCk7XG4gIH1cblxuICBfZ2V0TW9kZWwoZ2wpIHtcbiAgICByZXR1cm4gbmV3IE1vZGVsKGdsLCBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmdldFNoYWRlcnMoKSwge1xuICAgICAgaWQ6IHRoaXMucHJvcHMuaWQsXG4gICAgICBnZW9tZXRyeTogbmV3IEN1YmVHZW9tZXRyeSgpLFxuICAgICAgaXNJbnN0YW5jZWQ6IHRydWUsXG4gICAgICBzaGFkZXJDYWNoZTogdGhpcy5jb250ZXh0LnNoYWRlckNhY2hlXG4gICAgfSkpO1xuICB9XG5cbiAgdXBkYXRlVW5pZm9ybXMoKSB7XG4gICAgY29uc3Qge29wYWNpdHksIGV4dHJ1ZGVkLCBlbGV2YXRpb25TY2FsZSwgY292ZXJhZ2UsIGxpZ2h0U2V0dGluZ3N9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7bW9kZWx9ID0gdGhpcy5zdGF0ZTtcblxuICAgIG1vZGVsLnNldFVuaWZvcm1zKE9iamVjdC5hc3NpZ24oe30sIHtcbiAgICAgIGV4dHJ1ZGVkLFxuICAgICAgZWxldmF0aW9uU2NhbGUsXG4gICAgICBvcGFjaXR5LFxuICAgICAgY292ZXJhZ2VcbiAgICB9LFxuICAgIGxpZ2h0U2V0dGluZ3MpKTtcbiAgfVxuXG4gIGRyYXcoe3VuaWZvcm1zfSkge1xuICAgIGNvbnN0IHt2aWV3cG9ydH0gPSB0aGlzLmNvbnRleHQ7XG4gICAgLy8gVE9ETyAtIHRoaXMgc2hvdWxkIGJlIGEgc3RhbmRhcmQgdW5pZm9ybSBpbiBwcm9qZWN0IHBhY2thZ2VcbiAgICBjb25zdCB7cGl4ZWxzUGVyTWV0ZXJ9ID0gdmlld3BvcnQuZ2V0RGlzdGFuY2VTY2FsZXMoKTtcblxuICAgIC8vIGNlbGxTaXplIG5lZWRzIHRvIGJlIHVwZGF0ZWQgb24gZXZlcnkgZHJhdyBjYWxsXG4gICAgLy8gYmVjYXVzZSBpdCBpcyBiYXNlZCBvbiB2aWV3cG9ydFxuICAgIHN1cGVyLmRyYXcoe3VuaWZvcm1zOiBPYmplY3QuYXNzaWduKHtcbiAgICAgIGNlbGxTaXplOiB0aGlzLnByb3BzLmNlbGxTaXplICogcGl4ZWxzUGVyTWV0ZXJbMF1cbiAgICB9LCB1bmlmb3Jtcyl9KTtcbiAgfVxuXG4gIGNhbGN1bGF0ZUluc3RhbmNlUG9zaXRpb25zKGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHtkYXRhLCBnZXRQb3NpdGlvbiwgZ2V0RWxldmF0aW9ufSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge3ZhbHVlLCBzaXplfSA9IGF0dHJpYnV0ZTtcbiAgICBsZXQgaSA9IDA7XG4gICAgZm9yIChjb25zdCBvYmplY3Qgb2YgZGF0YSkge1xuICAgICAgY29uc3QgcG9zaXRpb24gPSBnZXRQb3NpdGlvbihvYmplY3QpO1xuICAgICAgY29uc3QgZWxldmF0aW9uID0gZ2V0RWxldmF0aW9uKG9iamVjdCkgfHwgMDtcbiAgICAgIHZhbHVlW2kgKyAwXSA9IHBvc2l0aW9uWzBdO1xuICAgICAgdmFsdWVbaSArIDFdID0gcG9zaXRpb25bMV07XG4gICAgICB2YWx1ZVtpICsgMl0gPSAwO1xuICAgICAgdmFsdWVbaSArIDNdID0gZWxldmF0aW9uO1xuICAgICAgaSArPSBzaXplO1xuICAgIH1cbiAgfVxuXG4gIGNhbGN1bGF0ZUluc3RhbmNlUG9zaXRpb25zNjR4eUxvdyhhdHRyaWJ1dGUpIHtcbiAgICBjb25zdCB7ZGF0YSwgZ2V0UG9zaXRpb259ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7dmFsdWV9ID0gYXR0cmlidXRlO1xuICAgIGxldCBpID0gMDtcbiAgICBmb3IgKGNvbnN0IHBvaW50IG9mIGRhdGEpIHtcbiAgICAgIGNvbnN0IHBvc2l0aW9uID0gZ2V0UG9zaXRpb24ocG9pbnQpO1xuICAgICAgdmFsdWVbaSsrXSA9IGZwNjRpZnkocG9zaXRpb25bMF0pWzFdO1xuICAgICAgdmFsdWVbaSsrXSA9IGZwNjRpZnkocG9zaXRpb25bMV0pWzFdO1xuICAgIH1cbiAgfVxuXG4gIGNhbGN1bGF0ZUluc3RhbmNlQ29sb3JzKGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHtkYXRhLCBnZXRDb2xvcn0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHt2YWx1ZSwgc2l6ZX0gPSBhdHRyaWJ1dGU7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAoY29uc3Qgb2JqZWN0IG9mIGRhdGEpIHtcbiAgICAgIGNvbnN0IGNvbG9yID0gZ2V0Q29sb3Iob2JqZWN0KSB8fCBERUZBVUxUX0NPTE9SO1xuICAgICAgdmFsdWVbaSArIDBdID0gY29sb3JbMF07XG4gICAgICB2YWx1ZVtpICsgMV0gPSBjb2xvclsxXTtcbiAgICAgIHZhbHVlW2kgKyAyXSA9IGNvbG9yWzJdO1xuICAgICAgdmFsdWVbaSArIDNdID0gTnVtYmVyLmlzRmluaXRlKGNvbG9yWzNdKSA/IGNvbG9yWzNdIDogREVGQVVMVF9DT0xPUlszXTtcbiAgICAgIGkgKz0gc2l6ZTtcbiAgICB9XG4gIH1cbn1cblxuR3JpZENlbGxMYXllci5sYXllck5hbWUgPSAnR3JpZENlbGxMYXllcic7XG5HcmlkQ2VsbExheWVyLmRlZmF1bHRQcm9wcyA9IGRlZmF1bHRQcm9wcztcbiJdfQ==