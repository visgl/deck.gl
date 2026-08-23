import {Texture} from '@luma.gl/core';
import {GPUDataEvaluator, Operation, type OperationHandler} from '@luma.gl/gpgpu';
import {
  getGLSLProjectionShaderSource,
  getWGSLProjectionShaderSource
} from './projection-shader-utils';
import {
  PROJECTION_WORKGROUP_SIZE,
  addUnsignedClamped,
  appendQuantizedAltitudeToProjectedPosition,
  appendRawAltitudeToProjectedPosition,
  clamp,
  executeWebGLProjection,
  executeWebGPUProjection,
  getQuantizedPosition,
  getProjectionPositions,
  interpolateCatmullRomUint32,
  isInvalidQuantizedPosition,
  makeQuantizedProjectionOutput,
  multiplyUint32ByQuantizedScale,
  projectDegrees180ToQuantized,
  projectSignedRangeToQuantized,
  quantizeUnitInterval,
  subtractUnsignedClamped,
  unprojectQuantizedDegrees,
  type ProjectionInput,
  type ProjectionOperationInputs
} from './projection-utils';

const RADIANS_PER_DEGREE = Math.PI / 180;
const SQRT_3_OVER_2 = Math.sqrt(3) / 2;
const EQUAL_EARTH_A1 = 1.340264;
const EQUAL_EARTH_A2 = -0.081106;
const EQUAL_EARTH_A3 = 0.000893;
const EQUAL_EARTH_A4 = 0.003796;
const EQUAL_EARTH_HALF_WIDTH = Math.PI / (SQRT_3_OVER_2 * EQUAL_EARTH_A1);
const EQUAL_EARTH_MAX_LATITUDE = 90;
const LATITUDE_TABLE_COORDINATE_SHIFT = 17;
const LATITUDE_TABLE_COORDINATE_STEP = 2 ** LATITUDE_TABLE_COORDINATE_SHIFT;
const LATITUDE_TABLE_COORDINATE_MASK = LATITUDE_TABLE_COORDINATE_STEP - 1;
const LATITUDE_TABLE_COORDINATE_INVERSE_STEP = 1 / LATITUDE_TABLE_COORDINATE_STEP;
const LATITUDE_MIN_QUANTIZED = projectDegrees180ToQuantized(-EQUAL_EARTH_MAX_LATITUDE);
const LATITUDE_MAX_QUANTIZED = projectDegrees180ToQuantized(EQUAL_EARTH_MAX_LATITUDE);
const LATITUDE_TABLE_START_INDEX =
  Math.floor(LATITUDE_MIN_QUANTIZED / LATITUDE_TABLE_COORDINATE_STEP) - 1;
const LATITUDE_TABLE_END_INDEX =
  Math.ceil(LATITUDE_MAX_QUANTIZED / LATITUDE_TABLE_COORDINATE_STEP) + 2;
const LATITUDE_TABLE_LENGTH = LATITUDE_TABLE_END_INDEX - LATITUDE_TABLE_START_INDEX + 1;
const LATITUDE_TABLE_TEXTURE_WIDTH = 256;
const LATITUDE_TABLE_TEXTURE_HEIGHT = Math.ceil(
  LATITUDE_TABLE_LENGTH / LATITUDE_TABLE_TEXTURE_WIDTH
);
const LONGITUDE_SCALE_TO_QUANTIZED_SCALE = 360;
const QUANTIZED_CENTER = 0x80000000;

let longitudeScaleTableValue: Uint32Array | null = null;
let longitudeScaleTableTextureValue: Uint32Array | null = null;
let yTableValue: Uint32Array | null = null;
let yTableTextureValue: Uint32Array | null = null;

type EqualEarthOperationInputs = ProjectionOperationInputs & {
  longitudeScaleTable: GPUDataEvaluator;
  yTable: GPUDataEvaluator;
};

class EqualEarthOperation extends Operation<EqualEarthOperationInputs> {
  name = 'equalEarth';

  output: GPUDataEvaluator;

  constructor(positions: GPUDataEvaluator) {
    super({
      positions,
      longitudeScaleTable: getLongitudeScaleTableEvaluator(),
      yTable: getYTableEvaluator()
    });

    this.output = makeQuantizedProjectionOutput('equalEarth', positions, this);
  }

