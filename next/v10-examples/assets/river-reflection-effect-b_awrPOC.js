import{t as b}from"./screen-space-shader-helpers-Cds7e6ZO.js";import{a as M,B as z}from"./scene-buffer-effect-Bq4_aRU0.js";import{k as i}from"./deck-example-device-TQPRJnZ6.js";const h=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],V={name:"ssrCameraTemporal",source:`
${b}
struct SSRCameraTemporalUniforms {
  currentClipToPreviousClip: mat4x4f,
  currentViewToPreviousView: mat4x4f,
  previousInverseProjectionMatrix: mat4x4f,
  historyWeight: f32,
  depthThreshold: f32,
  normalThreshold: f32,
};
@group(0) @binding(auto) var<uniform> ssrCameraTemporal: SSRCameraTemporalUniforms;
@group(0) @binding(auto) var depthTexture: texture_depth_2d;
@group(0) @binding(auto) var normalTexture: texture_2d<f32>;
@group(0) @binding(auto) var historyTexture: texture_2d<f32>;
@group(0) @binding(auto) var previousDepthTexture: texture_2d<f32>;
@group(0) @binding(auto) var previousNormalTexture: texture_2d<f32>;

fn ssrCameraTemporal_sampleColor(
  sourceTexture: texture_2d<f32>, sourceTextureSampler: sampler,
  texSize: vec2f, texCoord: vec2f
) -> vec4f {
  let current = textureSampleLevel(sourceTexture, sourceTextureSampler, texCoord, 0);
  let currentDepth = textureLoad(depthTexture,
    temporal_getTexelCoordinate(texCoord, textureDimensions(depthTexture)), 0);
  if (currentDepth >= 0.99999 || ssrCameraTemporal.historyWeight <= 0.0) {return current;}
  let previousClip = ssrCameraTemporal.currentClipToPreviousClip *
    temporal_getClipPosition(texCoord, currentDepth);
  let previousFrame = temporal_getPreviousFrame(previousClip, vec2f(0.0), 0.000001);
  if (previousFrame.w < 0.5 || previousFrame.z >= 1.0) {return current;}
  let previousCoordinate = previousFrame.xy;
  let currentSurface = textureLoad(normalTexture,
    temporal_getTexelCoordinate(texCoord, textureDimensions(normalTexture)), 0);
  let expectedNormal = normalize((ssrCameraTemporal.currentViewToPreviousView *
    vec4f(currentSurface.xyz * 2.0 - 1.0, 0.0)).xyz);
  let expectedDepth = temporal_getViewDepth(previousCoordinate, previousFrame.z,
    ssrCameraTemporal.previousInverseProjectionMatrix, 0.000001);
  let footprint = temporal_getHistoryFootprint(previousCoordinate, textureDimensions(historyTexture));
  var accumulatedHistory = vec4f(0.0);
  var accumulatedWeight = 0.0;
  // Validate each bilinear tap before mixing to avoid borrowing a foreground edge's history.
  for (var vertical = 0; vertical < 2; vertical++) {
    for (var horizontal = 0; horizontal < 2; horizontal++) {
      let tap = temporal_getHistoryTap(footprint, vec2i(horizontal, vertical));
      let tapCoordinate = tap.normalizedCoordinate;
      let packedDepth = textureLoad(previousDepthTexture,
        temporal_getTexelCoordinate(tapCoordinate, textureDimensions(previousDepthTexture)), 0).rgb;
      let depth = dot(round(packedDepth * 255.0), vec3f(65536.0, 256.0, 1.0)) / 16777215.0;
      let surface = textureLoad(previousNormalTexture,
        temporal_getTexelCoordinate(tapCoordinate, textureDimensions(previousNormalTexture)), 0);
      let normal = normalize(surface.xyz * 2.0 - 1.0);
      let depthDifference = abs(temporal_getViewDepth(tapCoordinate, depth,
        ssrCameraTemporal.previousInverseProjectionMatrix, 0.000001) - expectedDepth) /
        max(expectedDepth, 0.000001);
      let valid = depth < 0.99999 && depthDifference <= ssrCameraTemporal.depthThreshold &&
        dot(normal, expectedNormal) >= ssrCameraTemporal.normalThreshold &&
        abs(surface.a - currentSurface.a) < 0.05;
      let weight = select(0.0, tap.weight, valid);
      accumulatedHistory += textureLoad(historyTexture, tap.coordinate, 0) * weight;
      accumulatedWeight += weight;
    }
  }
  if (accumulatedWeight <= 0.000001) {return current;}
  let history = accumulatedHistory / accumulatedWeight;
  let bounds = temporal_getColorBounds(sourceTexture, sourceTextureSampler, texCoord, current);
  // Missing rays may retain confidence briefly, but never increase it without current support.
  let weight = clamp(ssrCameraTemporal.historyWeight, 0.0, 0.97);
  if (bounds.maximum.a <= 0.001) {return vec4f(history.rgb, history.a * weight);}
  return mix(current, clamp(history, bounds.minimum, bounds.maximum), weight);
}
`,bindingLayout:[{name:"depthTexture",group:0},{name:"normalTexture",group:0},{name:"historyTexture",group:0},{name:"previousDepthTexture",group:0},{name:"previousNormalTexture",group:0}],props:{},uniforms:{},bindings:{},uniformTypes:{currentClipToPreviousClip:"mat4x4<f32>",currentViewToPreviousView:"mat4x4<f32>",previousInverseProjectionMatrix:"mat4x4<f32>",historyWeight:"f32",depthThreshold:"f32",normalThreshold:"f32"},propTypes:{currentClipToPreviousClip:{value:h,private:!0},currentViewToPreviousView:{value:h,private:!0},previousInverseProjectionMatrix:{value:h,private:!0},historyWeight:{value:.8,min:0,max:.97},depthThreshold:{value:.01,min:1e-4,max:.1},normalThreshold:{value:.96,min:-1,max:1}},passes:[{sampler:!0}]},W={name:"ssrNormalHistoryCopy",source:`
@group(0) @binding(auto) var normalTexture: texture_2d<f32>;
fn ssrNormalHistoryCopy_sampleColor(
  sourceTexture: texture_2d<f32>, sourceTextureSampler: sampler,
  texSize: vec2f, texCoord: vec2f
) -> vec4f {
  let dimensions = textureDimensions(normalTexture);
  let coordinate = clamp(vec2i(texCoord * vec2f(dimensions)), vec2i(0), vec2i(dimensions) - vec2i(1));
  return textureLoad(normalTexture, coordinate, 0);
}`,bindingLayout:[{name:"normalTexture",group:0}],passes:[{sampler:!0}]},j={name:"ssrCameraDepthHistoryCopy",source:`
@group(0) @binding(auto) var depthTexture: texture_depth_2d;
fn ssrCameraDepthHistoryCopy_sampleColor(
  sourceTexture: texture_2d<f32>, sourceTextureSampler: sampler,
  texSize: vec2f, texCoord: vec2f
) -> vec4f {
  let dimensions = textureDimensions(depthTexture);
  let coordinate = clamp(vec2i(texCoord * vec2f(dimensions)), vec2i(0), vec2i(dimensions) - vec2i(1));
  let depth = textureLoad(depthTexture, coordinate, 0);
  let packed = u32(round(clamp(depth, 0.0, 1.0) * 16777215.0));
  return vec4f(vec3f(f32((packed >> 16u) & 255u), f32((packed >> 8u) & 255u), f32(packed & 255u)) / 255.0, 1.0);
}`,bindingLayout:[{name:"depthTexture",group:0}],passes:[{sampler:!0}]},w={fast:{resolutionScale:.25,sampleCount:32,maxRadius:3,historyWeight:.9},balanced:{resolutionScale:.5,sampleCount:96,maxRadius:2,historyWeight:.8},detailed:{resolutionScale:1,sampleCount:96,maxRadius:2,historyWeight:.8}},u=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],I={name:"ssrTrace",source:`const SSR_TWO_PI: f32 = 6.283185307179586;

struct SSRTraceUniforms {
  projectionMatrix: mat4x4f,
  inverseProjectionMatrix: mat4x4f,
  intensity: f32,
  maxDistance: f32,
  thickness: f32,
  sampleCount: f32,
  maxRoughness: f32,
  frameIndex: f32,
};

@group(0) @binding(auto) var<uniform> ssrTrace: SSRTraceUniforms;
@group(0) @binding(auto) var depthTexture: texture_depth_2d;
@group(0) @binding(auto) var depthTextureSampler: sampler;
@group(0) @binding(auto) var normalTexture: texture_2d<f32>;
@group(0) @binding(auto) var normalTextureSampler: sampler;

fn ssrTrace_reconstructViewPosition(uv: vec2f, depth: f32) -> vec3f {
  let clip = vec4f(uv.x * 2.0 - 1.0, 1.0 - uv.y * 2.0, depth, 1.0);
  let viewPosition = ssrTrace.inverseProjectionMatrix * clip;
  return viewPosition.xyz / max(viewPosition.w, 0.00001);
}

fn ssrTrace_projectViewPosition(position: vec3f) -> vec2f {
  let clip = ssrTrace.projectionMatrix * vec4f(position, 1.0);
  let normalizedDeviceCoordinate = clip.xy / max(clip.w, 0.00001);
  return vec2f(
    normalizedDeviceCoordinate.x * 0.5 + 0.5,
    0.5 - normalizedDeviceCoordinate.y * 0.5
  );
}

fn ssrTrace_hash(value: vec2f, frameIndex: f32) -> f32 {
  let temporalPhase = fract(frameIndex * 0.61803398875) * SSR_TWO_PI;
  return fract(sin(dot(value, vec2f(12.9898, 78.233)) + temporalPhase) * 43758.5453);
}

fn ssrTrace_sampleColor(
  sourceTexture: texture_2d<f32>,
  sourceTextureSampler: sampler,
  texSize: vec2f,
  texCoord: vec2f
) -> vec4f {
  let sceneCoord = texCoord;
  let normalRoughness = textureSampleLevel(normalTexture, normalTextureSampler, sceneCoord, 0);
  let normal = normalize(normalRoughness.xyz * 2.0 - 1.0);
  let roughness = clamp(normalRoughness.a, 0.0, 1.0);
  let centerDepth = textureSampleLevel(depthTexture, depthTextureSampler, sceneCoord, 0);
  if (centerDepth >= 0.99999 || roughness >= ssrTrace.maxRoughness ||
      ssrTrace.intensity <= 0.0001) {
    return vec4f(0.0);
  }

  let viewPosition = ssrTrace_reconstructViewPosition(sceneCoord, centerDepth);
  let incidentDirection = normalize(viewPosition);
  let mirrorDirection = normalize(reflect(incidentDirection, normal));
  let pixelCoordinate = floor(sceneCoord * vec2f(textureDimensions(depthTexture)));
  let noise = ssrTrace_hash(pixelCoordinate, ssrTrace.frameIndex);
  let noiseAngle = noise * SSR_TWO_PI;
  let referenceAxis = select(
    vec3f(0.0, 1.0, 0.0),
    vec3f(1.0, 0.0, 0.0),
    abs(mirrorDirection.y) > 0.9
  );
  let tangent = normalize(cross(referenceAxis, mirrorDirection));
  let bitangent = normalize(cross(mirrorDirection, tangent));
  let roughnessCone = roughness * roughness * 0.32;
  let reflectedRay = normalize(
    mirrorDirection + (tangent * cos(noiseAngle) + bitangent * sin(noiseAngle)) * roughnessCone
  );
  let rayOrigin = viewPosition + normal * max(ssrTrace.thickness * 0.12, 0.025);

  var reflection = vec3f(0.0);
  var confidence = 0.0;
  var previousTravel = 0.06;
  var previousDepthDelta = -ssrTrace.thickness;
  let minimumSampleCount = ceil(
    ssrTrace.maxDistance / max(ssrTrace.thickness * 0.72, 0.12)
  );
  let effectiveSampleCount = min(96.0, max(ssrTrace.sampleCount, minimumSampleCount));
  for (var sampleIndex: i32 = 1; sampleIndex <= 96; sampleIndex++) {
    if (f32(sampleIndex) > effectiveSampleCount) {
      break;
    }
    let fraction = (f32(sampleIndex) - noise * 0.42) / max(effectiveSampleCount, 1.0);
    let travel = 0.08 + pow(max(fraction, 0.0), 1.3) * ssrTrace.maxDistance;
    let rayPosition = rayOrigin + reflectedRay * travel;
    if (rayPosition.z >= -0.04) {
      break;
    }
    let sampleCoord = ssrTrace_projectViewPosition(rayPosition);
    if (any(sampleCoord <= vec2f(0.0)) || any(sampleCoord >= vec2f(1.0))) {
      break;
    }
    let sampleDepth = textureSampleLevel(depthTexture, depthTextureSampler, sampleCoord, 0);
    if (sampleDepth >= 0.99999) {
      previousTravel = travel;
      previousDepthDelta = -ssrTrace.thickness;
      continue;
    }
    let scenePosition = ssrTrace_reconstructViewPosition(sampleCoord, sampleDepth);
    let depthDelta = (-rayPosition.z) - (-scenePosition.z);
    let rayStepLength = max(travel - previousTravel, 0.001);
    let hitThickness = max(ssrTrace.thickness, rayStepLength * 1.2) + travel * 0.008;
    let crossesCandidateSurface = previousDepthDelta <= 0.0 && depthDelta >= 0.0;
    let screenTravelPixels = length((sampleCoord - sceneCoord) * texSize);
    var entersCandidateSurface = true;
    if (crossesCandidateSurface && depthDelta < hitThickness && screenTravelPixels > 1.25) {
      let candidateNormal = normalize(
        textureSampleLevel(normalTexture, normalTextureSampler, sampleCoord, 0).rgb * 2.0 - 1.0
      );
      entersCandidateSurface = dot(reflectedRay, candidateNormal) < -0.015;
      if (entersCandidateSurface) {
        var nearTravel = previousTravel;
        var farTravel = travel;
        var hitCoord = sampleCoord;
        for (var refinementIndex: i32 = 0; refinementIndex < 5; refinementIndex++) {
          let refinedTravel = (nearTravel + farTravel) * 0.5;
          let refinedPosition = rayOrigin + reflectedRay * refinedTravel;
          let refinedCoord = ssrTrace_projectViewPosition(refinedPosition);
          let refinedDepth = textureSampleLevel(depthTexture, depthTextureSampler, refinedCoord, 0);
          let refinedScenePosition = ssrTrace_reconstructViewPosition(refinedCoord, refinedDepth);
          if ((-refinedPosition.z) - (-refinedScenePosition.z) >= 0.0) {
            farTravel = refinedTravel;
            hitCoord = refinedCoord;
          } else {
            nearTravel = refinedTravel;
          }
        }
        reflection = textureSampleLevel(sourceTexture, sourceTextureSampler, hitCoord, 0).rgb;
        let screenEdge = min(
          min(hitCoord.x, hitCoord.y),
          min(1.0 - hitCoord.x, 1.0 - hitCoord.y)
        );
        let fresnel = mix(
          0.32,
          1.0,
          pow(1.0 - max(dot(-incidentDirection, normal), 0.0), 5.0)
        );
        let roughnessFade = pow(1.0 - roughness / max(ssrTrace.maxRoughness, 0.001), 1.5);
        let distanceFade = 1.0 - clamp(farTravel / ssrTrace.maxDistance, 0.0, 1.0);
        confidence = smoothstep(0.0, 0.09, screenEdge) * roughnessFade * fresnel *
          distanceFade * ssrTrace.intensity;
        break;
      }
    }
    previousTravel = travel;
    previousDepthDelta = select(-ssrTrace.thickness, depthDelta, entersCandidateSurface);
  }

  return vec4f(reflection, clamp(confidence, 0.0, 1.0));
}`,bindingLayout:[{name:"depthTexture",group:0},{name:"normalTexture",group:0}],props:{},uniforms:{},bindings:{},uniformTypes:{projectionMatrix:"mat4x4<f32>",inverseProjectionMatrix:"mat4x4<f32>",intensity:"f32",maxDistance:"f32",thickness:"f32",sampleCount:"f32",maxRoughness:"f32",frameIndex:"f32"},propTypes:{projectionMatrix:{value:u,private:!0},inverseProjectionMatrix:{value:u,private:!0},intensity:{value:1.35,min:0,softMax:4},maxDistance:{value:60,min:1,softMax:180},thickness:{value:.45,min:.02,softMax:3},sampleCount:{value:48,min:8,max:96},maxRoughness:{value:.88,min:.1,max:1},frameIndex:{value:0,private:!0}},passes:[{sampler:!0}]},L={name:"ssrTemporal",source:`${b}
struct SSRTemporalUniforms {
  inverseProjectionMatrix: mat4x4f,
  historyWeight: f32,
  depthThreshold: f32,
};

@group(0) @binding(auto) var<uniform> ssrTemporal: SSRTemporalUniforms;
@group(0) @binding(auto) var historyTexture: texture_2d<f32>;
@group(0) @binding(auto) var historyTextureSampler: sampler;
@group(0) @binding(auto) var velocityTexture: texture_2d<f32>;
@group(0) @binding(auto) var velocityTextureSampler: sampler;
@group(0) @binding(auto) var depthTexture: texture_depth_2d;
@group(0) @binding(auto) var depthTextureSampler: sampler;
@group(0) @binding(auto) var previousDepthTexture: texture_2d<f32>;
@group(0) @binding(auto) var previousDepthTextureSampler: sampler;

fn ssrTemporal_sampleColor(
  sourceTexture: texture_2d<f32>,
  sourceTextureSampler: sampler,
  texSize: vec2f,
  texCoord: vec2f
) -> vec4f {
  let current = textureSampleLevel(sourceTexture, sourceTextureSampler, texCoord, 0);
  let currentDepth = textureSampleLevel(depthTexture, depthTextureSampler, texCoord, 0);
  if (currentDepth >= 0.99999) {
    return vec4f(0.0);
  }

  let velocity = textureSampleLevel(velocityTexture, velocityTextureSampler, texCoord, 0).xy;
  let previousCoord = texCoord - velocity;
  let validCoordinate = all(previousCoord >= vec2f(0.0)) &&
    all(previousCoord <= vec2f(1.0));
  let clampedPreviousCoord = clamp(previousCoord, vec2f(0.0), vec2f(1.0));
  let previousDepth = textureSampleLevel(
    previousDepthTexture,
    previousDepthTextureSampler,
    clampedPreviousCoord,
    0
  ).r;
  let currentViewDepth = temporal_getViewDepth(texCoord, currentDepth, ssrTemporal.inverseProjectionMatrix, 0.00001);
  let previousViewDepth = temporal_getViewDepth(clampedPreviousCoord, previousDepth, ssrTemporal.inverseProjectionMatrix, 0.00001);
  let relativeDepthDifference = abs(previousViewDepth - currentViewDepth) /
    max(currentViewDepth, 0.0001);
  let validDepth = relativeDepthDifference < ssrTemporal.depthThreshold;

  let bounds = temporal_getColorBounds(sourceTexture, sourceTextureSampler, texCoord, current);
  let minimumReflection = bounds.minimum;
  let maximumReflection = bounds.maximum;

  let historyReflection = textureSampleLevel(
    historyTexture,
    historyTextureSampler,
    clampedPreviousCoord,
    0
  );
  let validHistory = validCoordinate && validDepth && historyReflection.a > 0.001;
  if (!validHistory) {
    return current;
  }

  let hasCurrentSupport = maximumReflection.a > 0.001;
  if (!hasCurrentSupport) {
    return vec4f(
      historyReflection.rgb,
      historyReflection.a * ssrTemporal.historyWeight
    );
  }

  let clampedHistory = clamp(historyReflection, minimumReflection, maximumReflection);
  return mix(current, clampedHistory, ssrTemporal.historyWeight);
}`,bindingLayout:[{name:"historyTexture",group:0},{name:"velocityTexture",group:0},{name:"depthTexture",group:0},{name:"previousDepthTexture",group:0}],props:{},uniforms:{},bindings:{},uniformTypes:{inverseProjectionMatrix:"mat4x4<f32>",historyWeight:"f32",depthThreshold:"f32"},propTypes:{inverseProjectionMatrix:{value:u,private:!0},historyWeight:{value:.86,min:0,max:.97},depthThreshold:{value:.018,min:1e-4,softMax:.1}},passes:[{sampler:!0}]},H={name:"ssrDepthHistoryCopy",source:`@group(0) @binding(auto) var depthTexture: texture_depth_2d;
@group(0) @binding(auto) var depthTextureSampler: sampler;

fn ssrDepthHistoryCopy_sampleColor(
  sourceTexture: texture_2d<f32>,
  sourceTextureSampler: sampler,
  texSize: vec2f,
  texCoord: vec2f
) -> vec4f {
  let depth = textureSampleLevel(depthTexture, depthTextureSampler, texCoord, 0);
  return vec4f(depth, 0.0, 0.0, 1.0);
}`,bindingLayout:[{name:"depthTexture",group:0}],passes:[{sampler:!0}]},D={name:"ssrSpatial",source:`struct SSRSpatialUniforms {
  inverseProjectionMatrix: mat4x4f,
  direction: vec2f,
  maxRadius: f32,
  depthSigma: f32,
};

@group(0) @binding(auto) var<uniform> ssrSpatial: SSRSpatialUniforms;
@group(0) @binding(auto) var depthTexture: texture_depth_2d;
@group(0) @binding(auto) var depthTextureSampler: sampler;
@group(0) @binding(auto) var normalTexture: texture_2d<f32>;
@group(0) @binding(auto) var normalTextureSampler: sampler;

fn ssrSpatial_reconstructViewDepth(texCoord: vec2f, depth: f32) -> f32 {
  let clip = vec4f(texCoord.x * 2.0 - 1.0, 1.0 - texCoord.y * 2.0, depth, 1.0);
  let viewPosition = ssrSpatial.inverseProjectionMatrix * clip;
  return abs(viewPosition.z / max(abs(viewPosition.w), 0.00001));
}

fn ssrSpatial_sampleColor(
  sourceTexture: texture_2d<f32>,
  sourceTextureSampler: sampler,
  texSize: vec2f,
  texCoord: vec2f
) -> vec4f {
  let centerReflection = textureSampleLevel(sourceTexture, sourceTextureSampler, texCoord, 0);
  let centerNormalRoughness = textureSampleLevel(normalTexture, normalTextureSampler, texCoord, 0);
  let roughness = clamp(centerNormalRoughness.a, 0.0, 1.0);
  let centerDepth = textureSampleLevel(depthTexture, depthTextureSampler, texCoord, 0);
  if (centerDepth >= 0.99999) {
    return vec4f(0.0);
  }
  let centerViewDepth = ssrSpatial_reconstructViewDepth(texCoord, centerDepth);
  let hasCenterReflection = centerReflection.a > 0.001;
  if (!hasCenterReflection && roughness >= 0.28) {
    return centerReflection;
  }
  let minimumRadius = select(5.0, 0.95, hasCenterReflection);
  let radius = clamp(
    max(roughness * roughness * ssrSpatial.maxRadius, minimumRadius),
    minimumRadius,
    6.0
  );

  let centerNormal = normalize(centerNormalRoughness.rgb * 2.0 - 1.0);
  let texel = ssrSpatial.direction / vec2f(textureDimensions(sourceTexture));
  let centerWeight = select(0.0, 1.0, hasCenterReflection);
  var reflection = centerReflection * centerWeight;
  var totalWeight = centerWeight;
  var supportingSampleCount = 0u;
  for (var sampleIndex: i32 = 1; sampleIndex <= 6; sampleIndex++) {
    if (f32(sampleIndex) > ceil(radius)) {
      break;
    }
    for (var side: i32 = -1; side <= 1; side += 2) {
      let sampleCoord = clamp(
        texCoord + texel * f32(sampleIndex * side),
        vec2f(0.0),
        vec2f(1.0)
      );
      let sampleDepth = textureSampleLevel(depthTexture, depthTextureSampler, sampleCoord, 0);
      let sampleNormal = normalize(
        textureSampleLevel(normalTexture, normalTextureSampler, sampleCoord, 0).rgb * 2.0 - 1.0
      );
      let sampleViewDepth = ssrSpatial_reconstructViewDepth(sampleCoord, sampleDepth);
      let relativeDepthDelta = abs(sampleViewDepth - centerViewDepth) /
        max(centerViewDepth, 0.0001);
      let depthWeight = exp(
        -(relativeDepthDelta * relativeDepthDelta) /
          max(2.0 * ssrSpatial.depthSigma * ssrSpatial.depthSigma, 0.000001)
      );
      let normalWeight = pow(max(dot(centerNormal, sampleNormal), 0.0), 16.0);
      let distanceWeight = exp(
        -f32(sampleIndex * sampleIndex) / max(2.0 * radius * radius, 0.1)
      );
      let sampleReflection = textureSampleLevel(sourceTexture, sourceTextureSampler, sampleCoord, 0);
      let confidenceWeight = smoothstep(0.001, 0.12, sampleReflection.a);
      let belongsToSamePlane = dot(centerNormal, sampleNormal) > 0.9995;
      let surfaceWeight = select(0.0, 1.0, hasCenterReflection || belongsToSamePlane);
      let weight = depthWeight * normalWeight * distanceWeight * confidenceWeight * surfaceWeight;
      if (weight > 0.001) {
        supportingSampleCount += 1u;
      }
      reflection += sampleReflection * weight;
      totalWeight += weight;
    }
  }

  if ((!hasCenterReflection && supportingSampleCount < 2u) || totalWeight <= 0.0001) {
    return centerReflection;
  }
  return reflection / totalWeight;
}`,bindingLayout:[{name:"depthTexture",group:0},{name:"normalTexture",group:0}],props:{},uniforms:{},bindings:{},uniformTypes:{inverseProjectionMatrix:"mat4x4<f32>",direction:"vec2<f32>",maxRadius:"f32",depthSigma:"f32"},propTypes:{inverseProjectionMatrix:{value:u,private:!0},direction:{value:[1,0]},maxRadius:{value:5,min:0,max:8},depthSigma:{value:.035,min:1e-4,softMax:.2}},passes:[{sampler:!0}]},F={name:"ssrComposite",source:`struct SSRCompositeUniforms {
  inverseProjectionMatrix: mat4x4f,
  strength: f32,
  debugMode: f32,
  depthSigma: f32,
};

@group(0) @binding(auto) var<uniform> ssrComposite: SSRCompositeUniforms;
@group(0) @binding(auto) var reflectionTexture: texture_2d<f32>;
@group(0) @binding(auto) var reflectionTextureSampler: sampler;
@group(0) @binding(auto) var depthTexture: texture_depth_2d;
@group(0) @binding(auto) var depthTextureSampler: sampler;
@group(0) @binding(auto) var normalTexture: texture_2d<f32>;
@group(0) @binding(auto) var normalTextureSampler: sampler;

fn ssrComposite_reconstructViewDepth(texCoord: vec2f, depth: f32) -> f32 {
  let clip = vec4f(texCoord.x * 2.0 - 1.0, 1.0 - texCoord.y * 2.0, depth, 1.0);
  let viewPosition = ssrComposite.inverseProjectionMatrix * clip;
  return abs(viewPosition.z / max(abs(viewPosition.w), 0.00001));
}

fn ssrComposite_upsampleReflection(texCoord: vec2f) -> vec4f {
  let reflectionSize = vec2f(textureDimensions(reflectionTexture));
  let reflectionPosition = texCoord * reflectionSize - vec2f(0.5);
  let reflectionBase = vec2i(floor(reflectionPosition));
  let reflectionFraction = fract(reflectionPosition);
  let centerDepth = textureSampleLevel(depthTexture, depthTextureSampler, texCoord, 0);
  if (centerDepth >= 0.99999) {
    return textureSampleLevel(reflectionTexture, reflectionTextureSampler, texCoord, 0);
  }
  let centerViewDepth = ssrComposite_reconstructViewDepth(texCoord, centerDepth);
  let centerNormal = normalize(
    textureSampleLevel(normalTexture, normalTextureSampler, texCoord, 0).rgb * 2.0 - 1.0
  );

  var reflection = vec4f(0.0);
  var totalWeight = 0.0;
  for (var sampleY: i32 = 0; sampleY <= 1; sampleY++) {
    for (var sampleX: i32 = 0; sampleX <= 1; sampleX++) {
      let reflectionPixel = clamp(
        reflectionBase + vec2i(sampleX, sampleY),
        vec2i(0),
        vec2i(reflectionSize) - vec2i(1)
      );
      let sampleCoord = (vec2f(reflectionPixel) + vec2f(0.5)) / reflectionSize;
      let sampleDepth = textureSampleLevel(depthTexture, depthTextureSampler, sampleCoord, 0);
      let sampleNormal = normalize(
        textureSampleLevel(normalTexture, normalTextureSampler, sampleCoord, 0).rgb * 2.0 - 1.0
      );
      let horizontalWeight = select(
        1.0 - reflectionFraction.x,
        reflectionFraction.x,
        sampleX == 1
      );
      let verticalWeight = select(
        1.0 - reflectionFraction.y,
        reflectionFraction.y,
        sampleY == 1
      );
      let sampleViewDepth = ssrComposite_reconstructViewDepth(sampleCoord, sampleDepth);
      let relativeDepthDelta = abs(sampleViewDepth - centerViewDepth) /
        max(centerViewDepth, 0.0001);
      let depthWeight = exp(
        -(relativeDepthDelta * relativeDepthDelta) /
          max(2.0 * ssrComposite.depthSigma * ssrComposite.depthSigma, 0.000001)
      );
      let normalWeight = pow(max(dot(centerNormal, sampleNormal), 0.0), 12.0);
      let weight = horizontalWeight * verticalWeight * depthWeight * normalWeight;
      reflection += textureLoad(reflectionTexture, reflectionPixel, 0) * weight;
      totalWeight += weight;
    }
  }
  return reflection / max(totalWeight, 0.00001);
}

fn ssrComposite_sampleColor(
  sourceTexture: texture_2d<f32>,
  sourceTextureSampler: sampler,
  texSize: vec2f,
  texCoord: vec2f
) -> vec4f {
  let color = textureSampleLevel(sourceTexture, sourceTextureSampler, texCoord, 0);
  let reflection = ssrComposite_upsampleReflection(texCoord);
  if (ssrComposite.debugMode > 1.5) {
    let confidence = clamp(reflection.a, 0.0, 1.0);
    let lowConfidence = vec3f(0.045, 0.08, 0.22);
    let highConfidence = vec3f(1.0, 0.7, 0.16);
    return vec4f(mix(lowConfidence, highConfidence, confidence), 1.0);
  }
  if (ssrComposite.debugMode > 0.5) {
    return vec4f(reflection.rgb * reflection.a, 1.0);
  }
  let reflectionWeight = clamp(reflection.a * ssrComposite.strength, 0.0, 1.0);
  return vec4f(color.rgb + reflection.rgb * reflectionWeight, color.a);
}`,bindingLayout:[{name:"reflectionTexture",group:0},{name:"depthTexture",group:0},{name:"normalTexture",group:0}],props:{},uniforms:{},bindings:{},uniformTypes:{inverseProjectionMatrix:"mat4x4<f32>",strength:"f32",debugMode:"f32",depthSigma:"f32"},propTypes:{inverseProjectionMatrix:{value:u,private:!0},strength:{value:1,min:0,softMax:2},debugMode:{value:0,min:0,max:2,private:!0},depthSigma:{value:.04,min:1e-4,softMax:.2}},passes:[{sampler:!0}]};function N(a={}){const e=a.quality?w[a.quality]:void 0,r=a.resolutionScale??e?.resolutionScale??1,o=a.reprojection==="camera",t=e?{maxRadius:e.maxRadius}:{};return{name:"ssrCompositeShaderPass",renderTargets:{ssrRaw:{scale:[r,r],format:"rgba16float"},ssrHistory:{scale:[r,r],format:"rgba16float",lifetime:"history",initialize:{clearColor:[0,0,0,0]}},ssrHistoryDepth:o?{format:"rgba8unorm",lifetime:"history",initialize:{clearColor:[1,1,1,1]}}:{scale:[r,r],format:"rgba16float",lifetime:"history",initialize:{clearColor:[1,0,0,1]}},...o?{ssrHistoryNormal:{format:"rgba8unorm",lifetime:"history",initialize:{clearColor:[.5,.5,1,1]}}}:{},ssrScratch:{scale:[r,r],format:"rgba16float"},ssrReflection:{scale:[r,r],format:"rgba16float"}},steps:[{shaderPass:I,inputs:{sourceTexture:"previous"},output:"ssrRaw",uniforms:e?{sampleCount:e.sampleCount}:void 0},{shaderPass:o?V:L,inputs:{sourceTexture:"ssrRaw",historyTexture:"ssrHistory",previousDepthTexture:"ssrHistoryDepth",...o?{previousNormalTexture:"ssrHistoryNormal"}:{}},output:"ssrHistory",uniforms:e?{historyWeight:e.historyWeight}:void 0},{shaderPass:o?j:H,inputs:{sourceTexture:"previous"},output:"ssrHistoryDepth"},...o?[{shaderPass:W,inputs:{sourceTexture:"previous"},output:"ssrHistoryNormal"}]:[],{shaderPass:D,inputs:{sourceTexture:"ssrHistory"},output:"ssrScratch",uniforms:{...t,direction:[1,0]}},{shaderPass:D,inputs:{sourceTexture:"ssrScratch"},output:"ssrReflection",uniforms:{...t,direction:[0,1]}},{shaderPass:F,inputs:{sourceTexture:"previous",reflectionTexture:"ssrReflection"},output:"previous"}]}}class O{constructor(e,r="city-river-reflections",o=1.5,t={}){this.capture=e,this.reflectionIntensity=o,this.passOptions=t,this.id=r}capture;reflectionIntensity;passOptions;id;props={};useInPicking=!1;frameCount=0;debugMode=0;historyFrames=0;quality="balanced";stableFrames=0;previousViewProjection=null;previousView=null;previousInverseProjection=null;device=null;renderer=null;capturedColor=null;presenter=null;setup({device:e}){this.device=e,this.renderer=this.createRenderer(e)}setQuality(e){e!==this.quality&&(this.quality=e,this.resetHistory(),this.renderer?.destroy(),this.presenter?.destroy(),this.presenter=null,this.capturedColor=null,this.renderer=this.device?this.createRenderer(this.device):null)}get settlingFrameCount(){return 1+Math.ceil(Math.log(.01)/Math.log(w[this.quality].historyWeight))}get needsRedraw(){return!!this.renderer&&this.stableFrames<this.settlingFrameCount}requestConvergence(){this.stableFrames=0}setReflectionIntensity(e){this.reflectionIntensity=e,this.resetHistory()}createRenderer(e){return new M(e,{shaderPasses:[...this.passOptions.beforeReflection??[],N({reprojection:"camera",quality:this.quality}),...this.passOptions.afterReflection??[]],colorFormat:"rgba16float",flipY:!0})}preRender(e){}postRender(e){const r=this.device,o=this.renderer,t=e.viewports[0];if(!t)return e.inputBuffer;const f=this.capture.getFrame(t.id);if(!f)return e.inputBuffer;const{buffer:s}=f,{width:x,height:v}=s;this.capturedColor!==s.colorTexture&&(this.capturedColor=s.colorTexture,o.resize([x,v]),this.resetHistory());const g=r.commandEncoder,P=[0,0,x,v],n=t.viewMatrix,R=t.distanceScales.unitsPerMeter[2]*Math.hypot(n[8],n[9],n[10]),T=new i([1,0,0,0,0,1,0,0,0,0,.5,0,0,0,.5,1]).multiplyRight(t.projectionMatrix).scale(R),l=new i(T).invert(),_=new i([1,0,0,0,0,1,0,0,0,0,.5,0,0,0,.5,1]),p=new i(_).multiplyRight(t.viewProjectionMatrix);this.previousViewProjection&&p.some((m,d)=>m!==this.previousViewProjection[d])&&this.requestConvergence();const C=this.previousViewProjection?new i(this.previousViewProjection).multiplyRight(new i(p).invert()):new i;C.some((m,d)=>Math.abs(m-(d%5===0?1:0))>.5)&&this.resetHistory();const c=o.renderToTexture({sourceTexture:s.colorTexture,bindings:{depthTexture:s.depthTexture,normalTexture:s.normalRoughnessTexture},uniforms:{...this.passOptions.getUniforms?.(t),ssrTrace:{projectionMatrix:T,inverseProjectionMatrix:l,intensity:this.reflectionIntensity,maxDistance:450,thickness:1.5,maxRoughness:.8,frameIndex:this.historyFrames},ssrCameraTemporal:{currentClipToPreviousClip:C,currentViewToPreviousView:this.previousView?new i(this.previousView).multiplyRight(new i(n).invert()):new i,previousInverseProjectionMatrix:this.previousInverseProjection??l,...this.historyFrames?{}:{historyWeight:0},depthThreshold:.01,normalThreshold:.96},ssrSpatial:{inverseProjectionMatrix:l},ssrComposite:{inverseProjectionMatrix:l,strength:this.debugMode===3?0:1,debugMode:this.debugMode===3?0:this.debugMode}}});if(!c)return e.inputBuffer;this.frameCount++,this.historyFrames++,this.stableFrames++,this.previousViewProjection=p,this.previousView=new i(n),this.previousInverseProjection=l,this.presenter??=new z(r,{id:"city-reflection-presenter",backgroundTexture:c,flipY:!0}),this.presenter.setProps({backgroundTexture:c}),this.presenter.predraw(g);const y=e.target??r.getCanvasContext().getCurrentFramebuffer(),S=g.beginRenderPass({id:"city-reflection-composite",framebuffer:y,parameters:{viewport:P},clearColor:!1,clearDepth:!1});return this.presenter.draw(S),S.end(),r.submit(),y}resetHistory(){this.renderer?.resetHistory(),this.historyFrames=0,this.requestConvergence(),this.previousViewProjection=null,this.previousView=null,this.previousInverseProjection=null}cleanup(){this.resetHistory(),this.renderer?.destroy(),this.presenter?.destroy(),this.capturedColor=null,this.renderer=null,this.presenter=null,this.device=null}}export{O as R};
