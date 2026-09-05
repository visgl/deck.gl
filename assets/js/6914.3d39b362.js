"use strict";(self.webpackChunkproject_website=self.webpackChunkproject_website||[]).push([["6914"],{54869(t,i,e){e.d(i,{aH:()=>c}),"function"==typeof SuppressedError&&SuppressedError;var r,n,o,s,a,h=(s=n?r:(n=1,r=function t(i,e){if(i===e)return!0;if(i&&e&&"object"==typeof i&&"object"==typeof e){if(i.constructor!==e.constructor)return!1;if(Array.isArray(i)){if((r=i.length)!=e.length)return!1;for(n=r;0!=n--;)if(!t(i[n],e[n]))return!1;return!0}if(i.constructor===RegExp)return i.source===e.source&&i.flags===e.flags;if(i.valueOf!==Object.prototype.valueOf)return i.valueOf()===e.valueOf();if(i.toString!==Object.prototype.toString)return i.toString()===e.toString();if((r=(o=Object.keys(i)).length)!==Object.keys(e).length)return!1;for(n=r;0!=n--;)if(!Object.prototype.hasOwnProperty.call(e,o[n]))return!1;for(n=r;0!=n--;){var r,n,o,s=o[n];if(!t(i[s],e[s]))return!1}return!0}return i!=i&&e!=e}))&&s.__esModule&&Object.prototype.hasOwnProperty.call(s,"default")?s.default:s;let l="__googleMapsScriptId";(a=o||(o={}))[a.INITIALIZED=0]="INITIALIZED",a[a.LOADING=1]="LOADING",a[a.SUCCESS=2]="SUCCESS",a[a.FAILURE=3]="FAILURE";class c{constructor({apiKey:t,authReferrerPolicy:i,channel:e,client:r,id:n=l,language:o,libraries:s=[],mapIds:a,nonce:u,region:g,retries:d=3,url:p="https://maps.googleapis.com/maps/api/js",version:f}){if(this.callbacks=[],this.done=!1,this.loading=!1,this.errors=[],this.apiKey=t,this.authReferrerPolicy=i,this.channel=e,this.client=r,this.id=n||l,this.language=o,this.libraries=s,this.mapIds=a,this.nonce=u,this.region=g,this.retries=d,this.url=p,this.version=f,c.instance){if(!h(this.options,c.instance.options))throw Error(`Loader must not be called again with different options. ${JSON.stringify(this.options)} !== ${JSON.stringify(c.instance.options)}`);return c.instance}c.instance=this}get options(){return{version:this.version,apiKey:this.apiKey,channel:this.channel,client:this.client,id:this.id,libraries:this.libraries,language:this.language,region:this.region,mapIds:this.mapIds,nonce:this.nonce,url:this.url,authReferrerPolicy:this.authReferrerPolicy}}get status(){return this.errors.length?o.FAILURE:this.done?o.SUCCESS:this.loading?o.LOADING:o.INITIALIZED}get failed(){return this.done&&!this.loading&&this.errors.length>=this.retries+1}createUrl(){let t=this.url;return t+="?callback=__googleMapsCallback&loading=async",this.apiKey&&(t+=`&key=${this.apiKey}`),this.channel&&(t+=`&channel=${this.channel}`),this.client&&(t+=`&client=${this.client}`),this.libraries.length>0&&(t+=`&libraries=${this.libraries.join(",")}`),this.language&&(t+=`&language=${this.language}`),this.region&&(t+=`&region=${this.region}`),this.version&&(t+=`&v=${this.version}`),this.mapIds&&(t+=`&map_ids=${this.mapIds.join(",")}`),this.authReferrerPolicy&&(t+=`&auth_referrer_policy=${this.authReferrerPolicy}`),t}deleteScript(){let t=document.getElementById(this.id);t&&t.remove()}load(){return this.loadPromise()}loadPromise(){return new Promise((t,i)=>{this.loadCallback(e=>{e?i(e.error):t(window.google)})})}importLibrary(t){return this.execute(),google.maps.importLibrary(t)}loadCallback(t){this.callbacks.push(t),this.execute()}setScript(){var t,i;let e,r,n,o,s,a,h,l,c,u,g;if(document.getElementById(this.id))return void this.callback();let d={key:this.apiKey,channel:this.channel,client:this.client,libraries:this.libraries.length&&this.libraries,v:this.version,mapIds:this.mapIds,language:this.language,region:this.region,authReferrerPolicy:this.authReferrerPolicy};Object.keys(d).forEach(t=>!d[t]&&delete d[t]),(null==(i=null==(t=null==window?void 0:window.google)?void 0:t.maps)?void 0:i.importLibrary)||(o="google",s="importLibrary",a=document,l=(h=(h=window)[o]||(h[o]={})).maps||(h.maps={}),c=new Set,u=new URLSearchParams,g=()=>e||(e=new Promise((t,i)=>{var s,h,g,p;return s=this,h=void 0,g=void 0,p=function*(){var s;for(n in yield r=a.createElement("script"),r.id=this.id,u.set("libraries",[...c]+""),d)u.set(n.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),d[n]);u.set("callback",o+".maps.__ib__"),r.src=this.url+"?"+u,l.__ib__=t,r.onerror=()=>e=i(Error("The Google Maps JavaScript API could not load.")),r.nonce=this.nonce||(null==(s=a.querySelector("script[nonce]"))?void 0:s.nonce)||"",a.head.append(r)},new(g||(g=Promise))(function(t,i){function e(t){try{n(p.next(t))}catch(t){i(t)}}function r(t){try{n(p.throw(t))}catch(t){i(t)}}function n(i){var n;i.done?t(i.value):((n=i.value)instanceof g?n:new g(function(t){t(n)})).then(e,r)}n((p=p.apply(s,h||[])).next())})})),l[s]?console.warn("The Google Maps JavaScript API only loads once. Ignoring:",d):l[s]=(t,...i)=>c.add(t)&&g().then(()=>l[s](t,...i)));let p=this.libraries.map(t=>this.importLibrary(t));p.length||p.push(this.importLibrary("core")),Promise.all(p).then(()=>this.callback(),t=>{let i=new ErrorEvent("error",{error:t});this.loadErrorCallback(i)})}reset(){this.deleteScript(),this.done=!1,this.loading=!1,this.errors=[],this.onerrorEvent=null}resetIfRetryingFailed(){this.failed&&this.reset()}loadErrorCallback(t){if(this.errors.push(t),this.errors.length<=this.retries){let t=this.errors.length*Math.pow(2,this.errors.length);console.error(`Failed to load Google Maps script, retrying in ${t} ms.`),setTimeout(()=>{this.deleteScript(),this.setScript()},t)}else this.onerrorEvent=t,this.callback()}callback(){this.done=!0,this.loading=!1,this.callbacks.forEach(t=>{t(this.onerrorEvent)}),this.callbacks=[]}execute(){if(this.resetIfRetryingFailed(),!this.loading)if(this.done)this.callback();else{if(window.google&&window.google.maps&&window.google.maps.version){console.warn("Google Maps already loaded outside @googlemaps/js-api-loader. This may result in undesirable behavior as options and script parameters may not match."),this.callback();return}this.loading=!0,this.setScript()}}}},28453(t,i,e){e.d(i,{R:()=>s,x:()=>a});var r=e(96540);let n={},o=r.createContext(n);function s(t){let i=r.useContext(o);return r.useMemo(function(){return"function"==typeof t?t(i):{...i,...t}},[i,t])}function a(t){let i;return i=t.disableParentContext?"function"==typeof t.components?t.components(n):t.components||n:s(t.components),r.createElement(o.Provider,{value:i},t.children)}},90623(t,i,e){e.d(i,{l:()=>r});function r(t){let i=1/0,e=1/0,r=1/0,n=-1/0,o=-1/0,s=-1/0,a=t.POSITION?t.POSITION.value:[],h=a&&a.length;for(let t=0;t<h;t+=3){let h=a[t],l=a[t+1],c=a[t+2];i=h<i?h:i,e=l<e?l:e,r=c<r?c:r,n=h>n?h:n,o=l>o?l:o,s=c>s?c:s}return[[i,e,r],[n,o,s]]}},30397(t,i,e){function r(t,i="float32"){return t instanceof Date?"date-millisecond":t instanceof Number?i:"string"==typeof t?"utf8":"null"}function n(t){let i=o(t);return"null"!==i?{type:i,nullable:!1}:t.length>0?{type:i=r(t[0]),nullable:!0}:{type:"null",nullable:!0}}function o(t){switch(t.constructor){case Int8Array:return"int8";case Uint8Array:case Uint8ClampedArray:return"uint8";case Int16Array:return"int16";case Uint16Array:return"uint16";case Int32Array:return"int32";case Uint32Array:return"uint32";case Float32Array:return"float32";case Float64Array:return"float64";default:return"null"}}function s(t,i){if(!i)switch(t){case"int8":return Int8Array;case"uint8":return Uint8Array;case"int16":return Int16Array;case"uint16":return Uint16Array;case"int32":return Int32Array;case"uint32":return Uint32Array;case"float32":return Float32Array;case"float64":return Float64Array}return Array}e.d(i,{IT:()=>n,UE:()=>o,k1:()=>r,my:()=>s})},70833(t,i,e){e.d(i,{x:()=>a});var r=e(13559);let n=`\
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
`,o=`\
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
`;var s=e(23471);let a={props:{},uniforms:{},name:"lighting",defines:{},uniformTypes:{enabled:"i32",directionalLightCount:"i32",pointLightCount:"i32",spotLightCount:"i32",ambientColor:"vec3<f32>",lights:[{color:"vec3<f32>",position:"vec3<f32>",direction:"vec3<f32>",attenuation:"vec3<f32>",coneCos:"vec2<f32>"},5]},defaultUniforms:l(),bindingLayout:[{name:"lighting",group:2}],firstBindingSlot:0,source:o,vs:n,fs:n,getUniforms:function(t,i={}){if(!(t=t?{...t}:t))return l();t.lights&&(t={...t,...function(t){let i={pointLights:[],spotLights:[],directionalLights:[]};for(let e of t||[])switch(e.type){case"ambient":i.ambientLight=e;break;case"directional":i.directionalLights?.push(e);break;case"point":i.pointLights?.push(e);break;case"spot":i.spotLights?.push(e)}return i}(t.lights),lights:void 0});let{useByteColors:e,ambientLight:n,pointLights:o,spotLights:s,directionalLights:a}=t||{};if(!(n||o&&o.length>0||s&&s.length>0||a&&a.length>0))return{...l(),enabled:0};let u={...l(),...function({useByteColors:t,ambientLight:i,pointLights:e=[],spotLights:n=[],directionalLights:o=[]}){let s=c(),a=0,l=0,u=0,g=0;for(let i of e){if(a>=5)break;s[a]={...s[a],color:h(i,t),position:i.position,attenuation:i.attenuation||[1,0,0]},a++,l++}for(let i of n){var d;if(a>=5)break;s[a]={...s[a],color:h(i,t),position:i.position,direction:i.direction,attenuation:i.attenuation||[1,0,0],coneCos:[Math.cos((d=i).innerConeAngle??0),Math.cos(d.outerConeAngle??Math.PI/4)]},a++,u++}for(let i of o){if(a>=5)break;s[a]={...s[a],color:h(i,t),direction:i.direction},a++,g++}return e.length+n.length+o.length>5&&r.R.warn("MAX_LIGHTS exceeded, truncating to 5")(),{ambientColor:h(i,t),directionalLightCount:g,pointLightCount:l,spotLightCount:u,lights:s}}({useByteColors:e,ambientLight:n,pointLights:o,spotLights:s,directionalLights:a})};return void 0!==t.enabled&&(u.enabled=+!!t.enabled),u}};function h(t={},i){let{color:e=[0,0,0],intensity:r=1}=t;return(0,s.sC)(e,(0,s.eS)(i,!0)).map(t=>t*r)}function l(){return{enabled:1,directionalLightCount:0,pointLightCount:0,spotLightCount:0,ambientColor:[.1,.1,.1],lights:c()}}function c(){return Array.from({length:5},()=>({color:[1,1,1],position:[1,1,2],direction:[1,1,1],attenuation:[1,0,0],coneCos:[1,0]}))}},34331(t,i,e){let r;e.d(i,{d:()=>d});var n,o,s=e(40882),a=e(93383),h=e(62541),l=e(93839),c=e(59808),u=e(49527);(n=o||(o={}))[n.COL0ROW0=0]="COL0ROW0",n[n.COL0ROW1=1]="COL0ROW1",n[n.COL0ROW2=2]="COL0ROW2",n[n.COL1ROW0=3]="COL1ROW0",n[n.COL1ROW1=4]="COL1ROW1",n[n.COL1ROW2=5]="COL1ROW2",n[n.COL2ROW0=6]="COL2ROW0",n[n.COL2ROW1=7]="COL2ROW1",n[n.COL2ROW2=8]="COL2ROW2";let g=Object.freeze([1,0,0,0,1,0,0,0,1]);class d extends s.u{static get IDENTITY(){return p||Object.freeze(p=new d),p}static get ZERO(){return r||Object.freeze(r=new d([0,0,0,0,0,0,0,0,0])),r}get ELEMENTS(){return 9}get RANK(){return 3}get INDICES(){return o}constructor(t,...i){super(-0,-0,-0,-0,-0,-0,-0,-0,-0),1==arguments.length&&Array.isArray(t)?this.copy(t):i.length>0?this.copy([t,...i]):this.identity()}copy(t){return this[0]=t[0],this[1]=t[1],this[2]=t[2],this[3]=t[3],this[4]=t[4],this[5]=t[5],this[6]=t[6],this[7]=t[7],this[8]=t[8],this.check()}identity(){return this.copy(g)}fromObject(t){return this.check()}fromQuaternion(t){return(0,l.I0)(this,t),this.check()}set(t,i,e,r,n,o,s,a,h){return this[0]=t,this[1]=i,this[2]=e,this[3]=r,this[4]=n,this[5]=o,this[6]=s,this[7]=a,this[8]=h,this.check()}setRowMajor(t,i,e,r,n,o,s,a,h){return this[0]=t,this[1]=r,this[2]=s,this[3]=i,this[4]=n,this[5]=a,this[6]=e,this[7]=o,this[8]=h,this.check()}determinant(){return(0,l.a4)(this)}transpose(){return(0,l.mg)(this,this),this.check()}invert(){return(0,l.B8)(this,this),this.check()}multiplyLeft(t){return(0,l.lw)(this,t,this),this.check()}multiplyRight(t){return(0,l.lw)(this,this,t),this.check()}rotate(t){return(0,l.e$)(this,this,t),this.check()}scale(t){return Array.isArray(t)?(0,l.hs)(this,this,t):(0,l.hs)(this,this,[t,t]),this.check()}translate(t){return(0,l.Tl)(this,this,t),this.check()}transform(t,i){let e;switch(t.length){case 2:e=(0,c.ei)(i||[-0,-0],t,this);break;case 3:e=(0,u.ei)(i||[-0,-0,-0],t,this);break;case 4:e=(0,h.vE)(i||[-0,-0,-0,-0],t,this);break;default:throw Error("Illegal vector")}return(0,a.qk)(e,t.length),e}transformVector(t,i){return this.transform(t,i)}transformVector2(t,i){return this.transform(t,i)}transformVector3(t,i){return this.transform(t,i)}}let p=null},22314(t,i,e){e.d(i,{I:()=>h});var r=e(17484),n=e(26489),o=e(93383),s=e(59808),a=e(62541);class h extends r.M{constructor(t=0,i=0){super(2),(0,n.cy)(t)&&1==arguments.length?this.copy(t):(n.$W.debug&&((0,o.ws)(t),(0,o.ws)(i)),this[0]=t,this[1]=i)}set(t,i){return this[0]=t,this[1]=i,this.check()}copy(t){return this[0]=t[0],this[1]=t[1],this.check()}fromObject(t){return n.$W.debug&&((0,o.ws)(t.x),(0,o.ws)(t.y)),this[0]=t.x,this[1]=t.y,this.check()}toObject(t){return t.x=this[0],t.y=this[1],t}get ELEMENTS(){return 2}horizontalAngle(){return Math.atan2(this.y,this.x)}verticalAngle(){return Math.atan2(this.x,this.y)}transform(t){return this.transformAsPoint(t)}transformAsPoint(t){return(0,s.Z0)(this,this,t),this.check()}transformAsVector(t){return(0,a.B$)(this,this,t),this.check()}transformByMatrix3(t){return(0,s.ei)(this,this,t),this.check()}transformByMatrix2x3(t){return(0,s.l0)(this,this,t),this.check()}transformByMatrix2(t){return(0,s.ZF)(this,this,t),this.check()}}},33058(t,i,e){e.d(i,{Gf:()=>l,I3:()=>g,N4:()=>o,cJ:()=>h,nv:()=>c,tR:()=>u,wi:()=>a,zX:()=>r,zx:()=>s});var r=6371008.8,n={centimeters:0x25f96350,centimetres:0x25f96350,degrees:360/(2*Math.PI),feet:20902260.511392,inches:250826616.45599997,kilometers:6371.0088,kilometres:6371.0088,meters:6371008.8,metres:6371008.8,miles:3958.761333810546,millimeters:0x17bbde120,millimetres:0x17bbde120,nauticalmiles:6371008.8/1852,radians:1,yards:6967335.223679999};function o(t,i,e={}){let r={type:"Feature"};return(0===e.id||e.id)&&(r.id=e.id),e.bbox&&(r.bbox=e.bbox),r.properties=i||{},r.geometry=t,r}function s(t,i,e={}){if(!t)throw Error("coordinates is required");if(!Array.isArray(t))throw Error("coordinates must be an Array");if(t.length<2)throw Error("coordinates must be at least 2 numbers long");if(!d(t[0])||!d(t[1]))throw Error("coordinates must contain numbers");return o({type:"Point",coordinates:t},i,e)}function a(t,i,e={}){if(t.length<2)throw Error("coordinates must be an array of two or more positions");return o({type:"LineString",coordinates:t},i,e)}function h(t,i="kilometers"){let e=n[i];if(!e)throw Error(i+" units is invalid");return t*e}function l(t,i="kilometers"){let e=n[i];if(!e)throw Error(i+" units is invalid");return t/e}function c(t){return t%(2*Math.PI)*180/Math.PI}function u(t){return t%360*Math.PI/180}function g(t,i="kilometers",e="kilometers"){if(!(t>=0))throw Error("length must be a positive number");return h(l(t,i),e)}function d(t){return!isNaN(t)&&null!==t&&!Array.isArray(t)}},52745(t,i,e){function r(t){if(!t)throw Error("coord is required");if(!Array.isArray(t)){if("Feature"===t.type&&null!==t.geometry&&"Point"===t.geometry.type)return[...t.geometry.coordinates];if("Point"===t.type)return[...t.coordinates]}if(Array.isArray(t)&&t.length>=2&&!Array.isArray(t[0])&&!Array.isArray(t[1]))return[...t];throw Error("coord must be GeoJSON Point or an Array of numbers")}function n(t){if(Array.isArray(t))return t;if("Feature"===t.type){if(null!==t.geometry)return t.geometry.coordinates}else if(t.coordinates)return t.coordinates;throw Error("coords must be GeoJSON Feature, Geometry Object or an Array")}function o(t){return"Feature"===t.type?t.geometry:t}function s(t,i){return"FeatureCollection"===t.type?"FeatureCollection":"GeometryCollection"===t.type?"GeometryCollection":"Feature"===t.type&&null!==t.geometry?t.geometry.type:t.type}e.d(i,{$R:()=>n,Pw:()=>s,bg:()=>o,uG:()=>r})},58586(t,i,e){e.d(i,{A:()=>a,F:()=>o});var r=e(33058),n=e(52745);function o(t,i,e={}){let r;return(r=e.final?s((0,n.uG)(i),(0,n.uG)(t)):s((0,n.uG)(t),(0,n.uG)(i)))>180?-(360-r):r}function s(t,i){let e=(0,r.tR)(t[1]),n=(0,r.tR)(i[1]),o=(0,r.tR)(i[0]-t[0]);o>Math.PI&&(o-=2*Math.PI),o<-Math.PI&&(o+=2*Math.PI);let s=Math.atan2(o,Math.log(Math.tan(n/2+Math.PI/4)/Math.tan(e/2+Math.PI/4)));return((0,r.nv)(s)+360)%360}var a=o},63(t,i,e){e.d(i,{A:()=>o});var r=e(33058),n=e(52745),o=function(t,i,e={}){var o,s,a;let h,l,c,u,g,d,p,f=(0,n.uG)(t),m=(0,n.uG)(i);m[0]+=m[0]-f[0]>180?-360:360*(f[0]-m[0]>180);let y=(o=f,s=m,h=a=void 0===a?r.zX:Number(a),l=o[1]*Math.PI/180,u=(c=s[1]*Math.PI/180)-l,(g=Math.abs(s[0]-o[0])*Math.PI/180)>Math.PI&&(g-=2*Math.PI),p=Math.abs(d=Math.log(Math.tan(c/2+Math.PI/4)/Math.tan(l/2+Math.PI/4)))>1e-11?u/d:Math.cos(l),Math.sqrt(u*u+p*p*g*g)*h);return(0,r.I3)(y,"meters",e.units)}}}]);
//# sourceMappingURL=6914.3d39b362.js.map