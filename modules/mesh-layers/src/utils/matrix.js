import {Matrix4} from 'math.gl';

const RADIAN_PER_DEGREE = Math.PI / 180;

function updateRotationMatrix(targetMatrix, roll, pitch, yaw) {
  const sr = Math.sin(roll);
  const sp = Math.sin(pitch);
  const sw = Math.sin(yaw);

  const cr = Math.cos(roll);
  const cp = Math.cos(pitch);
  const cw = Math.cos(yaw);

  targetMatrix[0] = cw * cp; // 0,0
  targetMatrix[1] = sw * cp; // 1,0
  targetMatrix[2] = -sp; // 2,0
  targetMatrix[3] = 0;
  targetMatrix[4] = -sw * cr + cw * sp * sr; // 0,1
  targetMatrix[5] = cw * cr + sw * sp * sr; // 1,1
  targetMatrix[6] = cp * sr; // 2,1
  targetMatrix[7] = 0;
  targetMatrix[8] = sw * sr + cw * sp * cr; // 0,2
  targetMatrix[9] = -cw * sr + sw * sp * cr; // 1,2
  targetMatrix[10] = cp * cr; // 2,2
  targetMatrix[11] = 0;
  targetMatrix[12] = 0;
  targetMatrix[13] = 0;
  targetMatrix[14] = 0;
  targetMatrix[15] = 1;
}

function makeMatrix({
  object,
  getYaw,
  getPitch,
  getRoll,
  getScale,
  getTranslation,
  rotationMatrix,
  modelMatrix
}) {
  const roll = getRoll(object) * RADIAN_PER_DEGREE;
  const pitch = getPitch(object) * RADIAN_PER_DEGREE;
  const yaw = getYaw(object) * RADIAN_PER_DEGREE;
  const scale = getScale(object);
  const translate = getTranslation(object);

  updateRotationMatrix(rotationMatrix, roll, pitch, yaw);

  modelMatrix
    .identity()
    .translate(translate)
    .multiplyRight(rotationMatrix)
    .scale(scale);

  return modelMatrix;
}

function calculateModelMatrices(attribute) {
  // eslint-disable-next-line no-invalid-this
  const {data, getYaw, getPitch, getRoll, getScale, getTranslation, getMatrix} = this.props;

  const instanceModelMatrixData = attribute.value;

  const rotationMatrix = new Float32Array(16);
  const modelMatrix = new Matrix4();

  let i = 0;
  for (const object of data) {
    const matrix =
      getMatrix(object) ||
      makeMatrix({
        object,
        getYaw,
        getPitch,
        getRoll,
        getScale,
        getTranslation,
        rotationMatrix,
        modelMatrix
      });

    instanceModelMatrixData[i++] = matrix[0];
    instanceModelMatrixData[i++] = matrix[1];
    instanceModelMatrixData[i++] = matrix[2];
    instanceModelMatrixData[i++] = matrix[3];
    instanceModelMatrixData[i++] = matrix[4];
    instanceModelMatrixData[i++] = matrix[5];
    instanceModelMatrixData[i++] = matrix[6];
    instanceModelMatrixData[i++] = matrix[7];
    instanceModelMatrixData[i++] = matrix[8];
    instanceModelMatrixData[i++] = matrix[9];
    instanceModelMatrixData[i++] = matrix[10];
    instanceModelMatrixData[i++] = matrix[11];
    instanceModelMatrixData[i++] = matrix[12];
    instanceModelMatrixData[i++] = matrix[13];
    instanceModelMatrixData[i++] = matrix[14];
    instanceModelMatrixData[i++] = matrix[15];
  }
}

export const MATRIX_SHADER_ATTRIBUTES = {
  size: 16,
  accessor: ['getYaw', 'getPitch', 'getRoll', 'getScale', 'getTranslation', 'getMatrix'],
  shaderAttributes: {
    instanceModelMatrix__LOCATION_0: {
      size: 4,
      stride: 64,
      offset: 0
    },
    instanceModelMatrix__LOCATION_1: {
      size: 4,
      stride: 64,
      offset: 16
    },
    instanceModelMatrix__LOCATION_2: {
      size: 4,
      stride: 64,
      offset: 32
    },
    instanceModelMatrix__LOCATION_3: {
      size: 4,
      stride: 64,
      offset: 48
    }
  },
  update: calculateModelMatrices
};
