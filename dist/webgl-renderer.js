'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _desc, _value, _class; // Copyright (c) 2015 Uber Technologies, Inc.
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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _autobindDecorator = require('autobind-decorator');

var _autobindDecorator2 = _interopRequireDefault(_autobindDecorator);

var _luma = require('luma.gl');

var _lodash = require('lodash.throttle');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}

var PROP_TYPES = {
  id: _react.PropTypes.string,

  width: _react.PropTypes.number.isRequired,
  height: _react.PropTypes.number.isRequired,

  pixelRatio: _react.PropTypes.number,
  viewport: _react.PropTypes.object.isRequired,
  camera: _react.PropTypes.object.isRequired,
  lights: _react.PropTypes.object,
  blending: _react.PropTypes.object,
  events: _react.PropTypes.object,

  onRendererInitialized: _react.PropTypes.func.isRequired,
  onInitializationFailed: _react.PropTypes.func,
  onError: _react.PropTypes.func,

  onBeforeRenderFrame: _react.PropTypes.func,
  onAfterRenderFrame: _react.PropTypes.func,
  onBeforeRenderPickingScene: _react.PropTypes.func,
  onAfterRenderPickingScene: _react.PropTypes.func,

  onNeedRedraw: _react.PropTypes.func,
  onMouseMove: _react.PropTypes.func,
  onClick: _react.PropTypes.func
};

var DEFAULT_PROPS = {
  id: 'webgl-canvas',
  onRendererInitialized: function onRendererInitialized() {},
  onInitializationFailed: function onInitializationFailed() {},
  onError: function onError(error) {
    throw error;
  },
  onBeforeRenderFrame: function onBeforeRenderFrame() {},
  onAfterRenderFrame: function onAfterRenderFrame() {},
  onBeforeRenderPickingScene: function onBeforeRenderPickingScene() {},
  onAfterRenderPickingScene: function onAfterRenderPickingScene() {},

  onNeedRedraw: function onNeedRedraw() {
    return true;
  },
  onMouseMove: function onMouseMove() {},
  onClick: function onClick() {}
};

