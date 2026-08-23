import type {GPUDataEvaluator} from '@luma.gl/gpgpu';

export type Float32Parts = {
  high: number;
  low: number;
};

export function makeFloat32Parts(value: number): Float32Parts {
  const high = Math.fround(value);
  return {high, low: value - high};
}

export function formatShaderFloat(value: number): string {
  if (!Number.isFinite(value)) {
    throw new Error(`Cannot format non-finite shader float ${value}`);
  }
  if (Object.is(value, -0)) {
    return '-0.0';
  }
  if (Number.isInteger(value)) {
    return `${value}.0`;
  }
  return value.toPrecision(17);
}

export function formatDoubleSingleConstructor(
  value: number,
  constructorName: string = 'DoubleSingle'
): string {
  const {high, low} = makeFloat32Parts(value);
  return `${constructorName}(${formatShaderFloat(high)}, ${formatShaderFloat(low)})`;
}

export function getGLSLProjectionShaderSource({
  positions,
  output,
  extraPrecision = '',
  uniforms = '',
  projectionFunctions,
  projectedExpression = 'uvec2(projectLongitude(longitude), projectLatitude(latitude))'
}: {
  positions: GPUDataEvaluator;
  output?: GPUDataEvaluator;
  extraPrecision?: string;
  uniforms?: string;
  projectionFunctions: string;
  projectedExpression?: string;
}): string {
  const positionType = getGLSLPositionType(positions);
  const projectedType = getGLSLUintVectorType(output?.size ?? 2);
  const extraPrecisionBlock = extraPrecision ? `${extraPrecision}\n` : '';
  const uniformsBlock = uniforms ? `\n${uniforms}\n` : '';

  return /* glsl */ `\
#version 300 es

precision highp float;
precision highp int;
${extraPrecisionBlock}
in ${positionType} positions;
flat out ${projectedType} projected;
${uniformsBlock}
${getGLSLDoublePrecisionMathModule()}
${getGLSLGeospatialProjectionModule()}
${projectionFunctions}

void main() {
${getPositionQuantizedGLSL(positions)}
  projected = ${projectedExpression};
}
`;
}

export function getWGSLProjectionShaderSource({
  positions,
  output,
  extraBindings = '',
  projectionFunctions,
  projectedExpression = 'vec2<u32>(projectLongitude(longitude), projectLatitude(latitude))',
  resultBindingIndex,
  workgroupSize
}: {
  positions: GPUDataEvaluator;
  output: GPUDataEvaluator;
  extraBindings?: string;
  projectionFunctions: string;
  projectedExpression?: string;
  resultBindingIndex: number;
  workgroupSize: number;
}): string {
  const positionScalarType = getWGSLPositionScalarType(positions);
  const positionBinding = positions.isConstant
    ? ''
    : `@group(0) @binding(0) var<storage, read> positions: array<${positionScalarType}>;\n`;
  const extraBindingsBlock = extraBindings ? `${extraBindings}\n` : '';
  const positionConstantValues = positions.isConstant
    ? getConstantPositionValues(positions)
        .map(value => formatPositionLiteralWGSL(positions, value))
        .join(', ')
    : '';

  return /* wgsl */ `
${positionBinding}${extraBindingsBlock}@group(0) @binding(${resultBindingIndex}) var<storage, read_write> result: array<u32>;

${getWGSLDoublePrecisionMathModule()}
${getWGSLGeospatialProjectionModule()}
${projectionFunctions}

fn readPosition(rowIndex: u32) -> array<${positionScalarType}, ${positions.size}> {
${getReadPositionWGSL(positions, positionConstantValues)}
}

fn writeResult(rowIndex: u32, value: ${getWGSLUintVectorType(output.size)}) {
  let rowOffset = ${output.offset / output.ValueType.BYTES_PER_ELEMENT}u + rowIndex * ${output.stride / output.ValueType.BYTES_PER_ELEMENT}u;
${Array.from({length: output.size}, (_, index) => `  result[rowOffset + ${index}u] = value.${getWGSLVectorComponent(index)};`).join('\n')}
}

@compute @workgroup_size(${workgroupSize}) fn main(
  @builtin(global_invocation_id) globalInvocationId: vec3<u32>
) {
  let rowIndex = globalInvocationId.x;
  if (rowIndex >= ${output.length}u) {
    return;
  }

  let position = readPosition(rowIndex);
${getPositionQuantizedWGSL(positions)}

  writeResult(rowIndex, ${projectedExpression});
}
`;
}

