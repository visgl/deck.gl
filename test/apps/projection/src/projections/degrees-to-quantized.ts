import {type BufferLayout, type VertexFormat} from '@luma.gl/core';
import {BufferTransform, Computation} from '@luma.gl/engine';
import {
  fround,
  getGPUDataEvaluator,
  GPUDataEvaluator,
  Operation,
  type GPUDataEvaluatorInput,
  type OperationHandler
} from '@luma.gl/gpgpu';
import {
  formatShaderFloat,
  formatDoubleSingleConstructor,
  getGLSLDoublePrecisionMathModule,
  getGLSLGeospatialProjectionModule,
  getWGSLDoublePrecisionMathModule,
  getWGSLGeospatialProjectionModule
} from './projection-shader-utils';
import {
  ALTITUDE_UNITS_PER_METER,
  INVALID_QUANTIZED_COORDINATE,
  QUANTIZED_SEA_LEVEL,
  UINT32_MAX
} from './projection-constants';

export type DegreesToQuantizedInput =
  | GPUDataEvaluatorInput
  | {
      coordinates: GPUDataEvaluatorInput;
      altitude?: GPUDataEvaluatorInput;
    };

type DegreesToQuantizedOperationInputs = {
  values: GPUDataEvaluator;
  altitude?: GPUDataEvaluator;
  coordinateSize: number;
  hasLowPart: boolean;
};

const WORKGROUP_SIZE = 64;
const QUANTIZED_SEA_LEVEL_UNIT = QUANTIZED_SEA_LEVEL / UINT32_MAX;
const ALTITUDE_UNIT_SCALE = ALTITUDE_UNITS_PER_METER / UINT32_MAX;

class DegreesToQuantizedOperation extends Operation<DegreesToQuantizedOperationInputs> {
  name = 'degreesToQuantized';

  output: GPUDataEvaluator;

  constructor(
    values: GPUDataEvaluator,
    outputSize: number,
    coordinateSize: number,
    hasLowPart: boolean,
    altitude?: GPUDataEvaluator
  ) {
    if (values.type !== 'float32') {
      throw new Error('degreesToQuantized input must be float32 values');
    }
    if (altitude && (altitude.type !== 'float32' || altitude.size !== 1)) {
      throw new Error('degreesToQuantized altitude must be scalar float32 values');
    }
    super({values, altitude, coordinateSize, hasLowPart});

    this.output = new GPUDataEvaluator({
      id: 'degreesToQuantized',
      isConstant: values.isConstant && (altitude?.isConstant ?? true),
      type: 'uint32',
      size: outputSize,
      length: getBroadcastLength(values, altitude),
      source: this
    });
  }

  toString(): string {
    return `degreesToQuantized(${this.inputs.values})`;
  }
}

export function degreesToQuantized(x: DegreesToQuantizedInput): GPUDataEvaluator {
  if (typeof x === 'object' && !(x instanceof GPUDataEvaluator) && 'coordinates' in x) {
    const coordinates = normalizeCoordinateInput(getGPUDataEvaluator(x.coordinates));
    if (x.altitude === undefined) {
      return new DegreesToQuantizedOperation(
        coordinates.values,
        coordinates.logicalSize,
        coordinates.logicalSize,
        coordinates.hasLowPart
      ).output;
    }

    const altitude = getGPUDataEvaluator(x.altitude);
    if (coordinates.logicalSize !== 2) {
      throw new Error('degreesToQuantized separate altitude input requires vec2 coordinates');
    }
    validateBroadcastLength(coordinates.values, altitude);
    return new DegreesToQuantizedOperation(
      coordinates.values,
      3,
      coordinates.logicalSize,
      coordinates.hasLowPart,
      altitude
    ).output;
  }

  const coordinates = normalizeCoordinateInput(getGPUDataEvaluator(x));
  return new DegreesToQuantizedOperation(
    coordinates.values,
    coordinates.logicalSize,
    coordinates.logicalSize,
    coordinates.hasLowPart
  ).output;
}

