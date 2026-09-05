"use strict";(self.webpackChunkproject_website=self.webpackChunkproject_website||[]).push([["898"],{28453(t,i,n){n.d(i,{R:()=>s,x:()=>h});var e=n(96540);let o={},r=e.createContext(o);function s(t){let i=e.useContext(r);return e.useMemo(function(){return"function"==typeof t?t(i):{...i,...t}},[i,t])}function h(t){let i;return i=t.disableParentContext?"function"==typeof t.components?t.components(o):t.components||o:s(t.components),e.createElement(r.Provider,{value:i},t.children)}},90623(t,i,n){n.d(i,{l:()=>e});function e(t){let i=1/0,n=1/0,e=1/0,o=-1/0,r=-1/0,s=-1/0,h=t.POSITION?t.POSITION.value:[],c=h&&h.length;for(let t=0;t<c;t+=3){let c=h[t],a=h[t+1],l=h[t+2];i=c<i?c:i,n=a<n?a:n,e=l<e?l:e,o=c>o?c:o,r=a>r?a:r,s=l>s?l:s}return[[i,n,e],[o,r,s]]}},30397(t,i,n){function e(t,i="float32"){return t instanceof Date?"date-millisecond":t instanceof Number?i:"string"==typeof t?"utf8":"null"}function o(t){let i=r(t);return"null"!==i?{type:i,nullable:!1}:t.length>0?{type:i=e(t[0]),nullable:!0}:{type:"null",nullable:!0}}function r(t){switch(t.constructor){case Int8Array:return"int8";case Uint8Array:case Uint8ClampedArray:return"uint8";case Int16Array:return"int16";case Uint16Array:return"uint16";case Int32Array:return"int32";case Uint32Array:return"uint32";case Float32Array:return"float32";case Float64Array:return"float64";default:return"null"}}function s(t,i){if(!i)switch(t){case"int8":return Int8Array;case"uint8":return Uint8Array;case"int16":return Int16Array;case"uint16":return Uint16Array;case"int32":return Int32Array;case"uint32":return Uint32Array;case"float32":return Float32Array;case"float64":return Float64Array}return Array}n.d(i,{IT:()=>o,UE:()=>r,k1:()=>e,my:()=>s})},70833(t,i,n){n.d(i,{x:()=>h});var e=n(13559);let o=`\
precision highp int;

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

layout(std140) uniform lightingUniforms {
  int enabled;
  int directionalLightCount;
  int pointLightCount;
  int spotLightCount;
  vec3 ambientColor;
  UniformLight lights[5];
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
`,r=`\
// #if (defined(SHADER_TYPE_FRAGMENT) && defined(LIGHTING_FRAGMENT)) || (defined(SHADER_TYPE_VERTEX) && defined(LIGHTING_VERTEX))
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

struct lightingUniforms {
  enabled: i32,
  directionalLightCount: i32,
  pointLightCount: i32,
  spotLightCount: i32,
  ambientColor: vec3<f32>,
  lights: array<UniformLight, 5>,
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
`;var s=n(23471);let h={props:{},uniforms:{},name:"lighting",defines:{},uniformTypes:{enabled:"i32",directionalLightCount:"i32",pointLightCount:"i32",spotLightCount:"i32",ambientColor:"vec3<f32>",lights:[{color:"vec3<f32>",position:"vec3<f32>",direction:"vec3<f32>",attenuation:"vec3<f32>",coneCos:"vec2<f32>"},5]},defaultUniforms:a(),bindingLayout:[{name:"lighting",group:2}],firstBindingSlot:0,source:r,vs:o,fs:o,getUniforms:function(t,i={}){if(!(t=t?{...t}:t))return a();t.lights&&(t={...t,...function(t){let i={pointLights:[],spotLights:[],directionalLights:[]};for(let n of t||[])switch(n.type){case"ambient":i.ambientLight=n;break;case"directional":i.directionalLights?.push(n);break;case"point":i.pointLights?.push(n);break;case"spot":i.spotLights?.push(n)}return i}(t.lights),lights:void 0});let{useByteColors:n,ambientLight:o,pointLights:r,spotLights:s,directionalLights:h}=t||{};if(!(o||r&&r.length>0||s&&s.length>0||h&&h.length>0))return{...a(),enabled:0};let g={...a(),...function({useByteColors:t,ambientLight:i,pointLights:n=[],spotLights:o=[],directionalLights:r=[]}){let s=l(),h=0,a=0,g=0,u=0;for(let i of n){if(h>=5)break;s[h]={...s[h],color:c(i,t),position:i.position,attenuation:i.attenuation||[1,0,0]},h++,a++}for(let i of o){var p;if(h>=5)break;s[h]={...s[h],color:c(i,t),position:i.position,direction:i.direction,attenuation:i.attenuation||[1,0,0],coneCos:[Math.cos((p=i).innerConeAngle??0),Math.cos(p.outerConeAngle??Math.PI/4)]},h++,g++}for(let i of r){if(h>=5)break;s[h]={...s[h],color:c(i,t),direction:i.direction},h++,u++}return n.length+o.length+r.length>5&&e.R.warn("MAX_LIGHTS exceeded, truncating to 5")(),{ambientColor:c(i,t),directionalLightCount:u,pointLightCount:a,spotLightCount:g,lights:s}}({useByteColors:n,ambientLight:o,pointLights:r,spotLights:s,directionalLights:h})};return void 0!==t.enabled&&(g.enabled=+!!t.enabled),g}};function c(t={},i){let{color:n=[0,0,0],intensity:e=1}=t;return(0,s.sC)(n,(0,s.eS)(i,!0)).map(t=>t*e)}function a(){return{enabled:1,directionalLightCount:0,pointLightCount:0,spotLightCount:0,ambientColor:[.1,.1,.1],lights:l()}}function l(){return Array.from({length:5},()=>({color:[1,1,1],position:[1,1,2],direction:[1,1,1],attenuation:[1,0,0],coneCos:[1,0]}))}},34331(t,i,n){let e;n.d(i,{d:()=>p});var o,r,s=n(40882),h=n(93383),c=n(62541),a=n(93839),l=n(59808),g=n(49527);(o=r||(r={}))[o.COL0ROW0=0]="COL0ROW0",o[o.COL0ROW1=1]="COL0ROW1",o[o.COL0ROW2=2]="COL0ROW2",o[o.COL1ROW0=3]="COL1ROW0",o[o.COL1ROW1=4]="COL1ROW1",o[o.COL1ROW2=5]="COL1ROW2",o[o.COL2ROW0=6]="COL2ROW0",o[o.COL2ROW1=7]="COL2ROW1",o[o.COL2ROW2=8]="COL2ROW2";let u=Object.freeze([1,0,0,0,1,0,0,0,1]);class p extends s.u{static get IDENTITY(){return f||Object.freeze(f=new p),f}static get ZERO(){return e||Object.freeze(e=new p([0,0,0,0,0,0,0,0,0])),e}get ELEMENTS(){return 9}get RANK(){return 3}get INDICES(){return r}constructor(t,...i){super(-0,-0,-0,-0,-0,-0,-0,-0,-0),1==arguments.length&&Array.isArray(t)?this.copy(t):i.length>0?this.copy([t,...i]):this.identity()}copy(t){return this[0]=t[0],this[1]=t[1],this[2]=t[2],this[3]=t[3],this[4]=t[4],this[5]=t[5],this[6]=t[6],this[7]=t[7],this[8]=t[8],this.check()}identity(){return this.copy(u)}fromObject(t){return this.check()}fromQuaternion(t){return(0,a.I0)(this,t),this.check()}set(t,i,n,e,o,r,s,h,c){return this[0]=t,this[1]=i,this[2]=n,this[3]=e,this[4]=o,this[5]=r,this[6]=s,this[7]=h,this[8]=c,this.check()}setRowMajor(t,i,n,e,o,r,s,h,c){return this[0]=t,this[1]=e,this[2]=s,this[3]=i,this[4]=o,this[5]=h,this[6]=n,this[7]=r,this[8]=c,this.check()}determinant(){return(0,a.a4)(this)}transpose(){return(0,a.mg)(this,this),this.check()}invert(){return(0,a.B8)(this,this),this.check()}multiplyLeft(t){return(0,a.lw)(this,t,this),this.check()}multiplyRight(t){return(0,a.lw)(this,this,t),this.check()}rotate(t){return(0,a.e$)(this,this,t),this.check()}scale(t){return Array.isArray(t)?(0,a.hs)(this,this,t):(0,a.hs)(this,this,[t,t]),this.check()}translate(t){return(0,a.Tl)(this,this,t),this.check()}transform(t,i){let n;switch(t.length){case 2:n=(0,l.ei)(i||[-0,-0],t,this);break;case 3:n=(0,g.ei)(i||[-0,-0,-0],t,this);break;case 4:n=(0,c.vE)(i||[-0,-0,-0,-0],t,this);break;default:throw Error("Illegal vector")}return(0,h.qk)(n,t.length),n}transformVector(t,i){return this.transform(t,i)}transformVector2(t,i){return this.transform(t,i)}transformVector3(t,i){return this.transform(t,i)}}let f=null}}]);
//# sourceMappingURL=898.0968140a.js.map