  toString(): string {
    return `equalEarth(${this.inputs.positions})`;
  }
}

export function equalEarth(positions: ProjectionInput): GPUDataEvaluator {
  return new EqualEarthOperation(getProjectionPositions(positions, 'equalEarth')).output;
}

export function rawEqualEarth(coordinates: readonly [number, number]): [number, number];
export function rawEqualEarth(
  coordinates: readonly [number, number, number]
): [number, number, number];
export function rawEqualEarth(
  coordinates: readonly [number, number] | readonly [number, number, number]
): [number, number] | [number, number, number] {
  const [longitude, latitude] = coordinates;
  const longitudeScale = getLongitudeScaleAnalytic(latitude);
  return appendRawAltitudeToProjectedPosition(
    [quantizeUnitInterval(0.5 + longitude * longitudeScale), projectYAnalyticToQuantized(latitude)],
    coordinates
  );
}

export const executeCPUEqualEarth: OperationHandler<EqualEarthOperationInputs> = async ({
  inputs,
  output,
  target
}) => {
  const {positions} = inputs;
  const positionValues = positions.value ?? (await positions.readValue());
  const outputValues = new Uint32Array(output.length * output.size);

  for (let rowIndex = 0; rowIndex < output.length; rowIndex++) {
    const position = getQuantizedPosition(positionValues, positions, rowIndex);
    const outputOffset = rowIndex * output.size;
    if (isInvalidQuantizedPosition(position)) {
      for (let valueIndex = 0; valueIndex < output.size; valueIndex++) {
        outputValues[outputOffset + valueIndex] = 0xffffffff;
      }
      continue;
    }

    const [longitude, latitude] = position;
    const {longitudeScale, y} = getEqualEarthTableLookup(latitude);
    const projected = appendQuantizedAltitudeToProjectedPosition(
      [projectQuantizedLongitude(longitude, longitudeScale), y],
      position
    );
    for (let valueIndex = 0; valueIndex < output.size; valueIndex++) {
      outputValues[outputOffset + valueIndex] = projected[valueIndex];
    }
  }

  target.write(outputValues);
  return {success: true, value: outputValues};
};

export const executeWebGPUEqualEarth: OperationHandler<EqualEarthOperationInputs> = ({
  inputs,
  output,
  target
}) => {
  const {positions, longitudeScaleTable, yTable} = inputs;
  return executeWebGPUProjection({
    positions,
    output,
    target,
    extraBindings: [
      {name: 'longitudeScaleTable', table: longitudeScaleTable},
      {name: 'yTable', table: yTable}
    ],
    getSource: ({resultBindingIndex, getBindingIndex}) =>
      getWebGPUProjectionSource({
        positions,
        output,
        longitudeScaleTableBindingIndex: getBindingIndex('longitudeScaleTable'),
        yTableBindingIndex: getBindingIndex('yTable'),
        resultBindingIndex
      })
  });
};

export const executeWebGLEqualEarth: OperationHandler<EqualEarthOperationInputs> = ({
  inputs,
  output,
  target
}) => {
  const {positions, longitudeScaleTable, yTable} = inputs;
  const longitudeScaleTableTexture = target.device.createTexture({
    width: LATITUDE_TABLE_TEXTURE_WIDTH,
    height: Math.ceil(longitudeScaleTable.length / LATITUDE_TABLE_TEXTURE_WIDTH),
    format: 'r32uint',
    usage: Texture.SAMPLE | Texture.COPY_DST,
    data: getLongitudeScaleTableTextureValue()
  });
  const yTableTexture = target.device.createTexture({
    width: LATITUDE_TABLE_TEXTURE_WIDTH,
    height: Math.ceil(yTable.length / LATITUDE_TABLE_TEXTURE_WIDTH),
    format: 'r32uint',
    usage: Texture.SAMPLE | Texture.COPY_DST,
    data: getYTableTextureValue()
  });

  return executeWebGLProjection({
    positions,
    output,
    target,
    source: getWebGLProjectionSource(positions, output),
    bindings: {longitudeScaleTable: longitudeScaleTableTexture, yTable: yTableTexture},
    resources: [longitudeScaleTableTexture, yTableTexture]
  });
};

function getLongitudeScaleTableEvaluator(): GPUDataEvaluator {
  return GPUDataEvaluator.fromArray(getLongitudeScaleTableValue(), {type: 'uint32', size: 1});
}