function normalizeCoordinateInput(input: GPUDataEvaluator): {
  values: GPUDataEvaluator;
  logicalSize: number;
  hasLowPart: boolean;
} {
  if (input.type === 'uint32') {
    if (input.size % 2 !== 0) {
      throw new Error('degreesToQuantized fp64 input must have an even number of uint32 lanes');
    }
    const logicalSize = input.size / 2;
    validateCoordinateSize(logicalSize);
    return {values: fround(input), logicalSize, hasLowPart: true};
  }

  if (input.type === 'float32') {
    validateCoordinateSize(input.size);
    return {values: input, logicalSize: input.size, hasLowPart: false};
  }

  throw new Error('degreesToQuantized input must be float32 degree values or float64 values');
}

function validateCoordinateSize(size: number): void {
  if (size !== 2 && size !== 3) {
    throw new Error('degreesToQuantized coordinates must be vec2 or vec3');
  }
}

function getBroadcastLength(values: GPUDataEvaluator, altitude?: GPUDataEvaluator): number {
  if (!altitude || altitude.isConstant || !values.isConstant) {
    return values.length;
  }
  return altitude.length;
}

function validateBroadcastLength(values: GPUDataEvaluator, altitude: GPUDataEvaluator): void {
  if (!values.isConstant && !altitude.isConstant && values.length !== altitude.length) {
    throw new Error('degreesToQuantized coordinates and altitude must have matching lengths');
  }
}

function isInvalidInputRow(
  inputValues: ArrayLike<number>,
  inputRowOffset: number,
  coordinateSize: number,
  hasLowPart: boolean,
  altitude: GPUDataEvaluator | undefined,
  altitudeValues: ArrayLike<number> | undefined,
  altitudeOffset: number,
  altitudeStride: number,
  rowIndex: number
): boolean {
  for (let valueIndex = 0; valueIndex < coordinateSize; valueIndex++) {
    if (
      !Number.isFinite(
        readCoordinateValue(inputValues, inputRowOffset, coordinateSize, hasLowPart, valueIndex)
      )
    ) {
      return true;
    }
  }

  return Boolean(
    altitude &&
      altitudeValues &&
      !Number.isFinite(
        readAltitudeValue(altitudeValues, altitude, altitudeOffset, altitudeStride, rowIndex)
      )
  );
}

function readCoordinateValue(
  inputValues: ArrayLike<number>,
  inputRowOffset: number,
  coordinateSize: number,
  hasLowPart: boolean,
  valueIndex: number
): number {
  const high = Number(inputValues[inputRowOffset + valueIndex]);
  const low = hasLowPart ? Number(inputValues[inputRowOffset + valueIndex + coordinateSize]) : 0;
  return high + low;
}

function readAltitudeValue(
  altitudeValues: ArrayLike<number>,
  altitude: GPUDataEvaluator,
  altitudeOffset: number,
  altitudeStride: number,
  rowIndex: number
): number {
  const altitudeRowIndex = altitude.isConstant ? 0 : rowIndex;
  return Number(altitudeValues[altitudeOffset + altitudeRowIndex * altitudeStride]);
}

export const executeCPUDegreesToQuantized: OperationHandler<
  DegreesToQuantizedOperationInputs
