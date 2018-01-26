/* global window */
import {Matrix4} from 'math.gl';

const DEGREES_TO_RADIANS = Math.PI / 180;
const EYE_DISTANCE = 0.08;
const FOV_DEGREES_Y = 40;
const FOV_DEGREES_X_MIN = 35;
const FOV_DEGREES_X_MAX = 45;
const UP_VECTOR = [0, 1, 0];

export default class EmulatedVRDisplay {
  constructor() {
    this.depthFar = 1000;
    this.depthNear = 0.1;
    this.layers = [];
    this.isEmulated = true;

    this.leftEyeParameters = {
      offset: [-EYE_DISTANCE / 2, 0, 0],
      fieldOfView: {
        downDegrees: FOV_DEGREES_Y,
        leftDegrees: FOV_DEGREES_X_MAX,
        rightDegrees: FOV_DEGREES_X_MIN,
        upDegrees: FOV_DEGREES_Y
      }
    };
    this.rightEyeParameters = {
      offset: [EYE_DISTANCE / 2, 0, 0],
      fieldOfView: {
        downDegrees: FOV_DEGREES_Y,
        leftDegrees: FOV_DEGREES_X_MIN,
        rightDegrees: FOV_DEGREES_X_MAX,
        upDegrees: FOV_DEGREES_Y
      }
    };

    this.poseMatrix = new Matrix4();

    this._leftEyeMatrix = this._getEyeMatrix(this.leftEyeParameters);
    this._rightEyeMatrix = this._getEyeMatrix(this.rightEyeParameters);
  }

  getEyeParameters(whichEye) {
    const viewport = this._getViewportSize();

    if (whichEye === 'right') {
      return {...this.rightEyeParameters, ...viewport};
    } else {
      return {...this.leftEyeParameters, ...viewport};
    }
  }

  getFrameData(vrFrameData) {
    if (!vrFrameData) {
      throw new Error('must supply a frameData object');
    }

    vrFrameData.pose = this.pose;
    vrFrameData.timestamp = Date.now();

    const viewport = this._getViewportSize();
    const projectionMatrix = new Matrix4().perspective({
      fov: (FOV_DEGREES_X_MIN + FOV_DEGREES_X_MAX) * DEGREES_TO_RADIANS,
      aspect: viewport.renderWidth / viewport.renderHeight,
      near: this.depthNear,
      far: this.depthFar
    });

    vrFrameData.leftViewMatrix = this.poseMatrix.clone().multiplyRight(this._leftEyeMatrix);
    vrFrameData.leftProjectionMatrix = projectionMatrix
      .clone()
      .multiplyRight(vrFrameData.leftViewMatrix);

    vrFrameData.rightViewMatrix = this.poseMatrix.clone().multiplyRight(this._rightEyeMatrix);
    vrFrameData.rightProjectionMatrix = projectionMatrix
      .clone()
      .multiplyRight(vrFrameData.rightViewMatrix);

    return true;
  }

  requestPresent({source}) {
    this.layers.push(source);
    return Promise.resolve();
  }

  exitPresent() {
    this.layers.length = 0;
    return Promise.resolve();
  }

  submitFrame() {}

  _getViewportSize() {
    return {
      renderWidth: window.innerWidth / 2,
      renderHeight: window.innerHeight
    };
  }

  _getEyeMatrix({offset, fieldOfView}) {
    const matrix = new Matrix4();
    // rotate
    const gazeDir = -(fieldOfView.leftDegrees - fieldOfView.rightDegrees) * DEGREES_TO_RADIANS;
    matrix.rotateZ(gazeDir);
    // offset
    matrix.translate(offset);

    return matrix;
  }
}
