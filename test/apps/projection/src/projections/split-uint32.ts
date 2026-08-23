import {type BufferLayout, type VertexFormat} from '@luma.gl/core';
import {BufferTransform, Computation} from '@luma.gl/engine';
import {
  getGPUDataEvaluator,
  GPUDataEvaluator,
  Operation,
  type GPUDataEvaluatorInput,
  type OperationHandler
} from '@luma.gl/gpgpu';
import {
  INVALID_QUANTIZED_COORDINATE,
  PROJECTION_WORKGROUP_SIZE,
  QUANTIZED_SEA_LEVEL
} from './projection-constants';

const FLOAT32_SIGNIFICAND_BITS = 24;
const FLOAT32_TRAILING_BITS = FLOAT32_SIGNIFICAND_BITS - 1;
const MAX_EXACT_FLOAT32_UINT = 2 ** FLOAT32_SIGNIFICAND_BITS;
const ZOOM_0_WORLD_SCALE = 2 ** -23;
const UINT32_MAX_FLOAT32_HIGH = 513;
const UINT32_MAX_FLOAT32_LOW = -1;

type SplitUint32OperationInputs = {
  values: GPUDataEvaluator;
};

type SplitUint32OutputFormat = 'float32x2' | 'float32x3' | 'float32x4';

class SplitUint32Operation extends Operation<SplitUint32OperationInputs> {
  name = 'splitUint32';

  output: GPUDataEvaluator;

  constructor(values: GPUDataEvaluator) {
    super({values});

    if (values.type !== 'uint32') {
      throw new Error('splitUint32 input must have uint32 values');
    }

    const outputSize = values.size * 2;
    this.output = new GPUDataEvaluator({
      id: 'splitUint32',
      isConstant: values.isConstant,
      type: 'float32',
      size: outputSize,
      length: values.length,
      format: getSplitUint32OutputFormat(outputSize),
      source: this
    });
  }

  toString(): string {
    return `splitUint32(${this.inputs.values})`;
  }
}

export function splitUint32(values: GPUDataEvaluatorInput): GPUDataEvaluator {
  return new SplitUint32Operation(getGPUDataEvaluator(values)).output;
}

export const executeCPUSplitUint32: OperationHandler<SplitUint32OperationInputs> = async ({
  inputs,
  output,
  target
}) => {
  const {values} = inputs;
  const sourceInputValues = values.value;
  const inputValues = sourceInputValues ?? (await values.readValue());
  const outputValues = new Float32Array(output.length * output.size);
  const inputOffset = sourceInputValues ? values.offset / values.ValueType.BYTES_PER_ELEMENT : 0;
  const inputStride = sourceInputValues
    ? values.stride / values.ValueType.BYTES_PER_ELEMENT
    : values.size;

  for (let rowIndex = 0; rowIndex < output.length; rowIndex++) {
    const inputRowIndex = values.isConstant ? 0 : rowIndex;
    const inputRowOffset = inputOffset + inputRowIndex * inputStride;
    writeSplitUint32Row(outputValues, rowIndex, inputValues, inputRowOffset, values.size);
  }

  target.write(outputValues);
  return {success: true, value: outputValues};
};

export const executeWebGLSplitUint32: OperationHandler<SplitUint32OperationInputs> = ({
  inputs,
  output,
  target
}) => {
  const {values} = inputs;
  const transform = new BufferTransform(target.device, {
    vs: getWebGLSplitUint32Source(values.size, output.size),
    bufferLayout: [getWebGLValuesBufferLayout(values)],
    vertexCount: 1,
    instanceCount: output.length,
    feedbackBufferMode: 'interleaved',
    outputs: getWebGLOutputNames(output.size)
  });

  try {
    const outputName = getWebGLOutputNames(output.size)[0];
    transform.run({
      inputBuffers: {values: values.buffer},
      outputBuffers: {[outputName]: target}
    });
    return Promise.resolve({success: true});
  } finally {
    transform.destroy();
  }
};

