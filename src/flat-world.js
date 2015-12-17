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
      position: {x: 0, y: 0, z: cameraHeight},
      aspect: 1
    };
  },

  getPixelRatio: function getPixelRatio(ratio) {
    return ratio || 1;
  },

  getLighting: function getLighting() {
    return {
      enable: true,
      ambient: {r: 1.0, g: 1.0, b: 1.0},
      points: [{
        diffuse: {r: 0.8, g: 0.8, b: 0.8},
        specular: {r: 0.6, g: 0.6, b: 0.6},
        position: {x: 0.5, y: 0.5, z: 3}
      }]
    };
  },

  getBlending: function getBlending() {
    return {
      enable: false,
      blendFunc: ['SRC_ALPHA', 'ZERO'],
      blendEquation: 'FUNC_ADD'
    };
  },

  // projects from screen coordinates to space coordinates
  screenToSpace(x, y, width, height) {
    const vp = flatWorld.getViewport(width, height);
    // We're fixing the camera zoom to map [-size, size] to screen coords
    return {
      x: ((x - vp.x) / vp.width - 0.5) * flatWorld.size * 2,
      y: -((y - vp.y) / vp.height - 0.5) * flatWorld.size * 2,
      z: 0
    };
  }

};

export default flatWorld;