var WebGLRenderer = (_class = function (_React$Component) {
  _inherits(WebGLRenderer, _React$Component);

  _createClass(WebGLRenderer, null, [{
    key: 'propTypes',
    get: function get() {
      return PROP_TYPES;
    }
  }, {
    key: 'defaultProps',
    get: function get() {
      return DEFAULT_PROPS;
    }

    /**
     * @classdesc
     * Small react component that uses Luma.GL to initialize a WebGL context.
     *
     * Returns a canvas, creates a basic WebGL context, a camera and a scene,
     * sets up a renderloop, and registers some basic event handlers
     *
     * @class
     * @param {Object} props - see propTypes documentation
     */

  }]);

  function WebGLRenderer(props) {
    _classCallCheck(this, WebGLRenderer);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(WebGLRenderer).call(this, props));

    _this.state = {
      gl: null
    };
    return _this;
  }

  _createClass(WebGLRenderer, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var canvas = _reactDom2.default.findDOMNode(this);
      this._initWebGL(canvas);
      this._animationLoop();
    }

    /**
     * Initialize LumaGL library and through it WebGL
     * @param {string} canvas
     */

  }, {
    key: '_initWebGL',
    value: function _initWebGL(canvas) {

      var gl = (0, _luma.createGLContext)(canvas);

      var events = _luma.Events.create(canvas, {
        cacheSize: false,
        cachePosition: false,
        centerOrigin: false,
        onClick: this._onClick,
        onMouseMove: (0, _lodash2.default)(this._onMouseMove, 100)
      });

      var camera = new _luma.PerspectiveCamera(this.props.camera);

      // TODO - remove program parameter from scene, or move it into options
      var scene = new _luma.Scene(gl, {
        lights: this.props.lights,
        backgroundColor: { r: 0, g: 0, b: 0, a: 0 }
      });

      this.setState({ gl: gl, camera: camera, scene: scene, events: events });

      this.props.onRendererInitialized({ gl: gl, camera: camera, scene: scene });
    }

    // TODO - move this back to luma.gl/scene.js
    /* eslint-disable max-statements */

  }, {
    key: '_pick',
    value: function _pick(x, y) {
      var _state = this.state;
      var gl = _state.gl;
      var scene = _state.scene;
      var camera = _state.camera;


      var pickedModels = scene.pickModels(gl, { camera: camera, x: x, y: y });

      return pickedModels;
    }
  }, {
    key: '_onClick',
    value: function _onClick(event) {
      var picked = this._pick(event.x, event.y);
      this.props.onClick({ event: event, picked: picked });
    }
  }, {
    key: '_onMouseMove',
    value: function _onMouseMove(event) {
      var picked = this._pick(event.x, event.y);
      this.props.onMouseMove({ event: event, picked: picked });
    }
  }, {
    key: '_renderFrame',
    value: function _renderFrame() {
      var _props = this.props;
      var _props$viewport = _props.viewport;
      var x = _props$viewport.x;
      var y = _props$viewport.y;
      var width = _props$viewport.width;
      var height = _props$viewport.height;
      var _props$blending = _props.blending;
      var enable = _props$blending.enable;
      var blendFunc = _props$blending.blendFunc;
      var blendEquation = _props$blending.blendEquation;
      var onBeforeRenderFrame = _props.onBeforeRenderFrame;
      var onAfterRenderFrame = _props.onAfterRenderFrame;
      var onNeedRedraw = _props.onNeedRedraw;
      var pixelRatio = _props.pixelRatio;
      var _state2 = this.state;
      var gl = _state2.gl;
      var scene = _state2.scene;
      var camera = _state2.camera;

      if (!gl) {
        return;
      }

      // Note: Do this after gl check, in case onNeedRedraw clears flags
      if (!onNeedRedraw()) {
        return;
      }

      // clear depth and color buffers
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      // update viewport to latest props
      // (typically changed by app on browser resize etc)
      gl.viewport(x * pixelRatio, y * pixelRatio, width * pixelRatio, height * pixelRatio);

      // setup bledning
      if (enable) {
        gl.enable(gl.BLEND);
        gl.blendFunc.apply(gl, _toConsumableArray(blendFunc.map(function (s) {
          return gl.get(s);
        })));
        gl.blendEquation(gl.get(blendEquation));
      } else {
        gl.disable(gl.BLEND);
      }

      onBeforeRenderFrame();
      scene.render(gl, { camera: camera });
      onAfterRenderFrame();
    }

    /**
     * Main WebGL animation loop
     */

  }, {
    key: '_animationLoop',
    value: function _animationLoop() {
      this._renderFrame();
      // Keep registering ourselves for the next animation frame
      _luma.Fx.requestAnimationFrame(this._animationLoop);
    }
  }, {
    key: 'render',
    value: function render() {
      var _props2 = this.props;
      var id = _props2.id;
      var width = _props2.width;
      var height = _props2.height;
      var pixelRatio = _props2.pixelRatio;

      return _react2.default.createElement('canvas', {
        id: id,
        width: width * pixelRatio || 1,
        height: height * pixelRatio || 1,
        style: { width: width, height: height } });
    }
  }]);

  return WebGLRenderer;
}(_react2.default.Component), (_applyDecoratedDescriptor(_class.prototype, '_onClick', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class.prototype, '_onClick'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, '_onMouseMove', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class.prototype, '_onMouseMove'), _class.prototype), _applyDecoratedDescriptor(_class.prototype, '_animationLoop', [_autobindDecorator2.default], Object.getOwnPropertyDescriptor(_class.prototype, '_animationLoop'), _class.prototype)), _class);
exports.default = WebGLRenderer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy93ZWJnbC1yZW5kZXJlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW9CQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLElBQU0sYUFBYTtBQUNqQixNQUFJLGlCQUFVLE1BQVY7O0FBRUosU0FBTyxpQkFBVSxNQUFWLENBQWlCLFVBQWpCO0FBQ1AsVUFBUSxpQkFBVSxNQUFWLENBQWlCLFVBQWpCOztBQUVSLGNBQVksaUJBQVUsTUFBVjtBQUNaLFlBQVUsaUJBQVUsTUFBVixDQUFpQixVQUFqQjtBQUNWLFVBQVEsaUJBQVUsTUFBVixDQUFpQixVQUFqQjtBQUNSLFVBQVEsaUJBQVUsTUFBVjtBQUNSLFlBQVUsaUJBQVUsTUFBVjtBQUNWLFVBQVEsaUJBQVUsTUFBVjs7QUFFUix5QkFBdUIsaUJBQVUsSUFBVixDQUFlLFVBQWY7QUFDdkIsMEJBQXdCLGlCQUFVLElBQVY7QUFDeEIsV0FBUyxpQkFBVSxJQUFWOztBQUVULHVCQUFxQixpQkFBVSxJQUFWO0FBQ3JCLHNCQUFvQixpQkFBVSxJQUFWO0FBQ3BCLDhCQUE0QixpQkFBVSxJQUFWO0FBQzVCLDZCQUEyQixpQkFBVSxJQUFWOztBQUUzQixnQkFBYyxpQkFBVSxJQUFWO0FBQ2QsZUFBYSxpQkFBVSxJQUFWO0FBQ2IsV0FBUyxpQkFBVSxJQUFWO0NBeEJMOztBQTJCTixJQUFNLGdCQUFnQjtBQUNwQixNQUFJLGNBQUo7QUFDQSx5QkFBdUIsaUNBQU0sRUFBTjtBQUN2QiwwQkFBd0Isa0NBQU0sRUFBTjtBQUN4QixXQUFTLHdCQUFTO0FBQ2hCLFVBQU0sS0FBTixDQURnQjtHQUFUO0FBR1QsdUJBQXFCLCtCQUFNLEVBQU47QUFDckIsc0JBQW9CLDhCQUFNLEVBQU47QUFDcEIsOEJBQTRCLHNDQUFNLEVBQU47QUFDNUIsNkJBQTJCLHFDQUFN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aEJhLFFBcUJiLENBQUcsS0FBSCxDQUFTLEdBQUcsZ0JBQUgsR0FBc0IsR0FBRyxnQkFBSCxDQUEvQjs7OztBQXJCYSxRQXlCYixDQUFHLFFBQUgsQ0FDRSxJQUFJLFVBQUosRUFDQSxJQUFJLFVBQUosRUFDQSxRQUFRLFVBQVIsRUFDQSxTQUFTLFVBQVQsQ0FKRjs7O0FBekJhLFVBaUNULE1BQUosRUFBWTtBQUNWLFdBQUcsTUFBSCxDQUFVLEdBQUcsS0FBSCxDQUFWLENBRFU7QUFFVixXQUFHLFNBQUgsOEJBQWdCLFVBQVUsR0FBVixDQUFjO2lCQUFLLEdBQUcsR0FBSCxDQUFPLENBQVA7U0FBTCxFQUE5QixFQUZVO0FBR1YsV0FBRyxhQUFILENBQWlCLEdBQUcsR0FBSCxDQUFPLGFBQVAsQ0FBakIsRUFIVTtPQUFaLE1BSU87QUFDTCxXQUFHLE9BQUgsQ0FBVyxHQUFHLEtBQUgsQ0FBWCxDQURLO09BSlA7O0FBUUEsNEJBekNhO0FBMENiLFlBQU0sTUFBTixDQUFhLEVBQWIsRUFBaUIsRUFBQyxjQUFELEVBQWpCLEVBMUNhO0FBMkNiLDJCQTNDYTs7Ozs7Ozs7O3FDQWtERTtBQUNmLFdBQUssWUFBTDs7QUFEZSxjQUdmLENBQUcscUJBQUgsQ0FBeUIsS0FBSyxjQUFMLENBQXpCLENBSGU7Ozs7NkJBTVI7b0JBQ2lDLEtBQUssS0FBTCxDQURqQztVQUNBLGdCQURBO1VBQ0ksc0JBREo7VUFDVyx3QkFEWDtVQUNtQixnQ0FEbkI7O0FBRVAsYUFDRTtBQUNFLFlBQUssRUFBTDtBQUNBLGVBQVEsUUFBUSxVQUFSLElBQXNCLENBQXRCO0FBQ1IsZ0JBQVMsU0FBUyxVQUFULElBQXVCLENBQXZCO0FBQ1QsZUFBUSxFQUFDLFlBQUQsRUFBUSxjQUFSLEVBQVIsRUFKRixDQURGLENBRk87Ozs7U0E1SVU7RUFBc0IsZ0JBQU0sU0FBTjtrQkFBdEIiLCJmaWxlIjoid2ViZ2wtcmVuZGVyZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQgUmVhY3QsIHtQcm9wVHlwZXN9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBSZWFjdERPTSBmcm9tICdyZWFjdC1kb20nO1xuaW1wb3J0IGF1dG9iaW5kIGZyb20gJ2F1dG9iaW5kLWRlY29yYXRvcic7XG5pbXBvcnQge2NyZWF0ZUdMQ29udGV4dCwgUGVyc3BlY3RpdmVDYW1lcmEsIFNjZW5lLCBFdmVudHMsIEZ4fSBmcm9tICdsdW1hLmdsJztcbmltcG9ydCB0aHJvdHRsZSBmcm9tICdsb2Rhc2gudGhyb3R0bGUnO1xuXG5jb25zdCBQUk9QX1RZUEVTID0ge1xuICBpZDogUHJvcFR5cGVzLnN0cmluZyxcblxuICB3aWR0aDogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuICBoZWlnaHQ6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcblxuICBwaXhlbFJhdGlvOiBQcm9wVHlwZXMubnVtYmVyLFxuICB2aWV3cG9ydDogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICBjYW1lcmE6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgbGlnaHRzOiBQcm9wVHlwZXMub2JqZWN0LFxuICBibGVuZGluZzogUHJvcFR5cGVzLm9iamVjdCxcbiAgZXZlbnRzOiBQcm9wVHlwZXMub2JqZWN0LFxuXG4gIG9uUmVuZGVyZXJJbml0aWFsaXplZDogUHJvcFR5cGVzLmZ1bmMuaXNSZXF1aXJlZCxcbiAgb25Jbml0aWFsaXphdGlvbkZhaWxlZDogUHJvcFR5cGVzLmZ1bmMsXG4gIG9uRXJyb3I6IFByb3BUeXBlcy5mdW5jLFxuXG4gIG9uQmVmb3JlUmVuZGVyRnJhbWU6IFByb3BUeXBlcy5mdW5jLFxuICBvbkFmdGVyUmVuZGVyRnJhbWU6IFByb3BUeXBlcy5mdW5jLFxuICBvbkJlZm9yZVJlbmRlclBpY2tpbmdTY2VuZTogUHJvcFR5cGVzLmZ1bmMsXG4gIG9uQWZ0ZXJSZW5kZXJQaWNraW5nU2NlbmU6IFByb3BUeXBlcy5mdW5jLFxuXG4gIG9uTmVlZFJlZHJhdzogUHJvcFR5cGVzLmZ1bmMsXG4gIG9uTW91c2VNb3ZlOiBQcm9wVHlwZXMuZnVuYyxcbiAgb25DbGljazogUHJvcFR5cGVzLmZ1bmNcbn07XG5cbmNvbnN0IERFRkFVTFRfUFJPUFMgPSB7XG4gIGlkOiAnd2ViZ2wtY2FudmFzJyxcbiAgb25SZW5kZXJlckluaXRpYWxpemVkOiAoKSA9PiB7fSxcbiAgb25Jbml0aWFsaXphdGlvbkZhaWxlZDogKCkgPT4ge30sXG4gIG9uRXJyb3I6IGVycm9yID0+IHtcbiAgICB0aHJvdyBlcnJvcjtcbiAgfSxcbiAgb25CZWZvcmVSZW5kZXJGcmFtZTogKCkgPT4ge30sXG4gIG9uQWZ0ZXJSZW5kZXJGcmFtZTogKCkgPT4ge30sXG4gIG9uQmVmb3JlUmVuZGVyUGlja2luZ1NjZW5lOiAoKSA9PiB7fSxcbiAgb25BZnRlclJlbmRlclBpY2tpbmdTY2VuZTogKCkgPT4ge30sXG5cbiAgb25OZWVkUmVkcmF3OiAoKSA9PiB0cnVlLFxuICBvbk1vdXNlTW92ZTogKCkgPT4ge30sXG4gIG9uQ2xpY2s6ICgpID0+IHt9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBXZWJHTFJlbmRlcmVyIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICBzdGF0aWMgZ2V0IHByb3BUeXBlcygpIHtcbiAgICByZXR1cm4gUFJPUF9UWVBFUztcbiAgfVxuXG4gIHN0YXRpYyBnZXQgZGVmYXVsdFByb3BzKCkge1xuICAgIHJldHVybiBERUZBVUxUX1BST1BTO1xuICB9XG5cbiAgLyoqXG4gICAqIEBjbGFzc2Rlc2NcbiAgICogU21hbGwgcmVhY3QgY29tcG9uZW50IHRoYXQgdXNlcyBMdW1hLkdMIHRvIGluaXRpYWxpemUgYSBXZWJHTCBjb250ZXh0LlxuICAgKlxuICAgKiBSZXR1cm5zIGEgY2FudmFzLCBjcmVhdGVzIGEgYmFzaWMgV2ViR0wgY29udGV4dCwgYSBjYW1lcmEgYW5kIGEgc2NlbmUsXG4gICAqIHNldHMgdXAgYSByZW5kZXJsb29wLCBhbmQgcmVnaXN0ZXJzIHNvbWUgYmFzaWMgZXZlbnQgaGFuZGxlcnNcbiAgICpcbiAgICogQGNsYXNzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwcm9wcyAtIHNlZSBwcm9wVHlwZXMgZG9jdW1lbnRhdGlvblxuICAgKi9cbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGdsOiBudWxsXG4gICAgfTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIGNvbnN0IGNhbnZhcyA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMpO1xuICAgIHRoaXMuX2luaXRXZWJHTChjYW52YXMpO1xuICAgIHRoaXMuX2FuaW1hdGlvbkxvb3AoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplIEx1bWFHTCBsaWJyYXJ5IGFuZCB0aHJvdWdoIGl0IFdlYkdMXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBjYW52YXNcbiAgICovXG4gIF9pbml0V2ViR0woY2FudmFzKSB7XG5cbiAgICBjb25zdCBnbCA9IGNyZWF0ZUdMQ29udGV4dChjYW52YXMpO1xuXG4gICAgY29uc3QgZXZlbnRzID0gRXZlbnRzLmNyZWF0ZShjYW52YXMsIHtcbiAgICAgIGNhY2hlU2l6ZTogZmFsc2UsXG4gICAgICBjYWNoZVBvc2l0aW9uOiBmYWxzZSxcbiAgICAgIGNlbnRlck9yaWdpbjogZmFsc2UsXG4gICAgICBvbkNsaWNrOiB0aGlzLl9vbkNsaWNrLFxuICAgICAgb25Nb3VzZU1vdmU6IHRocm90dGxlKHRoaXMuX29uTW91c2VNb3ZlLCAxMDApXG4gICAgfSk7XG5cbiAgICBjb25zdCBjYW1lcmEgPSBuZXcgUGVyc3BlY3RpdmVDYW1lcmEodGhpcy5wcm9wcy5jYW1lcmEpO1xuXG4gICAgLy8gVE9ETyAtIHJlbW92ZSBwcm9ncmFtIHBhcmFtZXRlciBmcm9tIHNjZW5lLCBvciBtb3ZlIGl0IGludG8gb3B0aW9uc1xuICAgIGNvbnN0IHNjZW5lID0gbmV3IFNjZW5lKGdsLCB7XG4gICAgICBsaWdodHM6IHRoaXMucHJvcHMubGlnaHRzLFxuICAgICAgYmFja2dyb3VuZENvbG9yOiB7cjogMCwgZzogMCwgYjogMCwgYTogMH1cbiAgICB9KTtcblxuICAgIHRoaXMuc2V0U3RhdGUoe2dsLCBjYW1lcmEsIHNjZW5lLCBldmVudHN9KTtcblxuICAgIHRoaXMucHJvcHMub25SZW5kZXJlckluaXRpYWxpemVkKHtnbCwgY2FtZXJhLCBzY2VuZX0pO1xuICB9XG5cbiAgLy8gVE9ETyAtIG1vdmUgdGhpcyBiYWNrIHRvIGx1bWEuZ2wvc2NlbmUuanNcbiAgLyogZXNsaW50LWRpc2FibGUgbWF4LXN0YXRlbWVudHMgKi9cbiAgX3BpY2soeCwgeSkge1xuICAgIGNvbnN0IHtnbCwgc2NlbmUsIGNhbWVyYX0gPSB0aGlzLnN0YXRlO1xuXG4gICAgY29uc3QgcGlja2VkTW9kZWxzID0gc2NlbmUucGlja01vZGVscyhnbCwge2NhbWVyYSwgeCwgeX0pO1xuXG4gICAgcmV0dXJuIHBpY2tlZE1vZGVscztcbiAgfVxuXG4gIEBhdXRvYmluZFxuICBfb25DbGljayhldmVudCkge1xuICAgIGNvbnN0IHBpY2tlZCA9IHRoaXMuX3BpY2soZXZlbnQueCwgZXZlbnQueSk7XG4gICAgdGhpcy5wcm9wcy5vbkNsaWNrKHtldmVudCwgcGlja2VkfSk7XG4gIH1cblxuICBAYXV0b2JpbmRcbiAgX29uTW91c2VNb3ZlKGV2ZW50KSB7XG4gICAgY29uc3QgcGlja2VkID0gdGhpcy5fcGljayhldmVudC54LCBldmVudC55KTtcbiAgICB0aGlzLnByb3BzLm9uTW91c2VNb3ZlKHtldmVudCwgcGlja2VkfSk7XG4gIH1cblxuICBfcmVuZGVyRnJhbWUoKSB7XG4gICAgY29uc3Qge1xuICAgICAgdmlld3BvcnQ6IHt4LCB5LCB3aWR0aCwgaGVpZ2h0fSxcbiAgICAgIGJsZW5kaW5nOiB7ZW5hYmxlLCBibGVuZEZ1bmMsIGJsZW5kRXF1YXRpb259LFxuICAgICAgb25CZWZvcmVSZW5kZXJGcmFtZSxcbiAgICAgIG9uQWZ0ZXJSZW5kZXJGcmFtZSxcbiAgICAgIG9uTmVlZFJlZHJhdyxcbiAgICAgIHBpeGVsUmF0aW9cbiAgICB9ID0gdGhpcy5wcm9wcztcblxuICAgIGNvbnN0IHtnbCwgc2NlbmUsIGNhbWVyYX0gPSB0aGlzLnN0YXRlO1xuICAgIGlmICghZ2wpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBOb3RlOiBEbyB0aGlzIGFmdGVyIGdsIGNoZWNrLCBpbiBjYXNlIG9uTmVlZFJlZHJhdyBjbGVhcnMgZmxhZ3NcbiAgICBpZiAoIW9uTmVlZFJlZHJhdygpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gY2xlYXIgZGVwdGggYW5kIGNvbG9yIGJ1ZmZlcnNcbiAgICBnbC5jbGVhcihnbC5DT0xPUl9CVUZGRVJfQklUIHwgZ2wuREVQVEhfQlVGRkVSX0JJVCk7XG5cbiAgICAvLyB1cGRhdGUgdmlld3BvcnQgdG8gbGF0ZXN0IHByb3BzXG4gICAgLy8gKHR5cGljYWxseSBjaGFuZ2VkIGJ5IGFwcCBvbiBicm93c2VyIHJlc2l6ZSBldGMpXG4gICAgZ2wudmlld3BvcnQoXG4gICAgICB4ICogcGl4ZWxSYXRpbyxcbiAgICAgIHkgKiBwaXhlbFJhdGlvLFxuICAgICAgd2lkdGggKiBwaXhlbFJhdGlvLFxuICAgICAgaGVpZ2h0ICogcGl4ZWxSYXRpb1xuICAgICk7XG5cbiAgICAvLyBzZXR1cCBibGVkbmluZ1xuICAgIGlmIChlbmFibGUpIHtcbiAgICAgIGdsLmVuYWJsZShnbC5CTEVORCk7XG4gICAgICBnbC5ibGVuZEZ1bmMoLi4uYmxlbmRGdW5jLm1hcChzID0+IGdsLmdldChzKSkpO1xuICAgICAgZ2wuYmxlbmRFcXVhdGlvbihnbC5nZXQoYmxlbmRFcXVhdGlvbikpO1xuICAgIH0gZWxzZSB7XG4gICAgICBnbC5kaXNhYmxlKGdsLkJMRU5EKTtcbiAgICB9XG5cbiAgICBvbkJlZm9yZVJlbmRlckZyYW1lKCk7XG4gICAgc2NlbmUucmVuZGVyKGdsLCB7Y2FtZXJhfSk7XG4gICAgb25BZnRlclJlbmRlckZyYW1lKCk7XG4gIH1cblxuICAvKipcbiAgICogTWFpbiBXZWJHTCBhbmltYXRpb24gbG9vcFxuICAgKi9cbiAgQGF1dG9iaW5kXG4gIF9hbmltYXRpb25Mb29wKCkge1xuICAgIHRoaXMuX3JlbmRlckZyYW1lKCk7XG4gICAgLy8gS2VlcCByZWdpc3RlcmluZyBvdXJzZWx2ZXMgZm9yIHRoZSBuZXh0IGFuaW1hdGlvbiBmcmFtZVxuICAgIEZ4LnJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLl9hbmltYXRpb25Mb29wKTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7aWQsIHdpZHRoLCBoZWlnaHQsIHBpeGVsUmF0aW99ID0gdGhpcy5wcm9wcztcbiAgICByZXR1cm4gKFxuICAgICAgPGNhbnZhc1xuICAgICAgICBpZD17IGlkIH1cbiAgICAgICAgd2lkdGg9eyB3aWR0aCAqIHBpeGVsUmF0aW8gfHwgMSB9XG4gICAgICAgIGhlaWdodD17IGhlaWdodCAqIHBpeGVsUmF0aW8gfHwgMSB9XG4gICAgICAgIHN0eWxlPXsge3dpZHRoLCBoZWlnaHR9IH0vPlxuICAgICk7XG4gIH1cblxufVxuIl19