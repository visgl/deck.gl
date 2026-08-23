import {Texture, assert} from '@luma.gl/core';
import {GPUDataEvaluator, Operation, type OperationHandler} from '@luma.gl/gpgpu';
import {
  formatShaderFloat,
  getGLSLProjectionShaderSource,
  getWGSLProjectionShaderSource
} from './projection-shader-utils';
import {
  stereographicProjectionParameters,
  type StereographicProjectionUniforms
} from './projection-parameters';
import {
  PROJECTION_WORKGROUP_SIZE,
  UINT32_MAX,
  addSignedClamped,
  appendQuantizedAltitudeToProjectedPosition,
  appendRawAltitudeToProjectedPosition,
  executeWebGLProjection,
  executeWebGPUProjection,
  getQuantizedPosition,
  getProjectionPositions,
  clamp,
  isInvalidQuantizedPosition,
  makeQuantizedProjectionOutput,
  projectDegrees180ToQuantized,
  quantizeUnitInterval,
  subtractUint32AsNumber,
  unprojectQuantizedDegrees,
  type ProjectionInput,
  type ProjectionOperationInputs
} from './projection-utils';

const RADIANS_PER_DEGREE = Math.PI / 180;
const INVALID_PROJECTED_POSITION: [number, number] = [UINT32_MAX, UINT32_MAX];
const HIDDEN_HEMISPHERE_EPSILON = 1e-6;
const UINT32_RANGE = 0x100000000;
const QUANTIZED_OUTPUT_CENTER = 0x80000000;
const STEREOGRAPHIC_LONGITUDE_TABLE_BITS = 11;
const STEREOGRAPHIC_LONGITUDE_TABLE_SIZE = 2 ** STEREOGRAPHIC_LONGITUDE_TABLE_BITS;
const STEREOGRAPHIC_LONGITUDE_TABLE_MASK = STEREOGRAPHIC_LONGITUDE_TABLE_SIZE - 1;
const STEREOGRAPHIC_LONGITUDE_OCTANT_BITS = STEREOGRAPHIC_LONGITUDE_TABLE_BITS - 3;
const STEREOGRAPHIC_LONGITUDE_OCTANT_SIZE = 2 ** STEREOGRAPHIC_LONGITUDE_OCTANT_BITS;
const STEREOGRAPHIC_LONGITUDE_OCTANT_MASK = STEREOGRAPHIC_LONGITUDE_OCTANT_SIZE - 1;
const STEREOGRAPHIC_LONGITUDE_MIRRORED_TABLE_SIZE = STEREOGRAPHIC_LONGITUDE_OCTANT_SIZE + 1;
const STEREOGRAPHIC_LONGITUDE_TABLE_SHIFT = 32 - STEREOGRAPHIC_LONGITUDE_TABLE_BITS;
const STEREOGRAPHIC_LONGITUDE_TABLE_STEP = 2 ** STEREOGRAPHIC_LONGITUDE_TABLE_SHIFT;
const STEREOGRAPHIC_LONGITUDE_TABLE_HALF_STEP = STEREOGRAPHIC_LONGITUDE_TABLE_STEP / 2;
const STEREOGRAPHIC_LONGITUDE_TABLE_INVERSE_STEP = 1 / STEREOGRAPHIC_LONGITUDE_TABLE_STEP;
const STEREOGRAPHIC_POLAR_LATITUDE_TABLE_CELLS = 2048;
const STEREOGRAPHIC_LATITUDE_MIN_QUANTIZED = projectDegrees180ToQuantized(-90);
const STEREOGRAPHIC_LATITUDE_CENTER_QUANTIZED = projectDegrees180ToQuantized(0);
const STEREOGRAPHIC_LATITUDE_POSITIVE_15_QUANTIZED = projectDegrees180ToQuantized(15);
const STEREOGRAPHIC_LATITUDE_POSITIVE_45_QUANTIZED = projectDegrees180ToQuantized(45);
const STEREOGRAPHIC_LATITUDE_MAX_QUANTIZED = projectDegrees180ToQuantized(90);
const STEREOGRAPHIC_POLAR_LATITUDE_BAND_0_START = 0;
const STEREOGRAPHIC_POLAR_LATITUDE_BAND_1_START = 768;
const STEREOGRAPHIC_POLAR_LATITUDE_BAND_2_START = 1280;
const STEREOGRAPHIC_POLAR_LATITUDE_BAND_0_CELLS = 768;
const STEREOGRAPHIC_POLAR_LATITUDE_BAND_1_CELLS = 512;
const STEREOGRAPHIC_POLAR_LATITUDE_BAND_2_CELLS = 768;
const STEREOGRAPHIC_POLAR_LATITUDE_BAND_0_SCALE =
  STEREOGRAPHIC_POLAR_LATITUDE_BAND_0_CELLS /
  (STEREOGRAPHIC_LATITUDE_POSITIVE_15_QUANTIZED - STEREOGRAPHIC_LATITUDE_CENTER_QUANTIZED);
const STEREOGRAPHIC_POLAR_LATITUDE_BAND_1_SCALE =
  STEREOGRAPHIC_POLAR_LATITUDE_BAND_1_CELLS /
  (STEREOGRAPHIC_LATITUDE_POSITIVE_45_QUANTIZED - STEREOGRAPHIC_LATITUDE_POSITIVE_15_QUANTIZED);
const STEREOGRAPHIC_POLAR_LATITUDE_BAND_2_SCALE =
  STEREOGRAPHIC_POLAR_LATITUDE_BAND_2_CELLS /
  (STEREOGRAPHIC_LATITUDE_MAX_QUANTIZED - STEREOGRAPHIC_LATITUDE_POSITIVE_45_QUANTIZED);
const STEREOGRAPHIC_LATITUDE_FIXED_POINT_BITS = 17;
const STEREOGRAPHIC_LATITUDE_FIXED_POINT_SCALE = 2 ** STEREOGRAPHIC_LATITUDE_FIXED_POINT_BITS;
const STEREOGRAPHIC_LATITUDE_FIXED_POINT_HALF_SCALE = STEREOGRAPHIC_LATITUDE_FIXED_POINT_SCALE / 2;
const STEREOGRAPHIC_LATITUDE_FIXED_POINT_INVERSE_SCALE =
  1 / STEREOGRAPHIC_LATITUDE_FIXED_POINT_SCALE;
const STEREOGRAPHIC_POLAR_LATITUDE_BAND_0_FIXED_POINT_SCALE = Math.round(
  STEREOGRAPHIC_POLAR_LATITUDE_BAND_0_SCALE * 2 ** (32 + STEREOGRAPHIC_LATITUDE_FIXED_POINT_BITS)
);
const STEREOGRAPHIC_POLAR_LATITUDE_BAND_1_FIXED_POINT_SCALE = Math.round(
  STEREOGRAPHIC_POLAR_LATITUDE_BAND_1_SCALE * 2 ** (32 + STEREOGRAPHIC_LATITUDE_FIXED_POINT_BITS)
);
const STEREOGRAPHIC_POLAR_LATITUDE_BAND_2_FIXED_POINT_SCALE = Math.round(
  STEREOGRAPHIC_POLAR_LATITUDE_BAND_2_SCALE * 2 ** (32 + STEREOGRAPHIC_LATITUDE_FIXED_POINT_BITS)
);
const STEREOGRAPHIC_LATITUDE_TABLE_START_INDEX = -1;
const STEREOGRAPHIC_POLAR_LATITUDE_ORIGIN_EPSILON = 1e-9;
const STEREOGRAPHIC_TABLE_VERSION = 'lat-step-v3-octant-lon11';

export type StereographicProjectionParameters = {
  longitudeOrigin?: number;
  latitudeOrigin?: number;
  outputHalfExtent?: number;
};

type StereographicProjectionState = Required<StereographicProjectionParameters> & {
  longitudeOriginQuantized: number;
  latitudeOriginSign: number;
  outputScale: number;
};