export function getWGSLDoublePrecisionMathModule(): string {
  return /* wgsl */ `
struct DoubleSingle {
  high: f32,
  low: f32,
}

fn dsFromF32(value: f32) -> DoubleSingle {
  return DoubleSingle(value, 0.0);
}

fn fp32(value: f32) -> f32 {
  return bitcast<f32>(bitcast<u32>(value));
}

fn dsNormalize(high: f32, low: f32) -> DoubleSingle {
  let sum = fp32(high + low);
  let error = fp32(low - fp32(sum - high));
  return DoubleSingle(sum, error);
}

fn dsAdd(a: DoubleSingle, b: DoubleSingle) -> DoubleSingle {
  let sum = fp32(a.high + b.high);
  let v = fp32(sum - a.high);
  let error = fp32(
    fp32(a.high - fp32(sum - v)) +
    fp32(b.high - v) +
    fp32(a.low + b.low)
  );
  return dsNormalize(sum, error);
}

fn dsSub(a: DoubleSingle, b: DoubleSingle) -> DoubleSingle {
  return dsAdd(a, DoubleSingle(-b.high, -b.low));
}

fn dsMul(a: DoubleSingle, b: DoubleSingle) -> DoubleSingle {
  let product = fp32(a.high * b.high);
  let error = fp32(
    fma(a.high, b.high, -product) +
    fp32(a.high * b.low) +
    fp32(a.low * b.high)
  );
  return dsNormalize(product, error);
}

fn dsMulScalar(a: DoubleSingle, scalar: f32) -> DoubleSingle {
  let product = fp32(a.high * scalar);
  let error = fp32(fma(a.high, scalar, -product) + fp32(a.low * scalar));
  return dsNormalize(product, error);
}

fn dsLessThan(a: DoubleSingle, b: DoubleSingle) -> bool {
  return a.high < b.high || (a.high == b.high && a.low < b.low);
}

fn dsLessThanOrEqual(a: DoubleSingle, b: DoubleSingle) -> bool {
  return a.high < b.high || (a.high == b.high && a.low <= b.low);
}

fn dsGreaterThanOrEqual(a: DoubleSingle, b: DoubleSingle) -> bool {
  return !dsLessThan(a, b);
}

fn dsClamp(value: DoubleSingle, minValue: DoubleSingle, maxValue: DoubleSingle) -> DoubleSingle {
  if (dsLessThan(value, minValue)) {
    return minValue;
  }
  if (dsLessThan(maxValue, value)) {
    return maxValue;
  }
  return value;
}

fn dsFloorToI32(value: DoubleSingle) -> i32 {
  var candidate = i32(floor(value.high));
  let residual = (value.high - f32(candidate)) + value.low;
  if (residual < 0.0) {
    candidate = candidate - 1;
  } else if (residual >= 1.0) {
    candidate = candidate + 1;
  }
  return candidate;
}

fn dsZero() -> DoubleSingle {
  return DoubleSingle(0.0, 0.0);
}

fn dsOne() -> DoubleSingle {
  return DoubleSingle(1.0, 0.0);
}

fn interpolateCatmullRomDoubleSingle(
  p0: DoubleSingle,
  p1: DoubleSingle,
  p2: DoubleSingle,
  p3: DoubleSingle,
  t: f32
) -> DoubleSingle {
  let d10 = dsSub(p1, p0);
  let d21 = dsSub(p2, p1);
  let d32 = dsSub(p3, p2);
  let m1 = dsMulScalar(dsAdd(d10, d21), 0.5);
  let m2 = dsMulScalar(dsAdd(d21, d32), 0.5);
  let t2 = t * t;
  let t3 = t2 * t;
  let correction = dsAdd(
    dsAdd(
      dsMulScalar(m1, t),
      dsMulScalar(dsSub(dsSub(dsMulScalar(d21, 3.0), dsMulScalar(m1, 2.0)), m2), t2)
    ),
    dsMulScalar(dsAdd(dsSub(m1, dsMulScalar(d21, 2.0)), m2), t3)
  );
  return dsAdd(p1, correction);
}
`;
}

