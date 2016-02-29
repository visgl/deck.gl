'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _layer = require('./layer');

var _layer2 = _interopRequireDefault(_layer);

var _log = require('../log');

var _log2 = _interopRequireDefault(_log);

var _flatWorld = require('../flat-world');

var _flatWorld2 = _interopRequireDefault(_flatWorld);

var _viewportMercatorProject = require('viewport-mercator-project');

var _viewportMercatorProject2 = _interopRequireDefault(_viewportMercatorProject);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

var MapLayer = function (_Layer) {
  _inherits(MapLayer, _Layer);

  /**
   * @classdesc
   * MapLayer:
   * A map overlay that reacts to mapState: viewport, zoom level, etc.
   * The input data may include latitude & longitude coordinates, which
   * will be converted => screen coordinates using web-mercator projection
   *
   * @class
   * @param {object} opts
   * @param {number} opts.width - viewport width, synced with MapboxGL
   * @param {number} opts.height - viewport width, synced with MapboxGL
   * @param {string} opts.latitude - latitude of map center from MapboxGL
   * @param {string} opts.longitude - longitude of map center from MapboxGL
   * @param {string} opts.zoom - zoom level of map from MapboxGL
   */

  function MapLayer(opts) {
    _classCallCheck(this, MapLayer);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(MapLayer).call(this, opts));

    _this.checkProp(opts.width, 'width');
    _this.checkProp(opts.height, 'height');
    _this.checkProp(opts.latitude, 'latitude');
    _this.checkProp(opts.longitude, 'longitude');
    _this.checkProp(opts.zoom, 'zoom');
    return _this;
  }

  _createClass(MapLayer, [{
    key: 'initializeState',
    value: function initializeState() {
      _get(Object.getPrototypeOf(MapLayer.prototype), 'initializeState', this).call(this);

      this.setViewport();
    }
  }, {
    key: 'checkProps',
    value: function checkProps(oldProps, newProps) {
      _get(Object.getPrototypeOf(MapLayer.prototype), 'checkProps', this).call(this, oldProps, newProps);

      var viewportChanged = newProps.width !== oldProps.width || newProps.height !== oldProps.height || newProps.latitude !== oldProps.latitude || newProps.longitude !== oldProps.longitude || newProps.zoom !== oldProps.zoom;

      this.setState({ viewportChanged: viewportChanged });
    }
  }, {
    key: 'willReceiveProps',
    value: function willReceiveProps() {
      this.setViewport();
    }
  }, {
    key: 'setViewport',
    value: function setViewport() {
      var _props = this.props;
      var width = _props.width;
      var height = _props.height;
      var latitude = _props.latitude;
      var longitude = _props.longitude;
      var zoom = _props.zoom;

      this.setState({
        viewport: new _flatWorld2.default.Viewport(width, height),
        mercator: (0, _viewportMercatorProject2.default)({
          width: width, height: height, latitude: latitude, longitude: longitude, zoom: zoom,
          tileSize: 512
        })
      });
      var _state$viewport = this.state.viewport;
      var x = _state$viewport.x;
      var y = _state$viewport.y;

      this.setUniforms({
        viewport: [x, y, width, height],
        mapViewport: [longitude, latitude, zoom, _flatWorld2.default.size]
      });
      (0, _log2.default)(3, this.state.viewport, latitude, longitude, zoom);
    }

    // TODO deprecate: this funtion is only used for calculating radius now

  }, {
    key: 'project',
    value: function project(latLng) {
      var mercator = this.state.mercator;

      var _mercator$project = mercator.project([latLng[0], latLng[1]]);

      var _mercator$project2 = _slicedToArray(_mercator$project, 2);

      var x = _mercator$project2[0];
      var y = _mercator$project2[1];

      return { x: x, y: y };
    }

    // TODO deprecate: this funtion is only used for calculating radius now

  }, {
    key: 'screenToSpace',
    value: function screenToSpace(x, y) {
      var viewport = this.state.viewport;

      return viewport.screenToSpace(x, y);
    }
  }]);

  return MapLayer;
}(_layer2.default);

