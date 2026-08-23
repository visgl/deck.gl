import {Texture, type Buffer} from '@luma.gl/core';
import {GPUDataEvaluator} from '@luma.gl/gpgpu';
import {
  getGLSLProjectionShaderSource,
  getWGSLProjectionShaderSource
} from './projection-shader-utils';
import {conicProjectionParameters, type ConicProjectionUniforms} from './projection-parameters';
import {
  PROJECTION_WORKGROUP_SIZE,
  applySignedDelta,
  clamp,
  executeWebGLProjection,
  executeWebGPUProjection,
  interpolateCatmullRomUint32,
  multiplyUint32ByQ31,
  multiplyUint32ByQuantizedScale,
  projectDegrees180ToQuantized,
  quantizeUnitInterval,
  type ProjectionOperationInputs
} from './projection-utils';

const UINT32_RANGE = 0x100000000;
const UINT32_MAX = 0xffffffff;
const UINT32_SIGN_BIT = 0x80000000;
const SINE_TABLE_CENTER = 0x80000000;
const THETA_PHASE_QUARTER_TURN = 0x40000000;
const CONIC_TABLE_COORDINATE_SHIFT = 17;
const CONIC_TABLE_COORDINATE_STEP = 2 ** CONIC_TABLE_COORDINATE_SHIFT;
const CONIC_TABLE_COORDINATE_MASK = CONIC_TABLE_COORDINATE_STEP - 1;
const CONIC_TABLE_COORDINATE_INVERSE_STEP = 1 / CONIC_TABLE_COORDINATE_STEP;
const CONIC_LATITUDE_MIN_QUANTIZED = projectDegrees180ToQuantized(-90);
const CONIC_LATITUDE_MAX_QUANTIZED = projectDegrees180ToQuantized(90);
const CONIC_RHO_TABLE_START_INDEX =
  Math.floor(CONIC_LATITUDE_MIN_QUANTIZED / CONIC_TABLE_COORDINATE_STEP) - 1;
const CONIC_RHO_TABLE_END_INDEX =
  Math.ceil(CONIC_LATITUDE_MAX_QUANTIZED / CONIC_TABLE_COORDINATE_STEP) + 2;
const CONIC_RHO_TABLE_LENGTH = CONIC_RHO_TABLE_END_INDEX - CONIC_RHO_TABLE_START_INDEX + 1;
const CONIC_SINE_TABLE_START_INDEX = -1;
const CONIC_SINE_TABLE_END_INDEX = Math.ceil(UINT32_RANGE / CONIC_TABLE_COORDINATE_STEP) + 2;
const CONIC_SINE_TABLE_LENGTH = CONIC_SINE_TABLE_END_INDEX - CONIC_SINE_TABLE_START_INDEX + 1;
const CONIC_TABLE_TEXTURE_WIDTH = 256;
const CONIC_RHO_TABLE_TEXTURE_HEIGHT = Math.ceil(
  CONIC_RHO_TABLE_LENGTH / CONIC_TABLE_TEXTURE_WIDTH
);
const CONIC_SINE_TABLE_TEXTURE_HEIGHT = Math.ceil(
  CONIC_SINE_TABLE_LENGTH / CONIC_TABLE_TEXTURE_WIDTH
);

export type ConicProjectionState = {
  falseEasting: number;
  falseNorthing: number;
  semiMajorAxis: number;
  inverseFlattening: number;
  outputCenter: readonly [number, number];
  outputHalfExtent: number;
  n: number;
  rho0: number;
  longitudeOriginQuantized: number;
};

export type ConicOperationInputs<ParametersT extends ConicProjectionState> =
  ProjectionOperationInputs & {
    parameters: ParametersT;
    rhoTable: GPUDataEvaluator;
    sineTable: GPUDataEvaluator;
  };

export type ConicProjectionTableValues = {
  rhoTableValue: Uint32Array;
  rhoTableTextureValue: Uint32Array;
  sineTableValue: Uint32Array;
  sineTableTextureValue: Uint32Array;
};

export function getConicRhoTableEvaluator(
  tableValues: ConicProjectionTableValues
): GPUDataEvaluator {
  return GPUDataEvaluator.fromArray(tableValues.rhoTableValue, {
    type: 'uint32',
    size: 1
  });
}

export function getConicSineTableEvaluator(
  tableValues: ConicProjectionTableValues
): GPUDataEvaluator {
  return GPUDataEvaluator.fromArray(tableValues.sineTableValue, {
    type: 'uint32',
    size: 1
  });
}