export function getWGSLGeospatialProjectionModule(): string {
  const oneOver360 = formatDoubleSingleConstructor(1 / 360);
  const degreesPerHighWord = formatDoubleSingleConstructor((65536 * 360) / 0xffffffff);
  const degreesPerLowWord = formatDoubleSingleConstructor(360 / 0xffffffff);

  return /* wgsl */ `
fn quantizeUnitToU32(unitInput: DoubleSingle) -> u32 {
  let unit = dsClamp(unitInput, dsZero(), dsOne());
  if (dsLessThanOrEqual(unit, dsZero())) {
    return 0u;
  }
  if (dsGreaterThanOrEqual(unit, dsOne())) {
    return 0xffffffffu;
  }

  var highWord = clamp(i32(floor(unit.high * 65536.0)), 0, 65535);
  let highWordUnit = f32(highWord) * 0.0000152587890625;
  let highRemainder = unit.high - highWordUnit;
  let lowWordPosition =
    highRemainder * 4294967296.0 +
    -unit.high +
    0.5;
  var lowWord = i32(floor(lowWordPosition));

  if (lowWord < 0) {
    if (highWord == 0) {
      return 0u;
    }
    highWord = highWord - 1;
    lowWord = lowWord + 65536;
  } else if (lowWord > 65535) {
    highWord = highWord + 1;
    lowWord = lowWord - 65536;
    if (highWord > 65535) {
      return 0xffffffffu;
    }
  }

  let highOnlyValue = (u32(highWord) << 16u) | u32(lowWord);
  let lowCorrectionValue = unit.low * 4294967296.0;
  var lowCorrection: i32;
  if (lowCorrectionValue >= 0.0) {
    lowCorrection = i32(floor(lowCorrectionValue + 0.5));
  } else {
    lowCorrection = -i32(floor(-lowCorrectionValue + 0.5));
  }
  return addSignedClamped(highOnlyValue, lowCorrection);
}

fn addUnsignedClamped(value: u32, delta: u32) -> u32 {
  if (value > 0xffffffffu - delta) {
    return 0xffffffffu;
  }
  return value + delta;
}

fn subtractUnsignedClamped(value: u32, delta: u32) -> u32 {
  if (value < delta) {
    return 0u;
  }
  return value - delta;
}

fn addSignedClamped(base: u32, delta: i32) -> u32 {
  if (delta >= 0) {
    let positiveDelta = u32(delta);
    if (base > 0xffffffffu - positiveDelta) {
      return 0xffffffffu;
    }
    return base + positiveDelta;
  }

  let negativeDelta = u32(-delta);
  if (base < negativeDelta) {
    return 0u;
  }
  return base - negativeDelta;
}

fn addSignedDelta(value: u32, delta: u32, negative: bool) -> u32 {
  if (negative) {
    return subtractUnsignedClamped(value, delta);
  }
  return addUnsignedClamped(value, delta);
}

fn multiplyUint32ByQuantizedScale(value: u32, scale: u32) -> u32 {
  let valueLow = value & 0xffffu;
  let valueHigh = value >> 16u;
  let scaleLow = scale & 0xffffu;
  let scaleHigh = scale >> 16u;
  let productLow = valueLow * scaleLow;
  let productMid1 = valueLow * scaleHigh;
  let productMid2 = valueHigh * scaleLow;
  let productHigh = valueHigh * scaleHigh;
  let middleLow = (productLow >> 16u) + (productMid1 & 0xffffu) + (productMid2 & 0xffffu);
  var high = productHigh + (productMid1 >> 16u) + (productMid2 >> 16u) + (middleLow >> 16u);
  let low = ((middleLow & 0xffffu) << 16u) | (productLow & 0xffffu);
  if (low >= 0x80000000u && high < 0xffffffffu) {
    high = high + 1u;
  }
  return high;
}

fn multiplyUint32ByQ31(value: u32, scale: u32) -> u32 {
  if (scale == 0x80000000u) {
    return value;
  }
  return multiplyUint32ByQuantizedScale(value, scale << 1u);
}

fn multiplyUint32ByQ24(value: u32, scale: u32) -> u32 {
  let valueLow = value & 0xffffu;
  let valueHigh = value >> 16u;
  let scaleLow = scale & 0xffffu;
  let scaleHigh = scale >> 16u;
  let productLow = valueLow * scaleLow;
  let productMid1 = valueLow * scaleHigh;
  let productMid2 = valueHigh * scaleLow;
  let productHigh = valueHigh * scaleHigh;
  let middleLow = (productLow >> 16u) + (productMid1 & 0xffffu) + (productMid2 & 0xffffu);
  let high = productHigh + (productMid1 >> 16u) + (productMid2 >> 16u) + (middleLow >> 16u);
  var low = ((middleLow & 0xffffu) << 16u) | (productLow & 0xffffu);
  if (low <= 0xff7fffffu) {
    low = low + 0x800000u;
  } else {
    low = low + 0x800000u;
    let roundedHigh = high + 1u;
    if (roundedHigh >= 0x01000000u) {
      return 0xffffffffu;
    }
    return (roundedHigh << 8u) | (low >> 24u);
  }
  if (high >= 0x01000000u) {
    return 0xffffffffu;
  }
  return (high << 8u) | (low >> 24u);
}

fn subtractU32AsF32(a: u32, b: u32) -> f32 {
  if (a >= b) {
    return f32(a - b);
  }
  return -f32(b - a);
}

fn interpolateCatmullRomUint32(p0: u32, p1: u32, p2: u32, p3: u32, t: f32) -> u32 {
  let d10 = subtractU32AsF32(p1, p0);
  let d21 = subtractU32AsF32(p2, p1);
  let d32 = subtractU32AsF32(p3, p2);
  let m1 = 0.5 * (d10 + d21);
  let m2 = 0.5 * (d21 + d32);
  let t2 = t * t;
  let t3 = t2 * t;
  let correction = m1 * t + (3.0 * d21 - 2.0 * m1 - m2) * t2 + (m1 + m2 - 2.0 * d21) * t3;
  return addSignedClamped(p1, i32(floor(correction + 0.5)));
}

fn oneOver360() -> DoubleSingle {
  return ${oneOver360};
}

fn degreesPerHighWord() -> DoubleSingle {
  return ${degreesPerHighWord};
}

fn degreesPerLowWord() -> DoubleSingle {
  return ${degreesPerLowWord};
}

fn quantizedDegreesToDoubleSingle(value: u32) -> DoubleSingle {
  let highWord = value >> 16u;
  let lowWord = value & 0xffffu;
  return dsSub(
    dsAdd(
      dsMul(dsFromF32(f32(highWord)), degreesPerHighWord()),
      dsMul(dsFromF32(f32(lowWord)), degreesPerLowWord())
    ),
    DoubleSingle(180.0, 0.0)
  );
}

fn quantizedDegreesToF32(value: u32) -> f32 {
  let degrees = quantizedDegreesToDoubleSingle(value);
  return degrees.high + degrees.low;
}

fn projectDegrees180ToQuantized(degrees: DoubleSingle) -> u32 {
  let clampedDegrees = dsClamp(degrees, DoubleSingle(-180.0, 0.0), DoubleSingle(180.0, 0.0));
  if (dsLessThanOrEqual(clampedDegrees, DoubleSingle(-180.0, 0.0))) {
    return 0u;
  }
  if (dsGreaterThanOrEqual(clampedDegrees, DoubleSingle(180.0, 0.0))) {
    return 0xffffffffu;
  }

  var highWord = clamp(
    i32(floor((clampedDegrees.high + 180.0) * 182.04444885253906)),
    0,
    65535
  );
  let highWordStartDegrees = f32(highWord - 32768) * 0.0054931640625;
  let highResidualDegrees = fp32(clampedDegrees.high - highWordStartDegrees);
  var lowWord = i32(floor(
    fp32(highResidualDegrees * 11930465.0) -
    fp32(f32(highWord) * 0.0000152587890625) +
    0.5
  ));

  if (lowWord < 0) {
    if (highWord == 0) {
      return 0u;
    }
    highWord = highWord - 1;
    lowWord = lowWord + 65536;
  } else if (lowWord > 65535) {
    highWord = highWord + 1;
    lowWord = lowWord - 65536;
    if (highWord > 65535) {
      return 0xffffffffu;
    }
  }

  let highOnlyValue = (u32(highWord) << 16u) | u32(lowWord);
  let lowCorrectionValue = clampedDegrees.low * 11930465.0;
  var lowCorrection: i32;
  if (lowCorrectionValue >= 0.0) {
    lowCorrection = i32(floor(lowCorrectionValue + 0.5));
  } else {
    lowCorrection = -i32(floor(-lowCorrectionValue + 0.5));
  }
  return addSignedClamped(highOnlyValue, lowCorrection);
}

fn projectLongitude(longitude: u32) -> u32 {
  return longitude;
}
`;
}

