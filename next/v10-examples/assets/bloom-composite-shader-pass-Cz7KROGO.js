function re(e){const t=Object.fromEntries(e.levelNames.map(i=>[`output${i}`,`extract${i}`])),r=e.levelNames.map((i,n)=>`@group(0) @binding(${n+2}) var output${i}: texture_storage_2d<${e.colorFormat}, write>;`).join(`
`),o=e.levelNames.slice(1).map((i,n)=>ie(i,n+1)).join(`
`);return{name:"bloomComputePyramid",uniformModule:"bloomExtract",uniformBinding:"bloomCompute",uniformNames:["threshold","softKnee","fireflyReduction","exposure","exposureCompensation"],uniforms:{threshold:e.threshold,softKnee:e.softKnee,fireflyReduction:e.fireflyReduction,exposure:e.exposure,exposureCompensation:e.exposureCompensation},input:"previous",outputs:t,replacedPasses:["bloomExtract","bloomDownsample"],workgroupSize:[16,16],source:`
struct BloomComputeUniforms {
  threshold: f32,
  softKnee: f32,
  fireflyReduction: f32,
  exposure: f32,
  exposureCompensation: f32,
};

@group(0) @binding(0) var<uniform> bloomCompute: BloomComputeUniforms;
@group(0) @binding(1) var sourceTexture: texture_2d<f32>;
${r}

var<workgroup> bloomTile: array<vec4f, ${16**2}>;

fn bloomCompute_applyThreshold(sourceColor: vec4f) -> vec4f {
  let luminance = dot(sourceColor.rgb, vec3f(0.2126, 0.7152, 0.0722));
  let exposure = max(bloomCompute.exposure * exp2(bloomCompute.exposureCompensation), 0.0001);
  let threshold = bloomCompute.threshold / exposure;
  let knee = max(threshold * bloomCompute.softKnee, 0.00001);
  let soft = clamp((luminance - threshold + knee) / (2.0 * knee), 0.0, 1.0);
  let softContribution = soft * soft * knee;
  let hardContribution = max(luminance - threshold, 0.0);
  let contribution = max(hardContribution, softContribution) / max(luminance, 0.00001);
  return vec4f(sourceColor.rgb * contribution, sourceColor.a * contribution);
}

fn bloomCompute_extractHighlight(outputCoordinate: vec2u, outputDimensions: vec2u) -> vec4f {
  let sourceDimensions = textureDimensions(sourceTexture);
  let clampedCoordinate = min(outputCoordinate, outputDimensions - vec2u(1));
  let sourceCenter =
    (vec2f(clampedCoordinate) + vec2f(0.5)) * vec2f(sourceDimensions) /
      vec2f(outputDimensions) - vec2f(0.5);
  let filterRadius = max(vec2f(sourceDimensions) / vec2f(outputDimensions), vec2f(2.0));
  let minimumCoordinate = vec2i(floor(sourceCenter - filterRadius)) + vec2i(1);
  let maximumCoordinate = vec2i(ceil(sourceCenter + filterRadius)) - vec2i(1);
  let maximumSourceCoordinate = vec2i(sourceDimensions) - vec2i(1);
  var color = vec4f(0.0);
  var totalWeight = 0.0;

  for (var sourceY = minimumCoordinate.y; sourceY <= maximumCoordinate.y; sourceY += 1) {
    let weightY = max(1.0 - abs(f32(sourceY) - sourceCenter.y) / filterRadius.y, 0.0);
    for (var sourceX = minimumCoordinate.x; sourceX <= maximumCoordinate.x; sourceX += 1) {
      let weightX = max(1.0 - abs(f32(sourceX) - sourceCenter.x) / filterRadius.x, 0.0);
      let sourceColor = textureLoad(
        sourceTexture,
        clamp(vec2i(sourceX, sourceY), vec2i(0), maximumSourceCoordinate),
        0
      );
      let luminance = dot(sourceColor.rgb, vec3f(0.2126, 0.7152, 0.0722));
      let fireflyWeight = mix(
        1.0,
        1.0 / (1.0 + max(luminance, 0.0)),
        clamp(bloomCompute.fireflyReduction, 0.0, 1.0)
      );
      let weight = weightX * weightY * fireflyWeight;
      color += bloomCompute_applyThreshold(sourceColor) * weight;
      totalWeight += weight;
    }
  }

  return color / max(totalWeight, 0.00001);
}

@compute @workgroup_size(16, 16)
fn main(
  @builtin(global_invocation_id) globalInvocation: vec3u,
  @builtin(local_invocation_id) localInvocation: vec3u,
  @builtin(workgroup_id) workgroupCoordinate: vec3u
) {
  let localCoordinate = localInvocation.xy;
  let localIndex = localCoordinate.y * 16u + localCoordinate.x;
  let halfDimensions = textureDimensions(outputHalf);
  let halfCoordinate = globalInvocation.xy;
  let extractedColor = bloomCompute_extractHighlight(halfCoordinate, halfDimensions);
  bloomTile[localIndex] = extractedColor;
  if (all(halfCoordinate < halfDimensions)) {
    textureStore(outputHalf, vec2i(halfCoordinate), extractedColor);
  }
  workgroupBarrier();
${o}
}
`}}function ie(e,t){const r=16/2**t,o=e.toLowerCase();return`
  var ${o}Color = vec4f(0.0);
  if (localCoordinate.x < ${r}u && localCoordinate.y < ${r}u) {
    let sourceCoordinate = localCoordinate * 2u;
    let sourceIndex = sourceCoordinate.y * 16u + sourceCoordinate.x;
    ${o}Color = (
      bloomTile[sourceIndex] +
      bloomTile[sourceIndex + 1u] +
      bloomTile[sourceIndex + 16u] +
      bloomTile[sourceIndex + 17u]
    ) * 0.25;
  }
  workgroupBarrier();
  if (localCoordinate.x < ${r}u && localCoordinate.y < ${r}u) {
    bloomTile[localIndex] = ${o}Color;
    let ${o}Coordinate = workgroupCoordinate.xy * ${r}u + localCoordinate;
    if (all(${o}Coordinate < textureDimensions(output${e}))) {
      textureStore(output${e}, vec2i(${o}Coordinate), ${o}Color);
    }
  }
  workgroupBarrier();`}const L=6,O=8,X=8,se={name:"bloomLens",source:`
const BLOOM_LENS_MAX_GHOSTS = ${L};
const BLOOM_LENS_MAX_DIRECTIONS = ${O/2};
const BLOOM_LENS_STREAK_SAMPLES = ${X};

struct bloomLensUniforms {
  starburstIntensity: f32,
  starburstSpikes: f32,
  starburstLength: f32,
  starburstRotation: f32,
  ghostIntensity: f32,
  ghostCount: f32,
  ghostSpacing: f32,
  haloIntensity: f32,
  haloRadius: f32,
  chromaticAberration: f32,
};

@group(0) @binding(auto) var<uniform> bloomLens: bloomLensUniforms;
@group(0) @binding(auto) var glowTexture: texture_2d<f32>;
@group(0) @binding(auto) var glowTextureSampler: sampler;

fn bloomLens_sampleSpectralHighlight(
  sourceTexture: texture_2d<f32>,
  sourceTextureSampler: sampler,
  coordinate: vec2f,
  direction: vec2f
) -> vec3f {
  if (any(coordinate < vec2f(0.0)) || any(coordinate > vec2f(1.0))) {
    return vec3f(0.0);
  }

  if (bloomLens.chromaticAberration <= 0.0) {
    return textureSampleLevel(sourceTexture, sourceTextureSampler, coordinate, 0.0).rgb;
  }

  let spectralOffset = direction * bloomLens.chromaticAberration * 0.018;
  return vec3f(
    textureSampleLevel(sourceTexture, sourceTextureSampler, coordinate + spectralOffset, 0.0).r,
    textureSampleLevel(sourceTexture, sourceTextureSampler, coordinate, 0.0).g,
    textureSampleLevel(sourceTexture, sourceTextureSampler, coordinate - spectralOffset, 0.0).b
  );
}

fn bloomLens_sampleStarburst(texCoord: vec2f) -> vec3f {
  let directionCount = max(bloomLens.starburstSpikes * 0.5, 1.0);
  let glowDimensions = vec2f(textureDimensions(glowTexture));
  var streakColor = vec3f(0.0);
  var totalWeight = 0.0;

  for (var directionIndex = 0; directionIndex < BLOOM_LENS_MAX_DIRECTIONS; directionIndex += 1) {
    if (f32(directionIndex) >= directionCount) {
      continue;
    }

    let angle = bloomLens.starburstRotation + f32(directionIndex) * 3.14159265359 / directionCount;
    let direction = vec2f(cos(angle), sin(angle));
    for (var sampleIndex = 1; sampleIndex <= BLOOM_LENS_STREAK_SAMPLES; sampleIndex += 1) {
      let sampleDistance = f32(sampleIndex) / f32(BLOOM_LENS_STREAK_SAMPLES);
      let offset = direction * bloomLens.starburstLength * sampleDistance / glowDimensions;
      let sampleWeight = exp(-sampleDistance * 2.4);
      let positiveColor = textureSampleLevel(
        glowTexture,
        glowTextureSampler,
        clamp(texCoord + offset, vec2f(0.0), vec2f(1.0)),
        0.0
      ).rgb;
      let negativeColor = textureSampleLevel(
        glowTexture,
        glowTextureSampler,
        clamp(texCoord - offset, vec2f(0.0), vec2f(1.0)),
        0.0
      ).rgb;
      streakColor += (positiveColor + negativeColor) * sampleWeight;
      totalWeight += sampleWeight * 2.0;
    }
  }

  return streakColor / max(totalWeight, 0.00001);
}

fn bloomLens_sampleGhosts(
  sourceTexture: texture_2d<f32>,
  sourceTextureSampler: sampler,
  texCoord: vec2f,
  radialDirection: vec2f
) -> vec3f {
  let centeredCoordinate = texCoord - vec2f(0.5);
  let reflectedCoordinate = vec2f(1.0) - texCoord;
  var ghostColor = vec3f(0.0);
  var totalWeight = 0.0;

  for (var ghostIndex = 0; ghostIndex < BLOOM_LENS_MAX_GHOSTS; ghostIndex += 1) {
    if (f32(ghostIndex) >= bloomLens.ghostCount) {
      continue;
    }

    let ghostCoordinate = reflectedCoordinate +
      centeredCoordinate * f32(ghostIndex) * bloomLens.ghostSpacing;
    let radialFalloff = max(1.0 - length(ghostCoordinate - vec2f(0.5)) * 1.41421356, 0.0);
    let ghostWeight = radialFalloff * (1.0 - f32(ghostIndex) / (bloomLens.ghostCount + 1.0));
    ghostColor += bloomLens_sampleSpectralHighlight(
      sourceTexture,
      sourceTextureSampler,
      ghostCoordinate,
      radialDirection
    ) * ghostWeight;
    totalWeight += ghostWeight;
  }

  return ghostColor / max(totalWeight, 0.00001);
}

fn bloomLens_sampleColor(
  sourceTexture: texture_2d<f32>,
  sourceTextureSampler: sampler,
  texSize: vec2f,
  texCoord: vec2f
) -> vec4f {
  let centeredCoordinate = texCoord - vec2f(0.5);
  let radialDirection = centeredCoordinate / max(length(centeredCoordinate), 0.00001);
  var lensColor = vec3f(0.0);

  if (bloomLens.starburstIntensity > 0.0) {
    lensColor += bloomLens_sampleStarburst(texCoord) * bloomLens.starburstIntensity;
  }
  if (bloomLens.ghostIntensity > 0.0) {
    lensColor += bloomLens_sampleGhosts(
      sourceTexture,
      sourceTextureSampler,
      texCoord,
      radialDirection
    ) * bloomLens.ghostIntensity;
  }
  if (bloomLens.haloIntensity > 0.0) {
    let haloCoordinate = texCoord - radialDirection * bloomLens.haloRadius;
    let haloFalloff = max(1.0 - length(centeredCoordinate) * 1.41421356, 0.0);
    lensColor += bloomLens_sampleSpectralHighlight(
      sourceTexture,
      sourceTextureSampler,
      haloCoordinate,
      radialDirection
    ) * bloomLens.haloIntensity * haloFalloff;
  }

  return vec4f(lensColor, 1.0);
}
`,fs:`
#define BLOOM_LENS_MAX_GHOSTS ${L}
#define BLOOM_LENS_MAX_DIRECTIONS ${O/2}
#define BLOOM_LENS_STREAK_SAMPLES ${X}

layout(std140) uniform bloomLensUniforms {
  float starburstIntensity;
  float starburstSpikes;
  float starburstLength;
  float starburstRotation;
  float ghostIntensity;
  float ghostCount;
  float ghostSpacing;
  float haloIntensity;
  float haloRadius;
  float chromaticAberration;
} bloomLens;

uniform sampler2D glowTexture;

vec3 bloomLens_sampleSpectralHighlight(
  sampler2D sourceTexture,
  vec2 coordinate,
  vec2 direction
) {
  if (any(lessThan(coordinate, vec2(0.0))) || any(greaterThan(coordinate, vec2(1.0)))) {
    return vec3(0.0);
  }

  if (bloomLens.chromaticAberration <= 0.0) {
    return textureLod(sourceTexture, coordinate, 0.0).rgb;
  }

  vec2 spectralOffset = direction * bloomLens.chromaticAberration * 0.018;
  return vec3(
    textureLod(sourceTexture, coordinate + spectralOffset, 0.0).r,
    textureLod(sourceTexture, coordinate, 0.0).g,
    textureLod(sourceTexture, coordinate - spectralOffset, 0.0).b
  );
}

vec3 bloomLens_sampleStarburst(vec2 texCoord) {
  float directionCount = max(bloomLens.starburstSpikes * 0.5, 1.0);
  vec2 glowDimensions = vec2(textureSize(glowTexture, 0));
  vec3 streakColor = vec3(0.0);
  float totalWeight = 0.0;

  for (int directionIndex = 0; directionIndex < BLOOM_LENS_MAX_DIRECTIONS; directionIndex++) {
    if (float(directionIndex) >= directionCount) {
      continue;
    }

    float angle = bloomLens.starburstRotation + float(directionIndex) * 3.14159265359 / directionCount;
    vec2 direction = vec2(cos(angle), sin(angle));
    for (int sampleIndex = 1; sampleIndex <= BLOOM_LENS_STREAK_SAMPLES; sampleIndex++) {
      float sampleDistance = float(sampleIndex) / float(BLOOM_LENS_STREAK_SAMPLES);
      vec2 offset = direction * bloomLens.starburstLength * sampleDistance / glowDimensions;
      float sampleWeight = exp(-sampleDistance * 2.4);
      vec3 positiveColor = textureLod(
        glowTexture,
        clamp(texCoord + offset, vec2(0.0), vec2(1.0)),
        0.0
      ).rgb;
      vec3 negativeColor = textureLod(
        glowTexture,
        clamp(texCoord - offset, vec2(0.0), vec2(1.0)),
        0.0
      ).rgb;
      streakColor += (positiveColor + negativeColor) * sampleWeight;
      totalWeight += sampleWeight * 2.0;
    }
  }

  return streakColor / max(totalWeight, 0.00001);
}

vec3 bloomLens_sampleGhosts(
  sampler2D sourceTexture,
  vec2 texCoord,
  vec2 radialDirection
) {
  vec2 centeredCoordinate = texCoord - vec2(0.5);
  vec2 reflectedCoordinate = vec2(1.0) - texCoord;
  vec3 ghostColor = vec3(0.0);
  float totalWeight = 0.0;

  for (int ghostIndex = 0; ghostIndex < BLOOM_LENS_MAX_GHOSTS; ghostIndex++) {
    if (float(ghostIndex) >= bloomLens.ghostCount) {
      continue;
    }

    vec2 ghostCoordinate = reflectedCoordinate +
      centeredCoordinate * float(ghostIndex) * bloomLens.ghostSpacing;
    float radialFalloff = max(1.0 - length(ghostCoordinate - vec2(0.5)) * 1.41421356, 0.0);
    float ghostWeight = radialFalloff * (1.0 - float(ghostIndex) / (bloomLens.ghostCount + 1.0));
    ghostColor += bloomLens_sampleSpectralHighlight(
      sourceTexture,
      ghostCoordinate,
      radialDirection
    ) * ghostWeight;
    totalWeight += ghostWeight;
  }

  return ghostColor / max(totalWeight, 0.00001);
}

vec4 bloomLens_sampleColor(sampler2D sourceTexture, vec2 texSize, vec2 texCoord) {
  vec2 centeredCoordinate = texCoord - vec2(0.5);
  vec2 radialDirection = centeredCoordinate / max(length(centeredCoordinate), 0.00001);
  vec3 lensColor = vec3(0.0);

  if (bloomLens.starburstIntensity > 0.0) {
    lensColor += bloomLens_sampleStarburst(texCoord) * bloomLens.starburstIntensity;
  }
  if (bloomLens.ghostIntensity > 0.0) {
    lensColor += bloomLens_sampleGhosts(
      sourceTexture,
      texCoord,
      radialDirection
    ) * bloomLens.ghostIntensity;
  }
  if (bloomLens.haloIntensity > 0.0) {
    vec2 haloCoordinate = texCoord - radialDirection * bloomLens.haloRadius;
    float haloFalloff = max(1.0 - length(centeredCoordinate) * 1.41421356, 0.0);
    lensColor += bloomLens_sampleSpectralHighlight(
      sourceTexture,
      haloCoordinate,
      radialDirection
    ) * bloomLens.haloIntensity * haloFalloff;
  }

  return vec4(lensColor, 1.0);
}
`,bindingLayout:[{name:"glowTexture",group:0}],uniforms:{},bindings:{},uniformTypes:{starburstIntensity:"f32",starburstSpikes:"f32",starburstLength:"f32",starburstRotation:"f32",ghostIntensity:"f32",ghostCount:"f32",ghostSpacing:"f32",haloIntensity:"f32",haloRadius:"f32",chromaticAberration:"f32"},defaultUniforms:{starburstIntensity:0,starburstSpikes:4,starburstLength:48,starburstRotation:0,ghostIntensity:0,ghostCount:3,ghostSpacing:.32,haloIntensity:0,haloRadius:.34,chromaticAberration:0},passes:[{sampler:!0}]};function le(e){const t=e?`
@group(0) @binding(auto) var velocityTexture: texture_2d<f32>;
@group(0) @binding(auto) var velocityTextureSampler: sampler;
@group(0) @binding(auto) var depthTexture: texture_depth_2d;`:"",r=e?`
uniform sampler2D velocityTexture;
uniform sampler2D depthTexture;`:"",o=e?"texCoord - textureSampleLevel(velocityTexture, velocityTextureSampler, texCoord, 0.0).xy":"texCoord",i=e?"texCoord - textureLod(velocityTexture, texCoord, 0.0).xy":"texCoord",n=e?`
  let depthDimensions = textureDimensions(depthTexture);
  let depthCoordinate = min(vec2u(texCoord * vec2f(depthDimensions)), depthDimensions - vec2u(1));
  let currentDepth = textureLoad(depthTexture, vec2i(depthCoordinate), 0);
  let validHistory = history.a > 0.5 && all(historyCoord >= vec2f(0.0)) &&
    all(historyCoord <= vec2f(1.0)) &&
    abs((history.a - 1.0) - currentDepth) <= bloomTemporal.depthThreshold;
  let historyAlpha = currentDepth + 1.0;`:`
  let validHistory = history.a > 0.5;
  let historyAlpha = 1.0;`,p=e?`
  ivec2 depthDimensions = textureSize(depthTexture, 0);
  ivec2 depthCoordinate = min(ivec2(texCoord * vec2(depthDimensions)), depthDimensions - ivec2(1));
  float currentDepth = texelFetch(depthTexture, depthCoordinate, 0).r;
  bool validHistory = history.a > 0.5 && all(greaterThanEqual(historyCoord, vec2(0.0))) &&
    all(lessThanEqual(historyCoord, vec2(1.0))) &&
    abs((history.a - 1.0) - currentDepth) <= bloomTemporal.depthThreshold;
  float historyAlpha = currentDepth + 1.0;`:`
  bool validHistory = history.a > 0.5;
  float historyAlpha = 1.0;`;return{name:"bloomTemporal",source:`
struct bloomTemporalUniforms {
  stability: f32,
  depthThreshold: f32,
  exposureScale: f32,
};

@group(0) @binding(auto) var<uniform> bloomTemporal: bloomTemporalUniforms;
@group(0) @binding(auto) var historyTexture: texture_2d<f32>;
@group(0) @binding(auto) var historyTextureSampler: sampler;${t}

fn bloomTemporal_sampleColor(
  sourceTexture: texture_2d<f32>,
  sourceTextureSampler: sampler,
  texSize: vec2f,
  texCoord: vec2f
) -> vec4f {
  let texel = 1.0 / vec2f(textureDimensions(sourceTexture));
  let current = textureSampleLevel(sourceTexture, sourceTextureSampler, texCoord, 0.0).rgb;
  let left = textureSampleLevel(sourceTexture, sourceTextureSampler, texCoord - vec2f(texel.x, 0.0), 0.0).rgb;
  let right = textureSampleLevel(sourceTexture, sourceTextureSampler, texCoord + vec2f(texel.x, 0.0), 0.0).rgb;
  let top = textureSampleLevel(sourceTexture, sourceTextureSampler, texCoord - vec2f(0.0, texel.y), 0.0).rgb;
  let bottom = textureSampleLevel(sourceTexture, sourceTextureSampler, texCoord + vec2f(0.0, texel.y), 0.0).rgb;
  let minimumColor = min(current, min(min(left, right), min(top, bottom)));
  let maximumColor = max(current, max(max(left, right), max(top, bottom)));
  let historyCoord = ${o};
  let history = textureSampleLevel(
    historyTexture,
    historyTextureSampler,
    clamp(historyCoord, vec2f(0.0), vec2f(1.0)),
    0.0
  );${n}
  let clampedHistory = clamp(history.rgb * bloomTemporal.exposureScale, minimumColor, maximumColor);
  let historyWeight = select(0.0, clamp(bloomTemporal.stability, 0.0, 0.95), validHistory);
  return vec4f(mix(current, clampedHistory, historyWeight), historyAlpha);
}
`,fs:`
layout(std140) uniform bloomTemporalUniforms {
  float stability;
  float depthThreshold;
  float exposureScale;
} bloomTemporal;

uniform sampler2D historyTexture;${r}

vec4 bloomTemporal_sampleColor(sampler2D sourceTexture, vec2 texSize, vec2 texCoord) {
  vec2 texel = 1.0 / vec2(textureSize(sourceTexture, 0));
  vec3 current = textureLod(sourceTexture, texCoord, 0.0).rgb;
  vec3 left = textureLod(sourceTexture, texCoord - vec2(texel.x, 0.0), 0.0).rgb;
  vec3 right = textureLod(sourceTexture, texCoord + vec2(texel.x, 0.0), 0.0).rgb;
  vec3 top = textureLod(sourceTexture, texCoord - vec2(0.0, texel.y), 0.0).rgb;
  vec3 bottom = textureLod(sourceTexture, texCoord + vec2(0.0, texel.y), 0.0).rgb;
  vec3 minimumColor = min(current, min(min(left, right), min(top, bottom)));
  vec3 maximumColor = max(current, max(max(left, right), max(top, bottom)));
  vec2 historyCoord = ${i};
  vec4 history = textureLod(historyTexture, clamp(historyCoord, vec2(0.0), vec2(1.0)), 0.0);
  ${p}
  vec3 clampedHistory = clamp(history.rgb * bloomTemporal.exposureScale, minimumColor, maximumColor);
  float historyWeight = validHistory ? clamp(bloomTemporal.stability, 0.0, 0.95) : 0.0;
  return vec4(mix(current, clampedHistory, historyWeight), historyAlpha);
}
`,bindingLayout:[{name:"historyTexture",group:0},...e?[{name:"velocityTexture",group:0},{name:"depthTexture",group:0}]:[]],uniforms:{},bindings:{},uniformTypes:{stability:"f32",depthThreshold:"f32",exposureScale:"f32"},defaultUniforms:{stability:0,depthThreshold:.01,exposureScale:1},passes:[{sampler:!0}]}}function ae(e,t){const r=e?`
@group(0) @binding(auto) var lensTexture: texture_2d<f32>;
@group(0) @binding(auto) var lensTextureSampler: sampler;`:"",o=t?`
@group(0) @binding(auto) var lensDirtTexture: texture_2d<f32>;
@group(0) @binding(auto) var lensDirtTextureSampler: sampler;`:"",i=e?"textureSample(lensTexture, lensTextureSampler, texCoord).rgb":"vec3f(0.0)",n=t?"textureSample(lensDirtTexture, lensDirtTextureSampler, texCoord).rgb":"vec3f(0.0)",p=e?`
uniform sampler2D lensTexture;`:"",T=t?`
uniform sampler2D lensDirtTexture;`:"",S=e?"texture(lensTexture, texCoord).rgb":"vec3(0.0)",v=t?"texture(lensDirtTexture, texCoord).rgb":"vec3(0.0)";return{name:"bloomComposite",source:`
struct bloomCompositeUniforms {
  tint: vec3f,
  intensity: f32,
  dirtIntensity: f32,
  energyConserving: f32,
};

@group(0) @binding(auto) var<uniform> bloomComposite: bloomCompositeUniforms;
@group(0) @binding(auto) var glowTexture: texture_2d<f32>;
@group(0) @binding(auto) var glowTextureSampler: sampler;${r}${o}

fn bloomComposite_sampleColor(
  sourceTexture: texture_2d<f32>,
  sourceTextureSampler: sampler,
  texSize: vec2f,
  texCoord: vec2f
) -> vec4f {
  let sourceColor = textureSample(sourceTexture, sourceTextureSampler, texCoord);
  let glowColor = textureSample(glowTexture, glowTextureSampler, texCoord).rgb;
  let lensColor = ${i};
  let dirtMask = ${n};
  let cinematicGlow = (glowColor + lensColor) * (vec3f(1.0) + dirtMask * bloomComposite.dirtIntensity);
  let additiveColor = sourceColor.rgb + cinematicGlow * bloomComposite.tint * bloomComposite.intensity;
  let physicalColor = mix(
    sourceColor.rgb,
    cinematicGlow * bloomComposite.tint,
    clamp(bloomComposite.intensity, 0.0, 1.0)
  );
  return vec4f(
    select(additiveColor, physicalColor, bloomComposite.energyConserving > 0.5),
    sourceColor.a
  );
}
`,fs:`
layout(std140) uniform bloomCompositeUniforms {
  vec3 tint;
  float intensity;
  float dirtIntensity;
  float energyConserving;
} bloomComposite;

uniform sampler2D glowTexture;${p}${T}

vec4 bloomComposite_sampleColor(sampler2D sourceTexture, vec2 texSize, vec2 texCoord) {
  vec4 sourceColor = texture(sourceTexture, texCoord);
  vec3 glowColor = texture(glowTexture, texCoord).rgb;
  vec3 lensColor = ${S};
  vec3 dirtMask = ${v};
  vec3 cinematicGlow = (glowColor + lensColor) * (vec3(1.0) + dirtMask * bloomComposite.dirtIntensity);
  vec3 additiveColor = sourceColor.rgb + cinematicGlow * bloomComposite.tint * bloomComposite.intensity;
  vec3 physicalColor = mix(
    sourceColor.rgb,
    cinematicGlow * bloomComposite.tint,
    clamp(bloomComposite.intensity, 0.0, 1.0)
  );
  return vec4(
    bloomComposite.energyConserving > 0.5 ? physicalColor : additiveColor,
    sourceColor.a
  );
}
`,bindingLayout:[{name:"glowTexture",group:0},...e?[{name:"lensTexture",group:0}]:[],...t?[{name:"lensDirtTexture",group:0}]:[]],uniforms:{},bindings:{},uniformTypes:{tint:"vec3<f32>",intensity:"f32",dirtIntensity:"f32",energyConserving:"f32"},defaultUniforms:{tint:[1,1,1],intensity:1,dirtIntensity:0,energyConserving:0},passes:[{sampler:!0}]}}const d=24,ne={minFilter:"linear",magFilter:"linear"},ue={low:2,medium:3,high:4,ultra:5},ce=[{name:"Half",scale:.5},{name:"Quarter",scale:.25},{name:"Eighth",scale:.125},{name:"Sixteenth",scale:.0625},{name:"ThirtySecond",scale:.03125}],me={name:"bloomExtract",source:`
struct bloomExtractUniforms {
  threshold: f32,
  softKnee: f32,
  fireflyReduction: f32,
  exposure: f32,
  exposureCompensation: f32,
};

@group(0) @binding(auto) var<uniform> bloomExtract: bloomExtractUniforms;

fn bloomExtract_applyThreshold(sourceColor: vec4f) -> vec4f {
  let luminance = dot(sourceColor.rgb, vec3f(0.2126, 0.7152, 0.0722));
  let exposure = max(bloomExtract.exposure * exp2(bloomExtract.exposureCompensation), 0.0001);
  let threshold = bloomExtract.threshold / exposure;
  let knee = max(threshold * bloomExtract.softKnee, 0.00001);
  let soft = clamp((luminance - threshold + knee) / (2.0 * knee), 0.0, 1.0);
  let softContribution = soft * soft * knee;
  let hardContribution = max(luminance - threshold, 0.0);
  let bloomContribution = max(hardContribution, softContribution) / max(luminance, 0.00001);
  return vec4f(sourceColor.rgb * bloomContribution, sourceColor.a * bloomContribution);
}

fn bloomExtract_loadColor(sourceTexture: texture_2d<f32>, coordinate: vec2i) -> vec4f {
  let maximumCoordinate = vec2i(textureDimensions(sourceTexture)) - vec2i(1);
  return textureLoad(sourceTexture, clamp(coordinate, vec2i(0), maximumCoordinate), 0);
}

fn bloomExtract_sampleColor(
  sourceTexture: texture_2d<f32>,
  sourceTextureSampler: sampler,
  texSize: vec2f,
  texCoord: vec2f
) -> vec4f {
  let sourceDimensions = vec2i(textureDimensions(sourceTexture));
  let sourceCenter = texCoord * vec2f(sourceDimensions) - vec2f(0.5);
  let sourceFootprint = max(
    (abs(dpdx(texCoord)) + abs(dpdy(texCoord))) * vec2f(sourceDimensions),
    vec2f(1.0)
  );
  let filterRadius = max(sourceFootprint, vec2f(2.0));
  let minimumCoordinate = vec2i(floor(sourceCenter - filterRadius)) + vec2i(1);
  let maximumCoordinate = vec2i(ceil(sourceCenter + filterRadius)) - vec2i(1);
  var color = vec4f(0.0);
  var totalWeight = 0.0;

  // The tent radius follows the actual source-to-target ratio so reduced-resolution pyramids do
  // not leave unsampled bands. At the default half resolution this is the original 4x4 tent.
  for (var sourceY = minimumCoordinate.y; sourceY <= maximumCoordinate.y; sourceY += 1) {
    let weightY = max(1.0 - abs(f32(sourceY) - sourceCenter.y) / filterRadius.y, 0.0);
    for (var sourceX = minimumCoordinate.x; sourceX <= maximumCoordinate.x; sourceX += 1) {
      let weightX = max(1.0 - abs(f32(sourceX) - sourceCenter.x) / filterRadius.x, 0.0);
      let sourceColor = bloomExtract_loadColor(
        sourceTexture,
        vec2i(sourceX, sourceY)
      );
      let luminance = dot(sourceColor.rgb, vec3f(0.2126, 0.7152, 0.0722));
      let fireflyWeight = mix(
        1.0,
        1.0 / (1.0 + max(luminance, 0.0)),
        clamp(bloomExtract.fireflyReduction, 0.0, 1.0)
      );
      let weight = weightX * weightY * fireflyWeight;
      color += bloomExtract_applyThreshold(sourceColor) * weight;
      totalWeight += weight;
    }
  }

  return color / max(totalWeight, 0.00001);
}
`,fs:`
layout(std140) uniform bloomExtractUniforms {
  float threshold;
  float softKnee;
  float fireflyReduction;
  float exposure;
  float exposureCompensation;
} bloomExtract;

vec4 bloomExtract_applyThreshold(vec4 sourceColor) {
  float luminance = dot(sourceColor.rgb, vec3(0.2126, 0.7152, 0.0722));
  float exposure = max(bloomExtract.exposure * exp2(bloomExtract.exposureCompensation), 0.0001);
  float threshold = bloomExtract.threshold / exposure;
  float knee = max(threshold * bloomExtract.softKnee, 0.00001);
  float soft = clamp((luminance - threshold + knee) / (2.0 * knee), 0.0, 1.0);
  float softContribution = soft * soft * knee;
  float hardContribution = max(luminance - threshold, 0.0);
  float bloomContribution = max(hardContribution, softContribution) / max(luminance, 0.00001);
  return vec4(sourceColor.rgb * bloomContribution, sourceColor.a * bloomContribution);
}

vec4 bloomExtract_loadColor(sampler2D sourceTexture, ivec2 coordinate) {
  ivec2 maximumCoordinate = textureSize(sourceTexture, 0) - ivec2(1);
  return texelFetch(sourceTexture, clamp(coordinate, ivec2(0), maximumCoordinate), 0);
}

vec4 bloomExtract_sampleColor(sampler2D sourceTexture, vec2 texSize, vec2 texCoord) {
  ivec2 sourceDimensions = textureSize(sourceTexture, 0);
  vec2 sourceCenter = texCoord * vec2(sourceDimensions) - vec2(0.5);
  vec2 sourceFootprint = max(
    (abs(dFdx(texCoord)) + abs(dFdy(texCoord))) * vec2(sourceDimensions),
    vec2(1.0)
  );
  vec2 filterRadius = max(sourceFootprint, vec2(2.0));
  ivec2 minimumCoordinate = ivec2(floor(sourceCenter - filterRadius)) + ivec2(1);
  ivec2 maximumCoordinate = ivec2(ceil(sourceCenter + filterRadius)) - ivec2(1);
  vec4 color = vec4(0.0);
  float totalWeight = 0.0;

  // Keep this kernel identical to the WGSL path so WebGL and WebGPU conserve the same energy.
  for (int sourceY = minimumCoordinate.y; sourceY <= maximumCoordinate.y; sourceY++) {
    float weightY = max(1.0 - abs(float(sourceY) - sourceCenter.y) / filterRadius.y, 0.0);
    for (int sourceX = minimumCoordinate.x; sourceX <= maximumCoordinate.x; sourceX++) {
      float weightX = max(1.0 - abs(float(sourceX) - sourceCenter.x) / filterRadius.x, 0.0);
      vec4 sourceColor = bloomExtract_loadColor(
        sourceTexture,
        ivec2(sourceX, sourceY)
      );
      float luminance = dot(sourceColor.rgb, vec3(0.2126, 0.7152, 0.0722));
      float fireflyWeight = mix(
        1.0,
        1.0 / (1.0 + max(luminance, 0.0)),
        clamp(bloomExtract.fireflyReduction, 0.0, 1.0)
      );
      float weight = weightX * weightY * fireflyWeight;
      color += bloomExtract_applyThreshold(sourceColor) * weight;
      totalWeight += weight;
    }
  }

  return color / max(totalWeight, 0.00001);
}
`,uniformTypes:{threshold:"f32",softKnee:"f32",fireflyReduction:"f32",exposure:"f32",exposureCompensation:"f32"},defaultUniforms:{threshold:.8,softKnee:.5,fireflyReduction:0,exposure:1,exposureCompensation:0},propTypes:{threshold:{value:.8,min:0,max:1},softKnee:{value:.5,min:0,max:1},fireflyReduction:{value:0,min:0,max:1},exposure:{value:1,min:1e-4,softMax:8},exposureCompensation:{value:0,min:-8,max:8}},passes:[{sampler:!0}]},fe={name:"bloomDownsample",source:`
fn bloomDownsample_loadColor(sourceTexture: texture_2d<f32>, coordinate: vec2i) -> vec4f {
  let maximumCoordinate = vec2i(textureDimensions(sourceTexture)) - vec2i(1);
  return textureLoad(sourceTexture, clamp(coordinate, vec2i(0), maximumCoordinate), 0);
}

fn bloomDownsample_sampleColor(
  sourceTexture: texture_2d<f32>,
  sourceTextureSampler: sampler,
  texSize: vec2f,
  texCoord: vec2f
) -> vec4f {
  let sourceDimensions = vec2i(textureDimensions(sourceTexture));
  let sourceCenter = texCoord * vec2f(sourceDimensions) - vec2f(0.5);
  let sourceFootprint = max(
    (abs(dpdx(texCoord)) + abs(dpdy(texCoord))) * vec2f(sourceDimensions),
    vec2f(1.0)
  );
  let filterRadius = max(sourceFootprint, vec2f(2.0));
  let minimumCoordinate = vec2i(floor(sourceCenter - filterRadius)) + vec2i(1);
  let maximumCoordinate = vec2i(ceil(sourceCenter + filterRadius)) - vec2i(1);
  var color = vec4f(0.0);
  var totalWeight = 0.0;

  for (var sourceY = minimumCoordinate.y; sourceY <= maximumCoordinate.y; sourceY += 1) {
    let weightY = max(1.0 - abs(f32(sourceY) - sourceCenter.y) / filterRadius.y, 0.0);
    for (var sourceX = minimumCoordinate.x; sourceX <= maximumCoordinate.x; sourceX += 1) {
      let weightX = max(1.0 - abs(f32(sourceX) - sourceCenter.x) / filterRadius.x, 0.0);
      let weight = weightX * weightY;
      color += bloomDownsample_loadColor(
        sourceTexture,
        vec2i(sourceX, sourceY)
      ) * weight;
      totalWeight += weight;
    }
  }

  return color / max(totalWeight, 0.00001);
}
`,fs:`
vec4 bloomDownsample_loadColor(sampler2D sourceTexture, ivec2 coordinate) {
  ivec2 maximumCoordinate = textureSize(sourceTexture, 0) - ivec2(1);
  return texelFetch(sourceTexture, clamp(coordinate, ivec2(0), maximumCoordinate), 0);
}

vec4 bloomDownsample_sampleColor(sampler2D sourceTexture, vec2 texSize, vec2 texCoord) {
  ivec2 sourceDimensions = textureSize(sourceTexture, 0);
  vec2 sourceCenter = texCoord * vec2(sourceDimensions) - vec2(0.5);
  vec2 sourceFootprint = max(
    (abs(dFdx(texCoord)) + abs(dFdy(texCoord))) * vec2(sourceDimensions),
    vec2(1.0)
  );
  vec2 filterRadius = max(sourceFootprint, vec2(2.0));
  ivec2 minimumCoordinate = ivec2(floor(sourceCenter - filterRadius)) + ivec2(1);
  ivec2 maximumCoordinate = ivec2(ceil(sourceCenter + filterRadius)) - ivec2(1);
  vec4 color = vec4(0.0);
  float totalWeight = 0.0;

  for (int sourceY = minimumCoordinate.y; sourceY <= maximumCoordinate.y; sourceY++) {
    float weightY = max(1.0 - abs(float(sourceY) - sourceCenter.y) / filterRadius.y, 0.0);
    for (int sourceX = minimumCoordinate.x; sourceX <= maximumCoordinate.x; sourceX++) {
      float weightX = max(1.0 - abs(float(sourceX) - sourceCenter.x) / filterRadius.x, 0.0);
      float weight = weightX * weightY;
      color += bloomDownsample_loadColor(
        sourceTexture,
        ivec2(sourceX, sourceY)
      ) * weight;
      totalWeight += weight;
    }
  }

  return color / max(totalWeight, 0.00001);
}
`,passes:[{sampler:!0}]},z={name:"bloomBlur",source:`
const BLOOM_BLUR_MAX_RADIUS = ${d}.0;
const BLOOM_BLUR_MAX_PAIRS = ${Math.ceil(d/2)};

struct bloomBlurUniforms {
  radius: f32,
  delta: vec2f,
};

@group(0) @binding(auto) var<uniform> bloomBlur: bloomBlurUniforms;

fn bloomBlur_applySample(color: vec4f) -> vec4f {
  return color;
}

fn bloomBlur_getEffectiveRadius() -> f32 {
  return clamp(bloomBlur.radius, 0.0, BLOOM_BLUR_MAX_RADIUS);
}

fn bloomBlur_getSigma(radius: f32) -> f32 {
  return max(radius / 3.0, 0.00001);
}

fn bloomBlur_getWeight(offset: f32, sigma: f32) -> f32 {
  let normalizedOffset = offset / sigma;
  return exp(-0.5 * normalizedOffset * normalizedOffset);
}

fn bloomBlur_sampleColor(
  sourceTexture: texture_2d<f32>,
  sourceTextureSampler: sampler,
  texSize: vec2f,
  texCoord: vec2f
) -> vec4f {
  let effectiveRadius = bloomBlur_getEffectiveRadius();
  if (effectiveRadius <= 0.0) {
    return textureSample(sourceTexture, sourceTextureSampler, texCoord);
  }

  let adjustedDelta = bloomBlur.delta / texSize;
  let sigma = bloomBlur_getSigma(effectiveRadius);
  let centerWeight = bloomBlur_getWeight(0.0, sigma);

  var color = vec4f(0.0);
  var totalWeight = centerWeight;

  let centerColor = bloomBlur_applySample(
    textureSample(sourceTexture, sourceTextureSampler, texCoord)
  );
  color += centerColor * centerWeight;

  for (var pairIndex = 0; pairIndex < BLOOM_BLUR_MAX_PAIRS; pairIndex += 1) {
    let firstOffset = f32(pairIndex * 2 + 1);
    if (firstOffset > effectiveRadius) {
      continue;
    }

    let secondOffset = firstOffset + 1.0;
    let firstWeight = bloomBlur_getWeight(firstOffset, sigma);
    let secondWeight =
      select(0.0, bloomBlur_getWeight(secondOffset, sigma), secondOffset <= effectiveRadius);
    let combinedWeight = firstWeight + secondWeight;
    let combinedOffset =
      (firstOffset * firstWeight + secondOffset * secondWeight) / max(combinedWeight, 0.00001);

    let positiveColor = bloomBlur_applySample(
      textureSample(sourceTexture, sourceTextureSampler, texCoord + adjustedDelta * combinedOffset)
    );
    let negativeColor = bloomBlur_applySample(
      textureSample(sourceTexture, sourceTextureSampler, texCoord - adjustedDelta * combinedOffset)
    );

    color += (positiveColor + negativeColor) * combinedWeight;
    totalWeight += combinedWeight * 2.0;
  }

  return color / totalWeight;
}
`,fs:`
#define BLOOM_BLUR_MAX_RADIUS ${d}.0
#define BLOOM_BLUR_MAX_PAIRS ${Math.ceil(d/2)}

layout(std140) uniform bloomBlurUniforms {
  float radius;
  vec2 delta;
} bloomBlur;

vec4 bloomBlur_applySample(vec4 color) {
  return color;
}

float bloomBlur_getEffectiveRadius() {
  return clamp(bloomBlur.radius, 0.0, BLOOM_BLUR_MAX_RADIUS);
}

float bloomBlur_getSigma(float radius) {
  return max(radius / 3.0, 0.00001);
}

float bloomBlur_getWeight(float offset, float sigma) {
  float normalizedOffset = offset / sigma;
  return exp(-0.5 * normalizedOffset * normalizedOffset);
}

vec4 bloomBlur_sampleColor(sampler2D sourceTexture, vec2 texSize, vec2 texCoord) {
  float effectiveRadius = bloomBlur_getEffectiveRadius();
  if (effectiveRadius <= 0.0) {
    return texture(sourceTexture, texCoord);
  }

  vec2 adjustedDelta = bloomBlur.delta / texSize;
  float sigma = bloomBlur_getSigma(effectiveRadius);
  float centerWeight = bloomBlur_getWeight(0.0, sigma);

  vec4 color = vec4(0.0);
  float totalWeight = centerWeight;

  vec4 centerColor = bloomBlur_applySample(texture(sourceTexture, texCoord));
  color += centerColor * centerWeight;

  for (int pairIndex = 0; pairIndex < BLOOM_BLUR_MAX_PAIRS; pairIndex++) {
    float firstOffset = float(pairIndex * 2 + 1);
    if (firstOffset > effectiveRadius) {
      continue;
    }

    float secondOffset = firstOffset + 1.0;
    float firstWeight = bloomBlur_getWeight(firstOffset, sigma);
    float secondWeight = secondOffset <= effectiveRadius ? bloomBlur_getWeight(secondOffset, sigma) : 0.0;
    float combinedWeight = firstWeight + secondWeight;
    float combinedOffset =
      (firstOffset * firstWeight + secondOffset * secondWeight) / max(combinedWeight, 0.00001);

    vec4 positiveColor = bloomBlur_applySample(texture(sourceTexture, texCoord + adjustedDelta * combinedOffset));
    vec4 negativeColor = bloomBlur_applySample(texture(sourceTexture, texCoord - adjustedDelta * combinedOffset));
    color += (positiveColor + negativeColor) * combinedWeight;
    totalWeight += combinedWeight * 2.0;
  }

  color /= totalWeight;
  return color;
}
`,uniformTypes:{radius:"f32",delta:"vec2<f32>"},propTypes:{radius:{value:8,min:0,max:d,softMax:d},delta:{value:[1,0],private:!0}},passes:[{sampler:!0}]},xe={name:"bloomUpsample",source:`
struct bloomUpsampleUniforms {
  scatter: f32,
  reconstruction: f32,
};

@group(0) @binding(auto) var<uniform> bloomUpsample: bloomUpsampleUniforms;
@group(0) @binding(auto) var higherResolutionGlow: texture_2d<f32>;
@group(0) @binding(auto) var higherResolutionGlowSampler: sampler;

fn bloomUpsample_sampleLowerGlow(
  sourceTexture: texture_2d<f32>,
  sourceTextureSampler: sampler,
  texCoord: vec2f
) -> vec4f {
  let texel = 1.0 / vec2f(textureDimensions(sourceTexture));
  let horizontalOffset = vec2f(texel.x, 0.0);
  let verticalOffset = vec2f(0.0, texel.y);
  let center = textureSample(sourceTexture, sourceTextureSampler, texCoord) * 4.0;
  let edges = (
    textureSample(sourceTexture, sourceTextureSampler, texCoord - horizontalOffset) +
    textureSample(sourceTexture, sourceTextureSampler, texCoord + horizontalOffset) +
    textureSample(sourceTexture, sourceTextureSampler, texCoord - verticalOffset) +
    textureSample(sourceTexture, sourceTextureSampler, texCoord + verticalOffset)
  ) * 2.0;
  let corners =
    textureSample(sourceTexture, sourceTextureSampler, texCoord - horizontalOffset - verticalOffset) +
    textureSample(sourceTexture, sourceTextureSampler, texCoord + horizontalOffset - verticalOffset) +
    textureSample(sourceTexture, sourceTextureSampler, texCoord - horizontalOffset + verticalOffset) +
    textureSample(sourceTexture, sourceTextureSampler, texCoord + horizontalOffset + verticalOffset);
  return (center + edges + corners) / 16.0;
}

fn bloomUpsample_sampleBicubicGlow(
  sourceTexture: texture_2d<f32>,
  sourceTextureSampler: sampler,
  texCoord: vec2f
) -> vec4f {
  let dimensions = vec2f(textureDimensions(sourceTexture));
  let texelPosition = texCoord * dimensions - vec2f(0.5);
  let basePosition = floor(texelPosition);
  let fraction = fract(texelPosition);
  let complement = vec2f(1.0) - fraction;
  let firstWeight = complement * complement * complement / 6.0;
  let secondWeight =
    (fraction * fraction * fraction * 3.0 - fraction * fraction * 6.0 + vec2f(4.0)) / 6.0;
  let thirdWeight =
    (-fraction * fraction * fraction * 3.0 + fraction * fraction * 3.0 + fraction * 3.0 +
      vec2f(1.0)) / 6.0;
  let fourthWeight = fraction * fraction * fraction / 6.0;
  let firstPairWeight = firstWeight + secondWeight;
  let secondPairWeight = thirdWeight + fourthWeight;
  let firstPosition =
    (basePosition - vec2f(1.0) + secondWeight / firstPairWeight + vec2f(0.5)) / dimensions;
  let secondPosition =
    (basePosition + vec2f(1.0) + fourthWeight / secondPairWeight + vec2f(0.5)) / dimensions;
  let topLeft = textureSampleLevel(
    sourceTexture,
    sourceTextureSampler,
    vec2f(firstPosition.x, firstPosition.y),
    0.0
  );
  let topRight = textureSampleLevel(
    sourceTexture,
    sourceTextureSampler,
    vec2f(secondPosition.x, firstPosition.y),
    0.0
  );
  let bottomLeft = textureSampleLevel(
    sourceTexture,
    sourceTextureSampler,
    vec2f(firstPosition.x, secondPosition.y),
    0.0
  );
  let bottomRight = textureSampleLevel(
    sourceTexture,
    sourceTextureSampler,
    vec2f(secondPosition.x, secondPosition.y),
    0.0
  );
  return topLeft * firstPairWeight.x * firstPairWeight.y +
    topRight * secondPairWeight.x * firstPairWeight.y +
    bottomLeft * firstPairWeight.x * secondPairWeight.y +
    bottomRight * secondPairWeight.x * secondPairWeight.y;
}

fn bloomUpsample_sampleColor(
  sourceTexture: texture_2d<f32>,
  sourceTextureSampler: sampler,
  texSize: vec2f,
  texCoord: vec2f
) -> vec4f {
  var lowerGlow: vec4f;
  if (bloomUpsample.reconstruction > 0.5) {
    lowerGlow = bloomUpsample_sampleBicubicGlow(sourceTexture, sourceTextureSampler, texCoord);
  } else {
    lowerGlow = bloomUpsample_sampleLowerGlow(sourceTexture, sourceTextureSampler, texCoord);
  }
  let higherGlow = textureSample(higherResolutionGlow, higherResolutionGlowSampler, texCoord);
  return mix(higherGlow, lowerGlow, clamp(bloomUpsample.scatter, 0.0, 1.0));
}
`,fs:`
layout(std140) uniform bloomUpsampleUniforms {
  float scatter;
  float reconstruction;
} bloomUpsample;

uniform sampler2D higherResolutionGlow;

vec4 bloomUpsample_sampleLowerGlow(sampler2D sourceTexture, vec2 texCoord) {
  vec2 texel = 1.0 / vec2(textureSize(sourceTexture, 0));
  vec2 horizontalOffset = vec2(texel.x, 0.0);
  vec2 verticalOffset = vec2(0.0, texel.y);
  vec4 center = texture(sourceTexture, texCoord) * 4.0;
  vec4 edges = (
    texture(sourceTexture, texCoord - horizontalOffset) +
    texture(sourceTexture, texCoord + horizontalOffset) +
    texture(sourceTexture, texCoord - verticalOffset) +
    texture(sourceTexture, texCoord + verticalOffset)
  ) * 2.0;
  vec4 corners =
    texture(sourceTexture, texCoord - horizontalOffset - verticalOffset) +
    texture(sourceTexture, texCoord + horizontalOffset - verticalOffset) +
    texture(sourceTexture, texCoord - horizontalOffset + verticalOffset) +
    texture(sourceTexture, texCoord + horizontalOffset + verticalOffset);
  return (center + edges + corners) / 16.0;
}

vec4 bloomUpsample_sampleBicubicGlow(sampler2D sourceTexture, vec2 texCoord) {
  vec2 dimensions = vec2(textureSize(sourceTexture, 0));
  vec2 texelPosition = texCoord * dimensions - vec2(0.5);
  vec2 basePosition = floor(texelPosition);
  vec2 fraction = fract(texelPosition);
  vec2 complement = vec2(1.0) - fraction;
  vec2 firstWeight = complement * complement * complement / 6.0;
  vec2 secondWeight =
    (fraction * fraction * fraction * 3.0 - fraction * fraction * 6.0 + vec2(4.0)) / 6.0;
  vec2 thirdWeight =
    (-fraction * fraction * fraction * 3.0 + fraction * fraction * 3.0 + fraction * 3.0 +
      vec2(1.0)) / 6.0;
  vec2 fourthWeight = fraction * fraction * fraction / 6.0;
  vec2 firstPairWeight = firstWeight + secondWeight;
  vec2 secondPairWeight = thirdWeight + fourthWeight;
  vec2 firstPosition =
    (basePosition - vec2(1.0) + secondWeight / firstPairWeight + vec2(0.5)) / dimensions;
  vec2 secondPosition =
    (basePosition + vec2(1.0) + fourthWeight / secondPairWeight + vec2(0.5)) / dimensions;
  vec4 topLeft = textureLod(sourceTexture, vec2(firstPosition.x, firstPosition.y), 0.0);
  vec4 topRight = textureLod(sourceTexture, vec2(secondPosition.x, firstPosition.y), 0.0);
  vec4 bottomLeft = textureLod(sourceTexture, vec2(firstPosition.x, secondPosition.y), 0.0);
  vec4 bottomRight = textureLod(sourceTexture, vec2(secondPosition.x, secondPosition.y), 0.0);
  return topLeft * firstPairWeight.x * firstPairWeight.y +
    topRight * secondPairWeight.x * firstPairWeight.y +
    bottomLeft * firstPairWeight.x * secondPairWeight.y +
    bottomRight * secondPairWeight.x * secondPairWeight.y;
}

vec4 bloomUpsample_sampleColor(sampler2D sourceTexture, vec2 texSize, vec2 texCoord) {
  vec4 lowerGlow;
  if (bloomUpsample.reconstruction > 0.5) {
    lowerGlow = bloomUpsample_sampleBicubicGlow(sourceTexture, texCoord);
  } else {
    lowerGlow = bloomUpsample_sampleLowerGlow(sourceTexture, texCoord);
  }
  vec4 higherGlow = texture(higherResolutionGlow, texCoord);
  return mix(higherGlow, lowerGlow, clamp(bloomUpsample.scatter, 0.0, 1.0));
}
`,bindingLayout:[{name:"higherResolutionGlow",group:0}],uniforms:{},bindings:{},uniformTypes:{scatter:"f32",reconstruction:"f32"},defaultUniforms:{scatter:.55,reconstruction:0},propTypes:{scatter:{value:.55,min:0,max:1},reconstruction:{value:0,min:0,max:1,private:!0}},passes:[{sampler:!0}]},de={name:"bloomComposite",source:`
struct bloomCompositeUniforms {
  tint: vec3f,
  intensity: f32,
  energyConserving: f32,
};

@group(0) @binding(auto) var<uniform> bloomComposite: bloomCompositeUniforms;
@group(0) @binding(auto) var glowTexture: texture_2d<f32>;
@group(0) @binding(auto) var glowTextureSampler: sampler;

fn bloomComposite_sampleColor(
  sourceTexture: texture_2d<f32>,
  sourceTextureSampler: sampler,
  texSize: vec2f,
  texCoord: vec2f
) -> vec4f {
  let sourceColor = textureSample(sourceTexture, sourceTextureSampler, texCoord);
  let glowColor = textureSample(glowTexture, glowTextureSampler, texCoord).rgb;
  let tintedGlow = glowColor * bloomComposite.tint * bloomComposite.intensity;
  let additiveColor = sourceColor.rgb + tintedGlow;
  let physicalColor = mix(
    sourceColor.rgb,
    glowColor * bloomComposite.tint,
    clamp(bloomComposite.intensity, 0.0, 1.0)
  );
  return vec4f(
    select(additiveColor, physicalColor, bloomComposite.energyConserving > 0.5),
    sourceColor.a
  );
}
`,fs:`
layout(std140) uniform bloomCompositeUniforms {
  vec3 tint;
  float intensity;
  float energyConserving;
} bloomComposite;

uniform sampler2D glowTexture;

vec4 bloomComposite_sampleColor(sampler2D sourceTexture, vec2 texSize, vec2 texCoord) {
  vec4 sourceColor = texture(sourceTexture, texCoord);
  vec3 glowColor = texture(glowTexture, texCoord).rgb;
  vec3 tintedGlow = glowColor * bloomComposite.tint * bloomComposite.intensity;
  vec3 additiveColor = sourceColor.rgb + tintedGlow;
  vec3 physicalColor = mix(
    sourceColor.rgb,
    glowColor * bloomComposite.tint,
    clamp(bloomComposite.intensity, 0.0, 1.0)
  );
  return vec4(
    bloomComposite.energyConserving > 0.5 ? physicalColor : additiveColor,
    sourceColor.a
  );
}
`,bindingLayout:[{name:"glowTexture",group:0}],uniforms:{},bindings:{},uniformTypes:{tint:"vec3<f32>",intensity:"f32",energyConserving:"f32"},defaultUniforms:{tint:[1,1,1],intensity:1,energyConserving:0},propTypes:{tint:{value:[1,1,1]},intensity:{value:1,min:0,softMax:3},energyConserving:{value:0,min:0,max:1,private:!0}},passes:[{sampler:!0}]},pe={name:"bloomCompositeShaderPass"};function he(e={}){const t=e.resolutionScale??1,r=e.colorFormat??"rgba16float",o=e.energyConserving??!1,i=o?0:e.threshold??.8,n=e.radius??8,p=e.intensity??1,T=e.quality??"high",S=e.scatter??.55,v=e.softKnee??.5,w=e.fireflyReduction??0,C=Math.max(e.exposure??1,1e-4),W=e.exposureCompensation??0,k=e.reconstruction==="bicubic"?1:0,R=e.downsample??"auto",Y=e.reuseRenderTargets??!0,b=e.blurAlgorithm??"gaussian",y=Math.min(Math.max(e.anamorphicRatio??0,-1),1),D=e.tint??[1,1,1],I=Math.min(Math.max(e.temporalStability??0,0),.95),K=e.temporalReprojection??!1,H=Math.max(e.temporalDepthThreshold??.01,1e-4),F=Math.max(e.previousExposure??C,1e-4),a=e.lens,M=Math.max(a?.starburstIntensity??0,0),N=Math.min(Math.max(Math.round((a?.starburstSpikes??4)/2)*2,2),O),Z=Math.min(Math.max(a?.starburstLength??48,0),256),j=a?.starburstRotation??0,P=Math.max(a?.ghostIntensity??0,0),q=Math.min(Math.max(Math.round(a?.ghostCount??3),1),L),V=Math.min(Math.max(a?.ghostSpacing??.32,0),1),B=Math.max(a?.haloIntensity??0,0),Q=Math.min(Math.max(a?.haloRadius??.34,0),1),J=Math.min(Math.max(a?.chromaticAberration??0,0),1),E=Math.max(a?.dirtIntensity??0,0),g=M>0||P>0||B>0,U=E>0,G=Math.min(n,d/(1+Math.abs(y))),ee=G*(1+Math.max(y,0)),oe=G*(1+Math.max(-y,0)),m=ce.slice(0,ue[T]),f={},u=[],h=s=>({scale:[s*t,s*t],format:r,sampler:ne});for(const[s,l]of m.entries()){const c=`extract${l.name}`,_=`blur${l.name}Scratch`,$=`blur${l.name}`;if(f[c]={...h(l.scale),...R!=="render"?{storage:!0}:{}},b==="gaussian"&&(f[_]=h(l.scale),f[$]=h(l.scale)),s===0)u.push({shaderPass:me,inputs:{sourceTexture:"previous"},output:c,uniforms:{threshold:i,softKnee:v,fireflyReduction:w,exposure:C,exposureCompensation:W}});else{const te=m[s-1];u.push({shaderPass:fe,inputs:{sourceTexture:`extract${te.name}`},output:c})}b==="gaussian"&&u.push({shaderPass:z,inputs:{sourceTexture:c},output:_,uniforms:{radius:ee,delta:[1,0]}},{shaderPass:z,inputs:{sourceTexture:_},output:$,uniforms:{radius:oe,delta:[0,1]}})}const A=s=>`${b==="gaussian"?"blur":"extract"}${s}`;let x=A(m[m.length-1].name);for(let s=m.length-2;s>=0;s--){const l=m[s],c=`upsample${l.name}`;f[c]={...h(l.scale),...Y&&b==="gaussian"&&(!g||l.name!=="Half")?{aliasFor:`extract${l.name}`}:{}},u.push({shaderPass:xe,inputs:{sourceTexture:x,higherResolutionGlow:A(l.name)},output:c,uniforms:{scatter:S,reconstruction:k}}),x=c}return I>0&&(f.bloomGlowHistory={...h(.5),lifetime:"history",initialize:{clearColor:[0,0,0,0]}},u.push({shaderPass:le(K),inputs:{sourceTexture:x,historyTexture:"bloomGlowHistory"},output:"bloomGlowHistory",uniforms:{stability:I,depthThreshold:H,exposureScale:C/F}}),x="bloomGlowHistory"),g&&(f.bloomLensArtifacts=h(.5),u.push({shaderPass:se,inputs:{sourceTexture:"extractHalf",glowTexture:x},output:"bloomLensArtifacts",uniforms:{starburstIntensity:M,starburstSpikes:N,starburstLength:Z,starburstRotation:j,ghostIntensity:P,ghostCount:q,ghostSpacing:V,haloIntensity:B,haloRadius:Q,chromaticAberration:J}})),g||U?u.push({shaderPass:ae(g,U),inputs:{sourceTexture:"previous",glowTexture:x,...g?{lensTexture:"bloomLensArtifacts"}:{}},output:"previous",uniforms:{tint:D,intensity:p,dirtIntensity:E,energyConserving:Number(o)}}):u.push({shaderPass:de,inputs:{sourceTexture:"previous",glowTexture:x},output:"previous",uniforms:{tint:D,intensity:p,energyConserving:Number(o)}}),{name:pe.name,renderTargets:f,steps:u,...R!=="render"?{compute:re({levelNames:m.map(s=>s.name),colorFormat:r,threshold:i,softKnee:v,fireflyReduction:w,exposure:C,exposureCompensation:W})}:{}}}export{he as c};
