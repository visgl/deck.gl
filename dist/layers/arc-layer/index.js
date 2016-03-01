'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _layer = require('../layer');

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
      _get(Object.getPrototypeOf(ArcLayer.prototype), 'initializeState', this).call(this);
      var _state = this.state;
      var gl = _state.gl;
      var attributes = _state.attributes;


      var program = new _luma.Program(gl, glslify('./vertex.glsl'), glslify('./fragment.glsl'), 'arc');

      var primitive = _extends({
        id: this.id,
        instanced: true
      }, this.getGeometry());

      this.setState({
        program: program,
        primitive: primitive
      });

      attributes.addInstanced(ATTRIBUTES, {
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
  }, {
    key: 'getGeometry',
    value: function getGeometry() {
      var vertices = [];
      var NUM_SEGMENTS = 50;
      for (var i = 0; i < NUM_SEGMENTS; i++) {
        vertices = [].concat(_toConsumableArray(vertices), [i, i, i]);
      }
      return {
        drawType: 'LINE_STRIP',
        vertices: new Float32Array(vertices)
      };
    }
  }]);

  return ArcLayer;
}(_layer2.default);

exports.default = ArcLayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYXllcnMvYXJjLWxheWVyL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBc0JBLElBQU0sVUFBVSxRQUFRLFNBQVIsQ0FBVjs7QUFFTixJQUFNLGFBQWE7QUFDakIsYUFBVyxFQUFDLE1BQU0sQ0FBTixFQUFTLEtBQUssSUFBTCxFQUFXLEtBQUssSUFBTCxFQUFXLEtBQUssSUFBTCxFQUFXLEtBQUssSUFBTCxFQUF0RDtDQURJOztJQUllOzs7Ozs7Ozs7OztBQVFuQixXQVJtQixRQVFuQixDQUFZLElBQVosRUFBa0I7MEJBUkMsVUFRRDs7a0VBUkMscUJBU1gsT0FEVTtHQUFsQjs7ZUFSbUI7O3NDQVlEO0FBQ2hCLGlDQWJpQix3REFhakIsQ0FEZ0I7bUJBRVMsS0FBSyxLQUFMLENBRlQ7VUFFVCxlQUZTO1VBRUwsK0JBRks7OztBQUloQixVQUFNLFVBQVUsa0JBQ2QsRUFEYyxFQUVkLFFBQVEsZUFBUixDQUZjLEVBR2QsUUFBUSxpQkFBUixDQUhjLEVBSWQsS0FKYyxDQUFWLENBSlU7O0FBV2hCLFVBQU07QUFDSixZQUFJLEtBQUssRUFBTDtBQUNKLG1CQUFXLElBQVg7U0FDRyxLQUFLLFdBQUwsR0FIQyxDQVhVOztBQWlCaEIsV0FBSyxRQUFMLENBQWM7QUFDWix3QkFEWTtBQUVaLDRCQUZZO09BQWQsRUFqQmdCOztBQXNCaEIsaUJBQVcsWUFBWCxDQUF3QixVQUF4QixFQUFvQztBQUNsQyxtQkFBVyxFQUFDLFFBQVEsS0FBSyxrQkFBTCxFQUFwQjtPQURGLEVBdEJnQjs7QUEwQmhCLFdBQUssWUFBTCxHQTFCZ0I7Ozs7cUNBNkJELFVBQVUsV0FBVztBQUNwQyxpQ0ExQ2lCLDBEQTBDTSxVQUFVLFVBQWpDLENBRG9DO0FBRXBDLFdBQUssWUFBTCxHQUZvQzs7OzttQ0FLdkI7O0FBRWIsVUFBTSxTQUFTLEtBQUssY0FBTCxFQUFULENBRk87QUFHYixVQUFJLE1BQUosRUFBWTtBQUNWLGFBQUssV0FBTCxDQUFpQjtBQUNmLGtCQUFRLE9BQU8sTUFBUCxDQUFjLEVBQWQ7QUFDUixrQkFBUSxPQUFPLE1BQVAsQ0FBYyxFQUFkO1NBRlYsRUFEVTtPQUFaOzs7O3VDQVFpQixXQUFXO1VBQ3JCLE9BQVEsS0FBSyxLQUFMLENBQVIsS0FEcUI7VUFFckIsUUFBZSxVQUFmLE1BRnFCO1VBRWQsT0FBUSxVQUFSLEtBRmM7O0FBRzVCLFVBQUksSUFBSSxDQUFKLENBSHdCOzs7Ozs7QUFJNUIsNkJBQWtCLDhCQUFsQixvR0FBd0I7Y0FBYixrQkFBYTs7QUFDdEIsZ0JBQU0sSUFBSSxDQUFKLENBQU4sR0FBZSxJQUFJLFFBQUosQ0FBYSxFQUFiLENBRE87QUFFdEIsZ0JBQU0sSUFBSSxDQUFKLENBQU4sR0FBZSxJQUFJLFFBQUosQ0FBYSxFQUFiLENBRk87QUFHdEIsZ0JBQU0sSUFBSSxDQUFKLENBQU4sR0FBZSxJQUFJLFFBQUosQ0FBYSxFQUFiLENBSE87QUFJdEIsZ0JBQU0sSUFBSSxDQUFKLENBQU4sR0FBZSxJQUFJLFFBQUosQ0FBYSxFQUFiLENBSk87QUFLdEIsZUFBSyxJQUFMLENBTHNCO1NBQXhCOzs7Ozs7Ozs7Ozs7OztPQUo0Qjs7OztrQ0FhaEI7QUFDWixVQUFJLFdBQVcsRUFBWCxDQURRO0FBRVosVUFBTSxlQUFlLEVBQWYsQ0FGTTtBQUdaLFdBQUssSUFBSSxJQUFJLENBQUosRUFBTyxJQUFJLFlBQUosRUFBa0IsR0FBbEMsRUFBdUM7QUFDckMsZ0RBQWUsWUFBVSxHQUFHLEdBQUcsR0FBL0IsQ0FEcUM7T0FBdkM7QUFHQSxhQUFPO0FBQ0wsa0JBQVUsWUFBVjtBQUNBLGtCQUFVLElBQUksWUFBSixDQUFpQixRQUFqQixDQUFWO09BRkYsQ0FOWTs7OztTQXRFSyIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNSBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbmltcG9ydCBMYXllciBmcm9tICcuLi9sYXllcic7XG5pbXBvcnQge1Byb2dyYW19IGZyb20gJ2x1bWEuZ2wnO1xuY29uc3QgZ2xzbGlmeSA9IHJlcXVpcmUoJ2dsc2xpZnknKTtcblxuY29uc3QgQVRUUklCVVRFUyA9IHtcbiAgcG9zaXRpb25zOiB7c2l6ZTogNCwgJzAnOiAneDAnLCAnMSc6ICd5MCcsICcyJzogJ3gxJywgJzMnOiAneTEnfVxufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQXJjTGF5ZXIgZXh0ZW5kcyBMYXllciB7XG4gIC8qKlxuICAgKiBAY2xhc3NkZXNjXG4gICAqIEFyY0xheWVyXG4gICAqXG4gICAqIEBjbGFzc1xuICAgKiBAcGFyYW0ge29iamVjdH0gb3B0c1xuICAgKi9cbiAgY29uc3RydWN0b3Iob3B0cykge1xuICAgIHN1cGVyKG9wdHMpO1xuICB9XG5cbiAgaW5pdGlhbGl6ZVN0YXRlKCkge1xuICAgIHN1cGVyLmluaXRpYWxpemVTdGF0ZSgpO1xuICAgIGNvbnN0IHtnbCwgYXR0cmlidXRlc30gPSB0aGlzLnN0YXRlO1xuXG4gICAgY29uc3QgcHJvZ3JhbSA9IG5ldyBQcm9ncmFtKFxuICAgICAgZ2wsXG4gICAgICBnbHNsaWZ5KCcuL3ZlcnRleC5nbHNsJyksXG4gICAgICBnbHNsaWZ5KCcuL2ZyYWdtZW50Lmdsc2wnKSxcbiAgICAgICdhcmMnXG4gICAgKTtcblxuICAgIGNvbnN0IHByaW1pdGl2ZSA9IHtcbiAgICAgIGlkOiB0aGlzLmlkLFxuICAgICAgaW5zdGFuY2VkOiB0cnVlLFxuICAgICAgLi4udGhpcy5nZXRHZW9tZXRyeSgpXG4gICAgfTtcblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgcHJvZ3JhbSxcbiAgICAgIHByaW1pdGl2ZVxuICAgIH0pO1xuXG4gICAgYXR0cmlidXRlcy5hZGRJbnN0YW5jZWQoQVRUUklCVVRFUywge1xuICAgICAgcG9zaXRpb25zOiB7dXBkYXRlOiB0aGlzLmNhbGN1bGF0ZVBvc2l0aW9uc31cbiAgICB9KTtcblxuICAgIHRoaXMudXBkYXRlQ29sb3JzKCk7XG4gIH1cblxuICB3aWxsUmVjZWl2ZVByb3BzKG9sZFByb3BzLCBuZXh0UHJvcHMpIHtcbiAgICBzdXBlci53aWxsUmVjZWl2ZVByb3BzKG9sZFByb3BzLCBuZXh0UHJvcHMpO1xuICAgIHRoaXMudXBkYXRlQ29sb3JzKCk7XG4gIH1cblxuICB1cGRhdGVDb2xvcnMoKSB7XG4gICAgLy8gR2V0IGNvbG9ycyBmcm9tIGZpcnN0IG9iamVjdFxuICAgIGNvbnN0IG9iamVjdCA9IHRoaXMuZ2V0Rmlyc3RPYmplY3QoKTtcbiAgICBpZiAob2JqZWN0KSB7XG4gICAgICB0aGlzLnNldFVuaWZvcm1zKHtcbiAgICAgICAgY29sb3IwOiBvYmplY3QuY29sb3JzLmMwLFxuICAgICAgICBjb2xvcjE6IG9iamVjdC5jb2xvcnMuYzFcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGNhbGN1bGF0ZVBvc2l0aW9ucyhhdHRyaWJ1dGUpIHtcbiAgICBjb25zdCB7ZGF0YX0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHt2YWx1ZSwgc2l6ZX0gPSBhdHRyaWJ1dGU7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAoY29uc3QgYXJjIG9mIGRhdGEpIHtcbiAgICAgIHZhbHVlW2kgKyAwXSA9IGFyYy5wb3NpdGlvbi54MDtcbiAgICAgIHZhbHVlW2kgKyAxXSA9IGFyYy5wb3NpdGlvbi55MDtcbiAgICAgIHZhbHVlW2kgKyAyXSA9IGFyYy5wb3NpdGlvbi54MTtcbiAgICAgIHZhbHVlW2kgKyAzXSA9IGFyYy5wb3NpdGlvbi55MTtcbiAgICAgIGkgKz0gc2l6ZTtcbiAgICB9XG4gIH1cblxuICBnZXRHZW9tZXRyeSgpIHtcbiAgICBsZXQgdmVydGljZXMgPSBbXTtcbiAgICBjb25zdCBOVU1fU0VHTUVOVFMgPSA1MDtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IE5VTV9TRUdNRU5UUzsgaSsrKSB7XG4gICAgICB2ZXJ0aWNlcyA9IFsuLi52ZXJ0aWNlcywgaSwgaSwgaV07XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBkcmF3VHlwZTogJ0xJTkVfU1RSSVAnLFxuICAgICAgdmVydGljZXM6IG5ldyBGbG9hdDMyQXJyYXkodmVydGljZXMpXG4gICAgfTtcbiAgfVxuXG59XG4iXX0=