import{n as A,l as H,m as X,h as $}from"./deck-example-device-MmRdTGLC.js";import{i as N}from"./example-support-KHcxfZf7.js";import{S as V}from"./scene-buffer-effect-CnmGAo9h.js";import{S as G}from"./shader-pass-effect-wwGHwuFL.js";import{R as W}from"./riverfront-view-CB3JCqMN.js";import{m as Y,C as m}from"./river-district-data-C9FvyLLC.js";import{R as E}from"./river-district-layer-CvWp2JRM.js";import"./computation-BuKa9-Qk.js";import"./dynamic-texture-7mCcc2CS.js";import"./meter-offset-position-C-mW8cuc.js";import"./project32-Dsr8Ao-s.js";import"./lambert-material-BpnOEpiU.js";const k=20,J=`const DEPTH_OF_FIELD_MAX_BLUR: i32 = ${k};

struct dofUniforms {
  depthRange: vec2<f32>,
  focusDistance: f32,
  blurCoefficient: f32,
  pixelsPerMillimeter: f32,
  texelOffset: vec2<f32>,
  circularAperture: f32,
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

  if (blurRadius > 1.0 && dof.circularAperture > 0.5) {
    // Equal-area golden-angle samples cover a circular lens aperture in one pass.
    // Normalize the gather so constant HDR radiance is preserved.
    for (var sampleIndex = 0; sampleIndex < 48; sampleIndex++) {
      let sampleRadius = sqrt((f32(sampleIndex) + 0.5) / 48.0) * blurRadius * 0.5;
      let sampleAngle = f32(sampleIndex) * 2.39996323;
      let sampleCoordinate = clamp(fragmentCoordinate + vec2i(round(
        vec2f(cos(sampleAngle), sin(sampleAngle)) * sampleRadius)), vec2i(0), maxCoordinate);
      color += textureLoad(sourceTexture, sampleCoordinate, 0);
    }
    color /= 48.0;
  } else if (blurRadius > 1.0) {
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
`,K=`#define DEPTH_OF_FIELD_MAX_BLUR ${k}.0

uniform sampler2D depthTexture;

layout(std140) uniform dofUniforms {
  vec2 depthRange;
  float focusDistance;
  float blurCoefficient;
  float pixelsPerMillimeter;
  vec2 texelOffset;
  float circularAperture;
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

  if (blurRadius > 1.0 && dof.circularAperture > 0.5) {
    for (int sampleIndex = 0; sampleIndex < 48; sampleIndex++) {
      float sampleRadius = sqrt((float(sampleIndex) + 0.5) / 48.0) * blurRadius * 0.5;
      float sampleAngle = float(sampleIndex) * 2.39996323;
      ivec2 sampleCoordinate = clamp(fragmentCoordinate + ivec2(round(
        vec2(cos(sampleAngle), sin(sampleAngle)) * sampleRadius)), ivec2(0), maxCoordinate);
      color += texelFetch(sourceTexture, sampleCoordinate, 0);
    }
    color /= 48.0;
  } else if (blurRadius > 1.0) {
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
`,x={name:"dof",source:J,fs:K,bindingLayout:[{name:"depthTexture",group:0}],props:{},uniforms:{},bindings:{},uniformTypes:{depthRange:"vec2<f32>",focusDistance:"f32",blurCoefficient:"f32",pixelsPerMillimeter:"f32",texelOffset:"vec2<f32>",circularAperture:"f32"},propTypes:{depthRange:{value:[.1,100]},focusDistance:{value:1,min:1e-4},blurCoefficient:{value:1,min:0},pixelsPerMillimeter:{value:1,min:0},texelOffset:{value:[1,0],private:!0},circularAperture:{value:0,private:!0}},passes:[{sampler:!0}]},Q={name:"dofCompositeShaderPass",renderTargets:{blurScratch:{}},steps:[{shaderPass:x,inputs:{sourceTexture:"previous"},output:"blurScratch",uniforms:{texelOffset:[1,0]}},{shaderPass:x,inputs:{sourceTexture:"blurScratch"},output:"previous",uniforms:{texelOffset:[0,1]}}]};({...x,propTypes:{...x.propTypes}});const Z=await N();Z.supported||document.querySelectorAll('script[type="module"]:not([data-luma-example-support-bootstrap])').forEach(n=>n.remove());class ee{automatic=!0;selectedIndex=-1;nextSelectionTime=0;lastUpdateTime;inverseDistance;select(t){this.selectedIndex=t,this.automatic=!1}setAutomatic(t,e){this.automatic=t,this.nextSelectionTime=e+5}updateSelection(t,e){if(!this.automatic||!e.length||this.selectedIndex>=0&&t<this.nextSelectionTime)return;const o=e.indexOf(this.selectedIndex);this.selectedIndex=e[(o+1)%e.length],this.nextSelectionTime=t+5}updateDistance(t,e){const o=1/Math.max(e,1e-4);this.inverseDistance===void 0&&(this.inverseDistance=o);const d=this.lastUpdateTime===void 0?0:Math.max(0,t-this.lastUpdateTime),i=1-Math.exp(-d/.65);return this.inverseDistance+=(o-this.inverseDistance)*i,this.lastUpdateTime=t,1/this.inverseDistance}}function te(n,t={}){const e=Y(),o=new ee,d={enabled:!0,blur:24},i={frames:0,backend:"",error:"",finalized:!1,focusedBuilding:"",focusDistance:0,targetDistance:0};let D,C;const z=new Promise((r,a)=>{D=r,C=a}),R=performance.now(),h=new V({id:"depth-of-field-buffers",colorFormat:"rgba8unorm",getLayerOptions:r=>r instanceof E?{mode:"opaque"}:null}),T=new G({id:"riverfront-depth-of-field",shaderPasses:[Q],colorFormat:"rgba8unorm",getRenderOptions:r=>{const a=r.viewports[0];if(!a)return null;const f=h.getFrame(a.id);if(!f)return null;const S=(performance.now()-R)/1e3,g=e.map(s=>oe(a,s)),p=e.flatMap((s,c)=>{if(s.kind!=="building")return[];const j=B(a,s),u=new A(a.viewProjectionMatrix).transform(j);return u[3]>0&&Math.abs(u[0]/u[3])<.95&&Math.abs(u[1]/u[3])<.9?[c]:[]}).sort((s,c)=>g[s]-g[c]),v=[];for(let s=0;s<Math.ceil(p.length/2);s++){v.push(p[s]);const c=p.length-s-1;c!==s&&v.push(p[c])}if(o.updateSelection(S,v),o.selectedIndex<0)return null;const M=a.projectionMatrix[10],y=a.projectionMatrix[14],_=y/(M-1),q=y/(M+1),P=Math.max(_,g[o.selectedIndex]),w=o.updateDistance(S,P);i.focusedBuilding=e[o.selectedIndex].name;const F=a.distanceScales.unitsPerMeter[2]*Math.hypot(a.viewMatrix[8],a.viewMatrix[9],a.viewMatrix[10]);return i.focusDistance=w/F,i.targetDistance=P/F,{sourceTexture:f.buffer.colorTexture,bindings:{depthTexture:f.buffer.depthTexture},uniforms:{dof:{depthRange:[_,q],focusDistance:w,blurCoefficient:d.enabled?d.blur*f.buffer.height/800:0,pixelsPerMillimeter:1}}}}}),I=new H({parent:n,...$(t),views:new X({id:"riverfront",controller:!0}),initialViewState:{...W,longitude:m[0],latitude:m[1],zoom:15.9,pitch:62,bearing:-18},layers:[new E({id:"riverfront-city",features:e,data:e,pickable:!0,coordinateSystem:"meter-offsets",coordinateOrigin:m})],effects:[h,T],_animate:!0,onDeviceInitialized:r=>{i.backend=r.type},onLoad:()=>D(),onAfterRender:()=>{i.frames++},onError:r=>{i.error||=r.message,C(r)},onClick:r=>{const a=r.object;a?.kind==="building"&&o.select(e.indexOf(a))},getTooltip:r=>r.object?.kind==="building"?`Focus on ${r.object.name}`:null});return{deck:I,capture:h,effect:T,focus:o,settings:d,diagnostics:i,features:e,ready:z,setAutomatic(r){o.setAutomatic(r,(performance.now()-R)/1e3)},finalize(){i.finalized||(i.finalized=!0,I.finalize())}}}function B(n,t){const e=n.projectPosition(m),o=n.distanceScales.unitsPerMeter;return[e[0]+t.center[0]*o[0],e[1]+t.center[1]*o[1],e[2]+(t.center[2]+t.size[2]*.6)*o[2],1]}function oe(n,t){return-new A(n.viewMatrix).transform(B(n,t))[2]}const re=document.querySelector("#scene"),U=document.querySelector("#status"),b=document.querySelector("#automatic"),L=document.querySelector("#enabled"),O=document.querySelector("#blur"),l=te(re);window.riverfrontDepthOfFieldScene=l;b.addEventListener("change",()=>l.setAutomatic(b.checked));L.addEventListener("change",()=>{l.settings.enabled=L.checked});O.addEventListener("input",()=>{l.settings.blur=Number(O.value)});const ae=window.setInterval(()=>{b.checked=l.focus.automatic,l.diagnostics.focusedBuilding&&(U.value=`${l.focus.automatic?"Tour":"Focus"}: ${l.diagnostics.focusedBuilding} · ${Math.round(l.diagnostics.focusDistance)} m`)},100);l.ready.then(()=>{document.body.dataset.ready="true"}).catch(n=>{U.value=n instanceof Error?n.message:String(n),document.body.dataset.ready="error"});window.addEventListener("pagehide",()=>{window.clearInterval(ae),l.finalize()});
