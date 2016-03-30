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
      _get(Object.getPrototypeOf(ScatterplotLayer.prototype), 'initializeState', this).call(this);

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
      this.updateRadius();
    }
  }, {
    key: 'willReceiveProps',
    value: function willReceiveProps(oldProps, newProps) {
      _get(Object.getPrototypeOf(ScatterplotLayer.prototype), 'willReceiveProps', this).call(this, oldProps, newProps);
      this.updateRadius();
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
    key: 'updateRadius',
    value: function updateRadius() {
      this._calculateRadius();
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
    key: '_calculateRadius',
    value: function _calculateRadius() {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYXllcnMvc2NhdHRlcnBsb3QtbGF5ZXIvc2NhdHRlcnBsb3QtbGF5ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBc0JBLElBQU0sVUFBVSxRQUFRLFNBQVIsQ0FBVjs7QUFFTixJQUFNLGFBQWE7QUFDakIsYUFBVyxFQUFDLE1BQU0sQ0FBTixFQUFTLEtBQUssR0FBTCxFQUFVLEtBQUssR0FBTCxFQUFVLEtBQUssUUFBTCxFQUF6QztBQUNBLFVBQVEsRUFBQyxNQUFNLENBQU4sRUFBUyxLQUFLLEtBQUwsRUFBWSxLQUFLLE9BQUwsRUFBYyxLQUFLLE1BQUwsRUFBNUM7Q0FGSTs7SUFLZTs7Ozs7d0JBRUs7QUFDdEIsYUFBTyxVQUFQLENBRHNCOzs7Ozs7Ozs7Ozs7OztBQVl4QixXQWRtQixnQkFjbkIsQ0FBWSxLQUFaLEVBQW1COzBCQWRBLGtCQWNBOztrRUFkQSw2QkFlWCxRQURXO0dBQW5COztlQWRtQjs7c0NBa0JEO0FBQ2hCLGlDQW5CaUIsZ0VBbUJqQixDQURnQjs7VUFHVCxLQUFNLEtBQUssS0FBTCxDQUFOLEdBSFM7VUFJVCxtQkFBb0IsS0FBSyxLQUFMLENBQXBCLGlCQUpTOzs7QUFNaEIsV0FBSyxRQUFMLENBQWM7QUFDWixlQUFPLEtBQUssUUFBTCxDQUFjLEVBQWQsQ0FBUDtPQURGLEVBTmdCOztBQVVoQix1QkFBaUIsWUFBakIsQ0FBOEIsVUFBOUIsRUFBMEM7QUFDeEMsbUJBQVcsRUFBQyxRQUFRLEtBQUssa0JBQUwsRUFBcEI7QUFDQSxnQkFBUSxFQUFDLFFBQVEsS0FBSyxlQUFMLEVBQWpCO09BRkYsRUFWZ0I7Ozs7K0JBZ0JQO0FBQ1QsV0FBSyxZQUFMLEdBRFM7Ozs7cUNBSU0sVUFBVSxVQUFVO0FBQ25DLGlDQXZDaUIsa0VBdUNNLFVBQVUsU0FBakMsQ0FEbUM7QUFFbkMsV0FBSyxZQUFMLEdBRm1DOzs7OzZCQUs1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T0FBTyxDQUFQLENBYkw7QUFjakIsVUFBTSxLQUFLLE9BQU8sQ0FBUCxHQUFXLE9BQU8sQ0FBUCxDQWRMOztBQWdCakIsV0FBSyxLQUFMLENBQVcsTUFBWCxHQUFvQixLQUFLLEdBQUwsQ0FBUyxLQUFLLElBQUwsQ0FBVSxLQUFLLEVBQUwsR0FBVSxLQUFLLEVBQUwsQ0FBN0IsRUFBdUMsR0FBdkMsQ0FBcEIsQ0FoQmlCOzs7O1NBdkdBIiwiZmlsZSI6InNjYXR0ZXJwbG90LWxheWVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IExheWVyIGZyb20gJy4uLy4uL2xheWVyJztcbmltcG9ydCB7TW9kZWwsIFByb2dyYW0sIEdlb21ldHJ5fSBmcm9tICdsdW1hLmdsJztcbmNvbnN0IGdsc2xpZnkgPSByZXF1aXJlKCdnbHNsaWZ5Jyk7XG5cbmNvbnN0IEFUVFJJQlVURVMgPSB7XG4gIHBvc2l0aW9uczoge3NpemU6IDMsICcwJzogJ3gnLCAnMSc6ICd5JywgJzInOiAndW51c2VkJ30sXG4gIGNvbG9yczoge3NpemU6IDMsICcwJzogJ3JlZCcsICcxJzogJ2dyZWVuJywgJzInOiAnYmx1ZSd9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTY2F0dGVycGxvdExheWVyIGV4dGVuZHMgTGF5ZXIge1xuXG4gIHN0YXRpYyBnZXQgYXR0cmlidXRlcygpIHtcbiAgICByZXR1cm4gQVRUUklCVVRFUztcbiAgfVxuXG4gIC8qKlxuICAgKiBAY2xhc3NkZXNjXG4gICAqIFNjYXR0ZXJwbG90TGF5ZXJcbiAgICpcbiAgICogQGNsYXNzXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBwcm9wc1xuICAgKiBAcGFyYW0ge251bWJlcn0gcHJvcHMucmFkaXVzIC0gcG9pbnQgcmFkaXVzXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgfVxuXG4gIGluaXRpYWxpemVTdGF0ZSgpIHtcbiAgICBzdXBlci5pbml0aWFsaXplU3RhdGUoKTtcblxuICAgIGNvbnN0IHtnbH0gPSB0aGlzLnN0YXRlO1xuICAgIGNvbnN0IHthdHRyaWJ1dGVNYW5hZ2VyfSA9IHRoaXMuc3RhdGU7XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIG1vZGVsOiB0aGlzLmdldE1vZGVsKGdsKVxuICAgIH0pO1xuXG4gICAgYXR0cmlidXRlTWFuYWdlci5hZGRJbnN0YW5jZWQoQVRUUklCVVRFUywge1xuICAgICAgcG9zaXRpb25zOiB7dXBkYXRlOiB0aGlzLmNhbGN1bGF0ZVBvc2l0aW9uc30sXG4gICAgICBjb2xvcnM6IHt1cGRhdGU6IHRoaXMuY2FsY3VsYXRlQ29sb3JzfVxuICAgIH0pO1xuICB9XG5cbiAgZGlkTW91bnQoKSB7XG4gICAgdGhpcy51cGRhdGVSYWRpdXMoKTtcbiAgfVxuXG4gIHdpbGxSZWNlaXZlUHJvcHMob2xkUHJvcHMsIG5ld1Byb3BzKSB7XG4gICAgc3VwZXIud2lsbFJlY2VpdmVQcm9wcyhvbGRQcm9wcywgbmV3UHJvcHMpO1xuICAgIHRoaXMudXBkYXRlUmFkaXVzKCk7XG4gIH1cblxuICBnZXRNb2RlbChnbCkge1xuICAgIGNvbnN0IE5VTV9TRUdNRU5UUyA9IDE2O1xuICAgIGNvbnN0IFBJMiA9IE1hdGguUEkgKiAyO1xuXG4gICAgbGV0IHZlcnRpY2VzID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBOVU1fU0VHTUVOVFM7IGkrKykge1xuICAgICAgdmVydGljZXMgPSBbXG4gICAgICAgIC4uLnZlcnRpY2VzLFxuICAgICAgICBNYXRoLmNvcyhQSTIgKiBpIC8gTlVNX1NFR01FTlRTKSxcbiAgICAgICAgTWF0aC5zaW4oUEkyICogaSAvIE5VTV9TRUdNRU5UUyksXG4gICAgICAgIDBcbiAgICAgIF07XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBNb2RlbCh7XG4gICAgICBwcm9ncmFtOiBuZXcgUHJvZ3JhbShnbCwge1xuICAgICAgICB2czogZ2xzbGlmeSgnLi9zY2F0dGVycGxvdC1sYXllci12ZXJ0ZXguZ2xzbCcpLFxuICAgICAgICBmczogZ2xzbGlmeSgnLi9zY2F0dGVycGxvdC1sYXllci1mcmFnbWVudC5nbHNsJyksXG4gICAgICAgIGlkOiAnc2NhdHRlcnBsb3QnXG4gICAgICB9KSxcbiAgICAgIGdlb21ldHJ5OiBuZXcgR2VvbWV0cnkoe1xuICAgICAgICBkcmF3TW9kZTogJ1RSSUFOR0xFX0ZBTicsXG4gICAgICAgIHZlcnRpY2VzOiBuZXcgRmxvYXQzMkFycmF5KHZlcnRpY2VzKVxuICAgICAgfSksXG4gICAgICBpbnN0YW5jZWQ6IHRydWVcbiAgICB9KTtcbiAgfVxuXG4gIHVwZGF0ZVJhZGl1cygpIHtcbiAgICB0aGlzLl9jYWxjdWxhdGVSYWRpdXMoKTtcbiAgICBjb25zdCB7cmFkaXVzfSA9IHRoaXMuc3RhdGU7XG4gICAgdGhpcy5zZXRVbmlmb3Jtcyh7XG4gICAgICByYWRpdXNcbiAgICB9KTtcbiAgfVxuXG4gIGNhbGN1bGF0ZVBvc2l0aW9ucyhhdHRyaWJ1dGUpIHtcbiAgICBjb25zdCB7ZGF0YX0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHt2YWx1ZSwgc2l6ZX0gPSBhdHRyaWJ1dGU7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAoY29uc3QgcG9pbnQgb2YgZGF0YSkge1xuICAgICAgdmFsdWVbaSArIDBdID0gcG9pbnQucG9zaXRpb24ueDtcbiAgICAgIHZhbHVlW2kgKyAxXSA9IHBvaW50LnBvc2l0aW9uLnk7XG4gICAgICB2YWx1ZVtpICsgMl0gPSBwb2ludC5wb3NpdGlvbi56O1xuICAgICAgaSArPSBzaXplO1xuICAgIH1cbiAgfVxuXG4gIGNhbGN1bGF0ZUNvbG9ycyhhdHRyaWJ1dGUpIHtcbiAgICBjb25zdCB7ZGF0YX0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHt2YWx1ZSwgc2l6ZX0gPSBhdHRyaWJ1dGU7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAoY29uc3QgcG9pbnQgb2YgZGF0YSkge1xuICAgICAgdmFsdWVbaSArIDBdID0gcG9pbnQuY29sb3JbMF07XG4gICAgICB2YWx1ZVtpICsgMV0gPSBwb2ludC5jb2xvclsxXTtcbiAgICAgIHZhbHVlW2kgKyAyXSA9IHBvaW50LmNvbG9yWzJdO1xuICAgICAgaSArPSBzaXplO1xuICAgIH1cbiAgfVxuXG4gIF9jYWxjdWxhdGVSYWRpdXMoKSB7XG4gICAgLy8gdXNlIHJhZGl1cyBpZiBzcGVjaWZpZWRcbiAgICBpZiAodGhpcy5wcm9wcy5yYWRpdXMpIHtcbiAgICAgIHRoaXMuc3RhdGUucmFkaXVzID0gdGhpcy5wcm9wcy5yYWRpdXM7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcGl4ZWwwID0gdGhpcy5wcm9qZWN0KHtsb246IC0xMjIsIGxhdDogMzcuNX0pO1xuICAgIGNvbnN0IHBpeGVsMSA9IHRoaXMucHJvamVjdCh7bG9uOiAtMTIyLCBsYXQ6IDM3LjUwMDJ9KTtcblxuICAgIGNvbnN0IHNwYWNlMCA9IHRoaXMuc2NyZWVuVG9TcGFjZShwaXhlbDApO1xuICAgIGNvbnN0IHNwYWNlMSA9IHRoaXMuc2NyZWVuVG9TcGFjZShwaXhlbDEpO1xuXG4gICAgY29uc3QgZHggPSBzcGFjZTAueCAtIHNwYWNlMS54O1xuICAgIGNvbnN0IGR5ID0gc3BhY2UwLnkgLSBzcGFjZTEueTtcblxuICAgIHRoaXMuc3RhdGUucmFkaXVzID0gTWF0aC5tYXgoTWF0aC5zcXJ0KGR4ICogZHggKyBkeSAqIGR5KSwgMi4wKTtcbiAgfVxuXG59XG4iXX0=