'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// Copyright (c) 2015 Uber Technologies, Inc.
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

// A standard viewport implementation
var DEFAULT_FOV = 15;
var DEFAULT_SIZE = 1000;

var flatWorld = {

  // World size
  size: DEFAULT_SIZE,

  // Field of view
  fov: DEFAULT_FOV,

  Viewport: function () {

    /**
     * @classdesc
     * Calculate {x,y,with,height} of the WebGL viewport
     * based on provided canvas width and height
     *
     * Note: The viewport will be set to a square that covers
     * the canvas, and an offset will be applied to x or y
     * as necessary to center the window in the viewport
     * So that the camera will look at the center of the canvas
     *
     * @class
     * @param {number} width
     * @param {number} height
     */

    function Viewport(width, height) {
      _classCallCheck(this, Viewport);

      var xOffset = width > height ? 0 : (width - height) / 2;
      var yOffset = height > width ? 0 : (height - width) / 2;
      var size = Math.max(width, height);

      this.x = xOffset;
      this.y = yOffset;
      this.width = size;
      this.height = size;
    }

    _createClass(Viewport, [{
      key: 'screenToSpace',
      value: function screenToSpace(x, y) {
        return {
          x: ((x - this.x) / this.width - 0.5) * flatWorld.size * 2,
          y: ((y - this.y) / this.height - 0.5) * flatWorld.size * 2 * -1,
          z: 0
        };
      }
    }]);

    return Viewport;
  }(),

  getWorldSize: function getWorldSize() {
    return flatWorld.size;
  },


  // Camera height that will cover a plane of [-size, size]
  // to fit exactly the entire screen
  // Considering field of view is 45 degrees:
  //
  //
  //       Camera Height
  //     /|
  //    /~| => fov / 2
  //   /  |
  //  /   |
  // /    |
  // -----|
  // Half of plane [0, size]
  // The upper angle is half of the field of view angle.
  // Camera height = size / Math.tan((fov/2) * Math.PI/180);
  //
  getCameraHeight: function getCameraHeight(size, fov) {
    size = size || flatWorld.size;
    fov = fov || flatWorld.fov;

    switch (fov) {
      case 15:
        return size * 7.595754112725151;
      case 30:
        return size * 3.732050807568878;
      case 45:
        return size * 2.414213562373095;
      case 60:
        return size * 1.732050807568877;
      default:
        return size / Math.tan(fov / 2 * Math.PI / 180);
    }
  },
  getCamera: function getCamera() {
    var cameraHeight = flatWorld.getCameraHeight();
    return {
      fov: flatWorld.fov,
      near: (cameraHeight + 1) / 100,
      far: cameraHeight + 1,
      position: [0, 0, cameraHeight],
      aspect: 1
    };
  },
  getPixelRatio: function getPixelRatio(ratio) {
    return 1;
    // return ratio || 1;
  },
  getLighting: function getLighting() {
    return {
      enable: true,
      ambient: { r: 1.0, g: 1.0, b: 1.0 },
      points: [{
        diffuse: { r: 0.8, g: 0.8, b: 0.8 },
        specular: { r: 0.6, g: 0.6, b: 0.6 },
        position: [0.5, 0.5, 3]
      }]
    };
  },
  getBlending: function getBlending() {
    return {
      enable: true,
      blendFunc: ['SRC_ALPHA', 'ONE_MINUS_SRC_ALPHA'],
      blendEquation: 'FUNC_ADD'
    };
  }
};

