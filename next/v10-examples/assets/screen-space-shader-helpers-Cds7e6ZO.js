const e=`fn advancedSceneUV(uv: vec2f) -> vec2f {
  return uv;
}

fn advancedLinearDepth(depth: f32, nearPlane: f32, farPlane: f32) -> f32 {
  return (nearPlane * farPlane) / max(farPlane - depth * (farPlane - nearPlane), 0.0001);
}

fn advancedDepthNormal(depthTexture: texture_depth_2d, depthTextureSampler: sampler, uv: vec2f) -> vec3f {
  let dimensions = vec2i(textureDimensions(depthTexture));
  let coordinate = clamp(vec2i(uv * vec2f(dimensions)), vec2i(0), dimensions - vec2i(1));
  let center = textureLoad(depthTexture, coordinate, 0);
  let right = textureLoad(depthTexture, min(coordinate + vec2i(1, 0), dimensions - vec2i(1)), 0);
  let up = textureLoad(depthTexture, min(coordinate + vec2i(0, 1), dimensions - vec2i(1)), 0);
  return normalize(vec3f((center - right) * f32(dimensions.x), (center - up) * f32(dimensions.y), 1.0));
}
`,t=`
fn temporal_getTexelCoordinate(coordinate: vec2f, dimensions: vec2u) -> vec2i {
  return clamp(vec2i(coordinate * vec2f(dimensions)), vec2i(0), vec2i(dimensions) - vec2i(1));
}

fn temporal_getClipPosition(coordinate: vec2f, depth: f32) -> vec4f {
  return vec4f(coordinate * vec2f(2.0, -2.0) + vec2f(-1.0, 1.0), depth, 1.0);
}

// Returns previous UV, device depth, and validity. Matrices use WebGPU clip depth.
fn temporal_getPreviousFrame(previousClip: vec4f, jitter: vec2f, epsilon: f32) -> vec4f {
  if (previousClip.w <= epsilon) { return vec4f(0.0); }
  let position = previousClip.xyz / previousClip.w;
  let coordinate = position.xy * vec2f(0.5, -0.5) + vec2f(0.5) + jitter;
  let valid = all(coordinate >= vec2f(0.0)) && all(coordinate <= vec2f(1.0)) &&
    position.z >= 0.0 && position.z <= 1.0;
  return vec4f(coordinate, position.z, select(0.0, 1.0, valid));
}

fn temporal_getViewDepth(
  coordinate: vec2f, depth: f32, inverseProjection: mat4x4f, epsilon: f32
) -> f32 {
  let position = inverseProjection * temporal_getClipPosition(coordinate, depth);
  return abs(position.z / max(abs(position.w), epsilon));
}

struct TemporalColorBounds { minimum: vec4f, maximum: vec4f };
fn temporal_getColorBounds(
  sourceTexture: texture_2d<f32>, sourceTextureSampler: sampler,
  coordinate: vec2f, current: vec4f
) -> TemporalColorBounds {
  let texel = 1.0 / vec2f(textureDimensions(sourceTexture));
  var minimum = current;
  var maximum = current;
  for (var vertical = -1; vertical <= 1; vertical++) {
    for (var horizontal = -1; horizontal <= 1; horizontal++) {
      let sampleCoordinate = clamp(coordinate + vec2f(f32(horizontal), f32(vertical)) * texel,
        vec2f(0.0), vec2f(1.0));
      let sample = textureSampleLevel(sourceTexture, sourceTextureSampler, sampleCoordinate, 0);
      minimum = min(minimum, sample);
      maximum = max(maximum, sample);
    }
  }
  return TemporalColorBounds(minimum, maximum);
}

struct TemporalHistoryFootprint { base: vec2i, fraction: vec2f, dimensions: vec2u };
struct TemporalHistoryTap { coordinate: vec2i, normalizedCoordinate: vec2f, weight: f32 };
fn temporal_getHistoryFootprint(coordinate: vec2f, dimensions: vec2u) -> TemporalHistoryFootprint {
  let position = coordinate * vec2f(dimensions) - vec2f(0.5);
  return TemporalHistoryFootprint(vec2i(floor(position)), fract(position), dimensions);
}
fn temporal_getHistoryTap(footprint: TemporalHistoryFootprint, offset: vec2i) -> TemporalHistoryTap {
  let coordinate = clamp(footprint.base + offset, vec2i(0), vec2i(footprint.dimensions) - vec2i(1));
  let horizontalWeight = select(1.0 - footprint.fraction.x, footprint.fraction.x, offset.x == 1);
  let verticalWeight = select(1.0 - footprint.fraction.y, footprint.fraction.y, offset.y == 1);
  return TemporalHistoryTap(coordinate,
    (vec2f(coordinate) + vec2f(0.5)) / vec2f(footprint.dimensions), horizontalWeight * verticalWeight);
}
`;export{e as d,t};
