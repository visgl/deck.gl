var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

/* global window */
import { GL, Framebuffer, Model, Geometry } from 'luma.gl';
import Effect from '../../../core/experimental/lib/effect';
import WebMercatorViewport from '../../../core/viewports/web-mercator-viewport';

import reflectionVertex from './reflection-effect-vertex.glsl';
import reflectionFragment from './reflection-effect-fragment.glsl';

var ReflectionEffect = function (_Effect) {
  _inherits(ReflectionEffect, _Effect);

  /**
   * @classdesc
   * ReflectionEffect
   *
   * @class
   * @param reflectivity How visible reflections should be over the map, between 0 and 1
   * @param blur how blurry the reflection should be, between 0 and 1
   */

  function ReflectionEffect() {
    var reflectivity = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0.5;
    var blur = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.5;

    _classCallCheck(this, ReflectionEffect);

    var _this = _possibleConstructorReturn(this, (ReflectionEffect.__proto__ || Object.getPrototypeOf(ReflectionEffect)).call(this));

    _this.reflectivity = reflectivity;
    _this.blur = blur;
    _this.framebuffer = null;
    _this.setNeedsRedraw();
    return _this;
  }

  _createClass(ReflectionEffect, [{
    key: 'getShaders',
    value: function getShaders() {
      return {
        vs: reflectionVertex,
        fs: reflectionFragment,
        modules: [],
        shaderCache: this.context.shaderCache
      };
    }
  }, {
    key: 'initialize',
    value: function initialize(_ref) {
      var gl = _ref.gl,
          layerManager = _ref.layerManager;

      this.unitQuad = new Model(gl, Object.assign({}, this.getShaders(), {
        id: 'reflection-effect',
        geometry: new Geometry({
          drawMode: GL.TRIANGLE_FAN,
          vertices: new Float32Array([0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0])
        })
      }));
      this.framebuffer = new Framebuffer(gl, { depth: true });
    }
  }, {
    key: 'preDraw',
    value: function preDraw(_ref2) {
      var gl = _ref2.gl,
          layerManager = _ref2.layerManager;
      var viewport = layerManager.context.viewport;
      /*
       * the renderer already has a reference to this, but we don't have a reference to the renderer.
       * when we refactor the camera code, we should make sure we get a reference to the renderer so
       * that we can keep this in one place.
       */

      var dpi = typeof window !== 'undefined' && window.devicePixelRatio || 1;
      this.framebuffer.resize({ width: dpi * viewport.width, height: dpi * viewport.height });
      var pitch = viewport.pitch;
      this.framebuffer.bind();
      /* this is a huge hack around the existing viewport class.
       * TODO in the future, once we implement bona-fide cameras, we really need to fix this.
       */
      layerManager.setViewport(new WebMercatorViewport(Object.assign({}, viewport, { pitch: -180 - pitch })));
      gl.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

      layerManager.drawLayers({ pass: 'reflection' });
      layerManager.setViewport(viewport);
      this.framebuffer.unbind();
    }
  }, {
    key: 'draw',
    value: function draw(_ref3) {
      var gl = _ref3.gl,
          layerManager = _ref3.layerManager;

      /*
       * Render our unit quad.
       * This will cover the entire screen, but will lie behind all other geometry.
       * This quad will sample the previously generated reflection texture
       * in order to create the reflection effect
       */
      this.unitQuad.render({
        reflectionTexture: this.framebuffer.texture,
        reflectionTextureWidth: this.framebuffer.width,
        reflectionTextureHeight: this.framebuffer.height,
        reflectivity: this.reflectivity,
        blur: this.blur
      });
    }
  }, {
    key: 'finalize',
    value: function finalize(_ref4) {
      /* TODO: Free resources? */

      var gl = _ref4.gl,
          layerManager = _ref4.layerManager;
    }
  }]);

  return ReflectionEffect;
}(Effect);