export const executeWebGPUSplitUint32: OperationHandler<SplitUint32OperationInputs> = ({
  inputs,
  output,
  target
}) => {
  const {values} = inputs;
  const computation = new Computation(target.device, {
    source: getWebGPUSplitUint32Source(values, output),
    shaderLayout: {
      bindings: [
        {name: 'values', type: 'storage' as const, group: 0, location: 0},
        {name: 'result', type: 'storage' as const, group: 0, location: 1}
      ]
    }
  });

  computation.setBindings({
    values: values.buffer,
    result: target
  });

  const computePass = target.device.beginComputePass({});
  computation.dispatch(computePass, Math.ceil(output.length / PROJECTION_WORKGROUP_SIZE));
  computePass.end();
  target.device.submit();
  computation.destroy();

  return Promise.resolve({success: true});
};

function writeSplitUint32Row(
  outputValues: Float32Array,
  rowIndex: number,
  inputValues: ArrayLike<number>,
  inputRowOffset: number,
  inputSize: number
): void {
  const outputOffset = rowIndex * inputSize * 2;
  if (isInvalidUint32Row(inputValues, inputRowOffset, inputSize)) {
    writeInvalidSplitUint32Row(outputValues, outputOffset, inputSize);
    return;
  }

  for (let index = 0; index < inputSize; index++) {
    const value = Number(inputValues[inputRowOffset + index]);
    const [high, low] =
      index === 2 ? splitZUint32ToFloat32Pair(value) : splitUint32ToFloat32Pair(value);
    outputValues[outputOffset + index] = high;
    outputValues[outputOffset + inputSize + index] = low;
  }
}

function isInvalidUint32Row(
  inputValues: ArrayLike<number>,
  inputRowOffset: number,
  inputSize: number
): boolean {
  for (let index = 0; index < inputSize; index++) {
    if (Number(inputValues[inputRowOffset + index]) !== INVALID_QUANTIZED_COORDINATE) {
      return false;
    }
  }
  return true;
}

function writeInvalidSplitUint32Row(
  outputValues: Float32Array,
  outputOffset: number,
  inputSize: number
): void {
  for (let index = 0; index < inputSize; index++) {
    outputValues[outputOffset + index] = UINT32_MAX_FLOAT32_HIGH;
    outputValues[outputOffset + inputSize + index] = UINT32_MAX_FLOAT32_LOW;
  }
}

function splitUint32ToFloat32Pair(value: number): [number, number] {
  const high = Math.fround(value);
  const low = Math.fround(value - high);
  return [Math.fround(high * ZOOM_0_WORLD_SCALE), Math.fround(low * ZOOM_0_WORLD_SCALE)];
}

function splitZUint32ToFloat32Pair(value: number): [number, number] {
  return splitSignedNumberToFloat32Pair(value - QUANTIZED_SEA_LEVEL);
}

function splitSignedNumberToFloat32Pair(value: number): [number, number] {
  const high = Math.fround(value);
  const low = Math.fround(value - high);
  return [Math.fround(high * ZOOM_0_WORLD_SCALE), Math.fround(low * ZOOM_0_WORLD_SCALE)];
}

function getSplitUint32OutputFormat(outputSize: number): SplitUint32OutputFormat | undefined {
  switch (outputSize) {
    case 2:
      return 'float32x2';
    case 3:
      return 'float32x3';
    case 4:
      return 'float32x4';
    default:
      return undefined;
  }
}

function getWebGLValuesBufferLayout(values: GPUDataEvaluator): BufferLayout {
  return {
    name: 'values',
    stepMode: values.isConstant ? 'vertex' : 'instance',
    byteStride: values.stride,
    attributes: Array.from({length: Math.ceil(values.size / 4)}, (_, attributeIndex) => {
      const laneIndex = attributeIndex * 4;
      const laneCount = Math.min(values.size - laneIndex, 4);
      return {
        attribute: `values_${laneIndex}`,
        format: getUint32VertexFormat(laneCount),
        byteOffset: values.offset + laneIndex * values.ValueType.BYTES_PER_ELEMENT
      };
    })
  };
}