function getYTableEvaluator(): GPUDataEvaluator {
  return GPUDataEvaluator.fromArray(getYTableValue(), {type: 'uint32', size: 1});
}

function getLongitudeScaleTableValue(): Uint32Array {
  if (longitudeScaleTableValue) {
    return longitudeScaleTableValue;
  }

  longitudeScaleTableValue = new Uint32Array(LATITUDE_TABLE_LENGTH);
  for (let index = 0; index < LATITUDE_TABLE_LENGTH; index++) {
    const latitude = unprojectQuantizedDegrees(getLatitudeTableQuantizedValue(index));
    longitudeScaleTableValue[index] = quantizeUnitInterval(
      getLongitudeScaleAnalytic(latitude) * LONGITUDE_SCALE_TO_QUANTIZED_SCALE
    );
  }
  return longitudeScaleTableValue;
}

function getLongitudeScaleTableTextureValue(): Uint32Array {
  if (longitudeScaleTableTextureValue) {
    return longitudeScaleTableTextureValue;
  }

  longitudeScaleTableTextureValue = new Uint32Array(
    LATITUDE_TABLE_TEXTURE_WIDTH * LATITUDE_TABLE_TEXTURE_HEIGHT
  );
  longitudeScaleTableTextureValue.set(getLongitudeScaleTableValue());
  return longitudeScaleTableTextureValue;
}

function getYTableValue(): Uint32Array {
  if (yTableValue) {
    return yTableValue;
  }

  yTableValue = new Uint32Array(LATITUDE_TABLE_LENGTH);
  for (let index = 0; index < LATITUDE_TABLE_LENGTH; index++) {
    const latitude = unprojectQuantizedDegrees(getLatitudeTableQuantizedValue(index));
    yTableValue[index] = projectYAnalyticToQuantized(latitude);
  }
  return yTableValue;
}

function getYTableTextureValue(): Uint32Array {
  if (yTableTextureValue) {
    return yTableTextureValue;
  }

  yTableTextureValue = new Uint32Array(
    LATITUDE_TABLE_TEXTURE_WIDTH * LATITUDE_TABLE_TEXTURE_HEIGHT
  );
  yTableTextureValue.set(getYTableValue());
  return yTableTextureValue;
}

function getEqualEarthTableLookup(latitude: number): {longitudeScale: number; y: number} {
  const clampedLatitude = clamp(latitude, LATITUDE_MIN_QUANTIZED, LATITUDE_MAX_QUANTIZED);
  const baseIndex = clamp(
    Math.floor(clampedLatitude / LATITUDE_TABLE_COORDINATE_STEP) - LATITUDE_TABLE_START_INDEX,
    1,
    LATITUDE_TABLE_LENGTH - 3
  );
  const t =
    (Math.trunc(clampedLatitude) & LATITUDE_TABLE_COORDINATE_MASK) *
    LATITUDE_TABLE_COORDINATE_INVERSE_STEP;
  const longitudeScaleTable = getLongitudeScaleTableValue();
  const yTable = getYTableValue();
  return {
    longitudeScale: interpolateCatmullRomUint32(
      longitudeScaleTable[baseIndex - 1],
      longitudeScaleTable[baseIndex],
      longitudeScaleTable[baseIndex + 1],
      longitudeScaleTable[baseIndex + 2],
      t
    ),
    y: interpolateCatmullRomUint32(
      yTable[baseIndex - 1],
      yTable[baseIndex],
      yTable[baseIndex + 1],
      yTable[baseIndex + 2],
      t
    )
  };
}

function getLatitudeTableQuantizedValue(index: number): number {
  return (LATITUDE_TABLE_START_INDEX + index) * LATITUDE_TABLE_COORDINATE_STEP;
}

function getLongitudeScaleAnalytic(latitude: number): number {
  const theta = getEqualEarthTheta(latitude);
  const theta2 = theta * theta;
  const theta6 = theta2 * theta2 * theta2;
  const denominator =
    SQRT_3_OVER_2 *
    (EQUAL_EARTH_A1 +
      3 * EQUAL_EARTH_A2 * theta2 +
      theta6 * (7 * EQUAL_EARTH_A3 + 9 * EQUAL_EARTH_A4 * theta2));
  const longitudeCoefficient = Math.cos(theta) / denominator;
  return (longitudeCoefficient * RADIANS_PER_DEGREE) / (2 * EQUAL_EARTH_HALF_WIDTH);
}

