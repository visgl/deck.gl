'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

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

/* eslint-disable no-console, no-try-catch */
/* global console */


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
  onInitializationFailed: function onInitializationFailed(error) {
    return console.error(error);
  },
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

      var gl = void 0;
      try {
        gl = (0, _luma.createGLContext)(canvas);
      } catch (error) {
        this.props.onInitializationFailed(error);
        return;
      }

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
      this.props.onClick(_extends({}, event, { picked: picked }));
    }
  }, {
    key: '_onMouseMove',
    value: function _onMouseMove(event) {
      var picked = this._pick(event.x, event.y);
      this.props.onMouseMove(_extends({}, event, { picked: picked }));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy93ZWJnbC1yZW5kZXJlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXNCQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLElBQU0sYUFBYTtBQUNqQixNQUFJLGlCQUFVLE1BQVY7O0FBRUosU0FBTyxpQkFBVSxNQUFWLENBQWlCLFVBQWpCO0FBQ1AsVUFBUSxpQkFBVSxNQUFWLENBQWlCLFVBQWpCOztBQUVSLGNBQVksaUJBQVUsTUFBVjtBQUNaLFlBQVUsaUJBQVUsTUFBVixDQUFpQixVQUFqQjtBQUNWLFVBQVEsaUJBQVUsTUFBVixDQUFpQixVQUFqQjtBQUNSLFVBQVEsaUJBQVUsTUFBVjtBQUNSLFlBQVUsaUJBQVUsTUFBVjtBQUNWLFVBQVEsaUJBQVUsTUFBVjs7QUFFUix5QkFBdUIsaUJBQVUsSUFBVixDQUFlLFVBQWY7QUFDdkIsMEJBQXdCLGlCQUFVLElBQVY7QUFDeEIsV0FBUyxpQkFBVSxJQUFWOztBQUVULHVCQUFxQixpQkFBVSxJQUFWO0FBQ3JCLHNCQUFvQixpQkFBVSxJQUFWO0FBQ3BCLDhCQUE0QixpQkFBVSxJQUFWO0FBQzVCLDZCQUEyQixpQkFBVSxJQUFWOztBQUUzQixnQkFBYyxpQkFBVSxJQUFWO0FBQ2QsZUFBYSxpQkFBVSxJQUFWO0FBQ2IsV0FBUyxpQkFBVSxJQUFWO0NBeEJMOztBQTJCTixJQUFNLGdCQUFnQjtBQUNwQixNQUFJLGNBQUo7QUFDQSx5QkFBdUIsaUNBQU0sRUFBTjtBQUN2QiwwQkFBd0I7V0FBUyxRQUFRLEtBQVIsQ0FBYyxLQUFkO0dBQVQ7QUFDeEIsV0FBUyx3QkFBUztBQUNoQixVQUFNLEtBQU4sQ0FEZ0I7R0FBVDtBQUdULHVCQUFxQiwrQkFBTSxFQUFOO0FBQ3JCLHNCQUFvQiw4QkFBTSxFQUFOO0FBQ3BCLDhCQUE0QixzQ0FB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QixnQkFBTSxTQUFOO2tCQUF0QiIsImZpbGUiOiJ3ZWJnbC1yZW5kZXJlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNSBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbi8qIGVzbGludC1kaXNhYmxlIG5vLWNvbnNvbGUsIG5vLXRyeS1jYXRjaCAqL1xuLyogZ2xvYmFsIGNvbnNvbGUgKi9cbmltcG9ydCBSZWFjdCwge1Byb3BUeXBlc30gZnJvbSAncmVhY3QnO1xuaW1wb3J0IFJlYWN0RE9NIGZyb20gJ3JlYWN0LWRvbSc7XG5pbXBvcnQgYXV0b2JpbmQgZnJvbSAnYXV0b2JpbmQtZGVjb3JhdG9yJztcbmltcG9ydCB7Y3JlYXRlR0xDb250ZXh0LCBQZXJzcGVjdGl2ZUNhbWVyYSwgU2NlbmUsIEV2ZW50cywgRnh9IGZyb20gJ2x1bWEuZ2wnO1xuaW1wb3J0IHRocm90dGxlIGZyb20gJ2xvZGFzaC50aHJvdHRsZSc7XG5cbmNvbnN0IFBST1BfVFlQRVMgPSB7XG4gIGlkOiBQcm9wVHlwZXMuc3RyaW5nLFxuXG4gIHdpZHRoOiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gIGhlaWdodDogUHJvcFR5cGVzLm51bWJlci5pc1JlcXVpcmVkLFxuXG4gIHBpeGVsUmF0aW86IFByb3BUeXBlcy5udW1iZXIsXG4gIHZpZXdwb3J0OiBQcm9wVHlwZXMub2JqZWN0LmlzUmVxdWlyZWQsXG4gIGNhbWVyYTogUHJvcFR5cGVzLm9iamVjdC5pc1JlcXVpcmVkLFxuICBsaWdodHM6IFByb3BUeXBlcy5vYmplY3QsXG4gIGJsZW5kaW5nOiBQcm9wVHlwZXMub2JqZWN0LFxuICBldmVudHM6IFByb3BUeXBlcy5vYmplY3QsXG5cbiAgb25SZW5kZXJlckluaXRpYWxpemVkOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICBvbkluaXRpYWxpemF0aW9uRmFpbGVkOiBQcm9wVHlwZXMuZnVuYyxcbiAgb25FcnJvcjogUHJvcFR5cGVzLmZ1bmMsXG5cbiAgb25CZWZvcmVSZW5kZXJGcmFtZTogUHJvcFR5cGVzLmZ1bmMsXG4gIG9uQWZ0ZXJSZW5kZXJGcmFtZTogUHJvcFR5cGVzLmZ1bmMsXG4gIG9uQmVmb3JlUmVuZGVyUGlja2luZ1NjZW5lOiBQcm9wVHlwZXMuZnVuYyxcbiAgb25BZnRlclJlbmRlclBpY2tpbmdTY2VuZTogUHJvcFR5cGVzLmZ1bmMsXG5cbiAgb25OZWVkUmVkcmF3OiBQcm9wVHlwZXMuZnVuYyxcbiAgb25Nb3VzZU1vdmU6IFByb3BUeXBlcy5mdW5jLFxuICBvbkNsaWNrOiBQcm9wVHlwZXMuZnVuY1xufTtcblxuY29uc3QgREVGQVVMVF9QUk9QUyA9IHtcbiAgaWQ6ICd3ZWJnbC1jYW52YXMnLFxuICBvblJlbmRlcmVySW5pdGlhbGl6ZWQ6ICgpID0+IHt9LFxuICBvbkluaXRpYWxpemF0aW9uRmFpbGVkOiBlcnJvciA9PiBjb25zb2xlLmVycm9yKGVycm9yKSxcbiAgb25FcnJvcjogZXJyb3IgPT4ge1xuICAgIHRocm93IGVycm9yO1xuICB9LFxuICBvbkJlZm9yZVJlbmRlckZyYW1lOiAoKSA9PiB7fSxcbiAgb25BZnRlclJlbmRlckZyYW1lOiAoKSA9PiB7fSxcbiAgb25CZWZvcmVSZW5kZXJQaWNraW5nU2NlbmU6ICgpID0+IHt9LFxuICBvbkFmdGVyUmVuZGVyUGlja2luZ1NjZW5lOiAoKSA9PiB7fSxcblxuICBvbk5lZWRSZWRyYXc6ICgpID0+IHRydWUsXG4gIG9uTW91c2VNb3ZlOiAoKSA9PiB7fSxcbiAgb25DbGljazogKCkgPT4ge31cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFdlYkdMUmVuZGVyZXIgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXG4gIHN0YXRpYyBnZXQgcHJvcFR5cGVzKCkge1xuICAgIHJldHVybiBQUk9QX1RZUEVTO1xuICB9XG5cbiAgc3RhdGljIGdldCBkZWZhdWx0UHJvcHMoKSB7XG4gICAgcmV0dXJuIERFRkFVTFRfUFJPUFM7XG4gIH1cblxuICAvKipcbiAgICogQGNsYXNzZGVzY1xuICAgKiBTbWFsbCByZWFjdCBjb21wb25lbnQgdGhhdCB1c2VzIEx1bWEuR0wgdG8gaW5pdGlhbGl6ZSBhIFdlYkdMIGNvbnRleHQuXG4gICAqXG4gICAqIFJldHVybnMgYSBjYW52YXMsIGNyZWF0ZXMgYSBiYXNpYyBXZWJHTCBjb250ZXh0LCBhIGNhbWVyYSBhbmQgYSBzY2VuZSxcbiAgICogc2V0cyB1cCBhIHJlbmRlcmxvb3AsIGFuZCByZWdpc3RlcnMgc29tZSBiYXNpYyBldmVudCBoYW5kbGVyc1xuICAgKlxuICAgKiBAY2xhc3NcbiAgICogQHBhcmFtIHtPYmplY3R9IHByb3BzIC0gc2VlIHByb3BUeXBlcyBkb2N1bWVudGF0aW9uXG4gICAqL1xuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHN1cGVyKHByb3BzKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgZ2w6IG51bGxcbiAgICB9O1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgY29uc3QgY2FudmFzID0gUmVhY3RET00uZmluZERPTU5vZGUodGhpcyk7XG4gICAgdGhpcy5faW5pdFdlYkdMKGNhbnZhcyk7XG4gICAgdGhpcy5fYW5pbWF0aW9uTG9vcCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemUgTHVtYUdMIGxpYnJhcnkgYW5kIHRocm91Z2ggaXQgV2ViR0xcbiAgICogQHBhcmFtIHtzdHJpbmd9IGNhbnZhc1xuICAgKi9cbiAgX2luaXRXZWJHTChjYW52YXMpIHtcblxuICAgIGxldCBnbDtcbiAgICB0cnkge1xuICAgICAgZ2wgPSBjcmVhdGVHTENvbnRleHQoY2FudmFzKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhpcy5wcm9wcy5vbkluaXRpYWxpemF0aW9uRmFpbGVkKGVycm9yKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBldmVudHMgPSBFdmVudHMuY3JlYXRlKGNhbnZhcywge1xuICAgICAgY2FjaGVTaXplOiBmYWxzZSxcbiAgICAgIGNhY2hlUG9zaXRpb246IGZhbHNlLFxuICAgICAgY2VudGVyT3JpZ2luOiBmYWxzZSxcbiAgICAgIG9uQ2xpY2s6IHRoaXMuX29uQ2xpY2ssXG4gICAgICBvbk1vdXNlTW92ZTogdGhyb3R0bGUodGhpcy5fb25Nb3VzZU1vdmUsIDEwMClcbiAgICB9KTtcblxuICAgIGNvbnN0IGNhbWVyYSA9IG5ldyBQZXJzcGVjdGl2ZUNhbWVyYSh0aGlzLnByb3BzLmNhbWVyYSk7XG5cbiAgICAvLyBUT0RPIC0gcmVtb3ZlIHByb2dyYW0gcGFyYW1ldGVyIGZyb20gc2NlbmUsIG9yIG1vdmUgaXQgaW50byBvcHRpb25zXG4gICAgY29uc3Qgc2NlbmUgPSBuZXcgU2NlbmUoZ2wsIHtcbiAgICAgIGxpZ2h0czogdGhpcy5wcm9wcy5saWdodHMsXG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6IHtyOiAwLCBnOiAwLCBiOiAwLCBhOiAwfVxuICAgIH0pO1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7Z2wsIGNhbWVyYSwgc2NlbmUsIGV2ZW50c30pO1xuXG4gICAgdGhpcy5wcm9wcy5vblJlbmRlcmVySW5pdGlhbGl6ZWQoe2dsLCBjYW1lcmEsIHNjZW5lfSk7XG4gIH1cblxuICAvLyBUT0RPIC0gbW92ZSB0aGlzIGJhY2sgdG8gbHVtYS5nbC9zY2VuZS5qc1xuICAvKiBlc2xpbnQtZGlzYWJsZSBtYXgtc3RhdGVtZW50cyAqL1xuICBfcGljayh4LCB5KSB7XG4gICAgY29uc3Qge2dsLCBzY2VuZSwgY2FtZXJhfSA9IHRoaXMuc3RhdGU7XG5cbiAgICBjb25zdCBwaWNrZWRNb2RlbHMgPSBzY2VuZS5waWNrTW9kZWxzKGdsLCB7Y2FtZXJhLCB4LCB5fSk7XG5cbiAgICByZXR1cm4gcGlja2VkTW9kZWxzO1xuICB9XG5cbiAgQGF1dG9iaW5kXG4gIF9vbkNsaWNrKGV2ZW50KSB7XG4gICAgY29uc3QgcGlja2VkID0gdGhpcy5fcGljayhldmVudC54LCBldmVudC55KTtcbiAgICB0aGlzLnByb3BzLm9uQ2xpY2soey4uLmV2ZW50LCBwaWNrZWR9KTtcbiAgfVxuXG4gIEBhdXRvYmluZFxuICBfb25Nb3VzZU1vdmUoZXZlbnQpIHtcbiAgICBjb25zdCBwaWNrZWQgPSB0aGlzLl9waWNrKGV2ZW50LngsIGV2ZW50LnkpO1xuICAgIHRoaXMucHJvcHMub25Nb3VzZU1vdmUoey4uLmV2ZW50LCBwaWNrZWR9KTtcbiAgfVxuXG4gIF9yZW5kZXJGcmFtZSgpIHtcbiAgICBjb25zdCB7XG4gICAgICB2aWV3cG9ydDoge3gsIHksIHdpZHRoLCBoZWlnaHR9LFxuICAgICAgYmxlbmRpbmc6IHtlbmFibGUsIGJsZW5kRnVuYywgYmxlbmRFcXVhdGlvbn0sXG4gICAgICBvbkJlZm9yZVJlbmRlckZyYW1lLFxuICAgICAgb25BZnRlclJlbmRlckZyYW1lLFxuICAgICAgb25OZWVkUmVkcmF3LFxuICAgICAgcGl4ZWxSYXRpb1xuICAgIH0gPSB0aGlzLnByb3BzO1xuXG4gICAgY29uc3Qge2dsLCBzY2VuZSwgY2FtZXJhfSA9IHRoaXMuc3RhdGU7XG4gICAgaWYgKCFnbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIE5vdGU6IERvIHRoaXMgYWZ0ZXIgZ2wgY2hlY2ssIGluIGNhc2Ugb25OZWVkUmVkcmF3IGNsZWFycyBmbGFnc1xuICAgIGlmICghb25OZWVkUmVkcmF3KCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBjbGVhciBkZXB0aCBhbmQgY29sb3IgYnVmZmVyc1xuICAgIGdsLmNsZWFyKGdsLkNPTE9SX0JVRkZFUl9CSVQgfCBnbC5ERVBUSF9CVUZGRVJfQklUKTtcblxuICAgIC8vIHVwZGF0ZSB2aWV3cG9ydCB0byBsYXRlc3QgcHJvcHNcbiAgICAvLyAodHlwaWNhbGx5IGNoYW5nZWQgYnkgYXBwIG9uIGJyb3dzZXIgcmVzaXplIGV0YylcbiAgICBnbC52aWV3cG9ydChcbiAgICAgIHggKiBwaXhlbFJhdGlvLFxuICAgICAgeSAqIHBpeGVsUmF0aW8sXG4gICAgICB3aWR0aCAqIHBpeGVsUmF0aW8sXG4gICAgICBoZWlnaHQgKiBwaXhlbFJhdGlvXG4gICAgKTtcblxuICAgIC8vIHNldHVwIGJsZWRuaW5nXG4gICAgaWYgKGVuYWJsZSkge1xuICAgICAgZ2wuZW5hYmxlKGdsLkJMRU5EKTtcbiAgICAgIGdsLmJsZW5kRnVuYyguLi5ibGVuZEZ1bmMubWFwKHMgPT4gZ2wuZ2V0KHMpKSk7XG4gICAgICBnbC5ibGVuZEVxdWF0aW9uKGdsLmdldChibGVuZEVxdWF0aW9uKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGdsLmRpc2FibGUoZ2wuQkxFTkQpO1xuICAgIH1cblxuICAgIG9uQmVmb3JlUmVuZGVyRnJhbWUoKTtcbiAgICBzY2VuZS5yZW5kZXIoZ2wsIHtjYW1lcmF9KTtcbiAgICBvbkFmdGVyUmVuZGVyRnJhbWUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBNYWluIFdlYkdMIGFuaW1hdGlvbiBsb29wXG4gICAqL1xuICBAYXV0b2JpbmRcbiAgX2FuaW1hdGlvbkxvb3AoKSB7XG4gICAgdGhpcy5fcmVuZGVyRnJhbWUoKTtcbiAgICAvLyBLZWVwIHJlZ2lzdGVyaW5nIG91cnNlbHZlcyBmb3IgdGhlIG5leHQgYW5pbWF0aW9uIGZyYW1lXG4gICAgRngucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMuX2FuaW1hdGlvbkxvb3ApO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGNvbnN0IHtpZCwgd2lkdGgsIGhlaWdodCwgcGl4ZWxSYXRpb30gPSB0aGlzLnByb3BzO1xuICAgIHJldHVybiAoXG4gICAgICA8Y2FudmFzXG4gICAgICAgIGlkPXsgaWQgfVxuICAgICAgICB3aWR0aD17IHdpZHRoICogcGl4ZWxSYXRpbyB8fCAxIH1cbiAgICAgICAgaGVpZ2h0PXsgaGVpZ2h0ICogcGl4ZWxSYXRpbyB8fCAxIH1cbiAgICAgICAgc3R5bGU9eyB7d2lkdGgsIGhlaWdodH0gfS8+XG4gICAgKTtcbiAgfVxuXG59XG4iXX0=