export function getConicProjectionTableValues(
  cache: Map<string, ConicProjectionTableValues>,
  key: string,
  getRhoOutputUnits: (quantizedLatitude: number) => number
): ConicProjectionTableValues {
  const cached = cache.get(key);
  if (cached) {
    return cached;
  }

  const rhoTableValue = new Uint32Array(CONIC_RHO_TABLE_LENGTH);
  for (let index = 0; index < CONIC_RHO_TABLE_LENGTH; index++) {
    rhoTableValue[index] = quantizeOutputUnits(
      getRhoOutputUnits(getConicRhoTableQuantizedLatitude(index))
    );
  }

  const sineTableValue = new Uint32Array(CONIC_SINE_TABLE_LENGTH);
  for (let index = 0; index < CONIC_SINE_TABLE_LENGTH; index++) {
    sineTableValue[index] = getBiasedSineFromPhaseCoordinate(
      getConicSineTableCoordinateValue(index)
    );
  }

  const tableValues = {
    rhoTableValue,
    rhoTableTextureValue: makeTextureTableValue(rhoTableValue, CONIC_RHO_TABLE_TEXTURE_HEIGHT),
    sineTableValue,
    sineTableTextureValue: makeTextureTableValue(sineTableValue, CONIC_SINE_TABLE_TEXTURE_HEIGHT)
  };
  cache.set(key, tableValues);
  return tableValues;
}

export function projectQuantizedConicToQuantized(
  longitude: number,
  latitude: number,
  parameters: ConicProjectionState,
  rhoTableValue: Uint32Array,
  sineTableValue: Uint32Array
): [number, number] {
  const rhoUnits = lookupRhoUnitsTable(latitude, rhoTableValue);
  const thetaPhase = getThetaPhaseCoordinate(longitude, parameters);
  const sinTheta = lookupSineTable(thetaPhase, sineTableValue);
  const cosTheta = lookupSineTable(
    addUint32Wrapped(thetaPhase, THETA_PHASE_QUARTER_TURN),
    sineTableValue
  );
  const [xOffset, yOffset] = getQuantizedConicOutputOffset(parameters);
  const xDelta = multiplyRhoUnitsBySine(rhoUnits, sinTheta);
  const yDelta = multiplyRhoUnitsBySine(rhoUnits, cosTheta);

  return [
    applySignedDelta(xOffset, xDelta.delta, xDelta.negative),
    applySignedDelta(yOffset, yDelta.delta, !yDelta.negative)
  ];
}

export function projectConicMetersToQuantized(
  [x, y]: readonly [number, number],
  parameters: ConicProjectionState
): [number, number] {
  return [
    projectCoordinateToQuantized(x, parameters.outputCenter[0], parameters.outputHalfExtent),
    projectCoordinateToQuantized(y, parameters.outputCenter[1], parameters.outputHalfExtent)
  ];
}

export function getConicOutputUnitsPerMeter(parameters: ConicProjectionState): number {
  return UINT32_MAX / (2 * parameters.outputHalfExtent);
}

export function executeWebGPUConicProjection<ParametersT extends ConicProjectionState>({
  inputs,
  output,
  target
}: {
  inputs: ConicOperationInputs<ParametersT>;
  output: GPUDataEvaluator;
  target: Buffer;
}) {
  const {positions, parameters, rhoTable, sineTable} = inputs;
  return executeWebGPUProjection({
    positions,
    output,
    target,
    extraBindings: [
      {name: 'rhoTable', table: rhoTable},
      {name: 'sineTable', table: sineTable}
    ],
    modules: [conicProjectionParameters],
    moduleProps: {conicProjection: makeConicProjectionUniforms(parameters)},
    getSource: ({resultBindingIndex, getBindingIndex}) =>
      getWebGPUProjectionSource({
        positions,
        output,
        rhoTableBindingIndex: getBindingIndex('rhoTable'),
        sineTableBindingIndex: getBindingIndex('sineTable'),
        resultBindingIndex
      })
  });
}

