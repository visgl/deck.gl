import {Texture} from '@luma.gl/core';
import {GPUDataEvaluator, Operation, type OperationHandler} from '@luma.gl/gpgpu';
import {
  getGLSLProjectionShaderSource,
  getWGSLProjectionShaderSource
} from './projection-shader-utils';
import {
  ALTITUDE_UNITS_PER_METER,
  EARTH_RADIUS_METERS,
  INVALID_QUANTIZED_COORDINATE,
  PROJECTION_WORKGROUP_SIZE,
  QUANTIZED_SEA_LEVEL,
  UINT32_MAX,
  addUnsignedClamped,
  clamp,
  executeWebGLProjection,
  executeWebGPUProjection,
  getQuantizedPosition,
  getProjectionPositions,
  interpolateCatmullRomUint32,
  makeQuantizedProjectionOutput,
  multiplyUint32ByQ24,
  projectDegrees180ToQuantized,
  projectAltitudeMetersToQuantized,
  projectLongitudeToQuantized,
  quantizeUnitInterval,
  subtractUnsignedClamped,
  unprojectQuantizedDegrees,
  isInvalidQuantizedPosition,
  type ProjectionInput,
  type ProjectionOperationInputs
} from './projection-utils';

const WEB_MERCATOR_MAX_LATITUDE = 85.0511287798066;
const LATITUDE_TABLE_COORDINATE_SHIFT = 17;
const LATITUDE_TABLE_COORDINATE_STEP = 2 ** LATITUDE_TABLE_COORDINATE_SHIFT;
const LATITUDE_TABLE_COORDINATE_MASK = LATITUDE_TABLE_COORDINATE_STEP - 1;
const LATITUDE_TABLE_COORDINATE_INVERSE_STEP = 1 / LATITUDE_TABLE_COORDINATE_STEP;
const LATITUDE_MIN_QUANTIZED = projectDegrees180ToQuantized(-WEB_MERCATOR_MAX_LATITUDE);
const LATITUDE_MAX_QUANTIZED = projectDegrees180ToQuantized(WEB_MERCATOR_MAX_LATITUDE);
const LATITUDE_TABLE_START_INDEX =
  Math.floor(LATITUDE_MIN_QUANTIZED / LATITUDE_TABLE_COORDINATE_STEP) - 1;
const LATITUDE_TABLE_END_INDEX =
  Math.ceil(LATITUDE_MAX_QUANTIZED / LATITUDE_TABLE_COORDINATE_STEP) + 2;
const LATITUDE_TABLE_LENGTH = LATITUDE_TABLE_END_INDEX - LATITUDE_TABLE_START_INDEX + 1;
const LATITUDE_TABLE_TEXTURE_WIDTH = 256;
const LATITUDE_TABLE_TEXTURE_HEIGHT = Math.ceil(
  LATITUDE_TABLE_LENGTH / LATITUDE_TABLE_TEXTURE_WIDTH
);
const ALTITUDE_SCALE_FRACTION_BITS = 24;
const ALTITUDE_SCALE_MULTIPLIER = 2 ** ALTITUDE_SCALE_FRACTION_BITS;
const WEB_MERCATOR_PROJECTED_UNITS_PER_METER = UINT32_MAX / (2 * Math.PI * EARTH_RADIUS_METERS);
let latitudeTableValue: Uint32Array | null = null;
let latitudeTableTextureValue: Uint32Array | null = null;
let altitudeScaleTableValue: Uint32Array | null = null;
let altitudeScaleTableTextureValue: Uint32Array | null = null;

type WebMercatorOperationInputs = ProjectionOperationInputs & {
  latitudeTable: GPUDataEvaluator;
  altitudeScaleTable: GPUDataEvaluator;
};

class WebMercatorOperation extends Operation<WebMercatorOperationInputs> {
  name = 'webMercator';

  output: GPUDataEvaluator;

  constructor(positions: GPUDataEvaluator) {
    super({
      positions,
      latitudeTable: getLatitudeTableEvaluator(),
      altitudeScaleTable: getAltitudeScaleTableEvaluator()
    });

    this.output = makeQuantizedProjectionOutput('webMercator', positions, this, positions.size);
  }

  toString(): string {
    return `webMercator(${this.inputs.positions})`;
  }
}

export function webMercator(positions: ProjectionInput): GPUDataEvaluator {
  return new WebMercatorOperation(getProjectionPositions(positions, 'webMercator')).output;
}

