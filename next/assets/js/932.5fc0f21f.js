"use strict";(self.webpackChunkproject_website=self.webpackChunkproject_website||[]).push([["932"],{54869(t,i,e){e.d(i,{aH:()=>c}),"function"==typeof SuppressedError&&SuppressedError;var o,n,r,s,a,h=(s=n?o:(n=1,o=function t(i,e){if(i===e)return!0;if(i&&e&&"object"==typeof i&&"object"==typeof e){if(i.constructor!==e.constructor)return!1;if(Array.isArray(i)){if((o=i.length)!=e.length)return!1;for(n=o;0!=n--;)if(!t(i[n],e[n]))return!1;return!0}if(i.constructor===RegExp)return i.source===e.source&&i.flags===e.flags;if(i.valueOf!==Object.prototype.valueOf)return i.valueOf()===e.valueOf();if(i.toString!==Object.prototype.toString)return i.toString()===e.toString();if((o=(r=Object.keys(i)).length)!==Object.keys(e).length)return!1;for(n=o;0!=n--;)if(!Object.prototype.hasOwnProperty.call(e,r[n]))return!1;for(n=o;0!=n--;){var o,n,r,s=r[n];if(!t(i[s],e[s]))return!1}return!0}return i!=i&&e!=e}))&&s.__esModule&&Object.prototype.hasOwnProperty.call(s,"default")?s.default:s;let l="__googleMapsScriptId";(a=r||(r={}))[a.INITIALIZED=0]="INITIALIZED",a[a.LOADING=1]="LOADING",a[a.SUCCESS=2]="SUCCESS",a[a.FAILURE=3]="FAILURE";class c{constructor({apiKey:t,authReferrerPolicy:i,channel:e,client:o,id:n=l,language:r,libraries:s=[],mapIds:a,nonce:g,region:u,retries:d=3,url:p="https://maps.googleapis.com/maps/api/js",version:f}){if(this.callbacks=[],this.done=!1,this.loading=!1,this.errors=[],this.apiKey=t,this.authReferrerPolicy=i,this.channel=e,this.client=o,this.id=n||l,this.language=r,this.libraries=s,this.mapIds=a,this.nonce=g,this.region=u,this.retries=d,this.url=p,this.version=f,c.instance){if(!h(this.options,c.instance.options))throw Error(`Loader must not be called again with different options. ${JSON.stringify(this.options)} !== ${JSON.stringify(c.instance.options)}`);return c.instance}c.instance=this}get options(){return{version:this.version,apiKey:this.apiKey,channel:this.channel,client:this.client,id:this.id,libraries:this.libraries,language:this.language,region:this.region,mapIds:this.mapIds,nonce:this.nonce,url:this.url,authReferrerPolicy:this.authReferrerPolicy}}get status(){return this.errors.length?r.FAILURE:this.done?r.SUCCESS:this.loading?r.LOADING:r.INITIALIZED}get failed(){return this.done&&!this.loading&&this.errors.length>=this.retries+1}createUrl(){let t=this.url;return t+="?callback=__googleMapsCallback&loading=async",this.apiKey&&(t+=`&key=${this.apiKey}`),this.channel&&(t+=`&channel=${this.channel}`),this.client&&(t+=`&client=${this.client}`),this.libraries.length>0&&(t+=`&libraries=${this.libraries.join(",")}`),this.language&&(t+=`&language=${this.language}`),this.region&&(t+=`&region=${this.region}`),this.version&&(t+=`&v=${this.version}`),this.mapIds&&(t+=`&map_ids=${this.mapIds.join(",")}`),this.authReferrerPolicy&&(t+=`&auth_referrer_policy=${this.authReferrerPolicy}`),t}deleteScript(){let t=document.getElementById(this.id);t&&t.remove()}load(){return this.loadPromise()}loadPromise(){return new Promise((t,i)=>{this.loadCallback(e=>{e?i(e.error):t(window.google)})})}importLibrary(t){return this.execute(),google.maps.importLibrary(t)}loadCallback(t){this.callbacks.push(t),this.execute()}setScript(){var t,i;let e,o,n,r,s,a,h,l,c,g,u;if(document.getElementById(this.id))return void this.callback();let d={key:this.apiKey,channel:this.channel,client:this.client,libraries:this.libraries.length&&this.libraries,v:this.version,mapIds:this.mapIds,language:this.language,region:this.region,authReferrerPolicy:this.authReferrerPolicy};Object.keys(d).forEach(t=>!d[t]&&delete d[t]),(null==(i=null==(t=null==window?void 0:window.google)?void 0:t.maps)?void 0:i.importLibrary)||(r="google",s="importLibrary",a=document,l=(h=(h=window)[r]||(h[r]={})).maps||(h.maps={}),c=new Set,g=new URLSearchParams,u=()=>e||(e=new Promise((t,i)=>{var s,h,u,p;return s=this,h=void 0,u=void 0,p=function*(){var s;for(n in yield o=a.createElement("script"),o.id=this.id,g.set("libraries",[...c]+""),d)g.set(n.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),d[n]);g.set("callback",r+".maps.__ib__"),o.src=this.url+"?"+g,l.__ib__=t,o.onerror=()=>e=i(Error("The Google Maps JavaScript API could not load.")),o.nonce=this.nonce||(null==(s=a.querySelector("script[nonce]"))?void 0:s.nonce)||"",a.head.append(o)},new(u||(u=Promise))(function(t,i){function e(t){try{n(p.next(t))}catch(t){i(t)}}function o(t){try{n(p.throw(t))}catch(t){i(t)}}function n(i){var n;i.done?t(i.value):((n=i.value)instanceof u?n:new u(function(t){t(n)})).then(e,o)}n((p=p.apply(s,h||[])).next())})})),l[s]?console.warn("The Google Maps JavaScript API only loads once. Ignoring:",d):l[s]=(t,...i)=>c.add(t)&&u().then(()=>l[s](t,...i)));let p=this.libraries.map(t=>this.importLibrary(t));p.length||p.push(this.importLibrary("core")),Promise.all(p).then(()=>this.callback(),t=>{let i=new ErrorEvent("error",{error:t});this.loadErrorCallback(i)})}reset(){this.deleteScript(),this.done=!1,this.loading=!1,this.errors=[],this.onerrorEvent=null}resetIfRetryingFailed(){this.failed&&this.reset()}loadErrorCallback(t){if(this.errors.push(t),this.errors.length<=this.retries){let t=this.errors.length*Math.pow(2,this.errors.length);console.error(`Failed to load Google Maps script, retrying in ${t} ms.`),setTimeout(()=>{this.deleteScript(),this.setScript()},t)}else this.onerrorEvent=t,this.callback()}callback(){this.done=!0,this.loading=!1,this.callbacks.forEach(t=>{t(this.onerrorEvent)}),this.callbacks=[]}execute(){if(this.resetIfRetryingFailed(),!this.loading)if(this.done)this.callback();else{if(window.google&&window.google.maps&&window.google.maps.version){console.warn("Google Maps already loaded outside @googlemaps/js-api-loader. This may result in undesirable behavior as options and script parameters may not match."),this.callback();return}this.loading=!0,this.setScript()}}}},28453(t,i,e){e.d(i,{R:()=>s,x:()=>a});var o=e(96540);let n={},r=o.createContext(n);function s(t){let i=o.useContext(r);return o.useMemo(function(){return"function"==typeof t?t(i):{...i,...t}},[i,t])}function a(t){let i;return i=t.disableParentContext?"function"==typeof t.components?t.components(n):t.components||n:s(t.components),o.createElement(r.Provider,{value:i},t.children)}},72348(t,i,e){e.d(i,{HF:()=>s,i0:()=>a,qO:()=>r,zv:()=>n});var o=e(18309);let n=4;function r(){return{color:[0,0,0],position:[0,0,0],halfAxisX:[0,0,0],halfAxisY:[0,0,0],normal:[0,0,-1],disk:0}}let s={color:"vec3<f32>",position:"vec3<f32>",halfAxisX:"vec3<f32>",halfAxisY:"vec3<f32>",normal:"vec3<f32>",disk:"i32"};function a(t,i=!1){return Array.from({length:n},(e,n)=>{let s=t[n];if(!s)return r();let a=(0,o.sC)(s.color||(i?[255,255,255]:[1,1,1]),i);return{position:s.position,halfAxisX:s.halfAxisX,halfAxisY:s.halfAxisY,normal:s.normal,disk:+("disk"===s.type),color:a.map(t=>t*(s.intensity??1e3))}})}},43329(t,i,e){e.d(i,{x:()=>a});var o=e(72348);let n=`\
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
`;var s=e(18309);let a={props:{},uniforms:{},name:"lighting",defines:{},uniformTypes:{enabled:"i32",directionalLightCount:"i32",pointLightCount:"i32",spotLightCount:"i32",ambientColor:"vec3<f32>",lights:[{color:"vec3<f32>",position:"vec3<f32>",direction:"vec3<f32>",attenuation:"vec3<f32>",coneCos:"vec2<f32>"},5],areaLightCount:"i32",areaLights:[o.HF,o.zv]},defaultUniforms:l(),bindingLayout:[{name:"lighting",group:2}],firstBindingSlot:0,source:r,vs:n,fs:n,getUniforms:function(t,i={}){t=t?{...t}:t;let e=(t?.lights||[]).filter(t=>"rect"===t.type||"disk"===t.type);if(!t)return l();t.lights&&(t={...t,...function(t){let i={pointLights:[],spotLights:[],directionalLights:[]};for(let e of t||[])switch(e.type){case"ambient":i.ambientLight=e;break;case"directional":i.directionalLights?.push(e);break;case"point":i.pointLights?.push(e);break;case"spot":i.spotLights?.push(e)}return i}(t.lights),lights:void 0});let{useByteColors:n,ambientLight:r,pointLights:a,spotLights:g,directionalLights:u}=t||{};if(!(r||a&&a.length>0||g&&g.length>0||u&&u.length>0)&&0===e.length)return{...l(),enabled:0};let d={...l(),...function({useByteColors:t,ambientLight:i,pointLights:e=[],spotLights:o=[],directionalLights:n=[]}){let r=c(),s=0,a=0,l=0,g=0;for(let i of e){if(s>=5)break;r[s]={...r[s],color:h(i,t),position:i.position,attenuation:i.attenuation||[1,0,0]},s++,a++}for(let i of o){var u;if(s>=5)break;r[s]={...r[s],color:h(i,t),position:i.position,direction:i.direction,attenuation:i.attenuation||[1,0,0],coneCos:[Math.cos((u=i).innerConeAngle??0),Math.cos(u.outerConeAngle??Math.PI/4)]},s++,l++}for(let i of n){if(s>=5)break;r[s]={...r[s],color:h(i,t),direction:i.direction},s++,g++}return e.length+o.length+n.length>5&&console.warn("MAX_LIGHTS exceeded, truncating to 5"),{ambientColor:h(i,t),directionalLightCount:g,pointLightCount:a,spotLightCount:l,lights:r}}({useByteColors:n,ambientLight:r,pointLights:a,spotLights:g,directionalLights:u})};return d.areaLightCount=Math.min(e.length,o.zv),d.areaLights=(0,o.i0)(e,(0,s.eS)(t.useByteColors,!0)),void 0!==t.enabled&&(d.enabled=+!!t.enabled),d}};function h(t={},i){let{color:e=[0,0,0],intensity:o=1}=t;return(0,s.sC)(e,(0,s.eS)(i,!0)).map(t=>t*o)}function l(){return{enabled:1,directionalLightCount:0,pointLightCount:0,spotLightCount:0,ambientColor:[.1,.1,.1],lights:c(),areaLightCount:0,areaLights:(0,o.i0)([])}}function c(){return Array.from({length:5},()=>({color:[1,1,1],position:[1,1,2],direction:[1,1,1],attenuation:[1,0,0],coneCos:[1,0]}))}},23908(t,i,e){e.d(i,{I:()=>h});var o=e(54806),n=e(70319),r=e(63045),s=e(58486),a=e(80715);class h extends o.M{constructor(t=0,i=0){super(2),(0,n.cy)(t)&&1==arguments.length?this.copy(t):(n.$W.debug&&((0,r.ws)(t),(0,r.ws)(i)),this[0]=t,this[1]=i)}set(t,i){return this[0]=t,this[1]=i,this.check()}copy(t){return this[0]=t[0],this[1]=t[1],this.check()}fromObject(t){return n.$W.debug&&((0,r.ws)(t.x),(0,r.ws)(t.y)),this[0]=t.x,this[1]=t.y,this.check()}toObject(t){return t.x=this[0],t.y=this[1],t}get ELEMENTS(){return 2}horizontalAngle(){return Math.atan2(this.y,this.x)}verticalAngle(){return Math.atan2(this.x,this.y)}transform(t){return this.transformAsPoint(t)}transformAsPoint(t){return(0,s.Z0)(this,this,t),this.check()}transformAsVector(t){return(0,a.B$)(this,this,t),this.check()}transformByMatrix3(t){return(0,s.ei)(this,this,t),this.check()}transformByMatrix2x3(t){return(0,s.l0)(this,this,t),this.check()}transformByMatrix2(t){return(0,s.ZF)(this,this,t),this.check()}}},33058(t,i,e){e.d(i,{Gf:()=>l,I3:()=>u,N4:()=>r,cJ:()=>h,nv:()=>c,tR:()=>g,wi:()=>a,zX:()=>o,zx:()=>s});var o=6371008.8,n={centimeters:0x25f96350,centimetres:0x25f96350,degrees:360/(2*Math.PI),feet:20902260.511392,inches:250826616.45599997,kilometers:6371.0088,kilometres:6371.0088,meters:6371008.8,metres:6371008.8,miles:3958.761333810546,millimeters:0x17bbde120,millimetres:0x17bbde120,nauticalmiles:6371008.8/1852,radians:1,yards:6967335.223679999};function r(t,i,e={}){let o={type:"Feature"};return(0===e.id||e.id)&&(o.id=e.id),e.bbox&&(o.bbox=e.bbox),o.properties=i||{},o.geometry=t,o}function s(t,i,e={}){if(!t)throw Error("coordinates is required");if(!Array.isArray(t))throw Error("coordinates must be an Array");if(t.length<2)throw Error("coordinates must be at least 2 numbers long");if(!d(t[0])||!d(t[1]))throw Error("coordinates must contain numbers");return r({type:"Point",coordinates:t},i,e)}function a(t,i,e={}){if(t.length<2)throw Error("coordinates must be an array of two or more positions");return r({type:"LineString",coordinates:t},i,e)}function h(t,i="kilometers"){let e=n[i];if(!e)throw Error(i+" units is invalid");return t*e}function l(t,i="kilometers"){let e=n[i];if(!e)throw Error(i+" units is invalid");return t/e}function c(t){return t%(2*Math.PI)*180/Math.PI}function g(t){return t%360*Math.PI/180}function u(t,i="kilometers",e="kilometers"){if(!(t>=0))throw Error("length must be a positive number");return h(l(t,i),e)}function d(t){return!isNaN(t)&&null!==t&&!Array.isArray(t)}},52745(t,i,e){function o(t){if(!t)throw Error("coord is required");if(!Array.isArray(t)){if("Feature"===t.type&&null!==t.geometry&&"Point"===t.geometry.type)return[...t.geometry.coordinates];if("Point"===t.type)return[...t.coordinates]}if(Array.isArray(t)&&t.length>=2&&!Array.isArray(t[0])&&!Array.isArray(t[1]))return[...t];throw Error("coord must be GeoJSON Point or an Array of numbers")}function n(t){if(Array.isArray(t))return t;if("Feature"===t.type){if(null!==t.geometry)return t.geometry.coordinates}else if(t.coordinates)return t.coordinates;throw Error("coords must be GeoJSON Feature, Geometry Object or an Array")}function r(t){return"Feature"===t.type?t.geometry:t}function s(t,i){return"FeatureCollection"===t.type?"FeatureCollection":"GeometryCollection"===t.type?"GeometryCollection":"Feature"===t.type&&null!==t.geometry?t.geometry.type:t.type}e.d(i,{$R:()=>n,Pw:()=>s,bg:()=>r,uG:()=>o})},58586(t,i,e){e.d(i,{A:()=>a,F:()=>r});var o=e(33058),n=e(52745);function r(t,i,e={}){let o;return(o=e.final?s((0,n.uG)(i),(0,n.uG)(t)):s((0,n.uG)(t),(0,n.uG)(i)))>180?-(360-o):o}function s(t,i){let e=(0,o.tR)(t[1]),n=(0,o.tR)(i[1]),r=(0,o.tR)(i[0]-t[0]);r>Math.PI&&(r-=2*Math.PI),r<-Math.PI&&(r+=2*Math.PI);let s=Math.atan2(r,Math.log(Math.tan(n/2+Math.PI/4)/Math.tan(e/2+Math.PI/4)));return((0,o.nv)(s)+360)%360}var a=r},63(t,i,e){e.d(i,{A:()=>r});var o=e(33058),n=e(52745),r=function(t,i,e={}){var r,s,a;let h,l,c,g,u,d,p,f=(0,n.uG)(t),m=(0,n.uG)(i);m[0]+=m[0]-f[0]>180?-360:360*(f[0]-m[0]>180);let L=(r=f,s=m,h=a=void 0===a?o.zX:Number(a),l=r[1]*Math.PI/180,g=(c=s[1]*Math.PI/180)-l,(u=Math.abs(s[0]-r[0])*Math.PI/180)>Math.PI&&(u-=2*Math.PI),p=Math.abs(d=Math.log(Math.tan(c/2+Math.PI/4)/Math.tan(l/2+Math.PI/4)))>1e-11?g/d:Math.cos(l),Math.sqrt(g*g+p*p*u*u)*h);return(0,o.I3)(L,"meters",e.units)}}}]);
//# sourceMappingURL=932.5fc0f21f.js.map