type StereographicOperationInputs = ProjectionOperationInputs & {
  parameters: StereographicProjectionState;
  projectedTable: GPUDataEvaluator;
};

type StereographicProjectionTableValues = {
  projectedTableValue: Uint32Array;
  longitudeTableSize: number;
};

type StereographicTableCoordinates = {
  longitudeIndex: number;
  latitudeIndex: number;
  u: number;
  v: number;
};

type StereographicLongitudeTableSample = {
  tableIndex: number;
  swapXY: boolean;
  mirrorX: boolean;
  mirrorY: boolean;
};

const stereographicProjectionTableCache = new Map<string, StereographicProjectionTableValues>();

export const STEREOGRAPHIC_DEFAULT: Required<StereographicProjectionParameters> = {
  longitudeOrigin: 0,
  latitudeOrigin: 90,
  outputHalfExtent: 2
};

class StereographicOperation extends Operation<StereographicOperationInputs> {
  name = 'stereographic';

  output: GPUDataEvaluator;

  constructor(positions: GPUDataEvaluator, parameters: StereographicProjectionState) {
    super({
      positions,
      parameters,
      projectedTable: getProjectedTableEvaluator(parameters)
    });

    this.output = makeQuantizedProjectionOutput('stereographic', positions, this);
  }

  toString(): string {
    return `stereographic(${this.inputs.positions})`;
  }
}

export function stereographic(
  positions: ProjectionInput,
  parameters: StereographicProjectionParameters = STEREOGRAPHIC_DEFAULT
): GPUDataEvaluator {
  return new StereographicOperation(
    getProjectionPositions(positions, 'stereographic'),
    makeStereographicProjectionState(parameters)
  ).output;
}

export function rawStereographic(
  coordinates: readonly [number, number],
  parameters?: StereographicProjectionParameters
): [number, number];
export function rawStereographic(
  coordinates: readonly [number, number, number],
  parameters?: StereographicProjectionParameters
): [number, number, number];
export function rawStereographic(
  coordinates: readonly [number, number] | readonly [number, number, number],
  parameters: StereographicProjectionParameters = STEREOGRAPHIC_DEFAULT
): [number, number] | [number, number, number] {
  return appendRawAltitudeToProjectedPosition(
    projectStereographicToQuantized(
      [coordinates[0], coordinates[1]],
      makeStereographicProjectionState(parameters)
    ),
    coordinates
  );
}

export const executeCPUStereographic: OperationHandler<StereographicOperationInputs> = async ({
  inputs,
  output,
  target
}) => {
  const {positions, parameters, projectedTable} = inputs;
  const positionValues = positions.value ?? (await positions.readValue());
  const projectedTableValues = projectedTable.value as Uint32Array;
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
    const projected = projectQuantizedStereographicToQuantized(
      longitude,
      latitude,
      parameters,
      projectedTableValues
    );
    const projectedPosition = appendQuantizedAltitudeToProjectedPosition(projected, position);
    for (let valueIndex = 0; valueIndex < output.size; valueIndex++) {
      outputValues[outputOffset + valueIndex] = projectedPosition[valueIndex];
    }
  }

  target.write(outputValues);
  return {success: true, value: outputValues};
};

export const executeWebGPUStereographic: OperationHandler<StereographicOperationInputs> = ({
  inputs,
  output,
  target
}) => {
  const {positions, parameters, projectedTable} = inputs;
  return executeWebGPUProjection({
    positions,
    output,
    target,
    extraBindings: [{name: 'projectedTable', table: projectedTable}],
    modules: [stereographicProjectionParameters],
    moduleProps: {stereographicProjection: makeStereographicProjectionUniforms(parameters)},
    getSource: ({resultBindingIndex, getBindingIndex}) =>
      getWebGPUProjectionSource({
        positions,
        output,
        parameters,
        projectedTableBindingIndex: getBindingIndex('projectedTable'),
        resultBindingIndex
      })
  });
};

export const executeWebGLStereographic: OperationHandler<StereographicOperationInputs> = ({
  inputs,
  output,
  target
}) => {
  const {positions, parameters} = inputs;
  const tableValues = getStereographicProjectionTableValues(parameters);
  const projectedTableTexture = target.device.createTexture({
    width: tableValues.longitudeTableSize,
    height: getLatitudeTableLength(),
    format: 'rg32uint',
    usage: Texture.SAMPLE | Texture.COPY_DST,
    data: tableValues.projectedTableValue
  });

  return executeWebGLProjection({
    positions,
    output,
    target,
    source: getWebGLProjectionSource(positions, output, parameters),
    bindings: {projectedTable: projectedTableTexture},
    modules: [stereographicProjectionParameters],
    moduleProps: {stereographicProjection: makeStereographicProjectionUniforms(parameters)},
    resources: [projectedTableTexture]
  });
};

function makeStereographicProjectionState(
  parameters: StereographicProjectionParameters
): StereographicProjectionState {
  const longitudeOrigin = parameters.longitudeOrigin ?? STEREOGRAPHIC_DEFAULT.longitudeOrigin;
  const latitudeOrigin = parameters.latitudeOrigin ?? STEREOGRAPHIC_DEFAULT.latitudeOrigin;
  const outputHalfExtent = parameters.outputHalfExtent ?? STEREOGRAPHIC_DEFAULT.outputHalfExtent;

  assert(
    isPolarLatitudeOrigin(latitudeOrigin),
    'stereographic currently supports only polar latitudeOrigin values: use 90 or -90'
  );

  return {
    longitudeOrigin,
    latitudeOrigin,
    outputHalfExtent,
    longitudeOriginQuantized: projectDegrees180ToQuantized(longitudeOrigin),
    latitudeOriginSign: latitudeOrigin > 0 ? 1 : -1,
    outputScale: 1 / (2 * outputHalfExtent)
  };
}

function isPolarLatitudeOrigin(latitudeOrigin: number): boolean {
  return Math.abs(Math.abs(latitudeOrigin) - 90) < STEREOGRAPHIC_POLAR_LATITUDE_ORIGIN_EPSILON;
}

function projectStereographicToQuantized(
  [longitude, latitude]: readonly [number, number],
  parameters: StereographicProjectionState
): [number, number] {
  const deltaLongitudeRadians =
    wrapLongitudeDeltaDegrees(longitude - parameters.longitudeOrigin) * RADIANS_PER_DEGREE;
  const latitudeRadians = latitude * RADIANS_PER_DEGREE;
  return projectStereographicRadiansToQuantized(deltaLongitudeRadians, latitudeRadians, parameters);
}

function projectQuantizedStereographicToQuantized(
  longitude: number,
  latitude: number,
  parameters: StereographicProjectionState,
  projectedTableValue: Uint32Array
): [number, number] {
  const longitudePhase = getQuantizedPhase(longitude, parameters.longitudeOriginQuantized);
  if (getQuantizedStereographicVisibilityDot(latitude, parameters) < -HIDDEN_HEMISPHERE_EPSILON) {
    return INVALID_PROJECTED_POSITION;
  }

  const tableCoordinates = getStereographicTableCoordinates(longitudePhase, latitude, parameters);
  return makeValidProjectedPosition(
    evaluateUint32TableTaylor(tableCoordinates, projectedTableValue, parameters, 0),
    evaluateUint32TableTaylor(tableCoordinates, projectedTableValue, parameters, 1)
  );
}

function projectStereographicRadiansToQuantized(
  deltaLongitudeRadians: number,
  latitudeRadians: number,
  parameters: StereographicProjectionState
): [number, number] {
  const sample = getStereographicProjectionSample(
    deltaLongitudeRadians,
    latitudeRadians,
    parameters
  );
  if (sample.dot < -HIDDEN_HEMISPHERE_EPSILON) {
    return INVALID_PROJECTED_POSITION;
  }
  return sample.projected;
}

