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

import { GL, Model, Geometry } from 'luma.gl';

import vs from './scatterplot-layer-vertex.glsl';
import vs64 from './scatterplot-layer-vertex-64.glsl';
import fs from './scatterplot-layer-fragment.glsl';

var DEFAULT_COLOR = [0, 0, 0, 255];

var defaultProps = {
  radiusScale: 1,
  radiusMinPixels: 0, //  min point radius in pixels
  radiusMaxPixels: Number.MAX_SAFE_INTEGER, // max point radius in pixels
  strokeWidth: 1,
  outline: false,
  fp64: false,

  getPosition: function getPosition(x) {
    return x.position;
  },
  getRadius: function getRadius(x) {
    return x.radius || 1;
  },
  getColor: function getColor(x) {
    return x.color || DEFAULT_COLOR;
  }
};

var ScatterplotLayer = function (_Layer) {
  _inherits(ScatterplotLayer, _Layer);

  function ScatterplotLayer() {
    _classCallCheck(this, ScatterplotLayer);

    return _possibleConstructorReturn(this, (ScatterplotLayer.__proto__ || Object.getPrototypeOf(ScatterplotLayer)).apply(this, arguments));
  }

  _createClass(ScatterplotLayer, [{
    key: 'getShaders',
    value: function getShaders(id) {
      var shaderCache = this.context.shaderCache;

      return enable64bitSupport(this.props) ? { vs: vs64, fs: fs, modules: ['project64', 'picking'], shaderCache: shaderCache } : { vs: vs, fs: fs, modules: ['picking'], shaderCache: shaderCache }; // 'project' module added by default.
    }
  }, {
    key: 'initializeState',
    value: function initializeState() {
      var gl = this.context.gl;

      this.setState({ model: this._getModel(gl) });

      /* eslint-disable max-len */
      /* deprecated props check */
      this._checkRemovedProp('radius', 'radiusScale');
      this._checkRemovedProp('drawOutline', 'outline');

      this.state.attributeManager.addInstanced({
        instancePositions: { size: 3, accessor: 'getPosition', update: this.calculateInstancePositions },
        instanceRadius: { size: 1, accessor: 'getRadius', defaultValue: 1, update: this.calculateInstanceRadius },
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

      _get(ScatterplotLayer.prototype.__proto__ || Object.getPrototypeOf(ScatterplotLayer.prototype), 'updateState', this).call(this, { props: props, oldProps: oldProps, changeFlags: changeFlags });
      if (props.fp64 !== oldProps.fp64) {
        var gl = this.context.gl;

        this.setState({ model: this._getModel(gl) });
      }
      this.updateAttribute({ props: props, oldProps: oldProps, changeFlags: changeFlags });
    }
  }, {
    key: 'draw',
    value: function draw(_ref3) {
      var uniforms = _ref3.uniforms;
      var _props = this.props,
          radiusScale = _props.radiusScale,
          radiusMinPixels = _props.radiusMinPixels,
          radiusMaxPixels = _props.radiusMaxPixels,
          outline = _props.outline,
          strokeWidth = _props.strokeWidth;

      this.state.model.render(Object.assign({}, uniforms, {
        outline: outline ? 1 : 0,
        strokeWidth: strokeWidth,
        radiusScale: radiusScale,
        radiusMinPixels: radiusMinPixels,
        radiusMaxPixels: radiusMaxPixels
      }));
    }
  }, {
    key: '_getModel',
    value: function _getModel(gl) {
      // a square that minimally cover the unit circle
      var positions = [-1, -1, 0, -1, 1, 0, 1, 1, 0, 1, -1, 0];

      return new Model(gl, Object.assign(this.getShaders(), {
        id: this.props.id,
        geometry: new Geometry({
          drawMode: GL.TRIANGLE_FAN,
          attributes: {
            positions: new Float32Array(positions)
          }
        }),
        isInstanced: true,
        shaderCache: this.context.shaderCache
      }));
    }
  }, {
    key: 'calculateInstancePositions',
    value: function calculateInstancePositions(attribute) {
      var _props2 = this.props,
          data = _props2.data,
          getPosition = _props2.getPosition;
      var value = attribute.value;

      var i = 0;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var point = _step.value;

          var position = getPosition(point);
          value[i++] = position[0];
          value[i++] = position[1];
          value[i++] = position[2] || 0;
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
    key: 'calculateInstanceRadius',
    value: function calculateInstanceRadius(attribute) {
      var _props4 = this.props,
          data = _props4.data,
          getRadius = _props4.getRadius;
      var value = attribute.value;

      var i = 0;
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = data[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var point = _step3.value;

          var radius = getRadius(point);
          value[i++] = isNaN(radius) ? 1 : radius;
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
  }, {
    key: 'calculateInstanceColors',
    value: function calculateInstanceColors(attribute) {
      var _props5 = this.props,
          data = _props5.data,
          getColor = _props5.getColor;
      var value = attribute.value;

      var i = 0;
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = data[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var point = _step4.value;

          var color = getColor(point) || DEFAULT_COLOR;
          value[i++] = color[0];
          value[i++] = color[1];
          value[i++] = color[2];
          value[i++] = isNaN(color[3]) ? 255 : color[3];
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }
    }
  }]);

  return ScatterplotLayer;
}(Layer);

export default ScatterplotLayer;


ScatterplotLayer.layerName = 'ScatterplotLayer';
ScatterplotLayer.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlLWxheWVycy9zY2F0dGVycGxvdC1sYXllci9zY2F0dGVycGxvdC1sYXllci5qcyJdLCJuYW1lcyI6WyJDT09SRElOQVRFX1NZU1RFTSIsIkxheWVyIiwiZXhwZXJpbWVudGFsIiwiZnA2NGlmeSIsImVuYWJsZTY0Yml0U3VwcG9ydCIsIkdMIiwiTW9kZWwiLCJHZW9tZXRyeSIsInZzIiwidnM2NCIsImZzIiwiREVGQVVMVF9DT0xPUiIsImRlZmF1bHRQcm9wcyIsInJhZGl1c1NjYWxlIiwicmFkaXVzTWluUGl4ZWxzIiwicmFkaXVzTWF4UGl4ZWxzIiwiTnVtYmVyIiwiTUFYX1NBRkVfSU5URUdFUiIsInN0cm9rZVdpZHRoIiwib3V0bGluZSIsImZwNjQiLCJnZXRQb3NpdGlvbiIsIngiLCJwb3NpdGlvbiIsImdldFJhZGl1cyIsInJhZGl1cyIsImdldENvbG9yIiwiY29sb3IiLCJTY2F0dGVycGxvdExheWVyIiwiaWQiLCJzaGFkZXJDYWNoZSIsImNvbnRleHQiLCJwcm9wcyIsIm1vZHVsZXMiLCJnbCIsInNldFN0YXRlIiwibW9kZWwiLCJfZ2V0TW9kZWwiLCJfY2hlY2tSZW1vdmVkUHJvcCIsInN0YXRlIiwiYXR0cmlidXRlTWFuYWdlciIsImFkZEluc3RhbmNlZCIsImluc3RhbmNlUG9zaXRpb25zIiwic2l6ZSIsImFjY2Vzc29yIiwidXBkYXRlIiwiY2FsY3VsYXRlSW5zdGFuY2VQb3NpdGlvbnMiLCJpbnN0YW5jZVJhZGl1cyIsImRlZmF1bHRWYWx1ZSIsImNhbGN1bGF0ZUluc3RhbmNlUmFkaXVzIiwiaW5zdGFuY2VDb2xvcnMiLCJ0eXBlIiwiVU5TSUdORURfQllURSIsImNhbGN1bGF0ZUluc3RhbmNlQ29sb3JzIiwib2xkUHJvcHMiLCJjaGFuZ2VGbGFncyIsImludmFsaWRhdGVBbGwiLCJjb29yZGluYXRlU3lzdGVtIiwiTE5HTEFUIiwiaW5zdGFuY2VQb3NpdGlvbnM2NHh5TG93IiwiY2FsY3VsYXRlSW5zdGFuY2VQb3NpdGlvbnM2NHh5TG93IiwicmVtb3ZlIiwidXBkYXRlQXR0cmlidXRlIiwidW5pZm9ybXMiLCJyZW5kZXIiLCJPYmplY3QiLCJhc3NpZ24iLCJwb3NpdGlvbnMiLCJnZXRTaGFkZXJzIiwiZ2VvbWV0cnkiLCJkcmF3TW9kZSIsIlRSSUFOR0xFX0ZBTiIsImF0dHJpYnV0ZXMiLCJGbG9hdDMyQXJyYXkiLCJpc0luc3RhbmNlZCIsImF0dHJpYnV0ZSIsImRhdGEiLCJ2YWx1ZSIsImkiLCJwb2ludCIsImlzTmFOIiwibGF5ZXJOYW1lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBUUEsaUJBQVIsRUFBMkJDLEtBQTNCLEVBQWtDQyxZQUFsQyxRQUFxRCxZQUFyRDtJQUNPQyxPLEdBQStCRCxZLENBQS9CQyxPO0lBQVNDLGtCLEdBQXNCRixZLENBQXRCRSxrQjs7QUFDaEIsU0FBUUMsRUFBUixFQUFZQyxLQUFaLEVBQW1CQyxRQUFuQixRQUFrQyxTQUFsQzs7QUFFQSxPQUFPQyxFQUFQLE1BQWUsaUNBQWY7QUFDQSxPQUFPQyxJQUFQLE1BQWlCLG9DQUFqQjtBQUNBLE9BQU9DLEVBQVAsTUFBZSxtQ0FBZjs7QUFFQSxJQUFNQyxnQkFBZ0IsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLENBQVAsRUFBVSxHQUFWLENBQXRCOztBQUVBLElBQU1DLGVBQWU7QUFDbkJDLGVBQWEsQ0FETTtBQUVuQkMsbUJBQWlCLENBRkUsRUFFQztBQUNwQkMsbUJBQWlCQyxPQUFPQyxnQkFITCxFQUd1QjtBQUMxQ0MsZUFBYSxDQUpNO0FBS25CQyxXQUFTLEtBTFU7QUFNbkJDLFFBQU0sS0FOYTs7QUFRbkJDLGVBQWE7QUFBQSxXQUFLQyxFQUFFQyxRQUFQO0FBQUEsR0FSTTtBQVNuQkMsYUFBVztBQUFBLFdBQUtGLEVBQUVHLE1BQUYs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QUFOLENBQWI7QUFDQWtELGdCQUFNQyxHQUFOLElBQWFuRCxNQUFNLENBQU4sQ0FBYjtBQUNBa0QsZ0JBQU1DLEdBQU4sSUFBYUUsTUFBTXJELE1BQU0sQ0FBTixDQUFOLElBQWtCLEdBQWxCLEdBQXdCQSxNQUFNLENBQU4sQ0FBckM7QUFDRDtBQVZnQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBV2xDOzs7O0VBaEkyQzFCLEs7O2VBQXpCMkIsZ0I7OztBQW1JckJBLGlCQUFpQnFELFNBQWpCLEdBQTZCLGtCQUE3QjtBQUNBckQsaUJBQWlCaEIsWUFBakIsR0FBZ0NBLFlBQWhDIiwiZmlsZSI6InNjYXR0ZXJwbG90LWxheWVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IC0gMjAxNyBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCB7Q09PUkRJTkFURV9TWVNURU0sIExheWVyLCBleHBlcmltZW50YWx9IGZyb20gJy4uLy4uL2NvcmUnO1xuY29uc3Qge2ZwNjRpZnksIGVuYWJsZTY0Yml0U3VwcG9ydH0gPSBleHBlcmltZW50YWw7XG5pbXBvcnQge0dMLCBNb2RlbCwgR2VvbWV0cnl9IGZyb20gJ2x1bWEuZ2wnO1xuXG5pbXBvcnQgdnMgZnJvbSAnLi9zY2F0dGVycGxvdC1sYXllci12ZXJ0ZXguZ2xzbCc7XG5pbXBvcnQgdnM2NCBmcm9tICcuL3NjYXR0ZXJwbG90LWxheWVyLXZlcnRleC02NC5nbHNsJztcbmltcG9ydCBmcyBmcm9tICcuL3NjYXR0ZXJwbG90LWxheWVyLWZyYWdtZW50Lmdsc2wnO1xuXG5jb25zdCBERUZBVUxUX0NPTE9SID0gWzAsIDAsIDAsIDI1NV07XG5cbmNvbnN0IGRlZmF1bHRQcm9wcyA9IHtcbiAgcmFkaXVzU2NhbGU6IDEsXG4gIHJhZGl1c01pblBpeGVsczogMCwgLy8gIG1pbiBwb2ludCByYWRpdXMgaW4gcGl4ZWxzXG4gIHJhZGl1c01heFBpeGVsczogTnVtYmVyLk1BWF9TQUZFX0lOVEVHRVIsIC8vIG1heCBwb2ludCByYWRpdXMgaW4gcGl4ZWxzXG4gIHN0cm9rZVdpZHRoOiAxLFxuICBvdXRsaW5lOiBmYWxzZSxcbiAgZnA2NDogZmFsc2UsXG5cbiAgZ2V0UG9zaXRpb246IHggPT4geC5wb3NpdGlvbixcbiAgZ2V0UmFkaXVzOiB4ID0+IHgucmFkaXVzIHx8IDEsXG4gIGdldENvbG9yOiB4ID0+IHguY29sb3IgfHwgREVGQVVMVF9DT0xPUlxufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2NhdHRlcnBsb3RMYXllciBleHRlbmRzIExheWVyIHtcbiAgZ2V0U2hhZGVycyhpZCkge1xuICAgIGNvbnN0IHtzaGFkZXJDYWNoZX0gPSB0aGlzLmNvbnRleHQ7XG4gICAgcmV0dXJuIGVuYWJsZTY0Yml0U3VwcG9ydCh0aGlzLnByb3BzKSA/XG4gICAgICB7dnM6IHZzNjQsIGZzLCBtb2R1bGVzOiBbJ3Byb2plY3Q2NCcsICdwaWNraW5nJ10sIHNoYWRlckNhY2hlfSA6XG4gICAgICB7dnMsIGZzLCBtb2R1bGVzOiBbJ3BpY2tpbmcnXSwgc2hhZGVyQ2FjaGV9OyAvLyAncHJvamVjdCcgbW9kdWxlIGFkZGVkIGJ5IGRlZmF1bHQuXG4gIH1cblxuICBpbml0aWFsaXplU3RhdGUoKSB7XG4gICAgY29uc3Qge2dsfSA9IHRoaXMuY29udGV4dDtcbiAgICB0aGlzLnNldFN0YXRlKHttb2RlbDogdGhpcy5fZ2V0TW9kZWwoZ2wpfSk7XG5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBtYXgtbGVuICovXG4gICAgLyogZGVwcmVjYXRlZCBwcm9wcyBjaGVjayAqL1xuICAgIHRoaXMuX2NoZWNrUmVtb3ZlZFByb3AoJ3JhZGl1cycsICdyYWRpdXNTY2FsZScpO1xuICAgIHRoaXMuX2NoZWNrUmVtb3ZlZFByb3AoJ2RyYXdPdXRsaW5lJywgJ291dGxpbmUnKTtcblxuICAgIHRoaXMuc3RhdGUuYXR0cmlidXRlTWFuYWdlci5hZGRJbnN0YW5jZWQoe1xuICAgICAgaW5zdGFuY2VQb3NpdGlvbnM6IHtzaXplOiAzLCBhY2Nlc3NvcjogJ2dldFBvc2l0aW9uJywgdXBkYXRlOiB0aGlzLmNhbGN1bGF0ZUluc3RhbmNlUG9zaXRpb25zfSxcbiAgICAgIGluc3RhbmNlUmFkaXVzOiB7c2l6ZTogMSwgYWNjZXNzb3I6ICdnZXRSYWRpdXMnLCBkZWZhdWx0VmFsdWU6IDEsIHVwZGF0ZTogdGhpcy5jYWxjdWxhdGVJbnN0YW5jZVJhZGl1c30sXG4gICAgICBpbnN0YW5jZUNvbG9yczoge3NpemU6IDQsIHR5cGU6IEdMLlVOU0lHTkVEX0JZVEUsIGFjY2Vzc29yOiAnZ2V0Q29sb3InLCB1cGRhdGU6IHRoaXMuY2FsY3VsYXRlSW5zdGFuY2VDb2xvcnN9XG4gICAgfSk7XG4gICAgLyogZXNsaW50LWVuYWJsZSBtYXgtbGVuICovXG4gIH1cblxuICB1cGRhdGVBdHRyaWJ1dGUoe3Byb3BzLCBvbGRQcm9wcywgY2hhbmdlRmxhZ3N9KSB7XG4gICAgaWYgKHByb3BzLmZwNjQgIT09IG9sZFByb3BzLmZwNjQpIHtcbiAgICAgIGNvbnN0IHthdHRyaWJ1dGVNYW5hZ2VyfSA9IHRoaXMuc3RhdGU7XG4gICAgICBhdHRyaWJ1dGVNYW5hZ2VyLmludmFsaWRhdGVBbGwoKTtcblxuICAgICAgaWYgKHByb3BzLmZwNjQgJiYgcHJvcHMuY29vcmRpbmF0ZVN5c3RlbSA9PT0gQ09PUkRJTkFURV9TWVNURU0uTE5HTEFUKSB7XG4gICAgICAgIGF0dHJpYnV0ZU1hbmFnZXIuYWRkSW5zdGFuY2VkKHtcbiAgICAgICAgICBpbnN0YW5jZVBvc2l0aW9uczY0eHlMb3c6IHtcbiAgICAgICAgICAgIHNpemU6IDIsXG4gICAgICAgICAgICBhY2Nlc3NvcjogJ2dldFBvc2l0aW9uJyxcbiAgICAgICAgICAgIHVwZGF0ZTogdGhpcy5jYWxjdWxhdGVJbnN0YW5jZVBvc2l0aW9uczY0eHlMb3dcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXR0cmlidXRlTWFuYWdlci5yZW1vdmUoW1xuICAgICAgICAgICdpbnN0YW5jZVBvc2l0aW9uczY0eHlMb3cnXG4gICAgICAgIF0pO1xuICAgICAgfVxuXG4gICAgfVxuICB9XG5cbiAgdXBkYXRlU3RhdGUoe3Byb3BzLCBvbGRQcm9wcywgY2hhbmdlRmxhZ3N9KSB7XG4gICAgc3VwZXIudXBkYXRlU3RhdGUoe3Byb3BzLCBvbGRQcm9wcywgY2hhbmdlRmxhZ3N9KTtcbiAgICBpZiAocHJvcHMuZnA2NCAhPT0gb2xkUHJvcHMuZnA2NCkge1xuICAgICAgY29uc3Qge2dsfSA9IHRoaXMuY29udGV4dDtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe21vZGVsOiB0aGlzLl9nZXRNb2RlbChnbCl9KTtcbiAgICB9XG4gICAgdGhpcy51cGRhdGVBdHRyaWJ1dGUoe3Byb3BzLCBvbGRQcm9wcywgY2hhbmdlRmxhZ3N9KTtcbiAgfVxuXG4gIGRyYXcoe3VuaWZvcm1zfSkge1xuICAgIGNvbnN0IHtyYWRpdXNTY2FsZSwgcmFkaXVzTWluUGl4ZWxzLCByYWRpdXNNYXhQaXhlbHMsIG91dGxpbmUsIHN0cm9rZVdpZHRofSA9IHRoaXMucHJvcHM7XG4gICAgdGhpcy5zdGF0ZS5tb2RlbC5yZW5kZXIoT2JqZWN0LmFzc2lnbih7fSwgdW5pZm9ybXMsIHtcbiAgICAgIG91dGxpbmU6IG91dGxpbmUgPyAxIDogMCxcbiAgICAgIHN0cm9rZVdpZHRoLFxuICAgICAgcmFkaXVzU2NhbGUsXG4gICAgICByYWRpdXNNaW5QaXhlbHMsXG4gICAgICByYWRpdXNNYXhQaXhlbHNcbiAgICB9KSk7XG4gIH1cblxuICBfZ2V0TW9kZWwoZ2wpIHtcbiAgICAvLyBhIHNxdWFyZSB0aGF0IG1pbmltYWxseSBjb3ZlciB0aGUgdW5pdCBjaXJjbGVcbiAgICBjb25zdCBwb3NpdGlvbnMgPSBbLTEsIC0xLCAwLCAtMSwgMSwgMCwgMSwgMSwgMCwgMSwgLTEsIDBdO1xuXG4gICAgcmV0dXJuIG5ldyBNb2RlbChnbCwgT2JqZWN0LmFzc2lnbih0aGlzLmdldFNoYWRlcnMoKSwge1xuICAgICAgaWQ6IHRoaXMucHJvcHMuaWQsXG4gICAgICBnZW9tZXRyeTogbmV3IEdlb21ldHJ5KHtcbiAgICAgICAgZHJhd01vZGU6IEdMLlRSSUFOR0xFX0ZBTixcbiAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgIHBvc2l0aW9uczogbmV3IEZsb2F0MzJBcnJheShwb3NpdGlvbnMpXG4gICAgICAgIH1cbiAgICAgIH0pLFxuICAgICAgaXNJbnN0YW5jZWQ6IHRydWUsXG4gICAgICBzaGFkZXJDYWNoZTogdGhpcy5jb250ZXh0LnNoYWRlckNhY2hlXG4gICAgfSkpO1xuICB9XG5cbiAgY2FsY3VsYXRlSW5zdGFuY2VQb3NpdGlvbnMoYXR0cmlidXRlKSB7XG4gICAgY29uc3Qge2RhdGEsIGdldFBvc2l0aW9ufSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge3ZhbHVlfSA9IGF0dHJpYnV0ZTtcbiAgICBsZXQgaSA9IDA7XG4gICAgZm9yIChjb25zdCBwb2ludCBvZiBkYXRhKSB7XG4gICAgICBjb25zdCBwb3NpdGlvbiA9IGdldFBvc2l0aW9uKHBvaW50KTtcbiAgICAgIHZhbHVlW2krK10gPSBwb3NpdGlvblswXTtcbiAgICAgIHZhbHVlW2krK10gPSBwb3NpdGlvblsxXTtcbiAgICAgIHZhbHVlW2krK10gPSBwb3NpdGlvblsyXSB8fCAwO1xuICAgIH1cbiAgfVxuXG4gIGNhbGN1bGF0ZUluc3RhbmNlUG9zaXRpb25zNjR4eUxvdyhhdHRyaWJ1dGUpIHtcbiAgICBjb25zdCB7ZGF0YSwgZ2V0UG9zaXRpb259ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7dmFsdWV9ID0gYXR0cmlidXRlO1xuICAgIGxldCBpID0gMDtcbiAgICBmb3IgKGNvbnN0IHBvaW50IG9mIGRhdGEpIHtcbiAgICAgIGNvbnN0IHBvc2l0aW9uID0gZ2V0UG9zaXRpb24ocG9pbnQpO1xuICAgICAgdmFsdWVbaSsrXSA9IGZwNjRpZnkocG9zaXRpb25bMF0pWzFdO1xuICAgICAgdmFsdWVbaSsrXSA9IGZwNjRpZnkocG9zaXRpb25bMV0pWzFdO1xuICAgIH1cbiAgfVxuXG4gIGNhbGN1bGF0ZUluc3RhbmNlUmFkaXVzKGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHtkYXRhLCBnZXRSYWRpdXN9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7dmFsdWV9ID0gYXR0cmlidXRlO1xuICAgIGxldCBpID0gMDtcbiAgICBmb3IgKGNvbnN0IHBvaW50IG9mIGRhdGEpIHtcbiAgICAgIGNvbnN0IHJhZGl1cyA9IGdldFJhZGl1cyhwb2ludCk7XG4gICAgICB2YWx1ZVtpKytdID0gaXNOYU4ocmFkaXVzKSA/IDEgOiByYWRpdXM7XG4gICAgfVxuICB9XG5cbiAgY2FsY3VsYXRlSW5zdGFuY2VDb2xvcnMoYXR0cmlidXRlKSB7XG4gICAgY29uc3Qge2RhdGEsIGdldENvbG9yfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge3ZhbHVlfSA9IGF0dHJpYnV0ZTtcbiAgICBsZXQgaSA9IDA7XG4gICAgZm9yIChjb25zdCBwb2ludCBvZiBkYXRhKSB7XG4gICAgICBjb25zdCBjb2xvciA9IGdldENvbG9yKHBvaW50KSB8fCBERUZBVUxUX0NPTE9SO1xuICAgICAgdmFsdWVbaSsrXSA9IGNvbG9yWzBdO1xuICAgICAgdmFsdWVbaSsrXSA9IGNvbG9yWzFdO1xuICAgICAgdmFsdWVbaSsrXSA9IGNvbG9yWzJdO1xuICAgICAgdmFsdWVbaSsrXSA9IGlzTmFOKGNvbG9yWzNdKSA/IDI1NSA6IGNvbG9yWzNdO1xuICAgIH1cbiAgfVxufVxuXG5TY2F0dGVycGxvdExheWVyLmxheWVyTmFtZSA9ICdTY2F0dGVycGxvdExheWVyJztcblNjYXR0ZXJwbG90TGF5ZXIuZGVmYXVsdFByb3BzID0gZGVmYXVsdFByb3BzO1xuIl19