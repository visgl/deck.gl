"use strict";(self.webpackChunkproject_website=self.webpackChunkproject_website||[]).push([["8300"],{27255(e,t,r){r.r(t),r.d(t,{sequence:()=>X,gather:()=>R,equalAll:()=>O,interleave:()=>I,castData:()=>T.K,swizzle:()=>j,fround:()=>C,arithmetic:()=>S,length:()=>M,convertColors:()=>L.K,dot:()=>k,extent:()=>P,segmentedMap:()=>V,select:()=>G});var n=r(19160),i=r(49459),s=r(26867),a=r(3842),o=r(63754),u=r(92041),l=r(39472),f=r(32463);class d{static async createAsync(e,t){let r,n=!l.N.getAsyncCompilation(e),i=n?l.N.beginAsyncCompilation(e):l.N.getAsyncCompilation(e);try{r=new d(e,t)}finally{n&&l.N.endAsyncCompilation(e,i)}try{return n?await Promise.all(i):await r._pipelineInitialization,r}catch(e){throw r.destroy(),e}}device;id;vertexSource;fragmentSource;pipelineFactory;shaderFactory;vertexShader;fragmentShader;pipeline;_pipelineInitialization;_destroyed=!1;drawDefaults;constructor(e,t){if("webgpu"!==e.type&&"webgl"!==e.type)throw Error("RenderKernel requires WebGL or WebGPU");if("webgl"===e.type&&!t.fragmentSource)throw Error("WebGL RenderKernel requires a fragment shader");let{vertexSource:r,fragmentSource:n,pipelineFactory:i,shaderFactory:s,debugShaders:a,...o}=t;this.device=e,this.drawDefaults={parameters:t.parameters??{},topology:t.topology??"triangle-list"},this.id=t.id??"render-kernel",this.vertexSource=r,this.fragmentSource=n,this.pipelineFactory=i??l.N.getDefaultPipelineFactory(e),this.shaderFactory=s??f.g.getDefaultShaderFactory(e),this.vertexShader=this.shaderFactory.createShader({id:`${this.id}-vertex`,stage:"vertex",source:this.vertexSource,debugShaders:a}),this.fragmentShader=this.fragmentSource?this.shaderFactory.createShader({id:`${this.id}-fragment`,stage:"fragment",source:this.fragmentSource,debugShaders:a}):null;let u={...o,vs:this.vertexShader,fs:this.fragmentShader},d=l.N.getAsyncCompilation(e);if(d){let e=this.pipelineFactory.createRenderPipelineAsync(u);this._pipelineInitialization=e,d.push(e.then(e=>(this.pipeline=e,e)))}else this.pipeline=this.pipelineFactory.createRenderPipeline(u)}draw(e,t){let{bindings:r={},vertexArray:n,...i}=t;return this._setPipeline(e,r,n),e.draw("webgl"===this.device.type?{...this.drawDefaults,...i,isInstanced:i.isInstanced??void 0!==i.instanceCount}:i)}drawIndirect(e,t){if("webgpu"!==this.device.type)throw Error("Indirect drawing is only supported in WebGPU");let{bindings:r={},vertexArray:n,indirectBuffer:i,indirectOffset:s=0}=t;this._setPipeline(e,r,n),e.drawIndirect(i,s)}drawIndexedIndirect(e,t){if("webgpu"!==this.device.type)throw Error("Indirect drawing is only supported in WebGPU");let{bindings:r={},vertexArray:n,indirectBuffer:i,indirectOffset:s=0}=t;this._setPipeline(e,r,n),e.drawIndexedIndirect(i,s)}destroy(){this._destroyed||(this.pipeline&&this.pipelineFactory.release(this.pipeline),this.shaderFactory.release(this.vertexShader),this.fragmentShader&&this.shaderFactory.release(this.fragmentShader),this._destroyed=!0)}_setPipeline(e,t,r){e.setPipeline(this.pipeline),e.setBindings(t),e.setVertexArray(r)}}var c=r(46616);function p(e,t,r){let n,i,{vs:s,fs:l}=(t.shaderAssembler??new u.U).assembleGLSLShaderPair({platformInfo:(0,c.O)(e),vs:t.vs,fs:(0,o.Wk)(),modules:t.modules,defines:t.defines}),f=t.bufferLayout??[],p=new d(e,{vertexSource:s,fragmentSource:l,topology:"point-list",bufferLayout:f,varyings:t.outputs,bufferMode:35980});try{n=e.createVertexArray({shaderLayout:p.pipeline.shaderLayout,bufferLayout:f});let s={...t.attributes,...r.inputBuffers};for(let e of p.pipeline.shaderLayout.attributes){let t=f.find(t=>t.attributes?t.attributes.some(t=>t.attribute===e.name):t.name===e.name),r=t&&s[t.name];(0,a.v)(r),n.setBuffer(e.location,r)}i=e.createTransformFeedback({layout:p.pipeline.shaderLayout,buffers:r.outputBuffers});let o=e.beginRenderPass({discard:!0});try{p.draw(o,{vertexArray:n,transformFeedback:i,bindings:t.bindings,vertexCount:t.vertexCount,instanceCount:t.instanceCount})}finally{o.end()}}finally{i?.destroy(),n?.destroy(),p.destroy()}}var h=r(80316),m=r(95774);function g(e,t,r=!1){if(r)return 1===t?"float":`vec${t}`;switch(e){case"uint8":case"uint16":case"uint32":return 1===t?"uint":`uvec${t}`;case"sint8":case"sint16":case"sint32":return 1===t?"int":`ivec${t}`;default:return 1===t?"float":`vec${t}`}}function y(e,t,r=!1){let n;if(r)switch(e){case"uint8":n="unorm8";break;case"sint8":n="snorm8";break;case"uint16":n="unorm16";break;case"sint16":n="snorm16";break;case"float32":n="float32";break;default:throw Error(`Unsupported normalized vertex format for ${e}`)}else n=e;return 1===t?n:3!==t||n.startsWith("float32")||n.endsWith("32")?`${n}x${t}`:`${n}x3-webgl`}function _(e){switch(e[0]){case"u":return"0u";case"s":return"0";default:return"0."}}let v=new u.U;function x({module:e,elementWise:t=!1,expression:r,inputs:n,output:i,operationType:s=i.type,outputBuffer:a}){var o;let u=a.device,l=w("result",i.type,i.size,i.normalized),f=[e,l],d=[],c={},y=g(i.type,1,i.normalized),$=g(s,1,i.normalized),S="",T=null,L={TYPE:$,RESULT_LEN:i.size.toString()},z=Array.isArray(o=n)?o.map((e,t)=>[`x${t}`,e]):Object.entries(o);for(let[e,t]of z)f.push(E(e,t.type,t.size,t.normalized,s)),d.push(b(e,t)),t instanceof h.GL?c[e]=t.buffer:(T=T||m.R.createOrReuse(u,a.byteLength),c[e]=T),S+=`TYPE ${e}[${t.size}]; get_${e}(${e});
`,L[`${e.toUpperCase()}_LEN`]=t.size.toString();let P="";if(r)for(let e=0;e<i.size;e++)P+=`result[${e}]=${r(e)};
`;else if(t)for(let t=0;t<i.size;t++){let r=_($),n=z.map(([e,n])=>t<n.size?`${e}[${t}]`:r);P+=`result[${t}]=${e.name}(${n.join(", ")});
`}else P=`${e.name}(${z.map(([e])=>e).join(", ")}, result);`;let N={vs:`\
#version 300 es

void main() {
${S}
${y} result[${i.size}];
${P}
set_result(result);
}
  `,shaderAssembler:v,defines:L,modules:f,bufferLayout:d,vertexCount:1,instanceCount:i.length,attributes:c,outputs:l.varyings};u.statsManager.getStats("GPGPU Operation Counts").get("Transform Runs").incrementCount();try{p(u,N,{inputBuffers:c,outputBuffers:{[l.varyings[0]]:0===i.offset?a:{buffer:a,byteOffset:i.offset,byteLength:i.byteLength}}})}finally{T&&m.R.recycle(T)}}function E(e,t,r,n=!1,i=t){let s="",a="";for(let o=0;o<r;o+=4){let u=Math.min(r-o,4),l=g(t,u,n);s+=`in ${l} a${e}_${o};
`;for(let r=0;r<u;r++){let s=`a${e}_${o}`;u>1&&(s=`${s}[${r}]`),(n||t!==i)&&(s=`TYPE(${s})`),a+=`v[${o+r}]=${s};
`}}let o=`
${s}
void get_${e}(out TYPE v[${r}]) {
  ${a}
}
`;return{name:e,vs:o}}function b(e,t){let r={name:e,stepMode:t.isConstant?"vertex":"instance",byteStride:t.stride,attributes:[]};for(let n=0;n<t.size;n+=4){let i=Math.min(t.size-n,4);r.attributes.push({attribute:`a${e}_${n}`,format:y(t.type,i,t.normalized),byteOffset:t.offset+t.ValueType.BYTES_PER_ELEMENT*n})}return r}function w(e,t,r,n=!1){let i=[],s=g(t,1,n),a="",o="";for(let s=0;s<r;s+=4){let u=Math.min(r-s,4),l=g(t,u,n);i.push(`${e}_${s}`),a+=`flat out ${l} ${e}_${s};
`;let f=Array.from({length:u},(e,t)=>s+t);o+=`${e}_${s} = ${l}(${f.map(e=>`v[${e}]`).join(",")});
`}return{name:e,varyings:i,vs:`
${a}
void set_${e}(in ${s} v[${r}]) {
  ${o}
}
`}}let $=`\
TYPE arithmetic_add(TYPE x, TYPE y) {
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
`,S=({inputs:e,output:t,target:r})=>{let a=t.type,o=g(a,1,t.normalized),u=_(o),l=e.namedInputs;return x({module:{name:"arithmetic",dependencies:[n.i],vs:$},inputs:l,output:t,operationType:a,outputBuffer:r,expression:t=>(0,i.W)(e.expression,{operations:s.E,inputs:l,laneIndex:t,formatInput:e=>`${e}[${t}]`,formatOutOfBoundsInput:e=>1===l[e].size?`${e}[0]`:u,formatLiteral:e=>{let r=Array.isArray(e)?e[t]??0:e;return`${o}(${function(e,t){switch(e){case"uint8":case"uint16":case"uint32":return`${Math.trunc(t)}u`;case"sint8":case"sint16":case"sint32":return`${Math.trunc(t)}`;default:return Number.isInteger(t)?`${t}.0`:`${t}`}}(a,r)})`},formatCall:(e,t)=>`${e}(${t.join(", ")})`})}),{success:!0}};var T=r(32889),L=r(97923),z=r(87945);let P=({inputs:e,output:t,target:r})=>{let{sourceValues:n}=e,i=r.device;if(0===n.length){let e=new t.ValueType(t.length*t.size);return r.write(e),{success:!0,value:e}}if(n.isConstant){let e=n.value,i=new t.ValueType(t.length*t.size);for(let r=0;r<t.length;r++){let t=e[r];i[2*r]=t,i[2*r+1]=t}return r.write(i),{success:!0,value:i}}let s=i.createTexture({width:1,height:t.length,format:"rg32float",usage:z.g.RENDER|z.g.COPY_SRC|z.g.COPY_DST}),a=i.createFramebuffer({colorAttachments:[s]}),o=`\
#version 300 es

flat out float extent_value;

void main() {
  float sourceValues[SOURCE_VALUES_LEN];
  get_sourceValues(sourceValues);
  extent_value = sourceValues[gl_VertexID];

  float y = (float(gl_VertexID) + 0.5) / float(CHANNEL_COUNT) * 2.0 - 1.0;
  gl_Position = vec4(0.0, y, 0.0, 1.0);
  gl_PointSize = 1.0;
}
  `,l=`\
#version 300 es

precision highp float;

flat in float extent_value;
out vec2 fragColor;

void main() {
  fragColor = vec2(-extent_value, extent_value);
}
  `,{vs:f,fs:p}=new u.U().assembleGLSLShaderPair({platformInfo:(0,c.O)(i),vs:o,fs:l,modules:[E("sourceValues",n.type,n.size,n.normalized)],defines:{TYPE:"float",SOURCE_VALUES_LEN:n.size,CHANNEL_COUNT:t.length}}),g=[b("sourceValues",n)],y=new d(i,{vertexSource:f,fragmentSource:p,topology:"point-list",parameters:{depthCompare:"always",blend:!0,blendColorSrcFactor:"one",blendColorDstFactor:"one",blendColorOperation:"max",blendAlphaSrcFactor:"one",blendAlphaDstFactor:"one",blendAlphaOperation:"max"},bufferLayout:g,disableWarnings:!0}),_=i.createVertexArray({shaderLayout:y.pipeline.shaderLayout,bufferLayout:g});for(let e of y.pipeline.shaderLayout.attributes)_.setBuffer(e.location,n.buffer);let v=m.R.createOrReuse(i,t.byteLength);try{let e=i.beginRenderPass({framebuffer:a,parameters:{viewport:[0,0,1,t.length]},clearColor:[-N,-N,0,0],clearDepth:!1,clearStencil:!1});i.statsManager.getStats("GPGPU Operation Counts").get("Transform Runs").incrementCount(),y.draw(e,{vertexArray:_,vertexCount:t.length,instanceCount:n.length}),e.end();let o=i.createCommandEncoder();return o.copyTextureToBuffer({sourceTexture:s,width:1,height:t.length,destinationBuffer:v,byteOffset:0,bytesPerRow:8}),i.submit(o.finish()),S({device:i,inputs:{expression:{kind:"call",op:"multiply",args:[{kind:"input",name:"x"},{kind:"literal",value:[-1,1]}]},namedInputs:{x:new h.GL({buffer:v,size:2,type:"float32",length:t.length})}},output:t,target:r})}finally{_.destroy(),y.destroy(),m.R.recycle(v),a.destroy(),s.destroy()}},N=3e38,I=({inputs:e,output:t,target:r})=>{let n=e.map((e,t)=>[`x${t}`,e]);(function(e,t){let r=t.reduce((e,[,t])=>e+Math.ceil(t.size/4),0);if(r>e)throw Error(`interleave() requires ${r} vertex attributes, exceeding device limit ${e}`)})(r.device.limits.maxVertexAttributes,n),function(e,t){if(t.size>e)throw Error(`interleave() output size ${t.size} exceeds device inter-stage component limit ${e}`)}(r.device.limits.maxInterStageShaderVariables,t);let i=n.map(([e,t])=>`in TYPE ${e}[${t.size}]`).join(", "),s=0,a=n.map(([e,t])=>{let r=Array.from({length:t.size},(t,r)=>`  result[${s+r}] = ${e}[${r}];`).join("\n");return s+=t.size,r}).join("\n");return x({module:{name:"interleave",vs:`\
void interleave(${i}, out TYPE result[RESULT_LEN]) {
${a}
}
`},inputs:e,output:t,outputBuffer:r}),{success:!0}},F=`\
#define LE ${+(new Uint8Array(new Uint16Array([255]).buffer)[0]>0)}
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
`,C=({inputs:e,output:t,target:r})=>(x({module:{name:"fround",vs:F},inputs:e,output:t,operationType:"uint32",outputBuffer:r}),{success:!0});function A(e,t,r){let n=function(e){switch(e){case"uint32":return"usampler2D";case"sint32":return"isampler2D";case"float32":return"sampler2D";default:throw Error(`Unsupported WebGL gather sampler type for ${e}`)}}(r),i=g(t,1),s=Array.from({length:e.size},(e,t)=>`  v[${t}] = ${i}(texelFetch(source_values_texture, ivec2(${t}, rowIndex), 0).r);`).join("\n");return{name:"source_values_texture",vs:`
uniform highp ${n} source_values_texture;
void read_source_values(int rowIndex, out TYPE v[${e.size}]) {
${s}
}
`}}function Y(e,t,r){let n=r.createTexture({width:Math.max(e.size,1),height:e.length,format:function(e){switch(e){case"uint8":return"r8uint";case"sint8":return"r8sint";case"uint16":return"r16uint";case"sint16":return"r16sint";case"uint32":return"r32uint";case"sint32":return"r32sint";case"float32":return"r32float";default:throw Error(`Unsupported WebGL gather texture format for ${e}`)}}(t),usage:z.g.SAMPLE|z.g.COPY_DST});if(0===e.length)return n;let i=r.createCommandEncoder();return i.copyBufferToTexture({sourceBuffer:e.buffer,destinationTexture:n,byteOffset:e.offset,bytesPerRow:e.stride,rowsPerImage:e.length,size:[e.size,e.length,1]}),r.submit(i.finish()),n}let R=async({inputs:e,output:t,target:r})=>{var n,i,s;let a,o,u,{ids:l,sourceValues:f}=e,d=r.device,c=w("result",t.type,t.size),h=g(l.type,1),m=g(t.type,1),v=t.type,x=Y(f,v,d),E={vs:`\
#version 300 es

void main() {
  INDEX_TYPE ids[1];
  get_ids(ids);
  TYPE result[${t.size}];
  gather(ids, result);
  set_result(result);
}
  `,defines:{INDEX_TYPE:h,TYPE:m,RESULT_LEN:t.size.toString(),SOURCE_VALUES_ROWS:f.length.toString()},modules:[(n=l,i=h,a=g(n.type,1),o="aids_0",n.type!==function(e){switch(e){case"uint":return"uint32";case"int":return"sint32";default:return"float32"}}(i)&&(o=`${i}(${o})`),{name:"ids",vs:`
in ${a} aids_0;
void get_ids(out INDEX_TYPE v[1]) {
  v[0] = ${o};
}
`}),A(f,t.type,v),(u=_(t.type),{name:"gather",vs:`
void zero_result(out TYPE result[RESULT_LEN]) {
  for (int i = 0; i < RESULT_LEN; i++) {
    result[i] = ${u};
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
`}),c],bindings:{source_values_texture:x},bufferLayout:[{name:"ids",stepMode:(s=l).isConstant?"vertex":"instance",byteStride:s.stride,attributes:[{attribute:"aids_0",format:y(s.type,1,s.normalized),byteOffset:s.offset}]}],vertexCount:1,instanceCount:t.length,outputs:c.varyings};try{return p(d,E,{inputBuffers:{ids:l.buffer},outputBuffers:{[c.varyings[0]]:r}}),{success:!0}}finally{x.destroy()}},U=`\
void row_dot(in TYPE x[X_LEN], in TYPE y[Y_LEN], out float result[1]) {
  float sum = 0.0;
  for (int i = 0; i < X_LEN; i++) {
    sum += float(x[i]) * float(y[i]);
  }
  result[0] = sum;
}
`,k=({inputs:e,output:t,target:r})=>(x({module:{name:"row_dot",vs:U},inputs:e,output:t,operationType:"float32",outputBuffer:r}),{success:!0}),B=`\
void equalAll(in TYPE x[X_LEN], in TYPE y[Y_LEN], out uint result[1]) {
  uint allEqual = uint(1);
  for (int i = 0; i < X_LEN; i++) {
    if (x[i] != y[i]) {
      allEqual = uint(0);
      break;
    }
  }
  result[0] = allEqual;
}
`,O=({inputs:e,output:t,target:r})=>(x({module:{name:"equalAll",vs:B},inputs:e,output:t,operationType:"uint32"===t.type?e.x.type:t.type,outputBuffer:r}),{success:!0}),D=`\
void row_length(in TYPE x[X_LEN], out float result[1]) {
  float sum = 0.0;
  for (int i = 0; i < X_LEN; i++) {
    sum += float(x[i]) * float(x[i]);
  }
  result[0] = sqrt(sum);
}
`,M=({inputs:e,output:t,target:r})=>(x({module:{name:"row_length",vs:D},inputs:e,output:t,operationType:"float32",outputBuffer:r}),{success:!0}),V=async({inputs:e,output:t,target:r})=>{let{segments:n}=e,i=r.device,s=w("result",t.type,t.size),a=n.type,o=Y(n,a,i),u={vs:`\
#version 300 es

void main() {
  TYPE result[RESULT_LEN];
  segmentedMap(result);
  set_result(result);
}
`,defines:{TYPE:"uint",RESULT_LEN:t.size.toString(),SEGMENTS_LENGTH:n.length.toString()},modules:[A(n,t.type,a),{name:"segmentedMap",vs:`
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
`},s],bindings:{source_values_texture:o},vertexCount:1,instanceCount:t.length,outputs:s.varyings};try{return p(i,u,{outputBuffers:{[s.varyings[0]]:r}}),{success:!0}}finally{o.destroy()}},G=async({inputs:e,output:t,target:r})=>{let n=_(g(t.type,1,t.normalized));return x({module:{name:"select",vs:""},inputs:e,output:t,operationType:t.type,outputBuffer:r,expression:t=>{let r=W("condition",e.condition,t,n),i=W("whenTrue",e.whenTrue,t,n),s=W("whenFalse",e.whenFalse,t,n);return`(${r} != ${n} ? ${i} : ${s})`}}),{success:!0}};function W(e,t,r,n){return r<t.size?`${e}[${r}]`:1===t.size?`${e}[0]`:n}let X=({inputs:e,output:t,target:r})=>{let n=w("result",t.type,t.size),i={vs:`\
#version 300 es

void main() {
  int result[1];
  result[0] = START + gl_InstanceID * STEP;
  set_result(result);
}
`,defines:{START:e.start.toString(),STEP:e.step.toString()},modules:[n],vertexCount:1,instanceCount:t.length,outputs:n.varyings};return p(r.device,i,{outputBuffers:{[n.varyings[0]]:r}}),{success:!0}},j=({inputs:e,output:t,target:r})=>{let{columns:n}=e;return x({module:{name:"swizzle",vs:"// swizzle expression handled inline"},expression:e=>`x[${n[e]}]`,inputs:{x:e.x},output:t,outputBuffer:r}),{success:!0}}},49459(e,t,r){r.d(t,{W:()=>n});function n(e,t){return!function e(t,{operations:r,inputs:n}){switch(t.kind){case"input":if(!(t.name in n))throw Error(`Unknown expression input '${t.name}'`);return;case"literal":if(Array.isArray(t.value)){for(let e of t.value)if(!Number.isFinite(e))throw Error(`Expression literal array must contain only finite values, got ${e}`)}else if(!Number.isFinite(t.value))throw Error(`Expression literal must be finite, got ${t.value}`);return;case"call":{let i=r[t.op];if(!i)throw Error(`Unknown expression op '${t.op}'`);if(t.args.length!==i.arity)throw Error(`Expression op '${t.op}' expects ${i.arity} args, got ${t.args.length}`);for(let i of t.args)e(i,{operations:r,inputs:n});return}default:throw Error(`Unsupported expression node ${t.kind}`)}}(e,t),function e(t,r){switch(t.kind){case"input":{let e=r.inputs[t.name];if(r.laneIndex<e.size)return r.formatInput(t.name);return r.formatOutOfBoundsInput(t.name)}case"literal":return r.formatLiteral(t.value);case"call":{let n=r.operations[t.op],i=t.args.map(t=>e(t,r));return r.formatCall(n.symbol,i)}default:throw Error(`Unsupported expression node ${t.kind}`)}}(e,t)}}}]);
//# sourceMappingURL=8300.c1e3c63f.js.map