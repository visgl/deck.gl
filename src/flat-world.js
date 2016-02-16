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
const DEFAULT_FOV = 15;
const DEFAULT_SIZE = 1000;

const flatWorld = module.exports = {

  // World size
  size: DEFAULT_SIZE,

  // Field of view
  fov: DEFAULT_FOV,

  getWorldSize() {
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
  getCameraHeight(size, fov) {
    size = size || flatWorld.size;
    fov = fov || flatWorld.fov;

    switch (fov) {
    case 15: return size * 7.595754112725151;
    case 30: return size * 3.732050807568878;
    case 45: return size * 2.414213562373095;
    case 60: return size * 1.732050807568877;
    default: return size / Math.tan(fov / 2 * Math.PI / 180);
    }
  },

  /**
   * Calculate {x,y,with,height} of the WebGL viewport
   * based on provided canvas width and height
   *
   * Note: The viewport will be set to a square that covers
   * the canvas, and an offset will be applied to x or y
   * as necessary to center the window in the viewport
   * So that the camera will look at the center of the canvas
   *
   * @param {number} width
   * @param {number} height
   * @returns {object}  x,y,width,height
   */
  getViewport(width, height) {
    const xOffset = width > height ? 0 : (width - height) / 2;
    const yOffset = height > width ? 0 : (height - width) / 2;
    const size = Math.max(width, height);

    return {
      x: xOffset,
      y: yOffset,
      width: size,
      height: size
    };
  },

  getCamera() {
    const cameraHeight = flatWorld.getCameraHeight();
    return {
      fov: flatWorld.fov,
      near: (cameraHeight + 1) / 100,
      far: cameraHeight + 1,
      position: [0,0,cameraHeight],
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
      ambient: {r: 1.0, g: 1.0, b: 1.0},
      points: [{
        diffuse: {r: 0.8, g: 0.8, b: 0.8},
        specular: {r: 0.6, g: 0.6, b: 0.6},
        position: [0.5,0.5,3]
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

export default flatWorld;
