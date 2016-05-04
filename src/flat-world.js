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

import {PerspectiveCamera, Camera, Mat4} from 'luma.gl';
import assert from 'assert';

// A standard viewport implementation
const DEFAULT_FOV = 15;
const DEFAULT_SIZE = 1000;

const flatWorld = {

  // World size
  size: DEFAULT_SIZE,

  // Field of view
  fov: DEFAULT_FOV,

  getPixelRatio(ratio) {
    return 1;
    // return ratio || 1;
  },

  getLighting() {
    return {
      enable: true,
      ambient: {r: 1.0, g: 1.0, b: 1.0},
      points: [{
        diffuse: {r: 0.8, g: 0.8, b: 0.8},
        specular: {r: 0.6, g: 0.6, b: 0.6},
        position: [0.5, 0.5, 3]
      }]
    };
  },

  getBlending() {
    return {
      enable: true,
      blendFunc: ['SRC_ALPHA', 'ONE_MINUS_SRC_ALPHA'],
      blendEquation: 'FUNC_ADD'
    };
  },

  Viewport: class Viewport {

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
    constructor(width, height) {
      const xOffset = width > height ? 0 : (width - height) / 2;
      const yOffset = height > width ? 0 : (height - width) / 2;
      const size = Math.max(width, height);

      this.x = xOffset;
      this.y = yOffset;
      this.width = size;
      this.height = size;
      this.size = Math.max(width, height);
    }

    screenToSpace({x, y}) {
      return {
        x: ((x - this.x) / this.width - 0.5) * flatWorld.size * 2,
        y: ((y - this.y) / this.height - 0.5) * flatWorld.size * 2 * -1,
        z: 0
      };
    }

    // spaceToScreen({x, y}) {
    //   return {
    //     x:
    //     x:
    //   }
    // }
  },

  WebMercatorCamera: class extends Camera {
    constructor({projectionMatrix, ...opts}) {
      super(opts);
      this.projection = projectionMatrix;
      this.update();
    }
    update() {
      this.view.lookAt(this.position, this.target, this.up);
      this._updateUniforms();
    }
  },

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

  getCamera2({projectionMatrix}) {
    assert(projectionMatrix, 'Needs projection matrix');
    const cameraHeight = flatWorld.getCameraHeight();
    return new flatWorld.WebMercatorCamera({
      projectionMatrix,
      fov: flatWorld.fov,
      near: (cameraHeight + 1) / 100,
      far: cameraHeight + 1,
      position: [0, 0, cameraHeight],
      aspect: 1
    });
  },

  getCamera({
    projectionMatrix,
    pitch = 0, bearing = 0, altitude = 1.5,
    width, height
  }) {
    const fov = 2 * Math.atan((height / 2) / altitude);
    const cameraHeight = flatWorld.getCameraHeight(flatWorld.size, fov);
    const camHeight = cameraHeight * Math.cos(pitch / 180 * Math.PI);
    const camDist = cameraHeight * Math.tan(pitch / 180 * Math.PI) /
      Math.cos(pitch / 180 * Math.PI);
    const camera = new PerspectiveCamera({
      fov,
      near: (cameraHeight + 1) / 100,
      far: 10 * cameraHeight + 1,
      position: [0, -camDist, camHeight],
      target: [0, 0, 0],
      aspect: 1
    });
    // camera.projection.$translate(0, 0, cameraHeight);
    // camera.projection.$scale(1, -1, 1 / height);
    // camera.projection.$rotateXYZ(pitch / 180 * Math.PI, 0, 0);
    camera.projection.$rotateXYZ(0, 0, bearing / 180 * Math.PI);
    camera.projection.$translate(0, 0, 0);

    camera._updateUniforms();
    return camera;
  }
};

import {mat4} from 'gl-matrix';

export function getProjectionMatrix({
  width, height,
  latitude, longitude,
  pitch = 0, bearing = 0, altitude = 1.5
}) {
  const m = new Float32Array(16);

  // Find the distance from the center point to the center top in
  // altitude units using law of sines.
  const halfFov = Math.atan(0.5 / altitude);
  const topHalfSurfaceDistance =
    Math.sin(halfFov) * altitude / Math.sin(Math.PI / 2 - pitch - halfFov);

  // Calculate z value of the farthest fragment that should be rendered.
  const farZ =
    Math.cos(Math.PI / 2 - pitch) * topHalfSurfaceDistance + altitude;

  mat4.perspective(
    m,
    2 * Math.atan((height / 2) / altitude),
    width / height,
    0.1,
    farZ
  );

  mat4.translate(m, m, [0, 0, -altitude]);

  // After the rotateX, z values are in pixel units. Convert them to
  // altitude units. 1 altitude unit = the screen height.
  mat4.scale(m, m, [1, -1, 1 / height]);

  mat4.rotateX(m, m, pitch);
  mat4.rotateZ(m, m, bearing);
  mat4.translate(m, m, [-x, -y, 0]);

  return m;
}

export default flatWorld;