export function executeWebGLConicProjection<ParametersT extends ConicProjectionState>({
  inputs,
  output,
  target,
  tableValues
}: {
  inputs: ConicOperationInputs<ParametersT>;
  output: GPUDataEvaluator;
  target: Buffer;
  tableValues: ConicProjectionTableValues;
}) {
  const {positions, parameters} = inputs;
  const rhoTableTexture = target.device.createTexture({
    width: CONIC_TABLE_TEXTURE_WIDTH,
    height: CONIC_RHO_TABLE_TEXTURE_HEIGHT,
    format: 'r32uint',
    usage: Texture.SAMPLE | Texture.COPY_DST,
    data: tableValues.rhoTableTextureValue
  });
  const sineTableTexture = target.device.createTexture({
    width: CONIC_TABLE_TEXTURE_WIDTH,
    height: CONIC_SINE_TABLE_TEXTURE_HEIGHT,
    format: 'r32uint',
    usage: Texture.SAMPLE | Texture.COPY_DST,
    data: tableValues.sineTableTextureValue
  });

  return executeWebGLProjection({
    positions,
    output,
    target,
    source: getWebGLProjectionSource(positions, output),
    bindings: {
      rhoTable: rhoTableTexture,
      sineTable: sineTableTexture
    },
    modules: [conicProjectionParameters],
    moduleProps: {conicProjection: makeConicProjectionUniforms(parameters)},
    resources: [rhoTableTexture, sineTableTexture]
  });
}

export function quantizeOutputUnits(value: number): number {
  if (value <= 0) {
    return 0;
  }
  if (value >= UINT32_MAX) {
    return UINT32_MAX;
  }
  return Math.round(value) >>> 0;
}

function projectCoordinateToQuantized(value: number, center: number, halfExtent: number): number {
  return quantizeUnitInterval((value - center + halfExtent) / (2 * halfExtent));
}

function getConicOutputOffset(parameters: ConicProjectionState): [number, number] {
  const unitsPerMeter = getConicOutputUnitsPerMeter(parameters);
  return [
    (parameters.falseEasting - parameters.outputCenter[0] + parameters.outputHalfExtent) *
      unitsPerMeter,
    (parameters.falseNorthing +
      parameters.rho0 -
      parameters.outputCenter[1] +
      parameters.outputHalfExtent) *
      unitsPerMeter
  ];
}

function getQuantizedConicOutputOffset(parameters: ConicProjectionState): [number, number] {
  const [xOffset, yOffset] = getConicOutputOffset(parameters);
  return [quantizeOutputUnits(xOffset), quantizeOutputUnits(yOffset)];
}

function lookupRhoUnitsTable(latitude: number, rhoTableValue: Uint32Array): number {
  const clampedLatitude = clamp(
    latitude,
    CONIC_LATITUDE_MIN_QUANTIZED,
    CONIC_LATITUDE_MAX_QUANTIZED
  );
  const baseIndex = clamp(
    Math.floor(clampedLatitude / CONIC_TABLE_COORDINATE_STEP) - CONIC_RHO_TABLE_START_INDEX,
    1,
    CONIC_RHO_TABLE_LENGTH - 3
  );
  const t =
    (Math.trunc(clampedLatitude) & CONIC_TABLE_COORDINATE_MASK) *
    CONIC_TABLE_COORDINATE_INVERSE_STEP;
  return interpolateUint32TableValue(rhoTableValue, baseIndex, t);
}

function lookupSineTable(coordinate: number, tableValue: Uint32Array): number {
  const baseIndex = clamp(
    Math.floor(coordinate / CONIC_TABLE_COORDINATE_STEP) - CONIC_SINE_TABLE_START_INDEX,
    1,
    CONIC_SINE_TABLE_LENGTH - 3
  );
  const t =
    (Math.trunc(coordinate) & CONIC_TABLE_COORDINATE_MASK) * CONIC_TABLE_COORDINATE_INVERSE_STEP;
  return interpolateUint32TableValue(tableValue, baseIndex, t);
}

function interpolateUint32TableValue(
  tableValue: Uint32Array,
  baseIndex: number,
  t: number
): number {
  return interpolateCatmullRomUint32(
    tableValue[baseIndex - 1] ?? 0,
    tableValue[baseIndex] ?? 0,
    tableValue[baseIndex + 1] ?? 0,
    tableValue[baseIndex + 2] ?? 0,
    t
  );
}

function getConicRhoTableQuantizedLatitude(index: number): number {
  return (CONIC_RHO_TABLE_START_INDEX + index) * CONIC_TABLE_COORDINATE_STEP;
}

function getConicSineTableCoordinateValue(index: number): number {
  return (CONIC_SINE_TABLE_START_INDEX + index) * CONIC_TABLE_COORDINATE_STEP;
}

