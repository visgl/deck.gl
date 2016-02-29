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
      blendFunc: ['SRC_ALPHA', 'ZERO'],
      blendEquation: 'FUNC_ADD'
    };
  }
};

exports.default = flatWorld;
//# sourceMappingURL=data:application/json;base64,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Q0Esa0JBQVUsRUFBQyxHQUFHLEdBQUgsRUFBUSxHQUFHLEdBQUgsRUFBUSxHQUFHLEdBQUgsRUFBM0I7QUFDQSxrQkFBVSxDQUFDLEdBQUQsRUFBTSxHQUFOLEVBQVcsQ0FBWCxDQUFWO09BSE0sQ0FBUjtLQUhGLENBRFk7R0E3RkU7QUF5R2hCLHNDQUFjO0FBQ1osV0FBTztBQUNMLGNBQVEsSUFBUjtBQUNBLGlCQUFXLENBQUMsV0FBRCxFQUFjLE1BQWQsQ0FBWDtBQUNBLHFCQUFlLFVBQWY7S0FIRixDQURZO0dBekdFO0NBQVo7O2tCQW1IUyIsImZpbGUiOiJmbGF0LXdvcmxkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuLy8gQSBzdGFuZGFyZCB2aWV3cG9ydCBpbXBsZW1lbnRhdGlvblxuY29uc3QgREVGQVVMVF9GT1YgPSAxNTtcbmNvbnN0IERFRkFVTFRfU0laRSA9IDEwMDA7XG5cbmNvbnN0IGZsYXRXb3JsZCA9IHtcblxuICAvLyBXb3JsZCBzaXplXG4gIHNpemU6IERFRkFVTFRfU0laRSxcblxuICAvLyBGaWVsZCBvZiB2aWV3XG4gIGZvdjogREVGQVVMVF9GT1YsXG5cbiAgVmlld3BvcnQ6IGNsYXNzIFZpZXdwb3J0IHtcblxuICAgIC8qKlxuICAgICAqIEBjbGFzc2Rlc2NcbiAgICAgKiBDYWxjdWxhdGUge3gseSx3aXRoLGhlaWdodH0gb2YgdGhlIFdlYkdMIHZpZXdwb3J0XG4gICAgICogYmFzZWQgb24gcHJvdmlkZWQgY2FudmFzIHdpZHRoIGFuZCBoZWlnaHRcbiAgICAgKlxuICAgICAqIE5vdGU6IFRoZSB2aWV3cG9ydCB3aWxsIGJlIHNldCB0byBhIHNxdWFyZSB0aGF0IGNvdmVyc1xuICAgICAqIHRoZSBjYW52YXMsIGFuZCBhbiBvZmZzZXQgd2lsbCBiZSBhcHBsaWVkIHRvIHggb3IgeVxuICAgICAqIGFzIG5lY2Vzc2FyeSB0byBjZW50ZXIgdGhlIHdpbmRvdyBpbiB0aGUgdmlld3BvcnRcbiAgICAgKiBTbyB0aGF0IHRoZSBjYW1lcmEgd2lsbCBsb29rIGF0IHRoZSBjZW50ZXIgb2YgdGhlIGNhbnZhc1xuICAgICAqXG4gICAgICogQGNsYXNzXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGhlaWdodFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgIGNvbnN0IHhPZmZzZXQgPSB3aWR0aCA+IGhlaWdodCA/IDAgOiAod2lkdGggLSBoZWlnaHQpIC8gMjtcbiAgICAgIGNvbnN0IHlPZmZzZXQgPSBoZWlnaHQgPiB3aWR0aCA/IDAgOiAoaGVpZ2h0IC0gd2lkdGgpIC8gMjtcbiAgICAgIGNvbnN0IHNpemUgPSBNYXRoLm1heCh3aWR0aCwgaGVpZ2h0KTtcblxuICAgICAgdGhpcy54ID0geE9mZnNldDtcbiAgICAgIHRoaXMueSA9IHlPZmZzZXQ7XG4gICAgICB0aGlzLndpZHRoID0gc2l6ZTtcbiAgICAgIHRoaXMuaGVpZ2h0ID0gc2l6ZTtcbiAgICB9XG5cbiAgICBzY3JlZW5Ub1NwYWNlKHgsIHkpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHg6ICgoeCAtIHRoaXMueCkgLyB0aGlzLndpZHRoIC0gMC41KSAqIGZsYXRXb3JsZC5zaXplICogMixcbiAgICAgICAgeTogKCh5IC0gdGhpcy55KSAvIHRoaXMuaGVpZ2h0IC0gMC41KSAqIGZsYXRXb3JsZC5zaXplICogMiAqIC0xLFxuICAgICAgICB6OiAwXG4gICAgICB9O1xuICAgIH1cbiAgfSxcblxuICBnZXRXb3JsZFNpemUoKSB7XG4gICAgcmV0dXJuIGZsYXRXb3JsZC5zaXplO1xuICB9LFxuXG4gIC8vIENhbWVyYSBoZWlnaHQgdGhhdCB3aWxsIGNvdmVyIGEgcGxhbmUgb2YgWy1zaXplLCBzaXplXVxuICAvLyB0byBmaXQgZXhhY3RseSB0aGUgZW50aXJlIHNjcmVlblxuICAvLyBDb25zaWRlcmluZyBmaWVsZCBvZiB2aWV3IGlzIDQ1IGRlZ3JlZXM6XG4gIC8vXG4gIC8vXG4gIC8vICAgICAgIENhbWVyYSBIZWlnaHRcbiAgLy8gICAgIC98XG4gIC8vICAgIC9+fCA9PiBmb3YgLyAyXG4gIC8vICAgLyAgfFxuICAvLyAgLyAgIHxcbiAgLy8gLyAgICB8XG4gIC8vIC0tLS0tfFxuICAvLyBIYWxmIG9mIHBsYW5lIFswLCBzaXplXVxuICAvLyBUaGUgdXBwZXIgYW5nbGUgaXMgaGFsZiBvZiB0aGUgZmllbGQgb2YgdmlldyBhbmdsZS5cbiAgLy8gQ2FtZXJhIGhlaWdodCA9IHNpemUgLyBNYXRoLnRhbigoZm92LzIpICogTWF0aC5QSS8xODApO1xuICAvL1xuICBnZXRDYW1lcmFIZWlnaHQoc2l6ZSwgZm92KSB7XG4gICAgc2l6ZSA9IHNpemUgfHwgZmxhdFdvcmxkLnNpemU7XG4gICAgZm92ID0gZm92IHx8IGZsYXRXb3JsZC5mb3Y7XG5cbiAgICBzd2l0Y2ggKGZvdikge1xuICAgIGNhc2UgMTU6IHJldHVybiBzaXplICogNy41OTU3NTQxMTI3MjUxNTE7XG4gICAgY2FzZSAzMDogcmV0dXJuIHNpemUgKiAzLjczMjA1MDgwNzU2ODg3ODtcbiAgICBjYXNlIDQ1OiByZXR1cm4gc2l6ZSAqIDIuNDE0MjEzNTYyMzczMDk1O1xuICAgIGNhc2UgNjA6IHJldHVybiBzaXplICogMS43MzIwNTA4MDc1Njg4Nzc7XG4gICAgZGVmYXVsdDogcmV0dXJuIHNpemUgLyBNYXRoLnRhbihmb3YgLyAyICogTWF0aC5QSSAvIDE4MCk7XG4gICAgfVxuICB9LFxuXG4gIGdldENhbWVyYSgpIHtcbiAgICBjb25zdCBjYW1lcmFIZWlnaHQgPSBmbGF0V29ybGQuZ2V0Q2FtZXJhSGVpZ2h0KCk7XG4gICAgcmV0dXJuIHtcbiAgICAgIGZvdjogZmxhdFdvcmxkLmZvdixcbiAgICAgIG5lYXI6IChjYW1lcmFIZWlnaHQgKyAxKSAvIDEwMCxcbiAgICAgIGZhcjogY2FtZXJhSGVpZ2h0ICsgMSxcbiAgICAgIHBvc2l0aW9uOiBbMCwgMCwgY2FtZXJhSGVpZ2h0XSxcbiAgICAgIGFzcGVjdDogMVxuICAgIH07XG4gIH0sXG5cbiAgZ2V0UGl4ZWxSYXRpbyhyYXRpbykge1xuICAgIHJldHVybiAxO1xuICAgIC8vIHJldHVybiByYXRpbyB8fCAxO1xuICB9LFxuXG4gIGdldExpZ2h0aW5nKCkge1xuICAgIHJldHVybiB7XG4gICAgICBlbmFibGU6IHRydWUsXG4gICAgICBhbWJpZW50OiB7cjogMS4wLCBnOiAxLjAsIGI6IDEuMH0sXG4gICAgICBwb2ludHM6IFt7XG4gICAgICAgIGRpZmZ1c2U6IHtyOiAwLjgsIGc6IDAuOCwgYjogMC44fSxcbiAgICAgICAgc3BlY3VsYXI6IHtyOiAwLjYsIGc6IDAuNiwgYjogMC42fSxcbiAgICAgICAgcG9zaXRpb246IFswLjUsIDAuNSwgM11cbiAgICAgIH1dXG4gICAgfTtcbiAgfSxcblxuICBnZXRCbGVuZGluZygpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZW5hYmxlOiB0cnVlLFxuICAgICAgYmxlbmRGdW5jOiBbJ1NSQ19BTFBIQScsICdaRVJPJ10sXG4gICAgICBibGVuZEVxdWF0aW9uOiAnRlVOQ19BREQnXG4gICAgfTtcbiAgfVxuXG59O1xuXG5leHBvcnQgZGVmYXVsdCBmbGF0V29ybGQ7XG4iXX0=