function getUint32VertexFormat(size: number): VertexFormat {
  return (size === 1 ? 'uint32' : `uint32x${size}`) as VertexFormat;
}

function getWebGLSplitUint32Source(inputSize: number, outputSize: number): string {
  return /* glsl */ `\
#version 300 es

precision highp float;
precision highp int;

${getWebGLInputDeclarations(inputSize)}
${getWebGLOutputDeclarations(outputSize)}

const uint FLOAT32_TRAILING_BITS = ${FLOAT32_TRAILING_BITS}u;
const uint MAX_EXACT_FLOAT32_UINT = ${MAX_EXACT_FLOAT32_UINT}u;
const uint QUANTIZED_SEA_LEVEL = ${QUANTIZED_SEA_LEVEL}u;
const float ZOOM_0_WORLD_SCALE = ${ZOOM_0_WORLD_SCALE};

// f32 has 24 significant bits including the hidden leading bit. Keep the closest f32
// value in the high part and the signed residual in the low part.
uint findMostSignificantBit(uint value) {
  uint bit = 0u;
  uint remaining = value;
  for (int index = 0; index < 32; index++) {
    if (remaining <= 1u) {
      break;
    }
    remaining = remaining >> 1u;
    bit = bit + 1u;
  }
  return bit;
}

vec2 splitUint32Value(uint value) {
  if (value <= MAX_EXACT_FLOAT32_UINT) {
    return vec2(float(value) * ZOOM_0_WORLD_SCALE, 0.0);
  }

  uint exponent = findMostSignificantBit(value);
  uint shift = exponent - FLOAT32_TRAILING_BITS;
  uint step = 1u << shift;
  uint mask = step - 1u;
  uint truncated = value & ~mask;
  uint remainder = value & mask;
  uint halfStep = step >> 1u;
  bool roundUp = remainder > halfStep || (remainder == halfStep && (truncated & step) != 0u);

  if (roundUp && truncated > 0xffffffffu - step) {
    return vec2(
      4294967296.0 * ZOOM_0_WORLD_SCALE,
      -float(0xffffffffu - value + 1u) * ZOOM_0_WORLD_SCALE
    );
  }

  uint rounded = truncated + (roundUp ? step : 0u);
  float high = float(rounded);
  float low = value >= rounded ? float(value - rounded) : -float(rounded - value);
  return vec2(high * ZOOM_0_WORLD_SCALE, low * ZOOM_0_WORLD_SCALE);
}

vec2 splitZUint32Value(uint value) {
  if (value >= QUANTIZED_SEA_LEVEL) {
    return splitUint32Value(value - QUANTIZED_SEA_LEVEL);
  }
  return -splitUint32Value(QUANTIZED_SEA_LEVEL - value);
}

void main() {
  float result[${outputSize}];
${getWebGLSplitStatements(inputSize)}
${getWebGLOutputAssignments(outputSize)}
}
`;
}

function getWebGLInputDeclarations(inputSize: number): string {
  return getWebGLChunkOffsets(inputSize)
    .map(offset => {
      const chunkSize = getWebGLChunkSize(inputSize, offset);
      return `in ${getWebGLUintType(chunkSize)} values_${offset};`;
    })
    .join('\n');
}

function getWebGLOutputDeclarations(outputSize: number): string {
  return getWebGLChunkOffsets(outputSize)
    .map(offset => {
      const chunkSize = getWebGLChunkSize(outputSize, offset);
      return `out ${getWebGLFloatType(chunkSize)} splitValues_${offset};`;
    })
    .join('\n');
}

