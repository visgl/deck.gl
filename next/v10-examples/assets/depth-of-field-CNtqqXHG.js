import{k,h as H,j as X,c as $,b as N}from"./deck-example-device-TQPRJnZ6.js";import{i as V}from"./example-support-KHcxfZf7.js";import{S as Y}from"./scene-buffer-effect-Bq4_aRU0.js";import{S as G}from"./shader-pass-effect-D_gXcVHA.js";import{R as W}from"./riverfront-view-CB3JCqMN.js";import{m as J,C as m}from"./river-district-data-C9FvyLLC.js";import{R as w}from"./river-district-layer-DuhH2l43.js";import"./dynamic-texture-NQQfRyls.js";import"./project32-Byi-VnKS.js";import"./meter-offset-position-CMR-ehQ5.js";import"./lambert-material-DjV_YOPi.js";const B=20,K=`const DEPTH_OF_FIELD_MAX_BLUR: i32 = ${B};

struct dofUniforms {
  depthRange: vec2<f32>,
  focusDistance: f32,
  blurCoefficient: f32,
  pixelsPerMillimeter: f32,
  texelOffset: vec2<f32>,
};

@group(0) @binding(auto) var<uniform> dof: dofUniforms;
@group(0) @binding(auto) var depthTexture: texture_depth_2d;
@group(0) @binding(auto) var depthTextureSampler: sampler;

fn dof_sampleColor(
  sourceTexture: texture_2d<f32>,
  sourceTextureSampler: sampler,
  texSize: vec2f,
  texCoord: vec2f
) -> vec4f {
  let resolution = vec2<i32>(textureDimensions(sourceTexture, 0));
  let maxCoordinate = resolution - vec2<i32>(1, 1);
  let fragmentCoordinate = min(vec2<i32>(vec2<f32>(resolution) * texCoord), maxCoordinate);

  let depthSample = textureSample(depthTexture, depthTextureSampler, texCoord);
  let linearDepth =
    (dof.depthRange.x * dof.depthRange.y) /
    (dof.depthRange.y -
      depthSample * (dof.depthRange.y - dof.depthRange.x));

  let deltaDepth = abs(dof.focusDistance - linearDepth);
  let foregroundCompensation = select(
    abs(dof.focusDistance + deltaDepth),
    abs(dof.focusDistance - deltaDepth),
    linearDepth < dof.focusDistance
  );
  let blurRadius = min(
    floor(
      dof.blurCoefficient *
        (deltaDepth / max(foregroundCompensation, 0.0001)) *
        dof.pixelsPerMillimeter
    ),
    f32(DEPTH_OF_FIELD_MAX_BLUR)
  );

  var color = vec4f(0.0);

  if (blurRadius > 1.0) {
    let halfBlur = blurRadius * 0.5;
    var sampleCount = 0.0;

    for (var sampleIndex: i32 = 0; sampleIndex <= DEPTH_OF_FIELD_MAX_BLUR; sampleIndex++) {
      if (f32(sampleIndex) > blurRadius) {
        break;
      }

      let sampleOffset = round((f32(sampleIndex) - halfBlur) * dof.texelOffset);
      let sampleCoordinate = clamp(
        fragmentCoordinate + vec2<i32>(sampleOffset),
        vec2<i32>(0, 0),
        maxCoordinate
      );
      color += textureLoad(sourceTexture, sampleCoordinate, 0);
      sampleCount += 1.0;
    }

    color /= sampleCount;
  } else {
    color = textureLoad(sourceTexture, fragmentCoordinate, 0);
  }

  return color;
}
`,Q=`#define DEPTH_OF_FIELD_MAX_BLUR ${B}.0

uniform sampler2D depthTexture;

layout(std140) uniform dofUniforms {
  vec2 depthRange;
  float focusDistance;
  float blurCoefficient;
  float pixelsPerMillimeter;
  vec2 texelOffset;
} dof;

vec4 dof_sampleColor(sampler2D sourceTexture, vec2 texSize, vec2 texCoord) {
  ivec2 resolution = textureSize(sourceTexture, 0);
  ivec2 maxCoordinate = resolution - 1;
  ivec2 fragmentCoordinate = min(ivec2(texCoord * vec2(resolution)), maxCoordinate);

  float depthSample = texelFetch(depthTexture, fragmentCoordinate, 0).r;
  float ndcDepth = depthSample * 2.0 - 1.0;
  float linearDepth = -(2.0 * dof.depthRange.y * dof.depthRange.x) /
    (ndcDepth * (dof.depthRange.y - dof.depthRange.x) -
      dof.depthRange.y -
      dof.depthRange.x);

  float deltaDepth = abs(dof.focusDistance - linearDepth);
  float foregroundCompensation =
    linearDepth < dof.focusDistance
      ? abs(dof.focusDistance - deltaDepth)
      : abs(dof.focusDistance + deltaDepth);
  float blurRadius = min(
    floor(
      dof.blurCoefficient *
        (deltaDepth / max(foregroundCompensation, 0.0001)) *
        dof.pixelsPerMillimeter
    ),
    DEPTH_OF_FIELD_MAX_BLUR
  );

  vec4 color = vec4(0.0);

  if (blurRadius > 1.0) {
    float halfBlur = blurRadius * 0.5;
    float sampleCount = 0.0;

    for (float sampleIndex = 0.0; sampleIndex <= DEPTH_OF_FIELD_MAX_BLUR; sampleIndex++) {
      if (sampleIndex > blurRadius) {
        break;
      }

      ivec2 sampleCoordinate = clamp(
        fragmentCoordinate + ivec2((sampleIndex - halfBlur) * dof.texelOffset),
        ivec2(0),
        maxCoordinate
      );
      color += texelFetch(sourceTexture, sampleCoordinate, 0);
      sampleCount += 1.0;
    }

    color /= sampleCount;
  } else {
    color = texelFetch(sourceTexture, fragmentCoordinate, 0);
  }

  return color;
}
`,F={name:"dof",source:K,fs:Q,bindingLayout:[{name:"depthTexture",group:0}],props:{},uniforms:{},bindings:{},uniformTypes:{depthRange:"vec2<f32>",focusDistance:"f32",blurCoefficient:"f32",pixelsPerMillimeter:"f32",texelOffset:"vec2<f32>"},propTypes:{depthRange:{value:[.1,100]},focusDistance:{value:1,min:1e-4},blurCoefficient:{value:1,min:0},pixelsPerMillimeter:{value:1,min:0},texelOffset:{value:[1,0],private:!0}},passes:[{sampler:!0}]},Z={name:"dofCompositeShaderPass",renderTargets:{blurScratch:{}},steps:[{shaderPass:F,inputs:{sourceTexture:"previous"},output:"blurScratch",uniforms:{texelOffset:[1,0]}},{shaderPass:F,inputs:{sourceTexture:"blurScratch"},output:"previous",uniforms:{texelOffset:[0,1]}}]},ee=await V();ee.supported||document.querySelectorAll('script[type="module"]:not([data-luma-example-support-bootstrap])').forEach(a=>a.remove());class te{automatic=!0;selectedIndex=-1;nextSelectionTime=0;lastUpdateTime;inverseDistance;select(t){this.selectedIndex=t,this.automatic=!1}setAutomatic(t,e){this.automatic=t,this.nextSelectionTime=e+5}updateSelection(t,e){if(!this.automatic||!e.length||this.selectedIndex>=0&&t<this.nextSelectionTime)return;const o=e.indexOf(this.selectedIndex);this.selectedIndex=e[(o+1)%e.length],this.nextSelectionTime=t+5}updateDistance(t,e){const o=1/Math.max(e,1e-4);this.inverseDistance===void 0&&(this.inverseDistance=o);const d=this.lastUpdateTime===void 0?0:Math.max(0,t-this.lastUpdateTime),s=1-Math.exp(-d/.65);return this.inverseDistance+=(o-this.inverseDistance)*s,this.lastUpdateTime=t,1/this.inverseDistance}}function oe(a,t={}){const e=J(),o=new te,d={enabled:!0,blur:24},s={frames:0,backend:"",error:"",finalized:!1,focusedBuilding:"",focusDistance:0,targetDistance:0};let D,b;const z=new Promise((r,n)=>{D=r,b=n}),T=performance.now(),h=new Y({id:"depth-of-field-buffers",colorFormat:"rgba8unorm",getLayerOptions:r=>r instanceof w?{mode:"opaque"}:null}),C=new G({id:"riverfront-depth-of-field",shaderPasses:[Z],colorFormat:"rgba8unorm",getRenderOptions:r=>{const n=r.viewports[0];if(!n)return null;const f=h.getFrame(n.id);if(!f)return null;const R=(performance.now()-T)/1e3,x=e.map(i=>re(n,i)),p=e.flatMap((i,l)=>{if(i.kind!=="building")return[];const q=U(n,i),u=new k(n.viewProjectionMatrix).transform(q);return u[3]>0&&Math.abs(u[0]/u[3])<.95&&Math.abs(u[1]/u[3])<.9?[l]:[]}).sort((i,l)=>x[i]-x[l]),g=[];for(let i=0;i<Math.ceil(p.length/2);i++){g.push(p[i]);const l=p.length-i-1;l!==i&&g.push(p[l])}if(o.updateSelection(R,g),o.selectedIndex<0)return null;const M=n.projectionMatrix[10],I=n.projectionMatrix[14],_=I/(M-1),j=I/(M+1),y=Math.max(_,x[o.selectedIndex]),P=o.updateDistance(R,y);s.focusedBuilding=e[o.selectedIndex].name;const E=n.distanceScales.unitsPerMeter[2]*Math.hypot(n.viewMatrix[8],n.viewMatrix[9],n.viewMatrix[10]);return s.focusDistance=P/E,s.targetDistance=y/E,{sourceTexture:f.buffer.colorTexture,bindings:{depthTexture:f.buffer.depthTexture},uniforms:{dof:{depthRange:[_,j],focusDistance:P,blurCoefficient:d.enabled?d.blur*f.buffer.height/800:0,pixelsPerMillimeter:1}}}}}),S=new H({parent:a,...N(t),views:new X({id:"riverfront",controller:!0}),initialViewState:{...W,longitude:m[0],latitude:m[1],zoom:15.9,pitch:62,bearing:-18},layers:[new w({id:"riverfront-city",features:e,data:e,pickable:!0,coordinateSystem:$.METER_OFFSETS,coordinateOrigin:m})],effects:[h,C],_animate:!0,onDeviceInitialized:r=>{s.backend=r.type},onLoad:()=>D(),onAfterRender:()=>{s.frames++},onError:r=>{s.error||=r.message,b(r)},onClick:r=>{const n=r.object;n?.kind==="building"&&o.select(e.indexOf(n))},getTooltip:r=>r.object?.kind==="building"?`Focus on ${r.object.name}`:null});return{deck:S,capture:h,effect:C,focus:o,settings:d,diagnostics:s,features:e,ready:z,setAutomatic(r){o.setAutomatic(r,(performance.now()-T)/1e3)},finalize(){s.finalized||(s.finalized=!0,S.finalize())}}}function U(a,t){const e=a.projectPosition(m),o=a.distanceScales.unitsPerMeter;return[e[0]+t.center[0]*o[0],e[1]+t.center[1]*o[1],e[2]+(t.center[2]+t.size[2]*.6)*o[2],1]}function re(a,t){return-new k(a.viewMatrix).transform(U(a,t))[2]}const ne=document.querySelector("#scene"),A=document.querySelector("#status"),v=document.querySelector("#automatic"),O=document.querySelector("#enabled"),L=document.querySelector("#blur"),c=oe(ne);window.riverfrontDepthOfFieldScene=c;v.addEventListener("change",()=>c.setAutomatic(v.checked));O.addEventListener("change",()=>{c.settings.enabled=O.checked});L.addEventListener("input",()=>{c.settings.blur=Number(L.value)});const ae=window.setInterval(()=>{v.checked=c.focus.automatic,c.diagnostics.focusedBuilding&&(A.value=`${c.focus.automatic?"Tour":"Focus"}: ${c.diagnostics.focusedBuilding} · ${Math.round(c.diagnostics.focusDistance)} m`)},100);c.ready.then(()=>{document.body.dataset.ready="true"}).catch(a=>{A.value=a instanceof Error?a.message:String(a),document.body.dataset.ready="error"});window.addEventListener("pagehide",()=>{window.clearInterval(ae),c.finalize()});