> = async ({inputs, output, target}) => {
  const {values, altitude, coordinateSize, hasLowPart} = inputs;
  const sourceValues = values.value;
  const inputValues = sourceValues ?? (await values.readValue());
  const inputOffset = sourceValues ? values.offset / values.ValueType.BYTES_PER_ELEMENT : 0;
  const inputStride = sourceValues
    ? values.stride / values.ValueType.BYTES_PER_ELEMENT
    : values.size;
  const sourceAltitudeValues = altitude?.value;
  const altitudeValues = altitude
    ? (sourceAltitudeValues ?? (await altitude.readValue()))
    : undefined;
  const altitudeOffset =
    altitude && sourceAltitudeValues ? altitude.offset / altitude.ValueType.BYTES_PER_ELEMENT : 0;
  const altitudeStride =
    altitude && sourceAltitudeValues
      ? altitude.stride / altitude.ValueType.BYTES_PER_ELEMENT
      : (altitude?.size ?? 1);
  const outputValues = new Uint32Array(output.length * output.size);

  for (let rowIndex = 0; rowIndex < output.length; rowIndex++) {
    const inputRowIndex = values.isConstant ? 0 : rowIndex;
    const inputRowOffset = inputOffset + inputRowIndex * inputStride;
    const outputRowOffset = rowIndex * output.size;

    if (
      isInvalidInputRow(
        inputValues,
        inputRowOffset,
        coordinateSize,
        hasLowPart,
        altitude,
        altitudeValues,
        altitudeOffset,
        altitudeStride,
        rowIndex
      )
    ) {
      for (let valueIndex = 0; valueIndex < output.size; valueIndex++) {
        outputValues[outputRowOffset + valueIndex] = INVALID_QUANTIZED_COORDINATE;
      }
      continue;
    }

    for (let valueIndex = 0; valueIndex < output.size; valueIndex++) {
      const value =
        altitude && valueIndex === 2
          ? readAltitudeValue(altitudeValues!, altitude, altitudeOffset, altitudeStride, rowIndex)
          : readCoordinateValue(
              inputValues,
              inputRowOffset,
              coordinateSize,
              hasLowPart,
              valueIndex
            );
      outputValues[outputRowOffset + valueIndex] =
        valueIndex === 2
          ? projectAltitudeMetersToQuantized(value)
          : projectDegrees180ToQuantized(value);
    }
  }

  target.write(outputValues);
  return {success: true, value: outputValues};
};

export const executeWebGLDegreesToQuantized: OperationHandler<
  DegreesToQuantizedOperationInputs
> = ({inputs, output, target}) => {
  const {values, altitude, coordinateSize, hasLowPart} = inputs;
  const outputNames = getWebGLOutputNames(output.size);
  const transform = new BufferTransform(target.device, {
    vs: getWebGLDegreesToQuantizedSource(values, output, coordinateSize, hasLowPart, altitude),
    bufferLayout: [
      getWebGLInputBufferLayout(values, 'values'),
      ...(altitude ? [getWebGLInputBufferLayout(altitude, 'altitude')] : [])
    ],
    vertexCount: 1,
    instanceCount: output.length,
    feedbackBufferMode: 'interleaved',
    outputs: outputNames
  });

  try {
    transform.run({
      inputBuffers: {values: values.buffer, ...(altitude ? {altitude: altitude.buffer} : {})},
      outputBuffers: Object.fromEntries(outputNames.map(name => [name, target]))
    });
    return Promise.resolve({success: true});
  } finally {
    transform.destroy();
  }
};

export const executeWebGPUDegreesToQuantized: OperationHandler<
  DegreesToQuantizedOperationInputs
> = ({inputs, output, target}) => {
  const {values, altitude, coordinateSize, hasLowPart} = inputs;
  const valueBindingIndex = values.isConstant ? -1 : 0;
  const altitudeBindingIndex = altitude && !altitude.isConstant ? (values.isConstant ? 0 : 1) : -1;
  const resultBindingIndex =
    (values.isConstant ? 0 : 1) + (altitude && !altitude.isConstant ? 1 : 0);
  const computation = new Computation(target.device, {
    source: getWebGPUDegreesToQuantizedSource(
      values,
      output,
      resultBindingIndex,
      coordinateSize,
      hasLowPart,
      altitude,
      valueBindingIndex,
      altitudeBindingIndex
    ),
    shaderLayout: {
      bindings: [
        ...(values.isConstant
          ? []
          : [{name: 'values', type: 'storage' as const, group: 0, location: valueBindingIndex}]),
        ...(altitude && !altitude.isConstant
          ? [{name: 'altitude', type: 'storage' as const, group: 0, location: altitudeBindingIndex}]
          : []),
        {name: 'result', type: 'storage' as const, group: 0, location: resultBindingIndex}
      ]
    }
  });

  computation.setBindings({
    ...(values.isConstant ? {} : {values: values.buffer}),
    ...(altitude && !altitude.isConstant ? {altitude: altitude.buffer} : {}),
    result: target
  });

  const computePass = target.device.beginComputePass({});
  computation.dispatch(computePass, Math.ceil(output.length / WORKGROUP_SIZE));
  computePass.end();
  target.device.submit();
  computation.destroy();

  return Promise.resolve({success: true});
};