exports.default = MapLayer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9sYXllcnMvbWFwLWxheWVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUF5QnFCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBZ0JuQixXQWhCbUIsUUFnQm5CLENBQVksSUFBWixFQUFrQjswQkFoQkMsVUFnQkQ7O3VFQWhCQyxxQkFpQlgsT0FEVTs7QUFHaEIsVUFBSyxTQUFMLENBQWUsS0FBSyxLQUFMLEVBQVksT0FBM0IsRUFIZ0I7QUFJaEIsVUFBSyxTQUFMLENBQWUsS0FBSyxNQUFMLEVBQWEsUUFBNUIsRUFKZ0I7QUFLaEIsVUFBSyxTQUFMLENBQWUsS0FBSyxRQUFMLEVBQWUsVUFBOUIsRUFMZ0I7QUFNaEIsVUFBSyxTQUFMLENBQWUsS0FBSyxTQUFMLEVBQWdCLFdBQS9CLEVBTmdCO0FBT2hCLFVBQUssU0FBTCxDQUFlLEtBQUssSUFBTCxFQUFXLE1BQTFCLEVBUGdCOztHQUFsQjs7ZUFoQm1COztzQ0EwQkQ7QUFDaEIsaUNBM0JpQix3REEyQmpCLENBRGdCOztBQUdoQixXQUFLLFdBQUwsR0FIZ0I7Ozs7K0JBTVAsVUFBVSxVQUFVO0FBQzdCLGlDQWpDaUIsb0RBaUNBLFVBQVUsU0FBM0IsQ0FENkI7O0FBRzdCLFVBQU0sa0JBQ0osU0FBUyxLQUFULEtBQW1CLFNBQVMsS0FBVCxJQUNuQixTQUFTLE1BQVQsS0FBb0IsU0FBUyxNQUFULElBQ3BCLFNBQVMsUUFBVCxLQUFzQixTQUFTLFFBQVQsSUFDdEIsU0FBUyxTQUFULEtBQXVCLFNBQVMsU0FBVCxJQUN2QixTQUFTLElBQVQsS0FBa0IsU0FBUyxJQUFULENBUlM7O0FBVTdCLFdBQUssUUFBTCxDQUFjLEVBQUMsZ0NBQUQsRUFBZCxFQVY2Qjs7Ozt1Q0FhWjtBQUNqQixXQUFLLFdBQUwsR0FEaUI7Ozs7a0NBSUw7bUJBQ3VDLEtBQUssS0FBTCxDQUR2QztVQUNMLHFCQURLO1VBQ0UsdUJBREY7VUFDVSwyQkFEVjtVQUNvQiw2QkFEcEI7VUFDK0IsbUJBRC9COztBQUVaLFdBQUssUUFBTCxDQUFjO0FBQ1osa0JBQVUsSUFBSSxvQkFBVSxRQUFWLENBQW1CLEtBQXZCLEVBQThCLE1BQTlCLENBQVY7QUFDQSxrQkFBVSx1Q0FBaUI7QUFDekIsc0JBRHlCLEVBQ2xCLGNBRGtCLEVBQ1Ysa0JBRFUsRUFDQSxvQkFEQSxFQUNXLFVBRFg7QUFFekIsb0JBQVUsR0FBVjtTQUZRLENBQVY7T0FGRixFQUZZOzRCQVNHLEtBQUssS0FBTCxDQUFXLFFBQVgsQ0FUSDtVQVNMLHNCQVRLO1VBU0Ysc0JBVEU7O0FBVVosV0FBSyxXQUFMLENBQWlCO0FBQ2Ysa0JBQVUsQ0FBQyxDQUFELEVBQUksQ0FBSixFQUFPLEtBQVAsRUFBYyxNQUFkLENBQVY7QUFDQSxxQkFBYSxDQUFDLFNBQUQsRUFBWSxRQUFaLEVBQXNCLElBQXRCLEVBQTRCLG9CQUFVLElBQVYsQ0FBekM7T0FGRixFQVZZO0FBY1oseUJBQUksQ0FBSixFQUFPLEtBQUssS0FBTCxDQUFXLFFBQVgsRUFBcUIsUUFBNUIsRUFBc0MsU0FBdEMsRUFBaUQsSUFBakQsRUFkWTs7Ozs7Ozs0QkFrQk4sUUFBUTtVQUNQLFdBQVksS0FBSyxLQUFMLENBQVosU0FETzs7OEJBRUMsU0FBUyxPQUFULENBQWlCLENBQUMsT0FBTyxDQUFQLENBQUQsRUFBWSxPQUFPLENBQVAsQ0FBWixDQUFqQixFQUZEOzs7O1VBRVAsMEJBRk87VUFFSiwwQkFGSTs7QUFHZCxhQUFPLEVBQUMsSUFBRCxFQUFJLElBQUosRUFBUCxDQUhjOzs7Ozs7O2tDQU9GLEdBQUcsR0FBRztVQUNYLFdBQVksS0FBSyxLQUFMLENBQVosU0FEVzs7QUFFbEIsYUFBTyxTQUFTLGFBQVQsQ0FBdUIsQ0FBdkIsRUFBMEIsQ0FBMUIsQ0FBUCxDQUZrQjs7OztTQTFFRCIsImZpbGUiOiJtYXAtbGF5ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQgTGF5ZXIgZnJvbSAnLi9sYXllcic7XG5pbXBvcnQgbG9nIGZyb20gJy4uL2xvZyc7XG5pbXBvcnQgZmxhdFdvcmxkIGZyb20gJy4uL2ZsYXQtd29ybGQnO1xuaW1wb3J0IFZpZXdwb3J0TWVyY2F0b3IgZnJvbSAndmlld3BvcnQtbWVyY2F0b3ItcHJvamVjdCc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIE1hcExheWVyIGV4dGVuZHMgTGF5ZXIge1xuICAvKipcbiAgICogQGNsYXNzZGVzY1xuICAgKiBNYXBMYXllcjpcbiAgICogQSBtYXAgb3ZlcmxheSB0aGF0IHJlYWN0cyB0byBtYXBTdGF0ZTogdmlld3BvcnQsIHpvb20gbGV2ZWwsIGV0Yy5cbiAgICogVGhlIGlucHV0IGRhdGEgbWF5IGluY2x1ZGUgbGF0aXR1ZGUgJiBsb25naXR1ZGUgY29vcmRpbmF0ZXMsIHdoaWNoXG4gICAqIHdpbGwgYmUgY29udmVydGVkID0+IHNjcmVlbiBjb29yZGluYXRlcyB1c2luZyB3ZWItbWVyY2F0b3IgcHJvamVjdGlvblxuICAgKlxuICAgKiBAY2xhc3NcbiAgICogQHBhcmFtIHtvYmplY3R9IG9wdHNcbiAgICogQHBhcmFtIHtudW1iZXJ9IG9wdHMud2lkdGggLSB2aWV3cG9ydCB3aWR0aCwgc3luY2VkIHdpdGggTWFwYm94R0xcbiAgICogQHBhcmFtIHtudW1iZXJ9IG9wdHMuaGVpZ2h0IC0gdmlld3BvcnQgd2lkdGgsIHN5bmNlZCB3aXRoIE1hcGJveEdMXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBvcHRzLmxhdGl0dWRlIC0gbGF0aXR1ZGUgb2YgbWFwIGNlbnRlciBmcm9tIE1hcGJveEdMXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBvcHRzLmxvbmdpdHVkZSAtIGxvbmdpdHVkZSBvZiBtYXAgY2VudGVyIGZyb20gTWFwYm94R0xcbiAgICogQHBhcmFtIHtzdHJpbmd9IG9wdHMuem9vbSAtIHpvb20gbGV2ZWwgb2YgbWFwIGZyb20gTWFwYm94R0xcbiAgICovXG4gIGNvbnN0cnVjdG9yKG9wdHMpIHtcbiAgICBzdXBlcihvcHRzKTtcblxuICAgIHRoaXMuY2hlY2tQcm9wKG9wdHMud2lkdGgsICd3aWR0aCcpO1xuICAgIHRoaXMuY2hlY2tQcm9wKG9wdHMuaGVpZ2h0LCAnaGVpZ2h0Jyk7XG4gICAgdGhpcy5jaGVja1Byb3Aob3B0cy5sYXRpdHVkZSwgJ2xhdGl0dWRlJyk7XG4gICAgdGhpcy5jaGVja1Byb3Aob3B0cy5sb25naXR1ZGUsICdsb25naXR1ZGUnKTtcbiAgICB0aGlzLmNoZWNrUHJvcChvcHRzLnpvb20sICd6b29tJyk7XG4gIH1cblxuICBpbml0aWFsaXplU3RhdGUoKSB7XG4gICAgc3VwZXIuaW5pdGlhbGl6ZVN0YXRlKCk7XG5cbiAgICB0aGlzLnNldFZpZXdwb3J0KCk7XG4gIH1cblxuICBjaGVja1Byb3BzKG9sZFByb3BzLCBuZXdQcm9wcykge1xuICAgIHN1cGVyLmNoZWNrUHJvcHMob2xkUHJvcHMsIG5ld1Byb3BzKTtcblxuICAgIGNvbnN0IHZpZXdwb3J0Q2hhbmdlZCA9XG4gICAgICBuZXdQcm9wcy53aWR0aCAhPT0gb2xkUHJvcHMud2lkdGggfHxcbiAgICAgIG5ld1Byb3BzLmhlaWdodCAhPT0gb2xkUHJvcHMuaGVpZ2h0IHx8XG4gICAgICBuZXdQcm9wcy5sYXRpdHVkZSAhPT0gb2xkUHJvcHMubGF0aXR1ZGUgfHxcbiAgICAgIG5ld1Byb3BzLmxvbmdpdHVkZSAhPT0gb2xkUHJvcHMubG9uZ2l0dWRlIHx8XG4gICAgICBuZXdQcm9wcy56b29tICE9PSBvbGRQcm9wcy56b29tO1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7dmlld3BvcnRDaGFuZ2VkfSk7XG4gIH1cblxuICB3aWxsUmVjZWl2ZVByb3BzKCkge1xuICAgIHRoaXMuc2V0Vmlld3BvcnQoKTtcbiAgfVxuXG4gIHNldFZpZXdwb3J0KCkge1xuICAgIGNvbnN0IHt3aWR0aCwgaGVpZ2h0LCBsYXRpdHVkZSwgbG9uZ2l0dWRlLCB6b29tfSA9IHRoaXMucHJvcHM7XG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICB2aWV3cG9ydDogbmV3IGZsYXRXb3JsZC5WaWV3cG9ydCh3aWR0aCwgaGVpZ2h0KSxcbiAgICAgIG1lcmNhdG9yOiBWaWV3cG9ydE1lcmNhdG9yKHtcbiAgICAgICAgd2lkdGgsIGhlaWdodCwgbGF0aXR1ZGUsIGxvbmdpdHVkZSwgem9vbSxcbiAgICAgICAgdGlsZVNpemU6IDUxMlxuICAgICAgfSlcbiAgICB9KTtcbiAgICBjb25zdCB7eCwgeX0gPSB0aGlzLnN0YXRlLnZpZXdwb3J0O1xuICAgIHRoaXMuc2V0VW5pZm9ybXMoe1xuICAgICAgdmlld3BvcnQ6IFt4LCB5LCB3aWR0aCwgaGVpZ2h0XSxcbiAgICAgIG1hcFZpZXdwb3J0OiBbbG9uZ2l0dWRlLCBsYXRpdHVkZSwgem9vbSwgZmxhdFdvcmxkLnNpemVdXG4gICAgfSk7XG4gICAgbG9nKDMsIHRoaXMuc3RhdGUudmlld3BvcnQsIGxhdGl0dWRlLCBsb25naXR1ZGUsIHpvb20pO1xuICB9XG5cbiAgLy8gVE9ETyBkZXByZWNhdGU6IHRoaXMgZnVudGlvbiBpcyBvbmx5IHVzZWQgZm9yIGNhbGN1bGF0aW5nIHJhZGl1cyBub3dcbiAgcHJvamVjdChsYXRMbmcpIHtcbiAgICBjb25zdCB7bWVyY2F0b3J9ID0gdGhpcy5zdGF0ZTtcbiAgICBjb25zdCBbeCwgeV0gPSBtZXJjYXRvci5wcm9qZWN0KFtsYXRMbmdbMF0sIGxhdExuZ1sxXV0pO1xuICAgIHJldHVybiB7eCwgeX07XG4gIH1cblxuICAvLyBUT0RPIGRlcHJlY2F0ZTogdGhpcyBmdW50aW9uIGlzIG9ubHkgdXNlZCBmb3IgY2FsY3VsYXRpbmcgcmFkaXVzIG5vd1xuICBzY3JlZW5Ub1NwYWNlKHgsIHkpIHtcbiAgICBjb25zdCB7dmlld3BvcnR9ID0gdGhpcy5zdGF0ZTtcbiAgICByZXR1cm4gdmlld3BvcnQuc2NyZWVuVG9TcGFjZSh4LCB5KTtcbiAgfVxuXG59XG4iXX0=