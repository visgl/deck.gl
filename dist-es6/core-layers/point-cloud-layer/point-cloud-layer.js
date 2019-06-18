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

import vs from './point-cloud-layer-vertex.glsl';
import vs64 from './point-cloud-layer-vertex-64.glsl';
import fs from './point-cloud-layer-fragment.glsl';

var DEFAULT_COLOR = [0, 0, 0, 255];

var defaultProps = {
  radiusPixels: 10, //  point radius in pixels
  fp64: false,

  getPosition: function getPosition(x) {
    return x.position;
  },
  getNormal: function getNormal(x) {
    return x.normal;
  },
  getColor: function getColor(x) {
    return x.color || DEFAULT_COLOR;
  },

  lightSettings: {
    lightsPosition: [0, 0, 5000, -1000, 1000, 8000, 5000, -5000, 1000],
    ambientRatio: 0.2,
    diffuseRatio: 0.6,
    specularRatio: 0.8,
    lightsStrength: [1.0, 0.0, 0.8, 0.0, 0.4, 0.0],
    numberOfLights: 3
  }
};

var PointCloudLayer = function (_Layer) {
  _inherits(PointCloudLayer, _Layer);

  function PointCloudLayer() {
    _classCallCheck(this, PointCloudLayer);

    return _possibleConstructorReturn(this, (PointCloudLayer.__proto__ || Object.getPrototypeOf(PointCloudLayer)).apply(this, arguments));
  }

  _createClass(PointCloudLayer, [{
    key: 'getShaders',
    value: function getShaders(id) {
      var shaderCache = this.context.shaderCache;

      return enable64bitSupport(this.props) ? { vs: vs64, fs: fs, modules: ['project64', 'lighting', 'picking'], shaderCache: shaderCache } : { vs: vs, fs: fs, modules: ['lighting', 'picking'], shaderCache: shaderCache }; // 'project' module added by default.
    }
  }, {
    key: 'initializeState',
    value: function initializeState() {
      var gl = this.context.gl;

      this.setState({ model: this._getModel(gl) });

      /* eslint-disable max-len */
      this.state.attributeManager.addInstanced({
        instancePositions: { size: 3, accessor: 'getPosition', update: this.calculateInstancePositions },
        instanceNormals: { size: 3, accessor: 'getNormal', defaultValue: 1, update: this.calculateInstanceNormals },
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

      _get(PointCloudLayer.prototype.__proto__ || Object.getPrototypeOf(PointCloudLayer.prototype), 'updateState', this).call(this, { props: props, oldProps: oldProps, changeFlags: changeFlags });
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
          radiusPixels = _props.radiusPixels,
          lightSettings = _props.lightSettings;

      this.state.model.render(Object.assign({}, uniforms, {
        radiusPixels: radiusPixels
      }, lightSettings));
    }
  }, {
    key: '_getModel',
    value: function _getModel(gl) {
      // a triangle that minimally cover the unit circle
      var positions = [];
      for (var i = 0; i < 3; i++) {
        var angle = i / 3 * Math.PI * 2;
        positions.push(Math.cos(angle) * 2, Math.sin(angle) * 2, 0);
      }

      return new Model(gl, Object.assign({}, this.getShaders(), {
        id: this.props.id,
        geometry: new Geometry({
          drawMode: GL.TRIANGLES,
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
    key: 'calculateInstanceNormals',
    value: function calculateInstanceNormals(attribute) {
      var _props4 = this.props,
          data = _props4.data,
          getNormal = _props4.getNormal;
      var value = attribute.value;

      var i = 0;
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = data[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var point = _step3.value;

          var normal = getNormal(point);
          value[i++] = normal[0];
          value[i++] = normal[1];
          value[i++] = normal[2];
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

          var color = getColor(point);
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

  return PointCloudLayer;
}(Layer);

export default PointCloudLayer;


PointCloudLayer.layerName = 'PointCloudLayer';
PointCloudLayer.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlLWxheWVycy9wb2ludC1jbG91ZC1sYXllci9wb2ludC1jbG91ZC1sYXllci5qcyJdLCJuYW1lcyI6WyJDT09SRElOQVRFX1NZU1RFTSIsIkxheWVyIiwiZXhwZXJpbWVudGFsIiwiZnA2NGlmeSIsImVuYWJsZTY0Yml0U3VwcG9ydCIsIkdMIiwiTW9kZWwiLCJHZW9tZXRyeSIsInZzIiwidnM2NCIsImZzIiwiREVGQVVMVF9DT0xPUiIsImRlZmF1bHRQcm9wcyIsInJhZGl1c1BpeGVscyIsImZwNjQiLCJnZXRQb3NpdGlvbiIsIngiLCJwb3NpdGlvbiIsImdldE5vcm1hbCIsIm5vcm1hbCIsImdldENvbG9yIiwiY29sb3IiLCJsaWdodFNldHRpbmdzIiwibGlnaHRzUG9zaXRpb24iLCJhbWJpZW50UmF0aW8iLCJkaWZmdXNlUmF0aW8iLCJzcGVjdWxhclJhdGlvIiwibGlnaHRzU3RyZW5ndGgiLCJudW1iZXJPZkxpZ2h0cyIsIlBvaW50Q2xvdWRMYXllciIsImlkIiwic2hhZGVyQ2FjaGUiLCJjb250ZXh0IiwicHJvcHMiLCJtb2R1bGVzIiwiZ2wiLCJzZXRTdGF0ZSIsIm1vZGVsIiwiX2dldE1vZGVsIiwic3RhdGUiLCJhdHRyaWJ1dGVNYW5hZ2VyIiwiYWRkSW5zdGFuY2VkIiwiaW5zdGFuY2VQb3NpdGlvbnMiLCJzaXplIiwiYWNjZXNzb3IiLCJ1cGRhdGUiLCJjYWxjdWxhdGVJbnN0YW5jZVBvc2l0aW9ucyIsImluc3RhbmNlTm9ybWFscyIsImRlZmF1bHRWYWx1ZSIsImNhbGN1bGF0ZUluc3RhbmNlTm9ybWFscyIsImluc3RhbmNlQ29sb3JzIiwidHlwZSIsIlVOU0lHTkVEX0JZVEUiLCJjYWxjdWxhdGVJbnN0YW5jZUNvbG9ycyIsIm9sZFByb3BzIiwiY2hhbmdlRmxhZ3MiLCJpbnZhbGlkYXRlQWxsIiwiY29vcmRpbmF0ZVN5c3RlbSIsIkxOR0xBVCIsImluc3RhbmNlUG9zaXRpb25zNjR4eUxvdyIsImNhbGN1bGF0ZUluc3RhbmNlUG9zaXRpb25zNjR4eUxvdyIsInJlbW92ZSIsInVwZGF0ZUF0dHJpYnV0ZSIsInVuaWZvcm1zIiwicmVuZGVyIiwiT2JqZWN0IiwiYXNzaWduIiwicG9zaXRpb25zIiwiaSIsImFuZ2xlIiwiTWF0aCIsIlBJIiwicHVzaCIsImNvcyIsInNpbiIsImdldFNoYWRlcnMiLCJnZW9tZXRyeSIsImRyYXdNb2RlIiwiVFJJQU5HTEVTIiwiYXR0cmlidXRlcyIsIkZsb2F0MzJBcnJheSIsImlzSW5zdGFuY2VkIiwiYXR0cmlidXRlIiwiZGF0YSIsInZhbHVlIiwicG9pbnQiLCJpc05hTiIsImxheWVyTmFtZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFNBQVFBLGlCQUFSLEVBQTJCQyxLQUEzQixFQUFrQ0MsWUFBbEMsUUFBcUQsWUFBckQ7SUFDT0MsTyxHQUErQkQsWSxDQUEvQkMsTztJQUFTQyxrQixHQUFzQkYsWSxDQUF0QkUsa0I7O0FBQ2hCLFNBQVFDLEVBQVIsRUFBWUMsS0FBWixFQUFtQkMsUUFBbkIsUUFBa0MsU0FBbEM7O0FBRUEsT0FBT0MsRUFBUCxNQUFlLGlDQUFmO0FBQ0EsT0FBT0MsSUFBUCxNQUFpQixvQ0FBakI7QUFDQSxPQUFPQyxFQUFQLE1BQWUsbUNBQWY7O0FBRUEsSUFBTUMsZ0JBQWdCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsR0FBVixDQUF0Qjs7QUFFQSxJQUFNQyxlQUFlO0FBQ25CQyxnQkFBYyxFQURLLEVBQ0E7QUFDbkJDLFFBQU0sS0FGYTs7QUFJbkJDLGVBQWE7QUFBQSxXQUFLQyxFQUFFQyxRQUFQO0FBQUEsR0FKTTtBQUtuQkMsYUFBVztBQUFBLFdBQUtGLEVBQUVHLE1BQVA7QUFBQSxHQUxRO0FBTW5CQyxZQUFVO0FBQUEsV0FBS0osRUFBRUssS0FB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UjtBQUhpQztBQUFBO0FBQUE7O0FBQUE7QUFJakMsOEJBQW9CZSxJQUFwQixtSUFBMEI7QUFBQSxjQUFmRSxLQUFlOztBQUN4QixjQUFNaEUsUUFBUUQsU0FBU2lFLEtBQVQsQ0FBZDtBQUNBRCxnQkFBTWhCLEdBQU4sSUFBYS9DLE1BQU0sQ0FBTixDQUFiO0FBQ0ErRCxnQkFBTWhCLEdBQU4sSUFBYS9DLE1BQU0sQ0FBTixDQUFiO0FBQ0ErRCxnQkFBTWhCLEdBQU4sSUFBYS9DLE1BQU0sQ0FBTixDQUFiO0FBQ0ErRCxnQkFBTWhCLEdBQU4sSUFBYWtCLE1BQU1qRSxNQUFNLENBQU4sQ0FBTixJQUFrQixHQUFsQixHQUF3QkEsTUFBTSxDQUFOLENBQXJDO0FBQ0Q7QUFWZ0M7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQVdsQzs7OztFQWxJMENwQixLOztlQUF4QjRCLGU7OztBQXFJckJBLGdCQUFnQjBELFNBQWhCLEdBQTRCLGlCQUE1QjtBQUNBMUQsZ0JBQWdCakIsWUFBaEIsR0FBK0JBLFlBQS9CIiwiZmlsZSI6InBvaW50LWNsb3VkLWxheWVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IC0gMjAxNyBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCB7Q09PUkRJTkFURV9TWVNURU0sIExheWVyLCBleHBlcmltZW50YWx9IGZyb20gJy4uLy4uL2NvcmUnO1xuY29uc3Qge2ZwNjRpZnksIGVuYWJsZTY0Yml0U3VwcG9ydH0gPSBleHBlcmltZW50YWw7XG5pbXBvcnQge0dMLCBNb2RlbCwgR2VvbWV0cnl9IGZyb20gJ2x1bWEuZ2wnO1xuXG5pbXBvcnQgdnMgZnJvbSAnLi9wb2ludC1jbG91ZC1sYXllci12ZXJ0ZXguZ2xzbCc7XG5pbXBvcnQgdnM2NCBmcm9tICcuL3BvaW50LWNsb3VkLWxheWVyLXZlcnRleC02NC5nbHNsJztcbmltcG9ydCBmcyBmcm9tICcuL3BvaW50LWNsb3VkLWxheWVyLWZyYWdtZW50Lmdsc2wnO1xuXG5jb25zdCBERUZBVUxUX0NPTE9SID0gWzAsIDAsIDAsIDI1NV07XG5cbmNvbnN0IGRlZmF1bHRQcm9wcyA9IHtcbiAgcmFkaXVzUGl4ZWxzOiAxMCwgIC8vICBwb2ludCByYWRpdXMgaW4gcGl4ZWxzXG4gIGZwNjQ6IGZhbHNlLFxuXG4gIGdldFBvc2l0aW9uOiB4ID0+IHgucG9zaXRpb24sXG4gIGdldE5vcm1hbDogeCA9PiB4Lm5vcm1hbCxcbiAgZ2V0Q29sb3I6IHggPT4geC5jb2xvciB8fCBERUZBVUxUX0NPTE9SLFxuXG4gIGxpZ2h0U2V0dGluZ3M6IHtcbiAgICBsaWdodHNQb3NpdGlvbjogWzAsIDAsIDUwMDAsIC0xMDAwLCAxMDAwLCA4MDAwLCA1MDAwLCAtNTAwMCwgMTAwMF0sXG4gICAgYW1iaWVudFJhdGlvOiAwLjIsXG4gICAgZGlmZnVzZVJhdGlvOiAwLjYsXG4gICAgc3BlY3VsYXJSYXRpbzogMC44LFxuICAgIGxpZ2h0c1N0cmVuZ3RoOiBbMS4wLCAwLjAsIDAuOCwgMC4wLCAwLjQsIDAuMF0sXG4gICAgbnVtYmVyT2ZMaWdodHM6IDNcbiAgfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUG9pbnRDbG91ZExheWVyIGV4dGVuZHMgTGF5ZXIge1xuICBnZXRTaGFkZXJzKGlkKSB7XG4gICAgY29uc3Qge3NoYWRlckNhY2hlfSA9IHRoaXMuY29udGV4dDtcbiAgICByZXR1cm4gZW5hYmxlNjRiaXRTdXBwb3J0KHRoaXMucHJvcHMpID9cbiAgICAgIHt2czogdnM2NCwgZnMsIG1vZHVsZXM6IFsncHJvamVjdDY0JywgJ2xpZ2h0aW5nJywgJ3BpY2tpbmcnXSwgc2hhZGVyQ2FjaGV9IDpcbiAgICAgIHt2cywgZnMsIG1vZHVsZXM6IFsnbGlnaHRpbmcnLCAncGlja2luZyddLCBzaGFkZXJDYWNoZX07IC8vICdwcm9qZWN0JyBtb2R1bGUgYWRkZWQgYnkgZGVmYXVsdC5cbiAgfVxuXG4gIGluaXRpYWxpemVTdGF0ZSgpIHtcbiAgICBjb25zdCB7Z2x9ID0gdGhpcy5jb250ZXh0O1xuICAgIHRoaXMuc2V0U3RhdGUoe21vZGVsOiB0aGlzLl9nZXRNb2RlbChnbCl9KTtcblxuICAgIC8qIGVzbGludC1kaXNhYmxlIG1heC1sZW4gKi9cbiAgICB0aGlzLnN0YXRlLmF0dHJpYnV0ZU1hbmFnZXIuYWRkSW5zdGFuY2VkKHtcbiAgICAgIGluc3RhbmNlUG9zaXRpb25zOiB7c2l6ZTogMywgYWNjZXNzb3I6ICdnZXRQb3NpdGlvbicsIHVwZGF0ZTogdGhpcy5jYWxjdWxhdGVJbnN0YW5jZVBvc2l0aW9uc30sXG4gICAgICBpbnN0YW5jZU5vcm1hbHM6IHtzaXplOiAzLCBhY2Nlc3NvcjogJ2dldE5vcm1hbCcsIGRlZmF1bHRWYWx1ZTogMSwgdXBkYXRlOiB0aGlzLmNhbGN1bGF0ZUluc3RhbmNlTm9ybWFsc30sXG4gICAgICBpbnN0YW5jZUNvbG9yczoge3NpemU6IDQsIHR5cGU6IEdMLlVOU0lHTkVEX0JZVEUsIGFjY2Vzc29yOiAnZ2V0Q29sb3InLCB1cGRhdGU6IHRoaXMuY2FsY3VsYXRlSW5zdGFuY2VDb2xvcnN9XG4gICAgfSk7XG4gICAgLyogZXNsaW50LWVuYWJsZSBtYXgtbGVuICovXG4gIH1cblxuICB1cGRhdGVBdHRyaWJ1dGUoe3Byb3BzLCBvbGRQcm9wcywgY2hhbmdlRmxhZ3N9KSB7XG4gICAgaWYgKHByb3BzLmZwNjQgIT09IG9sZFByb3BzLmZwNjQpIHtcbiAgICAgIGNvbnN0IHthdHRyaWJ1dGVNYW5hZ2VyfSA9IHRoaXMuc3RhdGU7XG4gICAgICBhdHRyaWJ1dGVNYW5hZ2VyLmludmFsaWRhdGVBbGwoKTtcblxuICAgICAgaWYgKHByb3BzLmZwNjQgJiYgcHJvcHMuY29vcmRpbmF0ZVN5c3RlbSA9PT0gQ09PUkRJTkFURV9TWVNURU0uTE5HTEFUKSB7XG4gICAgICAgIGF0dHJpYnV0ZU1hbmFnZXIuYWRkSW5zdGFuY2VkKHtcbiAgICAgICAgICBpbnN0YW5jZVBvc2l0aW9uczY0eHlMb3c6IHtcbiAgICAgICAgICAgIHNpemU6IDIsXG4gICAgICAgICAgICBhY2Nlc3NvcjogJ2dldFBvc2l0aW9uJyxcbiAgICAgICAgICAgIHVwZGF0ZTogdGhpcy5jYWxjdWxhdGVJbnN0YW5jZVBvc2l0aW9uczY0eHlMb3dcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYXR0cmlidXRlTWFuYWdlci5yZW1vdmUoW1xuICAgICAgICAgICdpbnN0YW5jZVBvc2l0aW9uczY0eHlMb3cnXG4gICAgICAgIF0pO1xuICAgICAgfVxuXG4gICAgfVxuICB9XG5cbiAgdXBkYXRlU3RhdGUoe3Byb3BzLCBvbGRQcm9wcywgY2hhbmdlRmxhZ3N9KSB7XG4gICAgc3VwZXIudXBkYXRlU3RhdGUoe3Byb3BzLCBvbGRQcm9wcywgY2hhbmdlRmxhZ3N9KTtcbiAgICBpZiAocHJvcHMuZnA2NCAhPT0gb2xkUHJvcHMuZnA2NCkge1xuICAgICAgY29uc3Qge2dsfSA9IHRoaXMuY29udGV4dDtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe21vZGVsOiB0aGlzLl9nZXRNb2RlbChnbCl9KTtcbiAgICB9XG4gICAgdGhpcy51cGRhdGVBdHRyaWJ1dGUoe3Byb3BzLCBvbGRQcm9wcywgY2hhbmdlRmxhZ3N9KTtcbiAgfVxuXG4gIGRyYXcoe3VuaWZvcm1zfSkge1xuICAgIGNvbnN0IHtyYWRpdXNQaXhlbHMsIGxpZ2h0U2V0dGluZ3N9ID0gdGhpcy5wcm9wcztcbiAgICB0aGlzLnN0YXRlLm1vZGVsLnJlbmRlcihPYmplY3QuYXNzaWduKHt9LCB1bmlmb3Jtcywge1xuICAgICAgcmFkaXVzUGl4ZWxzXG4gICAgfSwgbGlnaHRTZXR0aW5ncykpO1xuICB9XG5cbiAgX2dldE1vZGVsKGdsKSB7XG4gICAgLy8gYSB0cmlhbmdsZSB0aGF0IG1pbmltYWxseSBjb3ZlciB0aGUgdW5pdCBjaXJjbGVcbiAgICBjb25zdCBwb3NpdGlvbnMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDM7IGkrKykge1xuICAgICAgY29uc3QgYW5nbGUgPSBpIC8gMyAqIE1hdGguUEkgKiAyO1xuICAgICAgcG9zaXRpb25zLnB1c2goXG4gICAgICAgIE1hdGguY29zKGFuZ2xlKSAqIDIsXG4gICAgICAgIE1hdGguc2luKGFuZ2xlKSAqIDIsXG4gICAgICAgIDBcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBNb2RlbChnbCwgT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5nZXRTaGFkZXJzKCksIHtcbiAgICAgIGlkOiB0aGlzLnByb3BzLmlkLFxuICAgICAgZ2VvbWV0cnk6IG5ldyBHZW9tZXRyeSh7XG4gICAgICAgIGRyYXdNb2RlOiBHTC5UUklBTkdMRVMsXG4gICAgICAgIGF0dHJpYnV0ZXM6IHtcbiAgICAgICAgICBwb3NpdGlvbnM6IG5ldyBGbG9hdDMyQXJyYXkocG9zaXRpb25zKVxuICAgICAgICB9XG4gICAgICB9KSxcbiAgICAgIGlzSW5zdGFuY2VkOiB0cnVlLFxuICAgICAgc2hhZGVyQ2FjaGU6IHRoaXMuY29udGV4dC5zaGFkZXJDYWNoZVxuICAgIH0pKTtcbiAgfVxuXG4gIGNhbGN1bGF0ZUluc3RhbmNlUG9zaXRpb25zKGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHtkYXRhLCBnZXRQb3NpdGlvbn0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHt2YWx1ZX0gPSBhdHRyaWJ1dGU7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAoY29uc3QgcG9pbnQgb2YgZGF0YSkge1xuICAgICAgY29uc3QgcG9zaXRpb24gPSBnZXRQb3NpdGlvbihwb2ludCk7XG4gICAgICB2YWx1ZVtpKytdID0gcG9zaXRpb25bMF07XG4gICAgICB2YWx1ZVtpKytdID0gcG9zaXRpb25bMV07XG4gICAgICB2YWx1ZVtpKytdID0gcG9zaXRpb25bMl0gfHwgMDtcbiAgICB9XG4gIH1cblxuICBjYWxjdWxhdGVJbnN0YW5jZVBvc2l0aW9uczY0eHlMb3coYXR0cmlidXRlKSB7XG4gICAgY29uc3Qge2RhdGEsIGdldFBvc2l0aW9ufSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge3ZhbHVlfSA9IGF0dHJpYnV0ZTtcbiAgICBsZXQgaSA9IDA7XG4gICAgZm9yIChjb25zdCBwb2ludCBvZiBkYXRhKSB7XG4gICAgICBjb25zdCBwb3NpdGlvbiA9IGdldFBvc2l0aW9uKHBvaW50KTtcbiAgICAgIHZhbHVlW2krK10gPSBmcDY0aWZ5KHBvc2l0aW9uWzBdKVsxXTtcbiAgICAgIHZhbHVlW2krK10gPSBmcDY0aWZ5KHBvc2l0aW9uWzFdKVsxXTtcbiAgICB9XG4gIH1cblxuICBjYWxjdWxhdGVJbnN0YW5jZU5vcm1hbHMoYXR0cmlidXRlKSB7XG4gICAgY29uc3Qge2RhdGEsIGdldE5vcm1hbH0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHt2YWx1ZX0gPSBhdHRyaWJ1dGU7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAoY29uc3QgcG9pbnQgb2YgZGF0YSkge1xuICAgICAgY29uc3Qgbm9ybWFsID0gZ2V0Tm9ybWFsKHBvaW50KTtcbiAgICAgIHZhbHVlW2krK10gPSBub3JtYWxbMF07XG4gICAgICB2YWx1ZVtpKytdID0gbm9ybWFsWzFdO1xuICAgICAgdmFsdWVbaSsrXSA9IG5vcm1hbFsyXTtcbiAgICB9XG4gIH1cblxuICBjYWxjdWxhdGVJbnN0YW5jZUNvbG9ycyhhdHRyaWJ1dGUpIHtcbiAgICBjb25zdCB7ZGF0YSwgZ2V0Q29sb3J9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7dmFsdWV9ID0gYXR0cmlidXRlO1xuICAgIGxldCBpID0gMDtcbiAgICBmb3IgKGNvbnN0IHBvaW50IG9mIGRhdGEpIHtcbiAgICAgIGNvbnN0IGNvbG9yID0gZ2V0Q29sb3IocG9pbnQpO1xuICAgICAgdmFsdWVbaSsrXSA9IGNvbG9yWzBdO1xuICAgICAgdmFsdWVbaSsrXSA9IGNvbG9yWzFdO1xuICAgICAgdmFsdWVbaSsrXSA9IGNvbG9yWzJdO1xuICAgICAgdmFsdWVbaSsrXSA9IGlzTmFOKGNvbG9yWzNdKSA/IDI1NSA6IGNvbG9yWzNdO1xuICAgIH1cbiAgfVxufVxuXG5Qb2ludENsb3VkTGF5ZXIubGF5ZXJOYW1lID0gJ1BvaW50Q2xvdWRMYXllcic7XG5Qb2ludENsb3VkTGF5ZXIuZGVmYXVsdFByb3BzID0gZGVmYXVsdFByb3BzO1xuIl19