export function getGLSLDoublePrecisionMathModule(): string {
  return /* glsl */ `
struct DoubleSingle {
  float high;
  float low;
};

DoubleSingle dsFromFloat(float value) {
  return DoubleSingle(value, 0.0);
}

float fp32(float value) {
  return uintBitsToFloat(floatBitsToUint(value));
}

DoubleSingle dsNormalize(float high, float low) {
  float sum = fp32(high + low);
  float delta = fp32(sum - high);
  float error = fp32(low - delta);
  return DoubleSingle(sum, error);
}

DoubleSingle dsAdd(DoubleSingle a, DoubleSingle b) {
  float sum = fp32(a.high + b.high);
  float v = fp32(sum - a.high);
  float aError = fp32(a.high - fp32(sum - v));
  float bError = fp32(b.high - v);
  float highError = fp32(aError + bError);
  float lowError = fp32(a.low + b.low);
  float error = fp32(highError + lowError);
  return dsNormalize(sum, error);
}

DoubleSingle dsSub(DoubleSingle a, DoubleSingle b) {
  return dsAdd(a, DoubleSingle(-b.high, -b.low));
}

float twoProductResidual(float a, float b, float product) {
  float splitA = fp32(a * 4097.0);
  float splitB = fp32(b * 4097.0);
  float aHigh = fp32(splitA - fp32(splitA - a));
  float bHigh = fp32(splitB - fp32(splitB - b));
  float aLow = fp32(a - aHigh);
  float bLow = fp32(b - bHigh);
  return fp32(
    fp32(fp32(aHigh * bHigh) - product) +
    fp32(aHigh * bLow) +
    fp32(aLow * bHigh) +
    fp32(aLow * bLow)
  );
}

DoubleSingle dsMul(DoubleSingle a, DoubleSingle b) {
  float product = fp32(a.high * b.high);
  float error = fp32(
    twoProductResidual(a.high, b.high, product) +
    fp32(a.high * b.low) +
    fp32(a.low * b.high)
  );
  return dsNormalize(product, error);
}

DoubleSingle dsMulScalar(DoubleSingle a, float scalar) {
  float product = fp32(a.high * scalar);
  float error = fp32(twoProductResidual(a.high, scalar, product) + fp32(a.low * scalar));
  return dsNormalize(product, error);
}

bool dsLessThan(DoubleSingle a, DoubleSingle b) {
  return a.high < b.high || (a.high == b.high && a.low < b.low);
}

bool dsLessThanOrEqual(DoubleSingle a, DoubleSingle b) {
  return a.high < b.high || (a.high == b.high && a.low <= b.low);
}

bool dsGreaterThanOrEqual(DoubleSingle a, DoubleSingle b) {
  return !dsLessThan(a, b);
}

DoubleSingle dsClamp(DoubleSingle value, DoubleSingle minValue, DoubleSingle maxValue) {
  if (dsLessThan(value, minValue)) {
    return minValue;
  }
  if (dsLessThan(maxValue, value)) {
    return maxValue;
  }
  return value;
}

int dsFloorToInt(DoubleSingle value) {
  int candidate = int(floor(value.high));
  float residual = (value.high - float(candidate)) + value.low;
  if (residual < 0.0) {
    candidate = candidate - 1;
  } else if (residual >= 1.0) {
    candidate = candidate + 1;
  }
  return candidate;
}

DoubleSingle dsZero() {
  return DoubleSingle(0.0, 0.0);
}

DoubleSingle dsOne() {
  return DoubleSingle(1.0, 0.0);
}

DoubleSingle interpolateCatmullRomDoubleSingle(
  DoubleSingle p0,
  DoubleSingle p1,
  DoubleSingle p2,
  DoubleSingle p3,
  float t
) {
  DoubleSingle d10 = dsSub(p1, p0);
  DoubleSingle d21 = dsSub(p2, p1);
  DoubleSingle d32 = dsSub(p3, p2);
  DoubleSingle m1 = dsMulScalar(dsAdd(d10, d21), 0.5);
  DoubleSingle m2 = dsMulScalar(dsAdd(d21, d32), 0.5);
  float t2 = t * t;
  float t3 = t2 * t;
  DoubleSingle correction = dsAdd(
    dsAdd(
      dsMulScalar(m1, t),
      dsMulScalar(dsSub(dsSub(dsMulScalar(d21, 3.0), dsMulScalar(m1, 2.0)), m2), t2)
    ),
    dsMulScalar(dsAdd(dsSub(m1, dsMulScalar(d21, 2.0)), m2), t3)
  );
  return dsAdd(p1, correction);
}
`;
}