function getBiasedSineFromPhaseCoordinate(coordinate: number): number {
  return quantizeUnitInterval((Math.sin((coordinate / UINT32_RANGE) * 2 * Math.PI) + 1) / 2);
}

function getThetaPhaseCoordinate(longitude: number, parameters: ConicProjectionState): number {
  const {longitudeOriginQuantized} = parameters;
  const shiftedLongitude = (longitude - longitudeOriginQuantized) >>> 0;
  let negative = false;
  let absoluteDelta = shiftedLongitude;
  if (shiftedLongitude > UINT32_SIGN_BIT) {
    negative = true;
    absoluteDelta = (0 - shiftedLongitude) >>> 0;
  }

  if (parameters.n < 0) {
    negative = !negative;
  }

  const phase = multiplyUint32ByQuantizedScale(absoluteDelta, getThetaPhaseScale(parameters));
  return negative ? addUint32Wrapped(0, -phase) : phase;
}

function getThetaPhaseScale(parameters: ConicProjectionState): number {
  return quantizeUnitInterval(Math.abs(parameters.n));
}

function multiplyRhoUnitsBySine(
  rhoUnits: number,
  biasedSine: number
): {delta: number; negative: boolean} {
  const negative = biasedSine < SINE_TABLE_CENTER;
  const sineMagnitude = negative ? SINE_TABLE_CENTER - biasedSine : biasedSine - SINE_TABLE_CENTER;
  return {
    delta: multiplyUint32ByQ31(rhoUnits, sineMagnitude),
    negative
  };
}

function addUint32Wrapped(value: number, delta: number): number {
  return (value + delta) >>> 0;
}

function makeTextureTableValue(tableValue: Uint32Array, height: number): Uint32Array {
  const textureValue = new Uint32Array(CONIC_TABLE_TEXTURE_WIDTH * height);
  textureValue.set(tableValue);
  return textureValue;
}

function makeConicProjectionUniforms(parameters: ConicProjectionState): ConicProjectionUniforms {
  const [xOffset, yOffset] = getQuantizedConicOutputOffset(parameters);

  return {
    outputParameters: [
      xOffset,
      yOffset,
      parameters.longitudeOriginQuantized,
      getThetaPhaseScale(parameters)
    ],
    thetaParameters: [parameters.n < 0 ? 1 : 0, 0, 0, 0]
  };
}

function getWebGLProjectionSource(positions: GPUDataEvaluator, output: GPUDataEvaluator): string {
  return getGLSLProjectionShaderSource({
    positions,
    output,
    extraPrecision: 'precision highp usampler2D;',
    uniforms: `uniform highp usampler2D rhoTable;
uniform highp usampler2D sineTable;`,
    projectedExpression:
      output.size === 3
        ? 'projectConic(longitude, latitude, altitude)'
        : 'projectConic(longitude, latitude)',
    projectionFunctions: getGLSLConicProjectionFunctions(output.size)
  });
}

function getWebGPUProjectionSource({
  positions,
  output,
  rhoTableBindingIndex,
  sineTableBindingIndex,
  resultBindingIndex
}: {
  positions: GPUDataEvaluator;
  output: GPUDataEvaluator;
  rhoTableBindingIndex: number;
  sineTableBindingIndex: number;
  resultBindingIndex: number;
}): string {
  return getWGSLProjectionShaderSource({
    positions,
    output,
    resultBindingIndex,
    workgroupSize: PROJECTION_WORKGROUP_SIZE,
    extraBindings: `@group(0) @binding(${rhoTableBindingIndex}) var<storage, read> rhoTable: array<u32>;
@group(0) @binding(${sineTableBindingIndex}) var<storage, read> sineTable: array<u32>;`,
    projectedExpression:
      output.size === 3
        ? 'projectConic(longitude, latitude, altitude)'
        : 'projectConic(longitude, latitude)',
    projectionFunctions: getWGSLConicProjectionFunctions(output.size)
  });
}