function projectDegrees180ToQuantized(degrees: number): number {
  if (degrees <= -180) {
    return 0;
  }
  if (degrees >= 180) {
    return UINT32_MAX;
  }
  return Math.round(((degrees + 180) / 360) * UINT32_MAX) >>> 0;
}

function projectAltitudeMetersToQuantized(altitudeMeters: number): number {
  if (altitudeMeters <= -QUANTIZED_SEA_LEVEL / ALTITUDE_UNITS_PER_METER) {
    return 0;
  }
  if (altitudeMeters >= (UINT32_MAX - QUANTIZED_SEA_LEVEL) / ALTITUDE_UNITS_PER_METER) {
    return UINT32_MAX;
  }
  return Math.round(QUANTIZED_SEA_LEVEL + altitudeMeters * ALTITUDE_UNITS_PER_METER) >>> 0;
}

function getWebGLInputBufferLayout(values: GPUDataEvaluator, name: string): BufferLayout {
  return {
    name,
    stepMode: values.isConstant ? 'vertex' : 'instance',
    byteStride: values.stride,
    attributes: Array.from({length: Math.ceil(values.size / 4)}, (_, attributeIndex) => {
      const laneIndex = attributeIndex * 4;
      const laneCount = Math.min(values.size - laneIndex, 4);
      return {
        attribute: `${name}_${laneIndex}`,
        format: getFloat32VertexFormat(laneCount),
        byteOffset: values.offset + laneIndex * values.ValueType.BYTES_PER_ELEMENT
      };
    })
  };
}

function getFloat32VertexFormat(size: number): VertexFormat {
  return (size === 1 ? 'float32' : `float32x${size}`) as VertexFormat;
}

function getWebGLDegreesToQuantizedSource(
  values: GPUDataEvaluator,
  output: GPUDataEvaluator,
  coordinateSize: number,
  hasLowPart: boolean,
  altitude?: GPUDataEvaluator
): string {
  const lowExpression = hasLowPart ? `values[index + ${coordinateSize}]` : '0.0';
  const altitudeDeclarations = altitude ? getWebGLInputDeclarations(altitude.size, 'altitude') : '';
  const altitudeReader = altitude
    ? `DoubleSingle readAltitudeInputValue(float altitude[${altitude.size}]) {
  return DoubleSingle(altitude[0], 0.0);
}`
    : '';
  const readValueBlock = altitude
    ? `    DoubleSingle value;
    if (i == 2) {
      value = readAltitudeInputValue(altitude);
    } else {
      value = readInputValue(values, i);
    }`
    : '    DoubleSingle value = readInputValue(values, i);';
  return /* glsl */ `\
#version 300 es

precision highp float;
precision highp int;

${getWebGLInputDeclarations(values.size, 'values')}
${altitudeDeclarations}
${getWebGLOutputDeclarations(output.size)}
${getGLSLDoublePrecisionMathModule()}
${getGLSLGeospatialProjectionModule()}

DoubleSingle readInputValue(float values[${values.size}], int index) {
  return DoubleSingle(values[index], ${lowExpression});
}

${altitudeReader}

bool isInvalidFloat(float value) {
  return value != value || abs(value) > 3.402823e38;
}

bool isInvalidInputValue(DoubleSingle value) {
  return isInvalidFloat(value.high) || isInvalidFloat(value.low);
}

uint projectAltitudeMetersToQuantized(DoubleSingle altitudeMeters) {
  DoubleSingle unit = dsAdd(
    ${formatDoubleSingleConstructor(QUANTIZED_SEA_LEVEL_UNIT)},
    dsMul(altitudeMeters, ${formatDoubleSingleConstructor(ALTITUDE_UNIT_SCALE)})
  );
  return quantizeUnitToU32(unit);
}

void degreesToQuantized(float values[${values.size}], ${altitude ? `float altitude[${altitude.size}], ` : ''}out uint result[${output.size}]) {
  bool isInvalidRow = false;
  for (int i = 0; i < ${output.size}; i++) {
${readValueBlock}
    if (isInvalidInputValue(value)) {
      isInvalidRow = true;
    }
    if (i == 2) {
      result[i] = projectAltitudeMetersToQuantized(value);
    } else {
      result[i] = projectDegrees180ToQuantized(value);
    }
  }
  if (isInvalidRow) {
    for (int i = 0; i < ${output.size}; i++) {
      result[i] = ${INVALID_QUANTIZED_COORDINATE}u;
    }
  }
}

void main() {
  float values[${values.size}];
  get_values(values);
${
  altitude
    ? `  float altitude[${altitude.size}];
  get_altitude(altitude);`
    : ''
}
  uint result[${output.size}];
  degreesToQuantized(values, ${altitude ? 'altitude, ' : ''}result);
  set_result(result);
}
`;
}

