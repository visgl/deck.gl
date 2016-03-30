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
      value: function screenToSpace(_ref) {
        var x = _ref.x;
        var y = _ref.y;

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
//# sourceMappingURL=data:application/json;base64,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QUgsRUFBMUI7QUFDQSxrQkFBVSxFQUFDLEdBQUcsR0FBSCxFQUFRLEdBQUcsR0FBSCxFQUFRLEdBQUcsR0FBSCxFQUEzQjtBQUNBLGtCQUFVLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxDQUFYLENBQVY7T0FITSxDQUFSO0tBSEYsQ0FEWTtHQTdGRTtBQXlHaEIsc0NBQWM7QUFDWixXQUFPO0FBQ0wsY0FBUSxJQUFSO0FBQ0EsaUJBQVcsQ0FBQyxXQUFELEVBQWMscUJBQWQsQ0FBWDtBQUNBLHFCQUFlLFVBQWY7S0FIRixDQURZO0dBekdFO0NBQVo7O2tCQW1IUyIsImZpbGUiOiJmbGF0LXdvcmxkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IChjKSAyMDE1IFViZXIgVGVjaG5vbG9naWVzLCBJbmMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuLy8gaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuLy8gdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuLy8gY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4vLyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4vLyBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4vLyBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbi8vIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuLy8gQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuLy8gTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbi8vIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbi8vIFRIRSBTT0ZUV0FSRS5cblxuLy8gQSBzdGFuZGFyZCB2aWV3cG9ydCBpbXBsZW1lbnRhdGlvblxuY29uc3QgREVGQVVMVF9GT1YgPSAxNTtcbmNvbnN0IERFRkFVTFRfU0laRSA9IDEwMDA7XG5cbmNvbnN0IGZsYXRXb3JsZCA9IHtcblxuICAvLyBXb3JsZCBzaXplXG4gIHNpemU6IERFRkFVTFRfU0laRSxcblxuICAvLyBGaWVsZCBvZiB2aWV3XG4gIGZvdjogREVGQVVMVF9GT1YsXG5cbiAgVmlld3BvcnQ6IGNsYXNzIFZpZXdwb3J0IHtcblxuICAgIC8qKlxuICAgICAqIEBjbGFzc2Rlc2NcbiAgICAgKiBDYWxjdWxhdGUge3gseSx3aXRoLGhlaWdodH0gb2YgdGhlIFdlYkdMIHZpZXdwb3J0XG4gICAgICogYmFzZWQgb24gcHJvdmlkZWQgY2FudmFzIHdpZHRoIGFuZCBoZWlnaHRcbiAgICAgKlxuICAgICAqIE5vdGU6IFRoZSB2aWV3cG9ydCB3aWxsIGJlIHNldCB0byBhIHNxdWFyZSB0aGF0IGNvdmVyc1xuICAgICAqIHRoZSBjYW52YXMsIGFuZCBhbiBvZmZzZXQgd2lsbCBiZSBhcHBsaWVkIHRvIHggb3IgeVxuICAgICAqIGFzIG5lY2Vzc2FyeSB0byBjZW50ZXIgdGhlIHdpbmRvdyBpbiB0aGUgdmlld3BvcnRcbiAgICAgKiBTbyB0aGF0IHRoZSBjYW1lcmEgd2lsbCBsb29rIGF0IHRoZSBjZW50ZXIgb2YgdGhlIGNhbnZhc1xuICAgICAqXG4gICAgICogQGNsYXNzXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGhlaWdodFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgIGNvbnN0IHhPZmZzZXQgPSB3aWR0aCA+IGhlaWdodCA/IDAgOiAod2lkdGggLSBoZWlnaHQpIC8gMjtcbiAgICAgIGNvbnN0IHlPZmZzZXQgPSBoZWlnaHQgPiB3aWR0aCA/IDAgOiAoaGVpZ2h0IC0gd2lkdGgpIC8gMjtcbiAgICAgIGNvbnN0IHNpemUgPSBNYXRoLm1heCh3aWR0aCwgaGVpZ2h0KTtcblxuICAgICAgdGhpcy54ID0geE9mZnNldDtcbiAgICAgIHRoaXMueSA9IHlPZmZzZXQ7XG4gICAgICB0aGlzLndpZHRoID0gc2l6ZTtcbiAgICAgIHRoaXMuaGVpZ2h0ID0gc2l6ZTtcbiAgICB9XG5cbiAgICBzY3JlZW5Ub1NwYWNlKHt4LCB5fSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgeDogKCh4IC0gdGhpcy54KSAvIHRoaXMud2lkdGggLSAwLjUpICogZmxhdFdvcmxkLnNpemUgKiAyLFxuICAgICAgICB5OiAoKHkgLSB0aGlzLnkpIC8gdGhpcy5oZWlnaHQgLSAwLjUpICogZmxhdFdvcmxkLnNpemUgKiAyICogLTEsXG4gICAgICAgIHo6IDBcbiAgICAgIH07XG4gICAgfVxuICB9LFxuXG4gIGdldFdvcmxkU2l6ZSgpIHtcbiAgICByZXR1cm4gZmxhdFdvcmxkLnNpemU7XG4gIH0sXG5cbiAgLy8gQ2FtZXJhIGhlaWdodCB0aGF0IHdpbGwgY292ZXIgYSBwbGFuZSBvZiBbLXNpemUsIHNpemVdXG4gIC8vIHRvIGZpdCBleGFjdGx5IHRoZSBlbnRpcmUgc2NyZWVuXG4gIC8vIENvbnNpZGVyaW5nIGZpZWxkIG9mIHZpZXcgaXMgNDUgZGVncmVlczpcbiAgLy9cbiAgLy9cbiAgLy8gICAgICAgQ2FtZXJhIEhlaWdodFxuICAvLyAgICAgL3xcbiAgLy8gICAgL358ID0+IGZvdiAvIDJcbiAgLy8gICAvICB8XG4gIC8vICAvICAgfFxuICAvLyAvICAgIHxcbiAgLy8gLS0tLS18XG4gIC8vIEhhbGYgb2YgcGxhbmUgWzAsIHNpemVdXG4gIC8vIFRoZSB1cHBlciBhbmdsZSBpcyBoYWxmIG9mIHRoZSBmaWVsZCBvZiB2aWV3IGFuZ2xlLlxuICAvLyBDYW1lcmEgaGVpZ2h0ID0gc2l6ZSAvIE1hdGgudGFuKChmb3YvMikgKiBNYXRoLlBJLzE4MCk7XG4gIC8vXG4gIGdldENhbWVyYUhlaWdodChzaXplLCBmb3YpIHtcbiAgICBzaXplID0gc2l6ZSB8fCBmbGF0V29ybGQuc2l6ZTtcbiAgICBmb3YgPSBmb3YgfHwgZmxhdFdvcmxkLmZvdjtcblxuICAgIHN3aXRjaCAoZm92KSB7XG4gICAgY2FzZSAxNTogcmV0dXJuIHNpemUgKiA3LjU5NTc1NDExMjcyNTE1MTtcbiAgICBjYXNlIDMwOiByZXR1cm4gc2l6ZSAqIDMuNzMyMDUwODA3NTY4ODc4O1xuICAgIGNhc2UgNDU6IHJldHVybiBzaXplICogMi40MTQyMTM1NjIzNzMwOTU7XG4gICAgY2FzZSA2MDogcmV0dXJuIHNpemUgKiAxLjczMjA1MDgwNzU2ODg3NztcbiAgICBkZWZhdWx0OiByZXR1cm4gc2l6ZSAvIE1hdGgudGFuKGZvdiAvIDIgKiBNYXRoLlBJIC8gMTgwKTtcbiAgICB9XG4gIH0sXG5cbiAgZ2V0Q2FtZXJhKCkge1xuICAgIGNvbnN0IGNhbWVyYUhlaWdodCA9IGZsYXRXb3JsZC5nZXRDYW1lcmFIZWlnaHQoKTtcbiAgICByZXR1cm4ge1xuICAgICAgZm92OiBmbGF0V29ybGQuZm92LFxuICAgICAgbmVhcjogKGNhbWVyYUhlaWdodCArIDEpIC8gMTAwLFxuICAgICAgZmFyOiBjYW1lcmFIZWlnaHQgKyAxLFxuICAgICAgcG9zaXRpb246IFswLCAwLCBjYW1lcmFIZWlnaHRdLFxuICAgICAgYXNwZWN0OiAxXG4gICAgfTtcbiAgfSxcblxuICBnZXRQaXhlbFJhdGlvKHJhdGlvKSB7XG4gICAgcmV0dXJuIDE7XG4gICAgLy8gcmV0dXJuIHJhdGlvIHx8IDE7XG4gIH0sXG5cbiAgZ2V0TGlnaHRpbmcoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGVuYWJsZTogdHJ1ZSxcbiAgICAgIGFtYmllbnQ6IHtyOiAxLjAsIGc6IDEuMCwgYjogMS4wfSxcbiAgICAgIHBvaW50czogW3tcbiAgICAgICAgZGlmZnVzZToge3I6IDAuOCwgZzogMC44LCBiOiAwLjh9LFxuICAgICAgICBzcGVjdWxhcjoge3I6IDAuNiwgZzogMC42LCBiOiAwLjZ9LFxuICAgICAgICBwb3NpdGlvbjogWzAuNSwgMC41LCAzXVxuICAgICAgfV1cbiAgICB9O1xuICB9LFxuXG4gIGdldEJsZW5kaW5nKCkge1xuICAgIHJldHVybiB7XG4gICAgICBlbmFibGU6IHRydWUsXG4gICAgICBibGVuZEZ1bmM6IFsnU1JDX0FMUEhBJywgJ09ORV9NSU5VU19TUkNfQUxQSEEnXSxcbiAgICAgIGJsZW5kRXF1YXRpb246ICdGVU5DX0FERCdcbiAgICB9O1xuICB9XG5cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZsYXRXb3JsZDtcbiJdfQ==