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
      _get(Object.getPrototypeOf(ArcLayer.prototype), 'initializeState', this).call(this);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9sYXllcnMvYXJjLWxheWVyL2FyYy1sYXllci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQW9CQTs7OztBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFDQSxJQUFNLFVBQVUsUUFBUSxTQUFSLENBQVY7O0FBRU4sSUFBTSxhQUFhO0FBQ2pCLGFBQVcsRUFBQyxNQUFNLENBQU4sRUFBUyxLQUFLLElBQUwsRUFBVyxLQUFLLElBQUwsRUFBVyxLQUFLLElBQUwsRUFBVyxLQUFLLElBQUwsRUFBdEQ7Q0FESTs7SUFJZTs7Ozs7Ozs7Ozs7QUFRbkIsV0FSbUIsUUFRbkIsQ0FBWSxJQUFaLEVBQWtCOzBCQVJDLFVBUUQ7O2tFQVJDLHFCQVNYLE9BRFU7R0FBbEI7O2VBUm1COztzQ0FZRDtBQUNoQixpQ0FiaUIsd0RBYWpCLENBRGdCO21CQUVlLEtBQUssS0FBTCxDQUZmO1VBRVQsZUFGUztVQUVMLDJDQUZLOzs7QUFJaEIsV0FBSyxRQUFMLENBQWM7QUFDWixlQUFPLEtBQUssV0FBTCxDQUFpQixFQUFqQixDQUFQO09BREYsRUFKZ0I7O0FBUWhCLHVCQUFpQixZQUFqQixDQUE4QixVQUE5QixFQUEwQztBQUN4QyxtQkFBVyxFQUFDLFFBQVEsS0FBSyxrQkFBTCxFQUFwQjtPQURGLEVBUmdCOztBQVloQixXQUFLLFlBQUwsR0FaZ0I7Ozs7cUNBZUQsVUFBVSxXQUFXO0FBQ3BDLGlDQTVCaUIsMERBNEJNLFVBQVUsVUFBakMsQ0FEb0M7QUFFcEMsV0FBSyxZQUFMLEdBRm9DOzs7O2dDQUsxQixJQUFJO0FBQ2QsVUFBSSxXQUFXLEVBQVgsQ0FEVTtBQUVkLFVBQU0sZUFBZSxFQUFmLENBRlE7QUFHZCxXQUFLLElBQUksSUFBSSxDQUFKLEVBQU8sSUFBSSxZQUFKLEVBQWtCLEdBQWxDLEVBQXVDO0FBQ3JDLGdEQUFlLFlBQVUsR0FBRyxHQUFHLEdBQS9CLENBRHFDO09BQXZDOztBQUlBLGFBQU8sZ0JBQVU7QUFDZixpQkFBUyxrQkFBWSxFQUFaLEVBQWdCO0FBQ3ZCLGNBQUksUUFBUSx5QkFBUixDQUFKO0FBQ0EsY0FBSSxRQUFRLDJCQUFSLENBQUo7QUFDQSxjQUFJLEtBQUo7U0FITyxDQUFUO0FBS0Esa0JBQVUsbUJBQWE7QUFDckIsY0FBSSxLQUFKO0FBQ0Esb0JBQVUsWUFBVjtBQUNBLG9CQUFVLElBQUksWUFBSixDQUFpQixRQUFqQixDQUFWO1NBSFEsQ0FBVjtBQUtBLG1CQUFXLElBQVg7T0FYSyxDQUFQLENBUGM7Ozs7bUNBc0JEOztBQUViLFVBQU0sU0FBUyxLQUFLLGNBQUwsRUFBVCxDQUZPO0FBR2IsVUFBSSxNQUFKLEVBQVk7QUFDVixhQUFLLFdBQUwsQ0FBaUI7QUFDZixrQkFBUSxPQUFPLE1BQVAsQ0FBYyxFQUFkO0FBQ1Isa0JBQVEsT0FBTyxNQUFQLENBQWMsRUFBZDtTQUZWLEVBRFU7T0FBWjs7Ozt1Q0FRaUIsV0FBVztVQUNyQixPQUFRLEtBQUssS0FBTCxDQUFSLEtBRHFCO1VBRXJCLFFBQWUsVUFBZixNQUZxQjtVQUVkLE9BQVEsVUFBUixLQUZjOztBQUc1QixVQUFJLElBQUksQ0FBSixDQUh3Qjs7Ozs7O0FBSTVCLDZCQUFrQiw4QkFBbEIsb0dBQXdCO2NBQWIsa0JBQWE7O0FBQ3RCLGdCQUFNLElBQUksQ0FBSixDQUFOLEdBQWUsSUFBSSxRQUFKLENBQWEsRUFBYixDQURPO0FBRXRCLGdCQUFNLElBQUksQ0FBSixDQUFOLEdBQWUsSUFBSSxRQUFKLENBQWEsRUFBYixDQUZPO0FBR3RCLGdCQUFNLElBQUksQ0FBSixDQUFOLEdBQWUsSUFBSSxRQUFKLENBQWEsRUFBYixDQUhPO0FBSXRCLGdCQUFNLElBQUksQ0FBSixDQUFOLEdBQWUsSUFBSSxRQUFKLENBQWEsRUFBYixDQUpPO0FBS3RCLGVBQUssSUFBTCxDQUxzQjtTQUF4Qjs7Ozs7Ozs7Ozs7Ozs7T0FKNEI7Ozs7U0FqRVgiLCJmaWxlIjoiYXJjLWxheWVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IExheWVyIGZyb20gJy4uLy4uL2xheWVyJztcbmltcG9ydCB7TW9kZWwsIFByb2dyYW0sIEdlb21ldHJ5fSBmcm9tICdsdW1hLmdsJztcbmNvbnN0IGdsc2xpZnkgPSByZXF1aXJlKCdnbHNsaWZ5Jyk7XG5cbmNvbnN0IEFUVFJJQlVURVMgPSB7XG4gIHBvc2l0aW9uczoge3NpemU6IDQsICcwJzogJ3gwJywgJzEnOiAneTAnLCAnMic6ICd4MScsICczJzogJ3kxJ31cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEFyY0xheWVyIGV4dGVuZHMgTGF5ZXIge1xuICAvKipcbiAgICogQGNsYXNzZGVzY1xuICAgKiBBcmNMYXllclxuICAgKlxuICAgKiBAY2xhc3NcbiAgICogQHBhcmFtIHtvYmplY3R9IG9wdHNcbiAgICovXG4gIGNvbnN0cnVjdG9yKG9wdHMpIHtcbiAgICBzdXBlcihvcHRzKTtcbiAgfVxuXG4gIGluaXRpYWxpemVTdGF0ZSgpIHtcbiAgICBzdXBlci5pbml0aWFsaXplU3RhdGUoKTtcbiAgICBjb25zdCB7Z2wsIGF0dHJpYnV0ZU1hbmFnZXJ9ID0gdGhpcy5zdGF0ZTtcblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgbW9kZWw6IHRoaXMuY3JlYXRlTW9kZWwoZ2wpXG4gICAgfSk7XG5cbiAgICBhdHRyaWJ1dGVNYW5hZ2VyLmFkZEluc3RhbmNlZChBVFRSSUJVVEVTLCB7XG4gICAgICBwb3NpdGlvbnM6IHt1cGRhdGU6IHRoaXMuY2FsY3VsYXRlUG9zaXRpb25zfVxuICAgIH0pO1xuXG4gICAgdGhpcy51cGRhdGVDb2xvcnMoKTtcbiAgfVxuXG4gIHdpbGxSZWNlaXZlUHJvcHMob2xkUHJvcHMsIG5leHRQcm9wcykge1xuICAgIHN1cGVyLndpbGxSZWNlaXZlUHJvcHMob2xkUHJvcHMsIG5leHRQcm9wcyk7XG4gICAgdGhpcy51cGRhdGVDb2xvcnMoKTtcbiAgfVxuXG4gIGNyZWF0ZU1vZGVsKGdsKSB7XG4gICAgbGV0IHZlcnRpY2VzID0gW107XG4gICAgY29uc3QgTlVNX1NFR01FTlRTID0gNTA7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBOVU1fU0VHTUVOVFM7IGkrKykge1xuICAgICAgdmVydGljZXMgPSBbLi4udmVydGljZXMsIGksIGksIGldO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgTW9kZWwoe1xuICAgICAgcHJvZ3JhbTogbmV3IFByb2dyYW0oZ2wsIHtcbiAgICAgICAgdnM6IGdsc2xpZnkoJy4vYXJjLWxheWVyLXZlcnRleC5nbHNsJyksXG4gICAgICAgIGZzOiBnbHNsaWZ5KCcuL2FyYy1sYXllci1mcmFnbWVudC5nbHNsJyksXG4gICAgICAgIGlkOiAnYXJjJ1xuICAgICAgfSksXG4gICAgICBnZW9tZXRyeTogbmV3IEdlb21ldHJ5KHtcbiAgICAgICAgaWQ6ICdhcmMnLFxuICAgICAgICBkcmF3TW9kZTogJ0xJTkVfU1RSSVAnLFxuICAgICAgICB2ZXJ0aWNlczogbmV3IEZsb2F0MzJBcnJheSh2ZXJ0aWNlcylcbiAgICAgIH0pLFxuICAgICAgaW5zdGFuY2VkOiB0cnVlXG4gICAgfSk7XG4gIH1cblxuICB1cGRhdGVDb2xvcnMoKSB7XG4gICAgLy8gR2V0IGNvbG9ycyBmcm9tIGZpcnN0IG9iamVjdFxuICAgIGNvbnN0IG9iamVjdCA9IHRoaXMuZ2V0Rmlyc3RPYmplY3QoKTtcbiAgICBpZiAob2JqZWN0KSB7XG4gICAgICB0aGlzLnNldFVuaWZvcm1zKHtcbiAgICAgICAgY29sb3IwOiBvYmplY3QuY29sb3JzLmMwLFxuICAgICAgICBjb2xvcjE6IG9iamVjdC5jb2xvcnMuYzFcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGNhbGN1bGF0ZVBvc2l0aW9ucyhhdHRyaWJ1dGUpIHtcbiAgICBjb25zdCB7ZGF0YX0gPSB0aGlzLnByb3BzO1xuICAgIGNvbnN0IHt2YWx1ZSwgc2l6ZX0gPSBhdHRyaWJ1dGU7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAoY29uc3QgYXJjIG9mIGRhdGEpIHtcbiAgICAgIHZhbHVlW2kgKyAwXSA9IGFyYy5wb3NpdGlvbi54MDtcbiAgICAgIHZhbHVlW2kgKyAxXSA9IGFyYy5wb3NpdGlvbi55MDtcbiAgICAgIHZhbHVlW2kgKyAyXSA9IGFyYy5wb3NpdGlvbi54MTtcbiAgICAgIHZhbHVlW2kgKyAzXSA9IGFyYy5wb3NpdGlvbi55MTtcbiAgICAgIGkgKz0gc2l6ZTtcbiAgICB9XG4gIH1cblxufVxuIl19