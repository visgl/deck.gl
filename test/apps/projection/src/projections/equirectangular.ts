import {GPUDataEvaluator, Operation, type OperationHandler} from '@luma.gl/gpgpu';
import {
  getGLSLProjectionShaderSource,
  getWGSLProjectionShaderSource
} from './projection-shader-utils';
import {
  PROJECTION_WORKGROUP_SIZE,
  executeWebGLProjection,
  executeWebGPUProjection,
  getQuantizedPosition,
  getProjectionPositions,
  makeQuantizedProjectionOutput,
  projectDegrees180ToQuantized,
  projectLongitudeToQuantized,
  appendRawAltitudeToProjectedPosition,
  appendQuantizedAltitudeToProjectedPosition,
  type ProjectionInput,
  type ProjectionOperationInputs
} from './projection-utils';

class EquirectangularOperation extends Operation<ProjectionOperationInputs> {
  name = 'equirectangular';

  output: GPUDataEvaluator;

  constructor(positions: GPUDataEvaluator) {
    super({positions});

    this.output = makeQuantizedProjectionOutput('equirectangular', positions, this);
  }

  toString(): string {
    return `equirectangular(${this.inputs.positions})`;
  }
}

export function equirectangular(positions: ProjectionInput): GPUDataEvaluator {
  return new EquirectangularOperation(getProjectionPositions(positions, 'equirectangular')).output;
}

export function rawEquirectangular(coordinates: readonly [number, number]): [number, number];
export function rawEquirectangular(
  coordinates: readonly [number, number, number]
): [number, number, number];
export function rawEquirectangular(
  coordinates: readonly [number, number] | readonly [number, number, number]
): [number, number] | [number, number, number] {
  const [longitude, latitude] = coordinates;
  return appendRawAltitudeToProjectedPosition(
    [projectLongitudeToQuantized(longitude), projectLatitudeToQuantized(latitude)],
    coordinates
  );
}

export const executeCPUEquirectangular: OperationHandler<ProjectionOperationInputs> = async ({
  inputs,
  output,
  target
}) => {
  const {positions} = inputs;
  const positionValues = positions.value ?? (await positions.readValue());
  const outputValues = new Uint32Array(output.length * output.size);

  for (let rowIndex = 0; rowIndex < output.length; rowIndex++) {
    const position = getQuantizedPosition(positionValues, positions, rowIndex);
    const [longitude, latitude] = position;
    const outputOffset = rowIndex * output.size;
    const projected = appendQuantizedAltitudeToProjectedPosition([longitude, latitude], position);
    for (let valueIndex = 0; valueIndex < output.size; valueIndex++) {
      outputValues[outputOffset + valueIndex] = projected[valueIndex];
    }
  }

  target.write(outputValues);
  return {success: true, value: outputValues};
};

export const executeWebGPUEquirectangular: OperationHandler<ProjectionOperationInputs> = ({
  inputs,
  output,
  target
}) => {
  const {positions} = inputs;
  return executeWebGPUProjection({
    positions,
    output,
    target,
    getSource: ({resultBindingIndex}) =>
      getWebGPUProjectionSource({positions, output, resultBindingIndex})
  });
};

export const executeWebGLEquirectangular: OperationHandler<ProjectionOperationInputs> = ({
  inputs,
  output,
  target
}) => {
  const {positions} = inputs;
  return executeWebGLProjection({
    positions,
    output,
    target,
    source: getWebGLProjectionSource(positions, output)
  });
};

function projectLatitudeToQuantized(latitude: number): number {
  return projectDegrees180ToQuantized(latitude);
}

function getWebGLProjectionSource(positions: GPUDataEvaluator, output: GPUDataEvaluator): string {
  return getGLSLProjectionShaderSource({
    positions,
    output,
    projectedExpression:
      output.size === 3
        ? 'uvec3(projectLongitude(longitude), projectLatitude(latitude), altitude)'
        : 'uvec2(projectLongitude(longitude), projectLatitude(latitude))',
    projectionFunctions: /* glsl */ `
uint projectLatitude(uint latitude) {
  return latitude;
}
`
  });
}

function getWebGPUProjectionSource({
  positions,
  output,
  resultBindingIndex
}: {
  positions: GPUDataEvaluator;
  output: GPUDataEvaluator;
  resultBindingIndex: number;
}): string {
  return getWGSLProjectionShaderSource({
    positions,
    output,
    resultBindingIndex,
    workgroupSize: PROJECTION_WORKGROUP_SIZE,
    projectedExpression:
      output.size === 3
        ? 'vec3<u32>(projectLongitude(longitude), projectLatitude(latitude), altitude)'
        : 'vec2<u32>(projectLongitude(longitude), projectLatitude(latitude))',
    projectionFunctions: /* wgsl */ `
fn projectLatitude(latitude: u32) -> u32 {
  return latitude;
}
`
  });
}
