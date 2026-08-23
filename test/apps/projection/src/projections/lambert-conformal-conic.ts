import {GPUDataEvaluator, Operation, type OperationHandler} from '@luma.gl/gpgpu';
import {
  executeWebGLConicProjection,
  executeWebGPUConicProjection,
  getConicOutputUnitsPerMeter,
  getConicProjectionTableValues,
  getConicRhoTableEvaluator,
  getConicSineTableEvaluator,
  projectConicMetersToQuantized,
  projectQuantizedConicToQuantized,
  type ConicProjectionState,
  type ConicProjectionTableValues
} from './conic';
import {
  appendQuantizedAltitudeToProjectedPosition,
  appendRawAltitudeToProjectedPosition,
  getQuantizedPosition,
  getProjectionPositions,
  clamp,
  isInvalidQuantizedPosition,
  makeQuantizedProjectionOutput,
  projectDegrees180ToQuantized,
  unprojectQuantizedDegrees,
  type ProjectionInput,
  type ProjectionOperationInputs
} from './projection-utils';

const RADIANS_PER_DEGREE = Math.PI / 180;
const STANDARD_PARALLEL_EPSILON = 1e-12;
const LAMBERT_LATITUDE_MIN_QUANTIZED = projectDegrees180ToQuantized(-90);
const LAMBERT_LATITUDE_MAX_QUANTIZED = projectDegrees180ToQuantized(90);

export type LambertConformalConicProjectionParameters = {
  standardParallels: readonly [number, number];
  longitudeOrigin: number;
  latitudeOrigin: number;
  falseEasting?: number;
  falseNorthing?: number;
  semiMajorAxis?: number;
  inverseFlattening?: number;
  outputCenter?: readonly [number, number];
  outputHalfExtent: number;
};

type LambertConformalConicProjectionState = Required<
  Omit<LambertConformalConicProjectionParameters, 'standardParallels' | 'outputCenter'>
> &
  ConicProjectionState & {
    standardParallels: readonly [number, number];
    outputCenter: readonly [number, number];
    eccentricity: number;
    f: number;
  };

type LambertOperationInputs = ProjectionOperationInputs & {
  parameters: LambertConformalConicProjectionState;
  rhoTable: GPUDataEvaluator;
  sineTable: GPUDataEvaluator;
};

type LambertConformalConicProjectionTableValues = ConicProjectionTableValues;

const lambertProjectionTableCache = new Map<string, LambertConformalConicProjectionTableValues>();

export const LAMBERT_CONUS: LambertConformalConicProjectionParameters = {
  standardParallels: [33, 45],
  longitudeOrigin: -96,
  latitudeOrigin: 39,
  falseEasting: 0,
  falseNorthing: 0,
  semiMajorAxis: 6378137,
  inverseFlattening: 298.257222101,
  outputCenter: [0, 0],
  outputHalfExtent: 20000000
};

class LambertOperation extends Operation<LambertOperationInputs> {
  name = 'lambert';

  output: GPUDataEvaluator;

  constructor(positions: GPUDataEvaluator, parameters: LambertConformalConicProjectionState) {
    super({
      positions,
      parameters,
      rhoTable: getRhoTableEvaluator(parameters),
      sineTable: getSineTableEvaluator(parameters)
    });

    this.output = makeQuantizedProjectionOutput('lambert', positions, this);
  }

  toString(): string {
    return `lambert(${this.inputs.positions})`;
  }
}

export function lambert(
  positions: ProjectionInput,
  parameters: LambertConformalConicProjectionParameters
): GPUDataEvaluator {
  return new LambertOperation(
    getProjectionPositions(positions, 'lambert'),
    makeLambertProjectionState(parameters)
  ).output;
}

export function rawLambert(
  coordinates: readonly [number, number],
  parameters: LambertConformalConicProjectionParameters
): [number, number];
export function rawLambert(
  coordinates: readonly [number, number, number],
  parameters: LambertConformalConicProjectionParameters
): [number, number, number];
export function rawLambert(
  coordinates: readonly [number, number] | readonly [number, number, number],
  parameters: LambertConformalConicProjectionParameters
): [number, number] | [number, number, number] {
  return appendRawAltitudeToProjectedPosition(
    projectLambertToQuantized(
      [coordinates[0], coordinates[1]],
      makeLambertProjectionState(parameters)
    ),
    coordinates
  );
}

export const executeCPULambert: OperationHandler<LambertOperationInputs> = async ({
  inputs,
  output,
  target
}) => {
  const {positions, parameters, rhoTable, sineTable} = inputs;
  const positionValues = positions.value ?? (await positions.readValue());
  const outputValues = new Uint32Array(output.length * output.size);
  const rhoTableValues = rhoTable.value as Uint32Array;
  const sineTableValues = sineTable.value as Uint32Array;

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
    const projected = projectQuantizedConicToQuantized(
      longitude,
      latitude,
      parameters,
      rhoTableValues,
      sineTableValues
    );
    const projectedPosition = appendQuantizedAltitudeToProjectedPosition(projected, position);
    for (let valueIndex = 0; valueIndex < output.size; valueIndex++) {
      outputValues[outputOffset + valueIndex] = projectedPosition[valueIndex];
    }
  }

  target.write(outputValues);
  return {success: true, value: outputValues};
};

export const executeWebGPULambert: OperationHandler<LambertOperationInputs> = ({
  inputs,
  output,
  target
}) => {
  return executeWebGPUConicProjection({inputs, output, target});
};

export const executeWebGLLambert: OperationHandler<LambertOperationInputs> = ({
  inputs,
  output,
  target
}) => {
  return executeWebGLConicProjection({
    inputs,
    output,
    target,
    tableValues: getLambertProjectionTableValues(inputs.parameters)
  });
};