function getWebGLSplitStatements(inputSize: number): string {
  const splitStatements = Array.from({length: inputSize}, (_, index) => {
    const accessor = getWebGLInputAccessor(inputSize, index);
    return `    vec2 splitValue_${index} = ${index === 2 ? 'splitZUint32Value' : 'splitUint32Value'}(${accessor});
    result[${index}] = splitValue_${index}.x;
    result[${inputSize + index}] = splitValue_${index}.y;`;
  }).join('\n');

  return `  bool isInvalidRow = ${getWebGLInvalidRowExpression(inputSize)};
  if (isInvalidRow) {
${getWebGLInvalidRowAssignments(inputSize)}
  } else {
${splitStatements}
  }`;
}

function getWebGLInvalidRowExpression(inputSize: number): string {
  return Array.from(
    {length: inputSize},
    (_, index) => `${getWebGLInputAccessor(inputSize, index)} == 0xffffffffu`
  ).join(' && ');
}

function getWebGLInvalidRowAssignments(inputSize: number): string {
  return Array.from(
    {length: inputSize},
    (_, index) => `    result[${index}] = ${UINT32_MAX_FLOAT32_HIGH}.0;
    result[${inputSize + index}] = ${UINT32_MAX_FLOAT32_LOW}.0;`
  ).join('\n');
}

function getWebGLOutputAssignments(outputSize: number): string {
  return getWebGLChunkOffsets(outputSize)
    .map(offset => {
      const chunkSize = getWebGLChunkSize(outputSize, offset);
      if (chunkSize === 1) {
        return `  splitValues_${offset} = result[${offset}];`;
      }
      const components = Array.from(
        {length: chunkSize},
        (_, componentIndex) => `result[${offset + componentIndex}]`
      ).join(', ');
      return `  splitValues_${offset} = vec${chunkSize}(${components});`;
    })
    .join('\n');
}

function getWebGLOutputNames(outputSize: number): string[] {
  return getWebGLChunkOffsets(outputSize).map(offset => `splitValues_${offset}`);
}

function getWebGLInputAccessor(inputSize: number, index: number): string {
  const offset = Math.floor(index / 4) * 4;
  const chunkSize = getWebGLChunkSize(inputSize, offset);
  if (chunkSize === 1) {
    return `values_${offset}`;
  }
  return `values_${offset}[${index - offset}]`;
}

function getWebGLChunkOffsets(size: number): number[] {
  return Array.from({length: Math.ceil(size / 4)}, (_, index) => index * 4);
}

function getWebGLChunkSize(size: number, offset: number): number {
  return Math.min(size - offset, 4);
}

function getWebGLUintType(size: number): string {
  return size === 1 ? 'uint' : `uvec${size}`;
}

function getWebGLFloatType(size: number): string {
  return size === 1 ? 'float' : `vec${size}`;
}

