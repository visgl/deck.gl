import{c as k}from"./expression-Bl_GL2tO.js";import{be as f,bf as b,bg as m,ba as R,bb as M,bh as N,C as y,g as v,bi as O,b8 as S,am as F,bj as w,bk as z,bl as E}from"./deck-example-device-TQPRJnZ6.js";import{bm as Be}from"./deck-example-device-TQPRJnZ6.js";const G=`fn arithmetic_add(x: {TYPE}, y: {TYPE}) -> {TYPE} {
  return x + y;
}

fn arithmetic_subtract(x: {TYPE}, y: {TYPE}) -> {TYPE} {
  return x - y;
}

fn arithmetic_multiply(x: {TYPE}, y: {TYPE}) -> {TYPE} {
  return x * y;
}

fn arithmetic_divide(x: {TYPE}, y: {TYPE}) -> {TYPE} {
  return x / y;
}

fn arithmetic_tan(x: f32) -> f32 {
  return tan_fp32(x);
}
`,xe=({inputs:t,output:e,target:r})=>{const n=e.type,s=f(n),u=b(n),o=t.namedInputs;return m({module:{name:"arithmetic",source:G,dependencies:[R]},inputs:o,output:e,operationType:n,outputBuffer:r,expression:d=>k(t.expression,{operations:M,inputs:o,laneIndex:d,formatInput:a=>`${a}[${d}]`,formatOutOfBoundsInput:a=>o[a].size===1?`${a}[0]`:u,formatLiteral:a=>{const c=Array.isArray(a)?a[d]??0:a;return`${s}(${N(n,c)})`},formatCall:(a,c)=>`${a}(${c.join(", ")})`})}),{success:!0}},C=64,A="GPGPU Operation Counts",W="Computation Runs",pe=async({inputs:t,output:e,target:r})=>{const n=Math.ceil(e.byteLength/4),s=new y(r.device,{source:Y(t,e.length),shaderLayout:{bindings:[{name:"source",type:"storage",group:0,location:0},{name:"result",type:"storage",group:0,location:1}]}});if(s.setBindings({source:t.source.buffer,result:r}),n>0){const u=r.device.beginComputePass({});r.device.statsManager.getStats(A).get(W).incrementCount(),s.dispatch(u,Math.ceil(n/C)),u.end(),r.device.submit()}return s.destroy(),{success:!0}};function Y(t,e){const r=v(t.inputFormat),n=v(t.outputFormat),s=r.components,u=e*s,o=n.elementByteLength/n.components,d=4/o;return`@group(0) @binding(0) var<storage, read> source: array<u32>;
@group(0) @binding(1) var<storage, read_write> result: array<u32>;

fn readByte(byteIndex: u32) -> u32 {
  let word = source[byteIndex / 4u];
  return (word >> ((byteIndex % 4u) * 8u)) & 0xffu;
}

fn readUint16(byteIndex: u32) -> u32 {
  return readByte(byteIndex) | (readByte(byteIndex + 1u) << 8u);
}

fn readSourceValue(scalarIndex: u32) -> f32 {
  let rowIndex = scalarIndex / ${s}u;
  let componentIndex = scalarIndex % ${s}u;
  let byteIndex = ${t.source.offset}u + rowIndex * ${t.source.stride}u +
    componentIndex * ${r.elementByteLength/s}u;
  ${D(r.signedDataType,r.normalized)}
}

${j(t.outputFormat)}

@compute @workgroup_size(${C}) fn main(
  @builtin(global_invocation_id) id: vec3<u32>
) {
  let wordIndex = id.x;
  let firstScalarIndex = wordIndex * ${d}u;
  if (firstScalarIndex >= ${u}u) {
    return;
  }
  ${Z(n.signedDataType,o,u)}
}
`}function D(t,e){switch(t){case"float32":return"return bitcast<f32>(source[byteIndex / 4u]);";case"float16":return`let values = unpack2x16float(source[byteIndex / 4u]);
  return select(values.x, values.y, byteIndex % 4u == 2u);`;case"uint8":return e?"return f32(readByte(byteIndex)) / 255.0;":"return f32(readByte(byteIndex));";case"sint8":return e?"return max(f32(i32(readByte(byteIndex) << 24u) >> 24) / 127.0, -1.0);":"return f32(i32(readByte(byteIndex) << 24u) >> 24);";case"uint16":return e?"return f32(readUint16(byteIndex)) / 65535.0;":"return f32(readUint16(byteIndex));";case"sint16":return e?"return max(f32(i32(readUint16(byteIndex) << 16u) >> 16) / 32767.0, -1.0);":"return f32(i32(readUint16(byteIndex) << 16u) >> 16);";case"uint32":return e?"return f32(source[byteIndex / 4u]) / 4294967295.0;":"return f32(source[byteIndex / 4u]);";case"sint32":return e?"return max(f32(bitcast<i32>(source[byteIndex / 4u])) / 2147483647.0, -1.0);":"return f32(bitcast<i32>(source[byteIndex / 4u]));";default:throw new Error(`castData WebGPU input does not support ${t}`)}}function j(t){const e=v(t),{signedDataType:r,normalized:n}=e;if(r==="float32"||r==="float16")return"fn encodeValue(value: f32) -> f32 { return value; }";const s=q(r),u=r.startsWith("sint")?-s:0;return`fn encodeValue(value: f32) -> f32 { return ${n?`round(clamp(value, ${u<0?"-1.0":"0.0"}, 1.0) * ${s}.0)`:`round(clamp(value, ${u}.0, ${s}.0))`}; }`}function Z(t,e,r){if(e===4){const d="encodeValue(readSourceValue(firstScalarIndex))";return t==="float32"?`result[wordIndex] = bitcast<u32>(${d});`:t==="sint32"?`result[wordIndex] = bitcast<u32>(i32(${d}));`:`result[wordIndex] = u32(${d});`}if(e===2&&t==="float16")return`let second = select(0.0, readSourceValue(firstScalarIndex + 1u), firstScalarIndex + 1u < ${r}u);
  result[wordIndex] = pack2x16float(vec2<f32>(
    encodeValue(readSourceValue(firstScalarIndex)),
    encodeValue(second)
  ));`;const n=4/e,s=e*8,u=s===8?"0xffu":"0xffffu";return`result[wordIndex] = ${Array.from({length:n},(d,a)=>{const c=`firstScalarIndex + ${a}u`;return`(select(0u, (${t.startsWith("sint")?`bitcast<u32>(i32(encodeValue(readSourceValue(${c}))))`:`u32(encodeValue(readSourceValue(${c})))`}) & ${u}, ${c} < ${r}u) << ${a*s}u)`}).join(` |
    `)};`}function q(t){switch(t){case"sint8":return 127;case"uint8":return 255;case"sint16":return 32767;case"uint16":return 65535;case"sint32":return 2147483647;case"uint32":return 4294967295;default:throw new Error(`castData WebGPU output does not support ${t}`)}}const L=64,X="GPGPU Operation Counts",H="Computation Runs",ge=async({inputs:t,output:e,target:r})=>{const{source:n,inputFormat:s}=t,u=new y(r.device,{source:K(s,n.offset,n.stride,e.length),shaderLayout:{bindings:[{name:"source",type:"storage",group:0,location:0},{name:"result",type:"storage",group:0,location:1}]}});u.setBindings({source:n.buffer,result:r});const o=r.device.beginComputePass({});return r.device.statsManager.getStats(X).get(H).incrementCount(),u.dispatch(o,Math.ceil(e.length/L)),o.end(),r.device.submit(),u.destroy(),{success:!0}};function K(t,e,r,n){return`@group(0) @binding(0) var<storage, read> source: array<u32>;
@group(0) @binding(1) var<storage, read_write> result: array<u32>;

// Treat the storage binding as raw 32-bit words so one shader can address packed Uint8, Float16,
// and Float32 rows with arbitrary supported strides. The float readers decode IEEE bit patterns;
// they do not numerically convert integer values to floats.

fn readByte(byteIndex: u32) -> u32 {
  let word = source[byteIndex / 4u];
  let shift = (byteIndex % 4u) * 8u;
  return (word >> shift) & 0xffu;
}

fn readUint8(byteIndex: u32) -> f32 {
  return f32(readByte(byteIndex)) / 255.0;
}

fn readFloat16Bits(byteIndex: u32) -> f32 {
  let word = source[byteIndex / 4u];
  let values = unpack2x16float(word);
  return select(values.x, values.y, byteIndex % 4u == 2u);
}

fn readFloat32Bits(byteIndex: u32) -> f32 {
  return bitcast<f32>(source[byteIndex / 4u]);
}

fn readColor(rowIndex: u32) -> vec4<f32> {
  let rowByteOffset = ${e}u + rowIndex * ${r}u;
${J(t)}
}

@compute @workgroup_size(${L}) fn main(
  @builtin(global_invocation_id) id: vec3<u32>
) {
  let rowIndex = id.x;
  if (rowIndex >= ${n}u) {
    return;
  }

  result[rowIndex] = pack4x8unorm(readColor(rowIndex));
}
`}function J(t){switch(t){case"uint8x3":return`  return vec4<f32>(
    readUint8(rowByteOffset),
    readUint8(rowByteOffset + 1u),
    readUint8(rowByteOffset + 2u),
    1.0
  );`;case"uint8x4":return`  return vec4<f32>(
    readUint8(rowByteOffset),
    readUint8(rowByteOffset + 1u),
    readUint8(rowByteOffset + 2u),
    readUint8(rowByteOffset + 3u)
  );`;case"float16x3":return`  return vec4<f32>(
    readFloat16Bits(rowByteOffset),
    readFloat16Bits(rowByteOffset + 2u),
    readFloat16Bits(rowByteOffset + 4u),
    1.0
  );`;case"float16x4":return`  return vec4<f32>(
    readFloat16Bits(rowByteOffset),
    readFloat16Bits(rowByteOffset + 2u),
    readFloat16Bits(rowByteOffset + 4u),
    readFloat16Bits(rowByteOffset + 6u)
  );`;case"float32x3":return`  return vec4<f32>(
    readFloat32Bits(rowByteOffset),
    readFloat32Bits(rowByteOffset + 4u),
    readFloat32Bits(rowByteOffset + 8u),
    1.0
  );`;case"float32x4":return`  return vec4<f32>(
    readFloat32Bits(rowByteOffset),
    readFloat32Bits(rowByteOffset + 4u),
    readFloat32Bits(rowByteOffset + 8u),
    readFloat32Bits(rowByteOffset + 12u)
  );`;default:{const e=t;throw new Error(`Unsupported color input format ${e}`)}}}const Q=`fn row_dot(x: array<{TYPE}, {X_LEN}>, y: array<{TYPE}, {Y_LEN}>) -> array<f32, 1> {
  var sum = 0.0;
  for (var i = 0u; i < {X_LEN}u; i = i + 1u) {
    sum += f32(x[i]) * f32(y[i]);
  }
  return array<f32, 1>(sum);
}
`,me=({inputs:t,output:e,target:r})=>(m({module:{name:"row_dot",source:Q},inputs:t,output:e,operationType:"float32",outputBuffer:r}),{success:!0}),ee=`fn equalAll(x: array<{TYPE}, {X_LEN}>, y: array<{TYPE}, {Y_LEN}>) -> array<u32, 1> {
  var allEqual = 1u;
  for (var i = 0u; i < {X_LEN}u; i = i + 1u) {
    if (x[i] != y[i]) {
      allEqual = 0u;
      break;
    }
  }
  return array<u32, 1>(allEqual);
}
`,ye=({inputs:t,output:e,target:r})=>(m({module:{name:"equalAll",source:ee},inputs:t,output:e,operationType:t.x.type,outputBuffer:r}),{success:!0}),x=64;function _(t,e,r){const n=f(e.type);return`@group(0) @binding(${r}) var<storage, read> ${t}: array<${n}>;`}function U(t,e,r,n=t){const s=f(r);if(e.isConstant){const c=e.value;if(!c)throw new Error(`Constant input ${e} is missing CPU values`);return`fn read_${n}(_sourceIndex: u32) -> array<${s}, ${e.size}> {
  return array<${s}, ${e.size}>(${Array.from({length:e.size},(i,l)=>O(s,c[l]??0)).join(", ")});
}`}const u=e.stride/e.ValueType.BYTES_PER_ELEMENT,o=e.offset/e.ValueType.BYTES_PER_ELEMENT,a=f(e.type)===s?"":`${s}`;return`fn read_${n}(sourceIndex: u32) -> array<${s}, ${e.size}> {
  var value: array<${s}, ${e.size}>;
  let rowOffset = ${o}u + sourceIndex * ${u}u;
${Array.from({length:e.size},(c,i)=>a?`  value[${i}] = ${a}(${t}[rowOffset + ${i}u]);`:`  value[${i}] = ${t}[rowOffset + ${i}u];`).join(`
`)}
  return value;
}`}function V(t,e){return U("sourceValues",t,e,"source_values")}function P(t,e){const r=f(t.type);return`@group(0) @binding(${e}) var<storage, read_write> result: array<${r}>;`}function T(t){const e=t.stride/t.ValueType.BYTES_PER_ELEMENT,r=t.offset/t.ValueType.BYTES_PER_ELEMENT;return`fn write_result(rowIndex: u32, value: array<${f(t.type)}, ${t.size}>) {
  let rowOffset = ${r}u + rowIndex * ${e}u;
${Array.from({length:t.size},(s,u)=>`  result[rowOffset + ${u}u] = value[${u}];`).join(`
`)}
}`}function te(t,e){const r=b(t);return`fn zero_result() -> array<${f(t)}, ${e}> {
  var result: array<${f(t)}, ${e}>;
${Array.from({length:e},(n,s)=>`  result[${s}] = ${r};`).join(`
`)}
  return result;
}`}const he=({inputs:t,output:e,target:r})=>{const{sourceValues:n}=t;if(n.length===0){const a=new e.ValueType(e.length*e.size);return r.write(a),{success:!0,value:a}}if(n.isConstant){const a=n.value;if(!a)throw new Error(`Constant input ${n} is missing CPU values`);const c=new e.ValueType(e.length*e.size);for(let i=0;i<e.length;i++){const l=a[i];c[i*2]=l,c[i*2+1]=l}return r.write(c),{success:!0,value:c}}const s=[];let u=n,o="raw",d=n.length;try{for(;;){const a=Math.ceil(d/x),c=e.length*a,i=a===1?r:S.createOrReuse(r.device,c*e.stride);if(a>1&&s.push(i),re({input:u,inputMode:o,inputGroupCount:d,channelCount:e.length,outputType:e.type,outputBuffer:i,outputLength:c,outputStride:e.stride,outputOffset:e.offset}),a===1)break;u=new F({buffer:i,type:e.type,size:2,length:c}),o="partial",d=a}return{success:!0}}finally{for(const a of s)S.recycle(a)}};function re({input:t,inputMode:e,inputGroupCount:r,channelCount:n,outputType:s,outputBuffer:u,outputLength:o,outputStride:d,outputOffset:a}){const c=f(s),i=w(o,u.device.limits.maxComputeWorkgroupsPerDimension),l=new F({buffer:u,type:s,size:2,length:o,stride:d,offset:a}),p=`
${t.isConstant?"":_("sourceValues",t,0)}
${V(t,s)}
${P(l,t.isConstant?0:1)}
${T(l)}
${ne(e,s,n,r)}

var<workgroup> sharedMin: array<${c}, ${x}>;
var<workgroup> sharedMax: array<${c}, ${x}>;

@compute @workgroup_size(${x}) fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_id) localId: vec3<u32>
) {
  let outputRowIndex = ${z(i)};
  if (outputRowIndex >= ${o}u) {
    return;
  }

  let channelIndex = outputRowIndex % ${n}u;
  let outputGroupIndex = outputRowIndex / ${n}u;
  let inputGroupIndex = outputGroupIndex * ${x}u + localId.x;

  let result = extent_pass(channelIndex, inputGroupIndex);
  sharedMin[localId.x] = result[0];
  sharedMax[localId.x] = result[1];
  workgroupBarrier();

  var stride = ${Math.floor(x/2)}u;
  loop {
    if (stride == 0u) {
      break;
    }
    if (localId.x < stride) {
      let compareIndex = localId.x + stride;
      if (sharedMin[compareIndex] < sharedMin[localId.x]) {
        sharedMin[localId.x] = sharedMin[compareIndex];
      }
      if (sharedMax[compareIndex] > sharedMax[localId.x]) {
        sharedMax[localId.x] = sharedMax[compareIndex];
      }
    }
    workgroupBarrier();
    stride = stride / 2u;
  }

  if (localId.x == 0u) {
    write_result(outputRowIndex, array<${c}, 2>(sharedMin[0], sharedMax[0]));
  }
}
`,g=new y(u.device,{source:p,shaderLayout:{bindings:[...t.isConstant?[]:[{name:"sourceValues",type:"storage",group:0,location:0}],{name:"result",type:"storage",group:0,location:t.isConstant?0:1}]}}),h={result:u};t.isConstant||(h.sourceValues=t.buffer),g.setBindings(h);const B=u.device.beginComputePass({});g.dispatch(B,i.x,i.y,i.z),B.end(),u.device.submit(),g.destroy()}function ne(t,e,r,n){const s=f(e),[u,o]=se(e);return t==="raw"?`fn extent_pass(channelIndex: u32, inputGroupIndex: u32) -> array<${s}, 2> {
  var result: array<${s}, 2>;
  result[0] = ${u};
  result[1] = ${o};

  if (inputGroupIndex < ${n}u) {
    let value = read_source_values(inputGroupIndex);
    result[0] = value[channelIndex];
    result[1] = value[channelIndex];
  }

  return result;
}`:`fn extent_pass(channelIndex: u32, inputGroupIndex: u32) -> array<${s}, 2> {
  var result: array<${s}, 2>;
  result[0] = ${u};
  result[1] = ${o};

  if (inputGroupIndex < ${n}u) {
    let rowIndex = inputGroupIndex * ${r}u + channelIndex;
    let value = read_source_values(rowIndex);
    result[0] = value[0];
    result[1] = value[1];
  }

  return result;
}`}function se(t){switch(t){case"uint32":return["0xffffffffu","0u"];case"sint32":return["2147483647","-2147483648"];case"float32":return["3.402823e38","-3.402823e38"];default:throw new Error(`Unsupported WebGPU extent type for ${t}`)}}function ue(){const t=new Uint16Array([255]);return new Uint8Array(t.buffer)[0]>0}const oe=`const LE: bool = ${ue()?"true":"false"};
const F32_NAN: u32 = 0xffffffffu;
const F32_INF: u32 = 0x7f800000u;

fn roundShiftRight(value: u32, shift: i32) -> u32 {
  if (shift <= 0) {
    return value << u32(-shift);
  }

  if (shift >= 32) {
    if (shift == 32 && value > 0x80000000u) {
      return 1u;
    }
    return 0u;
  }

  let shiftU32 = u32(shift);
  let truncated = value >> shiftU32;
  let halfShift = 1u << u32(shift - 1);
  let remainder = value & ((1u << shiftU32) - 1u);
  if (remainder > halfShift || (remainder == halfShift && (truncated & 1u) == 1u)) {
    return truncated + 1u;
  }
  return truncated;
}

fn makeFloatImmediate(sign: u32, exponent: i32, mantissa: u32) -> u32 {
  return (sign << 31u) | (u32(exponent + 127) << 23u) | (mantissa & 0x7fffffu);
}

fn makeFloat(sign: u32, exponent: i32, significand: u32) -> u32 {
  if (significand == 0u) {
    return sign << 31u;
  }

  let leadingZeros = i32(countLeadingZeros(significand));
  var normalizedExponent = exponent + 31 - leadingZeros;

  if (normalizedExponent > 127) {
    return (sign << 31u) | F32_INF;
  }

  var mantissa: u32;
  if (normalizedExponent >= -126) {
    mantissa = roundShiftRight(significand, 8 - leadingZeros);
    if (mantissa >= 0x1000000u) {
      mantissa = mantissa >> 1u;
      normalizedExponent += 1;
      if (normalizedExponent > 127) {
        return (sign << 31u) | F32_INF;
      }
    }
    return makeFloatImmediate(sign, normalizedExponent, mantissa);
  }

  let subnormalShift = -149 - exponent;
  mantissa = roundShiftRight(significand, subnormalShift);
  if (mantissa >= 0x800000u) {
    return (sign << 31u) | (1u << 23u);
  }
  return (sign << 31u) | mantissa;
}

fn parseAsDouble(words: vec2<u32>) -> vec2<u32> {
  var d = words;
  if (LE) {
    d = d.yx;
  }

  let sign = (d.x >> 31u) & 1u;
  let exponentBits = (d.x >> 20u) & 0x7ffu;
  let exponent = i32(exponentBits) - 1023;
  let fractionHigh = d.x & 0xfffffu;
  let fractionLow = d.y;

  if (exponentBits == 0x7ffu) {
    if (fractionHigh == 0u && fractionLow == 0u) {
      return vec2<u32>((sign << 31u) | F32_INF, F32_NAN);
    }
    return vec2<u32>(F32_NAN);
  }

  if (exponentBits == 0u) {
    return vec2<u32>(sign << 31u);
  }

  if (exponent > 127) {
    return vec2<u32>((sign << 31u) | F32_INF, ((1u - sign) << 31u) | F32_INF);
  }

  let highSignificand = 0x800000u | (fractionHigh << 3u) | (fractionLow >> 29u);
  let lowSignificand = fractionLow & 0x1fffffffu;

  if (exponent < -126) {
    let highPart = makeFloat(sign, exponent - 23, highSignificand);
    let lowPart = makeFloat(sign, exponent - 52, lowSignificand);
    return vec2<u32>(highPart, lowPart);
  }

  let roundUp = lowSignificand > 0x10000000u ||
    (lowSignificand == 0x10000000u && (highSignificand & 1u) == 1u);

  var roundedSignificand = highSignificand + select(0u, 1u, roundUp);
  var highExponent = exponent;
  if (roundedSignificand == 0x1000000u) {
    roundedSignificand = 0x800000u;
    highExponent += 1;
  }

  if (highExponent > 127) {
    return vec2<u32>((sign << 31u) | F32_INF, ((1u - sign) << 31u) | F32_INF);
  }

  let highPart = makeFloatImmediate(sign, highExponent, roundedSignificand);

  var remainder = i32(lowSignificand);
  var lowSign = sign;
  if (roundUp) {
    remainder -= 0x20000000;
  }
  if (remainder < 0) {
    lowSign = 1u - sign;
    remainder = -remainder;
  }

  let lowPart = makeFloat(lowSign, exponent - 52, u32(remainder));
  return vec2<u32>(highPart, lowPart);
}

fn fround(x: array<u32, {X_LEN}>) -> array<f32, {RESULT_LEN}> {
  var result: array<f32, {RESULT_LEN}>;
  let n = {X_LEN}u / 2u;
  for (var i = 0u; i < n; i = i + 1u) {
    let parts = parseAsDouble(vec2<u32>(x[i * 2u], x[i * 2u + 1u]));
    result[i] = bitcast<f32>(parts.x);
    result[i + n] = bitcast<f32>(parts.y);
  }
  return result;
}
`,we=({inputs:t,output:e,target:r})=>(m({module:{name:"fround",source:oe},inputs:t,output:e,operationType:"uint32",outputBuffer:r}),{success:!0}),Ie=async({inputs:t,output:e,target:r})=>{const{ids:n,sourceValues:s}=t,u=f(n.type),o=[];n.isConstant||o.push({name:"ids",input:n,index:o.length}),s.isConstant||o.push({name:"sourceValues",input:s,index:o.length});const d=w(Math.ceil(e.length/x),r.device.limits.maxComputeWorkgroupsPerDimension),a=`
${o.map(({name:p,input:g,index:h})=>_(p,g,h)).join(`
`)}
${ae(n,u)}
${V(s,e.type)}
${P(e,o.length)}
${T(e)}
${te(e.type,e.size)}
${ie(n.type,e.type,e.size,s.length)}

@compute @workgroup_size(${x}) fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_id) localId: vec3<u32>
) {
  let rowIndex = ${E(d,x)};
  if (rowIndex >= ${e.length}u) {
    return;
  }

  let idsValue = read_ids(rowIndex);
  let result = gather(idsValue);
  write_result(rowIndex, result);
}
`,c=new y(r.device,{source:a,shaderLayout:{bindings:[...o.map(({name:p,index:g})=>({name:p,type:"storage",group:0,location:g})),{name:"result",type:"storage",group:0,location:o.length}]}}),i={};n.isConstant||(i.ids=n.buffer),s.isConstant||(i.sourceValues=s.buffer),i.result=r,c.setBindings(i);const l=r.device.beginComputePass({});return c.dispatch(l,d.x,d.y,d.z),l.end(),r.device.submit(),c.destroy(),{success:!0}};function ae(t,e){if(t.isConstant){const s=t.value;if(!s)throw new Error(`Constant input ${t} is missing CPU values`);return`fn read_ids(_rowIndex: u32) -> ${e} {
  return ${O(e,s[0]??0)};
}`}const r=t.stride/t.ValueType.BYTES_PER_ELEMENT,n=t.offset/t.ValueType.BYTES_PER_ELEMENT;return`fn read_ids(rowIndex: u32) -> ${e} {
  let rowOffset = ${n}u + rowIndex * ${r}u;
  return ids[rowOffset];
}`}function ie(t,e,r,n){const s=f(t),u=f(e);return`fn gather(idsValue: ${s}) -> array<${u}, ${r}> {
  let sourceIndex = ${s==="u32"?"i32(idsValue)":s==="i32"?"idsValue":"i32(idsValue)"};
  if (sourceIndex < 0 || sourceIndex >= ${n}) {
    return zero_result();
  }
  return read_source_values(u32(sourceIndex));
}`}const $e=async({inputs:t,output:e,target:r})=>{const{segments:n}=t,s=n.isConstant?[]:[{name:"segments",input:n,index:0}],u=w(Math.ceil(e.length/x),r.device.limits.maxComputeWorkgroupsPerDimension),o=`
${s.map(({name:i,input:l,index:p})=>_(i,l,p)).join(`
`)}
${U("segments",n,"uint32")}
${P(e,s.length)}
${T(e)}
${ce(n.length)}

@compute @workgroup_size(${x}) fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_id) localId: vec3<u32>
) {
  let rowIndex = ${E(u,x)};
  if (rowIndex >= ${e.length}u) {
    return;
  }

  let result = segmented_map(rowIndex);
  write_result(rowIndex, result);
}
`,d=new y(r.device,{source:o,shaderLayout:{bindings:[...s.map(({name:i,index:l})=>({name:i,type:"storage",group:0,location:l})),{name:"result",type:"storage",group:0,location:s.length}]}}),a=Object.fromEntries(s.map(({name:i,input:l})=>[i,l.buffer]));a.result=r,d.setBindings(a);const c=r.device.beginComputePass({});return d.dispatch(c,u.x,u.y,u.z),c.end(),r.device.submit(),d.destroy(),{success:!0}};function ce(t){return`fn segmented_map(vertexIndex: u32) -> array<u32, 2> {
  var low = 0i;
  var high = ${t}i;
  while (low < high) {
    let mid = low + (high - low) / 2i;
    let midStart = read_segments(u32(mid))[0];
    if (midStart <= vertexIndex) {
      low = mid + 1i;
    } else {
      high = mid;
    }
  }

  let segmentIndex = u32(max(low - 1i, 0i));
  let segmentStart = read_segments(segmentIndex)[0];
  return array<u32, 2>(segmentIndex, vertexIndex - segmentStart);
}`}const de=`fn row_length(x: array<{TYPE}, {X_LEN}>) -> array<f32, 1> {
  var sum = 0.0;
  for (var i = 0u; i < {X_LEN}u; i = i + 1u) {
    sum += f32(x[i]) * f32(x[i]);
  }
  return array<f32, 1>(sqrt(sum));
}
`,ve=({inputs:t,output:e,target:r})=>(m({module:{name:"row_length",source:de},inputs:t,output:e,operationType:"float32",outputBuffer:r}),{success:!0}),be=async({inputs:t,output:e,target:r})=>{const n=b(e.type);return m({module:{name:"select",source:`// inline expression select
`},inputs:t,output:e,operationType:e.type,outputBuffer:r,expression:s=>{const u=I("condition",t.condition,s,n),o=I("whenTrue",t.whenTrue,s,n);return`select(${I("whenFalse",t.whenFalse,s,n)}, ${o}, ${u} != ${n})`}}),{success:!0}};function I(t,e,r,n){return r<e.size?`${t}[${r}]`:e.size===1?`${t}[0]`:n}const $=64,Ee=({inputs:t,output:e,target:r})=>{const n=w(Math.ceil(e.length/$),r.device.limits.maxComputeWorkgroupsPerDimension),s=`@group(0) @binding(0) var<storage, read_write> result: array<i32>;

@compute @workgroup_size(${$}) fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_id) localId: vec3<u32>
) {
  let rowIndex = ${E(n,$)};
  if (rowIndex >= ${e.length}u) {
    return;
  }

  let rowOffset = ${e.offset/e.ValueType.BYTES_PER_ELEMENT}u + rowIndex * ${e.stride/e.ValueType.BYTES_PER_ELEMENT}u;
  result[rowOffset] = ${t.start} + i32(rowIndex) * ${t.step};
}
`,u=new y(r.device,{source:s,shaderLayout:{bindings:[{name:"result",type:"storage",group:0,location:0}]}});u.setBindings({result:r});const o=r.device.beginComputePass({});return u.dispatch(o,n.x,n.y,n.z),o.end(),r.device.submit(),u.destroy(),{success:!0}},_e=({inputs:t,output:e,target:r})=>{const{columns:n}=t;return m({module:{name:"swizzle",source:"// swizzle expression handled inline"},expression:s=>`x[${n[s]}]`,inputs:{x:t.x},output:e,outputBuffer:r}),{success:!0}};export{xe as arithmetic,pe as castData,ge as convertColors,me as dot,ye as equalAll,he as extent,we as fround,Ie as gather,Be as interleave,ve as length,$e as segmentedMap,be as select,Ee as sequence,_e as swizzle};
