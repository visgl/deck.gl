import {quat} from 'gl-matrix';

export function getQuaternion(quaternion) {
  return quaternion.quat ? quaternion.quat : quaternion;
}

class Quaternion {

  constructor(glquat) {
    this.quat = glquat || new quat();
  }

  // // Creates a new quat initialized with values from an existing quaternion
  // (static) clone(a) → {quat}

  // // Copy the values from one quat to another
  // (static) copy(out, a) → {quat}

  // // Creates a new identity quat
  // (static) create() → {quat}

  // // Set a quat to the identity quaternion
  // (static) identity(out) → {quat}

  toString() {
    return quat.str(this.quat);
  }

  toArray() {
    return this.quat;
  }

  toFloat32Array() {
    return this.quat;
  }

  equals(quaternion) {
    return quat.equals(this.quat, quaternion);
  }

  // Returns whether or not the quaternions have exactly the same elements in the same position (when compared with ===)
  exactEquals(quaternion) {
    return quat.exactEquals(this.quat, quaternion);
  }

  // Getters/setters
  get x() {
    return this.quat[0];
  }

  set x(value) {
    this.quat[0] = value;
    return this;
  }

  get y() {
    return this.quat[1];
  }

  set y(value) {
    this.quat[1] = value;
    return this;
  }

  get z() {
    return this.quat[2];
  }

  set z(value) {
    this.quat[2] = value;
    return this;
  }

  get w() {
    return this.quat[2];
  }

  set w(value) {
    this.quat[2] = value;
    return this;
  }

  // Alias for quat.length
  len() {
    return quat.len(this.quat);
  }

  // Calculates the length of a quat
  length() {
    return quat.length(this.quat);
  }

  // Calculates the squared length of a quat
  squaredLength(a) {
    // Number
  }

  // Alias for quat.squaredLength
  sqrLen() {
    // Number
  }

  // Sets a quaternion to represent the shortest rotation from one vector to another. Both vectors are assumed to be unit length.
  rotationTo(vectorA, vectorB) {
    quat.rotationTo(this.quat, vectorA, vectorB);
  }

  // Sets the specified quaternion with values corresponding to the given axes. Each axis is a vec3 and is expected to be unit length and perpendicular to all other specified axes.
  setAxes() {
    Number
  }

  // Performs a spherical linear interpolation with two control points
  sqlerp() {
    Number;
  }

  // // Adds two quat's
  // add(a, b) → {quat}

  // // Calculates the W component of a quat from the X, Y, and Z components. Assumes that quaternion is 1 unit in length. Any existing W component will be ignored.
  // calculateW(out, a) → {quat}

  // // Calculates the conjugate of a quat If the quaternion is normalized, this function is faster than quat.inverse and produces the same result.
  // (static) conjugate(out, a) → {quat}

  // // Calculates the dot product of two quat's
  // (static) dot(a, b) → {Number}

  // // Creates a quaternion from the given 3x3 rotation matrix. NOTE: The resultant quaternion is not normalized, so you should be sure to renormalize the quaternion yourself where necessary.
  // (static) fromMat3(out, m) → {quat}

  // // Creates a new quat initialized with the given values
  // (static) fromValues(x, y, z, w) → {quat}

  // // Gets the rotation axis and angle for a given quaternion. If a quaternion is created with setAxisAngle, this method will return the same values as providied in the original parameter list OR functionally equivalent values. Example: The quaternion formed by axis [0, 0, 1] and angle -90 is the same as the quaternion formed by [0, 0, 1] and 270. This method favors the latter.
  // (static) getAxisAngle(out_axis, q) → {Number}

  // // Calculates the inverse of a quat
  // (static) invert(out, a) → {quat}

  // // Performs a linear interpolation between two quat's
  // (static) lerp(out, a, b, t) → {quat}

  // // Alias for quat.multiply
  // (static) mul()

  // // Multiplies two quat's
  // (static) multiply(out, a, b) → {quat}

  // // Normalize a quat
  // (static) normalize(out, a) → {quat}

  // // Rotates a quaternion by the given angle about the X axis
  // (static) rotateX(out, a, rad) → {quat}

  // // Rotates a quaternion by the given angle about the Y axis
  // (static) rotateY(out, a, rad) → {quat}

  // // Rotates a quaternion by the given angle about the Z axis
  // (static) rotateZ(out, a, rad) → {quat}

  // // Scales a quat by a scalar number
  // (static) scale(out, a, b) → {quat}

  // // Set the components of a quat to the given values
  // (static) set(out, x, y, z, w) → {quat}

  // // Sets a quat from the given angle and rotation axis, then returns it.
  // (static) setAxisAngle(out, axis, rad) → {quat}

  // // Performs a spherical linear interpolation between two quat
  // (static) slerp(out, a, b, t) → {quat}
}