export function getGLSLGeospatialProjectionModule(): string {
  const oneOver360 = formatDoubleSingleConstructor(1 / 360);
  const degreesPerHighWord = formatDoubleSingleConstructor((65536 * 360) / 0xffffffff);
  const degreesPerLowWord = formatDoubleSingleConstructor(360 / 0xffffffff);

  return /* glsl */ `
uint addUnsignedClamped(uint value, uint delta) {
  if (value > 0xffffffffu - delta) {
    return 0xffffffffu;
  }
  return value + delta;
}

uint subtractUnsignedClamped(uint value, uint delta) {
  if (value < delta) {
    return 0u;
  }
  return value - delta;
}

uint addSignedClamped(uint base, int delta) {
  if (delta >= 0) {
    uint positiveDelta = uint(delta);
    if (base > 0xffffffffu - positiveDelta) {
      return 0xffffffffu;
    }
    return base + positiveDelta;
  }

  uint negativeDelta = uint(-delta);
  if (base < negativeDelta) {
    return 0u;
  }
  return base - negativeDelta;
}

uint addSignedDelta(uint value, uint delta, bool negative) {
  return negative ? subtractUnsignedClamped(value, delta) : addUnsignedClamped(value, delta);
}

uint multiplyUint32ByQuantizedScale(uint value, uint scale) {
  uint valueLow = value & 0xffffu;
  uint valueHigh = value >> 16u;
  uint scaleLow = scale & 0xffffu;
  uint scaleHigh = scale >> 16u;
  uint productLow = valueLow * scaleLow;
  uint productMid1 = valueLow * scaleHigh;
  uint productMid2 = valueHigh * scaleLow;
  uint productHigh = valueHigh * scaleHigh;
  uint middleLow = (productLow >> 16u) + (productMid1 & 0xffffu) + (productMid2 & 0xffffu);
  uint high = productHigh + (productMid1 >> 16u) + (productMid2 >> 16u) + (middleLow >> 16u);
  uint low = ((middleLow & 0xffffu) << 16u) | (productLow & 0xffffu);
  if (low >= 0x80000000u && high < 0xffffffffu) {
    high = high + 1u;
  }
  return high;
}

uint multiplyUint32ByQ31(uint value, uint scale) {
  if (scale == 0x80000000u) {
    return value;
  }
  return multiplyUint32ByQuantizedScale(value, scale << 1u);
}

uint multiplyUint32ByQ24(uint value, uint scale) {
  uint valueLow = value & 0xffffu;
  uint valueHigh = value >> 16u;
  uint scaleLow = scale & 0xffffu;
  uint scaleHigh = scale >> 16u;
  uint productLow = valueLow * scaleLow;
  uint productMid1 = valueLow * scaleHigh;
  uint productMid2 = valueHigh * scaleLow;
  uint productHigh = valueHigh * scaleHigh;
  uint middleLow = (productLow >> 16u) + (productMid1 & 0xffffu) + (productMid2 & 0xffffu);
  uint high = productHigh + (productMid1 >> 16u) + (productMid2 >> 16u) + (middleLow >> 16u);
  uint low = ((middleLow & 0xffffu) << 16u) | (productLow & 0xffffu);
  if (low <= 0xff7fffffu) {
    low = low + 0x800000u;
  } else {
    low = low + 0x800000u;
    uint roundedHigh = high + 1u;
    if (roundedHigh >= 0x01000000u) {
      return 0xffffffffu;
    }
    return (roundedHigh << 8u) | (low >> 24u);
  }
  if (high >= 0x01000000u) {
    return 0xffffffffu;
  }
  return (high << 8u) | (low >> 24u);
}

uint quantizeUnitToU32(DoubleSingle unitInput) {
  DoubleSingle unit = dsClamp(unitInput, dsZero(), dsOne());
  if (dsLessThanOrEqual(unit, dsZero())) {
    return 0u;
  }
  if (dsGreaterThanOrEqual(unit, dsOne())) {
    return 0xffffffffu;
  }

  int highWord = clamp(int(floor(unit.high * 65536.0)), 0, 65535);
  float highWordUnit = float(highWord) * 0.0000152587890625;
  float highRemainder = unit.high - highWordUnit;
  float lowWordPosition =
    highRemainder * 4294967296.0 +
    -unit.high +
    0.5;
  int lowWord = int(floor(lowWordPosition));

  if (lowWord < 0) {
    if (highWord == 0) {
      return 0u;
    }
    highWord = highWord - 1;
    lowWord = lowWord + 65536;
  } else if (lowWord > 65535) {
    highWord = highWord + 1;
    lowWord = lowWord - 65536;
    if (highWord > 65535) {
      return 0xffffffffu;
    }
  }

  uint highOnlyValue = (uint(highWord) << 16u) | uint(lowWord);
  float lowCorrectionValue = unit.low * 4294967296.0;
  int lowCorrection;
  if (lowCorrectionValue >= 0.0) {
    lowCorrection = int(floor(lowCorrectionValue + 0.5));
  } else {
    lowCorrection = -int(floor(-lowCorrectionValue + 0.5));
  }
  return addSignedClamped(highOnlyValue, lowCorrection);
}

float subtractU32AsFloat(uint a, uint b) {
  if (a >= b) {
    return float(a - b);
  }
  return -float(b - a);
}

uint interpolateCatmullRomUint32(uint p0, uint p1, uint p2, uint p3, float t) {
  float d10 = subtractU32AsFloat(p1, p0);
  float d21 = subtractU32AsFloat(p2, p1);
  float d32 = subtractU32AsFloat(p3, p2);
  float m1 = 0.5 * (d10 + d21);
  float m2 = 0.5 * (d21 + d32);
  float t2 = t * t;
  float t3 = t2 * t;
  float correction = m1 * t + (3.0 * d21 - 2.0 * m1 - m2) * t2 + (m1 + m2 - 2.0 * d21) * t3;
  return addSignedClamped(p1, int(floor(correction + 0.5)));
}

DoubleSingle oneOver360() {
  return ${oneOver360};
}

DoubleSingle degreesPerHighWord() {
  return ${degreesPerHighWord};
}

DoubleSingle degreesPerLowWord() {
  return ${degreesPerLowWord};
}

DoubleSingle quantizedDegreesToDoubleSingle(uint value) {
  uint highWord = value >> 16u;
  uint lowWord = value & 0xffffu;
  return dsSub(
    dsAdd(
      dsMul(dsFromFloat(float(highWord)), degreesPerHighWord()),
      dsMul(dsFromFloat(float(lowWord)), degreesPerLowWord())
    ),
    DoubleSingle(180.0, 0.0)
  );
}

float quantizedDegreesToFloat(uint value) {
  DoubleSingle degrees = quantizedDegreesToDoubleSingle(value);
  return degrees.high + degrees.low;
}

uint projectDegrees180ToQuantized(DoubleSingle degrees) {
  DoubleSingle clampedDegrees = dsClamp(degrees, DoubleSingle(-180.0, 0.0), DoubleSingle(180.0, 0.0));
  if (dsLessThanOrEqual(clampedDegrees, DoubleSingle(-180.0, 0.0))) {
    return 0u;
  }
  if (dsGreaterThanOrEqual(clampedDegrees, DoubleSingle(180.0, 0.0))) {
    return 0xffffffffu;
  }

  int highWord = clamp(
    int(floor((clampedDegrees.high + 180.0) * 182.04444885253906)),
    0,
    65535
  );
  float highWordStartDegrees = float(highWord - 32768) * 0.0054931640625;
  float highResidualDegrees = fp32(clampedDegrees.high - highWordStartDegrees);
  int lowWord = int(floor(
    fp32(highResidualDegrees * 11930465.0) -
    fp32(float(highWord) * 0.0000152587890625) +
    0.5
  ));

  if (lowWord < 0) {
    if (highWord == 0) {
      return 0u;
    }
    highWord = highWord - 1;
    lowWord = lowWord + 65536;
  } else if (lowWord > 65535) {
    highWord = highWord + 1;
    lowWord = lowWord - 65536;
    if (highWord > 65535) {
      return 0xffffffffu;
    }
  }

  uint highOnlyValue = (uint(highWord) << 16u) | uint(lowWord);
  float lowCorrectionValue = clampedDegrees.low * 11930465.0;
  int lowCorrection;
  if (lowCorrectionValue >= 0.0) {
    lowCorrection = int(floor(lowCorrectionValue + 0.5));
  } else {
    lowCorrection = -int(floor(-lowCorrectionValue + 0.5));
  }
  return addSignedClamped(highOnlyValue, lowCorrection);
}

uint projectLongitude(uint longitude) {
  return longitude;
}
`;
}

