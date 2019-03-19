/* eslint-disable no-invalid-this, max-statements */
const RADIAN_PER_DEGREE = Math.PI / 180;
const modelMatrix = new Float32Array(9);
const DUMMY_OBJECT = {};

function updateTransformMatrix(targetMatrix, roll, pitch, yaw, scale) {
  const sr = Math.sin(roll);
  const sp = Math.sin(pitch);
  const sw = Math.sin(yaw);

  const cr = Math.cos(roll);
  const cp = Math.cos(pitch);
  const cw = Math.cos(yaw);

  const scx = scale[0];
  const scy = scale[1];
  const scz = scale[2];

  targetMatrix[0] = scx * cw * cp; // 0,0
  targetMatrix[1] = scx * sw * cp; // 1,0
  targetMatrix[2] = scx * -sp; // 2,0
  targetMatrix[3] = scy * (-sw * cr + cw * sp * sr); // 0,1
  targetMatrix[4] = scy * (cw * cr + sw * sp * sr); // 1,1
  targetMatrix[5] = scy * cp * sr; // 2,1
  targetMatrix[6] = scz * (sw * sr + cw * sp * cr); // 0,2
  targetMatrix[7] = scz * (-cw * sr + sw * sp * cr); // 1,2
  targetMatrix[8] = scz * cp * cr; // 2,2
}

function calculateModelMatrices(attribute) {
  let {data, getOrientation, getScale, getTransformMatrix} = this.props;

  const constantMatrix = Array.isArray(getTransformMatrix);
  const constantScale = Array.isArray(getScale);
  const constantOrientation = Array.isArray(getOrientation);

  const hasMatrix = constantMatrix || Boolean(getTransformMatrix(DUMMY_OBJECT));

  if (hasMatrix) {
    attribute.constant = constantMatrix;
  } else {
    attribute.constant = constantOrientation && constantScale;
  }

  if (attribute.constant) {
    data = data.slice(0, 1);
  }

  if (constantMatrix) {
    const matrixValue = getTransformMatrix;
    getTransformMatrix = () => matrixValue;
  }
  if (constantScale) {
    const scaleValue = getScale;
    getScale = () => scaleValue;
  }

  if (constantOrientation) {
    const orientationValue = getOrientation;
    getOrientation = () => orientationValue;
  }

  const instanceModelMatrixData = attribute.value;

  let i = 0;
  for (const object of data) {
    let matrix;

    if (hasMatrix) {
      matrix = getTransformMatrix(object);
    } else {
      matrix = modelMatrix;

      const orientation = getOrientation(object);
      const pitch = orientation[0] * RADIAN_PER_DEGREE;
      const yaw = orientation[1] * RADIAN_PER_DEGREE;
      const roll = orientation[2] * RADIAN_PER_DEGREE;
      const scale = getScale(object);

      updateTransformMatrix(matrix, roll, pitch, yaw, scale);
    }

    if (attribute.constant) {
      attribute.userData.shaderAttributes.instanceModelMatrix__LOCATION_0.value = matrix.slice(
        0,
        3
      );
      attribute.userData.shaderAttributes.instanceModelMatrix__LOCATION_1.value = matrix.slice(
        3,
        6
      );
      attribute.userData.shaderAttributes.instanceModelMatrix__LOCATION_2.value = matrix.slice(
        6,
        9
      );
    } else {
      instanceModelMatrixData[i++] = matrix[0];
      instanceModelMatrixData[i++] = matrix[1];
      instanceModelMatrixData[i++] = matrix[2];
      instanceModelMatrixData[i++] = matrix[3];
      instanceModelMatrixData[i++] = matrix[4];
      instanceModelMatrixData[i++] = matrix[5];
      instanceModelMatrixData[i++] = matrix[6];
      instanceModelMatrixData[i++] = matrix[7];
      instanceModelMatrixData[i++] = matrix[8];
    }
  }
}

export const MATRIX_SHADER_ATTRIBUTES = {
  size: 9,
  accessor: ['getYaw', 'getPitch', 'getRoll', 'getScale', 'getTransformMatrix'],
  shaderAttributes: {
    instanceModelMatrix__LOCATION_0: {
      size: 3,
      stride: 36,
      offset: 0
    },
    instanceModelMatrix__LOCATION_1: {
      size: 3,
      stride: 36,
      offset: 12
    },
    instanceModelMatrix__LOCATION_2: {
      size: 3,
      stride: 36,
      offset: 24
    }
  },
  update: calculateModelMatrices
};