function getWebGPUSplitUint32Source(values: GPUDataEvaluator, output: GPUDataEvaluator): string {
  const inputOffset = values.offset / values.ValueType.BYTES_PER_ELEMENT;
  const inputStride = values.stride / values.ValueType.BYTES_PER_ELEMENT;
  const outputOffset = output.offset / output.ValueType.BYTES_PER_ELEMENT;
  const outputStride = output.stride / output.ValueType.BYTES_PER_ELEMENT;
  const inputRowIndex = values.isConstant ? '0u' : 'rowIndex';

  return /* wgsl */ `
@group(0) @binding(0) var<storage, read> values: array<u32>;
@group(0) @binding(1) var<storage, read_write> result: array<f32>;

const FLOAT32_TRAILING_BITS = ${FLOAT32_TRAILING_BITS}u;
const MAX_EXACT_FLOAT32_UINT = ${MAX_EXACT_FLOAT32_UINT}u;
const QUANTIZED_SEA_LEVEL = ${QUANTIZED_SEA_LEVEL}u;
const ZOOM_0_WORLD_SCALE = ${ZOOM_0_WORLD_SCALE};

// f32 has 24 significant bits including the hidden leading bit. Keep the closest f32
// value in the high part and the signed residual in the low part.
fn findMostSignificantBit(value: u32) -> u32 {
  var bit = 0u;
  var remaining = value;
  loop {
    if (remaining <= 1u) {
      break;
    }
    remaining = remaining >> 1u;
    bit++;
  }
  return bit;
}

fn splitUint32Value(value: u32) -> vec2<f32> {
  if (value <= MAX_EXACT_FLOAT32_UINT) {
    return vec2<f32>(f32(value) * ZOOM_0_WORLD_SCALE, 0.0);
  }

  let exponent = findMostSignificantBit(value);
  let shift = exponent - FLOAT32_TRAILING_BITS;
  let step = 1u << shift;
  let mask = step - 1u;
  let truncated = value & ~mask;
  let remainder = value & mask;
  let halfStep = step >> 1u;
  let roundUp = remainder > halfStep || (remainder == halfStep && (truncated & step) != 0u);

  if (roundUp && truncated > 0xffffffffu - step) {
    return vec2<f32>(
      4294967296.0 * ZOOM_0_WORLD_SCALE,
      -f32(0xffffffffu - value + 1u) * ZOOM_0_WORLD_SCALE
    );
  }

  let rounded = truncated + select(0u, step, roundUp);
  let high = f32(rounded);
  var low: f32;
  if (value >= rounded) {
    low = f32(value - rounded);
  } else {
    low = -f32(rounded - value);
  }
  return vec2<f32>(high * ZOOM_0_WORLD_SCALE, low * ZOOM_0_WORLD_SCALE);
}

fn splitZUint32Value(value: u32) -> vec2<f32> {
  if (value >= QUANTIZED_SEA_LEVEL) {
    return splitUint32Value(value - QUANTIZED_SEA_LEVEL);
  }
  return -splitUint32Value(QUANTIZED_SEA_LEVEL - value);
}

fn readValue(rowIndex: u32, laneIndex: u32) -> u32 {
  let rowOffset = ${inputOffset}u + ${inputRowIndex} * ${inputStride}u;
  return values[rowOffset + laneIndex];
}

fn isInvalidRow(rowIndex: u32) -> bool {
  for (var laneIndex = 0u; laneIndex < ${values.size}u; laneIndex = laneIndex + 1u) {
    if (readValue(rowIndex, laneIndex) != 0xffffffffu) {
      return false;
    }
  }
  return true;
}

fn writeResult(rowIndex: u32, value: array<f32, ${output.size}>) {
  let rowOffset = ${outputOffset}u + rowIndex * ${outputStride}u;
${Array.from({length: output.size}, (_, index) => `  result[rowOffset + ${index}u] = value[${index}];`).join('\n')}
}

@compute @workgroup_size(${PROJECTION_WORKGROUP_SIZE}) fn main(
  @builtin(global_invocation_id) globalInvocationId: vec3<u32>
) {
  let rowIndex = globalInvocationId.x;
  if (rowIndex >= ${output.length}u) {
    return;
  }

  var splitValues: array<f32, ${output.size}>;
  if (isInvalidRow(rowIndex)) {
    for (var laneIndex = 0u; laneIndex < ${values.size}u; laneIndex = laneIndex + 1u) {
      splitValues[laneIndex] = ${UINT32_MAX_FLOAT32_HIGH}.0;
      splitValues[laneIndex + ${values.size}u] = ${UINT32_MAX_FLOAT32_LOW}.0;
    }
  } else {
    for (var laneIndex = 0u; laneIndex < ${values.size}u; laneIndex = laneIndex + 1u) {
      let value = readValue(rowIndex, laneIndex);
      let splitValue = select(splitUint32Value(value), splitZUint32Value(value), laneIndex == 2u);
      splitValues[laneIndex] = splitValue.x;
      splitValues[laneIndex + ${values.size}u] = splitValue.y;
    }
  }
  writeResult(rowIndex, splitValues);
}
`;
}
