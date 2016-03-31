'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

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
  positions: { size: 4, '0': 'x0', '1': 'y0', '2': 'x1', '3': 'y1' }
};

var ArcLayer = function (_Layer) {
  _inherits(ArcLayer, _Layer);

  /**
   * @classdesc
   * ArcLayer
   *
   * @class
   * @param {object} opts
   */

  function ArcLayer(opts) {
    _classCallCheck(this, ArcLayer);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(ArcLayer).call(this, opts));
  }

  _createClass(ArcLayer, [{
    key: 'initializeState',
    value: function initializeState() {
      var _state = this.state;
      var gl = _state.gl;
      var attributeManager = _state.attributeManager;


      this.setState({
        model: this.createModel(gl)
      });

      attributeManager.addInstanced(ATTRIBUTES, {
        positions: { update: this.calculatePositions }
      });

      this.updateColors();
    }
  }, {
    key: 'willReceiveProps',
    value: function willReceiveProps(oldProps, nextProps) {
      _get(Object.getPrototypeOf(ArcLayer.prototype), 'willReceiveProps', this).call(this, oldProps, nextProps);
      this.updateColors();
    }
  }, {
    key: 'createModel',
    value: function createModel(gl) {
      var vertices = [];
      var NUM_SEGMENTS = 50;
      for (var i = 0; i < NUM_SEGMENTS; i++) {
        vertices = [].concat(_toConsumableArray(vertices), [i, i, i]);
      }

      return new _luma.Model({
        program: new _luma.Program(gl, {
          vs: glslify('./arc-layer-vertex.glsl'),
          fs: glslify('./arc-layer-fragment.glsl'),
          id: 'arc'
        }),
        geometry: new _luma.Geometry({
          id: 'arc',
          drawMode: 'LINE_STRIP',
          vertices: new Float32Array(vertices)
        }),
        instanced: true
      });
    }
  }, {
    key: 'updateColors',
    value: function updateColors() {
      // Get colors from first object
      var object = this.getFirstObject();
      if (object) {
        this.setUniforms({
          color0: object.colors.c0,
          color1: object.colors.c1
        });
      }
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
          var arc = _step.value;

          value[i + 0] = arc.position.x0;
          value[i + 1] = arc.position.y0;
          value[i + 2] = arc.position.x1;
          value[i + 3] = arc.position.y1;
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
  }]);

  return ArcLayer;
}(_layer2.default);