export function rawWebMercator(coordinates: readonly [number, number]): [number, number];
export function rawWebMercator(
  coordinates: readonly [number, number, number]
): [number, number, number];
export function rawWebMercator(
  coordinates: readonly [number, number] | readonly [number, number, number]
): [number, number] | [number, number, number] {
  const [longitude, latitude, altitude] = coordinates;
  const projectedLongitude = projectLongitudeToQuantized(longitude);
  const quantizedLatitude = projectDegrees180ToQuantized(latitude);
  const {y: projectedLatitude, altitudeScale} = getWebMercatorTableLookup(quantizedLatitude);
  if (altitude === undefined) {
    return [projectedLongitude, projectedLatitude];
  }
  return [
    projectedLongitude,
    projectedLatitude,
    projectAltitudeToQuantized(projectAltitudeMetersToQuantized(altitude), altitudeScale)
  ];
}

export const executeCPUWebMercator: OperationHandler<WebMercatorOperationInputs> = async ({
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
        outputValues[outputOffset + valueIndex] = INVALID_QUANTIZED_COORDINATE;
      }
      continue;
    }

    const [longitude, latitude, altitude] = position;
    const {y, altitudeScale} = getWebMercatorTableLookup(latitude);
    outputValues[outputOffset] = longitude;
    outputValues[outputOffset + 1] = y;
    if (output.size === 3) {
      outputValues[outputOffset + 2] = projectAltitudeToQuantized(altitude, altitudeScale);
    }
  }

  target.write(outputValues);
  return {success: true, value: outputValues};
};

export const executeWebGPUWebMercator: OperationHandler<WebMercatorOperationInputs> = ({
  inputs,
  output,
  target
}) => {
  const {positions, latitudeTable, altitudeScaleTable} = inputs;
  return executeWebGPUProjection({
    positions,
    output,
    target,
    extraBindings: [
      {name: 'latitudeTable', table: latitudeTable},
      {name: 'altitudeScaleTable', table: altitudeScaleTable}
    ],
    getSource: ({resultBindingIndex, getBindingIndex}) =>
      getWebGPUProjectionSource({
        positions,
        output,
        latitudeTableBindingIndex: getBindingIndex('latitudeTable'),
        altitudeScaleTableBindingIndex: getBindingIndex('altitudeScaleTable'),
        resultBindingIndex
      })
  });
};

export const executeWebGLWebMercator: OperationHandler<WebMercatorOperationInputs> = ({
  inputs,
  output,
  target
}) => {
  const {positions, latitudeTable, altitudeScaleTable} = inputs;
  const latitudeTableTexture = target.device.createTexture({
    width: LATITUDE_TABLE_TEXTURE_WIDTH,
    height: Math.ceil(latitudeTable.length / LATITUDE_TABLE_TEXTURE_WIDTH),
    format: 'r32uint',
    usage: Texture.SAMPLE | Texture.COPY_DST,
    data: getLatitudeTableTextureValue()
  });
  const altitudeScaleTableTexture = target.device.createTexture({
    width: LATITUDE_TABLE_TEXTURE_WIDTH,
    height: Math.ceil(altitudeScaleTable.length / LATITUDE_TABLE_TEXTURE_WIDTH),
    format: 'r32uint',
    usage: Texture.SAMPLE | Texture.COPY_DST,
    data: getAltitudeScaleTableTextureValue()
  });

  return executeWebGLProjection({
    positions,
    output,
    target,
    source: getWebGLProjectionSource(positions, output),
    bindings: {latitudeTable: latitudeTableTexture, altitudeScaleTable: altitudeScaleTableTexture},
    resources: [latitudeTableTexture, altitudeScaleTableTexture]
  });
};

function getLatitudeTableEvaluator(): GPUDataEvaluator {
  return GPUDataEvaluator.fromArray(getLatitudeTableValue(), {type: 'uint32', size: 1});
}

function getAltitudeScaleTableEvaluator(): GPUDataEvaluator {
  return GPUDataEvaluator.fromArray(getAltitudeScaleTableValue(), {type: 'uint32', size: 1});
}

function getLatitudeTableValue(): Uint32Array {
  if (latitudeTableValue) {
    return latitudeTableValue;
  }

  latitudeTableValue = new Uint32Array(LATITUDE_TABLE_LENGTH);
  for (let index = 0; index < LATITUDE_TABLE_LENGTH; index++) {
    const latitude = unprojectQuantizedDegrees(getLatitudeTableQuantizedValue(index));
    latitudeTableValue[index] = projectLatitudeAnalyticToQuantized(latitude);
  }
  return latitudeTableValue;
}

function getLatitudeTableTextureValue(): Uint32Array {
  if (latitudeTableTextureValue) {
    return latitudeTableTextureValue;
  }

  latitudeTableTextureValue = new Uint32Array(
    LATITUDE_TABLE_TEXTURE_WIDTH * LATITUDE_TABLE_TEXTURE_HEIGHT
  );
  latitudeTableTextureValue.set(getLatitudeTableValue());
  return latitudeTableTextureValue;
}