function getStereographicProjectionSample(
  deltaLongitudeRadians: number,
  latitudeRadians: number,
  parameters: StereographicProjectionState
): {dot: number; projected: [number, number]} {
  const sineLatitude = Math.sin(latitudeRadians);
  const cosineLatitude = Math.cos(latitudeRadians);
  const dot = parameters.latitudeOriginSign * sineLatitude;

  const projectedScale = getProjectedScaleAnalytic(dot, parameters.outputScale);
  const x = projectedScale * cosineLatitude * Math.sin(deltaLongitudeRadians);
  const y =
    -parameters.latitudeOriginSign *
    projectedScale *
    cosineLatitude *
    Math.cos(deltaLongitudeRadians);

  return {
    dot,
    projected: makeValidProjectedPosition(
      projectScaledCoordinateToQuantized(x),
      projectScaledCoordinateToQuantized(y)
    )
  };
}

function getProjectedScaleAnalytic(dot: number, outputScale: number): number {
  return (2 / (1 + dot)) * outputScale;
}

function getQuantizedStereographicVisibilityDot(
  latitude: number,
  parameters: StereographicProjectionState
): number {
  const latitudeRadians = unprojectQuantizedDegrees(latitude) * RADIANS_PER_DEGREE;
  return parameters.latitudeOriginSign * Math.sin(latitudeRadians);
}

function projectScaledCoordinateToQuantized(value: number): number {
  if (Number.isNaN(value)) {
    return quantizeUnitInterval(0.5);
  }
  if (value === Infinity) {
    return UINT32_MAX;
  }
  if (value === -Infinity) {
    return 0;
  }
  return quantizeUnitInterval(0.5 + value);
}

function makeValidProjectedPosition(x: number, y: number): [number, number] {
  if (x === UINT32_MAX && y === UINT32_MAX) {
    return [UINT32_MAX - 1, UINT32_MAX];
  }
  return [x, y];
}

function wrapLongitudeDeltaDegrees(deltaDegrees: number): number {
  if (deltaDegrees < -180) {
    return deltaDegrees + 360;
  }
  if (deltaDegrees > 180) {
    return deltaDegrees - 360;
  }
  return deltaDegrees;
}

function getQuantizedPhase(value: number, origin: number): number {
  return (value - origin) >>> 0;
}

function getProjectedTableEvaluator(parameters: StereographicProjectionState): GPUDataEvaluator {
  return GPUDataEvaluator.fromArray(
    getStereographicProjectionTableValues(parameters).projectedTableValue,
    {type: 'uint32', size: 2}
  );
}

function getStereographicProjectionTableValues(
  parameters: StereographicProjectionState
): StereographicProjectionTableValues {
  const key = `${STEREOGRAPHIC_TABLE_VERSION}:${parameters.latitudeOriginSign}:${parameters.outputScale}`;
  const cached = stereographicProjectionTableCache.get(key);
  if (cached) {
    return cached;
  }

  const longitudeTableSize = getStereographicLongitudeTableSize();
  const latitudeTableLength = getLatitudeTableLength();
  const projectedTableValue = new Uint32Array(longitudeTableSize * latitudeTableLength * 2);

  for (let latitudeRowIndex = 0; latitudeRowIndex < latitudeTableLength; latitudeRowIndex++) {
    const latitudeIndex = STEREOGRAPHIC_LATITUDE_TABLE_START_INDEX + latitudeRowIndex;
    const latitude = getStereographicTableLatitude(latitudeIndex, parameters);
    for (let longitudeIndex = 0; longitudeIndex < longitudeTableSize; longitudeIndex++) {
      const tableIndex = latitudeRowIndex * longitudeTableSize + longitudeIndex;
      const sample = getStereographicProjectionSample(
        getStereographicTableLongitudeRadians(longitudeIndex),
        latitude,
        parameters
      );
      projectedTableValue[tableIndex * 2] = sample.projected[0];
      projectedTableValue[tableIndex * 2 + 1] = sample.projected[1];
    }
  }

  const tableValues = {projectedTableValue, longitudeTableSize};
  stereographicProjectionTableCache.set(key, tableValues);
  return tableValues;
}

function getStereographicLongitudeTableSize(): number {
  return STEREOGRAPHIC_LONGITUDE_MIRRORED_TABLE_SIZE;
}

function getLatitudeTableLength(): number {
  return STEREOGRAPHIC_POLAR_LATITUDE_TABLE_CELLS + 3;
}

function getLongitudeTableSample(
  longitudeIndex: number,
  parameters: StereographicProjectionState
): StereographicLongitudeTableSample {
  const wrappedIndex =
    (longitudeIndex + STEREOGRAPHIC_LONGITUDE_TABLE_SIZE) & STEREOGRAPHIC_LONGITUDE_TABLE_MASK;

  const octant = wrappedIndex >>> STEREOGRAPHIC_LONGITUDE_OCTANT_BITS;
  const octantIndex = wrappedIndex & STEREOGRAPHIC_LONGITUDE_OCTANT_MASK;
  const mirrorAngle = octant % 2 === 1;
  return {
    tableIndex: mirrorAngle ? STEREOGRAPHIC_LONGITUDE_OCTANT_SIZE - octantIndex : octantIndex,
    swapXY: octant === 1 || octant === 2 || octant === 5 || octant === 6,
    mirrorX:
      parameters.latitudeOriginSign > 0
        ? octant === 1 || octant === 2 || octant === 4 || octant === 7
        : octant === 4 || octant === 5 || octant === 6 || octant === 7,
    mirrorY:
      parameters.latitudeOriginSign > 0
        ? octant === 1 || octant === 3 || octant === 4 || octant === 6
        : octant === 2 || octant === 3 || octant === 4 || octant === 5
  };
}

function mirrorProjectedCoordinate(value: number): number {
  if (value >= QUANTIZED_OUTPUT_CENTER) {
    return QUANTIZED_OUTPUT_CENTER - (value - QUANTIZED_OUTPUT_CENTER);
  }
  return Math.min(UINT32_MAX, QUANTIZED_OUTPUT_CENTER + (QUANTIZED_OUTPUT_CENTER - value));
}

function getStereographicTableCoordinates(
  longitudePhase: number,
  latitude: number,
  parameters: StereographicProjectionState
): StereographicTableCoordinates {
  const roundedLongitude = (longitudePhase + STEREOGRAPHIC_LONGITUDE_TABLE_HALF_STEP) >>> 0;
  const longitudeIndex =
    (roundedLongitude >>> STEREOGRAPHIC_LONGITUDE_TABLE_SHIFT) & STEREOGRAPHIC_LONGITUDE_TABLE_MASK;
  const longitudeCenter = longitudeIndex * STEREOGRAPHIC_LONGITUDE_TABLE_STEP;
  const u =
    getWrappedUint32Delta(longitudePhase, longitudeCenter) *
    STEREOGRAPHIC_LONGITUDE_TABLE_INVERSE_STEP;

  const clampedLatitude = clamp(
    latitude,
    getLatitudeTableMin(parameters),
    getLatitudeTableMax(parameters)
  );
  const latitudeCoordinate = getLatitudeTableCoordinate(clampedLatitude, parameters);
  const latitudeIndex = clamp(
    Math.floor(latitudeCoordinate + 0.5),
    getLatitudeTableIndexMin(),
    getLatitudeTableIndexMax()
  );
  const v = latitudeCoordinate - latitudeIndex;

  return {longitudeIndex, latitudeIndex, u, v};
}

function getLatitudeTableCoordinate(
  latitude: number,
  parameters: StereographicProjectionState
): number {
  return getPolarLatitudeTableCoordinate(latitude, parameters);
}