exports.default = ArcLayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYXllcnMvYXJjLWxheWVyL2FyYy1sYXllci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQW9CQTs7OztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSxJQUFNLFVBQVUsUUFBUSxTQUFSLENBQVY7O0FBRU4sSUFBTSxhQUFhO0FBQ2pCLGFBQVcsRUFBQyxNQUFNLENBQU4sRUFBUyxLQUFLLElBQUwsRUFBVyxLQUFLLElBQUwsRUFBVyxLQUFLLElBQUwsRUFBVyxLQUFLLElBQUwsRUFBdEQ7Q0FESTs7SUFJZTs7Ozs7Ozs7Ozs7QUFRbkIsV0FSbUIsUUFRbkIsQ0FBWSxJQUFaLEVBQWtCOzBCQVJDLFVBUUQ7O2tFQVJDLHFCQVNYLE9BRFU7R0FBbEI7O2VBUm1COztzQ0FZRDttQkFDZSxLQUFLLEtBQUwsQ0FEZjtVQUNULGVBRFM7VUFDTCwyQ0FESzs7O0FBR2hCLFdBQUssUUFBTCxDQUFjO0FBQ1osZUFBTyxLQUFLLFdBQUwsQ0FBaUIsRUFBakIsQ0FBUDtPQURGLEVBSGdCOztBQU9oQix1QkFBaUIsWUFBakIsQ0FBOEIsVUFBOUIsRUFBMEM7QUFDeEMsbUJBQVcsRUFBQyxRQUFRLEtBQUssa0JBQUwsRUFBcEI7T0FERixFQVBnQjs7QUFXaEIsV0FBSyxZQUFMLEdBWGdCOzs7O3FDQWNELFVBQVUsV0FBVztBQUNwQyxpQ0EzQmlCLDBEQTJCTSxVQUFVLFVBQWpDLENBRG9DO0FBRXBDLFdBQUssWUFBTCxHQUZvQzs7OztnQ0FLMUIsSUFBSTtBQUNkLFVBQUksV0FBVyxFQUFYLENBRFU7QUFFZCxVQUFNLGVBQWUsRUFBZixDQUZRO0FBR2QsV0FBSyxJQUFJLElBQUksQ0FBSixFQUFPLElBQUksWUFBSixFQUFrQixHQUFsQyxFQUF1QztBQUNyQyxnREFBZSxZQUFVLEdBQUcsR0FBRyxHQUEvQixDQURxQztPQUF2Qzs7QUFJQSxhQUFPLGdCQUFVO0FBQ2YsaUJBQVMsa0JBQVksRUFBWixFQUFnQjtBQUN2QixjQUFJLFFBQVEseUJBQVIsQ0FBSjtBQUNBLGNBQUksUUFBUSwyQkFBUixDQUFKO0FBQ0EsY0FBSSxLQUFKO1NBSE8sQ0FBVDtBQUtBLGtCQUFVLG1CQUFhO0FBQ3JCLGNBQUksS0FBSjtBQUNBLG9CQUFVLFlBQVY7QUFDQSxvQkFBVSxJQUFJLFlBQUosQ0FBaUIsUUFBakIsQ0FBVjtTQUhRLENBQVY7QUFLQSxtQkFBVyxJQUFYO09BWEssQ0FBUCxDQVBjOzs7O21DQXNCRDs7QUFFYixVQUFNLFNBQVMsS0FBSyxjQUFMLEVBQVQsQ0FGTztBQUdiLFVBQUksTUFBSixFQUFZO0FBQ1YsYUFBSyxXQUFMLENBQWlCO0FBQ2Ysa0JBQVEsT0FBTyxNQUFQLENBQWMsRUFBZDtBQUNSLGtCQUFRLE9BQU8sTUFBUCxDQUFjLEVBQWQ7U0FGVixFQURVO09BQVo7Ozs7dUNBUWlCLFdBQVc7VUFDckIsT0FBUSxLQUFLLEtBQUwsQ0FBUixLQURxQjtVQUVyQixRQUFlLFVBQWYsTUFGcUI7VUFFZCxPQUFRLFVBQVIsS0FGYzs7QUFHNUIsVUFBSSxJQUFJLENBQUosQ0FId0I7Ozs7OztBQUk1Qiw2QkFBa0IsOEJBQWxCLG9HQUF3QjtjQUFiLGtCQUFhOztBQUN0QixnQkFBTSxJQUFJLENBQUosQ0FBTixHQUFlLElBQUksUUFBSixDQUFhLEVBQWIsQ0FETztBQUV0QixnQkFBTSxJQUFJLENBQUosQ0FBTixHQUFlLElBQUksUUFBSixDQUFhLEVBQWIsQ0FGTztBQUd0QixnQkFBTSxJQUFJLENBQUosQ0FBTixHQUFlLElBQUksUUFBSixDQUFhLEVBQWIsQ0FITztBQUl0QixnQkFBTSxJQUFJLENBQUosQ0FBTixHQUFlLElBQUksUUFBSixDQUFhLEVBQWIsQ0FKTztBQUt0QixlQUFLLElBQUwsQ0FMc0I7U0FBeEI7Ozs7Ozs7Ozs7Ozs7O09BSjRCOzs7O1NBaEVYIiwiZmlsZSI6ImFyYy1sYXllci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNSBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCBMYXllciBmcm9tICcuLi8uLi9sYXllcic7XG5pbXBvcnQge01vZGVsLCBQcm9ncmFtLCBHZW9tZXRyeX0gZnJvbSAnbHVtYS5nbCc7XG5jb25zdCBnbHNsaWZ5ID0gcmVxdWlyZSgnZ2xzbGlmeScpO1xuXG5jb25zdCBBVFRSSUJVVEVTID0ge1xuICBwb3NpdGlvbnM6IHtzaXplOiA0LCAnMCc6ICd4MCcsICcxJzogJ3kwJywgJzInOiAneDEnLCAnMyc6ICd5MSd9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBcmNMYXllciBleHRlbmRzIExheWVyIHtcbiAgLyoqXG4gICAqIEBjbGFzc2Rlc2NcbiAgICogQXJjTGF5ZXJcbiAgICpcbiAgICogQGNsYXNzXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBvcHRzXG4gICAqL1xuICBjb25zdHJ1Y3RvcihvcHRzKSB7XG4gICAgc3VwZXIob3B0cyk7XG4gIH1cblxuICBpbml0aWFsaXplU3RhdGUoKSB7XG4gICAgY29uc3Qge2dsLCBhdHRyaWJ1dGVNYW5hZ2VyfSA9IHRoaXMuc3RhdGU7XG5cbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIG1vZGVsOiB0aGlzLmNyZWF0ZU1vZGVsKGdsKVxuICAgIH0pO1xuXG4gICAgYXR0cmlidXRlTWFuYWdlci5hZGRJbnN0YW5jZWQoQVRUUklCVVRFUywge1xuICAgICAgcG9zaXRpb25zOiB7dXBkYXRlOiB0aGlzLmNhbGN1bGF0ZVBvc2l0aW9uc31cbiAgICB9KTtcblxuICAgIHRoaXMudXBkYXRlQ29sb3JzKCk7XG4gIH1cblxuICB3aWxsUmVjZWl2ZVByb3BzKG9sZFByb3BzLCBuZXh0UHJvcHMpIHtcbiAgICBzdXBlci53aWxsUmVjZWl2ZVByb3BzKG9sZFByb3BzLCBuZXh0UHJvcHMpO1xuICAgIHRoaXMudXBkYXRlQ29sb3JzKCk7XG4gIH1cblxuICBjcmVhdGVNb2RlbChnbCkge1xuICAgIGxldCB2ZXJ0aWNlcyA9IFtdO1xuICAgIGNvbnN0IE5VTV9TRUdNRU5UUyA9IDUwO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgTlVNX1NFR01FTlRTOyBpKyspIHtcbiAgICAgIHZlcnRpY2VzID0gWy4uLnZlcnRpY2VzLCBpLCBpLCBpXTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IE1vZGVsKHtcbiAgICAgIHByb2dyYW06IG5ldyBQcm9ncmFtKGdsLCB7XG4gICAgICAgIHZzOiBnbHNsaWZ5KCcuL2FyYy1sYXllci12ZXJ0ZXguZ2xzbCcpLFxuICAgICAgICBmczogZ2xzbGlmeSgnLi9hcmMtbGF5ZXItZnJhZ21lbnQuZ2xzbCcpLFxuICAgICAgICBpZDogJ2FyYydcbiAgICAgIH0pLFxuICAgICAgZ2VvbWV0cnk6IG5ldyBHZW9tZXRyeSh7XG4gICAgICAgIGlkOiAnYXJjJyxcbiAgICAgICAgZHJhd01vZGU6ICdMSU5FX1NUUklQJyxcbiAgICAgICAgdmVydGljZXM6IG5ldyBGbG9hdDMyQXJyYXkodmVydGljZXMpXG4gICAgICB9KSxcbiAgICAgIGluc3RhbmNlZDogdHJ1ZVxuICAgIH0pO1xuICB9XG5cbiAgdXBkYXRlQ29sb3JzKCkge1xuICAgIC8vIEdldCBjb2xvcnMgZnJvbSBmaXJzdCBvYmplY3RcbiAgICBjb25zdCBvYmplY3QgPSB0aGlzLmdldEZpcnN0T2JqZWN0KCk7XG4gICAgaWYgKG9iamVjdCkge1xuICAgICAgdGhpcy5zZXRVbmlmb3Jtcyh7XG4gICAgICAgIGNvbG9yMDogb2JqZWN0LmNvbG9ycy5jMCxcbiAgICAgICAgY29sb3IxOiBvYmplY3QuY29sb3JzLmMxXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBjYWxjdWxhdGVQb3NpdGlvbnMoYXR0cmlidXRlKSB7XG4gICAgY29uc3Qge2RhdGF9ID0gdGhpcy5wcm9wcztcbiAgICBjb25zdCB7dmFsdWUsIHNpemV9ID0gYXR0cmlidXRlO1xuICAgIGxldCBpID0gMDtcbiAgICBmb3IgKGNvbnN0IGFyYyBvZiBkYXRhKSB7XG4gICAgICB2YWx1ZVtpICsgMF0gPSBhcmMucG9zaXRpb24ueDA7XG4gICAgICB2YWx1ZVtpICsgMV0gPSBhcmMucG9zaXRpb24ueTA7XG4gICAgICB2YWx1ZVtpICsgMl0gPSBhcmMucG9zaXRpb24ueDE7XG4gICAgICB2YWx1ZVtpICsgM10gPSBhcmMucG9zaXRpb24ueTE7XG4gICAgICBpICs9IHNpemU7XG4gICAgfVxuICB9XG5cbn1cbiJdfQ==