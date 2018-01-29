/* global window */
import {Matrix4} from 'math.gl';
import {perspectiveFromFieldOfView, fromRotationTranslation} from 'gl-mat4';

const DEGREES_TO_RADIANS = Math.PI / 180;
const EYE_DISTANCE = 0.03;
const FOV_DEGREES_Y = 40;
const FOV_DEGREES_X_MIN = 40;
const FOV_DEGREES_X_MAX = 40;
const DEFAULT_ORIENTATION = [0, 0, 0, 1];
const DEFAULT_POSITION = [0, 0, 0];

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
  }

  getEyeParameters(whichEye) {
    const viewport = this._getViewportSize();

    if (whichEye === 'right') {
      return {...this.rightEyeParameters, ...viewport};
    }
    return {...this.leftEyeParameters, ...viewport};
  }

  getFrameData(vrFrameData) {
    if (!vrFrameData) {
      throw new Error('must supply a frameData object');
    }

    const timestamp = Date.now();

    const leftProjectionMatrix = new Matrix4();
    const rightProjectionMatrix = new Matrix4();
    const leftViewMatrix = new Matrix4();
    const rightViewMatrix = new Matrix4();

    perspectiveFromFieldOfView(
      leftProjectionMatrix,
      this.leftEyeParameters.fieldOfView,
      this.depthNear,
      this.depthFar
    );
    perspectiveFromFieldOfView(
      rightProjectionMatrix,
      this.rightEyeParameters.fieldOfView,
      this.depthNear,
      this.depthFar
    );

    leftViewMatrix.translate(this.leftEyeParameters.offset);
    rightViewMatrix.translate(this.rightEyeParameters.offset);

    leftViewMatrix.invert();
    rightViewMatrix.invert();

    Object.assign(vrFrameData, {
      timestamp,
      leftProjectionMatrix,
      rightProjectionMatrix,
      leftViewMatrix,
      rightViewMatrix
    });

    return true;
  }

  getFrameDataFromPose(vrFrameData, pose) {
    if (!vrFrameData) {
      throw new Error('must supply a frameData object');
    }

    if (!pose) {
      throw new Error('must supply a pose object');
    }

    const timestamp = pose.timestamp || Date.now();

    const leftProjectionMatrix = new Matrix4();
    const rightProjectionMatrix = new Matrix4();
    const leftViewMatrix = new Matrix4();
    const rightViewMatrix = new Matrix4();

    perspectiveFromFieldOfView(
      leftProjectionMatrix,
      this.leftEyeParameters.fieldOfView,
      this.depthNear,
      this.depthFar
    );
    perspectiveFromFieldOfView(
      rightProjectionMatrix,
      this.rightEyeParameters.fieldOfView,
      this.depthNear,
      this.depthFar
    );

    const orientation = pose.orientation || DEFAULT_ORIENTATION;
    const position = pose.position || DEFAULT_POSITION;

    fromRotationTranslation(leftViewMatrix, orientation, position);
    fromRotationTranslation(rightViewMatrix, orientation, position);

    leftViewMatrix.translate(this.leftEyeParameters.offset);
    rightViewMatrix.translate(this.rightEyeParameters.offset);

    leftViewMatrix.invert();
    rightViewMatrix.invert();

    Object.assign(vrFrameData, {
      pose,
      timestamp,
      leftProjectionMatrix,
      rightProjectionMatrix,
      leftViewMatrix,
      rightViewMatrix
    });

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