function getAltitudeScaleTableValue(): Uint32Array {
  if (altitudeScaleTableValue) {
    return altitudeScaleTableValue;
  }

  altitudeScaleTableValue = new Uint32Array(LATITUDE_TABLE_LENGTH);
  for (let index = 0; index < LATITUDE_TABLE_LENGTH; index++) {
    const latitude = unprojectQuantizedDegrees(getLatitudeTableQuantizedValue(index));
    altitudeScaleTableValue[index] = getAltitudeScaleAnalytic(latitude);
  }
  return altitudeScaleTableValue;
}

function getAltitudeScaleTableTextureValue(): Uint32Array {
  if (altitudeScaleTableTextureValue) {
    return altitudeScaleTableTextureValue;
  }

  altitudeScaleTableTextureValue = new Uint32Array(
    LATITUDE_TABLE_TEXTURE_WIDTH * LATITUDE_TABLE_TEXTURE_HEIGHT
  );
  altitudeScaleTableTextureValue.set(getAltitudeScaleTableValue());
  return altitudeScaleTableTextureValue;
}

function getWebMercatorTableLookup(latitude: number): {y: number; altitudeScale: number} {
  const clampedLatitude = clamp(latitude, LATITUDE_MIN_QUANTIZED, LATITUDE_MAX_QUANTIZED);
  const baseIndex = clamp(
    Math.floor(clampedLatitude / LATITUDE_TABLE_COORDINATE_STEP) - LATITUDE_TABLE_START_INDEX,
    1,
    LATITUDE_TABLE_LENGTH - 3
  );
  const t =
    (Math.trunc(clampedLatitude) & LATITUDE_TABLE_COORDINATE_MASK) *
    LATITUDE_TABLE_COORDINATE_INVERSE_STEP;
  const latitudeTable = getLatitudeTableValue();
  const altitudeScaleTable = getAltitudeScaleTableValue();
  return {
    y: interpolateCatmullRomUint32(
      latitudeTable[baseIndex - 1],
      latitudeTable[baseIndex],
      latitudeTable[baseIndex + 1],
      latitudeTable[baseIndex + 2],
      t
    ),
    altitudeScale: interpolateCatmullRomUint32(
      altitudeScaleTable[baseIndex - 1],
      altitudeScaleTable[baseIndex],
      altitudeScaleTable[baseIndex + 1],
      altitudeScaleTable[baseIndex + 2],
      t
    )
  };
}

function projectLatitudeAnalyticToQuantized(latitude: number): number {
  const clampedLatitude = clamp(latitude, -WEB_MERCATOR_MAX_LATITUDE, WEB_MERCATOR_MAX_LATITUDE);
  const latitudeRadians = (clampedLatitude * Math.PI) / 180;
  const mercatorY = Math.log(Math.tan(Math.PI / 4 + latitudeRadians / 2));
  return quantizeUnitInterval((mercatorY + Math.PI) / (2 * Math.PI));
}

function getAltitudeScaleAnalytic(latitude: number): number {
  const clampedLatitude = clamp(latitude, -WEB_MERCATOR_MAX_LATITUDE, WEB_MERCATOR_MAX_LATITUDE);
  const latitudeRadians = (clampedLatitude * Math.PI) / 180;
  const scale =
    WEB_MERCATOR_PROJECTED_UNITS_PER_METER / ALTITUDE_UNITS_PER_METER / Math.cos(latitudeRadians);
  return Math.min(Math.round(scale * ALTITUDE_SCALE_MULTIPLIER), UINT32_MAX);
}

function projectAltitudeToQuantized(altitude: number | undefined, altitudeScale: number): number {
  if (altitude === undefined) {
    return QUANTIZED_SEA_LEVEL;
  }
  if (altitude >= QUANTIZED_SEA_LEVEL) {
    const delta = multiplyUint32ByQ24(altitude - QUANTIZED_SEA_LEVEL, altitudeScale);
    return addUnsignedClamped(QUANTIZED_SEA_LEVEL, delta);
  }

  const delta = multiplyUint32ByQ24(QUANTIZED_SEA_LEVEL - altitude, altitudeScale);
  return subtractUnsignedClamped(QUANTIZED_SEA_LEVEL, delta);
}

function getLatitudeTableQuantizedValue(index: number): number {
  return (LATITUDE_TABLE_START_INDEX + index) * LATITUDE_TABLE_COORDINATE_STEP;
}

function getWebGLProjectionSource(positions: GPUDataEvaluator, output: GPUDataEvaluator): string {
  return getGLSLProjectionShaderSource({
    positions,
    output,
    extraPrecision: 'precision highp usampler2D;',
    uniforms: `uniform highp usampler2D latitudeTable;
uniform highp usampler2D altitudeScaleTable;`,
    projectedExpression:
      output.size === 3
        ? 'projectPosition(longitude, latitude, altitude)'
        : 'projectPosition(longitude, latitude)',
    projectionFunctions: getGLSLWebMercatorProjectionFunctions(output.size)
  });
}