function getWebGPUDegreesToQuantizedSource(
  values: GPUDataEvaluator,
  output: GPUDataEvaluator,
  resultBindingIndex: number,
  coordinateSize: number,
  hasLowPart: boolean,
  altitude: GPUDataEvaluator | undefined,
  valueBindingIndex: number,
  altitudeBindingIndex: number
): string {
  const inputBinding = values.isConstant
    ? ''
    : `@group(0) @binding(${valueBindingIndex}) var<storage, read> values: array<f32>;\n`;
  const altitudeBinding =
    altitude && !altitude.isConstant
      ? `@group(0) @binding(${altitudeBindingIndex}) var<storage, read> altitude: array<f32>;\n`
      : '';
  const constantValues = values.isConstant
    ? getConstantValues(values).map(formatShaderFloat).join(', ')
    : '';
  const constantAltitude =
    altitude?.isConstant && altitude.value ? formatShaderFloat(Number(altitude.value[0])) : '';
  const lowExpression = hasLowPart ? `values[index + ${coordinateSize}u]` : '0.0';
  return /* wgsl */ `
${inputBinding}${altitudeBinding}@group(0) @binding(${resultBindingIndex}) var<storage, read_write> result: array<u32>;

${getWGSLDoublePrecisionMathModule()}
${getWGSLGeospatialProjectionModule()}

fn readValues(rowIndex: u32) -> array<f32, ${values.size}> {
${getWebGPUInputReader(values, constantValues)}
}

fn readInputValue(values: array<f32, ${values.size}>, index: u32) -> DoubleSingle {
  return DoubleSingle(values[index], ${lowExpression});
}

fn readAltitudeValue(rowIndex: u32) -> DoubleSingle {
${getWebGPUAltitudeReader(altitude, constantAltitude)}
}

fn isInvalidF32(value: f32) -> bool {
  return value != value || abs(value) > 3.402823e38;
}

fn isInvalidInputValue(value: DoubleSingle) -> bool {
  return isInvalidF32(value.high) || isInvalidF32(value.low);
}

fn projectAltitudeMetersToQuantized(altitudeMeters: DoubleSingle) -> u32 {
  let unit = dsAdd(
    ${formatDoubleSingleConstructor(QUANTIZED_SEA_LEVEL_UNIT)},
    dsMul(altitudeMeters, ${formatDoubleSingleConstructor(ALTITUDE_UNIT_SCALE)})
  );
  return quantizeUnitToU32(unit);
}

fn writeResult(rowIndex: u32, values: array<u32, ${output.size}>) {
  let rowOffset = ${output.offset / output.ValueType.BYTES_PER_ELEMENT}u + rowIndex * ${output.stride / output.ValueType.BYTES_PER_ELEMENT}u;
${Array.from({length: output.size}, (_, index) => `  result[rowOffset + ${index}u] = values[${index}];`).join('\n')}
}

@compute @workgroup_size(${WORKGROUP_SIZE}) fn main(
  @builtin(global_invocation_id) globalInvocationId: vec3<u32>
) {
  let rowIndex = globalInvocationId.x;
  if (rowIndex >= ${output.length}u) {
    return;
  }

  let values = readValues(rowIndex);
  var projected: array<u32, ${output.size}>;
  var isInvalidRow = false;
  for (var i = 0u; i < ${output.size}u; i = i + 1u) {
    var value: DoubleSingle;
    if (${altitude ? 'i == 2u' : 'false'}) {
      value = readAltitudeValue(rowIndex);
    } else {
      value = readInputValue(values, i);
    }
    if (isInvalidInputValue(value)) {
      isInvalidRow = true;
    }
    if (i == 2u) {
      projected[i] = projectAltitudeMetersToQuantized(value);
    } else {
      projected[i] = projectDegrees180ToQuantized(value);
    }
  }
  if (isInvalidRow) {
    for (var i = 0u; i < ${output.size}u; i = i + 1u) {
      projected[i] = ${INVALID_QUANTIZED_COORDINATE}u;
    }
  }
  writeResult(rowIndex, projected);
}
`;
}

