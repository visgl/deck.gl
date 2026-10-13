import{T as a,B as I}from"./deck-example-device-TQPRJnZ6.js";const E=[0,1,1,1],c=-1,O={isActive:"i32",indexMode:"i32",batchIndex:"i32",isHighlightActive:"i32",highlightedBatchIndex:"i32",highlightedObjectIndex:"i32",highlightColor:"vec4<f32>"},g=`precision highp float;
precision highp int;

layout(std140) uniform pickingUniforms {
  int isActive;
  int indexMode;
  int batchIndex;

  int isHighlightActive;
  int highlightedBatchIndex;
  int highlightedObjectIndex;
  vec4 highlightColor;
} picking;
`,A=`struct pickingUniforms {
  isActive: i32,
  indexMode: i32,
  batchIndex: i32,

  isHighlightActive: i32,
  highlightedBatchIndex: i32,
  highlightedObjectIndex: i32,
  highlightColor: vec4<f32>,
};

@group(0) @binding(auto) var<uniform> picking: pickingUniforms;
`;function j(t={},i){const e={...i};switch(t.isActive!==void 0&&(e.isActive=!!t.isActive),t.indexMode){case"instance":e.indexMode=0;break;case"attribute":e.indexMode=1;break;case"vertex":e.indexMode=2;break}switch(typeof t.batchIndex=="number"&&(e.batchIndex=t.batchIndex),t.highlightedObjectIndex){case void 0:break;case null:e.isHighlightActive=!1,e.highlightedObjectIndex=c;break;default:e.isHighlightActive=!0,e.highlightedObjectIndex=t.highlightedObjectIndex}switch(t.highlightedBatchIndex){case void 0:break;case null:e.isHighlightActive=!1,e.highlightedBatchIndex=c;break;default:e.isHighlightActive=!0,e.highlightedBatchIndex=t.highlightedBatchIndex}return t.highlightColor&&(e.highlightColor=t.highlightColor),e}const f={props:{},uniforms:{},name:"picking",uniformTypes:O,defaultUniforms:{isActive:!1,indexMode:0,batchIndex:0,isHighlightActive:!1,highlightedBatchIndex:c,highlightedObjectIndex:c,highlightColor:E},getUniforms:j},b=1,N=new Int32Array([c,c,0,0]),p=14,d=8;function m(t,i="color",e=t==="webgpu"){if(i==="auto")return e?"index":"color";if(i==="index"&&!e)throw new Error(`Picking mode "${i}" requires WebGPU or a WebGL device that supports renderable rg32sint textures.`);return i}function v(t){return t.type==="webgpu"||t.type==="webgl"&&t.isTextureFormatRenderable("rg32sint")}function x(t){return{objectIndex:t[0]===c?null:t[0],batchIndex:t[1]===c?null:t[1]}}function _(t){const i=t[0]+t[1]*256+t[2]*65536;if(i===0)return{objectIndex:null,batchIndex:null};const e=t[3]>0?t[3]-1:0;return{objectIndex:i-1,batchIndex:e}}class u{device;props;mode;pickInfo={batchIndex:null,objectIndex:null};framebuffer=null;lastMousePosition=null;tooltipElement=null;static defaultProps={shaderInputs:void 0,onObjectPicked:()=>{},getTooltip:()=>null,mode:"color",backend:"color"};constructor(i,e){this.device=i,this.props={...u.defaultProps,...e};const n=e.mode??e.backend??u.defaultProps.mode;this.props.mode=n,this.props.backend=n,this.mode=m(this.device.type,n,v(this.device))}destroy(){this.framebuffer?.destroy(),this.tooltipElement?.remove(),this.tooltipElement=null}getFramebuffer(){return this.framebuffer||(this.framebuffer=this.mode==="index"?this.createIndexFramebuffer():this.createColorFramebuffer()),this.framebuffer}clearPickState(){this.lastMousePosition=null,this.setPickingProps({highlightedBatchIndex:null,highlightedObjectIndex:null}),this.hideTooltip()}shouldPick(i,e={}){if(!i)return this.lastMousePosition&&this.clearPickState(),!1;const[n,o]=i;return!e.force&&this.lastMousePosition&&this.lastMousePosition[0]===n&&this.lastMousePosition[1]===o?!1:(this.lastMousePosition=[n,o],!0)}beginRenderPass(){const i=this.getFramebuffer();return i.resize(this.device.getDefaultCanvasContext().getDevicePixelSize()),this.setPickingProps({isActive:!0}),this.mode==="index"?this.device.beginRenderPass({framebuffer:i,clearColors:[new Float32Array([0,0,0,0]),N],clearDepth:1}):this.device.beginRenderPass({framebuffer:i,clearColor:[0,0,0,0],clearDepth:1})}async updatePickInfo(i){const e=this.getFramebuffer(),n=this.getPickPosition(i),o=await this.readPickInfo(e,n);return o?(this.hasPickInfoChanged(o)&&(this.pickInfo=o,this.props.onObjectPicked(o)),this.updateTooltip(o,i),this.setPickingProps({isActive:!1,highlightedBatchIndex:o.batchIndex,highlightedObjectIndex:o.objectIndex}),this.pickInfo):null}getPickPosition(i){const e=this.device.type!=="webgpu",n=this.device.getDefaultCanvasContext().cssToDevicePixels(i,e),o=n.x+Math.floor(n.width/2),r=n.y+Math.floor(n.height/2);return[o,r]}createIndexFramebuffer(){const i=this.device.createTexture({format:"rgba8unorm",width:1,height:1,usage:a.RENDER_ATTACHMENT}),e=this.device.createTexture({format:"rg32sint",width:1,height:1,usage:a.RENDER_ATTACHMENT|a.COPY_SRC});return this.device.createFramebuffer({colorAttachments:[i,e],depthStencilAttachment:"depth24plus"})}createColorFramebuffer(){const i=this.device.createTexture({format:"rgba8unorm",width:1,height:1,usage:a.RENDER_ATTACHMENT|a.COPY_SRC});return this.device.createFramebuffer({colorAttachments:[i],depthStencilAttachment:"depth24plus"})}setPickingProps(i){this.props.shaderInputs?.setProps({picking:i})}async readPickInfo(i,e){return this.mode==="index"?this.readIndexPickInfo(i,e):this.readColorPickInfo(i,e)}async readIndexPickInfo(i,[e,n]){if(this.device.type==="webgpu"){const r=i.colorAttachments[b]?.texture;if(!r)return null;const l=r.computeMemoryLayout({width:1,height:1}),h=this.device.createBuffer({byteLength:l.byteLength,usage:I.COPY_DST|I.MAP_READ});try{r.readBuffer({x:e,y:n,width:1,height:1},h);const s=await h.readAsync(0,l.byteLength);return x(new Int32Array(s.buffer,s.byteOffset,2))}finally{h.destroy()}}const o=this.device.readPixelsToArrayWebGL(i,{sourceX:e,sourceY:n,sourceWidth:1,sourceHeight:1,sourceAttachment:b});return o?x(new Int32Array(o.buffer,o.byteOffset,2)):null}async readColorPickInfo(i,[e,n]){if(this.device.type==="webgpu"){const r=i.colorAttachments[0]?.texture;if(!r)return null;const l=r.computeMemoryLayout({width:1,height:1}),h=this.device.createBuffer({byteLength:l.byteLength,usage:I.COPY_DST|I.MAP_READ});try{r.readBuffer({x:e,y:n,width:1,height:1},h);const s=await h.readAsync(0,l.byteLength);return _(new Uint8Array(s.buffer,s.byteOffset,4))}finally{h.destroy()}}const o=this.device.readPixelsToArrayWebGL(i,{sourceX:e,sourceY:n,sourceWidth:1,sourceHeight:1,sourceAttachment:0});return o?_(new Uint8Array(o.buffer,o.byteOffset,4)):null}hasPickInfoChanged(i){return i.objectIndex!==this.pickInfo.objectIndex||i.batchIndex!==this.pickInfo.batchIndex}updateTooltip(i,e){const n=this.props.getTooltip(i);if(!n){this.hideTooltip();return}const o=this.getOrCreateTooltipElement();o&&(o.textContent=n,o.style.display="block",this.positionTooltip(o,e))}hideTooltip(){this.tooltipElement&&(this.tooltipElement.style.display="none")}getOrCreateTooltipElement(){if(this.tooltipElement)return this.tooltipElement;if(typeof document>"u"||typeof window>"u"||typeof HTMLCanvasElement>"u"||typeof this.device.getDefaultCanvasContext!="function")return null;const i=this.device.getDefaultCanvasContext().canvas;if(!(i instanceof HTMLCanvasElement)||!i.parentElement)return null;const e=document.createElement("div");e.style.position="absolute",e.style.zIndex="12",e.style.display="none",e.style.maxWidth="220px",e.style.padding="8px 10px",e.style.borderRadius="6px",e.style.background="rgba(15, 23, 42, 0.92)",e.style.color="#f8fafc",e.style.font="600 13px/1.35 system-ui, sans-serif",e.style.pointerEvents="none",e.style.whiteSpace="nowrap",e.style.boxShadow="0 10px 24px rgba(15, 23, 42, 0.22)";const n=i.parentElement;return window.getComputedStyle(n).position==="static"&&(n.style.position="relative"),n.appendChild(e),this.tooltipElement=e,e}positionTooltip(i,e){if(typeof HTMLCanvasElement>"u"||typeof this.device.getDefaultCanvasContext!="function")return;const n=this.device.getDefaultCanvasContext().canvas;if(!(n instanceof HTMLCanvasElement))return;const o=Math.max(d,n.clientWidth-i.offsetWidth-d),r=Math.max(d,n.clientHeight-i.offsetHeight-d),l=Math.min(e[0]+p,o),h=Math.min(e[1]+p,r);i.style.left=`${Math.max(d,l)}px`,i.style.top=`${Math.max(d,h)}px`}}const D=`${g}

const int INDEX_PICKING_MODE_INSTANCE = 0;
const int INDEX_PICKING_MODE_CUSTOM = 1;

const int COLOR_PICKING_INVALID_INDEX = ${c};

flat out int picking_objectIndex;

void picking_setObjectIndex(int objectIndex) {
  switch (picking.indexMode) {
    case INDEX_PICKING_MODE_INSTANCE:
      picking_objectIndex = gl_InstanceID;
      break;
    case INDEX_PICKING_MODE_CUSTOM:
      picking_objectIndex = objectIndex;
      break;
  }
}
`,T=`${g}

const int COLOR_PICKING_INVALID_INDEX = ${c};
const int COLOR_PICKING_MAX_OBJECT_INDEX = 16777214;
const int COLOR_PICKING_MAX_BATCH_INDEX = 254;

flat in int picking_objectIndex;

bool picking_isFragmentHighlighted() {
  return
    bool(picking.isHighlightActive) &&
    picking.highlightedBatchIndex == picking.batchIndex &&
    picking.highlightedObjectIndex == picking_objectIndex
    ;
}

vec4 picking_filterHighlightColor(vec4 color) {
  if (bool(picking.isActive)) {
    return color;
  }

  if (!picking_isFragmentHighlighted()) {
    return color;
  }

  float highLightAlpha = picking.highlightColor.a;
  float blendedAlpha = highLightAlpha + color.a * (1.0 - highLightAlpha);
  float highLightRatio = highLightAlpha / blendedAlpha;

  vec3 blendedRGB = mix(color.rgb, picking.highlightColor.rgb, highLightRatio);
  return vec4(blendedRGB, blendedAlpha);
}

bool picking_canEncodePickInfo(int objectIndex) {
  return
    objectIndex != COLOR_PICKING_INVALID_INDEX &&
    objectIndex >= 0 &&
    objectIndex <= COLOR_PICKING_MAX_OBJECT_INDEX &&
    picking.batchIndex >= 0 &&
    picking.batchIndex <= COLOR_PICKING_MAX_BATCH_INDEX;
}

vec4 picking_getPickingColor() {
  if (!picking_canEncodePickInfo(picking_objectIndex)) {
    return vec4(0.0);
  }

  int encodedObjectIndex = picking_objectIndex + 1;
  int red = encodedObjectIndex % 256;
  int green = (encodedObjectIndex / 256) % 256;
  int blue = (encodedObjectIndex / 65536) % 256;
  int alpha = picking.batchIndex + 1;

  return vec4(float(red), float(green), float(blue), float(alpha)) / 255.0;
}

vec4 picking_filterPickingColor(vec4 color) {
  if (bool(picking.isActive)) {
    if (!picking_canEncodePickInfo(picking_objectIndex)) {
      discard;
    }
    return picking_getPickingColor();
  }

  return color;
}

vec4 picking_filterColor(vec4 color) {
  vec4 outColor = color;
  outColor = picking_filterHighlightColor(outColor);
  outColor = picking_filterPickingColor(outColor);
  return outColor;
}
`,k={vs:D,fs:T},L=`${A}

const COLOR_PICKING_INVALID_INDEX = ${c};
const COLOR_PICKING_MAX_OBJECT_INDEX = 16777214;
const COLOR_PICKING_MAX_BATCH_INDEX = 254;

fn picking_getInstanceObjectIndex(instanceIndex: u32) -> i32 {
  return i32(instanceIndex);
}

fn picking_getVertexObjectIndex(vertexIndex: u32) -> i32 {
  return i32(vertexIndex);
}

fn picking_getAttributeObjectIndex(objectIndex: i32) -> i32 {
  return objectIndex;
}

fn picking_setObjectIndex(objectIndex: i32) -> i32 {
  return picking_getAttributeObjectIndex(objectIndex);
}

fn picking_isObjectHighlighted(objectIndex: i32) -> bool {
  return
    picking.isHighlightActive != 0 &&
    picking.highlightedBatchIndex == picking.batchIndex &&
    picking.highlightedObjectIndex == objectIndex;
}

fn picking_filterHighlightColor(color: vec4<f32>, objectIndex: i32) -> vec4<f32> {
  if (picking.isActive != 0 || !picking_isObjectHighlighted(objectIndex)) {
    return color;
  }

  let highLightAlpha = picking.highlightColor.a;
  let blendedAlpha = highLightAlpha + color.a * (1.0 - highLightAlpha);
  if (blendedAlpha == 0.0) {
    return vec4<f32>(color.rgb, 0.0);
  }

  let highLightRatio = highLightAlpha / blendedAlpha;
  let blendedRGB = mix(color.rgb, picking.highlightColor.rgb, highLightRatio);
  return vec4<f32>(blendedRGB, blendedAlpha);
}

fn picking_canEncodePickInfo(objectIndex: i32) -> bool {
  return
    objectIndex != COLOR_PICKING_INVALID_INDEX &&
    objectIndex >= 0 &&
    objectIndex <= COLOR_PICKING_MAX_OBJECT_INDEX &&
    picking.batchIndex >= 0 &&
    picking.batchIndex <= COLOR_PICKING_MAX_BATCH_INDEX;
}

fn picking_getPickingColor(objectIndex: i32) -> vec4<f32> {
  if (!picking_canEncodePickInfo(objectIndex)) {
    return vec4<f32>(0.0, 0.0, 0.0, 0.0);
  }

  let encodedObjectIndex = objectIndex + 1;
  let red = encodedObjectIndex % 256;
  let green = (encodedObjectIndex / 256) % 256;
  let blue = (encodedObjectIndex / 65536) % 256;
  let alpha = picking.batchIndex + 1;

  return vec4<f32>(
    f32(red) / 255.0,
    f32(green) / 255.0,
    f32(blue) / 255.0,
    f32(alpha) / 255.0
  );
}

fn picking_filterPickingColor(color: vec4<f32>, objectIndex: i32) -> vec4<f32> {
  if (picking.isActive != 0) {
    if (!picking_canEncodePickInfo(objectIndex)) {
      discard;
    }
    return picking_getPickingColor(objectIndex);
  }

  return color;
}

fn picking_filterColor(color: vec4<f32>, objectIndex: i32) -> vec4<f32> {
  var outColor = color;
  outColor = picking_filterHighlightColor(outColor, objectIndex);
  outColor = picking_filterPickingColor(outColor, objectIndex);
  return outColor;
}
`,y=`${g}

const int INDEX_PICKING_MODE_INSTANCE = 0;
const int INDEX_PICKING_MODE_ATTRIBUTE = 1;
const int INDEX_PICKING_MODE_VERTEX = 2;

flat out int picking_objectIndex;

void picking_setObjectIndex(int objectIndex) {
  switch (picking.indexMode) {
    case INDEX_PICKING_MODE_INSTANCE:
      picking_objectIndex = gl_InstanceID;
      break;
    case INDEX_PICKING_MODE_ATTRIBUTE:
      picking_objectIndex = objectIndex;
      break;
    case INDEX_PICKING_MODE_VERTEX:
      picking_objectIndex = gl_VertexID;
      break;
  }
}
`,R=`${g}

const int COLOR_PICKING_INVALID_INDEX = ${c};
const int COLOR_PICKING_MAX_OBJECT_INDEX = 16777214;
const int COLOR_PICKING_MAX_BATCH_INDEX = 254;

flat in int picking_objectIndex;

bool picking_isFragmentHighlighted() {
  return
    bool(picking.isHighlightActive) &&
    picking.highlightedBatchIndex == picking.batchIndex &&
    picking.highlightedObjectIndex == picking_objectIndex
    ;
}

vec4 picking_filterHighlightColor(vec4 color) {
  if (bool(picking.isActive)) {
    return color;
  }

  if (!picking_isFragmentHighlighted()) {
    return color;
  }

  float highLightAlpha = picking.highlightColor.a;
  float blendedAlpha = highLightAlpha + color.a * (1.0 - highLightAlpha);
  float highLightRatio = highLightAlpha / blendedAlpha;

  vec3 blendedRGB = mix(color.rgb, picking.highlightColor.rgb, highLightRatio);
  return vec4(blendedRGB, blendedAlpha);
}

bool picking_canEncodePickInfo(int objectIndex) {
  return
    objectIndex != COLOR_PICKING_INVALID_INDEX &&
    objectIndex >= 0 &&
    objectIndex <= COLOR_PICKING_MAX_OBJECT_INDEX &&
    picking.batchIndex >= 0 &&
    picking.batchIndex <= COLOR_PICKING_MAX_BATCH_INDEX;
}

vec4 picking_getPickingColor() {
  if (!picking_canEncodePickInfo(picking_objectIndex)) {
    return vec4(0.0);
  }

  int encodedObjectIndex = picking_objectIndex + 1;
  int red = encodedObjectIndex % 256;
  int green = (encodedObjectIndex / 256) % 256;
  int blue = (encodedObjectIndex / 65536) % 256;
  int alpha = picking.batchIndex + 1;

  return vec4(float(red), float(green), float(blue), float(alpha)) / 255.0;
}

vec4 picking_filterPickingColor(vec4 color) {
  if (bool(picking.isActive)) {
    if (!picking_canEncodePickInfo(picking_objectIndex)) {
      discard;
    }
    return picking_getPickingColor();
  }

  return color;
}

vec4 picking_filterColor(vec4 color) {
  vec4 outColor = color;
  outColor = picking_filterHighlightColor(outColor);
  outColor = picking_filterPickingColor(outColor);
  return outColor;
}
`,M={...f,name:"picking",source:L,vs:y,fs:R},X=`${A}

const INDEX_PICKING_MODE_INSTANCE = 0;
const INDEX_PICKING_MODE_ATTRIBUTE = 1;
const INDEX_PICKING_MODE_VERTEX = 2;
const INDEX_PICKING_INVALID_INDEX = ${c}; // 2^32 - 1

/**
 * WGSL shaders need to carry the returned object index through their own stage outputs.
 */
fn picking_getInstanceObjectIndex(instanceIndex: u32) -> i32 {
  return i32(instanceIndex);
}

fn picking_getVertexObjectIndex(vertexIndex: u32) -> i32 {
  return i32(vertexIndex);
}

fn picking_getAttributeObjectIndex(objectIndex: i32) -> i32 {
  return objectIndex;
}

fn picking_setObjectIndex(objectIndex: i32) -> i32 {
  return picking_getAttributeObjectIndex(objectIndex);
}

fn picking_isObjectHighlighted(objectIndex: i32) -> bool {
  return
    picking.isHighlightActive != 0 &&
    picking.highlightedBatchIndex == picking.batchIndex &&
    picking.highlightedObjectIndex == objectIndex;
}

fn picking_filterHighlightColor(color: vec4<f32>, objectIndex: i32) -> vec4<f32> {
  if (picking.isActive != 0 || !picking_isObjectHighlighted(objectIndex)) {
    return color;
  }

  let highLightAlpha = picking.highlightColor.a;
  let blendedAlpha = highLightAlpha + color.a * (1.0 - highLightAlpha);
  if (blendedAlpha == 0.0) {
    return vec4<f32>(color.rgb, 0.0);
  }

  let highLightRatio = highLightAlpha / blendedAlpha;
  let blendedRGB = mix(color.rgb, picking.highlightColor.rgb, highLightRatio);
  return vec4<f32>(blendedRGB, blendedAlpha);
}

fn picking_filterPickingColor(color: vec4<f32>, objectIndex: i32) -> vec4<f32> {
  if (picking.isActive != 0 && objectIndex == INDEX_PICKING_INVALID_INDEX) {
    discard;
  }
  return color;
}

fn picking_getPickingColor(objectIndex: i32) -> vec2<i32> {
  return vec2<i32>(objectIndex, picking.batchIndex);
}

`,w=`${g}

const int INDEX_PICKING_MODE_INSTANCE = 0;
const int INDEX_PICKING_MODE_ATTRIBUTE = 1;
const int INDEX_PICKING_MODE_VERTEX = 2;

const int INDEX_PICKING_INVALID_INDEX = ${c}; // 2^32 - 1

flat out int picking_objectIndex;

/**
 * Vertex shaders should call this function to set the object index.
 * If using instance or vertex mode, the argument is ignored and 0 can be supplied.
 */
void picking_setObjectIndex(int objectIndex) {
  switch (picking.indexMode) {
    case INDEX_PICKING_MODE_INSTANCE:
      picking_objectIndex = gl_InstanceID;
      break;
    case INDEX_PICKING_MODE_ATTRIBUTE:
      picking_objectIndex = objectIndex;
      break;
    case INDEX_PICKING_MODE_VERTEX:
      picking_objectIndex = gl_VertexID;
      break;
  }
}
`,G=`${g}

const int INDEX_PICKING_INVALID_INDEX = ${c}; // 2^32 - 1

flat in int picking_objectIndex;

/**
 * Check if this vertex is highlighted (part of the selected batch and object)
 */ 
bool picking_isFragmentHighlighted() {
  return 
    bool(picking.isHighlightActive) &&
    picking.highlightedBatchIndex == picking.batchIndex &&
    picking.highlightedObjectIndex == picking_objectIndex
    ;
}

/**
 * Returns highlight color if this item is selected.
 */
vec4 picking_filterHighlightColor(vec4 color) {
  // If we are still picking, we don't highlight
  if (bool(picking.isActive)) {
    return color;
  }

  // If we are not highlighted, return color as is
  if (!picking_isFragmentHighlighted()) {
    return color;
  }
   
  // Blend in highlight color based on its alpha value
  float highLightAlpha = picking.highlightColor.a;
  float blendedAlpha = highLightAlpha + color.a * (1.0 - highLightAlpha);
  float highLightRatio = highLightAlpha / blendedAlpha;

  vec3 blendedRGB = mix(color.rgb, picking.highlightColor.rgb, highLightRatio);
  return vec4(blendedRGB, blendedAlpha);
}

/*
 * Returns picking color if picking enabled else unmodified argument.
 */
ivec4 picking_getPickingColor() {
  // Assumes that colorAttachment0 is rg32int
  // TODO? - we could render indices into a second color attachment and not mess with fragColor
  return ivec4(picking_objectIndex, picking.batchIndex, 0, 0);
}

vec4 picking_filterPickingColor(vec4 color) {
  if (bool(picking.isActive)) {
    if (picking_objectIndex == INDEX_PICKING_INVALID_INDEX) {
      discard;
    }
  }
  return color;
}

/*
 * Returns picking color if picking is enabled if not
 * highlight color if this item is selected, otherwise unmodified argument.
 */
vec4 picking_filterColor(vec4 color) {
  vec4 outColor = color;
  outColor = picking_filterHighlightColor(outColor);
  outColor = picking_filterPickingColor(outColor);
  return outColor;
}
`,P={...f,name:"picking",source:X,vs:w,fs:G},V={...f,name:"picking",source:P.source,vs:k.vs,fs:k.fs};function B(t){return v(t)?P:M}const C={batchIndex:null,objectIndex:null};function H(t){return B(t)}function F(t){return[H(t)]}function U(t,i){return new u(t,{mode:"auto",...i})}function W(t,i){const e=t.pickInfo.batchIndex!==null||t.pickInfo.objectIndex!==null;t.clearPickState(),t.pickInfo=C,e&&i?.(C)}function J({picker:t,mousePosition:i,pickingOptions:e,shaderInputs:n,draw:o}){if(!t.shouldPick(i,e))return!1;const r=t.beginRenderPass();let l=!1;try{l=o(r)!==!1}finally{r.end(),n?.setProps({picking:{isActive:!1}})}return l&&t.updatePickInfo(i),l}function Y({sourceBatchIndex:t=0,sourceRowIndexOffset:i=0,sourceRowCount:e}){return{sourceBatchIndex:t,sourceRowIndexOffset:i,sourceRowCount:e}}function z(t,i){if(t.batchIndex===null||t.objectIndex===null)return{batchIndex:null,rowIndex:null,batchRowIndex:null};const e=K(i,t.batchIndex);return{batchIndex:e?.sourceBatchIndex??t.batchIndex,rowIndex:t.objectIndex,batchRowIndex:S(t.objectIndex,e)}}function K(t,i){if(!t)return;if(Array.isArray(t))return t[i]??void 0;if("batches"in t)return t.batches[i]?.sourceInfo;const e=t;return e.sourceInfos?.[i]??e.table?.batches[i]?.sourceInfo}function S(t,i){if(!i)return null;const e=t-i.sourceRowIndexOffset;return e>=0&&e<i.sourceRowCount?e:null}export{W as a,z as b,U as c,V as d,F as e,B as g,Y as m,P as p,J as r,v as s};
