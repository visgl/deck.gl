"use strict";(self.webpackChunkproject_website=self.webpackChunkproject_website||[]).push([["2671"],{55554(e,t,n){n.r(t),n.d(t,{sequence:()=>B,gather:()=>N,equalAll:()=>Y,interleave:()=>b,swizzle:()=>O,fround:()=>z,arithmetic:()=>v,length:()=>k,dot:()=>C,extent:()=>$,segmentedMap:()=>R,select:()=>A});var i=n(22270),r=n(84765),s=n(95309),u=n(9079),a=n(79399),o=n(64238),l=n(66008);function f(e,t,n=!1){if(n)return 1===t?"float":`vec${t}`;switch(e){case"uint8":case"uint16":case"uint32":return 1===t?"uint":`uvec${t}`;case"sint8":case"sint16":case"sint32":return 1===t?"int":`ivec${t}`;default:return 1===t?"float":`vec${t}`}}function d(e,t,n=!1){let i;if(n)switch(e){case"uint8":i="unorm8";break;case"sint8":i="snorm8";break;case"uint16":i="unorm16";break;case"sint16":i="snorm16";break;case"float32":i="float32";break;default:throw Error(`Unsupported normalized vertex format for ${e}`)}else i=e;return 1===t?i:3!==t||i.startsWith("float32")||i.endsWith("32")?`${i}x${t}`:`${i}x3-webgl`}function c(e){switch(e[0]){case"u":return"0u";case"s":return"0";default:return"0."}}let p=new a._;function m({module:e,elementWise:t=!1,expression:n,inputs:i,output:r,operationType:s=r.type,outputBuffer:a}){var d;let x=a.device,v=_("result",r.type,r.size,r.normalized),E=[e,v],y=[],$={},w=f(r.type,1,r.normalized),b=f(s,1,r.normalized),T="",z=null,S={TYPE:b,RESULT_LEN:r.size.toString()},L=Array.isArray(d=i)?d.map((e,t)=>[`x${t}`,e]):Object.entries(d);for(let[e,t]of L)E.push(g(e,t.type,t.size,t.normalized,s)),y.push(h(e,t)),t instanceof o.GL?$[e]=t.buffer:(z=z||l.R.createOrReuse(x,a.byteLength),$[e]=z),T+=`TYPE ${e}[${t.size}]; get_${e}(${e});
`,S[`${e.toUpperCase()}_LEN`]=t.size.toString();let N="";if(n)for(let e=0;e<r.size;e++)N+=`result[${e}]=${n(e)};
`;else if(t)for(let t=0;t<r.size;t++){let n=c(b),i=L.map(([e,i])=>t<i.size?`${e}[${t}]`:n);N+=`result[${t}]=${e.name}(${i.join(", ")});
`}else N=`${e.name}(${L.map(([e])=>e).join(", ")}, result);`;let P=`\
#version 300 es

void main() {
${T}
${w} result[${r.size}];
${N}
set_result(result);
}
  `,C=new u.p(x,{vs:P,shaderAssembler:p,defines:S,modules:E,bufferLayout:y,vertexCount:1,instanceCount:r.length,attributes:$,feedbackBufferMode:"interleaved",outputs:v.varyings});x.statsManager.getStats("GPGPU Operation Counts").get("Transform Runs").incrementCount(),C.run({inputBuffers:$,outputBuffers:{[v.varyings[0]]:a}}),z&&l.R.recycle(z)}function g(e,t,n,i=!1,r=t){let s="",u="";for(let a=0;a<n;a+=4){let o=Math.min(n-a,4),l=f(t,o,i);s+=`in ${l} a${e}_${a};
`;for(let n=0;n<o;n++){let s=`a${e}_${a}`;o>1&&(s=`${s}[${n}]`),(i||t!==r)&&(s=`TYPE(${s})`),u+=`v[${a+n}]=${s};
`}}let a=`
${s}
void get_${e}(out TYPE v[${n}]) {
  ${u}
}
`;return{name:e,vs:a}}function h(e,t){let n={name:e,stepMode:t.isConstant?"vertex":"instance",byteStride:t.stride,attributes:[]};for(let i=0;i<t.size;i+=4){let r=Math.min(t.size-i,4);n.attributes.push({attribute:`a${e}_${i}`,format:d(t.type,r,t.normalized),byteOffset:t.offset+t.ValueType.BYTES_PER_ELEMENT*i})}return n}function _(e,t,n,i=!1){let r=[],s=f(t,1,i),u="",a="";for(let s=0;s<n;s+=4){let o=Math.min(n-s,4),l=f(t,o,i);r.push(`${e}_${s}`),u+=`flat out ${l} ${e}_${s};
`;let d=Array.from({length:o},(e,t)=>s+t);a+=`${e}_${s} = ${l}(${d.map(e=>`v[${e}]`).join(",")});
`}return{name:e,varyings:r,vs:`
${u}
void set_${e}(in ${s} v[${n}]) {
  ${a}
}
`}}let x=`\
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
`,v=({inputs:e,output:t,target:n})=>{let u=t.type,a=f(u,1,t.normalized),o=c(a),l=e.namedInputs;return m({module:{name:"arithmetic",dependencies:[i.i],vs:x},inputs:l,output:t,operationType:u,outputBuffer:n,expression:t=>(0,r.W)(e.expression,{operations:s.E,inputs:l,laneIndex:t,formatInput:e=>`${e}[${t}]`,formatOutOfBoundsInput:e=>1===l[e].size?`${e}[0]`:o,formatLiteral:e=>{let n=Array.isArray(e)?e[t]??0:e;return`${a}(${function(e,t){switch(e){case"uint8":case"uint16":case"uint32":return`${Math.trunc(t)}u`;case"sint8":case"sint16":case"sint32":return`${Math.trunc(t)}`;default:return Number.isInteger(t)?`${t}.0`:`${t}`}}(u,n)})`},formatCall:(e,t)=>`${e}(${t.join(", ")})`})}),{success:!0}};var E=n(38550),y=n(12434);let $=({inputs:e,output:t,target:n})=>{let{sourceValues:i}=e,r=n.device;if(0===i.length){let e=new t.ValueType(t.length*t.size);return n.write(e),{success:!0,value:e}}if(i.isConstant){let e=i.value,r=new t.ValueType(t.length*t.size);for(let n=0;n<t.length;n++){let t=e[n];r[2*n]=t,r[2*n+1]=t}return n.write(r),{success:!0,value:r}}let s=r.createTexture({width:1,height:t.length,format:"rg32float",usage:E.g.RENDER|E.g.COPY_SRC|E.g.COPY_DST}),u=r.createFramebuffer({colorAttachments:[s]}),a=`\
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
  `,f=`\
#version 300 es

precision highp float;

flat in float extent_value;
out vec2 fragColor;

void main() {
  fragColor = vec2(-extent_value, extent_value);
}
  `,d=new y.K(r,{vs:a,fs:f,topology:"point-list",parameters:{depthCompare:"always",blend:!0,blendColorSrcFactor:"one",blendColorDstFactor:"one",blendColorOperation:"max",blendAlphaSrcFactor:"one",blendAlphaDstFactor:"one",blendAlphaOperation:"max"},modules:[g("sourceValues",i.type,i.size,i.normalized)],defines:{TYPE:"float",SOURCE_VALUES_LEN:i.size.toString(),CHANNEL_COUNT:t.length.toString()},attributes:{sourceValues:i.buffer},bufferLayout:[h("sourceValues",i)],instanceCount:i.length,vertexCount:t.length,disableWarnings:!0}),c=l.R.createOrReuse(r,t.byteLength);try{let e=r.beginRenderPass({framebuffer:u,parameters:{viewport:[0,0,1,t.length]},clearColor:[-w,-w,0,0],clearDepth:!1,clearStencil:!1});r.statsManager.getStats("GPGPU Operation Counts").get("Transform Runs").incrementCount(),d.draw(e),e.end();let i=r.createCommandEncoder();return i.copyTextureToBuffer({sourceTexture:s,width:1,height:t.length,destinationBuffer:c,byteOffset:0,bytesPerRow:8}),r.submit(i.finish()),v({device:r,inputs:{expression:{kind:"call",op:"multiply",args:[{kind:"input",name:"x"},{kind:"literal",value:[-1,1]}]},namedInputs:{x:new o.GL({buffer:c,size:2,type:"float32",length:t.length})}},output:t,target:n})}finally{d.destroy(),l.R.recycle(c),u.destroy(),s.destroy()}},w=3e38,b=({inputs:e,output:t,target:n})=>{let i=e.map((e,t)=>[`x${t}`,e]);(function(e,t){let n=t.reduce((e,[,t])=>e+Math.ceil(t.size/4),0);if(n>e)throw Error(`interleave() requires ${n} vertex attributes, exceeding device limit ${e}`)})(n.device.limits.maxVertexAttributes,i),function(e,t){if(t.size>e)throw Error(`interleave() output size ${t.size} exceeds device inter-stage component limit ${e}`)}(n.device.limits.maxInterStageShaderVariables,t);let r=i.map(([e,t])=>`in TYPE ${e}[${t.size}]`).join(", "),s=0,u=i.map(([e,t])=>{let n=Array.from({length:t.size},(t,n)=>`  result[${s+n}] = ${e}[${n}];`).join("\n");return s+=t.size,n}).join("\n");return m({module:{name:"interleave",vs:`\
void interleave(${r}, out TYPE result[RESULT_LEN]) {
${u}
}
`},inputs:e,output:t,outputBuffer:n}),{success:!0}},T=`\
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
`,z=({inputs:e,output:t,target:n})=>(m({module:{name:"fround",vs:T},inputs:e,output:t,operationType:"uint32",outputBuffer:n}),{success:!0});function S(e,t,n){let i=function(e){switch(e){case"uint32":return"usampler2D";case"sint32":return"isampler2D";case"float32":return"sampler2D";default:throw Error(`Unsupported WebGL gather sampler type for ${e}`)}}(n),r=f(t,1),s=Array.from({length:e.size},(e,t)=>`  v[${t}] = ${r}(texelFetch(source_values_texture, ivec2(${t}, rowIndex), 0).r);`).join("\n");return{name:"source_values_texture",vs:`
uniform highp ${i} source_values_texture;
void read_source_values(int rowIndex, out TYPE v[${e.size}]) {
${s}
}
`}}function L(e,t,n){let i=n.createTexture({width:Math.max(e.size,1),height:e.length,format:function(e){switch(e){case"uint8":return"r8uint";case"sint8":return"r8sint";case"uint16":return"r16uint";case"sint16":return"r16sint";case"uint32":return"r32uint";case"sint32":return"r32sint";case"float32":return"r32float";default:throw Error(`Unsupported WebGL gather texture format for ${e}`)}}(t),usage:E.g.SAMPLE|E.g.COPY_DST});if(0===e.length)return i;let r=n.createCommandEncoder();return r.copyBufferToTexture({sourceBuffer:e.buffer,destinationTexture:i,byteOffset:e.offset,bytesPerRow:e.stride,rowsPerImage:e.length,size:[e.size,e.length,1]}),n.submit(r.finish()),i}let N=async({inputs:e,output:t,target:n})=>{var i,r,s;let a,o,l,{ids:p,sourceValues:m}=e,g=n.device,h=_("result",t.type,t.size),x=f(p.type,1),v=f(t.type,1),E=t.type,y=L(m,E,g),$=`\
#version 300 es

void main() {
  INDEX_TYPE ids[1];
  get_ids(ids);
  TYPE result[${t.size}];
  gather(ids, result);
  set_result(result);
}
  `,w=new u.p(g,{vs:$,defines:{INDEX_TYPE:x,TYPE:v,RESULT_LEN:t.size.toString(),SOURCE_VALUES_ROWS:m.length.toString()},modules:[(i=p,r=x,a=f(i.type,1),o="aids_0",i.type!==function(e){switch(e){case"uint":return"uint32";case"int":return"sint32";default:return"float32"}}(r)&&(o=`${r}(${o})`),{name:"ids",vs:`
in ${a} aids_0;
void get_ids(out INDEX_TYPE v[1]) {
  v[0] = ${o};
}
`}),S(m,t.type,E),(l=c(t.type),{name:"gather",vs:`
void zero_result(out TYPE result[RESULT_LEN]) {
  for (int i = 0; i < RESULT_LEN; i++) {
    result[i] = ${l};
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
`}),h],bindings:{source_values_texture:y},bufferLayout:[{name:"ids",stepMode:(s=p).isConstant?"vertex":"instance",byteStride:s.stride,attributes:[{attribute:"aids_0",format:d(s.type,1,s.normalized),byteOffset:s.offset}]}],vertexCount:1,instanceCount:t.length,feedbackBufferMode:"interleaved",outputs:h.varyings});try{return w.run({inputBuffers:{ids:p.buffer},outputBuffers:{[h.varyings[0]]:n}}),{success:!0}}finally{w.destroy(),y.destroy()}},P=`\
void row_dot(in TYPE x[X_LEN], in TYPE y[Y_LEN], out float result[1]) {
  float sum = 0.0;
  for (int i = 0; i < X_LEN; i++) {
    sum += float(x[i]) * float(y[i]);
  }
  result[0] = sum;
}
`,C=({inputs:e,output:t,target:n})=>(m({module:{name:"row_dot",vs:P},inputs:e,output:t,operationType:"float32",outputBuffer:n}),{success:!0}),I=`\
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
`,Y=({inputs:e,output:t,target:n})=>(m({module:{name:"equalAll",vs:I},inputs:e,output:t,operationType:"uint32"===t.type?e.x.type:t.type,outputBuffer:n}),{success:!0}),F=`\
void row_length(in TYPE x[X_LEN], out float result[1]) {
  float sum = 0.0;
  for (int i = 0; i < X_LEN; i++) {
    sum += float(x[i]) * float(x[i]);
  }
  result[0] = sqrt(sum);
}
`,k=({inputs:e,output:t,target:n})=>(m({module:{name:"row_length",vs:F},inputs:e,output:t,operationType:"float32",outputBuffer:n}),{success:!0}),R=async({inputs:e,output:t,target:n})=>{let{segments:i}=e,r=n.device,s=_("result",t.type,t.size),a=i.type,o=L(i,a,r),l=new u.p(r,{vs:`\
#version 300 es

void main() {
  TYPE result[RESULT_LEN];
  segmentedMap(result);
  set_result(result);
}
`,defines:{TYPE:"uint",RESULT_LEN:t.size.toString(),SEGMENTS_LENGTH:i.length.toString()},modules:[S(i,t.type,a),{name:"segmentedMap",vs:`
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
`},s],bindings:{source_values_texture:o},vertexCount:1,instanceCount:t.length,feedbackBufferMode:"interleaved",outputs:s.varyings});try{return l.run({outputBuffers:{[s.varyings[0]]:n}}),{success:!0}}finally{l.destroy(),o.destroy()}},A=async({inputs:e,output:t,target:n})=>{let i=c(f(t.type,1,t.normalized));return m({module:{name:"select",vs:""},inputs:e,output:t,operationType:t.type,outputBuffer:n,expression:t=>{let n=U("condition",e.condition,t,i),r=U("whenTrue",e.whenTrue,t,i),s=U("whenFalse",e.whenFalse,t,i);return`(${n} != ${i} ? ${r} : ${s})`}}),{success:!0}};function U(e,t,n,i){return n<t.size?`${e}[${n}]`:1===t.size?`${e}[0]`:i}let B=({inputs:e,output:t,target:n})=>{let i=_("result",t.type,t.size),r=new u.p(n.device,{vs:`\
#version 300 es

void main() {
  int result[1];
  result[0] = START + gl_InstanceID * STEP;
  set_result(result);
}
`,defines:{START:e.start.toString(),STEP:e.step.toString()},modules:[i],vertexCount:1,instanceCount:t.length,feedbackBufferMode:"interleaved",outputs:i.varyings});try{return r.run({outputBuffers:{[i.varyings[0]]:n}}),{success:!0}}finally{r.destroy()}},O=({inputs:e,output:t,target:n})=>{let{columns:i}=e;return m({module:{name:"swizzle",vs:"// swizzle expression handled inline"},expression:e=>`x[${i[e]}]`,inputs:{x:e.x},output:t,outputBuffer:n}),{success:!0}}},84765(e,t,n){n.d(t,{W:()=>i});function i(e,t){return!function e(t,{operations:n,inputs:i}){switch(t.kind){case"input":if(!(t.name in i))throw Error(`Unknown expression input '${t.name}'`);return;case"literal":if(Array.isArray(t.value)){for(let e of t.value)if(!Number.isFinite(e))throw Error(`Expression literal array must contain only finite values, got ${e}`)}else if(!Number.isFinite(t.value))throw Error(`Expression literal must be finite, got ${t.value}`);return;case"call":{let r=n[t.op];if(!r)throw Error(`Unknown expression op '${t.op}'`);if(t.args.length!==r.arity)throw Error(`Expression op '${t.op}' expects ${r.arity} args, got ${t.args.length}`);for(let r of t.args)e(r,{operations:n,inputs:i});return}default:throw Error(`Unsupported expression node ${t.kind}`)}}(e,t),function e(t,n){switch(t.kind){case"input":{let e=n.inputs[t.name];if(n.laneIndex<e.size)return n.formatInput(t.name);return n.formatOutOfBoundsInput(t.name)}case"literal":return n.formatLiteral(t.value);case"call":{let i=n.operations[t.op],r=t.args.map(t=>e(t,n));return n.formatCall(i.symbol,r)}default:throw Error(`Unsupported expression node ${t.kind}`)}}(e,t)}}}]);
//# sourceMappingURL=2671.5701617e.js.map