function getWebGLInputDeclarations(size: number, name: string): string {
  let attributeBlock = '';
  let readBlock = '';
  for (let index = 0; index < size; index += 4) {
    const laneCount = Math.min(size - index, 4);
    attributeBlock += `in ${getGLSLFloatType(laneCount)} ${name}_${index};\n`;
    for (let lane = 0; lane < laneCount; lane++) {
      readBlock += `  values[${index + lane}] = ${laneCount === 1 ? `${name}_${index}` : `${name}_${index}[${lane}]`};\n`;
    }
  }
  return `${attributeBlock}
void get_${name}(out float values[${size}]) {
${readBlock}}
`;
}

function getWebGLOutputDeclarations(size: number): string {
  let varyingBlock = '';
  let writeBlock = '';
  for (let index = 0; index < size; index += 4) {
    const laneCount = Math.min(size - index, 4);
    varyingBlock += `flat out ${getGLSLUintType(laneCount)} result_${index};\n`;
    const values = Array.from({length: laneCount}, (_, lane) => `values[${index + lane}]`);
    writeBlock +=
      laneCount === 1
        ? `  result_${index} = values[${index}];\n`
        : `  result_${index} = ${getGLSLUintType(laneCount)}(${values.join(', ')});\n`;
  }
  return `${varyingBlock}
void set_result(uint values[${size}]) {
${writeBlock}}
`;
}

function getWebGLOutputNames(size: number): string[] {
  return Array.from({length: Math.ceil(size / 4)}, (_, index) => `result_${index * 4}`);
}

function getGLSLFloatType(size: number): string {
  return size === 1 ? 'float' : `vec${size}`;
}

function getGLSLUintType(size: number): string {
  return size === 1 ? 'uint' : `uvec${size}`;
}

function getWebGPUInputReader(values: GPUDataEvaluator, constantValues: string): string {
  if (values.isConstant) {
    return `  return array<f32, ${values.size}>(${constantValues});`;
  }

  const offset = values.offset / values.ValueType.BYTES_PER_ELEMENT;
  const stride = values.stride / values.ValueType.BYTES_PER_ELEMENT;
  return `  var result: array<f32, ${values.size}>;
  let rowOffset = ${offset}u + rowIndex * ${stride}u;
${Array.from({length: values.size}, (_, index) => `  result[${index}] = values[rowOffset + ${index}u];`).join('\n')}
  return result;`;
}

function getWebGPUAltitudeReader(
  altitude: GPUDataEvaluator | undefined,
  constantAltitude: string
): string {
  if (!altitude) {
    return '  return DoubleSingle(0.0, 0.0);';
  }
  if (altitude.isConstant) {
    return `  return DoubleSingle(${constantAltitude}, 0.0);`;
  }

  const offset = altitude.offset / altitude.ValueType.BYTES_PER_ELEMENT;
  const stride = altitude.stride / altitude.ValueType.BYTES_PER_ELEMENT;
  const rowIndex = altitude.isConstant ? '0u' : 'rowIndex';
  return `  let rowOffset = ${offset}u + ${rowIndex} * ${stride}u;
  return DoubleSingle(altitude[rowOffset], 0.0);`;
}

function getConstantValues(values: GPUDataEvaluator): number[] {
  const value = values.value;
  if (!value) {
    throw new Error(`Constant input ${values} is missing CPU values`);
  }
  return Array.from({length: values.size}, (_, index) => Number(value[index] ?? 0));
}
