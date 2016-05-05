import {vec3} from 'gl-matrix';

export function getVector(vec) {
  return vec.glvec ? vec.glvec : vec;
}

export default class Vector3 {
  // Creates a new, empty vec3
  constructor(glvec3) {
    this.glvec3 = glvec3 || vec3.create();
  }

  set(x, y, z) {
    vec3.set(this.glvec3, x, y, z);
    return this;
  }

  copy(vector) {
    vec3.copy(this.glvec3, getVector(vector));
    return this;
  }

  clone() {
    return new Vector3(vec3.clone(this.glvec3));
  }

  toString() {
    return vec3.str(this.glvec3);
  }

  toArray() {
    return this.glvec;
  }

  toFloat32Array() {
    return this.glvec;
  }

  equals(vector) {
    return vec3.equals(getVector(vector));
  }

  exactEquals(vector) {
    return vec3.exactEquals(getVector(vector));
  }

  // Getters/setters
  get x() {
    return this.glvec[0];
  }

  set x(value) {
    this.glvec[0] = value;
    return this;
  }

  get y() {
    return this.glvec[1];
  }

  set y(value) {
    this.glvec[1] = value;
    return this;
  }

  get z() {
    return this.glvec[2];
  }

  set z(value) {
    this.glvec[2] = value;
    return this;
  }

  distance(vector) {
    return vec3.distance(getVector(vector));
  }

  dist(vector) {
    return vec3.dist(getVector(vector));
  }

  angle(vector) {
    return vec3.angle(getVector(vector));
  }

  add(...vectors) {
    for (const vector of vectors) {
      vec3.add(this.glvec3, getVector(vector));
    }
    return this;
  }

  subtract(...vectors) {
    for (const vector of vectors) {
      vec3.subtract(this.glvec3, getVector(vector));
    }
    return this;
  }

  sub(...vectors) {
    return this.subtract(vectors);
  }

  multiply(...vectors) {
    for (const vector of vectors) {
      vec3.multiply(this.glvec3, getVector(vector));
    }
    return this;
  }

  divide(...vectors) {
    for (const vector of vectors) {
      vec3.divide(this.glvec3, getVector(vector));
    }
    return this;
  }

  ceil() {
    vec3.ceil(this.glvec3, this.glvec3);
    return this;
  }

  floor() {
    vec3.floor(this.glvec3, this.glvec3);
    return this;
  }

  min() {
    vec3.min(this.glvec3, this.glvec3);
    return this;
  }

  max() {
    vec3.max(this.glvec3, this.glvec3);
    return this;
  }

  scale(scale) {
    vec3.scale(this.glvec3, this.glvec3, scale);
    return this;
  }

  scaleAndAdd(vector, scale) {
    vec3.scaleAndAdd(this.glvec3, this.glvec3, getVector(vector), scale);
    return this;
  }

  negate() {
    vec3.negate(this.glvec3, this.glvec3);
    return this;
  }

  inverse() {
    vec3.inverse(this.glvec3, this.glvec3);
    return this;
  }

  normalize() {
    vec3.normalize(this.glvec3, this.glvec3);
    return this;
  }

  dot(scale) {
    vec3.dot(this.glvec3, this.glvec3, scale);
    return this;
  }

  cross(scale) {
    vec3.cross(this.glvec3, this.glvec3, scale);
    return this;
  }

  lerp(scale) {
    vec3.lerp(this.glvec3, this.glvec3, scale);
    return this;
  }

  hermite(scale) {
    vec3.hermite(this.glvec3, this.glvec3, scale);
    return this;
  }

  bezier(scale) {
    vec3.bezier(this.glvec3, this.glvec3, scale);
    return this;
  }

  random(scale) {
    vec3.cross(this.glvec3, this.glvec3, scale);
    return this;
  }

  rotateX(origin, angle) {
    vec3.rotateX(this.glvec3, this.glvec3, getVector(origin), angle);
  }

  rotateY(origin, angle) {
    vec3.rotateY(this.glvec3, this.glvec3, getVector(origin), angle);
  }

  rotateZ(origin, angle) {
    vec3.rotateZ(this.glvec3, this.glvec3, getVector(origin), angle);
  }

}
