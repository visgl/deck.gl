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

      // events={ {
      //   onObjectHovered: this._handleObjectHovered,
      //   onObjectClicked: this._handleObjectClicked
      // } }

      var camera = new _luma.PerspectiveCamera(this.props.camera);

      // TODO - remove program parameter from scene, or move it into options
      var scene = new _luma.Scene(gl, {
        camera: camera,
        lights: this.props.lights,
        backgroundColor: { r: 0, g: 0, b: 0, a: 0 }
      });

      this.setState({ gl: gl, camera: camera, scene: scene, events: events });

      this.props.onRendererInitialized({ gl: gl, camera: camera, scene: scene });
    }

    // TODO - move this to luma.gl/pick.js or model.js?
    /* eslint-disable max-statements */

  }, {
    key: '_pick',
    value: function _pick(x, y) {
      var _state = this.state;
      var gl = _state.gl;
      var scene = _state.scene;
      var camera = _state.camera;


      if (this._pickingFBO === undefined) {
        this._pickingFBO = new _luma.Framebuffer(gl, {
          width: gl.canvas.width,
          height: gl.canvas.height
        });
      }

      this._pickingFBO.bind();

      gl.enable(gl.SCISSOR_TEST);
      gl.scissor(x, gl.canvas.height - y, 1, 1);

      var picked = [];

      // TODO - iterate in reverse order?
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = scene.models[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var model = _step.value;

          if (model.pickable) {
            var program = model.program;
            program.use();
            program.setUniform('enablePicking', 1);
            model.onBeforeRender();
            var view = camera.view;
            var matrix = model.matrix;

            var worldMatrix = view.mulMat4(matrix);

            model.setState(program);

            program.setUniform('worldMatrix', worldMatrix);

            gl.clear(gl.COLOR_BUFFER_BIT);

            model.render();

            // Read the color in the central pixel, to be mapped with picking colors
            var color = new Uint8Array(4);
            gl.readPixels(x, gl.canvas.height - y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, color);

            picked.push({ model: model, color: color });

            program.setUniform('enablePicking', 0);

            model.unsetState(program);
          }
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

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.disable(gl.SCISSOR_TEST);
      return picked;
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

      if (!gl) {
        return;
      }

      // Note: Do this after gl check, in case onNeedRedraw clears flags
      if (!onNeedRedraw()) {}
      // return;


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
      scene.render();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy93ZWJnbC1yZW5kZXJlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTJCQSxJQUFNLGFBQWE7QUFDakIsTUFBSSxpQkFBVSxNQUFWOztBQUVKLFNBQU8saUJBQVUsTUFBVixDQUFpQixVQUFqQjtBQUNQLFVBQVEsaUJBQVUsTUFBVixDQUFpQixVQUFqQjs7QUFFUixjQUFZLGlCQUFVLE1BQVY7QUFDWixZQUFVLGlCQUFVLE1BQVYsQ0FBaUIsVUFBakI7QUFDVixVQUFRLGlCQUFVLE1BQVYsQ0FBaUIsVUFBakI7QUFDUixVQUFRLGlCQUFVLE1BQVY7QUFDUixZQUFVLGlCQUFVLE1BQVY7QUFDVixVQUFRLGlCQUFVLE1BQVY7O0FBRVIseUJBQXVCLGlCQUFVLElBQVYsQ0FBZSxVQUFmO0FBQ3ZCLDBCQUF3QixpQkFBVSxJQUFWO0FBQ3hCLFdBQVMsaUJBQVUsSUFBVjs7QUFFVCx1QkFBcUIsaUJBQVUsSUFBVjtBQUNyQixzQkFBb0IsaUJBQVUsSUFBVjtBQUNwQiw4QkFBNEIsaUJBQVUsSUFBVjtBQUM1Qiw2QkFBMkIsaUJBQVUsSUFBVjs7QUFFM0IsZ0JBQWMsaUJBQVUsSUFBVjtBQUNkLGVBQWEsaUJBQVUsSUFBVjtBQUNiLFdBQVMsaUJBQVUsSUFBVjtDQXhCTDs7QUEyQk4sSUFBTSxnQkFBZ0I7QUFDcEIsTUFBSSxjQUFKO0FBQ0EseUJBQXVCLGlDQUFNLEVBQU47QUFDdkIsMEJBQXdCLGtDQUFNLEVBQU47QUFDeEIsV0FBUyx3QkFBUztBQUNoQixVQUFNLEtBQU4sQ0FEZ0I7R0FBVDtBQUdULHVCQUFxQiwrQkFBTSxFQUFOO0FBQ3JCLHNCQUFvQiw4QkFBTSxFQUFOO0FBQ3BCLDhCQUE0QixzQ0FBTSxFQUFOO0FBQzVCLDZCQUEyQixxQ0FBTSxFQUFOOztBQUUzQixnQkFBYztX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Q1IsZ0JBQVMsU0FBUyxVQUFULElBQXVCLENBQXZCO0FBQ1QsZUFBUSxFQUFDLFlBQUQsRUFBUSxjQUFSLEVBQVIsRUFKRixDQURGLENBRk87Ozs7U0FqTVU7RUFBc0IsZ0JBQU0sU0FBTjtrQkFBdEIiLCJmaWxlIjoid2ViZ2wtcmVuZGVyZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG5pbXBvcnQgUmVhY3QsIHtQcm9wVHlwZXN9IGZyb20gJ3JlYWN0JztcbmltcG9ydCBSZWFjdERPTSBmcm9tICdyZWFjdC1kb20nO1xuaW1wb3J0IGF1dG9iaW5kIGZyb20gJ2F1dG9iaW5kLWRlY29yYXRvcic7XG5pbXBvcnQge2NyZWF0ZUdMQ29udGV4dCwgUGVyc3BlY3RpdmVDYW1lcmEsIFNjZW5lLCBFdmVudHMsIEZ4LCBGcmFtZWJ1ZmZlcn1cbiAgZnJvbSAnbHVtYS5nbCc7XG5pbXBvcnQgdGhyb3R0bGUgZnJvbSAnbG9kYXNoLnRocm90dGxlJztcblxuY29uc3QgUFJPUF9UWVBFUyA9IHtcbiAgaWQ6IFByb3BUeXBlcy5zdHJpbmcsXG5cbiAgd2lkdGg6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgaGVpZ2h0OiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG5cbiAgcGl4ZWxSYXRpbzogUHJvcFR5cGVzLm51bWJlcixcbiAgdmlld3BvcnQ6IFByb3BUeXBlcy5vYmplY3QuaXNSZXF1aXJlZCxcbiAgY2FtZXJhOiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gIGxpZ2h0czogUHJvcFR5cGVzLm9iamVjdCxcbiAgYmxlbmRpbmc6IFByb3BUeXBlcy5vYmplY3QsXG4gIGV2ZW50czogUHJvcFR5cGVzLm9iamVjdCxcblxuICBvblJlbmRlcmVySW5pdGlhbGl6ZWQ6IFByb3BUeXBlcy5mdW5jLmlzUmVxdWlyZWQsXG4gIG9uSW5pdGlhbGl6YXRpb25GYWlsZWQ6IFByb3BUeXBlcy5mdW5jLFxuICBvbkVycm9yOiBQcm9wVHlwZXMuZnVuYyxcblxuICBvbkJlZm9yZVJlbmRlckZyYW1lOiBQcm9wVHlwZXMuZnVuYyxcbiAgb25BZnRlclJlbmRlckZyYW1lOiBQcm9wVHlwZXMuZnVuYyxcbiAgb25CZWZvcmVSZW5kZXJQaWNraW5nU2NlbmU6IFByb3BUeXBlcy5mdW5jLFxuICBvbkFmdGVyUmVuZGVyUGlja2luZ1NjZW5lOiBQcm9wVHlwZXMuZnVuYyxcblxuICBvbk5lZWRSZWRyYXc6IFByb3BUeXBlcy5mdW5jLFxuICBvbk1vdXNlTW92ZTogUHJvcFR5cGVzLmZ1bmMsXG4gIG9uQ2xpY2s6IFByb3BUeXBlcy5mdW5jXG59O1xuXG5jb25zdCBERUZBVUxUX1BST1BTID0ge1xuICBpZDogJ3dlYmdsLWNhbnZhcycsXG4gIG9uUmVuZGVyZXJJbml0aWFsaXplZDogKCkgPT4ge30sXG4gIG9uSW5pdGlhbGl6YXRpb25GYWlsZWQ6ICgpID0+IHt9LFxuICBvbkVycm9yOiBlcnJvciA9PiB7XG4gICAgdGhyb3cgZXJyb3I7XG4gIH0sXG4gIG9uQmVmb3JlUmVuZGVyRnJhbWU6ICgpID0+IHt9LFxuICBvbkFmdGVyUmVuZGVyRnJhbWU6ICgpID0+IHt9LFxuICBvbkJlZm9yZVJlbmRlclBpY2tpbmdTY2VuZTogKCkgPT4ge30sXG4gIG9uQWZ0ZXJSZW5kZXJQaWNraW5nU2NlbmU6ICgpID0+IHt9LFxuXG4gIG9uTmVlZFJlZHJhdzogKCkgPT4gdHJ1ZSxcbiAgb25Nb3VzZU1vdmU6ICgpID0+IHt9LFxuICBvbkNsaWNrOiAoKSA9PiB7fVxufTtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgV2ViR0xSZW5kZXJlciBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgc3RhdGljIGdldCBwcm9wVHlwZXMoKSB7XG4gICAgcmV0dXJuIFBST1BfVFlQRVM7XG4gIH1cblxuICBzdGF0aWMgZ2V0IGRlZmF1bHRQcm9wcygpIHtcbiAgICByZXR1cm4gREVGQVVMVF9QUk9QUztcbiAgfVxuXG4gIC8qKlxuICAgKiBAY2xhc3NkZXNjXG4gICAqIFNtYWxsIHJlYWN0IGNvbXBvbmVudCB0aGF0IHVzZXMgTHVtYS5HTCB0byBpbml0aWFsaXplIGEgV2ViR0wgY29udGV4dC5cbiAgICpcbiAgICogUmV0dXJucyBhIGNhbnZhcywgY3JlYXRlcyBhIGJhc2ljIFdlYkdMIGNvbnRleHQsIGEgY2FtZXJhIGFuZCBhIHNjZW5lLFxuICAgKiBzZXRzIHVwIGEgcmVuZGVybG9vcCwgYW5kIHJlZ2lzdGVycyBzb21lIGJhc2ljIGV2ZW50IGhhbmRsZXJzXG4gICAqXG4gICAqIEBjbGFzc1xuICAgKiBAcGFyYW0ge09iamVjdH0gcHJvcHMgLSBzZWUgcHJvcFR5cGVzIGRvY3VtZW50YXRpb25cbiAgICovXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgc3VwZXIocHJvcHMpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBnbDogbnVsbFxuICAgIH07XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICBjb25zdCBjYW52YXMgPSBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzKTtcbiAgICB0aGlzLl9pbml0V2ViR0woY2FudmFzKTtcbiAgICB0aGlzLl9hbmltYXRpb25Mb29wKCk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZSBMdW1hR0wgbGlicmFyeSBhbmQgdGhyb3VnaCBpdCBXZWJHTFxuICAgKiBAcGFyYW0ge3N0cmluZ30gY2FudmFzXG4gICAqL1xuICBfaW5pdFdlYkdMKGNhbnZhcykge1xuXG4gICAgY29uc3QgZ2wgPSBjcmVhdGVHTENvbnRleHQoY2FudmFzKTtcblxuICAgIGNvbnN0IGV2ZW50cyA9IEV2ZW50cy5jcmVhdGUoY2FudmFzLCB7XG4gICAgICBjYWNoZVNpemU6IGZhbHNlLFxuICAgICAgY2FjaGVQb3NpdGlvbjogZmFsc2UsXG4gICAgICBjZW50ZXJPcmlnaW46IGZhbHNlLFxuICAgICAgb25DbGljazogdGhpcy5fb25DbGljayxcbiAgICAgIG9uTW91c2VNb3ZlOiB0aHJvdHRsZSh0aGlzLl9vbk1vdXNlTW92ZSwgMTAwKVxuICAgIH0pO1xuXG4gICAgLy8gZXZlbnRzPXsge1xuICAgIC8vICAgb25PYmplY3RIb3ZlcmVkOiB0aGlzLl9oYW5kbGVPYmplY3RIb3ZlcmVkLFxuICAgIC8vICAgb25PYmplY3RDbGlja2VkOiB0aGlzLl9oYW5kbGVPYmplY3RDbGlja2VkXG4gICAgLy8gfSB9XG5cbiAgICBjb25zdCBjYW1lcmEgPSBuZXcgUGVyc3BlY3RpdmVDYW1lcmEodGhpcy5wcm9wcy5jYW1lcmEpO1xuXG4gICAgLy8gVE9ETyAtIHJlbW92ZSBwcm9ncmFtIHBhcmFtZXRlciBmcm9tIHNjZW5lLCBvciBtb3ZlIGl0IGludG8gb3B0aW9uc1xuICAgIGNvbnN0IHNjZW5lID0gbmV3IFNjZW5lKGdsLCB7XG4gICAgICBjYW1lcmEsXG4gICAgICBsaWdodHM6IHRoaXMucHJvcHMubGlnaHRzLFxuICAgICAgYmFja2dyb3VuZENvbG9yOiB7cjogMCwgZzogMCwgYjogMCwgYTogMH1cbiAgICB9KTtcblxuICAgIHRoaXMuc2V0U3RhdGUoe2dsLCBjYW1lcmEsIHNjZW5lLCBldmVudHN9KTtcblxuICAgIHRoaXMucHJvcHMub25SZW5kZXJlckluaXRpYWxpemVkKHtnbCwgY2FtZXJhLCBzY2VuZX0pO1xuICB9XG5cbiAgLy8gVE9ETyAtIG1vdmUgdGhpcyB0byBsdW1hLmdsL3BpY2suanMgb3IgbW9kZWwuanM/XG4gIC8qIGVzbGludC1kaXNhYmxlIG1heC1zdGF0ZW1lbnRzICovXG4gIF9waWNrKHgsIHkpIHtcbiAgICBjb25zdCB7Z2wsIHNjZW5lLCBjYW1lcmF9ID0gdGhpcy5zdGF0ZTtcblxuICAgIGlmICh0aGlzLl9waWNraW5nRkJPID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuX3BpY2tpbmdGQk8gPSBuZXcgRnJhbWVidWZmZXIoZ2wsIHtcbiAgICAgICAgd2lkdGg6IGdsLmNhbnZhcy53aWR0aCxcbiAgICAgICAgaGVpZ2h0OiBnbC5jYW52YXMuaGVpZ2h0XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLl9waWNraW5nRkJPLmJpbmQoKTtcblxuICAgIGdsLmVuYWJsZShnbC5TQ0lTU09SX1RFU1QpO1xuICAgIGdsLnNjaXNzb3IoeCwgZ2wuY2FudmFzLmhlaWdodCAtIHksIDEsIDEpO1xuXG4gICAgY29uc3QgcGlja2VkID0gW107XG5cbiAgICAvLyBUT0RPIC0gaXRlcmF0ZSBpbiByZXZlcnNlIG9yZGVyP1xuICAgIGZvciAoY29uc3QgbW9kZWwgb2Ygc2NlbmUubW9kZWxzKSB7XG4gICAgICBpZiAobW9kZWwucGlja2FibGUpIHtcbiAgICAgICAgY29uc3QgcHJvZ3JhbSA9IG1vZGVsLnByb2dyYW07XG4gICAgICAgIHByb2dyYW0udXNlKCk7XG4gICAgICAgIHByb2dyYW0uc2V0VW5pZm9ybSgnZW5hYmxlUGlja2luZycsIDEpO1xuICAgICAgICBtb2RlbC5vbkJlZm9yZVJlbmRlcigpO1xuICAgICAgICBjb25zdCB7dmlld30gPSBjYW1lcmE7XG4gICAgICAgIGNvbnN0IHttYXRyaXh9ID0gbW9kZWw7XG4gICAgICAgIGNvbnN0IHdvcmxkTWF0cml4ID0gdmlldy5tdWxNYXQ0KG1hdHJpeCk7XG5cbiAgICAgICAgbW9kZWwuc2V0U3RhdGUocHJvZ3JhbSk7XG5cbiAgICAgICAgcHJvZ3JhbS5zZXRVbmlmb3JtKCd3b3JsZE1hdHJpeCcsIHdvcmxkTWF0cml4KTtcblxuICAgICAgICBnbC5jbGVhcihnbC5DT0xPUl9CVUZGRVJfQklUKTtcblxuICAgICAgICBtb2RlbC5yZW5kZXIoKTtcblxuICAgICAgICAvLyBSZWFkIHRoZSBjb2xvciBpbiB0aGUgY2VudHJhbCBwaXhlbCwgdG8gYmUgbWFwcGVkIHdpdGggcGlja2luZyBjb2xvcnNcbiAgICAgICAgY29uc3QgY29sb3IgPSBuZXcgVWludDhBcnJheSg0KTtcbiAgICAgICAgZ2wucmVhZFBpeGVscyhcbiAgICAgICAgICB4LCBnbC5jYW52YXMuaGVpZ2h0IC0geSwgMSwgMSwgZ2wuUkdCQSwgZ2wuVU5TSUdORURfQllURSwgY29sb3JcbiAgICAgICAgKTtcblxuICAgICAgICBwaWNrZWQucHVzaCh7bW9kZWwsIGNvbG9yfSk7XG5cbiAgICAgICAgcHJvZ3JhbS5zZXRVbmlmb3JtKCdlbmFibGVQaWNraW5nJywgMCk7XG5cbiAgICAgICAgbW9kZWwudW5zZXRTdGF0ZShwcm9ncmFtKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBnbC5iaW5kRnJhbWVidWZmZXIoZ2wuRlJBTUVCVUZGRVIsIG51bGwpO1xuICAgIGdsLmRpc2FibGUoZ2wuU0NJU1NPUl9URVNUKTtcbiAgICByZXR1cm4gcGlja2VkO1xuICB9XG5cbiAgQGF1dG9iaW5kXG4gIF9vbkNsaWNrKGV2ZW50KSB7XG4gICAgY29uc3QgcGlja2VkID0gdGhpcy5fcGljayhldmVudC54LCBldmVudC55KTtcbiAgICB0aGlzLnByb3BzLm9uQ2xpY2soe2V2ZW50LCBwaWNrZWR9KTtcbiAgfVxuXG4gIEBhdXRvYmluZFxuICBfb25Nb3VzZU1vdmUoZXZlbnQpIHtcbiAgICBjb25zdCBwaWNrZWQgPSB0aGlzLl9waWNrKGV2ZW50LngsIGV2ZW50LnkpO1xuICAgIHRoaXMucHJvcHMub25Nb3VzZU1vdmUoe2V2ZW50LCBwaWNrZWR9KTtcbiAgfVxuXG4gIF9yZW5kZXJGcmFtZSgpIHtcbiAgICBjb25zdCB7XG4gICAgICB2aWV3cG9ydDoge3gsIHksIHdpZHRoLCBoZWlnaHR9LFxuICAgICAgYmxlbmRpbmc6IHtlbmFibGUsIGJsZW5kRnVuYywgYmxlbmRFcXVhdGlvbn0sXG4gICAgICBvbkJlZm9yZVJlbmRlckZyYW1lLFxuICAgICAgb25BZnRlclJlbmRlckZyYW1lLFxuICAgICAgb25OZWVkUmVkcmF3LFxuICAgICAgcGl4ZWxSYXRpb1xuICAgIH0gPSB0aGlzLnByb3BzO1xuXG4gICAgY29uc3Qge2dsLCBzY2VuZX0gPSB0aGlzLnN0YXRlO1xuICAgIGlmICghZ2wpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBOb3RlOiBEbyB0aGlzIGFmdGVyIGdsIGNoZWNrLCBpbiBjYXNlIG9uTmVlZFJlZHJhdyBjbGVhcnMgZmxhZ3NcbiAgICBpZiAoIW9uTmVlZFJlZHJhdygpKSB7XG4gICAgICAvLyByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gY2xlYXIgZGVwdGggYW5kIGNvbG9yIGJ1ZmZlcnNcbiAgICBnbC5jbGVhcihnbC5DT0xPUl9CVUZGRVJfQklUIHwgZ2wuREVQVEhfQlVGRkVSX0JJVCk7XG5cbiAgICAvLyB1cGRhdGUgdmlld3BvcnQgdG8gbGF0ZXN0IHByb3BzXG4gICAgLy8gKHR5cGljYWxseSBjaGFuZ2VkIGJ5IGFwcCBvbiBicm93c2VyIHJlc2l6ZSBldGMpXG4gICAgZ2wudmlld3BvcnQoXG4gICAgICB4ICogcGl4ZWxSYXRpbyxcbiAgICAgIHkgKiBwaXhlbFJhdGlvLFxuICAgICAgd2lkdGggKiBwaXhlbFJhdGlvLFxuICAgICAgaGVpZ2h0ICogcGl4ZWxSYXRpb1xuICAgICk7XG5cbiAgICAvLyBzZXR1cCBibGVkbmluZ1xuICAgIGlmIChlbmFibGUpIHtcbiAgICAgIGdsLmVuYWJsZShnbC5CTEVORCk7XG4gICAgICBnbC5ibGVuZEZ1bmMoLi4uYmxlbmRGdW5jLm1hcChzID0+IGdsLmdldChzKSkpO1xuICAgICAgZ2wuYmxlbmRFcXVhdGlvbihnbC5nZXQoYmxlbmRFcXVhdGlvbikpO1xuICAgIH0gZWxzZSB7XG4gICAgICBnbC5kaXNhYmxlKGdsLkJMRU5EKTtcbiAgICB9XG5cbiAgICBvbkJlZm9yZVJlbmRlckZyYW1lKCk7XG4gICAgc2NlbmUucmVuZGVyKCk7XG4gICAgb25BZnRlclJlbmRlckZyYW1lKCk7XG4gIH1cblxuICAvKipcbiAgICogTWFpbiBXZWJHTCBhbmltYXRpb24gbG9vcFxuICAgKi9cbiAgQGF1dG9iaW5kXG4gIF9hbmltYXRpb25Mb29wKCkge1xuICAgIHRoaXMuX3JlbmRlckZyYW1lKCk7XG4gICAgLy8gS2VlcCByZWdpc3RlcmluZyBvdXJzZWx2ZXMgZm9yIHRoZSBuZXh0IGFuaW1hdGlvbiBmcmFtZVxuICAgIEZ4LnJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLl9hbmltYXRpb25Mb29wKTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBjb25zdCB7aWQsIHdpZHRoLCBoZWlnaHQsIHBpeGVsUmF0aW99ID0gdGhpcy5wcm9wcztcbiAgICByZXR1cm4gKFxuICAgICAgPGNhbnZhc1xuICAgICAgICBpZD17IGlkIH1cbiAgICAgICAgd2lkdGg9eyB3aWR0aCAqIHBpeGVsUmF0aW8gfHwgMSB9XG4gICAgICAgIGhlaWdodD17IGhlaWdodCAqIHBpeGVsUmF0aW8gfHwgMSB9XG4gICAgICAgIHN0eWxlPXsge3dpZHRoLCBoZWlnaHR9IH0vPlxuICAgICk7XG4gIH1cblxufVxuIl19