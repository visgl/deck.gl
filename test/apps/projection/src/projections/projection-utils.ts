import {
  type Buffer,
  type BufferLayout,
  type BindingDeclaration,
  type VertexFormat
} from '@luma.gl/core';
import {
  BufferTransform,
  Computation,
  ShaderInputs,
  type BufferTransformProps
} from '@luma.gl/engine';
import {
  getGPUDataEvaluator,
  GPUDataEvaluator,
  type GPUDataEvaluatorInput,
  type Operation,
  type OperationHandlerResult
} from '@luma.gl/gpgpu';
import {getShaderModuleDependencies, type ShaderModule} from '@luma.gl/shadertools';
import {degreesToQuantized, type DegreesToQuantizedInput} from './degrees-to-quantized';
import {
  ALTITUDE_UNITS_PER_METER,
  INVALID_QUANTIZED_COORDINATE,
  PROJECTION_WORKGROUP_SIZE,
  QUANTIZED_SEA_LEVEL,
  UINT32_MAX
} from './projection-constants';

export {
  ALTITUDE_UNITS_PER_METER,
  EARTH_RADIUS_METERS,
  INVALID_QUANTIZED_COORDINATE,
  PROJECTION_WORKGROUP_SIZE,
  QUANTIZED_SEA_LEVEL,
  UINT32_MAX
} from './projection-constants';

const WEBGPU_SHADER_MODULE_BINDING_START = 100;

export type ProjectionOperationInputs = {
  positions: GPUDataEvaluator;
};

export type ProjectionInput = DegreesToQuantizedInput;
export type QuantizedPosition = [number, number] | [number, number, number];
export type RawPosition = readonly [number, number] | readonly [number, number, number];

type WebGPUBinding = {
  name: string;
  table: GPUDataEvaluator;
  index: number;
};

type ExtraWebGPUBinding = {
  name: string;
  table: GPUDataEvaluator;
};

type WebGPUProjectionSourceContext = {
  resultBindingIndex: number;
  getBindingIndex: (name: string) => number;
};

type ProjectionShaderModuleProps = Record<string, Record<string, unknown>>;
type ProjectionShaderModule = ShaderModule<any, any, any>;

export function getProjectionPositions(
  positions: ProjectionInput,
  operationName: string
): GPUDataEvaluator {
  if (
    typeof positions === 'object' &&
    !(positions instanceof GPUDataEvaluator) &&
    'coordinates' in positions
  ) {
    const quantizedPositions = degreesToQuantized(positions);
    if (quantizedPositions.size !== 2 && quantizedPositions.size !== 3) {
      throw new Error(
        `${operationName} positions must contain lon/lat or lon/lat/alt coordinate tuples`
      );
    }
    return quantizedPositions;
  }

  const positionsTable = getGPUDataEvaluator(positions as GPUDataEvaluatorInput);

  if (positionsTable.type === 'float32' || positionsTable.type === 'uint32') {
    const quantizedPositions = degreesToQuantized(positionsTable);
    if (quantizedPositions.size !== 2 && quantizedPositions.size !== 3) {
      throw new Error(
        `${operationName} positions must contain lon/lat or lon/lat/alt coordinate tuples`
      );
    }
    return quantizedPositions;
  }

  throw new Error(`${operationName} positions must be vec2/vec3<f32> or vec2/vec3<f64>`);
}

export function makeQuantizedProjectionOutput(
  id: string,
  positions: GPUDataEvaluator,
  source: Operation,
  size: number = positions.size
): GPUDataEvaluator {
  return new GPUDataEvaluator({
    id,
    type: 'uint32',
    size,
    length: positions.length,
    format: getQuantizedProjectionOutputFormat(size),
    source
  });
}

export function getQuantizedPosition(
  values: ArrayLike<number>,
  positions: GPUDataEvaluator,
  rowIndex: number
): QuantizedPosition {
  const valueOffset = positions.offset / positions.ValueType.BYTES_PER_ELEMENT;
  const valueStride = positions.stride / positions.ValueType.BYTES_PER_ELEMENT;
  const sourceRowIndex = positions.isConstant ? 0 : rowIndex;
  const rowOffset = valueOffset + sourceRowIndex * valueStride;

  return Array.from(
    {length: positions.size},
    (_, index) => Number(values[rowOffset + index]) >>> 0
  ) as QuantizedPosition;
}

export function isInvalidQuantizedPosition(position: ArrayLike<number>): boolean {
  for (let index = 0; index < position.length; index++) {
    if (Number(position[index]) !== INVALID_QUANTIZED_COORDINATE) {
      return false;
    }
  }
  return true;
}

export function appendRawAltitudeToProjectedPosition(
  projected: [number, number],
  coordinates: RawPosition
): QuantizedPosition {
  const altitude = coordinates[2];
  if (altitude === undefined) {
    return projected;
  }
  if (isInvalidQuantizedPosition(projected)) {
    return [
      INVALID_QUANTIZED_COORDINATE,
      INVALID_QUANTIZED_COORDINATE,
      INVALID_QUANTIZED_COORDINATE
    ];
  }
  return [projected[0], projected[1], projectAltitudeMetersToQuantized(altitude)];
}