function getPolarLatitudeTableCoordinate(
  latitude: number,
  parameters: StereographicProjectionState
): number {
  const northLatitude =
    parameters.latitudeOriginSign > 0 ? latitude : mirrorLatitudeQuantized(latitude);

  if (northLatitude < STEREOGRAPHIC_LATITUDE_POSITIVE_15_QUANTIZED) {
    return (
      STEREOGRAPHIC_POLAR_LATITUDE_BAND_0_START +
      (northLatitude - STEREOGRAPHIC_LATITUDE_CENTER_QUANTIZED) *
        STEREOGRAPHIC_POLAR_LATITUDE_BAND_0_SCALE
    );
  }

  if (northLatitude < STEREOGRAPHIC_LATITUDE_POSITIVE_45_QUANTIZED) {
    return (
      STEREOGRAPHIC_POLAR_LATITUDE_BAND_1_START +
      (northLatitude - STEREOGRAPHIC_LATITUDE_POSITIVE_15_QUANTIZED) *
        STEREOGRAPHIC_POLAR_LATITUDE_BAND_1_SCALE
    );
  }

  return (
    STEREOGRAPHIC_POLAR_LATITUDE_BAND_2_START +
    (northLatitude - STEREOGRAPHIC_LATITUDE_POSITIVE_45_QUANTIZED) *
      STEREOGRAPHIC_POLAR_LATITUDE_BAND_2_SCALE
  );
}

function getWrappedUint32Delta(value: number, center: number): number {
  const delta = (value - center) >>> 0;
  return delta > 0x80000000 ? -(UINT32_RANGE - delta) : delta;
}

function getStereographicTableLatitude(
  latitudeIndex: number,
  parameters: StereographicProjectionState
): number {
  const latitudeQuantized = getStereographicTableLatitudeQuantized(latitudeIndex, parameters);
  return unprojectQuantizedDegrees(latitudeQuantized) * RADIANS_PER_DEGREE;
}

function getStereographicTableLatitudeQuantized(
  latitudeIndex: number,
  parameters: StereographicProjectionState
): number {
  const northLatitude = getPolarNorthTableLatitudeQuantized(latitudeIndex);
  return parameters.latitudeOriginSign > 0 ? northLatitude : mirrorLatitudeQuantized(northLatitude);
}

function getPolarNorthTableLatitudeQuantized(latitudeIndex: number): number {
  if (latitudeIndex < STEREOGRAPHIC_POLAR_LATITUDE_BAND_1_START) {
    return (
      STEREOGRAPHIC_LATITUDE_CENTER_QUANTIZED +
      (latitudeIndex - STEREOGRAPHIC_POLAR_LATITUDE_BAND_0_START) /
        STEREOGRAPHIC_POLAR_LATITUDE_BAND_0_SCALE
    );
  }

  if (latitudeIndex < STEREOGRAPHIC_POLAR_LATITUDE_BAND_2_START) {
    return (
      STEREOGRAPHIC_LATITUDE_POSITIVE_15_QUANTIZED +
      (latitudeIndex - STEREOGRAPHIC_POLAR_LATITUDE_BAND_1_START) /
        STEREOGRAPHIC_POLAR_LATITUDE_BAND_1_SCALE
    );
  }

  return (
    STEREOGRAPHIC_LATITUDE_POSITIVE_45_QUANTIZED +
    (latitudeIndex - STEREOGRAPHIC_POLAR_LATITUDE_BAND_2_START) /
      STEREOGRAPHIC_POLAR_LATITUDE_BAND_2_SCALE
  );
}

function getLatitudeTableMin(parameters: StereographicProjectionState): number {
  return parameters.latitudeOriginSign > 0
    ? STEREOGRAPHIC_LATITUDE_CENTER_QUANTIZED
    : STEREOGRAPHIC_LATITUDE_MIN_QUANTIZED;
}

function getLatitudeTableMax(parameters: StereographicProjectionState): number {
  return parameters.latitudeOriginSign > 0
    ? STEREOGRAPHIC_LATITUDE_MAX_QUANTIZED
    : STEREOGRAPHIC_LATITUDE_CENTER_QUANTIZED;
}

function getLatitudeTableIndexMin(): number {
  return 1;
}

function getLatitudeTableIndexMax(): number {
  return STEREOGRAPHIC_POLAR_LATITUDE_TABLE_CELLS - 1;
}

function mirrorLatitudeQuantized(latitude: number): number {
  return (
    STEREOGRAPHIC_LATITUDE_CENTER_QUANTIZED - (latitude - STEREOGRAPHIC_LATITUDE_CENTER_QUANTIZED)
  );
}

function getStereographicTableLongitudeRadians(longitudeIndex: number): number {
  return ((longitudeIndex * STEREOGRAPHIC_LONGITUDE_TABLE_STEP) / UINT32_RANGE) * 2 * Math.PI;
}

function evaluateUint32TableTaylor(
  coordinates: StereographicTableCoordinates,
  tableValue: Uint32Array,
  parameters: StereographicProjectionState,
  componentIndex: number
): number {
  const f00 = readProjectedTableValue(tableValue, coordinates, parameters, 0, 0, componentIndex);
  const fp0 = readProjectedTableValue(tableValue, coordinates, parameters, 1, 0, componentIndex);
  const fm0 = readProjectedTableValue(tableValue, coordinates, parameters, -1, 0, componentIndex);
  const f0p = readProjectedTableValue(tableValue, coordinates, parameters, 0, 1, componentIndex);
  const f0m = readProjectedTableValue(tableValue, coordinates, parameters, 0, -1, componentIndex);
  const fpp = readProjectedTableValue(tableValue, coordinates, parameters, 1, 1, componentIndex);
  const fpm = readProjectedTableValue(tableValue, coordinates, parameters, 1, -1, componentIndex);
  const fmp = readProjectedTableValue(tableValue, coordinates, parameters, -1, 1, componentIndex);
  const fmm = readProjectedTableValue(tableValue, coordinates, parameters, -1, -1, componentIndex);
  const fx = subtractUint32AsNumber(fp0, fm0) / 2;
  const fxx = subtractUint32AsNumber(fp0, f00) + subtractUint32AsNumber(fm0, f00);
  let fy: number;
  let fyy: number;
  let fxy: number;
  if (isLatitudeBandBoundary(coordinates.latitudeIndex)) {
    if (coordinates.v >= 0) {
      const f0pp = readProjectedTableValue(
        tableValue,
        coordinates,
        parameters,
        0,
        2,
        componentIndex
      );
      fy = 2 * subtractUint32AsNumber(f0p, f00) - 0.5 * subtractUint32AsNumber(f0pp, f00);
      fyy = subtractUint32AsNumber(f0pp, f00) - 2 * subtractUint32AsNumber(f0p, f00);
      fxy = (subtractUint32AsNumber(fpp, fmp) - subtractUint32AsNumber(fp0, fm0)) / 2;
    } else {
      const f0mm = readProjectedTableValue(
        tableValue,
        coordinates,
        parameters,
        0,
        -2,
        componentIndex
      );
      fy = 2 * subtractUint32AsNumber(f00, f0m) - 0.5 * subtractUint32AsNumber(f00, f0mm);
      fyy = subtractUint32AsNumber(f00, f0m) + subtractUint32AsNumber(f0mm, f0m);
      fxy = (subtractUint32AsNumber(fp0, fm0) - subtractUint32AsNumber(fpm, fmm)) / 2;
    }
  } else {
    fy = subtractUint32AsNumber(f0p, f0m) / 2;
    fyy = subtractUint32AsNumber(f0p, f00) + subtractUint32AsNumber(f0m, f00);
    fxy = (subtractUint32AsNumber(fpp, fpm) - subtractUint32AsNumber(fmp, fmm)) / 4;
  }
  const {u, v} = coordinates;
  const correction = fx * u + fy * v + 0.5 * fxx * u * u + fxy * u * v + 0.5 * fyy * v * v;

  return addSignedClamped(f00, Math.round(correction));
}

function readProjectedTableValue(
  tableValue: Uint32Array,
  coordinates: StereographicTableCoordinates,
  parameters: StereographicProjectionState,
  longitudeOffset: number,
  latitudeOffset: number,
  componentIndex: number
): number {
  const longitudeSample = getLongitudeTableSample(
    coordinates.longitudeIndex + longitudeOffset,
    parameters
  );
  const tableIndex = getStereographicTableIndex(
    longitudeSample.tableIndex,
    coordinates.latitudeIndex,
    latitudeOffset,
    getStereographicLongitudeTableSize()
  );
  let x = tableValue[tableIndex * 2];
  let y = tableValue[tableIndex * 2 + 1];
  if (longitudeSample.swapXY) {
    [x, y] = [y, x];
  }
  if (longitudeSample.mirrorX) {
    x = mirrorProjectedCoordinate(x);
  }
  if (longitudeSample.mirrorY) {
    y = mirrorProjectedCoordinate(y);
  }
  return componentIndex === 0 ? x : y;
}