function getGLSLConicProjectionFunctions(outputSize: number): string {
  return /* glsl */ `
uint readRhoTable(int index) {
  return texelFetch(
    rhoTable,
    ivec2(index % ${CONIC_TABLE_TEXTURE_WIDTH}, index / ${CONIC_TABLE_TEXTURE_WIDTH}),
    0
  ).r;
}

uint readSineTable(int index) {
  return texelFetch(
    sineTable,
    ivec2(index % ${CONIC_TABLE_TEXTURE_WIDTH}, index / ${CONIC_TABLE_TEXTURE_WIDTH}),
    0
  ).r;
}

uint lookupRhoUnits(uint latitude) {
  uint clampedLatitude = clamp(latitude, ${CONIC_LATITUDE_MIN_QUANTIZED}u, ${CONIC_LATITUDE_MAX_QUANTIZED}u);
  int baseIndex = clamp(
    int(clampedLatitude >> ${CONIC_TABLE_COORDINATE_SHIFT}u) - ${CONIC_RHO_TABLE_START_INDEX},
    1,
    ${CONIC_RHO_TABLE_LENGTH - 3}
  );
  float t = float(clampedLatitude & ${CONIC_TABLE_COORDINATE_MASK}u) * ${CONIC_TABLE_COORDINATE_INVERSE_STEP};
  return interpolateCatmullRomUint32(
    readRhoTable(baseIndex - 1),
    readRhoTable(baseIndex),
    readRhoTable(baseIndex + 1),
    readRhoTable(baseIndex + 2),
    t
  );
}

uint getThetaPhaseCoordinate(uint longitude) {
  uint shiftedLongitude = longitude - conicProjection.outputParameters.z;
  bool negative = false;
  uint absoluteDelta = shiftedLongitude;
  if (shiftedLongitude > 0x80000000u) {
    negative = true;
    absoluteDelta = 0u - shiftedLongitude;
  }

  if (conicProjection.thetaParameters.x != 0u) {
    negative = !negative;
  }

  uint phase = multiplyUint32ByQuantizedScale(
    absoluteDelta,
    conicProjection.outputParameters.w
  );
  return negative ? 0u - phase : phase;
}

uint lookupSine(uint phaseCoordinate) {
  int baseIndex = clamp(
    int(phaseCoordinate >> ${CONIC_TABLE_COORDINATE_SHIFT}u) + ${-CONIC_SINE_TABLE_START_INDEX},
    1,
    ${CONIC_SINE_TABLE_LENGTH - 3}
  );
  float t = float(phaseCoordinate & ${CONIC_TABLE_COORDINATE_MASK}u) * ${CONIC_TABLE_COORDINATE_INVERSE_STEP};
  return interpolateCatmullRomUint32(
    readSineTable(baseIndex - 1),
    readSineTable(baseIndex),
    readSineTable(baseIndex + 1),
    readSineTable(baseIndex + 2),
    t
  );
}

uint getSineMagnitude(uint biasedSine, out bool negative) {
  negative = biasedSine < ${SINE_TABLE_CENTER}u;
  return negative ? ${SINE_TABLE_CENTER}u - biasedSine : biasedSine - ${SINE_TABLE_CENTER}u;
}

uint multiplyRhoUnitsBySine(uint rhoUnits, uint biasedSine, out bool negative) {
  uint sineMagnitude = getSineMagnitude(biasedSine, negative);
  return multiplyUint32ByQ31(rhoUnits, sineMagnitude);
}

${outputSize === 3 ? 'uvec3' : 'uvec2'} projectConic(uint longitude, uint latitude${outputSize === 3 ? ', uint altitude' : ''}) {
  if (longitude == 0xffffffffu && latitude == 0xffffffffu${outputSize === 3 ? ' && altitude == 0xffffffffu' : ''}) {
    return ${outputSize === 3 ? 'uvec3' : 'uvec2'}(0xffffffffu);
  }

  uint rhoUnits = lookupRhoUnits(latitude);
  uint thetaPhase = getThetaPhaseCoordinate(longitude);
  bool xNegative;
  uint xDelta = multiplyRhoUnitsBySine(rhoUnits, lookupSine(thetaPhase), xNegative);
  bool cosineNegative;
  uint yDelta = multiplyRhoUnitsBySine(
    rhoUnits,
    lookupSine(thetaPhase + ${THETA_PHASE_QUARTER_TURN}u),
    cosineNegative
  );
  uint x = addSignedDelta(conicProjection.outputParameters.x, xDelta, xNegative);
  uint y = addSignedDelta(conicProjection.outputParameters.y, yDelta, !cosineNegative);
${outputSize === 3 ? '  return uvec3(x, y, altitude);' : '  return uvec2(x, y);'}
}
`;
}