export function appendQuantizedAltitudeToProjectedPosition(
  projected: [number, number],
  position: QuantizedPosition
): QuantizedPosition {
  const altitude = position[2];
  if (altitude === undefined) {
    return projected;
  }
  if (isInvalidQuantizedPosition(projected)) {
    return [
      INVALID_QUANTIZED_COORDINATE,
      INVALID_QUANTIZED_COORDINATE,
      INVALID_QUANTIZED_COORDINATE
    ];
  }
  return [projected[0], projected[1], altitude];
}

export function quantizeUnitInterval(value: number): number {
  if (value <= 0) {
    return 0;
  }
  if (value >= 1) {
    return UINT32_MAX;
  }
  return Math.round(value * UINT32_MAX) >>> 0;
}

export function projectSignedRangeToQuantized(value: number, halfExtent: number): number {
  return quantizeUnitInterval((value + halfExtent) / (2 * halfExtent));
}

export function projectDegrees180ToQuantized(degrees: number): number {
  return projectSignedRangeToQuantized(degrees, 180);
}

export function unprojectQuantizedDegrees(quantizedDegrees: number): number {
  return (quantizedDegrees / UINT32_MAX) * 360 - 180;
}

export function projectLongitudeToQuantized(longitude: number): number {
  return projectDegrees180ToQuantized(longitude);
}

export function projectAltitudeMetersToQuantized(altitudeMeters: number): number {
  if (!Number.isFinite(altitudeMeters)) {
    return INVALID_QUANTIZED_COORDINATE;
  }
  return clampUint32(QUANTIZED_SEA_LEVEL + Math.round(altitudeMeters * ALTITUDE_UNITS_PER_METER));
}

