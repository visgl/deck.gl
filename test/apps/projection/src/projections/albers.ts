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
const ALBERS_LATITUDE_MIN_QUANTIZED = projectDegrees180ToQuantized(-90);
const ALBERS_LATITUDE_MAX_QUANTIZED = projectDegrees180ToQuantized(90);

export type AlbersProjectionParameters = {
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

type AlbersProjectionState = Required<
  Omit<AlbersProjectionParameters, 'standardParallels' | 'outputCenter'>
> &
  ConicProjectionState & {
    standardParallels: readonly [number, number];
    outputCenter: readonly [number, number];
    eccentricity: number;
    c: number;
  };

type AlbersOperationInputs = ProjectionOperationInputs & {
  parameters: AlbersProjectionState;
  rhoTable: GPUDataEvaluator;
  sineTable: GPUDataEvaluator;
};

type AlbersProjectionTableValues = ConicProjectionTableValues;

const albersProjectionTableCache = new Map<string, AlbersProjectionTableValues>();

export const ALBERS_USGS_5070: AlbersProjectionParameters = {
  standardParallels: [29.5, 45.5],
  longitudeOrigin: -96,
  latitudeOrigin: 23,
  falseEasting: 0,
  falseNorthing: 0,
  semiMajorAxis: 6378137,
  inverseFlattening: 298.257222101,
  outputCenter: [0, 1500000],
  outputHalfExtent: 20000000
};

class AlbersOperation extends Operation<AlbersOperationInputs> {
  name = 'albers';

  output: GPUDataEvaluator;

  constructor(positions: GPUDataEvaluator, parameters: AlbersProjectionState) {
    super({
      positions,
      parameters,
      rhoTable: getRhoTableEvaluator(parameters),
      sineTable: getSineTableEvaluator(parameters)
    });

    this.output = makeQuantizedProjectionOutput('albers', positions, this);
  }

  toString(): string {
    return `albers(${this.inputs.positions})`;
  }
}

export function albers(
  positions: ProjectionInput,
  parameters: AlbersProjectionParameters
): GPUDataEvaluator {
  return new AlbersOperation(
    getProjectionPositions(positions, 'albers'),
    makeAlbersProjectionState(parameters)
  ).output;
}

export function rawAlbers(
  coordinates: readonly [number, number],
  parameters: AlbersProjectionParameters
): [number, number];
export function rawAlbers(
  coordinates: readonly [number, number, number],
  parameters: AlbersProjectionParameters
): [number, number, number];
export function rawAlbers(
  coordinates: readonly [number, number] | readonly [number, number, number],
  parameters: AlbersProjectionParameters
): [number, number] | [number, number, number] {
  return appendRawAltitudeToProjectedPosition(
    projectAlbersToQuantized(
      [coordinates[0], coordinates[1]],
      makeAlbersProjectionState(parameters)
    ),
    coordinates
  );
}

export const executeCPUAlbers: OperationHandler<AlbersOperationInputs> = async ({
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

export const executeWebGPUAlbers: OperationHandler<AlbersOperationInputs> = ({
  inputs,
  output,
  target
}) => {
  return executeWebGPUConicProjection({inputs, output, target});
};

export const executeWebGLAlbers: OperationHandler<AlbersOperationInputs> = ({
  inputs,
  output,
  target
}) => {
  return executeWebGLConicProjection({
    inputs,
    output,
    target,
    tableValues: getAlbersProjectionTableValues(inputs.parameters)
  });
};

function makeAlbersProjectionState(parameters: AlbersProjectionParameters): AlbersProjectionState {
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
  const q1 = getQ(standardParallel1, eccentricity);
  const q2 = getQ(standardParallel2, eccentricity);
  const q0 = getQ(latitudeOrigin, eccentricity);
  const n = (m1 * m1 - m2 * m2) / (q2 - q1);
  const c = m1 * m1 + n * q1;
  const rho0 = (semiMajorAxis * Math.sqrt(c - n * q0)) / n;
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
    c,
    rho0,
    longitudeOriginQuantized
  };
}

function projectAlbersToQuantized(
  coordinates: readonly [number, number],
  parameters: AlbersProjectionState
): [number, number] {
  return projectConicMetersToQuantized(projectAlbersToMeters(coordinates, parameters), parameters);
}

function projectAlbersToMeters(
  [longitude, latitude]: readonly [number, number],
  parameters: AlbersProjectionState
): [number, number] {
  const longitudeDeltaRadians =
    wrapLongitudeDeltaDegrees(longitude - parameters.longitudeOrigin) * RADIANS_PER_DEGREE;
  const latitudeRadians = latitude * RADIANS_PER_DEGREE;
  const theta = parameters.n * longitudeDeltaRadians;
  const rho =
    (parameters.semiMajorAxis *
      Math.sqrt(
        Math.max(0, parameters.c - parameters.n * getQ(latitudeRadians, parameters.eccentricity))
      )) /
    parameters.n;
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

function getQ(latitudeRadians: number, eccentricity: number): number {
  const sineLatitude = Math.sin(latitudeRadians);
  const eccentricitySineLatitude = eccentricity * sineLatitude;
  return (
    (1 - eccentricity * eccentricity) *
    (sineLatitude / (1 - eccentricitySineLatitude * eccentricitySineLatitude) -
      Math.log((1 - eccentricitySineLatitude) / (1 + eccentricitySineLatitude)) /
        (2 * eccentricity))
  );
}

function getRhoTableEvaluator(parameters: AlbersProjectionState): GPUDataEvaluator {
  return getConicRhoTableEvaluator(getAlbersProjectionTableValues(parameters));
}

function getSineTableEvaluator(parameters: AlbersProjectionState): GPUDataEvaluator {
  return getConicSineTableEvaluator(getAlbersProjectionTableValues(parameters));
}

function getAlbersProjectionTableValues(
  parameters: AlbersProjectionState
): AlbersProjectionTableValues {
  return getConicProjectionTableValues(
    albersProjectionTableCache,
    getAlbersProjectionTableKey(parameters),
    quantizedLatitude => getRhoOutputUnitsFromQuantizedLatitude(quantizedLatitude, parameters)
  );
}

function getAlbersProjectionTableKey(parameters: AlbersProjectionState): string {
  return [
    parameters.eccentricity,
    parameters.n,
    parameters.c,
    parameters.rho0,
    parameters.semiMajorAxis,
    parameters.outputHalfExtent
  ].join('|');
}

function getRhoOutputUnitsFromQuantizedLatitude(
  quantizedLatitude: number,
  parameters: AlbersProjectionState
): number {
  const clampedLatitude = clamp(
    quantizedLatitude,
    ALBERS_LATITUDE_MIN_QUANTIZED,
    ALBERS_LATITUDE_MAX_QUANTIZED
  );
  const latitudeRadians = unprojectQuantizedDegrees(clampedLatitude) * RADIANS_PER_DEGREE;
  return (
    getRhoFromLatitudeRadians(latitudeRadians, parameters) * getConicOutputUnitsPerMeter(parameters)
  );
}

function getRhoFromLatitudeRadians(
  latitudeRadians: number,
  parameters: AlbersProjectionState
): number {
  return (
    (parameters.semiMajorAxis *
      Math.sqrt(
        Math.max(0, parameters.c - parameters.n * getQ(latitudeRadians, parameters.eccentricity))
      )) /
    parameters.n
  );
}
