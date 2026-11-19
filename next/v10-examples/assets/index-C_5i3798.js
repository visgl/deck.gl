import{c as V}from"./expression-Bl_GL2tO.js";import{ai as N,bt as G,ae as I,k as X,an as A,bu as $,bv as j,bw as q,T}from"./deck-example-device-BCUkEN3p.js";import{bx as Re,by as Ce}from"./deck-example-device-BCUkEN3p.js";import{R as F}from"./render-kernel-B3dsnasu.js";function S(t,e,r){const n=e.shaderAssembler??new N,{vs:s,fs:u}=n.assembleGLSLShaderPair({platformInfo:I(t),vs:e.vs,fs:G(),modules:e.modules,defines:e.defines}),a=e.bufferLayout??[],o=new F(t,{vertexSource:s,fragmentSource:u,topology:"point-list",bufferLayout:a,varyings:e.outputs,bufferMode:35980});let i,l;try{i=t.createVertexArray({shaderLayout:o.pipeline.shaderLayout,bufferLayout:a});const g={...e.attributes,...r.inputBuffers};for(const f of o.pipeline.shaderLayout.attributes){const p=a.find(m=>m.attributes?m.attributes.some(h=>h.attribute===f.name):m.name===f.name),v=p&&g[p.name];X(v),i.setBuffer(f.location,v)}l=t.createTransformFeedback({layout:o.pipeline.shaderLayout,buffers:r.outputBuffers});const d=t.beginRenderPass({discard:!0});try{o.draw(d,{vertexArray:i,transformFeedback:l,bindings:e.bindings,vertexCount:e.vertexCount,instanceCount:e.instanceCount})}finally{d.end()}}finally{l?.destroy(),i?.destroy(),o.destroy()}}function _(t,e,r=!1){if(r)return e===1?"float":`vec${e}`;switch(t){case"uint8":case"uint16":case"uint32":return e===1?"uint":`uvec${e}`;case"sint8":case"sint16":case"sint32":return e===1?"int":`ivec${e}`;default:return e===1?"float":`vec${e}`}}function R(t,e,r=!1){let n;if(r)switch(t){case"uint8":n="unorm8";break;case"sint8":n="snorm8";break;case"uint16":n="unorm16";break;case"sint16":n="snorm16";break;case"float32":n="float32";break;default:throw new Error(`Unsupported normalized vertex format for ${t}`)}else n=t;return e===1?n:e===3&&!n.startsWith("float32")&&!n.endsWith("32")?`${n}x3-webgl`:`${n}x${e}`}function w(t){switch(t[0]){case"u":return"0u";case"s":return"0";default:return"0."}}function H(t,e){switch(t){case"uint8":case"uint16":case"uint32":return`${Math.trunc(e)}u`;case"sint8":case"sint16":case"sint32":return`${Math.trunc(e)}`;default:return Number.isInteger(e)?`${e}.0`:`${e}`}}function W(t){switch(t){case"uint8":return"r8uint";case"sint8":return"r8sint";case"uint16":return"r16uint";case"sint16":return"r16sint";case"uint32":return"r32uint";case"sint32":return"r32sint";case"float32":return"r32float";default:throw new Error(`Unsupported WebGL gather texture format for ${t}`)}}function Z(t){switch(t){case"uint32":return"usampler2D";case"sint32":return"isampler2D";case"float32":return"sampler2D";default:throw new Error(`Unsupported WebGL gather sampler type for ${t}`)}}const K="GPGPU Operation Counts",J="Transform Runs",Q=new N;function E({module:t,elementWise:e=!1,expression:r,inputs:n,output:s,operationType:u=s.type,outputBuffer:a}){const o=a.device,i=L("result",s.type,s.size,s.normalized),l=[t,i],g=[],d={},f=_(s.type,1,s.normalized),p=_(u,1,s.normalized);let v="",m=null;const h={TYPE:p,RESULT_LEN:s.size.toString()},y=ee(n);for(const[c,x]of y)l.push(C(c,x.type,x.size,x.normalized,u)),g.push(Y(c,x)),x instanceof A?d[c]=x.buffer:(m=m||$.createOrReuse(o,a.byteLength),d[c]=m),v+=`TYPE ${c}[${x.size}]; get_${c}(${c});
`,h[`${c.toUpperCase()}_LEN`]=x.size.toString();let b="";if(r)for(let c=0;c<s.size;c++)b+=`result[${c}]=${r(c)};
`;else if(e)for(let c=0;c<s.size;c++){const x=w(p),U=y.map(([k,D])=>c<D.size?`${k}[${c}]`:x);b+=`result[${c}]=${t.name}(${U.join(", ")});
`}else b=`${t.name}(${y.map(([c])=>c).join(", ")}, result);`;const M={vs:`#version 300 es

void main() {
${v}
${f} result[${s.size}];
${b}
set_result(result);
}
  `,shaderAssembler:Q,defines:h,modules:l,bufferLayout:g,vertexCount:1,instanceCount:s.length,attributes:d,outputs:i.varyings};o.statsManager.getStats(K).get(J).incrementCount();try{S(o,M,{inputBuffers:d,outputBuffers:{[i.varyings[0]]:s.offset===0?a:{buffer:a,byteOffset:s.offset,byteLength:s.byteLength}}})}finally{m&&$.recycle(m)}}function ee(t){return Array.isArray(t)?t.map((e,r)=>[`x${r}`,e]):Object.entries(t)}function C(t,e,r,n=!1,s=e){let u="",a="";for(let i=0;i<r;i+=4){const l=Math.min(r-i,4),g=_(e,l,n);u+=`in ${g} a${t}_${i};
`;for(let d=0;d<l;d++){let f=`a${t}_${i}`;l>1&&(f=`${f}[${d}]`),(n||e!==s)&&(f=`TYPE(${f})`),a+=`v[${i+d}]=${f};
`}}const o=`
${u}
void get_${t}(out TYPE v[${r}]) {
  ${a}
}
`;return{name:t,vs:o}}function Y(t,e){const r={name:t,stepMode:e.isConstant?"vertex":"instance",byteStride:e.stride,attributes:[]};for(let n=0;n<e.size;n+=4){const s=Math.min(e.size-n,4);r.attributes.push({attribute:`a${t}_${n}`,format:R(e.type,s,e.normalized),byteOffset:e.offset+e.ValueType.BYTES_PER_ELEMENT*n})}return r}function L(t,e,r,n=!1){const s=[],u=_(e,1,n);let a="",o="";for(let i=0;i<r;i+=4){const l=Math.min(r-i,4),g=_(e,l,n);s.push(`${t}_${i}`),a+=`flat out ${g} ${t}_${i};
`;const d=Array.from({length:l},(f,p)=>i+p);o+=`${t}_${i} = ${g}(${d.map(f=>`v[${f}]`).join(",")});
`}return{name:t,varyings:s,vs:`
${a}
void set_${t}(in ${u} v[${r}]) {
  ${o}
}
`}}const te=`TYPE arithmetic_add(TYPE x, TYPE y) {
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
`,ne=({inputs:t,output:e,target:r})=>{const n=e.type,s=_(n,1,e.normalized),u=w(s),a=t.namedInputs;return E({module:{name:"arithmetic",dependencies:[j],vs:te},inputs:a,output:e,operationType:n,outputBuffer:r,expression:o=>V(t.expression,{operations:q,inputs:a,laneIndex:o,formatInput:i=>`${i}[${o}]`,formatOutOfBoundsInput:i=>a[i].size===1?`${i}[0]`:u,formatLiteral:i=>{const l=Array.isArray(i)?i[o]??0:i;return`${s}(${H(n,l)})`},formatCall:(i,l)=>`${i}(${l.join(", ")})`})}),{success:!0}},re="GPGPU Operation Counts",se="Transform Runs",Ee=({inputs:t,output:e,target:r})=>{const{sourceValues:n}=t,s=r.device;if(n.length===0){const m=new e.ValueType(e.length*e.size);return r.write(m),{success:!0,value:m}}if(n.isConstant){const m=n.value,h=new e.ValueType(e.length*e.size);for(let y=0;y<e.length;y++){const b=m[y];h[y*2]=b,h[y*2+1]=b}return r.write(h),{success:!0,value:h}}const u=s.createTexture({width:1,height:e.length,format:"rg32float",usage:T.RENDER|T.COPY_SRC|T.COPY_DST}),a=s.createFramebuffer({colorAttachments:[u]}),o=`#version 300 es

flat out float extent_value;

void main() {
  float sourceValues[SOURCE_VALUES_LEN];
  get_sourceValues(sourceValues);
  extent_value = sourceValues[gl_VertexID];

  float y = (float(gl_VertexID) + 0.5) / float(CHANNEL_COUNT) * 2.0 - 1.0;
  gl_Position = vec4(0.0, y, 0.0, 1.0);
  gl_PointSize = 1.0;
}
  `,i=`#version 300 es

precision highp float;

flat in float extent_value;
out vec2 fragColor;

void main() {
  fragColor = vec2(-extent_value, extent_value);
}
  `,{vs:l,fs:g}=new N().assembleGLSLShaderPair({platformInfo:I(s),vs:o,fs:i,modules:[C("sourceValues",n.type,n.size,n.normalized)],defines:{TYPE:"float",SOURCE_VALUES_LEN:n.size,CHANNEL_COUNT:e.length}}),d=[Y("sourceValues",n)],f=new F(s,{vertexSource:l,fragmentSource:g,topology:"point-list",parameters:{depthCompare:"always",blend:!0,blendColorSrcFactor:"one",blendColorDstFactor:"one",blendColorOperation:"max",blendAlphaSrcFactor:"one",blendAlphaDstFactor:"one",blendAlphaOperation:"max"},bufferLayout:d,disableWarnings:!0}),p=s.createVertexArray({shaderLayout:f.pipeline.shaderLayout,bufferLayout:d});for(const m of f.pipeline.shaderLayout.attributes)p.setBuffer(m.location,n.buffer);const v=$.createOrReuse(s,e.byteLength);try{const m=s.beginRenderPass({framebuffer:a,parameters:{viewport:[0,0,1,e.length]},clearColor:[-z,-z,0,0],clearDepth:!1,clearStencil:!1});s.statsManager.getStats(re).get(se).incrementCount(),f.draw(m,{vertexArray:p,vertexCount:e.length,instanceCount:n.length}),m.end();const h=s.createCommandEncoder();return h.copyTextureToBuffer({sourceTexture:u,width:1,height:e.length,destinationBuffer:v,byteOffset:0,bytesPerRow:8}),s.submit(h.finish()),ne({device:s,inputs:{expression:{kind:"call",op:"multiply",args:[{kind:"input",name:"x"},{kind:"literal",value:[-1,1]}]},namedInputs:{x:new A({buffer:v,size:2,type:"float32",length:e.length})}},output:e,target:r})}finally{p.destroy(),f.destroy(),$.recycle(v),a.destroy(),u.destroy()}},z=3e38,be=({inputs:t,output:e,target:r})=>{const n=t.map((i,l)=>[`x${l}`,i]);ie(r.device.limits.maxVertexAttributes,n),ae(r.device.limits.maxInterStageShaderVariables,e);const s=n.map(([i,l])=>`in TYPE ${i}[${l.size}]`).join(", ");let u=0;const a=n.map(([i,l])=>{const g=Array.from({length:l.size},(d,f)=>`  result[${u+f}] = ${i}[${f}];`).join(`
`);return u+=l.size,g}).join(`
`),o=`void interleave(${s}, out TYPE result[RESULT_LEN]) {
${a}
}
`;return E({module:{name:"interleave",vs:o},inputs:t,output:e,outputBuffer:r}),{success:!0}};function ie(t,e){const r=e.reduce((n,[,s])=>n+Math.ceil(s.size/4),0);if(r>t)throw new Error(`interleave() requires ${r} vertex attributes, exceeding device limit ${t}`)}function ae(t,e){if(e.size>t)throw new Error(`interleave() output size ${e.size} exceeds device inter-stage component limit ${t}`)}function oe(){const t=new Uint16Array([255]);return new Uint8Array(t.buffer)[0]>0}const ue=`#define LE ${oe()?1:0}
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
`,Te=({inputs:t,output:e,target:r})=>(E({module:{name:"fround",vs:ue},inputs:t,output:e,operationType:"uint32",outputBuffer:r}),{success:!0});function B(t,e,r){const n=Z(r),s=_(e,1),u=Array.from({length:t.size},(a,o)=>`  v[${o}] = ${s}(texelFetch(source_values_texture, ivec2(${o}, rowIndex), 0).r);`).join(`
`);return{name:"source_values_texture",vs:`
uniform highp ${n} source_values_texture;
void read_source_values(int rowIndex, out TYPE v[${t.size}]) {
${u}
}
`}}function O(t,e,r){const n=r.createTexture({width:Math.max(t.size,1),height:t.length,format:W(e),usage:T.SAMPLE|T.COPY_DST});if(t.length===0)return n;const s=r.createCommandEncoder();return s.copyBufferToTexture({sourceBuffer:t.buffer,destinationTexture:n,byteOffset:t.offset,bytesPerRow:t.stride,rowsPerImage:t.length,size:[t.size,t.length,1]}),r.submit(s.finish()),n}const $e=async({inputs:t,output:e,target:r})=>{const{ids:n,sourceValues:s}=t,u=r.device,a=L("result",e.type,e.size),o=_(n.type,1),i=_(e.type,1),l=e.type,g=O(s,l,u),f={vs:`#version 300 es

void main() {
  INDEX_TYPE ids[1];
  get_ids(ids);
  TYPE result[${e.size}];
  gather(ids, result);
  set_result(result);
}
  `,defines:{INDEX_TYPE:o,TYPE:i,RESULT_LEN:e.size.toString(),SOURCE_VALUES_ROWS:s.length.toString()},modules:[le(n,o),B(s,e.type,l),ce(e.type),a],bindings:{source_values_texture:g},bufferLayout:[fe(n)],vertexCount:1,instanceCount:e.length,outputs:a.varyings};try{return S(u,f,{inputBuffers:{ids:n.buffer},outputBuffers:{[a.varyings[0]]:r}}),{success:!0}}finally{g.destroy()}};function le(t,e){const r=_(t.type,1);let n="aids_0";return t.type!==de(e)&&(n=`${e}(${n})`),{name:"ids",vs:`
in ${r} aids_0;
void get_ids(out INDEX_TYPE v[1]) {
  v[0] = ${n};
}
`}}function fe(t){return{name:"ids",stepMode:t.isConstant?"vertex":"instance",byteStride:t.stride,attributes:[{attribute:"aids_0",format:R(t.type,1,t.normalized),byteOffset:t.offset}]}}function ce(t){return{name:"gather",vs:`
void zero_result(out TYPE result[RESULT_LEN]) {
  for (int i = 0; i < RESULT_LEN; i++) {
    result[i] = ${w(t)};
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
`}}function de(t){switch(t){case"uint":return"uint32";case"int":return"sint32";default:return"float32"}}const me=`void row_dot(in TYPE x[X_LEN], in TYPE y[Y_LEN], out float result[1]) {
  float sum = 0.0;
  for (int i = 0; i < X_LEN; i++) {
    sum += float(x[i]) * float(y[i]);
  }
  result[0] = sum;
}
`,Se=({inputs:t,output:e,target:r})=>(E({module:{name:"row_dot",vs:me},inputs:t,output:e,operationType:"float32",outputBuffer:r}),{success:!0}),ge=`void equalAll(in TYPE x[X_LEN], in TYPE y[Y_LEN], out uint result[1]) {
  uint allEqual = uint(1);
  for (int i = 0; i < X_LEN; i++) {
    if (x[i] != y[i]) {
      allEqual = uint(0);
      break;
    }
  }
  result[0] = allEqual;
}
`,we=({inputs:t,output:e,target:r})=>(E({module:{name:"equalAll",vs:ge},inputs:t,output:e,operationType:e.type==="uint32"?t.x.type:e.type,outputBuffer:r}),{success:!0}),he=`void row_length(in TYPE x[X_LEN], out float result[1]) {
  float sum = 0.0;
  for (int i = 0; i < X_LEN; i++) {
    sum += float(x[i]) * float(x[i]);
  }
  result[0] = sqrt(sum);
}
`,Le=({inputs:t,output:e,target:r})=>(E({module:{name:"row_length",vs:he},inputs:t,output:e,operationType:"float32",outputBuffer:r}),{success:!0}),Pe=async({inputs:t,output:e,target:r})=>{const{segments:n}=t,s=r.device,u=L("result",e.type,e.size),a=n.type,o=O(n,a,s),i={vs:`#version 300 es

void main() {
  TYPE result[RESULT_LEN];
  segmentedMap(result);
  set_result(result);
}
`,defines:{TYPE:"uint",RESULT_LEN:e.size.toString(),SEGMENTS_LENGTH:n.length.toString()},modules:[B(n,e.type,a),pe(),u],bindings:{source_values_texture:o},vertexCount:1,instanceCount:e.length,outputs:u.varyings};try{return S(s,i,{outputBuffers:{[u.varyings[0]]:r}}),{success:!0}}finally{o.destroy()}};function pe(){return{name:"segmentedMap",vs:`
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
`}}const Ne=async({inputs:t,output:e,target:r})=>{const n=_(e.type,1,e.normalized),s=w(n);return E({module:{name:"select",vs:""},inputs:t,output:e,operationType:e.type,outputBuffer:r,expression:u=>{const a=P("condition",t.condition,u,s),o=P("whenTrue",t.whenTrue,u,s),i=P("whenFalse",t.whenFalse,u,s);return`(${a} != ${s} ? ${o} : ${i})`}}),{success:!0}};function P(t,e,r,n){return r<e.size?`${t}[${r}]`:e.size===1?`${t}[0]`:n}const ze=({inputs:t,output:e,target:r})=>{const n=L("result",e.type,e.size),s={vs:`#version 300 es

void main() {
  int result[1];
  result[0] = START + gl_InstanceID * STEP;
  set_result(result);
}
`,defines:{START:t.start.toString(),STEP:t.step.toString()},modules:[n],vertexCount:1,instanceCount:e.length,outputs:n.varyings};return S(r.device,s,{outputBuffers:{[n.varyings[0]]:r}}),{success:!0}},Ie=({inputs:t,output:e,target:r})=>{const{columns:n}=t;return E({module:{name:"swizzle",vs:"// swizzle expression handled inline"},expression:s=>`x[${n[s]}]`,inputs:{x:t.x},output:e,outputBuffer:r}),{success:!0}};export{ne as arithmetic,Re as castData,Ce as convertColors,Se as dot,we as equalAll,Ee as extent,Te as fround,$e as gather,be as interleave,Le as length,Pe as segmentedMap,Ne as select,ze as sequence,Ie as swizzle};