export default ReflectionEffect;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9lZmZlY3RzL2V4cGVyaW1lbnRhbC9yZWZsZWN0aW9uLWVmZmVjdC9yZWZsZWN0aW9uLWVmZmVjdC5qcyJdLCJuYW1lcyI6WyJHTCIsIkZyYW1lYnVmZmVyIiwiTW9kZWwiLCJHZW9tZXRyeSIsIkVmZmVjdCIsIldlYk1lcmNhdG9yVmlld3BvcnQiLCJyZWZsZWN0aW9uVmVydGV4IiwicmVmbGVjdGlvbkZyYWdtZW50IiwiUmVmbGVjdGlvbkVmZmVjdCIsInJlZmxlY3Rpdml0eSIsImJsdXIiLCJmcmFtZWJ1ZmZlciIsInNldE5lZWRzUmVkcmF3IiwidnMiLCJmcyIsIm1vZHVsZXMiLCJzaGFkZXJDYWNoZSIsImNvbnRleHQiLCJnbCIsImxheWVyTWFuYWdlciIsInVuaXRRdWFkIiwiT2JqZWN0IiwiYXNzaWduIiwiZ2V0U2hhZGVycyIsImlkIiwiZ2VvbWV0cnkiLCJkcmF3TW9kZSIsIlRSSUFOR0xFX0ZBTiIsInZlcnRpY2VzIiwiRmxvYXQzMkFycmF5IiwiZGVwdGgiLCJ2aWV3cG9ydCIsImRwaSIsIndpbmRvdyIsImRldmljZVBpeGVsUmF0aW8iLCJyZXNpemUiLCJ3aWR0aCIsImhlaWdodCIsInBpdGNoIiwiYmluZCIsInNldFZpZXdwb3J0IiwiY2xlYXIiLCJDT0xPUl9CVUZGRVJfQklUIiwiREVQVEhfQlVGRkVSX0JJVCIsImRyYXdMYXllcnMiLCJwYXNzIiwidW5iaW5kIiwicmVuZGVyIiwicmVmbGVjdGlvblRleHR1cmUiLCJ0ZXh0dXJlIiwicmVmbGVjdGlvblRleHR1cmVXaWR0aCIsInJlZmxlY3Rpb25UZXh0dXJlSGVpZ2h0Il0sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsU0FBUUEsRUFBUixFQUFZQyxXQUFaLEVBQXlCQyxLQUF6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QUwsQ0FBYzJCLE1BQWQsQ0FBcUI7QUFDbkJDLDJCQUFtQixLQUFLckMsV0FBTCxDQUFpQnNDLE9BRGpCO0FBRW5CQyxnQ0FBd0IsS0FBS3ZDLFdBQUwsQ0FBaUJ5QixLQUZ0QjtBQUduQmUsaUNBQXlCLEtBQUt4QyxXQUFMLENBQWlCMEIsTUFIdkI7QUFJbkI1QixzQkFBYyxLQUFLQSxZQUpBO0FBS25CQyxjQUFNLEtBQUtBO0FBTFEsT0FBckI7QUFPRDs7O29DQUU0QjtBQUMzQjs7QUFEMkIsVUFBbkJRLEVBQW1CLFNBQW5CQSxFQUFtQjtBQUFBLFVBQWZDLFlBQWUsU0FBZkEsWUFBZTtBQUU1Qjs7OztFQWxGMkNmLE07O2VBQXpCSSxnQiIsImZpbGUiOiJyZWZsZWN0aW9uLWVmZmVjdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNSAtIDIwMTcgVWJlciBUZWNobm9sb2dpZXMsIEluYy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4vLyBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4vLyBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4vLyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4vLyBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbi8vIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW5cbi8vIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4vLyBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuLy8gT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTlxuLy8gVEhFIFNPRlRXQVJFLlxuXG4vKiBnbG9iYWwgd2luZG93ICovXG5pbXBvcnQge0dMLCBGcmFtZWJ1ZmZlciwgTW9kZWwsIEdlb21ldHJ5fSBmcm9tICdsdW1hLmdsJztcbmltcG9ydCBFZmZlY3QgZnJvbSAnLi4vLi4vLi4vY29yZS9leHBlcmltZW50YWwvbGliL2VmZmVjdCc7XG5pbXBvcnQgV2ViTWVyY2F0b3JWaWV3cG9ydCBmcm9tICcuLi8uLi8uLi9jb3JlL3ZpZXdwb3J0cy93ZWItbWVyY2F0b3Itdmlld3BvcnQnO1xuXG5pbXBvcnQgcmVmbGVjdGlvblZlcnRleCBmcm9tICcuL3JlZmxlY3Rpb24tZWZmZWN0LXZlcnRleC5nbHNsJztcbmltcG9ydCByZWZsZWN0aW9uRnJhZ21lbnQgZnJvbSAnLi9yZWZsZWN0aW9uLWVmZmVjdC1mcmFnbWVudC5nbHNsJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgUmVmbGVjdGlvbkVmZmVjdCBleHRlbmRzIEVmZmVjdCB7XG5cbiAgLyoqXG4gICAqIEBjbGFzc2Rlc2NcbiAgICogUmVmbGVjdGlvbkVmZmVjdFxuICAgKlxuICAgKiBAY2xhc3NcbiAgICogQHBhcmFtIHJlZmxlY3Rpdml0eSBIb3cgdmlzaWJsZSByZWZsZWN0aW9ucyBzaG91bGQgYmUgb3ZlciB0aGUgbWFwLCBiZXR3ZWVuIDAgYW5kIDFcbiAgICogQHBhcmFtIGJsdXIgaG93IGJsdXJyeSB0aGUgcmVmbGVjdGlvbiBzaG91bGQgYmUsIGJldHdlZW4gMCBhbmQgMVxuICAgKi9cblxuICBjb25zdHJ1Y3RvcihyZWZsZWN0aXZpdHkgPSAwLjUsIGJsdXIgPSAwLjUpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMucmVmbGVjdGl2aXR5ID0gcmVmbGVjdGl2aXR5O1xuICAgIHRoaXMuYmx1ciA9IGJsdXI7XG4gICAgdGhpcy5mcmFtZWJ1ZmZlciA9IG51bGw7XG4gICAgdGhpcy5zZXROZWVkc1JlZHJhdygpO1xuICB9XG5cbiAgZ2V0U2hhZGVycygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdnM6IHJlZmxlY3Rpb25WZXJ0ZXgsXG4gICAgICBmczogcmVmbGVjdGlvbkZyYWdtZW50LFxuICAgICAgbW9kdWxlczogW10sXG4gICAgICBzaGFkZXJDYWNoZTogdGhpcy5jb250ZXh0LnNoYWRlckNhY2hlXG4gICAgfTtcbiAgfVxuXG4gIGluaXRpYWxpemUoe2dsLCBsYXllck1hbmFnZXJ9KSB7XG4gICAgdGhpcy51bml0UXVhZCA9IG5ldyBNb2RlbChnbCwgT2JqZWN0LmFzc2lnbih7fSwgdGhpcy5nZXRTaGFkZXJzKCksIHtcbiAgICAgIGlkOiAncmVmbGVjdGlvbi1lZmZlY3QnLFxuICAgICAgZ2VvbWV0cnk6IG5ldyBHZW9tZXRyeSh7XG4gICAgICAgIGRyYXdNb2RlOiBHTC5UUklBTkdMRV9GQU4sXG4gICAgICAgIHZlcnRpY2VzOiBuZXcgRmxvYXQzMkFycmF5KFswLCAwLCAwLCAxLCAwLCAwLCAxLCAxLCAwLCAwLCAxLCAwXSlcbiAgICAgIH0pXG4gICAgfSkpO1xuICAgIHRoaXMuZnJhbWVidWZmZXIgPSBuZXcgRnJhbWVidWZmZXIoZ2wsIHtkZXB0aDogdHJ1ZX0pO1xuXG4gIH1cblxuICBwcmVEcmF3KHtnbCwgbGF5ZXJNYW5hZ2VyfSkge1xuICAgIGNvbnN0IHt2aWV3cG9ydH0gPSBsYXllck1hbmFnZXIuY29udGV4dDtcbiAgICAvKlxuICAgICAqIHRoZSByZW5kZXJlciBhbHJlYWR5IGhhcyBhIHJlZmVyZW5jZSB0byB0aGlzLCBidXQgd2UgZG9uJ3QgaGF2ZSBhIHJlZmVyZW5jZSB0byB0aGUgcmVuZGVyZXIuXG4gICAgICogd2hlbiB3ZSByZWZhY3RvciB0aGUgY2FtZXJhIGNvZGUsIHdlIHNob3VsZCBtYWtlIHN1cmUgd2UgZ2V0IGEgcmVmZXJlbmNlIHRvIHRoZSByZW5kZXJlciBzb1xuICAgICAqIHRoYXQgd2UgY2FuIGtlZXAgdGhpcyBpbiBvbmUgcGxhY2UuXG4gICAgICovXG4gICAgY29uc3QgZHBpID0gKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvKSB8fCAxO1xuICAgIHRoaXMuZnJhbWVidWZmZXIucmVzaXplKHt3aWR0aDogZHBpICogdmlld3BvcnQud2lkdGgsIGhlaWdodDogZHBpICogdmlld3BvcnQuaGVpZ2h0fSk7XG4gICAgY29uc3QgcGl0Y2ggPSB2aWV3cG9ydC5waXRjaDtcbiAgICB0aGlzLmZyYW1lYnVmZmVyLmJpbmQoKTtcbiAgICAvKiB0aGlzIGlzIGEgaHVnZSBoYWNrIGFyb3VuZCB0aGUgZXhpc3Rpbmcgdmlld3BvcnQgY2xhc3MuXG4gICAgICogVE9ETyBpbiB0aGUgZnV0dXJlLCBvbmNlIHdlIGltcGxlbWVudCBib25hLWZpZGUgY2FtZXJhcywgd2UgcmVhbGx5IG5lZWQgdG8gZml4IHRoaXMuXG4gICAgICovXG4gICAgbGF5ZXJNYW5hZ2VyLnNldFZpZXdwb3J0KFxuICAgICAgbmV3IFdlYk1lcmNhdG9yVmlld3BvcnQoT2JqZWN0LmFzc2lnbih7fSwgdmlld3BvcnQsIHtwaXRjaDogLTE4MCAtIHBpdGNofSkpXG4gICAgKTtcbiAgICBnbC5jbGVhcihHTC5DT0xPUl9CVUZGRVJfQklUIHwgR0wuREVQVEhfQlVGRkVSX0JJVCk7XG5cbiAgICBsYXllck1hbmFnZXIuZHJhd0xheWVycyh7cGFzczogJ3JlZmxlY3Rpb24nfSk7XG4gICAgbGF5ZXJNYW5hZ2VyLnNldFZpZXdwb3J0KHZpZXdwb3J0KTtcbiAgICB0aGlzLmZyYW1lYnVmZmVyLnVuYmluZCgpO1xuICB9XG5cbiAgZHJhdyh7Z2wsIGxheWVyTWFuYWdlcn0pIHtcbiAgICAvKlxuICAgICAqIFJlbmRlciBvdXIgdW5pdCBxdWFkLlxuICAgICAqIFRoaXMgd2lsbCBjb3ZlciB0aGUgZW50aXJlIHNjcmVlbiwgYnV0IHdpbGwgbGllIGJlaGluZCBhbGwgb3RoZXIgZ2VvbWV0cnkuXG4gICAgICogVGhpcyBxdWFkIHdpbGwgc2FtcGxlIHRoZSBwcmV2aW91c2x5IGdlbmVyYXRlZCByZWZsZWN0aW9uIHRleHR1cmVcbiAgICAgKiBpbiBvcmRlciB0byBjcmVhdGUgdGhlIHJlZmxlY3Rpb24gZWZmZWN0XG4gICAgICovXG4gICAgdGhpcy51bml0UXVhZC5yZW5kZXIoe1xuICAgICAgcmVmbGVjdGlvblRleHR1cmU6IHRoaXMuZnJhbWVidWZmZXIudGV4dHVyZSxcbiAgICAgIHJlZmxlY3Rpb25UZXh0dXJlV2lkdGg6IHRoaXMuZnJhbWVidWZmZXIud2lkdGgsXG4gICAgICByZWZsZWN0aW9uVGV4dHVyZUhlaWdodDogdGhpcy5mcmFtZWJ1ZmZlci5oZWlnaHQsXG4gICAgICByZWZsZWN0aXZpdHk6IHRoaXMucmVmbGVjdGl2aXR5LFxuICAgICAgYmx1cjogdGhpcy5ibHVyXG4gICAgfSk7XG4gIH1cblxuICBmaW5hbGl6ZSh7Z2wsIGxheWVyTWFuYWdlcn0pIHtcbiAgICAvKiBUT0RPOiBGcmVlIHJlc291cmNlcz8gKi9cbiAgfVxufVxuIl19