function getStereographicTableIndex(
  longitudeIndex: number,
  latitudeIndex: number,
  latitudeOffset: number,
  longitudeTableSize: number
): number {
  const latitudeRow = latitudeIndex + latitudeOffset - STEREOGRAPHIC_LATITUDE_TABLE_START_INDEX;
  return latitudeRow * longitudeTableSize + longitudeIndex;
}

function makeStereographicProjectionUniforms(
  parameters: StereographicProjectionState
): StereographicProjectionUniforms {
  return {
    projectionParameters: [parameters.latitudeOriginSign, 0, HIDDEN_HEMISPHERE_EPSILON, 0],
    coordinateParameters: [parameters.longitudeOriginQuantized, 0, 0, 0]
  };
}

function isLatitudeBandBoundary(latitudeIndex: number): boolean {
  return (
    latitudeIndex === STEREOGRAPHIC_POLAR_LATITUDE_BAND_1_START ||
    latitudeIndex === STEREOGRAPHIC_POLAR_LATITUDE_BAND_2_START
  );
}

function getWebGLProjectionSource(
  positions: GPUDataEvaluator,
  output: GPUDataEvaluator,
  parameters: StereographicProjectionState
): string {
  return getGLSLProjectionShaderSource({
    positions,
    output,
    extraPrecision: 'precision highp usampler2D;',
    uniforms: 'uniform highp usampler2D projectedTable;',
    projectedExpression:
      output.size === 3
        ? 'projectStereographic(longitude, latitude, altitude)'
        : 'projectStereographic(longitude, latitude)',
    projectionFunctions: getGLSLStereographicProjectionFunctions(parameters, output.size)
  });
}

function getWebGPUProjectionSource({
  positions,
  output,
  parameters,
  projectedTableBindingIndex,
  resultBindingIndex
}: {
  positions: GPUDataEvaluator;
  output: GPUDataEvaluator;
  parameters: StereographicProjectionState;
  projectedTableBindingIndex: number;
  resultBindingIndex: number;
}): string {
  return getWGSLProjectionShaderSource({
    positions,
    output,
    resultBindingIndex,
    workgroupSize: PROJECTION_WORKGROUP_SIZE,
    extraBindings: `@group(0) @binding(${projectedTableBindingIndex}) var<storage, read> projectedTable: array<u32>;`,
    projectedExpression:
      output.size === 3
        ? 'projectStereographic(longitude, latitude, altitude)'
        : 'projectStereographic(longitude, latitude)',
    projectionFunctions: getWGSLStereographicProjectionFunctions(parameters, output.size)
  });
}

function getGLSLLatitudeTableFunctions(parameters: StereographicProjectionState): string {
  const tableIndexMin = getLatitudeTableIndexMin();
  const tableIndexMax = getLatitudeTableIndexMax();
  const tableMin = getLatitudeTableMin(parameters);
  const tableMax = getLatitudeTableMax(parameters);
  const northLatitudeExpression =
    parameters.latitudeOriginSign > 0
      ? 'clampedLatitude'
      : 'mirrorLatitudeQuantized(clampedLatitude)';

  return /* glsl */ `
StereographicLatitudeCoordinate makeLatitudeTableCoordinate(
  int bandStart,
  uint quantizedLatitudeDelta,
  uint fixedPointScale
) {
  uint fixedPointCoordinate = multiplyUint32ByQuantizedScale(
    quantizedLatitudeDelta,
    fixedPointScale
  );
  int localIndex = int(
    (fixedPointCoordinate + ${STEREOGRAPHIC_LATITUDE_FIXED_POINT_HALF_SCALE}u) >>
      ${STEREOGRAPHIC_LATITUDE_FIXED_POINT_BITS}u
  );
  int latitudeIndex = clamp(
    localIndex + bandStart,
    ${tableIndexMin},
    ${tableIndexMax}
  );
  int clampedLocalIndex = latitudeIndex - bandStart;
  int fixedPointResidual =
    int(fixedPointCoordinate) -
    clampedLocalIndex * ${STEREOGRAPHIC_LATITUDE_FIXED_POINT_SCALE};
  return StereographicLatitudeCoordinate(
    latitudeIndex,
    float(fixedPointResidual) * ${formatShaderFloat(STEREOGRAPHIC_LATITUDE_FIXED_POINT_INVERSE_SCALE)}
  );
}

uint mirrorLatitudeQuantized(uint latitude) {
  if (latitude >= ${STEREOGRAPHIC_LATITUDE_CENTER_QUANTIZED}u) {
    return ${STEREOGRAPHIC_LATITUDE_CENTER_QUANTIZED}u -
      (latitude - ${STEREOGRAPHIC_LATITUDE_CENTER_QUANTIZED}u);
  }
  return ${STEREOGRAPHIC_LATITUDE_CENTER_QUANTIZED}u +
    (${STEREOGRAPHIC_LATITUDE_CENTER_QUANTIZED}u - latitude);
}

StereographicLatitudeCoordinate getLatitudeTableCoordinate(uint latitude) {
  uint clampedLatitude = clamp(latitude, ${tableMin}u, ${tableMax}u);
  uint northLatitude = ${northLatitudeExpression};
  if (northLatitude < ${STEREOGRAPHIC_LATITUDE_POSITIVE_15_QUANTIZED}u) {
    return makeLatitudeTableCoordinate(
      ${STEREOGRAPHIC_POLAR_LATITUDE_BAND_0_START},
      northLatitude - ${STEREOGRAPHIC_LATITUDE_CENTER_QUANTIZED}u,
      ${STEREOGRAPHIC_POLAR_LATITUDE_BAND_0_FIXED_POINT_SCALE}u
    );
  }
  if (northLatitude < ${STEREOGRAPHIC_LATITUDE_POSITIVE_45_QUANTIZED}u) {
    return makeLatitudeTableCoordinate(
      ${STEREOGRAPHIC_POLAR_LATITUDE_BAND_1_START},
      northLatitude - ${STEREOGRAPHIC_LATITUDE_POSITIVE_15_QUANTIZED}u,
      ${STEREOGRAPHIC_POLAR_LATITUDE_BAND_1_FIXED_POINT_SCALE}u
    );
  }
  return makeLatitudeTableCoordinate(
    ${STEREOGRAPHIC_POLAR_LATITUDE_BAND_2_START},
    northLatitude - ${STEREOGRAPHIC_LATITUDE_POSITIVE_45_QUANTIZED}u,
    ${STEREOGRAPHIC_POLAR_LATITUDE_BAND_2_FIXED_POINT_SCALE}u
  );
}
`;
}

