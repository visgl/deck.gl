var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

import LayerManager from '../lib/layer-manager';
import EffectManager from '../experimental/lib/effect-manager';
import Effect from '../experimental/lib/effect';
import WebMercatorViewport from '../viewports/web-mercator-viewport';

import { EventManager } from 'mjolnir.js';
import { GL, AnimationLoop, createGLContext, setParameters } from 'luma.gl';

import PropTypes from 'prop-types';

/* global document */

function noop() {}

var propTypes = {
  id: PropTypes.string,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  layers: PropTypes.array.isRequired, // Array can contain falsy values
  viewports: PropTypes.array, // Array can contain falsy values
  effects: PropTypes.arrayOf(PropTypes.instanceOf(Effect)),
  layerFilter: PropTypes.func,
  glOptions: PropTypes.object,
  gl: PropTypes.object,
  pickingRadius: PropTypes.number,
  initWebGLParameters: PropTypes.bool,
  onWebGLInitialized: PropTypes.func,
  onBeforeRender: PropTypes.func,
  onAfterRender: PropTypes.func,
  onLayerClick: PropTypes.func,
  onLayerHover: PropTypes.func,
  useDevicePixels: PropTypes.bool,

  // Debug settings
  debug: PropTypes.bool,
  drawPickingColors: PropTypes.bool
};

var defaultProps = {
  id: 'deckgl-overlay',
  pickingRadius: 0,
  layerFilter: null,
  glOptions: {},
  gl: null,
  effects: [],
  initWebGLParameters: false, // Will be set to true in next major release
  onWebGLInitialized: noop,
  onBeforeRender: noop,
  onAfterRender: noop,
  onLayerClick: null,
  onLayerHover: null,
  useDevicePixels: true,

  debug: false,
  drawPickingColors: false
};

// TODO - should this class be joined with `LayerManager`?

