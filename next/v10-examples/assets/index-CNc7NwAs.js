import{c as V}from"./expression-Bl_GL2tO.js";import{P as T,c as X,ai as z,aj as W,g as N,d as j,ac as C,ab as S,a7 as q,a8 as H,T as w}from"./deck-example-device-i_nsJo0E.js";import{ak as Re,al as Ye}from"./deck-example-device-i_nsJo0E.js";class ${static async createAsync(e,r){const n=!T.getAsyncCompilation(e),i=n?T.beginAsyncCompilation(e):T.getAsyncCompilation(e);let a;try{a=new $(e,r)}finally{n&&T.endAsyncCompilation(e,i)}try{return n?await Promise.all(i):await a._pipelineInitialization,a}catch(o){throw a.destroy(),o}}device;id;vertexSource;fragmentSource;pipelineFactory;shaderFactory;vertexShader;fragmentShader;pipeline;_pipelineInitialization;_destroyed=!1;drawDefaults;constructor(e,r){if(e.type!=="webgpu"&&e.type!=="webgl")throw new Error("RenderKernel requires WebGL or WebGPU");if(e.type==="webgl"&&!r.fragmentSource)throw new Error("WebGL RenderKernel requires a fragment shader");const{vertexSource:n,fragmentSource:i,pipelineFactory:a,shaderFactory:o,debugShaders:u,...s}=r;this.device=e,this.drawDefaults={parameters:r.parameters??{},topology:r.topology??"triangle-list"},this.id=r.id??"render-kernel",this.vertexSource=n,this.fragmentSource=i,this.pipelineFactory=a??T.getDefaultPipelineFactory(e),this.shaderFactory=o??X.getDefaultShaderFactory(e),this.vertexShader=this.shaderFactory.createShader({id:`${this.id}-vertex`,stage:"vertex",source:this.vertexSource,debugShaders:u}),this.fragmentShader=this.fragmentSource?this.shaderFactory.createShader({id:`${this.id}-fragment`,stage:"fragment",source:this.fragmentSource,debugShaders:u}):null;const l={...s,vs:this.vertexShader,fs:this.fragmentShader},h=T.getAsyncCompilation(e);if(h){const c=this.pipelineFactory.createRenderPipelineAsync(l);this._pipelineInitialization=c,h.push(c.then(f=>(this.pipeline=f,f)))}else this.pipeline=this.pipelineFactory.createRenderPipeline(l)}draw(e,r){const{bindings:n={},vertexArray:i,...a}=r;return this._setPipeline(e,n,i),e.draw(this.device.type==="webgl"?{...this.drawDefaults,...a,isInstanced:a.isInstanced??a.instanceCount!==void 0}:a)}drawIndirect(e,r){if(this.device.type!=="webgpu")throw new Error("Indirect drawing is only supported in WebGPU");const{bindings:n={},vertexArray:i,indirectBuffer:a,indirectOffset:o=0}=r;this._setPipeline(e,n,i),e.drawIndirect(a,o)}drawIndexedIndirect(e,r){if(this.device.type!=="webgpu")throw new Error("Indirect drawing is only supported in WebGPU");const{bindings:n={},vertexArray:i,indirectBuffer:a,indirectOffset:o=0}=r;this._setPipeline(e,n,i),e.drawIndexedIndirect(a,o)}destroy(){this._destroyed||(this.pipeline&&this.pipelineFactory.release(this.pipeline),this.shaderFactory.release(this.vertexShader),this.fragmentShader&&this.shaderFactory.release(this.fragmentShader),this._destroyed=!0)}_setPipeline(e,r,n){e.setPipeline(this.pipeline),e.setBindings(r),e.setVertexArray(n)}}function L(t,e,r){const n=e.shaderAssembler??new z,{vs:i,fs:a}=n.assembleGLSLShaderPair({platformInfo:N(t),vs:e.vs,fs:W(),modules:e.modules,defines:e.defines}),o=e.bufferLayout??[],u=new $(t,{vertexSource:i,fragmentSource:a,topology:"point-list",bufferLayout:o,varyings:e.outputs,bufferMode:35980});let s,l;try{s=t.createVertexArray({shaderLayout:u.pipeline.shaderLayout,bufferLayout:o});const h={...e.attributes,...r.inputBuffers};for(const f of u.pipeline.shaderLayout.attributes){const g=o.find(m=>m.attributes?m.attributes.some(p=>p.attribute===f.name):m.name===f.name),x=g&&h[g.name];j(x),s.setBuffer(f.location,x)}l=t.createTransformFeedback({layout:u.pipeline.shaderLayout,buffers:r.outputBuffers});const c=t.beginRenderPass({discard:!0});try{u.draw(c,{vertexArray:s,transformFeedback:l,bindings:e.bindings,vertexCount:e.vertexCount,instanceCount:e.instanceCount})}finally{c.end()}}finally{l?.destroy(),s?.destroy(),u.destroy()}}function y(t,e,r=!1){if(r)return e===1?"float":`vec${e}`;switch(t){case"uint8":case"uint16":case"uint32":return e===1?"uint":`uvec${e}`;case"sint8":case"sint16":case"sint32":return e===1?"int":`ivec${e}`;default:return e===1?"float":`vec${e}`}}function R(t,e,r=!1){let n;if(r)switch(t){case"uint8":n="unorm8";break;case"sint8":n="snorm8";break;case"uint16":n="unorm16";break;case"sint16":n="snorm16";break;case"float32":n="float32";break;default:throw new Error(`Unsupported normalized vertex format for ${t}`)}else n=t;return e===1?n:e===3&&!n.startsWith("float32")&&!n.endsWith("32")?`${n}x3-webgl`:`${n}x${e}`}function P(t){switch(t[0]){case"u":return"0u";case"s":return"0";default:return"0."}}function K(t,e){switch(t){case"uint8":case"uint16":case"uint32":return`${Math.trunc(e)}u`;case"sint8":case"sint16":case"sint32":return`${Math.trunc(e)}`;default:return Number.isInteger(e)?`${e}.0`:`${e}`}}function Z(t){switch(t){case"uint8":return"r8uint";case"sint8":return"r8sint";case"uint16":return"r16uint";case"sint16":return"r16sint";case"uint32":return"r32uint";case"sint32":return"r32sint";case"float32":return"r32float";default:throw new Error(`Unsupported WebGL gather texture format for ${t}`)}}function J(t){switch(t){case"uint32":return"usampler2D";case"sint32":return"isampler2D";case"float32":return"sampler2D";default:throw new Error(`Unsupported WebGL gather sampler type for ${t}`)}}const Q="GPGPU Operation Counts",ee="Transform Runs",te=new z;function E({module:t,elementWise:e=!1,expression:r,inputs:n,output:i,operationType:a=i.type,outputBuffer:o}){const u=o.device,s=I("result",i.type,i.size,i.normalized),l=[t,s],h=[],c={},f=y(i.type,1,i.normalized),g=y(a,1,i.normalized);let x="",m=null;const p={TYPE:g,RESULT_LEN:i.size.toString()},v=ne(n);for(const[d,_]of v)l.push(Y(d,_.type,_.size,_.normalized,a)),h.push(B(d,_)),_ instanceof C?c[d]=_.buffer:(m=m||S.createOrReuse(u,o.byteLength),c[d]=m),x+=`TYPE ${d}[${_.size}]; get_${d}(${d});
`,p[`${d.toUpperCase()}_LEN`]=_.size.toString();let b="";if(r)for(let d=0;d<i.size;d++)b+=`result[${d}]=${r(d)};
`;else if(e)for(let d=0;d<i.size;d++){const _=P(g),M=v.map(([D,G])=>d<G.size?`${D}[${d}]`:_);b+=`result[${d}]=${t.name}(${M.join(", ")});
`}else b=`${t.name}(${v.map(([d])=>d).join(", ")}, result);`;const k={vs:`#version 300 es

void main() {
${x}
${f} result[${i.size}];
${b}
set_result(result);
}
  `,shaderAssembler:te,defines:p,modules:l,bufferLayout:h,vertexCount:1,instanceCount:i.length,attributes:c,outputs:s.varyings};u.statsManager.getStats(Q).get(ee).incrementCount();try{L(u,k,{inputBuffers:c,outputBuffers:{[s.varyings[0]]:i.offset===0?o:{buffer:o,byteOffset:i.offset,byteLength:i.byteLength}}})}finally{m&&S.recycle(m)}}function ne(t){return Array.isArray(t)?t.map((e,r)=>[`x${r}`,e]):Object.entries(t)}function Y(t,e,r,n=!1,i=e){let a="",o="";for(let s=0;s<r;s+=4){const l=Math.min(r-s,4),h=y(e,l,n);a+=`in ${h} a${t}_${s};
`;for(let c=0;c<l;c++){let f=`a${t}_${s}`;l>1&&(f=`${f}[${c}]`),(n||e!==i)&&(f=`TYPE(${f})`),o+=`v[${s+c}]=${f};
`}}const u=`
${a}
void get_${t}(out TYPE v[${r}]) {
  ${o}
}
`;return{name:t,vs:u}}function B(t,e){const r={name:t,stepMode:e.isConstant?"vertex":"instance",byteStride:e.stride,attributes:[]};for(let n=0;n<e.size;n+=4){const i=Math.min(e.size-n,4);r.attributes.push({attribute:`a${t}_${n}`,format:R(e.type,i,e.normalized),byteOffset:e.offset+e.ValueType.BYTES_PER_ELEMENT*n})}return r}function I(t,e,r,n=!1){const i=[],a=y(e,1,n);let o="",u="";for(let s=0;s<r;s+=4){const l=Math.min(r-s,4),h=y(e,l,n);i.push(`${t}_${s}`),o+=`flat out ${h} ${t}_${s};
`;const c=Array.from({length:l},(f,g)=>s+g);u+=`${t}_${s} = ${h}(${c.map(f=>`v[${f}]`).join(",")});
`}return{name:t,varyings:i,vs:`
${o}
void set_${t}(in ${a} v[${r}]) {
  ${u}
}
`}}const re=`TYPE arithmetic_add(TYPE x, TYPE y) {
  return x + y;
}

TYPE arithmetic_subtract(TYPE x, TYPE y) {
  return x - y;
}

TYPE arithmetic_multiply(TYPE x, TYPE y) {
  return x * y;
}

TYPE arithmetic_divide(TYPE x, TYPE y) {
  return x / y;
}

float arithmetic_tan(float x) {
  return tan_fp32(x);
}
`,ie=({inputs:t,output:e,target:r})=>{const n=e.type,i=y(n,1,e.normalized),a=P(i),o=t.namedInputs;return E({module:{name:"arithmetic",dependencies:[q],vs:re},inputs:o,output:e,operationType:n,outputBuffer:r,expression:u=>V(t.expression,{operations:H,inputs:o,laneIndex:u,formatInput:s=>`${s}[${u}]`,formatOutOfBoundsInput:s=>o[s].size===1?`${s}[0]`:a,formatLiteral:s=>{const l=Array.isArray(s)?s[u]??0:s;return`${i}(${K(n,l)})`},formatCall:(s,l)=>`${s}(${l.join(", ")})`})}),{success:!0}},se="GPGPU Operation Counts",ae="Transform Runs",be=({inputs:t,output:e,target:r})=>{const{sourceValues:n}=t,i=r.device;if(n.length===0){const m=new e.ValueType(e.length*e.size);return r.write(m),{success:!0,value:m}}if(n.isConstant){const m=n.value,p=new e.ValueType(e.length*e.size);for(let v=0;v<e.length;v++){const b=m[v];p[v*2]=b,p[v*2+1]=b}return r.write(p),{success:!0,value:p}}const a=i.createTexture({width:1,height:e.length,format:"rg32float",usage:w.RENDER|w.COPY_SRC|w.COPY_DST}),o=i.createFramebuffer({colorAttachments:[a]}),u=`#version 300 es

flat out float extent_value;

void main() {
  float sourceValues[SOURCE_VALUES_LEN];
  get_sourceValues(sourceValues);
  extent_value = sourceValues[gl_VertexID];

  float y = (float(gl_VertexID) + 0.5) / float(CHANNEL_COUNT) * 2.0 - 1.0;
  gl_Position = vec4(0.0, y, 0.0, 1.0);
  gl_PointSize = 1.0;
}
  `,s=`#version 300 es

precision highp float;

flat in float extent_value;
out vec2 fragColor;

void main() {
  fragColor = vec2(-extent_value, extent_value);
}
  `,{vs:l,fs:h}=new z().assembleGLSLShaderPair({platformInfo:N(i),vs:u,fs:s,modules:[Y("sourceValues",n.type,n.size,n.normalized)],defines:{TYPE:"float",SOURCE_VALUES_LEN:n.size,CHANNEL_COUNT:e.length}}),c=[B("sourceValues",n)],f=new $(i,{vertexSource:l,fragmentSource:h,topology:"point-list",parameters:{depthCompare:"always",blend:!0,blendColorSrcFactor:"one",blendColorDstFactor:"one",blendColorOperation:"max",blendAlphaSrcFactor:"one",blendAlphaDstFactor:"one",blendAlphaOperation:"max"},bufferLayout:c,disableWarnings:!0}),g=i.createVertexArray({shaderLayout:f.pipeline.shaderLayout,bufferLayout:c});for(const m of f.pipeline.shaderLayout.attributes)g.setBuffer(m.location,n.buffer);const x=S.createOrReuse(i,e.byteLength);try{const m=i.beginRenderPass({framebuffer:o,parameters:{viewport:[0,0,1,e.length]},clearColor:[-A,-A,0,0],clearDepth:!1,clearStencil:!1});i.statsManager.getStats(se).get(ae).incrementCount(),f.draw(m,{vertexArray:g,vertexCount:e.length,instanceCount:n.length}),m.end();const p=i.createCommandEncoder();return p.copyTextureToBuffer({sourceTexture:a,width:1,height:e.length,destinationBuffer:x,byteOffset:0,bytesPerRow:8}),i.submit(p.finish()),ie({device:i,inputs:{expression:{kind:"call",op:"multiply",args:[{kind:"input",name:"x"},{kind:"literal",value:[-1,1]}]},namedInputs:{x:new C({buffer:x,size:2,type:"float32",length:e.length})}},output:e,target:r})}finally{g.destroy(),f.destroy(),S.recycle(x),o.destroy(),a.destroy()}},A=3e38,Te=({inputs:t,output:e,target:r})=>{const n=t.map((s,l)=>[`x${l}`,s]);oe(r.device.limits.maxVertexAttributes,n),ue(r.device.limits.maxInterStageShaderVariables,e);const i=n.map(([s,l])=>`in TYPE ${s}[${l.size}]`).join(", ");let a=0;const o=n.map(([s,l])=>{const h=Array.from({length:l.size},(c,f)=>`  result[${a+f}] = ${s}[${f}];`).join(`
`);return a+=l.size,h}).join(`
`),u=`void interleave(${i}, out TYPE result[RESULT_LEN]) {
${o}
}
`;return E({module:{name:"interleave",vs:u},inputs:t,output:e,outputBuffer:r}),{success:!0}};function oe(t,e){const r=e.reduce((n,[,i])=>n+Math.ceil(i.size/4),0);if(r>t)throw new Error(`interleave() requires ${r} vertex attributes, exceeding device limit ${t}`)}function ue(t,e){if(e.size>t)throw new Error(`interleave() output size ${e.size} exceeds device inter-stage component limit ${t}`)}function le(){const t=new Uint16Array([255]);return new Uint8Array(t.buffer)[0]>0}const fe=`#define LE ${le()?1:0}
const uint F32_NAN = 0xffffffffu;
const uint F32_INF = 0x7f800000u;

// Find first set bit using binary search
// https://en.wikipedia.org/wiki/Find_first_set#CLZ
int countLeadingZeros(uint a) {
  if (a == 0u) return 32;
  int n = 0;
  if ((a & 0xffff0000u) == 0u) { n += 16; a = a << 16; }
  if ((a & 0xff000000u) == 0u) { n += 8;  a = a << 8;  }
  if ((a & 0xf0000000u) == 0u) { n += 4;  a = a << 4;  }
  if ((a & 0xc0000000u) == 0u) { n += 2;  a = a << 2;  }
  if ((a & 0x80000000u) == 0u) return n + 1;
  return n;
}

uint roundShiftRight(uint value, int shift) {
  if (shift <= 0) {
    return value << (-shift);
  }

  if (shift >= 32) {
    if (shift == 32 && value > 0x80000000u) {
      return 1u;
    }
    return 0u;
  }

  uint truncated = value >> shift;
  uint halfShift = 1u << (shift - 1);
  uint remainder = value & ((1u << shift) - 1u);
  if (remainder > halfShift || (remainder == halfShift && (truncated & 1u) == 1u)) {
    return truncated + 1u;
  }
  return truncated;
}

uint makeFloat_(uint sign, int exponent, uint mantissa) {
  return (sign << 31) | (uint(exponent + 127) << 23) | (mantissa & 0x7fffffu);
}

/**
 * Assemble a float32 in bit representation according to IEEE 754
 * https://en.wikipedia.org/wiki/Single-precision_floating-point_format
 */
uint makeFloat(uint sign, int exponent, uint significand) {
  if (significand == 0u) {
    return sign << 31;
  }

  // Remove any extra leading zeros for better precision
  int lead_zeros = countLeadingZeros(significand);
  // Significand is encoded as 1.fraction
  int normalizedExponent = exponent + 31 - lead_zeros;

  if (normalizedExponent > 127) {
    return (sign << 31) | F32_INF;
  }

  uint mantissa;
  if (normalizedExponent >= -126) {
    mantissa = roundShiftRight(significand, 8 - lead_zeros);
    if (mantissa >= 0x1000000u) {
      mantissa >>= 1;
      normalizedExponent++;
      if (normalizedExponent > 127) {
        return (sign << 31) | F32_INF;
      }
    }
    return makeFloat_(sign, normalizedExponent, mantissa);
  }

  int subnormalShift = -149 - exponent;
  mantissa = roundShiftRight(significand, subnormalShift);
  if (mantissa >= 0x800000u) {
    return (sign << 31) | (1u << 23);
  }
  return (sign << 31) | mantissa;
}

/**
 * Parse 8-byte memory as a float64 number according to IEEE 754
 * https://en.wikipedia.org/wiki/Double-precision_floating-point_format
 * Returns 8-byte memory as 2 float32 numbers, consisting of
 * high part: fround(d)
 * low part: d - fround(d)
 */
uvec2 parseAsDouble(uvec2 d) {
  #if LE
  d = d.yx; // to big endian
  #endif

  uint sign = (d[0] >> 31) & 1u; // first bit
  uint exponentBits = (d[0] >> 20) & 0x7ffu;
  int exponent = int(exponentBits) - 1023; // next 11 bits
  uint fractionHigh = d[0] & 0xfffffu;
  uint fractionLow = d[1];

  if (exponentBits == 0x7ffu) {
    if (fractionHigh == 0u && fractionLow == 0u) {
      return uvec2((sign << 31) | F32_INF, F32_NAN);
    }
    return uvec2(F32_NAN);
  }
  
  if (exponentBits == 0u) {
    // All float64 subnormals are too small to survive a float32 split.
    return uvec2(sign << 31);
  }

  if (exponent > 127) {
    return uvec2((sign << 31) | F32_INF, ((1u - sign) << 31) | F32_INF);
  }

  uint hi_part;
  uint low_part;

  // float64 significand has 52 bits
  // float32 significand has 23 bits
  // The significand of the high part is the significand of the double, trimmed
  uint f_hi = 0x800000u | (fractionHigh << 3) | (fractionLow >> 29);
  uint f_low = fractionLow & 0x1fffffffu;

  if (exponent < -126) {
    // For tiny normals, the top 24 significand bits still contribute to the float32
    // high part, but they land in the float32 subnormal range.
    hi_part = makeFloat(sign, exponent - 23, f_hi);

    // The residual keeps the remaining 29 significand bits at the original double scale.
    low_part = makeFloat(sign, exponent - 52, f_low);
    return uvec2(hi_part, low_part);
  }

  bool roundUp = f_low > 0x10000000u || (f_low == 0x10000000u && (f_hi & 1u) == 1u);

  uint f_rounded = f_hi + (roundUp ? 1u : 0u);
  int exponent_hi = exponent;
  if (f_rounded == 0x1000000u) {
    f_rounded = 0x800000u;
    exponent_hi++;
  }

  if (exponent_hi > 127) {
    // Overflows float32 limit
    hi_part = (sign << 31) | F32_INF;
    low_part = ((1u - sign) << 31) | F32_INF;
    return uvec2(hi_part, low_part);
  }
  
  hi_part = makeFloat_(sign, exponent_hi, f_rounded);

  int remainder = int(f_low);
  uint sign_low = sign;
  if (roundUp) {
    remainder -= 0x20000000;
  }
  if (remainder < 0) {
    sign_low = 1u - sign;
    remainder = -remainder;
  }
  low_part = makeFloat(sign_low, exponent - 52, uint(remainder));

  return uvec2(hi_part, low_part);
}

void fround(in uint x[X_LEN], out float result[X_LEN]) {
  int n = X_LEN / 2;
  for (int i = 0; i < n; i++) {
    uvec2 f = parseAsDouble(uvec2(x[i * 2], x[i * 2 + 1]));
    result[i] = uintBitsToFloat(f.x);
    result[i + n] = uintBitsToFloat(f.y);
  }
}
`,we=({inputs:t,output:e,target:r})=>(E({module:{name:"fround",vs:fe},inputs:t,output:e,operationType:"uint32",outputBuffer:r}),{success:!0});function O(t,e,r){const n=J(r),i=y(e,1),a=Array.from({length:t.size},(o,u)=>`  v[${u}] = ${i}(texelFetch(source_values_texture, ivec2(${u}, rowIndex), 0).r);`).join(`
`);return{name:"source_values_texture",vs:`
uniform highp ${n} source_values_texture;
void read_source_values(int rowIndex, out TYPE v[${t.size}]) {
${a}
}
`}}function U(t,e,r){const n=r.createTexture({width:Math.max(t.size,1),height:t.length,format:Z(e),usage:w.SAMPLE|w.COPY_DST});if(t.length===0)return n;const i=r.createCommandEncoder();return i.copyBufferToTexture({sourceBuffer:t.buffer,destinationTexture:n,byteOffset:t.offset,bytesPerRow:t.stride,rowsPerImage:t.length,size:[t.size,t.length,1]}),r.submit(i.finish()),n}const Se=async({inputs:t,output:e,target:r})=>{const{ids:n,sourceValues:i}=t,a=r.device,o=I("result",e.type,e.size),u=y(n.type,1),s=y(e.type,1),l=e.type,h=U(i,l,a),f={vs:`#version 300 es

void main() {
  INDEX_TYPE ids[1];
  get_ids(ids);
  TYPE result[${e.size}];
  gather(ids, result);
  set_result(result);
}
  `,defines:{INDEX_TYPE:u,TYPE:s,RESULT_LEN:e.size.toString(),SOURCE_VALUES_ROWS:i.length.toString()},modules:[ce(n,u),O(i,e.type,l),he(e.type),o],bindings:{source_values_texture:h},bufferLayout:[de(n)],vertexCount:1,instanceCount:e.length,outputs:o.varyings};try{return L(a,f,{inputBuffers:{ids:n.buffer},outputBuffers:{[o.varyings[0]]:r}}),{success:!0}}finally{h.destroy()}};function ce(t,e){const r=y(t.type,1);let n="aids_0";return t.type!==me(e)&&(n=`${e}(${n})`),{name:"ids",vs:`
in ${r} aids_0;
void get_ids(out INDEX_TYPE v[1]) {
  v[0] = ${n};
}
`}}function de(t){return{name:"ids",stepMode:t.isConstant?"vertex":"instance",byteStride:t.stride,attributes:[{attribute:"aids_0",format:R(t.type,1,t.normalized),byteOffset:t.offset}]}}function he(t){return{name:"gather",vs:`
void zero_result(out TYPE result[RESULT_LEN]) {
  for (int i = 0; i < RESULT_LEN; i++) {
    result[i] = ${P(t)};
  }
}

void gather(in INDEX_TYPE ids[1], out TYPE result[RESULT_LEN]) {
  int sourceIndex = int(ids[0]);
  if (sourceIndex < 0 || sourceIndex >= SOURCE_VALUES_ROWS) {
    zero_result(result);
    return;
  }
  read_source_values(sourceIndex, result);
}
`}}function me(t){switch(t){case"uint":return"uint32";case"int":return"sint32";default:return"float32"}}const pe=`void row_dot(in TYPE x[X_LEN], in TYPE y[Y_LEN], out float result[1]) {
  float sum = 0.0;
  for (int i = 0; i < X_LEN; i++) {
    sum += float(x[i]) * float(y[i]);
  }
  result[0] = sum;
}
`,$e=({inputs:t,output:e,target:r})=>(E({module:{name:"row_dot",vs:pe},inputs:t,output:e,operationType:"float32",outputBuffer:r}),{success:!0}),ge=`void equalAll(in TYPE x[X_LEN], in TYPE y[Y_LEN], out uint result[1]) {
  uint allEqual = uint(1);
  for (int i = 0; i < X_LEN; i++) {
    if (x[i] != y[i]) {
      allEqual = uint(0);
      break;
    }
  }
  result[0] = allEqual;
}
`,Le=({inputs:t,output:e,target:r})=>(E({module:{name:"equalAll",vs:ge},inputs:t,output:e,operationType:e.type==="uint32"?t.x.type:e.type,outputBuffer:r}),{success:!0}),ye=`void row_length(in TYPE x[X_LEN], out float result[1]) {
  float sum = 0.0;
  for (int i = 0; i < X_LEN; i++) {
    sum += float(x[i]) * float(x[i]);
  }
  result[0] = sqrt(sum);
}
`,Pe=({inputs:t,output:e,target:r})=>(E({module:{name:"row_length",vs:ye},inputs:t,output:e,operationType:"float32",outputBuffer:r}),{success:!0}),Ie=async({inputs:t,output:e,target:r})=>{const{segments:n}=t,i=r.device,a=I("result",e.type,e.size),o=n.type,u=U(n,o,i),s={vs:`#version 300 es

void main() {
  TYPE result[RESULT_LEN];
  segmentedMap(result);
  set_result(result);
}
`,defines:{TYPE:"uint",RESULT_LEN:e.size.toString(),SEGMENTS_LENGTH:n.length.toString()},modules:[O(n,e.type,o),_e(),a],bindings:{source_values_texture:u},vertexCount:1,instanceCount:e.length,outputs:a.varyings};try{return L(i,s,{outputBuffers:{[a.varyings[0]]:r}}),{success:!0}}finally{u.destroy()}};function _e(){return{name:"segmentedMap",vs:`
uint read_segment_start(int segmentIndex) {
  TYPE value[1];
  read_source_values(segmentIndex, value);
  return uint(value[0]);
}

void segmentedMap(out TYPE result[RESULT_LEN]) {
  uint vertexIndex = uint(gl_InstanceID);
  int low = 0;
  int high = SEGMENTS_LENGTH;

  while (low < high) {
    int mid = low + (high - low) / 2;
    uint midStart = read_segment_start(mid);
    if (midStart <= vertexIndex) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }

  uint segmentIndex = uint(max(low - 1, 0));
  uint segmentStart = read_segment_start(int(segmentIndex));
  result[0] = segmentIndex;
  result[1] = vertexIndex - segmentStart;
}
`}}const Fe=async({inputs:t,output:e,target:r})=>{const n=y(e.type,1,e.normalized),i=P(n);return E({module:{name:"select",vs:""},inputs:t,output:e,operationType:e.type,outputBuffer:r,expression:a=>{const o=F("condition",t.condition,a,i),u=F("whenTrue",t.whenTrue,a,i),s=F("whenFalse",t.whenFalse,a,i);return`(${o} != ${i} ? ${u} : ${s})`}}),{success:!0}};function F(t,e,r,n){return r<e.size?`${t}[${r}]`:e.size===1?`${t}[0]`:n}const ze=({inputs:t,output:e,target:r})=>{const n=I("result",e.type,e.size),i={vs:`#version 300 es

void main() {
  int result[1];
  result[0] = START + gl_InstanceID * STEP;
  set_result(result);
}
`,defines:{START:t.start.toString(),STEP:t.step.toString()},modules:[n],vertexCount:1,instanceCount:e.length,outputs:n.varyings};return L(r.device,i,{outputBuffers:{[n.varyings[0]]:r}}),{success:!0}},Ae=({inputs:t,output:e,target:r})=>{const{columns:n}=t;return E({module:{name:"swizzle",vs:"// swizzle expression handled inline"},expression:i=>`x[${n[i]}]`,inputs:{x:t.x},output:e,outputBuffer:r}),{success:!0}};export{ie as arithmetic,Re as castData,Ye as convertColors,$e as dot,Le as equalAll,be as extent,we as fround,Se as gather,Te as interleave,Pe as length,Ie as segmentedMap,Fe as select,ze as sequence,Ae as swizzle};