function getWGSLLatitudeTableFunctions(parameters: StereographicProjectionState): string {
  const tableIndexMin = getLatitudeTableIndexMin();
  const tableIndexMax = getLatitudeTableIndexMax();
  const tableMin = getLatitudeTableMin(parameters);
  const tableMax = getLatitudeTableMax(parameters);
  const northLatitudeExpression =
    parameters.latitudeOriginSign > 0
      ? 'clampedLatitude'
      : 'mirrorLatitudeQuantized(clampedLatitude)';

  return /* wgsl */ `
fn makeLatitudeTableCoordinate(
  bandStart: i32,
  quantizedLatitudeDelta: u32,
  fixedPointScale: u32
) -> StereographicLatitudeCoordinate {
  let fixedPointCoordinate = multiplyUint32ByQuantizedScale(
    quantizedLatitudeDelta,
    fixedPointScale
  );
  let localIndex = i32(
    (fixedPointCoordinate + ${STEREOGRAPHIC_LATITUDE_FIXED_POINT_HALF_SCALE}u) >>
      ${STEREOGRAPHIC_LATITUDE_FIXED_POINT_BITS}u
  );
  let latitudeIndex = clamp(
    localIndex + bandStart,
    ${tableIndexMin},
    ${tableIndexMax}
  );
  let clampedLocalIndex = latitudeIndex - bandStart;
  let fixedPointResidual =
    i32(fixedPointCoordinate) -
    clampedLocalIndex * ${STEREOGRAPHIC_LATITUDE_FIXED_POINT_SCALE};
  return StereographicLatitudeCoordinate(
    latitudeIndex,
    f32(fixedPointResidual) * ${formatShaderFloat(STEREOGRAPHIC_LATITUDE_FIXED_POINT_INVERSE_SCALE)}
  );
}

fn mirrorLatitudeQuantized(latitude: u32) -> u32 {
  if (latitude >= ${STEREOGRAPHIC_LATITUDE_CENTER_QUANTIZED}u) {
    return ${STEREOGRAPHIC_LATITUDE_CENTER_QUANTIZED}u -
      (latitude - ${STEREOGRAPHIC_LATITUDE_CENTER_QUANTIZED}u);
  }
  return ${STEREOGRAPHIC_LATITUDE_CENTER_QUANTIZED}u +
    (${STEREOGRAPHIC_LATITUDE_CENTER_QUANTIZED}u - latitude);
}

fn getLatitudeTableCoordinate(latitude: u32) -> StereographicLatitudeCoordinate {
  let clampedLatitude = clamp(latitude, ${tableMin}u, ${tableMax}u);
  let northLatitude = ${northLatitudeExpression};
  if (northLatitude < ${STEREOGRAPHIC_LATITUDE_POSITIVE_15_QUANTIZED}u) {
    return makeLatitudeTableCoordinate(
      ${STEREOGRAPHIC_POLAR_LATITUDE_BAND_0_START},
      northLatitude - ${STEREOGRAPHIC_LATITUDE_CENTER_QUANTIZED}u,
      ${STEREOGRAPHIC_POLAR_LATITUDE_BAND_0_FIXED_POINT_SCALE}u
    );
  }
  if (northLatitude < ${STEREOGRAPHIC_LATITUDE_POSITIVE_45_QUANTIZED}u) {
    return makeLatitudeTableCoordinate(
      ${STEREOGRAPHIC_POLAR_LATITUDE_BAND_1_START},
      northLatitude - ${STEREOGRAPHIC_LATITUDE_POSITIVE_15_QUANTIZED}u,
      ${STEREOGRAPHIC_POLAR_LATITUDE_BAND_1_FIXED_POINT_SCALE}u
    );
  }
  return makeLatitudeTableCoordinate(
    ${STEREOGRAPHIC_POLAR_LATITUDE_BAND_2_START},
    northLatitude - ${STEREOGRAPHIC_LATITUDE_POSITIVE_45_QUANTIZED}u,
    ${STEREOGRAPHIC_POLAR_LATITUDE_BAND_2_FIXED_POINT_SCALE}u
  );
}
`;
}

