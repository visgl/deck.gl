import{v as G,G as l,g as O}from"./meter-offset-position-CMR-ehQ5.js";import{r as T,c as k,v as q,d as $,a as B,h as H,g,b as W}from"./cloud-spectral-Bxz9AmFy.js";import{a1 as z,k as u,L as b,M as S,p as w}from"./deck-example-device-TQPRJnZ6.js";import{p as X}from"./point-glow-DAMvtmjx.js";const x={cover:.45,altitude:1e3,thickness:1200,scale:1400,density:.005,time:0,velocity:[14,4],sunDirection:[0,.8,.6],sunColor:[1,.95,.85]},K={name:"clouds",dependencies:[G],uniformTypes:{cover:"f32",altitude:"f32",thickness:"f32",scale:"f32",density:"f32",time:"f32",velocity:"vec2<f32>",sunDirection:"vec3<f32>",sunColor:"vec3<f32>"},defaultUniforms:x,getUniforms(o={},e=x){return{...x,...e,...o}},fs:`
layout(std140) uniform cloudsUniforms {
  float cover;
  float altitude;
  float thickness;
  float scale;
  float density;
  float time;
  vec2 velocity;
  vec3 sunDirection;
  vec3 sunColor;
} clouds;
// Shared normalized density field for planar slabs and spherical shells.
float clouds_getDensityAt(vec3 coordinate, float height) {
  float envelope = smoothstep(0.0, 0.2, height) * (1.0 - smoothstep(0.65, 1.0, height));
  coordinate += vec3(8.7, 3.2, clouds.time * 0.003);
  float broad = valueNoise_noise3(coordinate);
  float detail = valueNoise_noise3(coordinate * 2.07 + vec3(13.1, 7.3, 2.8));
  float fine = valueNoise_noise3(coordinate * 4.23 + vec3(5.4, 11.7, 8.1));
  float threshold = mix(0.78, 0.18, clamp(clouds.cover, 0.0, 1.0));
  return envelope * smoothstep(threshold, threshold + 0.16, broad * 0.72 + detail * 0.2 + fine * 0.08);
}

float clouds_getDensity(vec3 position) {
  float height = (position.z - clouds.altitude) / max(clouds.thickness, 1.0);
  return clouds_getDensityAt(vec3((position.xy - clouds.velocity * clouds.time) / max(clouds.scale, 1.0), height * 0.8), height);
}
vec3 clouds_getLighting(float density, float sunDensity, float daylight, float silver) {
  vec3 ambient = mix(vec3(0.035, 0.05, 0.085), vec3(0.28, 0.34, 0.42), daylight);
  float sunlight = exp(-(density + sunDensity) * 2.0);
  return ambient + clouds.sunColor * daylight * sunlight * (0.5 + silver * 0.3);
}

// Beer-Lambert extinction toward the sun through the same density used for sky rendering.
float clouds_getTransmittance(vec3 position) {
  if (clouds.cover <= 0.0 || clouds.density <= 0.0) return 1.0;
  vec3 direction = normalize(clouds.sunDirection);
  if (direction.z <= 0.02) return 1.0;
  float start = max((clouds.altitude - position.z) / direction.z, 0.0);
  float end = min((clouds.altitude + clouds.thickness - position.z) / direction.z, 40000.0);
  if (end <= start) return 1.0;
  float stepLength = (end - start) / 16.0;
  float opticalDepth = 0.0;
  for (int sampleIndex = 0; sampleIndex < 16; sampleIndex++) {
    opticalDepth += clouds_getDensity(position + direction * (start + (float(sampleIndex) + 0.5) * stepLength)) * stepLength;
  }
  return exp(-opticalDepth * max(clouds.density, 0.0));
}

vec4 clouds_getColor(vec3 camera, vec3 rayDirection) {
  if (clouds.cover <= 0.0 || clouds.density <= 0.0 || abs(rayDirection.z) < 0.0001) return vec4(0.0);
  float bottom = (clouds.altitude - camera.z) / rayDirection.z;
  float top = (clouds.altitude + max(clouds.thickness, 1.0) - camera.z) / rayDirection.z;
  float start = max(min(bottom, top), 0.0);
  float end = min(max(bottom, top), 20000.0);
  if (end <= start) return vec4(0.0);
  float jitter = valueNoise_hash(rayDirection.xy * 4096.0);
  float stepLength = (end - start) / 64.0;
  vec3 sunDirection = normalize(clouds.sunDirection);
  float daylight = smoothstep(-0.08, 0.18, sunDirection.z);
  float silver = pow(max(dot(rayDirection, sunDirection), 0.0), 12.0);
  vec3 radiance = vec3(0.0);
  float transmittance = 1.0;
  for (int sampleIndex = 0; sampleIndex < 64; sampleIndex++) {
    vec3 position = camera + rayDirection * (start + (float(sampleIndex) + jitter) * stepLength);
    float density = clouds_getDensity(position);
    float sunDensity = clouds_getDensity(position + sunDirection * clouds.thickness * 0.28);
    float alpha = 1.0 - exp(-density * max(clouds.density, 0.0) * stepLength);
    vec3 color = clouds_getLighting(density, sunDensity, daylight, silver);
    radiance += transmittance * alpha * color;
    transmittance *= 1.0 - alpha;
  }
  float distanceFade = 1.0 - smoothstep(10000.0, 20000.0, start);
  return vec4(radiance, 1.0 - transmittance) * distanceFade;
}
`,source:`
struct cloudsUniforms {
  cover: f32,
  altitude: f32,
  thickness: f32,
  scale: f32,
  density: f32,
  time: f32,
  velocity: vec2f,
  sunDirection: vec3f,
  sunColor: vec3f,
};
@group(3) @binding(auto) var<uniform> clouds: cloudsUniforms;
fn clouds_getDensityAt(inputCoordinate: vec3f, height: f32) -> f32 {
  let envelope = smoothstep(0.0, 0.2, height) * (1.0 - smoothstep(0.65, 1.0, height));
  var coordinate = inputCoordinate;
  coordinate += vec3f(8.7, 3.2, clouds.time * 0.003);
  let broad = valueNoise_noise3(coordinate);
  let detail = valueNoise_noise3(coordinate * 2.07 + vec3f(13.1, 7.3, 2.8));
  let fine = valueNoise_noise3(coordinate * 4.23 + vec3f(5.4, 11.7, 8.1));
  let threshold = mix(0.78, 0.18, clamp(clouds.cover, 0.0, 1.0));
  return envelope * smoothstep(threshold, threshold + 0.16, broad * 0.72 + detail * 0.2 + fine * 0.08);
}

fn clouds_getDensity(position: vec3f) -> f32 {
  let height = (position.z - clouds.altitude) / max(clouds.thickness, 1.0);
  return clouds_getDensityAt(vec3f((position.xy - clouds.velocity * clouds.time) / max(clouds.scale, 1.0), height * 0.8), height);
}
fn clouds_getLighting(density: f32, sunDensity: f32, daylight: f32, silver: f32) -> vec3f {
  let ambient = mix(vec3f(0.035, 0.05, 0.085), vec3f(0.28, 0.34, 0.42), daylight);
  let sunlight = exp(-(density + sunDensity) * 2.0);
  return ambient + clouds.sunColor * daylight * sunlight * (0.5 + silver * 0.3);
}

// Beer-Lambert extinction toward the sun through the same density used for sky rendering.
fn clouds_getTransmittance(position: vec3f) -> f32 {
  if (clouds.cover <= 0.0 || clouds.density <= 0.0) { return 1.0; }
  var direction: vec3f = normalize(clouds.sunDirection);
  if (direction.z <= 0.02) { return 1.0; }
  var start: f32 = max((clouds.altitude - position.z) / direction.z, 0.0);
  var end: f32 = min((clouds.altitude + clouds.thickness - position.z) / direction.z, 40000.0);
  if (end <= start) { return 1.0; }
  var stepLength: f32 = (end - start) / 16.0;
  var opticalDepth: f32 = 0.0;
  for (var sampleIndex: i32 = 0; sampleIndex < 16; sampleIndex++) {
    opticalDepth += clouds_getDensity(position + direction * (start + (f32(sampleIndex) + 0.5) * stepLength)) * stepLength;
  }
  return exp(-opticalDepth * max(clouds.density, 0.0));
}

fn clouds_getColor(camera: vec3f, rayDirection: vec3f) -> vec4f {
  if (clouds.cover <= 0.0 || clouds.density <= 0.0 || abs(rayDirection.z) < 0.0001) { return vec4f(0.0); }
  let bottom = (clouds.altitude - camera.z) / rayDirection.z;
  let top = (clouds.altitude + max(clouds.thickness, 1.0) - camera.z) / rayDirection.z;
  let start = max(min(bottom, top), 0.0);
  let end = min(max(bottom, top), 20000.0);
  if (end <= start) { return vec4f(0.0); }
  let jitter = valueNoise_hash(rayDirection.xy * 4096.0);
  let stepLength = (end - start) / 64.0;
  let sunDirection = normalize(clouds.sunDirection);
  let daylight = smoothstep(-0.08, 0.18, sunDirection.z);
  let silver = pow(max(dot(rayDirection, sunDirection), 0.0), 12.0);
  var radiance = vec3f(0.0);
  var transmittance = 1.0;
  for (var sampleIndex = 0; sampleIndex < 64; sampleIndex++) {
    let position = camera + rayDirection * (start + (f32(sampleIndex) + jitter) * stepLength);
    let density = clouds_getDensity(position);
    let sunDensity = clouds_getDensity(position + sunDirection * clouds.thickness * 0.28);
    let alpha = 1.0 - exp(-density * max(clouds.density, 0.0) * stepLength);
    let color = clouds_getLighting(density, sunDensity, daylight, silver);
    radiance += transmittance * alpha * color;
    transmittance *= 1.0 - alpha;
  }
  let distanceFade = 1.0 - smoothstep(10000.0, 20000.0, start);
  return vec4f(radiance, 1.0 - transmittance) * distanceFade;
}
`},D={enabled:1,sunDirection:[0,.8,.6],sunIntensity:20,haze:1,rayleigh:1,planetRadius:6371e3,exposure:1,groundColor:[.18,.17,.14]},_={name:"atmosphere",uniformTypes:{enabled:"f32",sunDirection:"vec3<f32>",sunIntensity:"f32",haze:"f32",rayleigh:"f32",planetRadius:"f32",exposure:"f32",groundColor:"vec3<f32>"},defaultUniforms:D,getUniforms(o={},e=D){return{...D,...e,...o}},fs:`
layout(std140) uniform atmosphereUniforms {
  float enabled;
  vec3 sunDirection;
  float sunIntensity;
  float haze;
  float rayleigh;
  float planetRadius;
  float exposure;
  vec3 groundColor;
} atmosphere;
struct AtmosphereSample {
  vec3 radiance;
  vec3 transmittance;
};

vec2 atmosphere_intersectSphere(vec3 origin, vec3 direction, float radius) {
  float projected = dot(origin, direction);
  float discriminant = projected * projected - (dot(origin.xy, origin.xy) + (origin.z - radius) * (origin.z + radius));
  if (discriminant < 0.0) return vec2(-1.0);
  float root = sqrt(discriminant);
  return vec2(-projected - root, -projected + root);
}
vec2 atmosphere_getDensity(vec3 position) {
  float height = max(length(position) - atmosphere.planetRadius, 0.0);
  return exp(-vec2(height / 8000.0, height / 1200.0));
}
AtmosphereSample atmosphere_getScattering(vec3 camera, vec3 direction, float distanceLimit) {
  AtmosphereSample result;
  result.radiance = vec3(0.0);
  result.transmittance = vec3(1.0);
  if (atmosphere.enabled < 0.5 || distanceLimit <= 0.0) return result;
  vec3 origin = vec3(camera.xy, atmosphere.planetRadius + max(camera.z, 1.0));
  vec2 shell = atmosphere_intersectSphere(origin, direction, atmosphere.planetRadius + 100000.0);
  float start = max(shell.x, 0.0);
  float end = min(shell.y, distanceLimit);
  vec2 ground = atmosphere_intersectSphere(origin, direction, atmosphere.planetRadius);
  if (ground.x > 0.0) end = min(end, ground.x);
  if (end <= start) return result;
  vec3 sunlight = normalize(atmosphere.sunDirection);
  vec3 rayleigh = vec3(0.0000058, 0.0000135, 0.0000331) * max(atmosphere.rayleigh, 0.0);
  vec3 mie = vec3(0.000021) * max(atmosphere.haze, 0.0);
  float cosine = dot(direction, sunlight);
  float rayleighPhase = 0.0596831 * (1.0 + cosine * cosine);
  float asymmetry = 0.76;
  float miePhase = (1.0 - asymmetry * asymmetry) / (12.566371 * pow(max(1.0 + asymmetry * asymmetry - 2.0 * asymmetry * cosine, 0.001), 1.5));
  float stepLength = (end - start) / 12.0;
  vec2 opticalDepth = vec2(0.0);
  vec3 radiance = vec3(0.0);
  for (int sampleIndex = 0; sampleIndex < 12; sampleIndex++) {
    vec3 position = origin + direction * (start + (float(sampleIndex) + 0.5) * stepLength);
    vec2 density = atmosphere_getDensity(position);
    vec2 centerDepth = opticalDepth + density * stepLength * 0.5;
    opticalDepth += density * stepLength;
    vec2 solarGround = atmosphere_intersectSphere(position, sunlight, atmosphere.planetRadius);
    if (solarGround.x > 0.0) continue;
    float solarDistance = max(atmosphere_intersectSphere(position, sunlight, atmosphere.planetRadius + 100000.0).y, 0.0);
    float solarStep = solarDistance / 4.0;
    vec2 solarDepth = vec2(0.0);
    for (int solarIndex = 0; solarIndex < 4; solarIndex++) {
      solarDepth += atmosphere_getDensity(position + sunlight * ((float(solarIndex) + 0.5) * solarStep)) * solarStep;
    }
    vec3 attenuation = exp(-rayleigh * (centerDepth.x + solarDepth.x) - mie * (centerDepth.y + solarDepth.y));
    radiance += attenuation * (rayleigh * density.x * rayleighPhase + mie * density.y * miePhase) * stepLength;
  }
  result.radiance = radiance * max(atmosphere.sunIntensity, 0.0);
  result.transmittance = exp(-rayleigh * opticalDepth.x - mie * opticalDepth.y);
  return result;
}
vec3 atmosphere_getSkyColor(vec3 camera, vec3 direction) {
  if (atmosphere.enabled < 0.5) return vec3(0.0);
  AtmosphereSample scatteringSample = atmosphere_getScattering(camera, normalize(direction), 1000000.0);
  vec3 origin = vec3(camera.xy, atmosphere.planetRadius + max(camera.z, 1.0));
  vec3 sunlight = normalize(atmosphere.sunDirection);
  float groundDistance = atmosphere_intersectSphere(origin, normalize(direction), atmosphere.planetRadius).x;
  if (groundDistance > 0.0 && sunlight.z > 0.0) {
    // Approximate direct irradiance at the ground boundary, attenuated on its way to the eye.
    float elevation = max(sunlight.z, 0.02);
    vec3 extinction = vec3(0.0000058, 0.0000135, 0.0000331) * max(atmosphere.rayleigh, 0.0) * 8000.0
      + vec3(0.000021) * max(atmosphere.haze, 0.0) * 1200.0;
    scatteringSample.radiance += atmosphere.groundColor * atmosphere.sunIntensity * sunlight.z / 3.141593
      * exp(-extinction / elevation) * scatteringSample.transmittance;
  }
  return vec3(1.0) - exp(-scatteringSample.radiance * atmosphere.exposure);
}
vec4 atmosphere_getColor(vec4 color, vec3 position, vec3 camera) {
  vec3 difference = position - camera;
  float distance = length(difference);
  if (distance < 0.001 || atmosphere.enabled < 0.5) return color;
  AtmosphereSample scatteringSample = atmosphere_getScattering(camera, difference / distance, distance);
  vec3 scattering = vec3(1.0) - exp(-scatteringSample.radiance * atmosphere.exposure);
  return vec4(color.rgb * scatteringSample.transmittance + scattering, color.a);
}
`,source:`
struct atmosphereUniforms {
  enabled: f32,
  sunDirection: vec3f,
  sunIntensity: f32,
  haze: f32,
  rayleigh: f32,
  planetRadius: f32,
  exposure: f32,
  groundColor: vec3f,
};
@group(3) @binding(auto) var<uniform> atmosphere: atmosphereUniforms;
struct AtmosphereSample { radiance: vec3f,
  transmittance: vec3f };

fn atmosphere_intersectSphere(origin: vec3f,
  direction: vec3f,
  radius: f32) -> vec2f {
  var projected: f32 = dot(origin, direction);
  var discriminant: f32 = projected * projected - (dot(origin.xy, origin.xy) + (origin.z - radius) * (origin.z + radius));
  if (discriminant < 0.0) { return vec2f(-1.0); }
  var root: f32 = sqrt(discriminant);
  return vec2f(-projected - root, -projected + root);
}
fn atmosphere_getDensity(position: vec3f) -> vec2f {
  var height: f32 = max(length(position) - atmosphere.planetRadius, 0.0);
  return exp(-vec2f(height / 8000.0, height / 1200.0));
}
fn atmosphere_getScattering(camera: vec3f,
  direction: vec3f,
  distanceLimit: f32) -> AtmosphereSample {
  var result: AtmosphereSample;
  result.radiance = vec3f(0.0);
  result.transmittance = vec3f(1.0);
  if (atmosphere.enabled < 0.5 || distanceLimit <= 0.0) { return result; }
  var origin: vec3f = vec3f(camera.xy, atmosphere.planetRadius + max(camera.z, 1.0));
  var shell: vec2f = atmosphere_intersectSphere(origin, direction, atmosphere.planetRadius + 100000.0);
  var start: f32 = max(shell.x, 0.0);
  var end: f32 = min(shell.y, distanceLimit);
  var ground: vec2f = atmosphere_intersectSphere(origin, direction, atmosphere.planetRadius);
  if (ground.x > 0.0) { end = min(end, ground.x); }
  if (end <= start) { return result; }
  var sunlight: vec3f = normalize(atmosphere.sunDirection);
  var rayleigh: vec3f = vec3f(0.0000058, 0.0000135, 0.0000331) * max(atmosphere.rayleigh, 0.0);
  var mie: vec3f = vec3f(0.000021) * max(atmosphere.haze, 0.0);
  var cosine: f32 = dot(direction, sunlight);
  var rayleighPhase: f32 = 0.0596831 * (1.0 + cosine * cosine);
  var asymmetry: f32 = 0.76;
  var miePhase: f32 = (1.0 - asymmetry * asymmetry) / (12.566371 * pow(max(1.0 + asymmetry * asymmetry - 2.0 * asymmetry * cosine, 0.001), 1.5));
  var stepLength: f32 = (end - start) / 12.0;
  var opticalDepth: vec2f = vec2f(0.0);
  var radiance: vec3f = vec3f(0.0);
  for (var sampleIndex: i32 = 0; sampleIndex < 12; sampleIndex++) {
    var position: vec3f = origin + direction * (start + (f32(sampleIndex) + 0.5) * stepLength);
    var density: vec2f = atmosphere_getDensity(position);
    var centerDepth: vec2f = opticalDepth + density * stepLength * 0.5;
    opticalDepth += density * stepLength;
    var solarGround: vec2f = atmosphere_intersectSphere(position, sunlight, atmosphere.planetRadius);
    if (solarGround.x > 0.0) { continue; }
    var solarDistance: f32 = max(atmosphere_intersectSphere(position, sunlight, atmosphere.planetRadius + 100000.0).y, 0.0);
    var solarStep: f32 = solarDistance / 4.0;
    var solarDepth: vec2f = vec2f(0.0);
    for (var solarIndex: i32 = 0; solarIndex < 4; solarIndex++) {
      solarDepth += atmosphere_getDensity(position + sunlight * ((f32(solarIndex) + 0.5) * solarStep)) * solarStep;
    }
    var attenuation: vec3f = exp(-rayleigh * (centerDepth.x + solarDepth.x) - mie * (centerDepth.y + solarDepth.y));
    radiance += attenuation * (rayleigh * density.x * rayleighPhase + mie * density.y * miePhase) * stepLength;
  }
  result.radiance = radiance * max(atmosphere.sunIntensity, 0.0);
  result.transmittance = exp(-rayleigh * opticalDepth.x - mie * opticalDepth.y);
  return result;
}
fn atmosphere_getSkyColor(camera: vec3f,
  direction: vec3f) -> vec3f {
  if (atmosphere.enabled < 0.5) { return vec3f(0.0); }
  var scatteringSample: AtmosphereSample = atmosphere_getScattering(camera, normalize(direction), 1000000.0);
  let origin = vec3f(camera.xy, atmosphere.planetRadius + max(camera.z, 1.0));
  let sunlight = normalize(atmosphere.sunDirection);
  let groundDistance = atmosphere_intersectSphere(origin, normalize(direction), atmosphere.planetRadius).x;
  if (groundDistance > 0.0 && sunlight.z > 0.0) {
    // Approximate direct irradiance at the ground boundary, attenuated on its way to the eye.
    let elevation = max(sunlight.z, 0.02);
    let extinction = vec3f(0.0000058, 0.0000135, 0.0000331) * max(atmosphere.rayleigh, 0.0) * 8000.0
      + vec3f(0.000021) * max(atmosphere.haze, 0.0) * 1200.0;
    scatteringSample.radiance += atmosphere.groundColor * atmosphere.sunIntensity * sunlight.z / 3.141593
      * exp(-extinction / elevation) * scatteringSample.transmittance;
  }
  return vec3f(1.0) - exp(-scatteringSample.radiance * atmosphere.exposure);
}
fn atmosphere_getColor(color: vec4f,
  position: vec3f,
  camera: vec3f) -> vec4f {
  var difference: vec3f = position - camera;
  var distance: f32 = length(difference);
  if (distance < 0.001 || atmosphere.enabled < 0.5) { return color; }
  var scatteringSample: AtmosphereSample = atmosphere_getScattering(camera, difference / distance, distance);
  var scattering: vec3f = vec3f(1.0) - exp(-scatteringSample.radiance * atmosphere.exposure);
  return vec4f(color.rgb * scatteringSample.transmittance + scattering, color.a);
}
`},A=6370972;function L(o){const{latitude:e,longitude:t}=k(o),i=e*Math.PI/180,s=t*Math.PI/180,a=Math.sin(s),c=Math.cos(s),r=Math.sin(i),n=Math.cos(i);return[c,a,0,-a*r,c*r,n,a*n,-c*n,r]}function R(o,e){T(o);const t=L(e);return[0,1,2].map(i=>t[i]*o[0]+t[i+3]*o[1]+t[i+6]*o[2])}function ue(o,e,t){q("Rendering distance",t,Number.MIN_VALUE,Number.MAX_VALUE);const i=k(e),s=R(o,i),a=Math.hypot(...s),c=R([0,0,1],i),r=s.map((p,j)=>p/a*t+c[j]*(A+i.elevation)),n=Math.hypot(...r);if(!Number.isFinite(n)||n===0)throw new RangeError("Sky position must have finite nonzero radius");return[Math.atan2(r[0],-r[1])*180/Math.PI,Math.atan2(r[2],Math.hypot(r[0],r[1]))*180/Math.PI,n-A]}function P(o,e,t=[0,0,0]){if(e)return e;const i=t.some(s=>s!==0)?t:[o instanceof l||o instanceof z?o.longitude:0,o instanceof l||o instanceof z?o.latitude:0,0];return k({longitude:i[0],latitude:i[1],elevation:i[2]})}function Y(o){return new u([o[0],o[1],o[2],0,o[3],o[4],o[5],0,o[6],o[7],o[8],0,0,0,0,1])}function J(o,e){const t=o instanceof l?Y(L(e)):new u().scale(o.getDistanceScales([e.longitude,e.latitude,e.elevation]).unitsPerMeter);return new u(o.projectionMatrix).multiplyRight(o.viewMatrix).multiplyRight(t)}const Q={name:"skyBody",uniformTypes:{center:"vec4<f32>",color:"vec4<f32>",offset:"vec2<f32>",moon:"f32",phase:"f32",limbAngle:"f32"},source:`struct skyBodyUniforms {
    center: vec4f,
    color: vec4f,
    offset: vec2f,
    moon: f32,
    phase: f32,
    limbAngle: f32,
  }; @group(3) @binding(auto) var<uniform> skyBody: skyBodyUniforms;`,vs:`layout(std140) uniform skyBodyUniforms {
    vec4 center;
    vec4 color;
    vec2 offset;
    float moon;
    float phase;
    float limbAngle;
  } skyBody;`,fs:`layout(std140) uniform skyBodyUniforms {
    vec4 center;
    vec4 color;
    vec2 offset;
    float moon;
    float phase;
    float limbAngle;
  } skyBody;`},h=class h extends b{getObserver(){return P(this.context.viewport,this.props.observer,this.props.coordinateOrigin)}getBodyDirection(){return this.props.direction??[0,1,.15]}getBodyRadius(){return this.props.radiusPixels??0}getBodyColor(){const e=this.props.color??[255,235,170,255];return[e[0]/255,e[1]/255,e[2]/255]}getBodySettings(){return{moon:0,phase:.5,limbAngle:0,halo:.3}}getAttributeManager(){return null}initializeState({device:e}){const t=e.createBuffer({data:new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1])});try{const i=new S(e,{...this.getShaders({source:ee,vs:te,fs:oe,modules:[w,X,Q]}),id:`${this.id}-sky-body`,topology:"triangle-list",vertexCount:6,bufferLayout:[{name:"corner",format:"float32x2"}],attributes:{corner:t},parameters:{depthCompare:"less-equal",depthWriteEnabled:!1,cullMode:"none",blend:!0,blendColorSrcFactor:"one",blendColorDstFactor:"one-minus-src-alpha",blendAlphaSrcFactor:"one",blendAlphaDstFactor:"one-minus-src-alpha"}});this.setState({model:i,corners:t})}catch(i){throw t.destroy(),i}}getModels(){return this.state.model?[this.state.model]:[]}draw({renderPass:e}){const t=Z(this.context.viewport,this.getBodyDirection(),this.props.coordinateOrigin,this.getObserver()),i=this.getBodyRadius();if(!t||!i)return;const s=this.getBodySettings(),a=s.moon?1:3,c=this.context.viewport,r=this.props.color??[255,235,170,255];this.state.model.shaderInputs.setProps({skyBody:{center:t,color:[...this.getBodyColor(),r[3]/255*this.props.opacity],offset:[2*i*a/c.width,2*i*a/c.height],moon:s.moon,phase:s.phase,limbAngle:s.limbAngle},pointGlow:{coreRadius:0,coreIntensity:0,haloIntensity:s.halo,falloff:6}}),this.state.model.draw(e)}finalizeState(e){this.state.model?.destroy(),this.state.corners?.destroy(),super.finalizeState(e)}};h.layerName="SkyBodyLayer",h.defaultProps={direction:void 0,timestamp:void 0,observer:void 0,radiusPixels:{type:"number",value:12,min:0},color:{type:"color",value:[255,235,170,255]},pickable:!1,parameters:{depthCompare:"less-equal",depthWriteEnabled:!1,cullMode:"none",blend:!0,blendColorSrcFactor:"one",blendColorDstFactor:"one-minus-src-alpha",blendAlphaSrcFactor:"one",blendAlphaDstFactor:"one-minus-src-alpha"}};let d=h;function Z(o,e,t=[0,0,0],i){if(!(o instanceof l)&&e[2]<=0||o.projectionMatrix[15]!==0)return null;const s=J(o,P(o,i,t)).transform([e[0],e[1],e[2],0]);return s[3]<=0?null:[s[0]/s[3],s[1]/s[3],1,1]}const ee=`
struct SkyVertex { @builtin(position) position: vec4f, @location(0) coordinate: vec2f };
@vertex fn vertexMain(@location(0) corner: vec2f) -> SkyVertex {
  var output: SkyVertex;
  output.position = vec4f(skyBody.center.xy + corner * skyBody.offset, 1.0, 1.0);
  output.coordinate = corner * select(3.0, 1.0, skyBody.moon > 0.5);
  return output;
}
@fragment fn fragmentMain(input: SkyVertex) -> @location(0) vec4f {
  if (picking.isActive > 0.5) { discard; }
  let radius = length(input.coordinate);
  let edge = max(fwidth(radius), 0.0001);
  let disk = 1.0 - smoothstep(1.0 - edge, 1.0 + edge, radius);
  var color = skyBody.color.rgb;
  var alpha = disk;
  if (skyBody.moon > 0.5) {
    if (radius > 1.0 + edge) { discard; }
    let cosine = cos(skyBody.limbAngle);
    let sine = sin(skyBody.limbAngle);
    let coordinate = vec2f(cosine * input.coordinate.x + sine * input.coordinate.y,
      -sine * input.coordinate.x + cosine * input.coordinate.y);
    let normal = vec3f(coordinate, sqrt(max(0.0, 1.0 - radius * radius)));
    let angle = skyBody.phase * 6.28318530718;
    let illumination = max(0.0, dot(normal, vec3f(sin(angle), 0.0, -cos(angle))));
    let maria = 0.88 + 0.08 * sin(coordinate.x * 11.0 + sin(coordinate.y * 8.0)) *
      cos(coordinate.y * 13.0 - coordinate.x * 3.0);
    color *= maria * (0.045 + 0.955 * sqrt(illumination));
  } else {
    let halo = pointGlow_getColor(input.coordinate / 3.0, vec3f(1.0));
    color *= disk + halo.r;
    alpha = clamp(disk + halo.r, 0.0, 1.0);
    // RGB is already premultiplied by the disk/halo coverage.
    return vec4f(color * skyBody.color.a, alpha * skyBody.color.a);
  }
  return vec4f(color * alpha * skyBody.color.a, alpha * skyBody.color.a);
}`,te=`#version 300 es
in vec2 corner; out vec2 coordinate;
void main() {
  gl_Position = vec4(skyBody.center.xy + corner * skyBody.offset, 1.0, 1.0);
  coordinate = corner * (skyBody.moon > 0.5 ? 1.0 : 3.0);
}`,oe=`#version 300 es
precision highp float;
in vec2 coordinate; out vec4 fragColor;
void main() {
  if (picking.isActive > 0.5) discard;
  float radius = length(coordinate);
  float edge = max(fwidth(radius), 0.0001);
  float disk = 1.0 - smoothstep(1.0 - edge, 1.0 + edge, radius);
  vec3 color = skyBody.color.rgb;
  float alpha = disk;
  if (skyBody.moon > 0.5) {
    if (radius > 1.0 + edge) discard;
    float cosine = cos(skyBody.limbAngle), sine = sin(skyBody.limbAngle);
    vec2 surface = vec2(cosine * coordinate.x + sine * coordinate.y,
      -sine * coordinate.x + cosine * coordinate.y);
    vec3 normal = vec3(surface, sqrt(max(0.0, 1.0 - radius * radius)));
    float angle = skyBody.phase * 6.28318530718;
    float illumination = max(0.0, dot(normal, vec3(sin(angle), 0.0, -cos(angle))));
    float maria = 0.88 + 0.08 * sin(surface.x * 11.0 + sin(surface.y * 8.0)) *
      cos(surface.y * 13.0 - surface.x * 3.0);
    color *= maria * (0.045 + 0.955 * sqrt(illumination));
  } else {
    float halo = pointGlow_getColor(coordinate / 3.0, vec3(1.0)).r;
    color *= disk + halo;
    alpha = clamp(disk + halo, 0.0, 1.0);
    fragColor = vec4(color * skyBody.color.a, alpha * skyBody.color.a);
    return;
  }
  fragColor = vec4(color * alpha * skyBody.color.a, alpha * skyBody.color.a);
}`,m=class m extends d{getBodyDirection(){if(this.props.direction)return this.props.direction;const e=this.getObserver(),t=$(this.props.timestamp??Date.now(),e.latitude,e.longitude);return B(t.altitude,t.azimuth)}getBodyColor(){const e=this.context.viewport instanceof l?Math.PI/2:Math.asin(this.getBodyDirection()[2]),t=H(e),i=this.props.direction||this.props.color?super.getBodyColor():t.color,s=this.props.radiance*(this.props.direction?1:t.intensity);return[i[0]*s,i[1]*s,i[2]*s]}getBodySettings(){return{moon:0,phase:.5,limbAngle:0,halo:this.props.haloIntensity}}};m.layerName="SunLayer",m.defaultProps={...d.defaultProps,color:{type:"color",value:null,optional:!0},radiance:{type:"number",value:8,min:0},haloIntensity:{type:"number",value:.3,min:0}};let I=m;const f=class f extends d{getBodyDirection(){if(this.props.direction)return this.props.direction;const e=this.getObserver(),t=g(this.props.timestamp??Date.now(),e.latitude,e.longitude);return B(t.altitude,t.azimuth)}getBodyRadius(){const e=super.getBodyRadius();if(!(this.props.scaleWithDistance??!this.props.direction))return e;const t=this.getObserver(),i=g(this.props.timestamp??Date.now(),t.latitude,t.longitude);return e*Math.asin(1737.4/i.distance)/Math.asin(1737.4/384400)}getBodySettings(){const e=this.getObserver(),t=this.props.timestamp??Date.now(),i=W(t),s=g(t,e.latitude,e.longitude);return{moon:1,phase:this.props.phase??(this.props.direction?.5:i.phase),limbAngle:this.props.limbAngle??(this.props.direction?0:Math.PI/2+i.angle-s.parallacticAngle-(i.phase>.5?Math.PI:0)),halo:0}}};f.layerName="MoonLayer",f.defaultProps={...d.defaultProps,color:{type:"color",value:[215,224,235,255]},scaleWithDistance:void 0,phase:void 0,limbAngle:void 0};let C=f;const E={name:"skyView",uniformTypes:{camera:"vec3<f32>",lowerLeft:"vec3<f32>",lowerRight:"vec3<f32>",upperLeft:"vec3<f32>",opacity:"f32"},source:`struct skyViewUniforms {
    camera: vec3f,
    lowerLeft: vec3f,
    lowerRight: vec3f,
    upperLeft: vec3f,
    opacity: f32,
  }; @group(3) @binding(auto) var<uniform> skyView: skyViewUniforms;`,vs:`layout(std140) uniform skyViewUniforms {
    vec3 camera;
    vec3 lowerLeft;
    vec3 lowerRight;
    vec3 upperLeft;
    float opacity;
  } skyView;`,fs:`layout(std140) uniform skyViewUniforms {
    vec3 camera;
    vec3 lowerLeft;
    vec3 lowerRight;
    vec3 upperLeft;
    float opacity;
  } skyView;`};function U(o,e){const t=new u(o.projectionMatrix).invert(),i=new u(o.viewMatrix).invert(),s=o.getDistanceScales([...e]).unitsPerMeter;function a(c,r){const n=t.transform([c,r,1,1]),p=i.transform([n[0],n[1],n[2],0]);return[p[0]/s[0],p[1]/s[1],p[2]/s[2]]}return{camera:O(o,e,o.cameraPosition),lowerLeft:a(-1,-1),lowerRight:a(1,-1),upperLeft:a(-1,1)}}const F=`
struct SkyViewVertex { @builtin(position) position: vec4f, @location(0) direction: vec3f };
@vertex fn vertexMain(@builtin(vertex_index) index: u32) -> SkyViewVertex {
  let positions = array<vec2f, 3>(vec2f(-1.0, -1.0), vec2f(3.0, -1.0), vec2f(-1.0, 3.0));
  let corner = positions[index];
  let fraction = corner * 0.5 + 0.5;
  var output: SkyViewVertex;
  output.position = vec4f(corner, 1.0, 1.0);
  output.direction = skyView.lowerLeft + fraction.x * (skyView.lowerRight - skyView.lowerLeft)
    + fraction.y * (skyView.upperLeft - skyView.lowerLeft);
  return output;
}
`,N=`#version 300 es
out vec3 direction;
void main() {
  vec2 positions[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
  vec2 corner = positions[gl_VertexID];
  vec2 fraction = corner * 0.5 + 0.5;
  gl_Position = vec4(corner, 1.0, 1.0);
  direction = skyView.lowerLeft + fraction.x * (skyView.lowerRight - skyView.lowerLeft)
    + fraction.y * (skyView.upperLeft - skyView.lowerLeft);
}`,v=class v extends b{getAttributeManager(){return null}initializeState({device:e}){this.setState({model:new S(e,{...this.getShaders({source:ie,vs:se,fs:re,modules:[w,K,E]}),id:`${this.id}-clouds`,topology:"triangle-list",vertexCount:3,parameters:{depthCompare:"less-equal",depthWriteEnabled:!1,cullMode:"none",blend:!0,blendColorSrcFactor:"one",blendColorDstFactor:"one-minus-src-alpha",blendAlphaSrcFactor:"one",blendAlphaDstFactor:"one-minus-src-alpha"}})})}getModels(){return this.state.model?[this.state.model]:[]}draw({renderPass:e}){const t=this.context.viewport;t instanceof l||t.projectionMatrix[15]!==0||!this.props.cover||(this.state.model.shaderInputs.setProps({clouds:{cover:this.props.cover,altitude:this.props.altitude,thickness:this.props.thickness,scale:this.props.scale,density:this.props.density,time:this.props.time,velocity:this.props.velocity,sunDirection:this.props.sunDirection,sunColor:this.props.sunColor},skyView:{...U(t,this.props.coordinateOrigin),opacity:this.props.opacity}}),this.state.model.draw(e))}finalizeState(e){this.state.model?.destroy(),super.finalizeState(e)}};v.layerName="CloudLayer",v.defaultProps={cover:{type:"number",value:.45,min:0,max:1},altitude:{type:"number",value:1e3},thickness:{type:"number",value:1200,min:1},scale:{type:"number",value:1400,min:1},density:{type:"number",value:.005,min:0},time:{type:"number",value:0},velocity:[14,4],sunDirection:[0,.8,.6],sunColor:[1,.95,.85],pickable:!1};let M=v;const ie=F+`
@fragment fn fragmentMain(input: SkyViewVertex) -> @location(0) vec4f {
  if (picking.isActive > 0.5) { discard; }
  return clouds_getColor(skyView.camera, normalize(input.direction)) * skyView.opacity;
}`,se=N,re=`#version 300 es
precision highp float;
in vec3 direction; out vec4 fragColor;
void main() {
  if (picking.isActive > 0.5) discard;
  fragColor = clouds_getColor(skyView.camera, normalize(direction)) * skyView.opacity;
}`,y=class y extends b{getAttributeManager(){return null}initializeState({device:e}){this.setState({model:new S(e,{...this.getShaders({source:ae,vs:N,fs:ne,modules:[w,_,E]}),id:`${this.id}-atmosphere`,topology:"triangle-list",vertexCount:3,parameters:{depthCompare:"less-equal",depthWriteEnabled:!1,cullMode:"none",blend:!0,blendColorSrcFactor:"one",blendColorDstFactor:"one-minus-src-alpha",blendAlphaSrcFactor:"one",blendAlphaDstFactor:"one-minus-src-alpha"}})})}getModels(){return this.state.model?[this.state.model]:[]}draw({renderPass:e}){const t=this.context.viewport;t instanceof l||t.projectionMatrix[15]!==0||!this.props.enabled||(this.state.model.shaderInputs.setProps({atmosphere:{enabled:this.props.enabled,sunDirection:this.props.sunDirection,sunIntensity:this.props.sunIntensity,haze:this.props.haze,rayleigh:this.props.rayleigh,planetRadius:this.props.planetRadius,exposure:this.props.exposure,groundColor:this.props.groundColor},skyView:{...U(t,this.props.coordinateOrigin),opacity:this.props.opacity}}),this.state.model.draw(e))}finalizeState(e){this.state.model?.destroy(),super.finalizeState(e)}};y.layerName="AtmosphereLayer",y.defaultProps={..._.defaultUniforms,pickable:!1};let V=y;const ae=F+`
@fragment fn fragmentMain(input: SkyViewVertex) -> @location(0) vec4f {
  if (picking.isActive > 0.5) { discard; }
  return vec4f(atmosphere_getSkyColor(skyView.camera, normalize(input.direction)) * skyView.opacity, skyView.opacity);
}`,ne=`#version 300 es
precision highp float;
in vec3 direction; out vec4 fragColor;
void main() {
  if (picking.isActive > 0.5) discard;
  fragColor = vec4(atmosphere_getSkyColor(skyView.camera, normalize(direction)) * skyView.opacity, skyView.opacity);
}`;export{V as A,M as C,C as M,I as S,_ as a,E as b,K as c,N as d,F as e,P as f,ue as g,J as h,Y as m,R as s};
