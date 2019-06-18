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

import vs from './line-layer-vertex.glsl';
import vs64 from './line-layer-vertex-64.glsl';
import fs from './line-layer-fragment.glsl';

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
  getColor: function getColor(x) {
    return x.color || DEFAULT_COLOR;
  }
};

var LineLayer = function (_Layer) {
  _inherits(LineLayer, _Layer);

  function LineLayer() {
    _classCallCheck(this, LineLayer);

    return _possibleConstructorReturn(this, (LineLayer.__proto__ || Object.getPrototypeOf(LineLayer)).apply(this, arguments));
  }

  _createClass(LineLayer, [{
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
        instanceSourcePositions: { size: 3, accessor: 'getSourcePosition', update: this.calculateInstanceSourcePositions },
        instanceTargetPositions: { size: 3, accessor: 'getTargetPosition', update: this.calculateInstanceTargetPositions },
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
            instanceSourceTargetPositions64xyLow: {
              size: 4,
              accessor: ['getSourcePosition', 'getTargetPosition'],
              update: this.calculateInstanceSourceTargetPositions64xyLow
            }
          });
        } else {
          attributeManager.remove(['instanceSourceTargetPositions64xyLow']);
        }
      }
    }
  }, {
    key: 'updateState',
    value: function updateState(_ref2) {
      var props = _ref2.props,
          oldProps = _ref2.oldProps,
          changeFlags = _ref2.changeFlags;

      _get(LineLayer.prototype.__proto__ || Object.getPrototypeOf(LineLayer.prototype), 'updateState', this).call(this, { props: props, oldProps: oldProps, changeFlags: changeFlags });

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
      /*
       *  (0, -1)-------------_(1, -1)
       *       |          _,-"  |
       *       o      _,-"      o
       *       |  _,-"          |
       *   (0, 1)"-------------(1, 1)
       */
      var positions = [0, -1, 0, 0, 1, 0, 1, -1, 0, 1, 1, 0];

      return new Model(gl, Object.assign({}, this.getShaders(), {
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
    }
  }, {
    key: 'calculateInstanceSourcePositions',
    value: function calculateInstanceSourcePositions(attribute) {
      var _props = this.props,
          data = _props.data,
          getSourcePosition = _props.getSourcePosition;
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
          value[i + 0] = sourcePosition[0];
          value[i + 1] = sourcePosition[1];
          value[i + 2] = isNaN(sourcePosition[2]) ? 0 : sourcePosition[2];
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
    key: 'calculateInstanceTargetPositions',
    value: function calculateInstanceTargetPositions(attribute) {
      var _props2 = this.props,
          data = _props2.data,
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

          var targetPosition = getTargetPosition(object);
          value[i + 0] = targetPosition[0];
          value[i + 1] = targetPosition[1];
          value[i + 2] = isNaN(targetPosition[2]) ? 0 : targetPosition[2];
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
    key: 'calculateInstanceSourceTargetPositions64xyLow',
    value: function calculateInstanceSourceTargetPositions64xyLow(attribute) {
      var _props3 = this.props,
          data = _props3.data,
          getSourcePosition = _props3.getSourcePosition,
          getTargetPosition = _props3.getTargetPosition;
      var value = attribute.value,
          size = attribute.size;

      var i = 0;
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = data[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var object = _step3.value;

          var sourcePosition = getSourcePosition(object);
          var targetPosition = getTargetPosition(object);
          value[i + 0] = fp64ify(sourcePosition[0])[1];
          value[i + 1] = fp64ify(sourcePosition[1])[1];
          value[i + 2] = fp64ify(targetPosition[0])[1];
          value[i + 3] = fp64ify(targetPosition[1])[1];
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
    key: 'calculateInstanceColors',
    value: function calculateInstanceColors(attribute) {
      var _props4 = this.props,
          data = _props4.data,
          getColor = _props4.getColor;
      var value = attribute.value,
          size = attribute.size;

      var i = 0;
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = data[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var object = _step4.value;

          var color = getColor(object);
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

  return LineLayer;
}(Layer);

export default LineLayer;


LineLayer.layerName = 'LineLayer';
LineLayer.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlLWxheWVycy9saW5lLWxheWVyL2xpbmUtbGF5ZXIuanMiXSwibmFtZXMiOlsiQ09PUkRJTkFURV9TWVNURU0iLCJMYXllciIsImV4cGVyaW1lbnRhbCIsImZwNjRpZnkiLCJlbmFibGU2NGJpdFN1cHBvcnQiLCJHTCIsIk1vZGVsIiwiR2VvbWV0cnkiLCJ2cyIsInZzNjQiLCJmcyIsIkRFRkFVTFRfQ09MT1IiLCJkZWZhdWx0UHJvcHMiLCJzdHJva2VXaWR0aCIsImZwNjQiLCJnZXRTb3VyY2VQb3NpdGlvbiIsIngiLCJzb3VyY2VQb3NpdGlvbiIsImdldFRhcmdldFBvc2l0aW9uIiwidGFyZ2V0UG9zaXRpb24iLCJnZXRDb2xvciIsImNvbG9yIiwiTGluZUxheWVyIiwicHJvcHMiLCJtb2R1bGVzIiwiZ2wiLCJjb250ZXh0Iiwic2V0U3RhdGUiLCJtb2RlbCIsIl9nZXRNb2RlbCIsImF0dHJpYnV0ZU1hbmFnZXIiLCJzdGF0ZSIsImFkZEluc3RhbmNlZCIsImluc3RhbmNlU291cmNlUG9zaXRpb25zIiwic2l6ZSIsImFjY2Vzc29yIiwidXBkYXRlIiwiY2FsY3VsYXRlSW5zdGFuY2VTb3VyY2VQb3NpdGlvbnMiLCJpbnN0YW5jZVRhcmdldFBvc2l0aW9ucyIsImNhbGN1bGF0ZUluc3RhbmNlVGFyZ2V0UG9zaXRpb25zIiwiaW5zdGFuY2VDb2xvcnMiLCJ0eXBlIiwiVU5TSUdORURfQllURSIsImNhbGN1bGF0ZUluc3RhbmNlQ29sb3JzIiwib2xkUHJvcHMiLCJjaGFuZ2VGbGFncyIsImludmFsaWRhdGVBbGwiLCJjb29yZGluYXRlU3lzdGVtIiwiTE5HTEFUIiwiaW5zdGFuY2VTb3VyY2VUYXJnZXRQb3NpdGlvbnM2NHh5TG93IiwiY2FsY3VsYXRlSW5zdGFuY2VTb3VyY2VUYXJnZXRQb3NpdGlvbnM2NHh5TG93IiwicmVtb3ZlIiwidXBkYXRlQXR0cmlidXRlIiwidW5pZm9ybXMiLCJyZW5kZXIiLCJPYmplY3QiLCJhc3NpZ24iLCJwb3NpdGlvbnMiLCJnZXRTaGFkZXJzIiwiaWQiLCJnZW9tZXRyeSIsImRyYXdNb2RlIiwiVFJJQU5HTEVfU1RSSVAiLCJhdHRyaWJ1dGVzIiwiRmxvYXQzMkFycmF5IiwiaXNJbnN0YW5jZWQiLCJzaGFkZXJDYWNoZSIsImF0dHJpYnV0ZSIsImRhdGEiLCJ2YWx1ZSIsImkiLCJvYmplY3QiLCJpc05hTiIsImxheWVyTmFtZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFNBQVFBLGlCQUFSLEVBQTJCQyxLQUEzQixFQUFrQ0MsWUFBbEMsUUFBcUQsWUFBckQ7SUFDT0MsTyxHQUErQkQsWSxDQUEvQkMsTztJQUFTQyxrQixHQUFzQkYsWSxDQUF0QkUsa0I7O0FBQ2hCLFNBQVFDLEVBQVIsRUFBWUMsS0FBWixFQUFtQkMsUUFBbkIsUUFBa0MsU0FBbEM7O0FBRUEsT0FBT0MsRUFBUCxNQUFlLDBCQUFmO0FBQ0EsT0FBT0MsSUFBUCxNQUFpQiw2QkFBakI7QUFDQSxPQUFPQyxFQUFQLE1BQWUsNEJBQWY7O0FBRUEsSUFBTUMsZ0JBQWdCLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsR0FBVixDQUF0Qjs7QUFFQSxJQUFNQyxlQUFlO0FBQ25CQyxlQUFhLENBRE07QUFFbkJDLFFBQU0sS0FGYTs7QUFJbkJDLHFCQUFtQjtBQUFBLFdBQUtDLEVBQUVDLGNBQVA7QUFBQSxHQUpBO0FBS25CQyxxQkFBbUI7QUFBQSxXQUFLRixFQUFFRyxjQUFQO0FBQUEsR0FMQTtBQU1uQkMsWUFBVTtBQUFBLFdBQUtKLEVBQUVLLEtBQUYsSUFBV1YsYUFBaEI7QUFBQTtBQU5TLENBQXJCOztJQVNxQlcsUzs7Ozs7Ozs7Ozs7aUNBQ047QUFDWCxhQUFPbEIsbUJBQW1CLEtBQUttQixLQUF4QixJQUNMLEVBQUNmLElBQUlD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QUFBQTtBQUlqQyw4QkFBcUJGLElBQXJCLG1JQUEyQjtBQUFBLGNBQWhCRyxNQUFnQjs7QUFDekIsY0FBTWxELFFBQVFELFNBQVNtRCxNQUFULENBQWQ7QUFDQUYsZ0JBQU1DLElBQUksQ0FBVixJQUFlakQsTUFBTSxDQUFOLENBQWY7QUFDQWdELGdCQUFNQyxJQUFJLENBQVYsSUFBZWpELE1BQU0sQ0FBTixDQUFmO0FBQ0FnRCxnQkFBTUMsSUFBSSxDQUFWLElBQWVqRCxNQUFNLENBQU4sQ0FBZjtBQUNBZ0QsZ0JBQU1DLElBQUksQ0FBVixJQUFlRSxNQUFNbkQsTUFBTSxDQUFOLENBQU4sSUFBa0IsR0FBbEIsR0FBd0JBLE1BQU0sQ0FBTixDQUF2QztBQUNBaUQsZUFBS3BDLElBQUw7QUFDRDtBQVhnQztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBWWxDOzs7O0VBeklvQ2pDLEs7O2VBQWxCcUIsUzs7O0FBNElyQkEsVUFBVW1ELFNBQVYsR0FBc0IsV0FBdEI7QUFDQW5ELFVBQVVWLFlBQVYsR0FBeUJBLFlBQXpCIiwiZmlsZSI6ImxpbmUtbGF5ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgLSAyMDE3IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IHtDT09SRElOQVRFX1NZU1RFTSwgTGF5ZXIsIGV4cGVyaW1lbnRhbH0gZnJvbSAnLi4vLi4vY29yZSc7XG5jb25zdCB7ZnA2NGlmeSwgZW5hYmxlNjRiaXRTdXBwb3J0fSA9IGV4cGVyaW1lbnRhbDtcbmltcG9ydCB7R0wsIE1vZGVsLCBHZW9tZXRyeX0gZnJvbSAnbHVtYS5nbCc7XG5cbmltcG9ydCB2cyBmcm9tICcuL2xpbmUtbGF5ZXItdmVydGV4Lmdsc2wnO1xuaW1wb3J0IHZzNjQgZnJvbSAnLi9saW5lLWxheWVyLXZlcnRleC02NC5nbHNsJztcbmltcG9ydCBmcyBmcm9tICcuL2xpbmUtbGF5ZXItZnJhZ21lbnQuZ2xzbCc7XG5cbmNvbnN0IERFRkFVTFRfQ09MT1IgPSBbMCwgMCwgMCwgMjU1XTtcblxuY29uc3QgZGVmYXVsdFByb3BzID0ge1xuICBzdHJva2VXaWR0aDogMSxcbiAgZnA2NDogZmFsc2UsXG5cbiAgZ2V0U291cmNlUG9zaXRpb246IHggPT4geC5zb3VyY2VQb3NpdGlvbixcbiAgZ2V0VGFyZ2V0UG9zaXRpb246IHggPT4geC50YXJnZXRQb3NpdGlvbixcbiAgZ2V0Q29sb3I6IHggPT4geC5jb2xvciB8fCBERUZBVUxUX0NPTE9SXG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBMaW5lTGF5ZXIgZXh0ZW5kcyBMYXllciB7XG4gIGdldFNoYWRlcnMoKSB7XG4gICAgcmV0dXJuIGVuYWJsZTY0Yml0U3VwcG9ydCh0aGlzLnByb3BzKSA/XG4gICAgICB7dnM6IHZzNjQsIGZzLCBtb2R1bGVzOiBbJ3Byb2plY3Q2NCcsICdwaWNraW5nJ119IDpcbiAgICAgIHt2cywgZnMsIG1vZHVsZXM6IFsncGlja2luZyddfTsgLy8gJ3Byb2plY3QnIG1vZHVsZSBhZGRlZCBieSBkZWZhdWx0LlxuICB9XG5cbiAgaW5pdGlhbGl6ZVN0YXRlKCkge1xuICAgIGNvbnN0IHtnbH0gPSB0aGlzLmNvbnRleHQ7XG4gICAgdGhpcy5zZXRTdGF0ZSh7bW9kZWw6IHRoaXMuX2dldE1vZGVsKGdsKX0pO1xuXG4gICAgY29uc3Qge2F0dHJpYnV0ZU1hbmFnZXJ9ID0gdGhpcy5zdGF0ZTtcblxuICAgIC8qIGVzbGludC1kaXNhYmxlIG1heC1sZW4gKi9cbiAgICBhdHRyaWJ1dGVNYW5hZ2VyLmFkZEluc3RhbmNlZCh7XG4gICAgICBpbnN0YW5jZVNvdXJjZVBvc2l0aW9uczoge3NpemU6IDMsIGFjY2Vzc29yOiAnZ2V0U291cmNlUG9zaXRpb24nLCB1cGRhdGU6IHRoaXMuY2FsY3VsYXRlSW5zdGFuY2VTb3VyY2VQb3NpdGlvbnN9LFxuICAgICAgaW5zdGFuY2VUYXJnZXRQb3NpdGlvbnM6IHtzaXplOiAzLCBhY2Nlc3NvcjogJ2dldFRhcmdldFBvc2l0aW9uJywgdXBkYXRlOiB0aGlzLmNhbGN1bGF0ZUluc3RhbmNlVGFyZ2V0UG9zaXRpb25zfSxcbiAgICAgIGluc3RhbmNlQ29sb3JzOiB7c2l6ZTogNCwgdHlwZTogR0wuVU5TSUdORURfQllURSwgYWNjZXNzb3I6ICdnZXRDb2xvcicsIHVwZGF0ZTogdGhpcy5jYWxjdWxhdGVJbnN0YW5jZUNvbG9yc31cbiAgICB9KTtcbiAgICAvKiBlc2xpbnQtZW5hYmxlIG1heC1sZW4gKi9cbiAgfVxuXG4gIHVwZGF0ZUF0dHJpYnV0ZSh7cHJvcHMsIG9sZFByb3BzLCBjaGFuZ2VGbGFnc30pIHtcbiAgICBpZiAocHJvcHMuZnA2NCAhPT0gb2xkUHJvcHMuZnA2NCkge1xuICAgICAgY29uc3Qge2F0dHJpYnV0ZU1hbmFnZXJ9ID0gdGhpcy5zdGF0ZTtcbiAgICAgIGF0dHJpYnV0ZU1hbmFnZXIuaW52YWxpZGF0ZUFsbCgpO1xuXG4gICAgICBpZiAocHJvcHMuZnA2NCAmJiBwcm9wcy5jb29yZGluYXRlU3lzdGVtID09PSBDT09SRElOQVRFX1NZU1RFTS5MTkdMQVQpIHtcbiAgICAgICAgYXR0cmlidXRlTWFuYWdlci5hZGRJbnN0YW5jZWQoe1xuICAgICAgICAgIGluc3RhbmNlU291cmNlVGFyZ2V0UG9zaXRpb25zNjR4eUxvdzoge1xuICAgICAgICAgICAgc2l6ZTogNCxcbiAgICAgICAgICAgIGFjY2Vzc29yOiBbJ2dldFNvdXJjZVBvc2l0aW9uJywgJ2dldFRhcmdldFBvc2l0aW9uJ10sXG4gICAgICAgICAgICB1cGRhdGU6IHRoaXMuY2FsY3VsYXRlSW5zdGFuY2VTb3VyY2VUYXJnZXRQb3NpdGlvbnM2NHh5TG93XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGF0dHJpYnV0ZU1hbmFnZXIucmVtb3ZlKFtcbiAgICAgICAgICAnaW5zdGFuY2VTb3VyY2VUYXJnZXRQb3NpdGlvbnM2NHh5TG93J1xuICAgICAgICBdKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB1cGRhdGVTdGF0ZSh7cHJvcHMsIG9sZFByb3BzLCBjaGFuZ2VGbGFnc30pIHtcbiAgICBzdXBlci51cGRhdGVTdGF0ZSh7cHJvcHMsIG9sZFByb3BzLCBjaGFuZ2VGbGFnc30pO1xuXG4gICAgaWYgKHByb3BzLmZwNjQgIT09IG9sZFByb3BzLmZwNjQpIHtcbiAgICAgIGNvbnN0IHtnbH0gPSB0aGlzLmNvbnRleHQ7XG4gICAgICB0aGlzLnNldFN0YXRlKHttb2RlbDogdGhpcy5fZ2V0TW9kZWwoZ2wpfSk7XG4gICAgfVxuICAgIHRoaXMudXBkYXRlQXR0cmlidXRlKHtwcm9wcywgb2xkUHJvcHMsIGNoYW5nZUZsYWdzfSk7XG4gIH1cblxuICBkcmF3KHt1bmlmb3Jtc30pIHtcbiAgICBjb25zdCB7c3Ryb2tlV2lkdGh9ID0gdGhpcy5wcm9wcztcblxuICAgIHRoaXMuc3RhdGUubW9kZWwucmVuZGVyKE9iamVjdC5hc3NpZ24oe30sIHVuaWZvcm1zLCB7XG4gICAgICBzdHJva2VXaWR0aFxuICAgIH0pKTtcbiAgfVxuXG4gIF9nZXRNb2RlbChnbCkge1xuICAgIC8qXG4gICAgICogICgwLCAtMSktLS0tLS0tLS0tLS0tXygxLCAtMSlcbiAgICAgKiAgICAgICB8ICAgICAgICAgIF8sLVwiICB8XG4gICAgICogICAgICAgbyAgICAgIF8sLVwiICAgICAgb1xuICAgICAqICAgICAgIHwgIF8sLVwiICAgICAgICAgIHxcbiAgICAgKiAgICgwLCAxKVwiLS0tLS0tLS0tLS0tLSgxLCAxKVxuICAgICAqL1xuICAgIGNvbnN0IHBvc2l0aW9ucyA9IFswLCAtMSwgMCwgMCwgMSwgMCwgMSwgLTEsIDAsIDEsIDEsIDBdO1xuXG4gICAgcmV0dXJuIG5ldyBNb2RlbChnbCwgT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5nZXRTaGFkZXJzKCksIHtcbiAgICAgIGlkOiB0aGlzLnByb3BzLmlkLFxuICAgICAgZ2VvbWV0cnk6IG5ldyBHZW9tZXRyeSh7XG4gICAgICAgIGRyYXdNb2RlOiBHTC5UUklBTkdMRV9TVFJJUCxcbiAgICAgICAgYXR0cmlidXRlczoge1xuICAgICAgICAgIHBvc2l0aW9uczogbmV3IEZsb2F0MzJBcnJheShwb3NpdGlvbnMpXG4gICAgICAgIH1cbiAgICAgIH0pLFxuICAgICAgaXNJbnN0YW5jZWQ6IHRydWUsXG4gICAgICBzaGFkZXJDYWNoZTogdGhpcy5jb250ZXh0LnNoYWRlckNhY2hlXG4gICAgfSkpO1xuICB9XG5cbiAgY2FsY3VsYXRlSW5zdGFuY2VTb3VyY2VQb3NpdGlvbnMoYXR0cmlidXRlKSB7XG4gICAgY29uc3Qge2RhdGEsIGdldFNvdXJjZVBvc2l0aW9ufSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge3ZhbHVlLCBzaXplfSA9IGF0dHJpYnV0ZTtcbiAgICBsZXQgaSA9IDA7XG4gICAgZm9yIChjb25zdCBvYmplY3Qgb2YgZGF0YSkge1xuICAgICAgY29uc3Qgc291cmNlUG9zaXRpb24gPSBnZXRTb3VyY2VQb3NpdGlvbihvYmplY3QpO1xuICAgICAgdmFsdWVbaSArIDBdID0gc291cmNlUG9zaXRpb25bMF07XG4gICAgICB2YWx1ZVtpICsgMV0gPSBzb3VyY2VQb3NpdGlvblsxXTtcbiAgICAgIHZhbHVlW2kgKyAyXSA9IGlzTmFOKHNvdXJjZVBvc2l0aW9uWzJdKSA/IDAgOiBzb3VyY2VQb3NpdGlvblsyXTtcbiAgICAgIGkgKz0gc2l6ZTtcbiAgICB9XG4gIH1cblxuICBjYWxjdWxhdGVJbnN0YW5jZVRhcmdldFBvc2l0aW9ucyhhdHRyaWJ1dGUpIHtcbiAgICBjb25zdCB7ZGF0YSwgZ2V0VGFyZ2V0UG9zaXRpb259ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7dmFsdWUsIHNpemV9ID0gYXR0cmlidXRlO1xuICAgIGxldCBpID0gMDtcbiAgICBmb3IgKGNvbnN0IG9iamVjdCBvZiBkYXRhKSB7XG4gICAgICBjb25zdCB0YXJnZXRQb3NpdGlvbiA9IGdldFRhcmdldFBvc2l0aW9uKG9iamVjdCk7XG4gICAgICB2YWx1ZVtpICsgMF0gPSB0YXJnZXRQb3NpdGlvblswXTtcbiAgICAgIHZhbHVlW2kgKyAxXSA9IHRhcmdldFBvc2l0aW9uWzFdO1xuICAgICAgdmFsdWVbaSArIDJdID0gaXNOYU4odGFyZ2V0UG9zaXRpb25bMl0pID8gMCA6IHRhcmdldFBvc2l0aW9uWzJdO1xuICAgICAgaSArPSBzaXplO1xuICAgIH1cbiAgfVxuXG4gIGNhbGN1bGF0ZUluc3RhbmNlU291cmNlVGFyZ2V0UG9zaXRpb25zNjR4eUxvdyhhdHRyaWJ1dGUpIHtcbiAgICBjb25zdCB7ZGF0YSwgZ2V0U291cmNlUG9zaXRpb24sIGdldFRhcmdldFBvc2l0aW9ufSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge3ZhbHVlLCBzaXplfSA9IGF0dHJpYnV0ZTtcbiAgICBsZXQgaSA9IDA7XG4gICAgZm9yIChjb25zdCBvYmplY3Qgb2YgZGF0YSkge1xuICAgICAgY29uc3Qgc291cmNlUG9zaXRpb24gPSBnZXRTb3VyY2VQb3NpdGlvbihvYmplY3QpO1xuICAgICAgY29uc3QgdGFyZ2V0UG9zaXRpb24gPSBnZXRUYXJnZXRQb3NpdGlvbihvYmplY3QpO1xuICAgICAgdmFsdWVbaSArIDBdID0gZnA2NGlmeShzb3VyY2VQb3NpdGlvblswXSlbMV07XG4gICAgICB2YWx1ZVtpICsgMV0gPSBmcDY0aWZ5KHNvdXJjZVBvc2l0aW9uWzFdKVsxXTtcbiAgICAgIHZhbHVlW2kgKyAyXSA9IGZwNjRpZnkodGFyZ2V0UG9zaXRpb25bMF0pWzFdO1xuICAgICAgdmFsdWVbaSArIDNdID0gZnA2NGlmeSh0YXJnZXRQb3NpdGlvblsxXSlbMV07XG4gICAgICBpICs9IHNpemU7XG4gICAgfVxuICB9XG5cbiAgY2FsY3VsYXRlSW5zdGFuY2VDb2xvcnMoYXR0cmlidXRlKSB7XG4gICAgY29uc3Qge2RhdGEsIGdldENvbG9yfSA9IHRoaXMucHJvcHM7XG4gICAgY29uc3Qge3ZhbHVlLCBzaXplfSA9IGF0dHJpYnV0ZTtcbiAgICBsZXQgaSA9IDA7XG4gICAgZm9yIChjb25zdCBvYmplY3Qgb2YgZGF0YSkge1xuICAgICAgY29uc3QgY29sb3IgPSBnZXRDb2xvcihvYmplY3QpO1xuICAgICAgdmFsdWVbaSArIDBdID0gY29sb3JbMF07XG4gICAgICB2YWx1ZVtpICsgMV0gPSBjb2xvclsxXTtcbiAgICAgIHZhbHVlW2kgKyAyXSA9IGNvbG9yWzJdO1xuICAgICAgdmFsdWVbaSArIDNdID0gaXNOYU4oY29sb3JbM10pID8gMjU1IDogY29sb3JbM107XG4gICAgICBpICs9IHNpemU7XG4gICAgfVxuICB9XG59XG5cbkxpbmVMYXllci5sYXllck5hbWUgPSAnTGluZUxheWVyJztcbkxpbmVMYXllci5kZWZhdWx0UHJvcHMgPSBkZWZhdWx0UHJvcHM7XG4iXX0=