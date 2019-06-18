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

import vs from './arc-layer-vertex.glsl';
import vs64 from './arc-layer-vertex-64.glsl';
import fs from './arc-layer-fragment.glsl';

var DEFAULT_COLOR = [0, 0, 0, 255];

var defaultProps = {
  strokeWidth: 1,
  fp64: false,

  getSourcePosition: function getSourcePosition(x) {
    return x.sourcePosition;
  },
  getTargetPosition: function getTargetPosition(x) {
    return x.targetPosition;
  },
  getSourceColor: function getSourceColor(x) {
    return x.color || DEFAULT_COLOR;
  },
  getTargetColor: function getTargetColor(x) {
    return x.color || DEFAULT_COLOR;
  }
};

var ArcLayer = function (_Layer) {
  _inherits(ArcLayer, _Layer);

  function ArcLayer() {
    _classCallCheck(this, ArcLayer);

    return _possibleConstructorReturn(this, (ArcLayer.__proto__ || Object.getPrototypeOf(ArcLayer)).apply(this, arguments));
  }

  _createClass(ArcLayer, [{
    key: 'getShaders',
    value: function getShaders() {
      return enable64bitSupport(this.props) ? { vs: vs64, fs: fs, modules: ['project64', 'picking'] } : { vs: vs, fs: fs, modules: ['picking'] }; // 'project' module added by default.
    }
  }, {
    key: 'initializeState',
    value: function initializeState() {
      var gl = this.context.gl;

      this.setState({ model: this._getModel(gl) });

      var attributeManager = this.state.attributeManager;

      /* eslint-disable max-len */

      attributeManager.addInstanced({
        instancePositions: { size: 4, accessor: ['getSourcePosition', 'getTargetPosition'], update: this.calculateInstancePositions },
        instanceSourceColors: { size: 4, type: GL.UNSIGNED_BYTE, accessor: 'getSourceColor', update: this.calculateInstanceSourceColors },
        instanceTargetColors: { size: 4, type: GL.UNSIGNED_BYTE, accessor: 'getTargetColor', update: this.calculateInstanceTargetColors }
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
            instancePositions64Low: {
              size: 4,
              accessor: ['getSourcePosition', 'getTargetPosition'],
              update: this.calculateInstancePositions64Low
            }
          });
        } else {
          attributeManager.remove(['instancePositions64Low']);
        }
      }
    }
  }, {
    key: 'updateState',
    value: function updateState(_ref2) {
      var props = _ref2.props,
          oldProps = _ref2.oldProps,
          changeFlags = _ref2.changeFlags;

      _get(ArcLayer.prototype.__proto__ || Object.getPrototypeOf(ArcLayer.prototype), 'updateState', this).call(this, { props: props, oldProps: oldProps, changeFlags: changeFlags });
      // Re-generate model if geometry changed
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
      var strokeWidth = this.props.strokeWidth;


      this.state.model.render(Object.assign({}, uniforms, {
        strokeWidth: strokeWidth
      }));
    }
  }, {
    key: '_getModel',
    value: function _getModel(gl) {
      var positions = [];
      var NUM_SEGMENTS = 50;
      /*
       *  (0, -1)-------------_(1, -1)
       *       |          _,-"  |
       *       o      _,-"      o
       *       |  _,-"          |
       *   (0, 1)"-------------(1, 1)
       */
      for (var i = 0; i < NUM_SEGMENTS; i++) {
        positions = positions.concat([i, -1, 0, i, 1, 0]);
      }

      var model = new Model(gl, Object.assign({}, this.getShaders(), {
        id: this.props.id,
        geometry: new Geometry({
          drawMode: GL.TRIANGLE_STRIP,
          attributes: {
            positions: new Float32Array(positions)
          }
        }),
        isInstanced: true,
        shaderCache: this.context.shaderCache
      }));

      model.setUniforms({ numSegments: NUM_SEGMENTS });

      return model;
    }
  }, {
    key: 'calculateInstancePositions',
    value: function calculateInstancePositions(attribute) {
      var _props = this.props,
          data = _props.data,
          getSourcePosition = _props.getSourcePosition,
          getTargetPosition = _props.getTargetPosition;
      var value = attribute.value,
          size = attribute.size;

      var i = 0;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var object = _step.value;

          var sourcePosition = getSourcePosition(object);
          var targetPosition = getTargetPosition(object);
          value[i + 0] = sourcePosition[0];
          value[i + 1] = sourcePosition[1];
          value[i + 2] = targetPosition[0];
          value[i + 3] = targetPosition[1];
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
    key: 'calculateInstancePositions64Low',
    value: function calculateInstancePositions64Low(attribute) {
      var _props2 = this.props,
          data = _props2.data,
          getSourcePosition = _props2.getSourcePosition,
          getTargetPosition = _props2.getTargetPosition;
      var value = attribute.value,
          size = attribute.size;

      var i = 0;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = data[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var object = _step2.value;

          var sourcePosition = getSourcePosition(object);
          var targetPosition = getTargetPosition(object);
          value[i + 0] = fp64ify(sourcePosition[0])[1];
          value[i + 1] = fp64ify(sourcePosition[1])[1];
          value[i + 2] = fp64ify(targetPosition[0])[1];
          value[i + 3] = fp64ify(targetPosition[1])[1];
          i += size;
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
    key: 'calculateInstanceSourceColors',
    value: function calculateInstanceSourceColors(attribute) {
      var _props3 = this.props,
          data = _props3.data,
          getSourceColor = _props3.getSourceColor;
      var value = attribute.value,
          size = attribute.size;

      var i = 0;
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = data[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var object = _step3.value;

          var color = getSourceColor(object);
          value[i + 0] = color[0];
          value[i + 1] = color[1];
          value[i + 2] = color[2];
          value[i + 3] = isNaN(color[3]) ? 255 : color[3];
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
  }, {
    key: 'calculateInstanceTargetColors',
    value: function calculateInstanceTargetColors(attribute) {
      var _props4 = this.props,
          data = _props4.data,
          getTargetColor = _props4.getTargetColor;
      var value = attribute.value,
          size = attribute.size;

      var i = 0;
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = data[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var object = _step4.value;

          var color = getTargetColor(object);
          value[i + 0] = color[0];
          value[i + 1] = color[1];
          value[i + 2] = color[2];
          value[i + 3] = isNaN(color[3]) ? 255 : color[3];
          i += size;
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

  return ArcLayer;
}(Layer);

export default ArcLayer;


ArcLayer.layerName = 'ArcLayer';
ArcLayer.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlLWxheWVycy9hcmMtbGF5ZXIvYXJjLWxheWVyLmpzIl0sIm5hbWVzIjpbIkNPT1JESU5BVEVfU1lTVEVNIiwiTGF5ZXIiLCJleHBlcmltZW50YWwiLCJmcDY0aWZ5IiwiZW5hYmxlNjRiaXRTdXBwb3J0IiwiR0wiLCJNb2RlbCIsIkdlb21ldHJ5IiwidnMiLCJ2czY0IiwiZnMiLCJERUZBVUxUX0NPTE9SIiwiZGVmYXVsdFByb3BzIiwic3Ryb2tlV2lkdGgiLCJmcDY0IiwiZ2V0U291cmNlUG9zaXRpb24iLCJ4Iiwic291cmNlUG9zaXRpb24iLCJnZXRUYXJnZXRQb3NpdGlvbiIsInRhcmdldFBvc2l0aW9uIiwiZ2V0U291cmNlQ29sb3IiLCJjb2xvciIsImdldFRhcmdldENvbG9yIiwiQXJjTGF5ZXIiLCJwcm9wcyIsIm1vZHVsZXMiLCJnbCIsImNvbnRleHQiLCJzZXRTdGF0ZSIsIm1vZGVsIiwiX2dldE1vZGVsIiwiYXR0cmlidXRlTWFuYWdlciIsInN0YXRlIiwiYWRkSW5zdGFuY2VkIiwiaW5zdGFuY2VQb3NpdGlvbnMiLCJzaXplIiwiYWNjZXNzb3IiLCJ1cGRhdGUiLCJjYWxjdWxhdGVJbnN0YW5jZVBvc2l0aW9ucyIsImluc3RhbmNlU291cmNlQ29sb3JzIiwidHlwZSIsIlVOU0lHTkVEX0JZVEUiLCJjYWxjdWxhdGVJbnN0YW5jZVNvdXJjZUNvbG9ycyIsImluc3RhbmNlVGFyZ2V0Q29sb3JzIiwiY2FsY3VsYXRlSW5zdGFuY2VUYXJnZXRDb2xvcnMiLCJvbGRQcm9wcyIsImNoYW5nZUZsYWdzIiwiaW52YWxpZGF0ZUFsbCIsImNvb3JkaW5hdGVTeXN0ZW0iLCJMTkdMQVQiLCJpbnN0YW5jZVBvc2l0aW9uczY0TG93IiwiY2FsY3VsYXRlSW5zdGFuY2VQb3NpdGlvbnM2NExvdyIsInJlbW92ZSIsInVwZGF0ZUF0dHJpYnV0ZSIsInVuaWZvcm1zIiwicmVuZGVyIiwiT2JqZWN0IiwiYXNzaWduIiwicG9zaXRpb25zIiwiTlVNX1NFR01FTlRTIiwiaSIsImNvbmNhdCIsImdldFNoYWRlcnMiLCJpZCIsImdlb21ldHJ5IiwiZHJhd01vZGUiLCJUUklBTkdMRV9TVFJJUCIsImF0dHJpYnV0ZXMiLCJGbG9hdDMyQXJyYXkiLCJpc0luc3RhbmNlZCIsInNoYWRlckNhY2hlIiwic2V0VW5pZm9ybXMiLCJudW1TZWdtZW50cyIsImF0dHJpYnV0ZSIsImRhdGEiLCJ2YWx1ZSIsIm9iamVjdCIsImlzTmFOIiwibGF5ZXJOYW1lIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsU0FBUUEsaUJBQVIsRUFBMkJDLEtBQTNCLEVBQWtDQyxZQUFsQyxRQUFxRCxZQUFyRDtJQUNPQyxPLEdBQStCRCxZLENBQS9CQyxPO0lBQVNDLGtCLEdBQXNCRixZLENBQXRCRSxrQjs7O0FBRWhCLFNBQVFDLEVBQVIsRUFBWUMsS0FBWixFQUFtQkMsUUFBbkIsUUFBa0MsU0FBbEM7O0FBRUEsT0FBT0MsRUFBUCxNQUFlLHlCQUFmO0FBQ0EsT0FBT0MsSUFBUCxNQUFpQiw0QkFBakI7QUFDQSxPQUFPQyxFQUFQLE1BQWUsMkJBQWY7O0FBRUEsSUFBTUMsZ0JBQWdCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsR0FBVixDQUF0Qjs7QUFFQSxJQUFNQyxlQUFlO0FBQ25CQyxlQUFhLENBRE07QUFFbkJDLFFBQU0sS0FGYTs7QUFJbkJDLHFCQUFtQjtBQUFBLFdBQUtDLEVBQUVDLGNBQVA7QUFBQSxHQUpBO0FBS25CQyxxQkFBbUI7QUFBQSxXQUFLRixFQUFFRyxjQUFQO0FBQUEsR0FMQTtBQU1uQkMsa0JBQWdCO0FBQUEsV0FBS0osRUFBRUssS0FBRixJQUFXVixhQUFoQjtBQUFBLEdBTkc7QUFPbkJXLGtCQUFnQjtBQUFBLFdBQUtOLEVBQUVLLEtBQUYsSUFB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QiIsImZpbGUiOiJhcmMtbGF5ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgLSAyMDE3IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IHtDT09SRElOQVRFX1NZU1RFTSwgTGF5ZXIsIGV4cGVyaW1lbnRhbH0gZnJvbSAnLi4vLi4vY29yZSc7XG5jb25zdCB7ZnA2NGlmeSwgZW5hYmxlNjRiaXRTdXBwb3J0fSA9IGV4cGVyaW1lbnRhbDtcblxuaW1wb3J0IHtHTCwgTW9kZWwsIEdlb21ldHJ5fSBmcm9tICdsdW1hLmdsJztcblxuaW1wb3J0IHZzIGZyb20gJy4vYXJjLWxheWVyLXZlcnRleC5nbHNsJztcbmltcG9ydCB2czY0IGZyb20gJy4vYXJjLWxheWVyLXZlcnRleC02NC5nbHNsJztcbmltcG9ydCBmcyBmcm9tICcuL2FyYy1sYXllci1mcmFnbWVudC5nbHNsJztcblxuY29uc3QgREVGQVVMVF9DT0xPUiA9IFswLCAwLCAwLCAyNTVdO1xuXG5jb25zdCBkZWZhdWx0UHJvcHMgPSB7XG4gIHN0cm9rZVdpZHRoOiAxLFxuICBmcDY0OiBmYWxzZSxcblxuICBnZXRTb3VyY2VQb3NpdGlvbjogeCA9PiB4LnNvdXJjZVBvc2l0aW9uLFxuICBnZXRUYXJnZXRQb3NpdGlvbjogeCA9PiB4LnRhcmdldFBvc2l0aW9uLFxuICBnZXRTb3VyY2VDb2xvcjogeCA9PiB4LmNvbG9yIHx8IERFRkFVTFRfQ09MT1IsXG4gIGdldFRhcmdldENvbG9yOiB4ID0+IHguY29sb3IgfHwgREVGQVVMVF9DT0xPUlxufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXJjTGF5ZXIgZXh0ZW5kcyBMYXllciB7XG4gIGdldFNoYWRlcnMoKSB7XG4gICAgcmV0dXJuIGVuYWJsZTY0Yml0U3VwcG9ydCh0aGlzLnByb3BzKSA/XG4gICAgICB7dnM6IHZzNjQsIGZzLCBtb2R1bGVzOiBbJ3Byb2plY3Q2NCcsICdwaWNraW5nJ119IDpcbiAgICAgIHt2cywgZnMsIG1vZHVsZXM6IFsncGlja2luZyddfTsgLy8gJ3Byb2plY3QnIG1vZHVsZSBhZGRlZCBieSBkZWZhdWx0LlxuICB9XG5cbiAgaW5pdGlhbGl6ZVN0YXRlKCkge1xuICAgIGNvbnN0IHtnbH0gPSB0aGlzLmNvbnRleHQ7XG4gICAgdGhpcy5zZXRTdGF0ZSh7bW9kZWw6IHRoaXMuX2dldE1vZGVsKGdsKX0pO1xuXG4gICAgY29uc3Qge2F0dHJpYnV0ZU1hbmFnZXJ9ID0gdGhpcy5zdGF0ZTtcblxuICAgIC8qIGVzbGludC1kaXNhYmxlIG1heC1sZW4gKi9cbiAgICBhdHRyaWJ1dGVNYW5hZ2VyLmFkZEluc3RhbmNlZCh7XG4gICAgICBpbnN0YW5jZVBvc2l0aW9uczoge3NpemU6IDQsIGFjY2Vzc29yOiBbJ2dldFNvdXJjZVBvc2l0aW9uJywgJ2dldFRhcmdldFBvc2l0aW9uJ10sIHVwZGF0ZTogdGhpcy5jYWxjdWxhdGVJbnN0YW5jZVBvc2l0aW9uc30sXG4gICAgICBpbnN0YW5jZVNvdXJjZUNvbG9yczoge3NpemU6IDQsIHR5cGU6IEdMLlVOU0lHTkVEX0JZVEUsIGFjY2Vzc29yOiAnZ2V0U291cmNlQ29sb3InLCB1cGRhdGU6IHRoaXMuY2FsY3VsYXRlSW5zdGFuY2VTb3VyY2VDb2xvcnN9LFxuICAgICAgaW5zdGFuY2VUYXJnZXRDb2xvcnM6IHtzaXplOiA0LCB0eXBlOiBHTC5VTlNJR05FRF9CWVRFLCBhY2Nlc3NvcjogJ2dldFRhcmdldENvbG9yJywgdXBkYXRlOiB0aGlzLmNhbGN1bGF0ZUluc3RhbmNlVGFyZ2V0Q29sb3JzfVxuICAgIH0pO1xuICAgIC8qIGVzbGludC1lbmFibGUgbWF4LWxlbiAqL1xuICB9XG5cbiAgdXBkYXRlQXR0cmlidXRlKHtwcm9wcywgb2xkUHJvcHMsIGNoYW5nZUZsYWdzfSkge1xuICAgIGlmIChwcm9wcy5mcDY0ICE9PSBvbGRQcm9wcy5mcDY0KSB7XG4gICAgICBjb25zdCB7YXR0cmlidXRlTWFuYWdlcn0gPSB0aGlzLnN0YXRlO1xuICAgICAgYXR0cmlidXRlTWFuYWdlci5pbnZhbGlkYXRlQWxsKCk7XG5cbiAgICAgIGlmIChwcm9wcy5mcDY0ICYmIHByb3BzLmNvb3JkaW5hdGVTeXN0ZW0gPT09IENPT1JESU5BVEVfU1lTVEVNLkxOR0xBVCkge1xuICAgICAgICBhdHRyaWJ1dGVNYW5hZ2VyLmFkZEluc3RhbmNlZCh7XG4gICAgICAgICAgaW5zdGFuY2VQb3NpdGlvbnM2NExvdzoge1xuICAgICAgICAgICAgc2l6ZTogNCxcbiAgICAgICAgICAgIGFjY2Vzc29yOiBbJ2dldFNvdXJjZVBvc2l0aW9uJywgJ2dldFRhcmdldFBvc2l0aW9uJ10sXG4gICAgICAgICAgICB1cGRhdGU6IHRoaXMuY2FsY3VsYXRlSW5zdGFuY2VQb3NpdGlvbnM2NExvd1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhdHRyaWJ1dGVNYW5hZ2VyLnJlbW92ZShbXG4gICAgICAgICAgJ2luc3RhbmNlUG9zaXRpb25zNjRMb3cnXG4gICAgICAgIF0pO1xuICAgICAgfVxuXG4gICAgfVxuICB9XG5cbiAgdXBkYXRlU3RhdGUoe3Byb3BzLCBvbGRQcm9wcywgY2hhbmdlRmxhZ3N9KSB7XG4gICAgc3VwZXIudXBkYXRlU3RhdGUoe3Byb3BzLCBvbGRQcm9wcywgY2hhbmdlRmxhZ3N9KTtcbiAgICAvLyBSZS1nZW5lcmF0ZSBtb2RlbCBpZiBnZW9tZXRyeSBjaGFuZ2VkXG4gICAgaWYgKHByb3BzLmZwNjQgIT09IG9sZFByb3BzLmZwNjQpIHtcbiAgICAgIGNvbnN0IHtnbH0gPSB0aGlzLmNvbnRleHQ7XG4gICAgICB0aGlzLnNldFN0YXRlKHttb2RlbDogdGhpcy5fZ2V0TW9kZWwoZ2wpfSk7XG4gICAgfVxuICAgIHRoaXMudXBkYXRlQXR0cmlidXRlKHtwcm9wcywgb2xkUHJvcHMsIGNoYW5nZUZsYWdzfSk7XG4gIH1cblxuICBkcmF3KHt1bmlmb3Jtc30pIHtcbiAgICBjb25zdCB7c3Ryb2tlV2lkdGh9ID0gdGhpcy5wcm9wcztcblxuICAgIHRoaXMuc3RhdGUubW9kZWwucmVuZGVyKE9iamVjdC5hc3NpZ24oe30sIHVuaWZvcm1zLCB7XG4gICAgICBzdHJva2VXaWR0aFxuICAgIH0pKTtcbiAgfVxuXG4gIF9nZXRNb2RlbChnbCkge1xuICAgIGxldCBwb3NpdGlvbnMgPSBbXTtcbiAgICBjb25zdCBOVU1fU0VHTUVOVFMgPSA1MDtcbiAgICAvKlxuICAgICAqICAoMCwgLTEpLS0tLS0tLS0tLS0tLV8oMSwgLTEpXG4gICAgICogICAgICAgfCAgICAgICAgICBfLC1cIiAgfFxuICAgICAqICAgICAgIG8gICAgICBfLC1cIiAgICAgIG9cbiAgICAgKiAgICAgICB8ICBfLC1cIiAgICAgICAgICB8XG4gICAgICogICAoMCwgMSlcIi0tLS0tLS0tLS0tLS0oMSwgMSlcbiAgICAgKi9cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IE5VTV9TRUdNRU5UUzsgaSsrKSB7XG4gICAgICBwb3NpdGlvbnMgPSBwb3NpdGlvbnMuY29uY2F0KFtpLCAtMSwgMCwgaSwgMSwgMF0pO1xuICAgIH1cblxuICAgIGNvbnN0IG1vZGVsID0gbmV3IE1vZGVsKGdsLCBPYmplY3QuYXNzaWduKHt9LCB0aGlzLmdldFNoYWRlcnMoKSwge1xuICAgICAgaWQ6IHRoaXMucHJvcHMuaWQsXG4gICAgICBnZW9tZXRyeTogbmV3IEdlb21ldHJ5KHtcbiAgICAgICAgZHJhd01vZGU6IEdMLlRSSUFOR0xFX1NUUklQLFxuICAgICAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICAgICAgcG9zaXRpb25zOiBuZXcgRmxvYXQzMkFycmF5KHBvc2l0aW9ucylcbiAgICAgICAgfVxuICAgICAgfSksXG4gICAgICBpc0luc3RhbmNlZDogdHJ1ZSxcbiAgICAgIHNoYWRlckNhY2hlOiB0aGlzLmNvbnRleHQuc2hhZGVyQ2FjaGVcbiAgICB9KSk7XG5cbiAgICBtb2RlbC5zZXRVbmlmb3Jtcyh7bnVtU2VnbWVudHM6IE5VTV9TRUdNRU5UU30pO1xuXG4gICAgcmV0dXJuIG1vZGVsO1xuICB9XG5cbiAgY2FsY3VsYXRlSW5zdGFuY2VQb3NpdGlvbnMoYXR0cmlidXRlKSB7XG4gICAgY29uc3Qge2RhdGEsIGdldFNvdXJjZVBvc2l0aW9uLCBnZXRUYXJnZXRQb3NpdGlvbn0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHt2YWx1ZSwgc2l6ZX0gPSBhdHRyaWJ1dGU7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAoY29uc3Qgb2JqZWN0IG9mIGRhdGEpIHtcbiAgICAgIGNvbnN0IHNvdXJjZVBvc2l0aW9uID0gZ2V0U291cmNlUG9zaXRpb24ob2JqZWN0KTtcbiAgICAgIGNvbnN0IHRhcmdldFBvc2l0aW9uID0gZ2V0VGFyZ2V0UG9zaXRpb24ob2JqZWN0KTtcbiAgICAgIHZhbHVlW2kgKyAwXSA9IHNvdXJjZVBvc2l0aW9uWzBdO1xuICAgICAgdmFsdWVbaSArIDFdID0gc291cmNlUG9zaXRpb25bMV07XG4gICAgICB2YWx1ZVtpICsgMl0gPSB0YXJnZXRQb3NpdGlvblswXTtcbiAgICAgIHZhbHVlW2kgKyAzXSA9IHRhcmdldFBvc2l0aW9uWzFdO1xuICAgICAgaSArPSBzaXplO1xuICAgIH1cbiAgfVxuXG4gIGNhbGN1bGF0ZUluc3RhbmNlUG9zaXRpb25zNjRMb3coYXR0cmlidXRlKSB7XG4gICAgY29uc3Qge2RhdGEsIGdldFNvdXJjZVBvc2l0aW9uLCBnZXRUYXJnZXRQb3NpdGlvbn0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHt2YWx1ZSwgc2l6ZX0gPSBhdHRyaWJ1dGU7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAoY29uc3Qgb2JqZWN0IG9mIGRhdGEpIHtcbiAgICAgIGNvbnN0IHNvdXJjZVBvc2l0aW9uID0gZ2V0U291cmNlUG9zaXRpb24ob2JqZWN0KTtcbiAgICAgIGNvbnN0IHRhcmdldFBvc2l0aW9uID0gZ2V0VGFyZ2V0UG9zaXRpb24ob2JqZWN0KTtcbiAgICAgIHZhbHVlW2kgKyAwXSA9IGZwNjRpZnkoc291cmNlUG9zaXRpb25bMF0pWzFdO1xuICAgICAgdmFsdWVbaSArIDFdID0gZnA2NGlmeShzb3VyY2VQb3NpdGlvblsxXSlbMV07XG4gICAgICB2YWx1ZVtpICsgMl0gPSBmcDY0aWZ5KHRhcmdldFBvc2l0aW9uWzBdKVsxXTtcbiAgICAgIHZhbHVlW2kgKyAzXSA9IGZwNjRpZnkodGFyZ2V0UG9zaXRpb25bMV0pWzFdO1xuICAgICAgaSArPSBzaXplO1xuICAgIH1cbiAgfVxuXG4gIGNhbGN1bGF0ZUluc3RhbmNlU291cmNlQ29sb3JzKGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHtkYXRhLCBnZXRTb3VyY2VDb2xvcn0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHt2YWx1ZSwgc2l6ZX0gPSBhdHRyaWJ1dGU7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAoY29uc3Qgb2JqZWN0IG9mIGRhdGEpIHtcbiAgICAgIGNvbnN0IGNvbG9yID0gZ2V0U291cmNlQ29sb3Iob2JqZWN0KTtcbiAgICAgIHZhbHVlW2kgKyAwXSA9IGNvbG9yWzBdO1xuICAgICAgdmFsdWVbaSArIDFdID0gY29sb3JbMV07XG4gICAgICB2YWx1ZVtpICsgMl0gPSBjb2xvclsyXTtcbiAgICAgIHZhbHVlW2kgKyAzXSA9IGlzTmFOKGNvbG9yWzNdKSA/IDI1NSA6IGNvbG9yWzNdO1xuICAgICAgaSArPSBzaXplO1xuICAgIH1cbiAgfVxuXG4gIGNhbGN1bGF0ZUluc3RhbmNlVGFyZ2V0Q29sb3JzKGF0dHJpYnV0ZSkge1xuICAgIGNvbnN0IHtkYXRhLCBnZXRUYXJnZXRDb2xvcn0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHt2YWx1ZSwgc2l6ZX0gPSBhdHRyaWJ1dGU7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAoY29uc3Qgb2JqZWN0IG9mIGRhdGEpIHtcbiAgICAgIGNvbnN0IGNvbG9yID0gZ2V0VGFyZ2V0Q29sb3Iob2JqZWN0KTtcbiAgICAgIHZhbHVlW2kgKyAwXSA9IGNvbG9yWzBdO1xuICAgICAgdmFsdWVbaSArIDFdID0gY29sb3JbMV07XG4gICAgICB2YWx1ZVtpICsgMl0gPSBjb2xvclsyXTtcbiAgICAgIHZhbHVlW2kgKyAzXSA9IGlzTmFOKGNvbG9yWzNdKSA/IDI1NSA6IGNvbG9yWzNdO1xuICAgICAgaSArPSBzaXplO1xuICAgIH1cbiAgfVxufVxuXG5BcmNMYXllci5sYXllck5hbWUgPSAnQXJjTGF5ZXInO1xuQXJjTGF5ZXIuZGVmYXVsdFByb3BzID0gZGVmYXVsdFByb3BzO1xuIl19