function projectQuantizedLongitude(longitude: number, longitudeScale: number): number {
  if (longitude >= QUANTIZED_CENTER) {
    return addUnsignedClamped(
      QUANTIZED_CENTER,
      multiplyUint32ByQuantizedScale(longitude - QUANTIZED_CENTER, longitudeScale)
    );
  }

  return subtractUnsignedClamped(
    QUANTIZED_CENTER,
    multiplyUint32ByQuantizedScale(QUANTIZED_CENTER - longitude, longitudeScale)
  );
}

function projectYAnalyticToQuantized(latitude: number): number {
  return projectSignedRangeToQuantized(projectYAnalytic(latitude), EQUAL_EARTH_HALF_WIDTH);
}

function projectYAnalytic(latitude: number): number {
  const theta = getEqualEarthTheta(latitude);
  const theta2 = theta * theta;
  const theta6 = theta2 * theta2 * theta2;
  return (
    theta *
    (EQUAL_EARTH_A1 + EQUAL_EARTH_A2 * theta2 + theta6 * (EQUAL_EARTH_A3 + EQUAL_EARTH_A4 * theta2))
  );
}

function getEqualEarthTheta(latitude: number): number {
  const clampedLatitude = clamp(latitude, -EQUAL_EARTH_MAX_LATITUDE, EQUAL_EARTH_MAX_LATITUDE);
  return Math.asin(SQRT_3_OVER_2 * Math.sin(clampedLatitude * RADIANS_PER_DEGREE));
}

function getWebGLProjectionSource(positions: GPUDataEvaluator, output: GPUDataEvaluator): string {
  return getGLSLProjectionShaderSource({
    positions,
    output,
    extraPrecision: 'precision highp usampler2D;',
    uniforms: `uniform highp usampler2D longitudeScaleTable;
uniform highp usampler2D yTable;`,
    projectedExpression:
      output.size === 3
        ? 'projectPosition(longitude, latitude, altitude)'
        : 'projectPosition(longitude, latitude)',
    projectionFunctions: getGLSLEqualEarthProjectionFunctions(output.size)
  });
}

function getWebGPUProjectionSource({
  positions,
  output,
  longitudeScaleTableBindingIndex,
  yTableBindingIndex,
  resultBindingIndex
}: {
  positions: GPUDataEvaluator;
  output: GPUDataEvaluator;
  longitudeScaleTableBindingIndex: number;
  yTableBindingIndex: number;
  resultBindingIndex: number;
}): string {
  return getWGSLProjectionShaderSource({
    positions,
    output,
    resultBindingIndex,
    workgroupSize: PROJECTION_WORKGROUP_SIZE,
    extraBindings: `@group(0) @binding(${longitudeScaleTableBindingIndex}) var<storage, read> longitudeScaleTable: array<u32>;
@group(0) @binding(${yTableBindingIndex}) var<storage, read> yTable: array<u32>;`,
    projectedExpression:
      output.size === 3
        ? 'projectPosition(longitude, latitude, altitude)'
        : 'projectPosition(longitude, latitude)',
    projectionFunctions: getWGSLEqualEarthProjectionFunctions(output.size)
  });
}

