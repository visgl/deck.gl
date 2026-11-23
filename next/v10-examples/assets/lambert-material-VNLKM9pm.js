import{_ as p,$ as m}from"./deck-example-device-ky_fVdIe.js";const L=4;function v(){return{color:[0,0,0],position:[0,0,0],halfAxisX:[0,0,0],halfAxisY:[0,0,0],normal:[0,0,-1],disk:0}}const b={color:"vec3<f32>",position:"vec3<f32>",halfAxisX:"vec3<f32>",halfAxisY:"vec3<f32>",normal:"vec3<f32>",disk:"i32"};function _(t,n=!1){return Array.from({length:L},(o,g)=>{const e=t[g];if(!e)return v();const r=p(e.color||(n?[255,255,255]:[1,1,1]),n);return{position:e.position,halfAxisX:e.halfAxisX,halfAxisY:e.halfAxisY,normal:e.normal,disk:e.type==="disk"?1:0,color:r.map(i=>i*(e.intensity??1e3))}})}const d=`precision highp int;

// #if (defined(SHADER_TYPE_FRAGMENT) && defined(LIGHTING_FRAGMENT)) || (defined(SHADER_TYPE_VERTEX) && defined(LIGHTING_VERTEX))
struct AmbientLight {
  vec3 color;
};

struct PointLight {
  vec3 color;
  vec3 position;
  vec3 attenuation; // 2nd order x:Constant-y:Linear-z:Exponential
};

struct SpotLight {
  vec3 color;
  vec3 position;
  vec3 direction;
  vec3 attenuation;
  vec2 coneCos;
};

struct DirectionalLight {
  vec3 color;
  vec3 direction;
};

struct UniformLight {
  vec3 color;
  vec3 position;
  vec3 direction;
  vec3 attenuation;
  vec2 coneCos;
};

struct AreaLightUniform {
  vec3 color; vec3 position; vec3 halfAxisX; vec3 halfAxisY; vec3 normal; int disk;
};

layout(std140) uniform lightingUniforms {
  int enabled;
  int directionalLightCount;
  int pointLightCount;
  int spotLightCount;
  vec3 ambientColor;
  UniformLight lights[5];
  int areaLightCount;
  AreaLightUniform areaLights[4];
} lighting;

PointLight lighting_getPointLight(int index) {
  UniformLight light = lighting.lights[index];
  return PointLight(light.color, light.position, light.attenuation);
}

SpotLight lighting_getSpotLight(int index) {
  UniformLight light = lighting.lights[lighting.pointLightCount + index];
  return SpotLight(light.color, light.position, light.direction, light.attenuation, light.coneCos);
}

DirectionalLight lighting_getDirectionalLight(int index) {
  UniformLight light =
    lighting.lights[lighting.pointLightCount + lighting.spotLightCount + index];
  return DirectionalLight(light.color, light.direction);
}

float getPointLightAttenuation(PointLight pointLight, float distance) {
  return pointLight.attenuation.x
       + pointLight.attenuation.y * distance
       + pointLight.attenuation.z * distance * distance;
}

float getSpotLightAttenuation(SpotLight spotLight, vec3 positionWorldspace) {
  vec3 light_direction = normalize(positionWorldspace - spotLight.position);
  float coneFactor = smoothstep(
    spotLight.coneCos.y,
    spotLight.coneCos.x,
    dot(normalize(spotLight.direction), light_direction)
  );
  float distanceAttenuation = getPointLightAttenuation(
    PointLight(spotLight.color, spotLight.position, spotLight.attenuation),
    distance(spotLight.position, positionWorldspace)
  );
  return distanceAttenuation / max(coneFactor, 0.0001);
}

// #endif
`,A=`// #if (defined(SHADER_TYPE_FRAGMENT) && defined(LIGHTING_FRAGMENT)) || (defined(SHADER_TYPE_VERTEX) && defined(LIGHTING_VERTEX))
const MAX_LIGHTS: i32 = 5;

struct AmbientLight {
  color: vec3<f32>,
};

struct PointLight {
  color: vec3<f32>,
  position: vec3<f32>,
  attenuation: vec3<f32>, // 2nd order x:Constant-y:Linear-z:Exponential
};

struct SpotLight {
  color: vec3<f32>,
  position: vec3<f32>,
  direction: vec3<f32>,
  attenuation: vec3<f32>,
  coneCos: vec2<f32>,
};

struct DirectionalLight {
  color: vec3<f32>,
  direction: vec3<f32>,
};

struct UniformLight {
  color: vec3<f32>,
  position: vec3<f32>,
  direction: vec3<f32>,
  attenuation: vec3<f32>,
  coneCos: vec2<f32>,
};

struct AreaLightUniform {
  color: vec3f, position: vec3f, halfAxisX: vec3f, halfAxisY: vec3f, normal: vec3f, disk: i32,
};

struct lightingUniforms {
  enabled: i32,
  directionalLightCount: i32,
  pointLightCount: i32,
  spotLightCount: i32,
  ambientColor: vec3<f32>,
  lights: array<UniformLight, 5>,
  areaLightCount: i32,
  areaLights: array<AreaLightUniform, 4>,
};

@group(2) @binding(auto) var<uniform> lighting : lightingUniforms;

fn lighting_getPointLight(index: i32) -> PointLight {
  let light = lighting.lights[index];
  return PointLight(light.color, light.position, light.attenuation);
}

fn lighting_getSpotLight(index: i32) -> SpotLight {
  let light = lighting.lights[lighting.pointLightCount + index];
  return SpotLight(light.color, light.position, light.direction, light.attenuation, light.coneCos);
}

fn lighting_getDirectionalLight(index: i32) -> DirectionalLight {
  let light = lighting.lights[lighting.pointLightCount + lighting.spotLightCount + index];
  return DirectionalLight(light.color, light.direction);
}

fn getPointLightAttenuation(pointLight: PointLight, distance: f32) -> f32 {
  return pointLight.attenuation.x
       + pointLight.attenuation.y * distance
       + pointLight.attenuation.z * distance * distance;
}

fn getSpotLightAttenuation(spotLight: SpotLight, positionWorldspace: vec3<f32>) -> f32 {
  let lightDirection = normalize(positionWorldspace - spotLight.position);
  let coneFactor = smoothstep(
    spotLight.coneCos.y,
    spotLight.coneCos.x,
    dot(normalize(spotLight.direction), lightDirection)
  );
  let distanceAttenuation = getPointLightAttenuation(
    PointLight(spotLight.color, spotLight.position, spotLight.attenuation),
    distance(spotLight.position, positionWorldspace)
  );
  return distanceAttenuation / max(coneFactor, 0.0001);
}
`,c=5,x={color:"vec3<f32>",position:"vec3<f32>",direction:"vec3<f32>",attenuation:"vec3<f32>",coneCos:"vec2<f32>"},S={props:{},uniforms:{},name:"lighting",defines:{},uniformTypes:{enabled:"i32",directionalLightCount:"i32",pointLightCount:"i32",spotLightCount:"i32",ambientColor:"vec3<f32>",lights:[x,c],areaLightCount:"i32",areaLights:[b,L]},defaultUniforms:f(),bindingLayout:[{name:"lighting",group:2}],firstBindingSlot:0,source:A,vs:d,fs:d,getUniforms:w};function w(t,n={}){t=t&&{...t};const o=(t?.lights||[]).filter(l=>l.type==="rect"||l.type==="disk");if(!t)return f();t.lights&&(t={...t,...T(t.lights),lights:void 0});const{useByteColors:g,ambientLight:e,pointLights:r,spotLights:i,directionalLights:h}=t||{};if(!(e||r&&r.length>0||i&&i.length>0||h&&h.length>0)&&o.length===0)return{...f(),enabled:0};const a={...f(),...U({useByteColors:g,ambientLight:e,pointLights:r,spotLights:i,directionalLights:h})};return a.areaLightCount=Math.min(o.length,L),a.areaLights=_(o,m(t.useByteColors,!0)),t.enabled!==void 0&&(a.enabled=t.enabled?1:0),a}function U({useByteColors:t,ambientLight:n,pointLights:o=[],spotLights:g=[],directionalLights:e=[]}){const r=C();let i=0,h=0,u=0,a=0;for(const l of o){if(i>=c)break;r[i]={...r[i],color:s(l,t),position:l.position,attenuation:l.attenuation||[1,0,0]},i++,h++}for(const l of g){if(i>=c)break;r[i]={...r[i],color:s(l,t),position:l.position,direction:l.direction,attenuation:l.attenuation||[1,0,0],coneCos:P(l)},i++,u++}for(const l of e){if(i>=c)break;r[i]={...r[i],color:s(l,t),direction:l.direction},i++,a++}return o.length+g.length+e.length>c&&console.warn(`MAX_LIGHTS exceeded, truncating to ${c}`),{ambientColor:s(n,t),directionalLightCount:a,pointLightCount:h,spotLightCount:u,lights:r}}function T(t){const n={pointLights:[],spotLights:[],directionalLights:[]};for(const o of t||[])switch(o.type){case"ambient":n.ambientLight=o;break;case"directional":n.directionalLights?.push(o);break;case"point":n.pointLights?.push(o);break;case"spot":n.spotLights?.push(o);break}return n}function s(t={},n){const{color:o=[0,0,0],intensity:g=1}=t;return p(o,m(n,!0)).map(r=>r*g)}function f(){return{enabled:1,directionalLightCount:0,pointLightCount:0,spotLightCount:0,ambientColor:[.1,.1,.1],lights:C(),areaLightCount:0,areaLights:_([])}}function C(){return Array.from({length:c},()=>E())}function E(){return{color:[1,1,1],position:[1,1,2],direction:[1,1,1],attenuation:[1,0,0],coneCos:[1,0]}}function P(t){const n=t.innerConeAngle??0,o=t.outerConeAngle??Math.PI/4;return[Math.cos(n),Math.cos(o)]}const M=`struct lambertMaterialUniforms {
  unlit: u32,
  ambient: f32,
  diffuse: f32,
};

@group(3) @binding(auto) var<uniform> lambertMaterial : lambertMaterialUniforms;

fn lighting_getLightColor(surfaceColor: vec3<f32>, light_direction: vec3<f32>, normal_worldspace: vec3<f32>, color: vec3<f32>) -> vec3<f32> {
  let lambertian: f32 = max(dot(light_direction, normal_worldspace), 0.0);
  return lambertian * lambertMaterial.diffuse * surfaceColor * color;
}

fn lighting_getLightColor2(surfaceColor: vec3<f32>, cameraPosition: vec3<f32>, position_worldspace: vec3<f32>, normal_worldspace: vec3<f32>) -> vec3<f32> {
  var lightColor: vec3<f32> = surfaceColor;

  if (lambertMaterial.unlit != 0u) {
    return surfaceColor;
  }

  if (lighting.enabled == 0) {
    return lightColor;
  }

  lightColor = lambertMaterial.ambient * surfaceColor * lighting.ambientColor;

  for (var i: i32 = 0; i < lighting.pointLightCount; i++) {
    let pointLight: PointLight = lighting_getPointLight(i);
    let light_position_worldspace: vec3<f32> = pointLight.position;
    let light_direction: vec3<f32> = normalize(light_position_worldspace - position_worldspace);
    let light_attenuation = getPointLightAttenuation(
      pointLight,
      distance(light_position_worldspace, position_worldspace)
    );
    lightColor += lighting_getLightColor(
      surfaceColor,
      light_direction,
      normal_worldspace,
      pointLight.color / light_attenuation
    );
  }

  for (var i: i32 = 0; i < lighting.spotLightCount; i++) {
    let spotLight: SpotLight = lighting_getSpotLight(i);
    let light_position_worldspace: vec3<f32> = spotLight.position;
    let light_direction: vec3<f32> = normalize(light_position_worldspace - position_worldspace);
    let light_attenuation = getSpotLightAttenuation(spotLight, position_worldspace);
    lightColor += lighting_getLightColor(
      surfaceColor,
      light_direction,
      normal_worldspace,
      spotLight.color / light_attenuation
    );
  }

  for (var i: i32 = 0; i < lighting.directionalLightCount; i++) {
    let directionalLight: DirectionalLight = lighting_getDirectionalLight(i);
    lightColor += lighting_getLightColor(
      surfaceColor,
      -directionalLight.direction,
      normal_worldspace,
      directionalLight.color
    );
  }

  return lightColor;
}
`,y=`layout(std140) uniform lambertMaterialUniforms {
  uniform bool unlit;
  uniform float ambient;
  uniform float diffuse;
} material;
`,G=`layout(std140) uniform lambertMaterialUniforms {
  uniform bool unlit;
  uniform float ambient;
  uniform float diffuse;
} material;

vec3 lambert_getLightColor(vec3 surfaceColor, vec3 light_direction, vec3 normal_worldspace, vec3 color) {
  float lambertian = max(dot(light_direction, normal_worldspace), 0.0);
  return lambertian * material.diffuse * surfaceColor * color;
}

vec3 lighting_getLightColor(vec3 surfaceColor, vec3 cameraPosition, vec3 position_worldspace, vec3 normal_worldspace) {
  vec3 lightColor = surfaceColor;

  if (material.unlit) {
    return surfaceColor;
  }

  if (lighting.enabled == 0) {
    return lightColor;
  }

  lightColor = material.ambient * surfaceColor * lighting.ambientColor;

  for (int i = 0; i < lighting.pointLightCount; i++) {
    PointLight pointLight = lighting_getPointLight(i);
    vec3 light_position_worldspace = pointLight.position;
    vec3 light_direction = normalize(light_position_worldspace - position_worldspace);
    float light_attenuation = getPointLightAttenuation(pointLight, distance(light_position_worldspace, position_worldspace));
    lightColor += lambert_getLightColor(surfaceColor, light_direction, normal_worldspace, pointLight.color / light_attenuation);
  }

  for (int i = 0; i < lighting.spotLightCount; i++) {
    SpotLight spotLight = lighting_getSpotLight(i);
    vec3 light_position_worldspace = spotLight.position;
    vec3 light_direction = normalize(light_position_worldspace - position_worldspace);
    float light_attenuation = getSpotLightAttenuation(spotLight, position_worldspace);
    lightColor += lambert_getLightColor(surfaceColor, light_direction, normal_worldspace, spotLight.color / light_attenuation);
  }

  for (int i = 0; i < lighting.directionalLightCount; i++) {
    DirectionalLight directionalLight = lighting_getDirectionalLight(i);
    lightColor += lambert_getLightColor(surfaceColor, -directionalLight.direction, normal_worldspace, directionalLight.color);
  }

  return lightColor;
}
`,D={name:"lambertMaterial",firstBindingSlot:0,bindingLayout:[{name:"lambertMaterial",group:3}],dependencies:[S],source:M,vs:y,fs:G,defines:{LIGHTING_FRAGMENT:!0},uniformTypes:{unlit:"i32",ambient:"f32",diffuse:"f32"},defaultUniforms:{unlit:!1,ambient:.35,diffuse:.6},getUniforms(t){return{...D.defaultUniforms,...t}}};export{S as a,D as l};