export function splitFloat64ToFloat32Pair(value: number): [number, number] {
  const high = Math.fround(value);
  return [high, Math.fround(value - high)];
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function clampUint32(value: number): number {
  return Math.trunc(clamp(value, 0, UINT32_MAX)) >>> 0;
}

export function multiplyUint32ByQuantizedScale(value: number, scale: number): number {
  const product = BigInt(value >>> 0) * BigInt(scale >>> 0);
  return Number((product + 0x80000000n) >> 32n);
}

export function multiplyUint32ByQ31(value: number, scale: number): number {
  const product = BigInt(value >>> 0) * BigInt(scale >>> 0);
  return Number((product + 0x40000000n) >> 31n);
}

export function multiplyUint32ByQ24(value: number, scale: number): number {
  const product = BigInt(value >>> 0) * BigInt(scale >>> 0);
  const result = Number((product + 0x800000n) >> 24n);
  return Math.min(result, UINT32_MAX);
}

export function addUnsignedClamped(value: number, delta: number): number {
  return value > UINT32_MAX - delta ? UINT32_MAX : (value + delta) >>> 0;
}

export function subtractUnsignedClamped(value: number, delta: number): number {
  return value < delta ? 0 : (value - delta) >>> 0;
}

export function addSignedClamped(value: number, delta: number): number {
  return delta < 0 ? subtractUnsignedClamped(value, -delta) : addUnsignedClamped(value, delta);
}

export function applySignedDelta(value: number, delta: number, negative: boolean): number {
  return negative ? subtractUnsignedClamped(value, delta) : addUnsignedClamped(value, delta);
}

export function subtractUint32AsNumber(a: number, b: number): number {
  return a >= b ? a - b : -(b - a);
}

export function interpolateCatmullRom(
  p0: number,
  p1: number,
  p2: number,
  p3: number,
  t: number
): number {
  const d10 = p1 - p0;
  const d21 = p2 - p1;
  const d32 = p3 - p2;
  const m1 = 0.5 * (d10 + d21);
  const m2 = 0.5 * (d21 + d32);
  const t2 = t * t;
  const t3 = t2 * t;
  return p1 + m1 * t + (3 * d21 - 2 * m1 - m2) * t2 + (m1 + m2 - 2 * d21) * t3;
}

export function interpolateCatmullRomUint32(
  p0: number,
  p1: number,
  p2: number,
  p3: number,
  t: number
): number {
  const d10 = subtractUint32AsNumber(p1, p0);
  const d21 = subtractUint32AsNumber(p2, p1);
  const d32 = subtractUint32AsNumber(p3, p2);
  const m1 = 0.5 * (d10 + d21);
  const m2 = 0.5 * (d21 + d32);
  const t2 = t * t;
  const t3 = t2 * t;
  const correction = m1 * t + (3 * d21 - 2 * m1 - m2) * t2 + (m1 + m2 - 2 * d21) * t3;
  return addSignedClamped(p1, Math.round(correction));
}

function getQuantizedProjectionOutputFormat(size: number): 'uint32x2' | 'uint32x3' | undefined {
  switch (size) {
    case 2:
      return 'uint32x2';
    case 3:
      return 'uint32x3';
    default:
      return undefined;
  }
}

export function getWebGLPositionsBufferLayout(positions: GPUDataEvaluator): BufferLayout {
  return {
    name: 'positions',
    stepMode: positions.isConstant ? 'vertex' : 'instance',
    byteStride: positions.stride,
    attributes: [
      {
        attribute: 'positions',
        format: getPositionVertexFormat(positions),
        byteOffset: positions.offset
      }
    ]
  };
}

function getPositionVertexFormat(positions: GPUDataEvaluator): VertexFormat {
  if (positions.size === 1) {
    return positions.type as VertexFormat;
  }
  return `${positions.type}x${positions.size}` as VertexFormat;
}

export function executeWebGLProjection({
  positions,
  output,
  target,
  source,
  bindings,
  modules,
  moduleProps,
  resources
}: {
  positions: GPUDataEvaluator;
  output: GPUDataEvaluator;
  target: Buffer;
  source: string;
  bindings?: BufferTransformProps['bindings'];
  modules?: ProjectionShaderModule[];
  moduleProps?: ProjectionShaderModuleProps;
  resources?: {destroy: () => void}[];
}): Promise<OperationHandlerResult> {
  const transform = new BufferTransform(target.device, {
    vs: source,
    bufferLayout: [getWebGLPositionsBufferLayout(positions)],
    vertexCount: 1,
    instanceCount: output.length,
    feedbackBufferMode: 'interleaved',
    outputs: ['projected'],
    bindings,
    modules
  });

  try {
    if (moduleProps) {
      transform.model.shaderInputs.setProps(moduleProps);
    }
    transform.run({
      inputBuffers: {positions: positions.buffer},
      outputBuffers: {projected: target}
    });
    return Promise.resolve({success: true});
  } finally {
    transform.destroy();
    resources?.forEach(resource => resource.destroy());
  }
}

export function executeWebGPUProjection({
  positions,
  output,
  target,
  extraBindings = [],
  modules,
  moduleProps,
  getSource
}: {
  positions: GPUDataEvaluator;
  output: GPUDataEvaluator;
  target: Buffer;
  extraBindings?: ExtraWebGPUBinding[];
  modules?: ProjectionShaderModule[];
  moduleProps?: ProjectionShaderModuleProps;
  getSource: (context: WebGPUProjectionSourceContext) => string;
}): Promise<OperationHandlerResult> {
  const bindings: WebGPUBinding[] = [];
  if (!positions.isConstant) {
    bindings.push({name: 'positions', table: positions, index: bindings.length});
  }
  for (const binding of extraBindings) {
    bindings.push({...binding, index: bindings.length});
  }

  const resultBindingIndex = bindings.length;
  const source = getSource({
    resultBindingIndex,
    getBindingIndex: (name: string) => {
      const binding = bindings.find(candidate => candidate.name === name);
      if (!binding) {
        throw new Error(`Missing WebGPU projection binding ${name}`);
      }
      return binding.index;
    }
  });

  const computation = new Computation(target.device, {
    source,
    modules,
    shaderInputs: getShaderInputs(modules, moduleProps),
    shaderLayout: {
      bindings: [
        ...bindings.map(({name, index}) => ({
          name,
          type: 'storage' as const,
          group: 0,
          location: index
        })),
        {name: 'result', type: 'storage' as const, group: 0, location: resultBindingIndex},
        ...getShaderModuleUniformBindings(modules)
      ]
    }
  });

  computation.setBindings({
    ...Object.fromEntries(bindings.map(({name, table}) => [name, table.buffer])),
    result: target
  });

  if (modules?.length) {
    computation.updateShaderInputs();
  }

  const computePass = target.device.beginComputePass({});
  computation.dispatch(computePass, Math.ceil(output.length / PROJECTION_WORKGROUP_SIZE));
  computePass.end();
  target.device.submit();
  computation.destroy();

  return Promise.resolve({success: true});
}

function getShaderInputs(
  modules: ProjectionShaderModule[] | undefined,
  moduleProps: ProjectionShaderModuleProps | undefined
): ShaderInputs | undefined {
  if (!modules?.length) {
    return undefined;
  }

  const shaderInputs = new ShaderInputs(
    Object.fromEntries(modules.map(module => [module.name, module]))
  );
  if (moduleProps) {
    shaderInputs.setProps(moduleProps);
  }
  return shaderInputs;
}

function getShaderModuleUniformBindings(
  modules: ProjectionShaderModule[] | undefined
): BindingDeclaration[] {
  if (!modules?.length) {
    return [];
  }

  return getShaderModuleDependencies(modules)
    .filter(module => module.uniformTypes && Object.keys(module.uniformTypes).length > 0)
    .map((module, index) => ({
      name: `${module.name}Uniforms`,
      type: 'uniform' as const,
      group: 0,
      location: WEBGPU_SHADER_MODULE_BINDING_START + index
    }));
}