function getGLSLEqualEarthProjectionFunctions(outputSize: number): string {
  return /* glsl */ `
uint readLongitudeScaleTable(int index) {
  return texelFetch(
    longitudeScaleTable,
    ivec2(index % ${LATITUDE_TABLE_TEXTURE_WIDTH}, index / ${LATITUDE_TABLE_TEXTURE_WIDTH}),
    0
  ).r;
}

uint readYTable(int index) {
  return texelFetch(
    yTable,
    ivec2(index % ${LATITUDE_TABLE_TEXTURE_WIDTH}, index / ${LATITUDE_TABLE_TEXTURE_WIDTH}),
    0
  ).r;
}

uint projectLongitudeEqualEarth(uint longitude, uint longitudeScale) {
  if (longitude >= 0x80000000u) {
    uint delta = multiplyUint32ByQuantizedScale(longitude - 0x80000000u, longitudeScale);
    return addUnsignedClamped(0x80000000u, delta);
  }

  uint delta = multiplyUint32ByQuantizedScale(0x80000000u - longitude, longitudeScale);
  return subtractUnsignedClamped(0x80000000u, delta);
}

${outputSize === 3 ? 'uvec3' : 'uvec2'} projectPosition(uint longitude, uint latitude${outputSize === 3 ? ', uint altitude' : ''}) {
  if (longitude == 0xffffffffu && latitude == 0xffffffffu${outputSize === 3 ? ' && altitude == 0xffffffffu' : ''}) {
    return ${outputSize === 3 ? 'uvec3' : 'uvec2'}(0xffffffffu);
  }

  uint clampedLatitude = clamp(latitude, ${LATITUDE_MIN_QUANTIZED}u, ${LATITUDE_MAX_QUANTIZED}u);
  int baseIndex = clamp(
    int(clampedLatitude >> ${LATITUDE_TABLE_COORDINATE_SHIFT}u) - ${LATITUDE_TABLE_START_INDEX},
    1,
    ${LATITUDE_TABLE_LENGTH - 3}
  );
  float t = float(clampedLatitude & ${LATITUDE_TABLE_COORDINATE_MASK}u) * ${LATITUDE_TABLE_COORDINATE_INVERSE_STEP};
  uint longitudeScale = interpolateCatmullRomUint32(
    readLongitudeScaleTable(baseIndex - 1),
    readLongitudeScaleTable(baseIndex),
    readLongitudeScaleTable(baseIndex + 1),
    readLongitudeScaleTable(baseIndex + 2),
    t
  );
  uint x = projectLongitudeEqualEarth(longitude, longitudeScale);
  uint y = interpolateCatmullRomUint32(
      readYTable(baseIndex - 1),
      readYTable(baseIndex),
      readYTable(baseIndex + 1),
      readYTable(baseIndex + 2),
      t
  );
${outputSize === 3 ? '  return uvec3(x, y, altitude);' : '  return uvec2(x, y);'}
}
`;
}

function getWGSLEqualEarthProjectionFunctions(outputSize: number): string {
  return /* wgsl */ `
fn projectLongitudeEqualEarth(longitude: u32, longitudeScale: u32) -> u32 {
  if (longitude >= 0x80000000u) {
    let delta = multiplyUint32ByQuantizedScale(longitude - 0x80000000u, longitudeScale);
    return addUnsignedClamped(0x80000000u, delta);
  }

  let delta = multiplyUint32ByQuantizedScale(0x80000000u - longitude, longitudeScale);
  return subtractUnsignedClamped(0x80000000u, delta);
}

fn projectPosition(longitude: u32, latitude: u32${outputSize === 3 ? ', altitude: u32' : ''}) -> ${outputSize === 3 ? 'vec3<u32>' : 'vec2<u32>'} {
  if (longitude == 0xffffffffu && latitude == 0xffffffffu${outputSize === 3 ? ' && altitude == 0xffffffffu' : ''}) {
    return ${outputSize === 3 ? 'vec3<u32>' : 'vec2<u32>'}(0xffffffffu);
  }

  let clampedLatitude = clamp(latitude, ${LATITUDE_MIN_QUANTIZED}u, ${LATITUDE_MAX_QUANTIZED}u);
  let baseIndex = clamp(
    i32(clampedLatitude >> ${LATITUDE_TABLE_COORDINATE_SHIFT}u) - ${LATITUDE_TABLE_START_INDEX},
    1,
    ${LATITUDE_TABLE_LENGTH - 3}
  );
  let t = f32(clampedLatitude & ${LATITUDE_TABLE_COORDINATE_MASK}u) * ${LATITUDE_TABLE_COORDINATE_INVERSE_STEP};
  let index = u32(baseIndex);
  let longitudeScale = interpolateCatmullRomUint32(
    longitudeScaleTable[index - 1u],
    longitudeScaleTable[index],
    longitudeScaleTable[index + 1u],
    longitudeScaleTable[index + 2u],
    t
  );
  let x = projectLongitudeEqualEarth(longitude, longitudeScale);
  let y = interpolateCatmullRomUint32(
      yTable[index - 1u],
      yTable[index],
      yTable[index + 1u],
      yTable[index + 2u],
      t
  );
${outputSize === 3 ? '  return vec3<u32>(x, y, altitude);' : '  return vec2<u32>(x, y);'}
}
`;
}
