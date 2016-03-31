'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _layer = require('../../layer');

var _layer2 = _interopRequireDefault(_layer);

var _luma = require('luma.gl');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } // Copyright (c) 2015 Uber Technologies, Inc.
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

var glslify = require('glslify');

var ATTRIBUTES = {
  positions: { size: 3, '0': 'x', '1': 'y', '2': 'unused' },
  colors: { size: 3, '0': 'red', '1': 'green', '2': 'blue' }
};

var ScatterplotLayer = function (_Layer) {
  _inherits(ScatterplotLayer, _Layer);

  _createClass(ScatterplotLayer, null, [{
    key: 'attributes',
    get: function get() {
      return ATTRIBUTES;
    }

    /**
     * @classdesc
     * ScatterplotLayer
     *
     * @class
     * @param {object} props
     * @param {number} props.radius - point radius
     */

  }]);

  function ScatterplotLayer(props) {
    _classCallCheck(this, ScatterplotLayer);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(ScatterplotLayer).call(this, props));
  }

  _createClass(ScatterplotLayer, [{
    key: 'initializeState',
    value: function initializeState() {
      var gl = this.state.gl;
      var attributeManager = this.state.attributeManager;


      this.setState({
        model: this.getModel(gl)
      });

      attributeManager.addInstanced(ATTRIBUTES, {
        positions: { update: this.calculatePositions },
        colors: { update: this.calculateColors }
      });
    }
  }, {
    key: 'didMount',
    value: function didMount() {
      this.updateUniforms();
    }
  }, {
    key: 'willReceiveProps',
    value: function willReceiveProps(oldProps, newProps) {
      _get(Object.getPrototypeOf(ScatterplotLayer.prototype), 'willReceiveProps', this).call(this, oldProps, newProps);
      this.updateUniforms();
    }
  }, {
    key: 'getModel',
    value: function getModel(gl) {
      var NUM_SEGMENTS = 16;
      var PI2 = Math.PI * 2;

      var vertices = [];
      for (var i = 0; i < NUM_SEGMENTS; i++) {
        vertices = [].concat(_toConsumableArray(vertices), [Math.cos(PI2 * i / NUM_SEGMENTS), Math.sin(PI2 * i / NUM_SEGMENTS), 0]);
      }

      return new _luma.Model({
        program: new _luma.Program(gl, {
          vs: glslify('./scatterplot-layer-vertex.glsl'),
          fs: glslify('./scatterplot-layer-fragment.glsl'),
          id: 'scatterplot'
        }),
        geometry: new _luma.Geometry({
          drawMode: 'TRIANGLE_FAN',
          vertices: new Float32Array(vertices)
        }),
        instanced: true
      });
    }
  }, {
    key: 'updateUniforms',
    value: function updateUniforms() {
      this.calculateRadius();
      var radius = this.state.radius;

      this.setUniforms({
        radius: radius
      });
    }
  }, {
    key: 'calculatePositions',
    value: function calculatePositions(attribute) {
      var data = this.props.data;
      var value = attribute.value;
      var size = attribute.size;

      var i = 0;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = data[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var point = _step.value;

          value[i + 0] = point.position.x;
          value[i + 1] = point.position.y;
          value[i + 2] = point.position.z;
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
    key: 'calculateColors',
    value: function calculateColors(attribute) {
      var data = this.props.data;
      var value = attribute.value;
      var size = attribute.size;

      var i = 0;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = data[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var point = _step2.value;

          value[i + 0] = point.color[0];
          value[i + 1] = point.color[1];
          value[i + 2] = point.color[2];
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
    key: 'calculateRadius',
    value: function calculateRadius() {
      // use radius if specified
      if (this.props.radius) {
        this.state.radius = this.props.radius;
        return;
      }

      var pixel0 = this.project({ lon: -122, lat: 37.5 });
      var pixel1 = this.project({ lon: -122, lat: 37.5002 });

      var space0 = this.screenToSpace(pixel0);
      var space1 = this.screenToSpace(pixel1);

      var dx = space0.x - space1.x;
      var dy = space0.y - space1.y;

      this.state.radius = Math.max(Math.sqrt(dx * dx + dy * dy), 2.0);
    }
  }]);

  return ScatterplotLayer;
}(_layer2.default);

exports.default = ScatterplotLayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYXllcnMvc2NhdHRlcnBsb3QtbGF5ZXIvc2NhdHRlcnBsb3QtbGF5ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFvQkE7Ozs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQ0EsSUFBTSxVQUFVLFFBQVEsU0FBUixDQUFWOztBQUVOLElBQU0sYUFBYTtBQUNqQixhQUFXLEVBQUMsTUFBTSxDQUFOLEVBQVMsS0FBSyxHQUFMLEVBQVUsS0FBSyxHQUFMLEVBQVUsS0FBSyxRQUFMLEVBQXpDO0FBQ0EsVUFBUSxFQUFDLE1BQU0sQ0FBTixFQUFTLEtBQUssS0FBTCxFQUFZLEtBQUssT0FBTCxFQUFjLEtBQUssTUFBTCxFQUE1QztDQUZJOztJQUtlOzs7Ozt3QkFFSztBQUN0QixhQUFPLFVBQVAsQ0FEc0I7Ozs7Ozs7Ozs7Ozs7O0FBWXhCLFdBZG1CLGdCQWNuQixDQUFZLEtBQVosRUFBbUI7MEJBZEEsa0JBY0E7O2tFQWRBLDZCQWVYLFFBRFc7R0FBbkI7O2VBZG1COztzQ0FrQkQ7VUFDVCxLQUFNLEtBQUssS0FBTCxDQUFOLEdBRFM7VUFFVCxtQkFBb0IsS0FBSyxLQUFMLENBQXBCLGlCQUZTOzs7QUFJaEIsV0FBSyxRQUFMLENBQWM7QUFDWixlQUFPLEtBQUssUUFBTCxDQUFjLEVBQWQsQ0FBUDtPQURGLEVBSmdCOztBQVFoQix1QkFBaUIsWUFBakIsQ0FBOEIsVUFBOUIsRUFBMEM7QUFDeEMsbUJBQVcsRUFBQyxRQUFRLEtBQUssa0JBQUwsRUFBcEI7QUFDQSxnQkFBUSxFQUFDLFFBQVEsS0FBSyxlQUFMLEVBQWpCO09BRkYsRUFSZ0I7Ozs7K0JBY1A7QUFDVCxXQUFLLGNBQUwsR0FEUzs7OztxQ0FJTSxVQUFVLFVBQVU7QUFDbkMsaUNBckNpQixrRUFxQ00sVUFBVSxTQUFqQyxDQURtQztBQUVuQyxXQUFLLGNBQUwsR0FGbUM7Ozs7NkJBSzVCLElBQUk7QUFDWCxVQUFNLGVBQWUs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QU0sS0FBSyxPQUFPLENBQVAsR0FBVyxPQUFPLENBQVAsQ0FkTjs7QUFnQmhCLFdBQUssS0FBTCxDQUFXLE1BQVgsR0FBb0IsS0FBSyxHQUFMLENBQVMsS0FBSyxJQUFMLENBQVUsS0FBSyxFQUFMLEdBQVUsS0FBSyxFQUFMLENBQTdCLEVBQXVDLEdBQXZDLENBQXBCLENBaEJnQjs7OztTQXJHQyIsImZpbGUiOiJzY2F0dGVycGxvdC1sYXllci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNSBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCBMYXllciBmcm9tICcuLi8uLi9sYXllcic7XG5pbXBvcnQge01vZGVsLCBQcm9ncmFtLCBHZW9tZXRyeX0gZnJvbSAnbHVtYS5nbCc7XG5jb25zdCBnbHNsaWZ5ID0gcmVxdWlyZSgnZ2xzbGlmeScpO1xuXG5jb25zdCBBVFRSSUJVVEVTID0ge1xuICBwb3NpdGlvbnM6IHtzaXplOiAzLCAnMCc6ICd4JywgJzEnOiAneScsICcyJzogJ3VudXNlZCd9LFxuICBjb2xvcnM6IHtzaXplOiAzLCAnMCc6ICdyZWQnLCAnMSc6ICdncmVlbicsICcyJzogJ2JsdWUnfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2NhdHRlcnBsb3RMYXllciBleHRlbmRzIExheWVyIHtcblxuICBzdGF0aWMgZ2V0IGF0dHJpYnV0ZXMoKSB7XG4gICAgcmV0dXJuIEFUVFJJQlVURVM7XG4gIH1cblxuICAvKipcbiAgICogQGNsYXNzZGVzY1xuICAgKiBTY2F0dGVycGxvdExheWVyXG4gICAqXG4gICAqIEBjbGFzc1xuICAgKiBAcGFyYW0ge29iamVjdH0gcHJvcHNcbiAgICogQHBhcmFtIHtudW1iZXJ9IHByb3BzLnJhZGl1cyAtIHBvaW50IHJhZGl1c1xuICAgKi9cbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gIH1cblxuICBpbml0aWFsaXplU3RhdGUoKSB7XG4gICAgY29uc3Qge2dsfSA9IHRoaXMuc3RhdGU7XG4gICAgY29uc3Qge2F0dHJpYnV0ZU1hbmFnZXJ9ID0gdGhpcy5zdGF0ZTtcblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgbW9kZWw6IHRoaXMuZ2V0TW9kZWwoZ2wpXG4gICAgfSk7XG5cbiAgICBhdHRyaWJ1dGVNYW5hZ2VyLmFkZEluc3RhbmNlZChBVFRSSUJVVEVTLCB7XG4gICAgICBwb3NpdGlvbnM6IHt1cGRhdGU6IHRoaXMuY2FsY3VsYXRlUG9zaXRpb25zfSxcbiAgICAgIGNvbG9yczoge3VwZGF0ZTogdGhpcy5jYWxjdWxhdGVDb2xvcnN9XG4gICAgfSk7XG4gIH1cblxuICBkaWRNb3VudCgpIHtcbiAgICB0aGlzLnVwZGF0ZVVuaWZvcm1zKCk7XG4gIH1cblxuICB3aWxsUmVjZWl2ZVByb3BzKG9sZFByb3BzLCBuZXdQcm9wcykge1xuICAgIHN1cGVyLndpbGxSZWNlaXZlUHJvcHMob2xkUHJvcHMsIG5ld1Byb3BzKTtcbiAgICB0aGlzLnVwZGF0ZVVuaWZvcm1zKCk7XG4gIH1cblxuICBnZXRNb2RlbChnbCkge1xuICAgIGNvbnN0IE5VTV9TRUdNRU5UUyA9IDE2O1xuICAgIGNvbnN0IFBJMiA9IE1hdGguUEkgKiAyO1xuXG4gICAgbGV0IHZlcnRpY2VzID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBOVU1fU0VHTUVOVFM7IGkrKykge1xuICAgICAgdmVydGljZXMgPSBbXG4gICAgICAgIC4uLnZlcnRpY2VzLFxuICAgICAgICBNYXRoLmNvcyhQSTIgKiBpIC8gTlVNX1NFR01FTlRTKSxcbiAgICAgICAgTWF0aC5zaW4oUEkyICogaSAvIE5VTV9TRUdNRU5UUyksXG4gICAgICAgIDBcbiAgICAgIF07XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBNb2RlbCh7XG4gICAgICBwcm9ncmFtOiBuZXcgUHJvZ3JhbShnbCwge1xuICAgICAgICB2czogZ2xzbGlmeSgnLi9zY2F0dGVycGxvdC1sYXllci12ZXJ0ZXguZ2xzbCcpLFxuICAgICAgICBmczogZ2xzbGlmeSgnLi9zY2F0dGVycGxvdC1sYXllci1mcmFnbWVudC5nbHNsJyksXG4gICAgICAgIGlkOiAnc2NhdHRlcnBsb3QnXG4gICAgICB9KSxcbiAgICAgIGdlb21ldHJ5OiBuZXcgR2VvbWV0cnkoe1xuICAgICAgICBkcmF3TW9kZTogJ1RSSUFOR0xFX0ZBTicsXG4gICAgICAgIHZlcnRpY2VzOiBuZXcgRmxvYXQzMkFycmF5KHZlcnRpY2VzKVxuICAgICAgfSksXG4gICAgICBpbnN0YW5jZWQ6IHRydWVcbiAgICB9KTtcbiAgfVxuXG4gIHVwZGF0ZVVuaWZvcm1zKCkge1xuICAgIHRoaXMuY2FsY3VsYXRlUmFkaXVzKCk7XG4gICAgY29uc3Qge3JhZGl1c30gPSB0aGlzLnN0YXRlO1xuICAgIHRoaXMuc2V0VW5pZm9ybXMoe1xuICAgICAgcmFkaXVzXG4gICAgfSk7XG4gIH1cblxuICBjYWxjdWxhdGVQb3NpdGlvbnMoYXR0cmlidXRlKSB7XG4gICAgY29uc3Qge2RhdGF9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7dmFsdWUsIHNpemV9ID0gYXR0cmlidXRlO1xuICAgIGxldCBpID0gMDtcbiAgICBmb3IgKGNvbnN0IHBvaW50IG9mIGRhdGEpIHtcbiAgICAgIHZhbHVlW2kgKyAwXSA9IHBvaW50LnBvc2l0aW9uLng7XG4gICAgICB2YWx1ZVtpICsgMV0gPSBwb2ludC5wb3NpdGlvbi55O1xuICAgICAgdmFsdWVbaSArIDJdID0gcG9pbnQucG9zaXRpb24uejtcbiAgICAgIGkgKz0gc2l6ZTtcbiAgICB9XG4gIH1cblxuICBjYWxjdWxhdGVDb2xvcnMoYXR0cmlidXRlKSB7XG4gICAgY29uc3Qge2RhdGF9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7dmFsdWUsIHNpemV9ID0gYXR0cmlidXRlO1xuICAgIGxldCBpID0gMDtcbiAgICBmb3IgKGNvbnN0IHBvaW50IG9mIGRhdGEpIHtcbiAgICAgIHZhbHVlW2kgKyAwXSA9IHBvaW50LmNvbG9yWzBdO1xuICAgICAgdmFsdWVbaSArIDFdID0gcG9pbnQuY29sb3JbMV07XG4gICAgICB2YWx1ZVtpICsgMl0gPSBwb2ludC5jb2xvclsyXTtcbiAgICAgIGkgKz0gc2l6ZTtcbiAgICB9XG4gIH1cblxuICBjYWxjdWxhdGVSYWRpdXMoKSB7XG4gICAgLy8gdXNlIHJhZGl1cyBpZiBzcGVjaWZpZWRcbiAgICBpZiAodGhpcy5wcm9wcy5yYWRpdXMpIHtcbiAgICAgIHRoaXMuc3RhdGUucmFkaXVzID0gdGhpcy5wcm9wcy5yYWRpdXM7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcGl4ZWwwID0gdGhpcy5wcm9qZWN0KHtsb246IC0xMjIsIGxhdDogMzcuNX0pO1xuICAgIGNvbnN0IHBpeGVsMSA9IHRoaXMucHJvamVjdCh7bG9uOiAtMTIyLCBsYXQ6IDM3LjUwMDJ9KTtcblxuICAgIGNvbnN0IHNwYWNlMCA9IHRoaXMuc2NyZWVuVG9TcGFjZShwaXhlbDApO1xuICAgIGNvbnN0IHNwYWNlMSA9IHRoaXMuc2NyZWVuVG9TcGFjZShwaXhlbDEpO1xuXG4gICAgY29uc3QgZHggPSBzcGFjZTAueCAtIHNwYWNlMS54O1xuICAgIGNvbnN0IGR5ID0gc3BhY2UwLnkgLSBzcGFjZTEueTtcblxuICAgIHRoaXMuc3RhdGUucmFkaXVzID0gTWF0aC5tYXgoTWF0aC5zcXJ0KGR4ICogZHggKyBkeSAqIGR5KSwgMi4wKTtcbiAgfVxuXG59XG4iXX0=