exports.default = flatWorld;
//# sourceMappingURL=data:application/json;base64,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Q0Esa0JBQVUsRUFBQyxHQUFHLEdBQUgsRUFBUSxHQUFHLEdBQUgsRUFBUSxHQUFHLEdBQUgsRUFBM0I7QUFDQSxrQkFBVSxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsQ0FBWCxDQUFWO09BSE0sQ0FBUjtLQUhGLENBRFk7R0E3RkU7QUF5R2hCLHNDQUFjO0FBQ1osV0FBTztBQUNMLGNBQVEsSUFBUjtBQUNBLGlCQUFXLENBQUMsV0FBRCxFQUFjLHFCQUFkLENBQVg7QUFDQSxxQkFBZSxVQUFmO0tBSEYsQ0FEWTtHQXpHRTtDQUFaOztrQkFtSFMiLCJmaWxlIjoiZmxhdC13b3JsZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAoYykgMjAxNSBVYmVyIFRlY2hub2xvZ2llcywgSW5jLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbi8vIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbi8vIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbi8vIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbi8vIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuLy8gSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4vLyBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbi8vIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbi8vIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4vLyBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOXG4vLyBUSEUgU09GVFdBUkUuXG5cbi8vIEEgc3RhbmRhcmQgdmlld3BvcnQgaW1wbGVtZW50YXRpb25cbmNvbnN0IERFRkFVTFRfRk9WID0gMTU7XG5jb25zdCBERUZBVUxUX1NJWkUgPSAxMDAwO1xuXG5jb25zdCBmbGF0V29ybGQgPSB7XG5cbiAgLy8gV29ybGQgc2l6ZVxuICBzaXplOiBERUZBVUxUX1NJWkUsXG5cbiAgLy8gRmllbGQgb2Ygdmlld1xuICBmb3Y6IERFRkFVTFRfRk9WLFxuXG4gIFZpZXdwb3J0OiBjbGFzcyBWaWV3cG9ydCB7XG5cbiAgICAvKipcbiAgICAgKiBAY2xhc3NkZXNjXG4gICAgICogQ2FsY3VsYXRlIHt4LHksd2l0aCxoZWlnaHR9IG9mIHRoZSBXZWJHTCB2aWV3cG9ydFxuICAgICAqIGJhc2VkIG9uIHByb3ZpZGVkIGNhbnZhcyB3aWR0aCBhbmQgaGVpZ2h0XG4gICAgICpcbiAgICAgKiBOb3RlOiBUaGUgdmlld3BvcnQgd2lsbCBiZSBzZXQgdG8gYSBzcXVhcmUgdGhhdCBjb3ZlcnNcbiAgICAgKiB0aGUgY2FudmFzLCBhbmQgYW4gb2Zmc2V0IHdpbGwgYmUgYXBwbGllZCB0byB4IG9yIHlcbiAgICAgKiBhcyBuZWNlc3NhcnkgdG8gY2VudGVyIHRoZSB3aW5kb3cgaW4gdGhlIHZpZXdwb3J0XG4gICAgICogU28gdGhhdCB0aGUgY2FtZXJhIHdpbGwgbG9vayBhdCB0aGUgY2VudGVyIG9mIHRoZSBjYW52YXNcbiAgICAgKlxuICAgICAqIEBjbGFzc1xuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHRcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3Rvcih3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICBjb25zdCB4T2Zmc2V0ID0gd2lkdGggPiBoZWlnaHQgPyAwIDogKHdpZHRoIC0gaGVpZ2h0KSAvIDI7XG4gICAgICBjb25zdCB5T2Zmc2V0ID0gaGVpZ2h0ID4gd2lkdGggPyAwIDogKGhlaWdodCAtIHdpZHRoKSAvIDI7XG4gICAgICBjb25zdCBzaXplID0gTWF0aC5tYXgod2lkdGgsIGhlaWdodCk7XG5cbiAgICAgIHRoaXMueCA9IHhPZmZzZXQ7XG4gICAgICB0aGlzLnkgPSB5T2Zmc2V0O1xuICAgICAgdGhpcy53aWR0aCA9IHNpemU7XG4gICAgICB0aGlzLmhlaWdodCA9IHNpemU7XG4gICAgfVxuXG4gICAgc2NyZWVuVG9TcGFjZSh4LCB5KSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB4OiAoKHggLSB0aGlzLngpIC8gdGhpcy53aWR0aCAtIDAuNSkgKiBmbGF0V29ybGQuc2l6ZSAqIDIsXG4gICAgICAgIHk6ICgoeSAtIHRoaXMueSkgLyB0aGlzLmhlaWdodCAtIDAuNSkgKiBmbGF0V29ybGQuc2l6ZSAqIDIgKiAtMSxcbiAgICAgICAgejogMFxuICAgICAgfTtcbiAgICB9XG4gIH0sXG5cbiAgZ2V0V29ybGRTaXplKCkge1xuICAgIHJldHVybiBmbGF0V29ybGQuc2l6ZTtcbiAgfSxcblxuICAvLyBDYW1lcmEgaGVpZ2h0IHRoYXQgd2lsbCBjb3ZlciBhIHBsYW5lIG9mIFstc2l6ZSwgc2l6ZV1cbiAgLy8gdG8gZml0IGV4YWN0bHkgdGhlIGVudGlyZSBzY3JlZW5cbiAgLy8gQ29uc2lkZXJpbmcgZmllbGQgb2YgdmlldyBpcyA0NSBkZWdyZWVzOlxuICAvL1xuICAvL1xuICAvLyAgICAgICBDYW1lcmEgSGVpZ2h0XG4gIC8vICAgICAvfFxuICAvLyAgICAvfnwgPT4gZm92IC8gMlxuICAvLyAgIC8gIHxcbiAgLy8gIC8gICB8XG4gIC8vIC8gICAgfFxuICAvLyAtLS0tLXxcbiAgLy8gSGFsZiBvZiBwbGFuZSBbMCwgc2l6ZV1cbiAgLy8gVGhlIHVwcGVyIGFuZ2xlIGlzIGhhbGYgb2YgdGhlIGZpZWxkIG9mIHZpZXcgYW5nbGUuXG4gIC8vIENhbWVyYSBoZWlnaHQgPSBzaXplIC8gTWF0aC50YW4oKGZvdi8yKSAqIE1hdGguUEkvMTgwKTtcbiAgLy9cbiAgZ2V0Q2FtZXJhSGVpZ2h0KHNpemUsIGZvdikge1xuICAgIHNpemUgPSBzaXplIHx8IGZsYXRXb3JsZC5zaXplO1xuICAgIGZvdiA9IGZvdiB8fCBmbGF0V29ybGQuZm92O1xuXG4gICAgc3dpdGNoIChmb3YpIHtcbiAgICBjYXNlIDE1OiByZXR1cm4gc2l6ZSAqIDcuNTk1NzU0MTEyNzI1MTUxO1xuICAgIGNhc2UgMzA6IHJldHVybiBzaXplICogMy43MzIwNTA4MDc1Njg4Nzg7XG4gICAgY2FzZSA0NTogcmV0dXJuIHNpemUgKiAyLjQxNDIxMzU2MjM3MzA5NTtcbiAgICBjYXNlIDYwOiByZXR1cm4gc2l6ZSAqIDEuNzMyMDUwODA3NTY4ODc3O1xuICAgIGRlZmF1bHQ6IHJldHVybiBzaXplIC8gTWF0aC50YW4oZm92IC8gMiAqIE1hdGguUEkgLyAxODApO1xuICAgIH1cbiAgfSxcblxuICBnZXRDYW1lcmEoKSB7XG4gICAgY29uc3QgY2FtZXJhSGVpZ2h0ID0gZmxhdFdvcmxkLmdldENhbWVyYUhlaWdodCgpO1xuICAgIHJldHVybiB7XG4gICAgICBmb3Y6IGZsYXRXb3JsZC5mb3YsXG4gICAgICBuZWFyOiAoY2FtZXJhSGVpZ2h0ICsgMSkgLyAxMDAsXG4gICAgICBmYXI6IGNhbWVyYUhlaWdodCArIDEsXG4gICAgICBwb3NpdGlvbjogWzAsIDAsIGNhbWVyYUhlaWdodF0sXG4gICAgICBhc3BlY3Q6IDFcbiAgICB9O1xuICB9LFxuXG4gIGdldFBpeGVsUmF0aW8ocmF0aW8pIHtcbiAgICByZXR1cm4gMTtcbiAgICAvLyByZXR1cm4gcmF0aW8gfHwgMTtcbiAgfSxcblxuICBnZXRMaWdodGluZygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZW5hYmxlOiB0cnVlLFxuICAgICAgYW1iaWVudDoge3I6IDEuMCwgZzogMS4wLCBiOiAxLjB9LFxuICAgICAgcG9pbnRzOiBbe1xuICAgICAgICBkaWZmdXNlOiB7cjogMC44LCBnOiAwLjgsIGI6IDAuOH0sXG4gICAgICAgIHNwZWN1bGFyOiB7cjogMC42LCBnOiAwLjYsIGI6IDAuNn0sXG4gICAgICAgIHBvc2l0aW9uOiBbMC41LCAwLjUsIDNdXG4gICAgICB9XVxuICAgIH07XG4gIH0sXG5cbiAgZ2V0QmxlbmRpbmcoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGVuYWJsZTogdHJ1ZSxcbiAgICAgIGJsZW5kRnVuYzogWydTUkNfQUxQSEEnLCAnT05FX01JTlVTX1NSQ19BTFBIQSddLFxuICAgICAgYmxlbmRFcXVhdGlvbjogJ0ZVTkNfQUREJ1xuICAgIH07XG4gIH1cblxufTtcblxuZXhwb3J0IGRlZmF1bHQgZmxhdFdvcmxkO1xuIl19