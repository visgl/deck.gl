import {createIterable} from '@deck.gl/core';

/* eslint-disable max-statements, complexity */
const RADIAN_PER_DEGREE = Math.PI / 180;
const modelMatrix = new Float32Array(16);
const linearTransform = new Float32Array(9);
const modelTranslation = new Float32Array(3);

function calculateTransformMatrix(targetMatrix, orientation, scale) {
  const pitch = orientation[0] * RADIAN_PER_DEGREE;
  const yaw = orientation[1] * RADIAN_PER_DEGREE;
  const roll = orientation[2] * RADIAN_PER_DEGREE;

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

function getMat3FromMat4(mat4) {
  mat4[0] = mat4[0];
  mat4[1] = mat4[1];
  mat4[2] = mat4[2];
  mat4[3] = mat4[4];
  mat4[4] = mat4[5];
  mat4[5] = mat4[6];
  mat4[6] = mat4[8];
  mat4[7] = mat4[9];
  mat4[8] = mat4[10];

  return mat4.subarray(0, 9);
}

function calculateModelMatrices(layer, attribute) {
  const {data, getOrientation, getScale, getTranslation, getTransformMatrix} = layer.props;

  const constantMatrix = Array.isArray(getTransformMatrix);
  const constantScale = Array.isArray(getScale);
  const constantOrientation = Array.isArray(getOrientation);
  const constantTranslation = Array.isArray(getTranslation);

  const hasMatrix = getTransformMatrix && (constantMatrix || Boolean(getTransformMatrix(data[0])));

  if (hasMatrix) {
    attribute.constant = constantMatrix;
  } else {
    attribute.constant = constantOrientation && constantScale && constantTranslation;
  }

  const instanceModelMatrixData = attribute.value;

  if (attribute.constant) {
    let matrix;

    if (hasMatrix) {
      modelMatrix.set(getTransformMatrix);
      modelTranslation[0] = modelMatrix[12];
      modelTranslation[1] = modelMatrix[13];
      modelTranslation[2] = modelMatrix[14];
      matrix = getMat3FromMat4(modelMatrix);
    } else {
      matrix = linearTransform;

      const orientation = getOrientation;
      const scale = getScale;

      calculateTransformMatrix(matrix, orientation, scale);
      modelTranslation.set(getTranslation);
    }

    const valueMatrix = new Float32Array(matrix);
    const valueTranslation = new Float32Array(modelTranslation);
    const shaderAttributes = attribute.userData.shaderAttributes;
    shaderAttributes.instanceModelMatrix__LOCATION_0.value = valueMatrix.subarray(0, 3);
    shaderAttributes.instanceModelMatrix__LOCATION_1.value = valueMatrix.subarray(3, 6);
    shaderAttributes.instanceModelMatrix__LOCATION_2.value = valueMatrix.subarray(6, 9);
    shaderAttributes.instanceTranslation.value = valueTranslation;
  } else {
    let i = 0;
    const {iterable, objectInfo} = createIterable(data);
    for (const object of iterable) {
      objectInfo.index++;
      let matrix;

      if (hasMatrix) {
        modelMatrix.set(
          constantMatrix ? getTransformMatrix : getTransformMatrix(object, objectInfo)
        );
        modelTranslation[0] = modelMatrix[12];
        modelTranslation[1] = modelMatrix[13];
        modelTranslation[2] = modelMatrix[14];
        matrix = getMat3FromMat4(modelMatrix);
      } else {
        matrix = linearTransform;

        const orientation = constantOrientation
          ? getOrientation
          : getOrientation(object, objectInfo);
        const scale = constantScale ? getScale : getScale(object, objectInfo);

        calculateTransformMatrix(matrix, orientation, scale);
        modelTranslation.set(
          constantTranslation ? getTranslation : getTranslation(object, objectInfo)
        );
      }

      instanceModelMatrixData[i++] = matrix[0];
      instanceModelMatrixData[i++] = matrix[1];
      instanceModelMatrixData[i++] = matrix[2];
      instanceModelMatrixData[i++] = matrix[3];
      instanceModelMatrixData[i++] = matrix[4];
      instanceModelMatrixData[i++] = matrix[5];
      instanceModelMatrixData[i++] = matrix[6];
      instanceModelMatrixData[i++] = matrix[7];
      instanceModelMatrixData[i++] = matrix[8];
      instanceModelMatrixData[i++] = modelTranslation[0];
      instanceModelMatrixData[i++] = modelTranslation[1];
      instanceModelMatrixData[i++] = modelTranslation[2];
    }
  }
}

export function getMatrixAttributes(layer) {
  return {
    size: 12,
    accessor: ['getOrientation', 'getScale', 'getTranslation', 'getTransformMatrix'],
    shaderAttributes: {
      instanceModelMatrix__LOCATION_0: {
        size: 3,
        stride: 48,
        offset: 0
      },
      instanceModelMatrix__LOCATION_1: {
        size: 3,
        stride: 48,
        offset: 12
      },
      instanceModelMatrix__LOCATION_2: {
        size: 3,
        stride: 48,
        offset: 24
      },
      instanceTranslation: {
        size: 3,
        stride: 48,
        offset: 36
      }
    },
    update: function updater(attribute) {
      calculateModelMatrices(layer, attribute);
    }
  };
}