function getGLSLWebMercatorProjectionFunctions(outputSize: number): string {
  return /* glsl */ `
uint readLatitudeTable(int index) {
  return texelFetch(
    latitudeTable,
    ivec2(index % ${LATITUDE_TABLE_TEXTURE_WIDTH}, index / ${LATITUDE_TABLE_TEXTURE_WIDTH}),
    0
  ).r;
}

uint readAltitudeScaleTable(int index) {
  return texelFetch(
    altitudeScaleTable,
    ivec2(index % ${LATITUDE_TABLE_TEXTURE_WIDTH}, index / ${LATITUDE_TABLE_TEXTURE_WIDTH}),
    0
  ).r;
}

uint projectAltitude(uint altitude, uint altitudeScale) {
  if (altitude >= ${QUANTIZED_SEA_LEVEL}u) {
    uint delta = multiplyUint32ByQ24(altitude - ${QUANTIZED_SEA_LEVEL}u, altitudeScale);
    return addUnsignedClamped(${QUANTIZED_SEA_LEVEL}u, delta);
  }

  uint delta = multiplyUint32ByQ24(${QUANTIZED_SEA_LEVEL}u - altitude, altitudeScale);
  return subtractUnsignedClamped(${QUANTIZED_SEA_LEVEL}u, delta);
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
  uint y = interpolateCatmullRomUint32(
    readLatitudeTable(baseIndex - 1),
    readLatitudeTable(baseIndex),
    readLatitudeTable(baseIndex + 1),
    readLatitudeTable(baseIndex + 2),
    t
  );
${
  outputSize === 3
    ? `  uint altitudeScale = interpolateCatmullRomUint32(
    readAltitudeScaleTable(baseIndex - 1),
    readAltitudeScaleTable(baseIndex),
    readAltitudeScaleTable(baseIndex + 1),
    readAltitudeScaleTable(baseIndex + 2),
    t
  );
  return uvec3(longitude, y, projectAltitude(altitude, altitudeScale));`
    : '  return uvec2(longitude, y);'
}
}
`;
}

function getWebGPUProjectionSource({
  positions,
  output,
  latitudeTableBindingIndex,
  altitudeScaleTableBindingIndex,
  resultBindingIndex
}: {
  positions: GPUDataEvaluator;
  output: GPUDataEvaluator;
  latitudeTableBindingIndex: number;
  altitudeScaleTableBindingIndex: number;
  resultBindingIndex: number;
}): string {
  return getWGSLProjectionShaderSource({
    positions,
    output,
    resultBindingIndex,
    workgroupSize: PROJECTION_WORKGROUP_SIZE,
    extraBindings: `@group(0) @binding(${latitudeTableBindingIndex}) var<storage, read> latitudeTable: array<u32>;
@group(0) @binding(${altitudeScaleTableBindingIndex}) var<storage, read> altitudeScaleTable: array<u32>;`,
    projectedExpression:
      output.size === 3
        ? 'projectPosition(longitude, latitude, altitude)'
        : 'projectPosition(longitude, latitude)',
    projectionFunctions: getWGSLWebMercatorProjectionFunctions(output.size)
  });
}

function getWGSLWebMercatorProjectionFunctions(outputSize: number): string {
  return /* wgsl */ `
fn projectAltitude(altitude: u32, altitudeScale: u32) -> u32 {
  if (altitude >= ${QUANTIZED_SEA_LEVEL}u) {
    let delta = multiplyUint32ByQ24(altitude - ${QUANTIZED_SEA_LEVEL}u, altitudeScale);
    return addUnsignedClamped(${QUANTIZED_SEA_LEVEL}u, delta);
  }

  let delta = multiplyUint32ByQ24(${QUANTIZED_SEA_LEVEL}u - altitude, altitudeScale);
  return subtractUnsignedClamped(${QUANTIZED_SEA_LEVEL}u, delta);
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
  let y = interpolateCatmullRomUint32(
    latitudeTable[index - 1u],
    latitudeTable[index],
    latitudeTable[index + 1u],
    latitudeTable[index + 2u],
    t
  );
${
  outputSize === 3
    ? `  let altitudeScale = interpolateCatmullRomUint32(
    altitudeScaleTable[index - 1u],
    altitudeScaleTable[index],
    altitudeScaleTable[index + 1u],
    altitudeScaleTable[index + 2u],
    t
  );
  return vec3<u32>(longitude, y, projectAltitude(altitude, altitudeScale));`
    : '  return vec2<u32>(longitude, y);'
}
}
`;
}