export function getPositionQuantizedWGSL(positions: GPUDataEvaluator): string {
  return `  let longitude = position[0];
  let latitude = position[1];${positions.size >= 3 ? '\n  let altitude = position[2];' : ''}`;
}

export function getPositionQuantizedGLSL(positions: GPUDataEvaluator): string {
  return `  uint longitude = positions.x;
  uint latitude = positions.y;${positions.size >= 3 ? '\n  uint altitude = positions.z;' : ''}`;
}

export function getReadPositionWGSL(
  positions: GPUDataEvaluator,
  positionConstantValues: string
): string {
  const positionScalarType = getWGSLPositionScalarType(positions);
  if (positions.isConstant) {
    return `  return array<${positionScalarType}, ${positions.size}>(${positionConstantValues});`;
  }

  const offset = positions.offset / positions.ValueType.BYTES_PER_ELEMENT;
  const stride = positions.stride / positions.ValueType.BYTES_PER_ELEMENT;
  const elements = Array.from(
    {length: positions.size},
    (_, index) => `positions[rowOffset + ${index}u]`
  ).join(', ');
  return `  let rowOffset = ${offset}u + rowIndex * ${stride}u;
  return array<${positionScalarType}, ${positions.size}>(${elements});`;
}

export function getConstantPositionValues(positions: GPUDataEvaluator): number[] {
  const values = positions.value;
  if (!values) {
    throw new Error(`Constant input ${positions} is missing CPU values`);
  }
  return Array.from({length: positions.size}, (_, index) => Number(values[index] ?? 0));
}

function getGLSLPositionType(positions: GPUDataEvaluator): string {
  const prefix = positions.type === 'uint32' ? 'uvec' : 'vec';
  return `${prefix}${positions.size}`;
}

function getGLSLUintVectorType(size: number): string {
  return size === 1 ? 'uint' : `uvec${size}`;
}

function getWGSLUintVectorType(size: number): string {
  return size === 1 ? 'u32' : `vec${size}<u32>`;
}

function getWGSLVectorComponent(index: number): string {
  return ['x', 'y', 'z', 'w'][index] ?? `__invalid_component_${index}`;
}

function getWGSLPositionScalarType(positions: GPUDataEvaluator): 'f32' | 'u32' {
  return positions.type === 'uint32' ? 'u32' : 'f32';
}

function formatPositionLiteralWGSL(positions: GPUDataEvaluator, value: number): string {
  return positions.type === 'uint32' ? `${Number(value) >>> 0}u` : formatShaderFloat(value);
}