function getGLSLStereographicProjectionFunctions(
  parameters: StereographicProjectionState,
  outputSize: number
): string {
  const mirrorXExpression =
    parameters.latitudeOriginSign > 0
      ? 'octant == 1 || octant == 2 || octant == 4 || octant == 7'
      : 'octant == 4 || octant == 5 || octant == 6 || octant == 7';
  const mirrorYExpression =
    parameters.latitudeOriginSign > 0
      ? 'octant == 1 || octant == 3 || octant == 4 || octant == 6'
      : 'octant == 2 || octant == 3 || octant == 4 || octant == 5';
  const longitudeTableFunctions = /* glsl */ `
struct LongitudeTableSample {
  int tableIndex;
  bool swapXY;
  bool mirrorX;
  bool mirrorY;
};

LongitudeTableSample getLongitudeTableSample(int index) {
  int wrappedIndex = (index + ${STEREOGRAPHIC_LONGITUDE_TABLE_SIZE}) & ${STEREOGRAPHIC_LONGITUDE_TABLE_MASK};
  int octant = wrappedIndex >> ${STEREOGRAPHIC_LONGITUDE_OCTANT_BITS};
  int octantIndex = wrappedIndex & ${STEREOGRAPHIC_LONGITUDE_OCTANT_MASK};
  bool mirrorAngle = (octant & 1) == 1;
  return LongitudeTableSample(
    mirrorAngle ? ${STEREOGRAPHIC_LONGITUDE_OCTANT_SIZE} - octantIndex : octantIndex,
    octant == 1 || octant == 2 || octant == 5 || octant == 6,
    ${mirrorXExpression},
    ${mirrorYExpression}
  );
}
`;
  const latitudeTableFunctions = getGLSLLatitudeTableFunctions(parameters);
  return /* glsl */ `
struct StereographicTableCoordinate {
  int longitudeIndex;
  int latitudeIndex;
  float u;
  float v;
};

struct StereographicLatitudeCoordinate {
  int index;
  float v;
};

${longitudeTableFunctions}

${latitudeTableFunctions}

uint mirrorProjectedCoordinate(uint value) {
  if (value >= ${QUANTIZED_OUTPUT_CENTER}u) {
    return subtractUnsignedClamped(${QUANTIZED_OUTPUT_CENTER}u, value - ${QUANTIZED_OUTPUT_CENTER}u);
  }
  return addUnsignedClamped(${QUANTIZED_OUTPUT_CENTER}u, ${QUANTIZED_OUTPUT_CENTER}u - value);
}

uvec2 readProjectedTable(int longitudeIndex, int latitudeIndex) {
  LongitudeTableSample longitudeSample = getLongitudeTableSample(longitudeIndex);
  uvec2 value = texelFetch(
    projectedTable,
    ivec2(
      longitudeSample.tableIndex,
      latitudeIndex - ${STEREOGRAPHIC_LATITUDE_TABLE_START_INDEX}
    ),
    0
  ).rg;
  if (longitudeSample.swapXY) {
    value = value.yx;
  }
  if (longitudeSample.mirrorX) {
    value.x = mirrorProjectedCoordinate(value.x);
  }
  if (longitudeSample.mirrorY) {
    value.y = mirrorProjectedCoordinate(value.y);
  }
  return value;
}

uint getProjectedComponent(uvec2 value, int componentIndex) {
  return componentIndex == 0 ? value.x : value.y;
}

bool isLatitudeBandBoundary(int latitudeIndex) {
  return
    latitudeIndex == ${STEREOGRAPHIC_POLAR_LATITUDE_BAND_1_START} ||
    latitudeIndex == ${STEREOGRAPHIC_POLAR_LATITUDE_BAND_2_START};
}

float getWrappedLongitudeDelta(uint value, uint center) {
  uint delta = value - center;
  if (delta > 0x80000000u) {
    return -float(0u - delta);
  }
  return float(delta);
}

float getStereographicVisibilityDot(uint latitude) {
  float latitudeRadians = quantizedDegreesToFloat(latitude) * ${formatShaderFloat(RADIANS_PER_DEGREE)};
  return stereographicProjection.projectionParameters.x * sin(latitudeRadians);
}

StereographicTableCoordinate getStereographicTableCoordinate(uint longitude, uint latitude) {
  uint longitudePhase = longitude - stereographicProjection.coordinateParameters.x;
  uint roundedLongitude = longitudePhase + ${STEREOGRAPHIC_LONGITUDE_TABLE_HALF_STEP}u;
  int longitudeIndex = int(
    (roundedLongitude >> ${STEREOGRAPHIC_LONGITUDE_TABLE_SHIFT}u) &
      ${STEREOGRAPHIC_LONGITUDE_TABLE_MASK}u
  );
  uint longitudeCenter = uint(longitudeIndex) << ${STEREOGRAPHIC_LONGITUDE_TABLE_SHIFT}u;
  float u = getWrappedLongitudeDelta(longitudePhase, longitudeCenter) *
    ${formatShaderFloat(STEREOGRAPHIC_LONGITUDE_TABLE_INVERSE_STEP)};

  StereographicLatitudeCoordinate latitudeCoordinate = getLatitudeTableCoordinate(latitude);

  return StereographicTableCoordinate(
    longitudeIndex,
    latitudeCoordinate.index,
    u,
    latitudeCoordinate.v
  );
}

uint evaluateProjectedComponent(StereographicTableCoordinate coordinates, int componentIndex) {
  uint f00 = getProjectedComponent(readProjectedTable(coordinates.longitudeIndex, coordinates.latitudeIndex), componentIndex);
  uint fp0 = getProjectedComponent(readProjectedTable(coordinates.longitudeIndex + 1, coordinates.latitudeIndex), componentIndex);
  uint fm0 = getProjectedComponent(readProjectedTable(coordinates.longitudeIndex - 1, coordinates.latitudeIndex), componentIndex);
  uint f0p = getProjectedComponent(readProjectedTable(coordinates.longitudeIndex, coordinates.latitudeIndex + 1), componentIndex);
  uint f0m = getProjectedComponent(readProjectedTable(coordinates.longitudeIndex, coordinates.latitudeIndex - 1), componentIndex);
  uint fpp = getProjectedComponent(readProjectedTable(coordinates.longitudeIndex + 1, coordinates.latitudeIndex + 1), componentIndex);
  uint fpm = getProjectedComponent(readProjectedTable(coordinates.longitudeIndex + 1, coordinates.latitudeIndex - 1), componentIndex);
  uint fmp = getProjectedComponent(readProjectedTable(coordinates.longitudeIndex - 1, coordinates.latitudeIndex + 1), componentIndex);
  uint fmm = getProjectedComponent(readProjectedTable(coordinates.longitudeIndex - 1, coordinates.latitudeIndex - 1), componentIndex);
  float fx = 0.5 * subtractU32AsFloat(fp0, fm0);
  float fxx = subtractU32AsFloat(fp0, f00) + subtractU32AsFloat(fm0, f00);
  float fy;
  float fyy;
  float fxy;
  if (isLatitudeBandBoundary(coordinates.latitudeIndex)) {
    if (coordinates.v >= 0.0) {
      uint f0pp = getProjectedComponent(readProjectedTable(coordinates.longitudeIndex, coordinates.latitudeIndex + 2), componentIndex);
      fy = 2.0 * subtractU32AsFloat(f0p, f00) - 0.5 * subtractU32AsFloat(f0pp, f00);
      fyy = subtractU32AsFloat(f0pp, f00) - 2.0 * subtractU32AsFloat(f0p, f00);
      fxy = 0.5 * (subtractU32AsFloat(fpp, fmp) - subtractU32AsFloat(fp0, fm0));
    } else {
      uint f0mm = getProjectedComponent(readProjectedTable(coordinates.longitudeIndex, coordinates.latitudeIndex - 2), componentIndex);
      fy = 2.0 * subtractU32AsFloat(f00, f0m) - 0.5 * subtractU32AsFloat(f00, f0mm);
      fyy = subtractU32AsFloat(f00, f0m) + subtractU32AsFloat(f0mm, f0m);
      fxy = 0.5 * (subtractU32AsFloat(fp0, fm0) - subtractU32AsFloat(fpm, fmm));
    }
  } else {
    fy = 0.5 * subtractU32AsFloat(f0p, f0m);
    fyy = subtractU32AsFloat(f0p, f00) + subtractU32AsFloat(f0m, f00);
    fxy = 0.25 * (subtractU32AsFloat(fpp, fpm) - subtractU32AsFloat(fmp, fmm));
  }
  float correction =
    fx * coordinates.u +
    fy * coordinates.v +
    0.5 * fxx * coordinates.u * coordinates.u +
    fxy * coordinates.u * coordinates.v +
    0.5 * fyy * coordinates.v * coordinates.v;
  return addSignedClamped(f00, int(floor(correction + 0.5)));
}

uvec2 makeValidProjectedPosition(uint x, uint y) {
  if (x == 0xffffffffu && y == 0xffffffffu) {
    return uvec2(0xfffffffeu, 0xffffffffu);
  }
  return uvec2(x, y);
}

${outputSize === 3 ? 'uvec3' : 'uvec2'} projectStereographic(uint longitude, uint latitude${outputSize === 3 ? ', uint altitude' : ''}) {
  if (longitude == 0xffffffffu && latitude == 0xffffffffu${outputSize === 3 ? ' && altitude == 0xffffffffu' : ''}) {
    return ${outputSize === 3 ? 'uvec3' : 'uvec2'}(0xffffffffu);
  }

  if (getStereographicVisibilityDot(latitude) < -stereographicProjection.projectionParameters.z) {
    return ${outputSize === 3 ? 'uvec3' : 'uvec2'}(0xffffffffu);
  }

  StereographicTableCoordinate coordinates = getStereographicTableCoordinate(longitude, latitude);
  uvec2 projected = makeValidProjectedPosition(
    evaluateProjectedComponent(coordinates, 0),
    evaluateProjectedComponent(coordinates, 1)
  );
${outputSize === 3 ? '  return uvec3(projected.x, projected.y, altitude);' : '  return projected;'}
}
`;
}

