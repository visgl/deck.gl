import {mat4, vec3} from 'gl-matrix';
// import {getVector} from './vector3';

function getVector() {
  throw new Error('not implemented');
}

export function getMatrix(mat) {
  return mat.glmat ? mat.glmat : mat;
}

export default class Matrix4 {

  constructor(array = null) {
    this.array = array || mat4.create();
    Object.seal(this);
  }

  set(
    n11, n12, n13, n14,
    n21, n22, n23, n24,
    n31, n32, n33, n34,
    n41, n42, n43, n44
  ) {
    mat4.set(
      this.array,
      n11, n12, n13, n14,
      n21, n22, n23, n24,
      n31, n32, n33, n34,
      n41, n42, n43, n44
    );
    return this;
  }

  copy(mat) {
    mat4.copy(this.array, mat.array);
    return this;
  }

  clone() {
    return new Matrix4().copy(this);
  }

  // Constructors

  identity() {
    mat4.identity(this.array);
    return this;
  }

  frustum({left, right, bottom, top, near, far}) {
    mat4.frustum(this.array, left, right, bottom, top, near, far);
    return this;
  }

  // Accessors

  determinant() {
    return mat4.determinant(this.array);
  }

  getRotation() {
  }

  // Modifiers

  transpose() {
    mat4.transpose(this.array, this.array);
    return this;
  }

  invert() {
    mat4.invert(this.array, this.array);
    return this;
  }

  adjoint() {
    mat4.adjoint(this.array, this.array);
    return this;
  }

  // static multiply(...matrices) {
  //   const result = new Mat4();
  //   for (const mat of matrices) {
  //     return mat4.multiply(result.array, mat.array);
  //   }
  //   return result;
  // }

  translate(vec) {
    const glvec = getVector(vec);
    mat4.adjoint(this.array, glvec);
    return this;
  }

  transform(vector) {
    const glvec = getVector(vector);
    vec3.transformMat4(glvec, glvec, this.glmat);
  }
}