function makeLambertProjectionState(
  parameters: LambertConformalConicProjectionParameters
): LambertConformalConicProjectionState {
  const semiMajorAxis = parameters.semiMajorAxis ?? 6378137;
  const inverseFlattening = parameters.inverseFlattening ?? 298.257222101;
  const falseEasting = parameters.falseEasting ?? 0;
  const falseNorthing = parameters.falseNorthing ?? 0;
  const outputCenter: readonly [number, number] = parameters.outputCenter ?? [
    falseEasting,
    falseNorthing
  ];
  const flattening = 1 / inverseFlattening;
  const eccentricity = Math.sqrt(2 * flattening - flattening * flattening);
  const standardParallel1 = parameters.standardParallels[0] * RADIANS_PER_DEGREE;
  const standardParallel2 = parameters.standardParallels[1] * RADIANS_PER_DEGREE;
  const latitudeOrigin = parameters.latitudeOrigin * RADIANS_PER_DEGREE;
  const m1 = getM(standardParallel1, eccentricity);
  const m2 = getM(standardParallel2, eccentricity);
  const t1 = getT(standardParallel1, eccentricity);
  const t2 = getT(standardParallel2, eccentricity);
  const t0 = getT(latitudeOrigin, eccentricity);
  const n =
    Math.abs(standardParallel1 - standardParallel2) < STANDARD_PARALLEL_EPSILON
      ? Math.sin(standardParallel1)
      : Math.log(m1 / m2) / Math.log(t1 / t2);

  if (!Number.isFinite(n) || n <= 0) {
    throw new Error('lambert currently requires standard parallels that produce positive n');
  }

  const f = m1 / (n * t1 ** n);
  const rho0 = semiMajorAxis * f * t0 ** n;
  const longitudeOriginQuantized = projectDegrees180ToQuantized(parameters.longitudeOrigin);

  return {
    ...parameters,
    falseEasting,
    falseNorthing,
    semiMajorAxis,
    inverseFlattening,
    outputCenter,
    eccentricity,
    n,
    f,
    rho0,
    longitudeOriginQuantized
  };
}

function projectLambertToQuantized(
  coordinates: readonly [number, number],
  parameters: LambertConformalConicProjectionState
): [number, number] {
  return projectConicMetersToQuantized(projectLambertToMeters(coordinates, parameters), parameters);
}

function projectLambertToMeters(
  [longitude, latitude]: readonly [number, number],
  parameters: LambertConformalConicProjectionState
): [number, number] {
  const longitudeDeltaRadians =
    wrapLongitudeDeltaDegrees(longitude - parameters.longitudeOrigin) * RADIANS_PER_DEGREE;
  const latitudeRadians = latitude * RADIANS_PER_DEGREE;
  const theta = parameters.n * longitudeDeltaRadians;
  const rho = getRhoFromLatitudeRadians(latitudeRadians, parameters);
  return [
    parameters.falseEasting + rho * Math.sin(theta),
    parameters.falseNorthing + parameters.rho0 - rho * Math.cos(theta)
  ];
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

function getM(latitudeRadians: number, eccentricity: number): number {
  const sineLatitude = Math.sin(latitudeRadians);
  return (
    Math.cos(latitudeRadians) /
    Math.sqrt(1 - eccentricity * eccentricity * sineLatitude * sineLatitude)
  );
}

function getT(latitudeRadians: number, eccentricity: number): number {
  const sineLatitude = Math.sin(latitudeRadians);
  const eccentricitySineLatitude = eccentricity * sineLatitude;
  return (
    Math.tan(Math.PI / 4 - latitudeRadians / 2) /
    ((1 - eccentricitySineLatitude) / (1 + eccentricitySineLatitude)) ** (eccentricity / 2)
  );
}

function getRhoTableEvaluator(parameters: LambertConformalConicProjectionState): GPUDataEvaluator {
  return getConicRhoTableEvaluator(getLambertProjectionTableValues(parameters));
}

function getSineTableEvaluator(parameters: LambertConformalConicProjectionState): GPUDataEvaluator {
  return getConicSineTableEvaluator(getLambertProjectionTableValues(parameters));
}

function getLambertProjectionTableValues(
  parameters: LambertConformalConicProjectionState
): LambertConformalConicProjectionTableValues {
  return getConicProjectionTableValues(
    lambertProjectionTableCache,
    getLambertProjectionTableKey(parameters),
    quantizedLatitude => getRhoOutputUnitsFromQuantizedLatitude(quantizedLatitude, parameters)
  );
}

function getLambertProjectionTableKey(parameters: LambertConformalConicProjectionState): string {
  return [
    parameters.eccentricity,
    parameters.n,
    parameters.f,
    parameters.rho0,
    parameters.semiMajorAxis,
    parameters.outputHalfExtent
  ].join('|');
}

function getRhoOutputUnitsFromQuantizedLatitude(
  quantizedLatitude: number,
  parameters: LambertConformalConicProjectionState
): number {
  const clampedLatitude = clamp(
    quantizedLatitude,
    LAMBERT_LATITUDE_MIN_QUANTIZED,
    LAMBERT_LATITUDE_MAX_QUANTIZED
  );
  const latitudeRadians = unprojectQuantizedDegrees(clampedLatitude) * RADIANS_PER_DEGREE;
  return (
    getRhoFromLatitudeRadians(latitudeRadians, parameters) * getConicOutputUnitsPerMeter(parameters)
  );
}

function getRhoFromLatitudeRadians(
  latitudeRadians: number,
  parameters: LambertConformalConicProjectionState
): number {
  return (
    parameters.semiMajorAxis *
    parameters.f *
    getT(latitudeRadians, parameters.eccentricity) ** parameters.n
  );
}