function getWGSLConicProjectionFunctions(outputSize: number): string {
  return /* wgsl */ `
struct SignedDelta {
  delta: u32,
  negative: bool,
}

fn readRhoTable(index: u32) -> u32 {
  return rhoTable[index];
}

fn readSineTable(index: u32) -> u32 {
  return sineTable[index];
}

fn lookupRhoUnits(latitude: u32) -> u32 {
  let clampedLatitude = clamp(latitude, ${CONIC_LATITUDE_MIN_QUANTIZED}u, ${CONIC_LATITUDE_MAX_QUANTIZED}u);
  let baseIndex = clamp(
    i32(clampedLatitude >> ${CONIC_TABLE_COORDINATE_SHIFT}u) - ${CONIC_RHO_TABLE_START_INDEX},
    1,
    ${CONIC_RHO_TABLE_LENGTH - 3}
  );
  let t = f32(clampedLatitude & ${CONIC_TABLE_COORDINATE_MASK}u) * ${CONIC_TABLE_COORDINATE_INVERSE_STEP};
  let index = u32(baseIndex);
  return interpolateCatmullRomUint32(
    readRhoTable(index - 1u),
    readRhoTable(index),
    readRhoTable(index + 1u),
    readRhoTable(index + 2u),
    t
  );
}

fn getThetaPhaseCoordinate(longitude: u32) -> u32 {
  let shiftedLongitude = longitude - conicProjection.outputParameters.z;
  var negative = false;
  var absoluteDelta = shiftedLongitude;
  if (shiftedLongitude > 0x80000000u) {
    negative = true;
    absoluteDelta = 0u - shiftedLongitude;
  }

  if (conicProjection.thetaParameters.x != 0u) {
    negative = !negative;
  }

  let phase = multiplyUint32ByQuantizedScale(
    absoluteDelta,
    conicProjection.outputParameters.w
  );
  if (negative) {
    return 0u - phase;
  }
  return phase;
}

fn lookupSine(phaseCoordinate: u32) -> u32 {
  let baseIndex = clamp(
    i32(phaseCoordinate >> ${CONIC_TABLE_COORDINATE_SHIFT}u) + ${-CONIC_SINE_TABLE_START_INDEX},
    1,
    ${CONIC_SINE_TABLE_LENGTH - 3}
  );
  let t = f32(phaseCoordinate & ${CONIC_TABLE_COORDINATE_MASK}u) * ${CONIC_TABLE_COORDINATE_INVERSE_STEP};
  let index = u32(baseIndex);
  return interpolateCatmullRomUint32(
    readSineTable(index - 1u),
    readSineTable(index),
    readSineTable(index + 1u),
    readSineTable(index + 2u),
    t
  );
}

fn multiplyRhoUnitsBySine(rhoUnits: u32, biasedSine: u32) -> SignedDelta {
  let negative = biasedSine < ${SINE_TABLE_CENTER}u;
  let sineMagnitude =
    select(biasedSine - ${SINE_TABLE_CENTER}u, ${SINE_TABLE_CENTER}u - biasedSine, negative);
  return SignedDelta(multiplyUint32ByQ31(rhoUnits, sineMagnitude), negative);
}

fn projectConic(longitude: u32, latitude: u32${outputSize === 3 ? ', altitude: u32' : ''}) -> ${outputSize === 3 ? 'vec3<u32>' : 'vec2<u32>'} {
  if (longitude == 0xffffffffu && latitude == 0xffffffffu${outputSize === 3 ? ' && altitude == 0xffffffffu' : ''}) {
    return ${outputSize === 3 ? 'vec3<u32>' : 'vec2<u32>'}(0xffffffffu);
  }

  let rhoUnits = lookupRhoUnits(latitude);
  let thetaPhase = getThetaPhaseCoordinate(longitude);
  let xDelta = multiplyRhoUnitsBySine(rhoUnits, lookupSine(thetaPhase));
  let yDelta = multiplyRhoUnitsBySine(
    rhoUnits,
    lookupSine(thetaPhase + ${THETA_PHASE_QUARTER_TURN}u)
  );
  let x = addSignedDelta(conicProjection.outputParameters.x, xDelta.delta, xDelta.negative);
  let y = addSignedDelta(conicProjection.outputParameters.y, yDelta.delta, !yDelta.negative);
${outputSize === 3 ? '  return vec3<u32>(x, y, altitude);' : '  return vec2<u32>(x, y);'}
}
`;
}