var DeckGLJS = function () {
  function DeckGLJS(props) {
    var _this = this;

    _classCallCheck(this, DeckGLJS);

    props = Object.assign({}, defaultProps, props);

    this.state = {};
    this.needsRedraw = true;
    this.layerManager = null;
    this.effectManager = null;
    this.viewports = [];

    // Bind methods
    this._onRendererInitialized = this._onRendererInitialized.bind(this);
    this._onRenderFrame = this._onRenderFrame.bind(this);

    this.canvas = this._createCanvas(props);

    var _props = props,
        width = _props.width,
        height = _props.height,
        gl = _props.gl,
        glOptions = _props.glOptions,
        debug = _props.debug,
        useDevicePixels = _props.useDevicePixels;


    this.animationLoop = new AnimationLoop({
      width: width,
      height: height,
      useDevicePixels: useDevicePixels,
      onCreateContext: function onCreateContext(opts) {
        return gl || createGLContext(Object.assign({}, glOptions, { canvas: _this.canvas, debug: debug }));
      },
      onInitialize: this._onRendererInitialized,
      onRender: this._onRenderFrame,
      onBeforeRender: props.onBeforeRender,
      onAfterRender: props.onAfterRender
    });

    this.animationLoop.start();

    this.setProps(props);
  }

  _createClass(DeckGLJS, [{
    key: 'setProps',
    value: function setProps(props) {
      props = Object.assign({}, this.props, props);
      this.props = props;

      if (!this.layerManager) {
        return;
      }

      var _props2 = props,
          layers = _props2.layers,
          pickingRadius = _props2.pickingRadius,
          onLayerClick = _props2.onLayerClick,
          onLayerHover = _props2.onLayerHover,
          useDevicePixels = _props2.useDevicePixels,
          drawPickingColors = _props2.drawPickingColors,
          layerFilter = _props2.layerFilter;

      // Update viewports (creating one if not supplied)

      var viewports = props.viewports || props.viewport;
      if (!viewports) {
        var _props3 = props,
            width = _props3.width,
            height = _props3.height,
            latitude = _props3.latitude,
            longitude = _props3.longitude,
            zoom = _props3.zoom,
            pitch = _props3.pitch,
            bearing = _props3.bearing;

        viewports = [new WebMercatorViewport({ width: width, height: height, latitude: latitude, longitude: longitude, zoom: zoom, pitch: pitch, bearing: bearing })];
      }

      // If more parameters need to be updated on layerManager add them to this method.
      this.layerManager.setParameters({
        layers: layers,
        viewports: viewports,
        useDevicePixels: useDevicePixels,
        drawPickingColors: drawPickingColors,
        layerFilter: layerFilter,
        pickingRadius: pickingRadius,
        onLayerClick: onLayerClick,
        onLayerHover: onLayerHover
      });

      // TODO - unify setParameters/setOptions/setProps etc naming.
      this.animationLoop.setViewParameters({ useDevicePixels: useDevicePixels });
    }
  }, {
    key: 'finalize',
    value: function finalize() {
      this.animationLoop.stop();
      this.animationLoop = null;

      if (this.layerManager) {
        this.layerManager.finalize();
        this.layerManager = null;
      }
    }

    // Public API

  }, {
    key: 'pickObject',
    value: function pickObject(_ref) {
      var x = _ref.x,
          y = _ref.y,
          _ref$radius = _ref.radius,
          radius = _ref$radius === undefined ? 0 : _ref$radius,
          _ref$layerIds = _ref.layerIds,
          layerIds = _ref$layerIds === undefined ? null : _ref$layerIds;

      var selectedInfos = this.layerManager.pickObject({ x: x, y: y, radius: radius, layerIds: layerIds, mode: 'query' });
      return selectedInfos.length ? selectedInfos[0] : null;
    }
  }, {
    key: 'pickObjects',
    value: function pickObjects(_ref2) {
      var x = _ref2.x,
          y = _ref2.y,
          _ref2$width = _ref2.width,
          width = _ref2$width === undefined ? 1 : _ref2$width,
          _ref2$height = _ref2.height,
          height = _ref2$height === undefined ? 1 : _ref2$height,
          _ref2$layerIds = _ref2.layerIds,
          layerIds = _ref2$layerIds === undefined ? null : _ref2$layerIds;

      return this.layerManager.pickObjects({ x: x, y: y, width: width, height: height, layerIds: layerIds });
    }
  }, {
    key: 'getViewports',
    value: function getViewports() {
      return this.layerManager ? this.layerManager.getViewports() : [];
    }

    // Private Methods

  }, {
    key: '_createCanvas',
    value: function _createCanvas(props) {
      if (props.canvas) {
        return props.canvas;
      }

      var id = props.id,
          width = props.width,
          height = props.height,
          style = props.style;

      var canvas = document.createElement('canvas');
      canvas.id = id;
      canvas.width = width;
      canvas.height = height;
      canvas.style = style;

      var parent = props.parent || document.body;
      parent.appendChild(canvas);

      return canvas;
    }

    // Callbacks

  }, {
    key: '_onRendererInitialized',
    value: function _onRendererInitialized(_ref3) {
      var gl = _ref3.gl,
          canvas = _ref3.canvas;

      setParameters(gl, {
        blend: true,
        blendFunc: [GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA],
        polygonOffsetFill: true
      });

      // TODO - these should be set by default starting from next major release
      if (this.props.initWebGLParameters) {
        setParameters(gl, {
          blendFuncSeparate: [GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA, GL.ONE, GL.ONE_MINUS_SRC_ALPHA],
          depthTest: true,
          depthFunc: GL.LEQUAL
        });
      }

      this.props.onWebGLInitialized(gl);

      // Note: avoid React setState due GL animation loop / setState timing issue
      this.layerManager = new LayerManager(gl, {
        eventManager: new EventManager(canvas)
      });

      this.effectManager = new EffectManager({ gl: gl, layerManager: this.layerManager });

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.props.effects[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var effect = _step.value;

          this.effectManager.addEffect(effect);
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

      this.setProps(this.props);
    }
  }, {
    key: '_onRenderFrame',
    value: function _onRenderFrame(_ref4) {
      var gl = _ref4.gl;

      var redrawReason = this.layerManager.needsRedraw({ clearRedrawFlags: true });
      if (!redrawReason) {
        return;
      }

      this.props.onBeforeRender({ gl: gl }); // TODO - should be called by AnimationLoop
      this.layerManager.drawLayers({
        pass: 'screen',
        redrawReason: redrawReason,
        // Helps debug layer picking, especially in framebuffer powered layers
        drawPickingColors: this.props.drawPickingColors
      });
      this.props.onAfterRender({ gl: gl }); // TODO - should be called by AnimationLoop
    }
  }]);

  return DeckGLJS;
}();

export default DeckGLJS;


DeckGLJS.propTypes = propTypes;
DeckGLJS.defaultProps = defaultProps;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb3JlL3B1cmUtanMvZGVjay1qcy5qcyJdLCJuYW1lcyI6WyJMYXllck1hbmFnZXIiLCJFZmZlY3RNYW5hZ2VyIiwiRWZmZWN0IiwiV2ViTWVyY2F0b3JWaWV3cG9ydCIsIkV2ZW50TWFuYWdlciIsIkdMIiwiQW5pbWF0aW9uTG9vcCIsImNyZWF0ZUdMQ29udGV4dCIsInNldFBhcmFtZXRlcnMiLCJQcm9wVHlwZXMiLCJub29wIiwicHJvcFR5cGVzIiwiaWQiLCJzdHJpbmciLCJ3aWR0aCIsIm51bWJlciIsImlzUmVxdWlyZWQiLCJoZWlnaHQiLCJsYXllcnMiLCJhcnJheSIsInZpZXdwb3J0cyIsImVmZmVjdHMiLCJhcnJheU9mIiwiaW5zdGFuY2VPZiIsImxheWVyRmlsdGVyIiwiZnVuYyIsImdsT3B0aW9ucyIsIm9iamVjdCIsImdsIiwicGlja2luZ1JhZGl1cyIsImluaXRXZWJHTFBhcmFtZXRlcnMiLCJib29sIiwib25XZWJHTEluaXRpYWxpemVkIiwib25CZWZvcmVSZW5kZXIiLCJvbkFmdGVyUmVuZGVyIiwib25MYXllckNsaWNrIiwib25MYXllckhvdmVyIiwidXNlRGV2aWNlUGl4ZWxzIiwiZGVidWciLCJkcmF3UGlja2luZ0NvbG9ycyIsImRlZmF1bHRQcm9wcyIsIkRlY2tHTEpTIiwicHJvcHMiLCJPYmplY3QiLCJhc3NpZ24iLCJzdGF0ZSIsIm5lZWRzUmVkcmF3IiwibGF5ZXJNYW5hZ2VyIiwiZWZmZWN0TWFuYWdlciIsIl9vblJlbmRlcmVySW5pdGlhbGl6ZWQiLCJiaW5kIiwiX29uUmVuZGVyRnJhbWUiLCJjYW52YXMiLCJfY3JlYXRlQ2FudmFzIiwiYW5pbWF0aW9uTG9vcCIsIm9uQ3JlYXRlQ29udGV4dCIsIm9uSW5pdGlhbGl6ZSIsIm9uUmVuZGVyIiwic3RhcnQiLCJzZXRQcm9wcyIsInZpZXdwb3J0IiwibGF0aXR1ZGUiLCJsb25naXR1ZGUiLCJ6b29tIiwicGl0Y2giLCJiZWFyaW5nIiwic2V0Vmlld1BhcmFtZXRlcnMiLCJzdG9wIiwiZmluYWxpemUiLCJ4IiwieSIsInJhZGl1cyIsImxheWVySWRzIiwic2VsZWN0ZWRJbmZvcyIsInBpY2tPYmplY3QiLCJtb2RlIiwibGVuZ3RoIiwicGlja09iamVjdHMiLCJnZXRWaWV3cG9ydHMiLCJzdHlsZSIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsInBhcmVudCIsImJvZHkiLCJhcHBlbmRDaGlsZCIsImJsZW5kIiwiYmxlbmRGdW5jIiwiU1JDX0FMUEhBIiwiT05FX01JTlVTX1NSQ19BTFBIQSIsInBvbHlnb25PZmZzZXRGaWxsIiwiYmxlbmRGdW5jU2VwYXJhdGUiLCJPTkUiLCJkZXB0aFRlc3QiLCJkZXB0aEZ1bmMiLCJMRVFVQUwiLCJldmVudE1hbmFnZXIiLCJlZmZlY3QiLCJhZGRFZmZlY3QiLCJyZWRyYXdSZWFzb24iLCJjbGVhclJlZHJhd0ZsYWdzIiwiZHJhd0xheWVycyIsInBhc3MiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPQSxZQUFQLE1BQXlCLHNCQUF6QjtBQUNBLE9BQU9DLGFBQVAsTUFBMEIsb0NBQTFCO0FBQ0EsT0FBT0MsTUFBUCxNQUFtQiw0QkFBbkI7QUFDQSxPQUFPQyxtQkFBUCxNQUFnQyxvQ0FBaEM7O0FBRUEsU0FBUUMsWUFBUixRQUEyQixZQUEzQjtBQUNBLFNBQVFDLEVBQVIsRUFBWUMsYUFBWixFQUEyQkMsZUFBM0IsRUFBNENDLGFBQTVDLFFBQWdFLFNBQWhFOztBQUVBLE9BQU9DLFNBQVAsTUFBc0IsWUFBdEI7O0FBRUE7O0FBRUEsU0FBU0MsSUFBVCxHQUFnQixDQUFFOztBQUVsQixJQUFNQyxZQUFZO0FBQ2hCQyxNQUFJSCxVQUFVSSxNQURFO0FBRWhCQyxTQUFPTCxVQUFVTSxNQUFWLENBQWlCQyxVQUZSO0FBR2hCQyxVQUFRUixVQUFV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QUssU0FBTEEsRUFBSzs7QUFDbkIsVUFBTXNFLGVBQWUsS0FBS25ELFlBQUwsQ0FBa0JELFdBQWxCLENBQThCLEVBQUNxRCxrQkFBa0IsSUFBbkIsRUFBOUIsQ0FBckI7QUFDQSxVQUFJLENBQUNELFlBQUwsRUFBbUI7QUFDakI7QUFDRDs7QUFFRCxXQUFLeEQsS0FBTCxDQUFXVCxjQUFYLENBQTBCLEVBQUNMLE1BQUQsRUFBMUIsRUFObUIsQ0FNYztBQUNqQyxXQUFLbUIsWUFBTCxDQUFrQnFELFVBQWxCLENBQTZCO0FBQzNCQyxjQUFNLFFBRHFCO0FBRTNCSCxrQ0FGMkI7QUFHM0I7QUFDQTNELDJCQUFtQixLQUFLRyxLQUFMLENBQVdIO0FBSkgsT0FBN0I7QUFNQSxXQUFLRyxLQUFMLENBQVdSLGFBQVgsQ0FBeUIsRUFBQ04sTUFBRCxFQUF6QixFQWJtQixDQWFhO0FBQ2pDOzs7Ozs7ZUE1S2tCYSxROzs7QUErS3JCQSxTQUFTOUIsU0FBVCxHQUFxQkEsU0FBckI7QUFDQThCLFNBQVNELFlBQVQsR0FBd0JBLFlBQXhCIiwiZmlsZSI6ImRlY2stanMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgKGMpIDIwMTUgLSAyMDE3IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuaW1wb3J0IExheWVyTWFuYWdlciBmcm9tICcuLi9saWIvbGF5ZXItbWFuYWdlcic7XG5pbXBvcnQgRWZmZWN0TWFuYWdlciBmcm9tICcuLi9leHBlcmltZW50YWwvbGliL2VmZmVjdC1tYW5hZ2VyJztcbmltcG9ydCBFZmZlY3QgZnJvbSAnLi4vZXhwZXJpbWVudGFsL2xpYi9lZmZlY3QnO1xuaW1wb3J0IFdlYk1lcmNhdG9yVmlld3BvcnQgZnJvbSAnLi4vdmlld3BvcnRzL3dlYi1tZXJjYXRvci12aWV3cG9ydCc7XG5cbmltcG9ydCB7RXZlbnRNYW5hZ2VyfSBmcm9tICdtam9sbmlyLmpzJztcbmltcG9ydCB7R0wsIEFuaW1hdGlvbkxvb3AsIGNyZWF0ZUdMQ29udGV4dCwgc2V0UGFyYW1ldGVyc30gZnJvbSAnbHVtYS5nbCc7XG5cbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XG5cbi8qIGdsb2JhbCBkb2N1bWVudCAqL1xuXG5mdW5jdGlvbiBub29wKCkge31cblxuY29uc3QgcHJvcFR5cGVzID0ge1xuICBpZDogUHJvcFR5cGVzLnN0cmluZyxcbiAgd2lkdGg6IFByb3BUeXBlcy5udW1iZXIuaXNSZXF1aXJlZCxcbiAgaGVpZ2h0OiBQcm9wVHlwZXMubnVtYmVyLmlzUmVxdWlyZWQsXG4gIGxheWVyczogUHJvcFR5cGVzLmFycmF5LmlzUmVxdWlyZWQsIC8vIEFycmF5IGNhbiBjb250YWluIGZhbHN5IHZhbHVlc1xuICB2aWV3cG9ydHM6IFByb3BUeXBlcy5hcnJheSwgLy8gQXJyYXkgY2FuIGNvbnRhaW4gZmFsc3kgdmFsdWVzXG4gIGVmZmVjdHM6IFByb3BUeXBlcy5hcnJheU9mKFByb3BUeXBlcy5pbnN0YW5jZU9mKEVmZmVjdCkpLFxuICBsYXllckZpbHRlcjogUHJvcFR5cGVzLmZ1bmMsXG4gIGdsT3B0aW9uczogUHJvcFR5cGVzLm9iamVjdCxcbiAgZ2w6IFByb3BUeXBlcy5vYmplY3QsXG4gIHBpY2tpbmdSYWRpdXM6IFByb3BUeXBlcy5udW1iZXIsXG4gIGluaXRXZWJHTFBhcmFtZXRlcnM6IFByb3BUeXBlcy5ib29sLFxuICBvbldlYkdMSW5pdGlhbGl6ZWQ6IFByb3BUeXBlcy5mdW5jLFxuICBvbkJlZm9yZVJlbmRlcjogUHJvcFR5cGVzLmZ1bmMsXG4gIG9uQWZ0ZXJSZW5kZXI6IFByb3BUeXBlcy5mdW5jLFxuICBvbkxheWVyQ2xpY2s6IFByb3BUeXBlcy5mdW5jLFxuICBvbkxheWVySG92ZXI6IFByb3BUeXBlcy5mdW5jLFxuICB1c2VEZXZpY2VQaXhlbHM6IFByb3BUeXBlcy5ib29sLFxuXG4gIC8vIERlYnVnIHNldHRpbmdzXG4gIGRlYnVnOiBQcm9wVHlwZXMuYm9vbCxcbiAgZHJhd1BpY2tpbmdDb2xvcnM6IFByb3BUeXBlcy5ib29sXG59O1xuXG5jb25zdCBkZWZhdWx0UHJvcHMgPSB7XG4gIGlkOiAnZGVja2dsLW92ZXJsYXknLFxuICBwaWNraW5nUmFkaXVzOiAwLFxuICBsYXllckZpbHRlcjogbnVsbCxcbiAgZ2xPcHRpb25zOiB7fSxcbiAgZ2w6IG51bGwsXG4gIGVmZmVjdHM6IFtdLFxuICBpbml0V2ViR0xQYXJhbWV0ZXJzOiBmYWxzZSwgLy8gV2lsbCBiZSBzZXQgdG8gdHJ1ZSBpbiBuZXh0IG1ham9yIHJlbGVhc2VcbiAgb25XZWJHTEluaXRpYWxpemVkOiBub29wLFxuICBvbkJlZm9yZVJlbmRlcjogbm9vcCxcbiAgb25BZnRlclJlbmRlcjogbm9vcCxcbiAgb25MYXllckNsaWNrOiBudWxsLFxuICBvbkxheWVySG92ZXI6IG51bGwsXG4gIHVzZURldmljZVBpeGVsczogdHJ1ZSxcblxuICBkZWJ1ZzogZmFsc2UsXG4gIGRyYXdQaWNraW5nQ29sb3JzOiBmYWxzZVxufTtcblxuLy8gVE9ETyAtIHNob3VsZCB0aGlzIGNsYXNzIGJlIGpvaW5lZCB3aXRoIGBMYXllck1hbmFnZXJgP1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRGVja0dMSlMge1xuXG4gIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgcHJvcHMgPSBPYmplY3QuYXNzaWduKHt9LCBkZWZhdWx0UHJvcHMsIHByb3BzKTtcblxuICAgIHRoaXMuc3RhdGUgPSB7fTtcbiAgICB0aGlzLm5lZWRzUmVkcmF3ID0gdHJ1ZTtcbiAgICB0aGlzLmxheWVyTWFuYWdlciA9IG51bGw7XG4gICAgdGhpcy5lZmZlY3RNYW5hZ2VyID0gbnVsbDtcbiAgICB0aGlzLnZpZXdwb3J0cyA9IFtdO1xuXG4gICAgLy8gQmluZCBtZXRob2RzXG4gICAgdGhpcy5fb25SZW5kZXJlckluaXRpYWxpemVkID0gdGhpcy5fb25SZW5kZXJlckluaXRpYWxpemVkLmJpbmQodGhpcyk7XG4gICAgdGhpcy5fb25SZW5kZXJGcmFtZSA9IHRoaXMuX29uUmVuZGVyRnJhbWUuYmluZCh0aGlzKTtcblxuICAgIHRoaXMuY2FudmFzID0gdGhpcy5fY3JlYXRlQ2FudmFzKHByb3BzKTtcblxuICAgIGNvbnN0IHt3aWR0aCwgaGVpZ2h0LCBnbCwgZ2xPcHRpb25zLCBkZWJ1ZywgdXNlRGV2aWNlUGl4ZWxzfSA9IHByb3BzO1xuXG4gICAgdGhpcy5hbmltYXRpb25Mb29wID0gbmV3IEFuaW1hdGlvbkxvb3Aoe1xuICAgICAgd2lkdGgsXG4gICAgICBoZWlnaHQsXG4gICAgICB1c2VEZXZpY2VQaXhlbHMsXG4gICAgICBvbkNyZWF0ZUNvbnRleHQ6IG9wdHMgPT5cbiAgICAgICAgZ2wgfHwgY3JlYXRlR0xDb250ZXh0KE9iamVjdC5hc3NpZ24oe30sIGdsT3B0aW9ucywge2NhbnZhczogdGhpcy5jYW52YXMsIGRlYnVnfSkpLFxuICAgICAgb25Jbml0aWFsaXplOiB0aGlzLl9vblJlbmRlcmVySW5pdGlhbGl6ZWQsXG4gICAgICBvblJlbmRlcjogdGhpcy5fb25SZW5kZXJGcmFtZSxcbiAgICAgIG9uQmVmb3JlUmVuZGVyOiBwcm9wcy5vbkJlZm9yZVJlbmRlcixcbiAgICAgIG9uQWZ0ZXJSZW5kZXI6IHByb3BzLm9uQWZ0ZXJSZW5kZXJcbiAgICB9KTtcblxuICAgIHRoaXMuYW5pbWF0aW9uTG9vcC5zdGFydCgpO1xuXG4gICAgdGhpcy5zZXRQcm9wcyhwcm9wcyk7XG4gIH1cblxuICBzZXRQcm9wcyhwcm9wcykge1xuICAgIHByb3BzID0gT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5wcm9wcywgcHJvcHMpO1xuICAgIHRoaXMucHJvcHMgPSBwcm9wcztcblxuICAgIGlmICghdGhpcy5sYXllck1hbmFnZXIpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB7XG4gICAgICBsYXllcnMsXG4gICAgICBwaWNraW5nUmFkaXVzLFxuICAgICAgb25MYXllckNsaWNrLFxuICAgICAgb25MYXllckhvdmVyLFxuICAgICAgdXNlRGV2aWNlUGl4ZWxzLFxuICAgICAgZHJhd1BpY2tpbmdDb2xvcnMsXG4gICAgICBsYXllckZpbHRlclxuICAgIH0gPSBwcm9wcztcblxuICAgIC8vIFVwZGF0ZSB2aWV3cG9ydHMgKGNyZWF0aW5nIG9uZSBpZiBub3Qgc3VwcGxpZWQpXG4gICAgbGV0IHZpZXdwb3J0cyA9IHByb3BzLnZpZXdwb3J0cyB8fCBwcm9wcy52aWV3cG9ydDtcbiAgICBpZiAoIXZpZXdwb3J0cykge1xuICAgICAgY29uc3Qge3dpZHRoLCBoZWlnaHQsIGxhdGl0dWRlLCBsb25naXR1ZGUsIHpvb20sIHBpdGNoLCBiZWFyaW5nfSA9IHByb3BzO1xuICAgICAgdmlld3BvcnRzID0gW1xuICAgICAgICBuZXcgV2ViTWVyY2F0b3JWaWV3cG9ydCh7d2lkdGgsIGhlaWdodCwgbGF0aXR1ZGUsIGxvbmdpdHVkZSwgem9vbSwgcGl0Y2gsIGJlYXJpbmd9KVxuICAgICAgXTtcbiAgICB9XG5cbiAgICAvLyBJZiBtb3JlIHBhcmFtZXRlcnMgbmVlZCB0byBiZSB1cGRhdGVkIG9uIGxheWVyTWFuYWdlciBhZGQgdGhlbSB0byB0aGlzIG1ldGhvZC5cbiAgICB0aGlzLmxheWVyTWFuYWdlci5zZXRQYXJhbWV0ZXJzKHtcbiAgICAgIGxheWVycyxcbiAgICAgIHZpZXdwb3J0cyxcbiAgICAgIHVzZURldmljZVBpeGVscyxcbiAgICAgIGRyYXdQaWNraW5nQ29sb3JzLFxuICAgICAgbGF5ZXJGaWx0ZXIsXG4gICAgICBwaWNraW5nUmFkaXVzLFxuICAgICAgb25MYXllckNsaWNrLFxuICAgICAgb25MYXllckhvdmVyXG4gICAgfSk7XG5cbiAgICAvLyBUT0RPIC0gdW5pZnkgc2V0UGFyYW1ldGVycy9zZXRPcHRpb25zL3NldFByb3BzIGV0YyBuYW1pbmcuXG4gICAgdGhpcy5hbmltYXRpb25Mb29wLnNldFZpZXdQYXJhbWV0ZXJzKHt1c2VEZXZpY2VQaXhlbHN9KTtcbiAgfVxuXG4gIGZpbmFsaXplKCkge1xuICAgIHRoaXMuYW5pbWF0aW9uTG9vcC5zdG9wKCk7XG4gICAgdGhpcy5hbmltYXRpb25Mb29wID0gbnVsbDtcblxuICAgIGlmICh0aGlzLmxheWVyTWFuYWdlcikge1xuICAgICAgdGhpcy5sYXllck1hbmFnZXIuZmluYWxpemUoKTtcbiAgICAgIHRoaXMubGF5ZXJNYW5hZ2VyID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvLyBQdWJsaWMgQVBJXG5cbiAgcGlja09iamVjdCh7eCwgeSwgcmFkaXVzID0gMCwgbGF5ZXJJZHMgPSBudWxsfSkge1xuICAgIGNvbnN0IHNlbGVjdGVkSW5mb3MgPSB0aGlzLmxheWVyTWFuYWdlci5waWNrT2JqZWN0KHt4LCB5LCByYWRpdXMsIGxheWVySWRzLCBtb2RlOiAncXVlcnknfSk7XG4gICAgcmV0dXJuIHNlbGVjdGVkSW5mb3MubGVuZ3RoID8gc2VsZWN0ZWRJbmZvc1swXSA6IG51bGw7XG4gIH1cblxuICBwaWNrT2JqZWN0cyh7eCwgeSwgd2lkdGggPSAxLCBoZWlnaHQgPSAxLCBsYXllcklkcyA9IG51bGx9KSB7XG4gICAgcmV0dXJuIHRoaXMubGF5ZXJNYW5hZ2VyLnBpY2tPYmplY3RzKHt4LCB5LCB3aWR0aCwgaGVpZ2h0LCBsYXllcklkc30pO1xuICB9XG5cbiAgZ2V0Vmlld3BvcnRzKCkge1xuICAgIHJldHVybiB0aGlzLmxheWVyTWFuYWdlciA/IHRoaXMubGF5ZXJNYW5hZ2VyLmdldFZpZXdwb3J0cygpIDogW107XG4gIH1cblxuICAvLyBQcml2YXRlIE1ldGhvZHNcblxuICBfY3JlYXRlQ2FudmFzKHByb3BzKSB7XG4gICAgaWYgKHByb3BzLmNhbnZhcykge1xuICAgICAgcmV0dXJuIHByb3BzLmNhbnZhcztcbiAgICB9XG5cbiAgICBjb25zdCB7aWQsIHdpZHRoLCBoZWlnaHQsIHN0eWxlfSA9IHByb3BzO1xuICAgIGNvbnN0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgIGNhbnZhcy5pZCA9IGlkO1xuICAgIGNhbnZhcy53aWR0aCA9IHdpZHRoO1xuICAgIGNhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgY2FudmFzLnN0eWxlID0gc3R5bGU7XG5cbiAgICBjb25zdCBwYXJlbnQgPSBwcm9wcy5wYXJlbnQgfHwgZG9jdW1lbnQuYm9keTtcbiAgICBwYXJlbnQuYXBwZW5kQ2hpbGQoY2FudmFzKTtcblxuICAgIHJldHVybiBjYW52YXM7XG4gIH1cblxuICAvLyBDYWxsYmFja3NcblxuICBfb25SZW5kZXJlckluaXRpYWxpemVkKHtnbCwgY2FudmFzfSkge1xuICAgIHNldFBhcmFtZXRlcnMoZ2wsIHtcbiAgICAgIGJsZW5kOiB0cnVlLFxuICAgICAgYmxlbmRGdW5jOiBbR0wuU1JDX0FMUEhBLCBHTC5PTkVfTUlOVVNfU1JDX0FMUEhBXSxcbiAgICAgIHBvbHlnb25PZmZzZXRGaWxsOiB0cnVlXG4gICAgfSk7XG5cbiAgICAvLyBUT0RPIC0gdGhlc2Ugc2hvdWxkIGJlIHNldCBieSBkZWZhdWx0IHN0YXJ0aW5nIGZyb20gbmV4dCBtYWpvciByZWxlYXNlXG4gICAgaWYgKHRoaXMucHJvcHMuaW5pdFdlYkdMUGFyYW1ldGVycykge1xuICAgICAgc2V0UGFyYW1ldGVycyhnbCwge1xuICAgICAgICBibGVuZEZ1bmNTZXBhcmF0ZTogW0dMLlNSQ19BTFBIQSwgR0wuT05FX01JTlVTX1NSQ19BTFBIQSwgR0wuT05FLCBHTC5PTkVfTUlOVVNfU1JDX0FMUEhBXSxcbiAgICAgICAgZGVwdGhUZXN0OiB0cnVlLFxuICAgICAgICBkZXB0aEZ1bmM6IEdMLkxFUVVBTFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5wcm9wcy5vbldlYkdMSW5pdGlhbGl6ZWQoZ2wpO1xuXG4gICAgLy8gTm90ZTogYXZvaWQgUmVhY3Qgc2V0U3RhdGUgZHVlIEdMIGFuaW1hdGlvbiBsb29wIC8gc2V0U3RhdGUgdGltaW5nIGlzc3VlXG4gICAgdGhpcy5sYXllck1hbmFnZXIgPSBuZXcgTGF5ZXJNYW5hZ2VyKGdsLCB7XG4gICAgICBldmVudE1hbmFnZXI6IG5ldyBFdmVudE1hbmFnZXIoY2FudmFzKVxuICAgIH0pO1xuXG4gICAgdGhpcy5lZmZlY3RNYW5hZ2VyID0gbmV3IEVmZmVjdE1hbmFnZXIoe2dsLCBsYXllck1hbmFnZXI6IHRoaXMubGF5ZXJNYW5hZ2VyfSk7XG5cbiAgICBmb3IgKGNvbnN0IGVmZmVjdCBvZiB0aGlzLnByb3BzLmVmZmVjdHMpIHtcbiAgICAgIHRoaXMuZWZmZWN0TWFuYWdlci5hZGRFZmZlY3QoZWZmZWN0KTtcbiAgICB9XG5cbiAgICB0aGlzLnNldFByb3BzKHRoaXMucHJvcHMpO1xuICB9XG5cbiAgX29uUmVuZGVyRnJhbWUoe2dsfSkge1xuICAgIGNvbnN0IHJlZHJhd1JlYXNvbiA9IHRoaXMubGF5ZXJNYW5hZ2VyLm5lZWRzUmVkcmF3KHtjbGVhclJlZHJhd0ZsYWdzOiB0cnVlfSk7XG4gICAgaWYgKCFyZWRyYXdSZWFzb24pIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnByb3BzLm9uQmVmb3JlUmVuZGVyKHtnbH0pOyAvLyBUT0RPIC0gc2hvdWxkIGJlIGNhbGxlZCBieSBBbmltYXRpb25Mb29wXG4gICAgdGhpcy5sYXllck1hbmFnZXIuZHJhd0xheWVycyh7XG4gICAgICBwYXNzOiAnc2NyZWVuJyxcbiAgICAgIHJlZHJhd1JlYXNvbixcbiAgICAgIC8vIEhlbHBzIGRlYnVnIGxheWVyIHBpY2tpbmcsIGVzcGVjaWFsbHkgaW4gZnJhbWVidWZmZXIgcG93ZXJlZCBsYXllcnNcbiAgICAgIGRyYXdQaWNraW5nQ29sb3JzOiB0aGlzLnByb3BzLmRyYXdQaWNraW5nQ29sb3JzXG4gICAgfSk7XG4gICAgdGhpcy5wcm9wcy5vbkFmdGVyUmVuZGVyKHtnbH0pOyAvLyBUT0RPIC0gc2hvdWxkIGJlIGNhbGxlZCBieSBBbmltYXRpb25Mb29wXG4gIH1cbn1cblxuRGVja0dMSlMucHJvcFR5cGVzID0gcHJvcFR5cGVzO1xuRGVja0dMSlMuZGVmYXVsdFByb3BzID0gZGVmYXVsdFByb3BzO1xuIl19