function getWGSLStereographicProjectionFunctions(
  parameters: StereographicProjectionState,
  outputSize: number
): string {
  const longitudeTableSize = getStereographicLongitudeTableSize();
  const mirrorXExpression =
    parameters.latitudeOriginSign > 0
      ? 'octant == 1u || octant == 2u || octant == 4u || octant == 7u'
      : 'octant == 4u || octant == 5u || octant == 6u || octant == 7u';
  const mirrorYExpression =
    parameters.latitudeOriginSign > 0
      ? 'octant == 1u || octant == 3u || octant == 4u || octant == 6u'
      : 'octant == 2u || octant == 3u || octant == 4u || octant == 5u';
  const longitudeTableFunctions = /* wgsl */ `
struct LongitudeTableSample {
  tableIndex: u32,
  swapXY: bool,
  mirrorX: bool,
  mirrorY: bool,
}

fn getLongitudeTableSample(index: i32) -> LongitudeTableSample {
  let wrappedIndex = u32((index + ${STEREOGRAPHIC_LONGITUDE_TABLE_SIZE}) & ${STEREOGRAPHIC_LONGITUDE_TABLE_MASK});
  let octant = wrappedIndex >> ${STEREOGRAPHIC_LONGITUDE_OCTANT_BITS}u;
  let octantIndex = wrappedIndex & ${STEREOGRAPHIC_LONGITUDE_OCTANT_MASK}u;
  let mirrorAngle = (octant & 1u) == 1u;
  return LongitudeTableSample(
    select(octantIndex, ${STEREOGRAPHIC_LONGITUDE_OCTANT_SIZE}u - octantIndex, mirrorAngle),
    octant == 1u || octant == 2u || octant == 5u || octant == 6u,
    ${mirrorXExpression},
    ${mirrorYExpression}
  );
}
`;
  const latitudeTableFunctions = getWGSLLatitudeTableFunctions(parameters);
  return /* wgsl */ `
struct StereographicTableCoordinate {
  longitudeIndex: i32,
  latitudeIndex: i32,
  u: f32,
  v: f32,
}

struct StereographicLatitudeCoordinate {
  index: i32,
  v: f32,
}

${longitudeTableFunctions}

${latitudeTableFunctions}

fn mirrorProjectedCoordinate(value: u32) -> u32 {
  if (value >= ${QUANTIZED_OUTPUT_CENTER}u) {
    return subtractUnsignedClamped(${QUANTIZED_OUTPUT_CENTER}u, value - ${QUANTIZED_OUTPUT_CENTER}u);
  }
  return addUnsignedClamped(${QUANTIZED_OUTPUT_CENTER}u, ${QUANTIZED_OUTPUT_CENTER}u - value);
}

fn readProjectedTable(longitudeIndex: i32, latitudeIndex: i32) -> vec2<u32> {
  let longitudeSample = getLongitudeTableSample(longitudeIndex);
  let tableIndex =
    (u32(latitudeIndex - ${STEREOGRAPHIC_LATITUDE_TABLE_START_INDEX}) *
      ${longitudeTableSize}u +
      longitudeSample.tableIndex) *
    2u;
	  var value = vec2<u32>(projectedTable[tableIndex], projectedTable[tableIndex + 1u]);
  if (longitudeSample.swapXY) {
    value = value.yx;
  }
	  if (longitudeSample.mirrorX) {
	    value.x = mirrorProjectedCoordinate(value.x);
	  }
  if (longitudeSample.mirrorY) {
    value.y = mirrorProjectedCoordinate(value.y);
  }
  return value;
}

fn getProjectedComponent(value: vec2<u32>, componentIndex: u32) -> u32 {
  if (componentIndex == 0u) {
    return value.x;
  }
  return value.y;
}

fn isLatitudeBandBoundary(latitudeIndex: i32) -> bool {
  return
    latitudeIndex == ${STEREOGRAPHIC_POLAR_LATITUDE_BAND_1_START} ||
    latitudeIndex == ${STEREOGRAPHIC_POLAR_LATITUDE_BAND_2_START};
}

fn getWrappedLongitudeDelta(value: u32, center: u32) -> f32 {
  let delta = value - center;
  if (delta > 0x80000000u) {
    return -f32(0u - delta);
  }
  return f32(delta);
}

fn getStereographicVisibilityDot(latitude: u32) -> f32 {
  let latitudeRadians = quantizedDegreesToF32(latitude) * ${formatShaderFloat(RADIANS_PER_DEGREE)};
  return stereographicProjection.projectionParameters.x * sin(latitudeRadians);
}

fn getStereographicTableCoordinate(longitude: u32, latitude: u32) -> StereographicTableCoordinate {
  let longitudePhase = longitude - stereographicProjection.coordinateParameters.x;
  let roundedLongitude = longitudePhase + ${STEREOGRAPHIC_LONGITUDE_TABLE_HALF_STEP}u;
  let longitudeIndex = i32(
    (roundedLongitude >> ${STEREOGRAPHIC_LONGITUDE_TABLE_SHIFT}u) &
      ${STEREOGRAPHIC_LONGITUDE_TABLE_MASK}u
  );
  let longitudeCenter = u32(longitudeIndex) << ${STEREOGRAPHIC_LONGITUDE_TABLE_SHIFT}u;
  let u = getWrappedLongitudeDelta(longitudePhase, longitudeCenter) *
    ${formatShaderFloat(STEREOGRAPHIC_LONGITUDE_TABLE_INVERSE_STEP)};

  let latitudeCoordinate = getLatitudeTableCoordinate(latitude);

  return StereographicTableCoordinate(
    longitudeIndex,
    latitudeCoordinate.index,
    u,
    latitudeCoordinate.v
  );
}

fn evaluateProjectedComponent(coordinates: StereographicTableCoordinate, componentIndex: u32) -> u32 {
  let f00 = getProjectedComponent(readProjectedTable(coordinates.longitudeIndex, coordinates.latitudeIndex), componentIndex);
  let fp0 = getProjectedComponent(readProjectedTable(coordinates.longitudeIndex + 1, coordinates.latitudeIndex), componentIndex);
  let fm0 = getProjectedComponent(readProjectedTable(coordinates.longitudeIndex - 1, coordinates.latitudeIndex), componentIndex);
  let f0p = getProjectedComponent(readProjectedTable(coordinates.longitudeIndex, coordinates.latitudeIndex + 1), componentIndex);
  let f0m = getProjectedComponent(readProjectedTable(coordinates.longitudeIndex, coordinates.latitudeIndex - 1), componentIndex);
  let fpp = getProjectedComponent(readProjectedTable(coordinates.longitudeIndex + 1, coordinates.latitudeIndex + 1), componentIndex);
  let fpm = getProjectedComponent(readProjectedTable(coordinates.longitudeIndex + 1, coordinates.latitudeIndex - 1), componentIndex);
  let fmp = getProjectedComponent(readProjectedTable(coordinates.longitudeIndex - 1, coordinates.latitudeIndex + 1), componentIndex);
  let fmm = getProjectedComponent(readProjectedTable(coordinates.longitudeIndex - 1, coordinates.latitudeIndex - 1), componentIndex);
  let fx = 0.5 * subtractU32AsF32(fp0, fm0);
  let fxx = subtractU32AsF32(fp0, f00) + subtractU32AsF32(fm0, f00);
  var fy = 0.0;
  var fyy = 0.0;
  var fxy = 0.0;
  if (isLatitudeBandBoundary(coordinates.latitudeIndex)) {
    if (coordinates.v >= 0.0) {
      let f0pp = getProjectedComponent(readProjectedTable(coordinates.longitudeIndex, coordinates.latitudeIndex + 2), componentIndex);
      fy = 2.0 * subtractU32AsF32(f0p, f00) - 0.5 * subtractU32AsF32(f0pp, f00);
      fyy = subtractU32AsF32(f0pp, f00) - 2.0 * subtractU32AsF32(f0p, f00);
      fxy = 0.5 * (subtractU32AsF32(fpp, fmp) - subtractU32AsF32(fp0, fm0));
    } else {
      let f0mm = getProjectedComponent(readProjectedTable(coordinates.longitudeIndex, coordinates.latitudeIndex - 2), componentIndex);
      fy = 2.0 * subtractU32AsF32(f00, f0m) - 0.5 * subtractU32AsF32(f00, f0mm);
      fyy = subtractU32AsF32(f00, f0m) + subtractU32AsF32(f0mm, f0m);
      fxy = 0.5 * (subtractU32AsF32(fp0, fm0) - subtractU32AsF32(fpm, fmm));
    }
  } else {
    fy = 0.5 * subtractU32AsF32(f0p, f0m);
    fyy = subtractU32AsF32(f0p, f00) + subtractU32AsF32(f0m, f00);
    fxy = 0.25 * (subtractU32AsF32(fpp, fpm) - subtractU32AsF32(fmp, fmm));
  }
  let correction =
    fx * coordinates.u +
    fy * coordinates.v +
    0.5 * fxx * coordinates.u * coordinates.u +
    fxy * coordinates.u * coordinates.v +
    0.5 * fyy * coordinates.v * coordinates.v;
  return addSignedClamped(f00, i32(floor(correction + 0.5)));
}

fn makeValidProjectedPosition(x: u32, y: u32) -> vec2<u32> {
  if (x == 0xffffffffu && y == 0xffffffffu) {
    return vec2<u32>(0xfffffffeu, 0xffffffffu);
  }
  return vec2<u32>(x, y);
}

fn projectStereographic(longitude: u32, latitude: u32${outputSize === 3 ? ', altitude: u32' : ''}) -> ${outputSize === 3 ? 'vec3<u32>' : 'vec2<u32>'} {
  if (longitude == 0xffffffffu && latitude == 0xffffffffu${outputSize === 3 ? ' && altitude == 0xffffffffu' : ''}) {
    return ${outputSize === 3 ? 'vec3<u32>' : 'vec2<u32>'}(0xffffffffu);
  }

  if (getStereographicVisibilityDot(latitude) < -stereographicProjection.projectionParameters.z) {
    return ${outputSize === 3 ? 'vec3<u32>' : 'vec2<u32>'}(0xffffffffu);
  }

  let coordinates = getStereographicTableCoordinate(longitude, latitude);
  let projected = makeValidProjectedPosition(
    evaluateProjectedComponent(coordinates, 0u),
    evaluateProjectedComponent(coordinates, 1u)
  );
${outputSize === 3 ? '  return vec3<u32>(projected.x, projected.y, altitude);' : '  return projected;'}
}
`;
}
