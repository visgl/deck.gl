import{c as z}from"./expression-Bl_GL2tO.js";import{bz as f,bA as E,bB as y,bv as R,bw as G,bC as M,K as w,b,bD as F,bu as O,an as C,bE as h,bF as N,bG as _}from"./deck-example-device-BTMeXgno.js";import{bH as Be}from"./deck-example-device-BTMeXgno.js";const A=`fn arithmetic_add(x: {TYPE}, y: {TYPE}) -> {TYPE} {
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
`,W=({inputs:t,output:e,target:r,scope:s})=>{const n=e.type,u=f(n),o=E(n),l=t.namedInputs;return y({scope:s,module:{name:"arithmetic",source:A,dependencies:[R]},inputs:l,output:e,operationType:n,outputBuffer:r,expression:i=>z(t.expression,{operations:G,inputs:l,laneIndex:i,formatInput:a=>`${a}[${i}]`,formatOutOfBoundsInput:a=>l[a].size===1?`${a}[0]`:o,formatLiteral:a=>{const c=Array.isArray(a)?a[i]??0:a;return`${u}(${M(n,c)})`},formatCall:(a,c)=>`${a}(${c.join(", ")})`})}),{success:!0}};W.supportsEvaluationScope=!0;const k=64,Y="GPGPU Operation Counts",D="Computation Runs",ve=async({inputs:t,output:e,target:r})=>{const s=Math.ceil(e.byteLength/4),n=new w(r.device,{source:Z(t,e.length),shaderLayout:{bindings:[{name:"source",type:"storage",group:0,location:0},{name:"result",type:"storage",group:0,location:1}]}}),u={source:t.source.buffer,result:r};if(s>0){const o=r.device.beginComputePass({});r.device.statsManager.getStats(Y).get(D).incrementCount(),n.dispatch(o,{bindings:u,x:Math.ceil(s/k)}),o.end(),r.device.submit()}return n.destroy(),{success:!0}};function Z(t,e){const r=b(t.inputFormat),s=b(t.outputFormat),n=r.components,u=e*n,o=s.elementByteLength/s.components,l=4/o;return`@group(0) @binding(0) var<storage, read> source: array<u32>;
@group(0) @binding(1) var<storage, read_write> result: array<u32>;

fn readByte(byteIndex: u32) -> u32 {
  let word = source[byteIndex / 4u];
  return (word >> ((byteIndex % 4u) * 8u)) & 0xffu;
}

fn readUint16(byteIndex: u32) -> u32 {
  return readByte(byteIndex) | (readByte(byteIndex + 1u) << 8u);
}

fn readSourceValue(scalarIndex: u32) -> f32 {
  let rowIndex = scalarIndex / ${n}u;
  let componentIndex = scalarIndex % ${n}u;
  let byteIndex = ${t.source.offset}u + rowIndex * ${t.source.stride}u +
    componentIndex * ${r.elementByteLength/n}u;
  ${j(r.signedDataType,r.normalized)}
}

${q(t.outputFormat)}

@compute @workgroup_size(${k}) fn main(
  @builtin(global_invocation_id) id: vec3<u32>
) {
  let wordIndex = id.x;
  let firstScalarIndex = wordIndex * ${l}u;
  if (firstScalarIndex >= ${u}u) {
    return;
  }
  ${X(s.signedDataType,o,u)}
}
`}function j(t,e){switch(t){case"float32":return"return bitcast<f32>(source[byteIndex / 4u]);";case"float16":return`let values = unpack2x16float(source[byteIndex / 4u]);
  return select(values.x, values.y, byteIndex % 4u == 2u);`;case"uint8":return e?"return f32(readByte(byteIndex)) / 255.0;":"return f32(readByte(byteIndex));";case"sint8":return e?"return max(f32(i32(readByte(byteIndex) << 24u) >> 24) / 127.0, -1.0);":"return f32(i32(readByte(byteIndex) << 24u) >> 24);";case"uint16":return e?"return f32(readUint16(byteIndex)) / 65535.0;":"return f32(readUint16(byteIndex));";case"sint16":return e?"return max(f32(i32(readUint16(byteIndex) << 16u) >> 16) / 32767.0, -1.0);":"return f32(i32(readUint16(byteIndex) << 16u) >> 16);";case"uint32":return e?"return f32(source[byteIndex / 4u]) / 4294967295.0;":"return f32(source[byteIndex / 4u]);";case"sint32":return e?"return max(f32(bitcast<i32>(source[byteIndex / 4u])) / 2147483647.0, -1.0);":"return f32(bitcast<i32>(source[byteIndex / 4u]));";default:throw new Error(`castData WebGPU input does not support ${t}`)}}function q(t){const e=b(t),{signedDataType:r,normalized:s}=e;if(r==="float32"||r==="float16")return"fn encodeValue(value: f32) -> f32 { return value; }";const n=K(r),u=r.startsWith("sint")?-n:0;return`fn encodeValue(value: f32) -> f32 { return ${s?`round(clamp(value, ${u<0?"-1.0":"0.0"}, 1.0) * ${n}.0)`:`round(clamp(value, ${u}.0, ${n}.0))`}; }`}function X(t,e,r){if(e===4){const l="encodeValue(readSourceValue(firstScalarIndex))";return t==="float32"?`result[wordIndex] = bitcast<u32>(${l});`:t==="sint32"?`result[wordIndex] = bitcast<u32>(i32(${l}));`:`result[wordIndex] = u32(${l});`}if(e===2&&t==="float16")return`let second = select(0.0, readSourceValue(firstScalarIndex + 1u), firstScalarIndex + 1u < ${r}u);
  result[wordIndex] = pack2x16float(vec2<f32>(
    encodeValue(readSourceValue(firstScalarIndex)),
    encodeValue(second)
  ));`;const s=4/e,n=e*8,u=n===8?"0xffu":"0xffffu";return`result[wordIndex] = ${Array.from({length:s},(l,i)=>{const a=`firstScalarIndex + ${i}u`;return`(select(0u, (${t.startsWith("sint")?`bitcast<u32>(i32(encodeValue(readSourceValue(${a}))))`:`u32(encodeValue(readSourceValue(${a})))`}) & ${u}, ${a} < ${r}u) << ${i*n}u)`}).join(` |
    `)};`}function K(t){switch(t){case"sint8":return 127;case"uint8":return 255;case"sint16":return 32767;case"uint16":return 65535;case"sint32":return 2147483647;case"uint32":return 4294967295;default:throw new Error(`castData WebGPU output does not support ${t}`)}}const L=64,H="GPGPU Operation Counts",J="Computation Runs",Q=async({inputs:t,output:e,target:r,scope:s})=>{const{source:n,inputFormat:u}=t;if(e.length===0)return{success:!0};const o=new w(r.device,{source:ee(u,n.offset,n.stride,e.length,t.outputFormat),shaderLayout:{bindings:[{name:"source",type:"storage",group:0,location:0},{name:"result",type:"storage",group:0,location:1}]}}),l={source:n.buffer,result:r};s&&s.retain(()=>o.destroy());try{const i=s?s.commandEncoder.beginComputePass({}):r.device.beginComputePass({});try{r.device.statsManager.getStats(H).get(J).incrementCount(),o.dispatch(i,{bindings:l,x:Math.ceil(e.length/L)})}finally{i.end()}s||r.device.submit()}finally{s||o.destroy()}return{success:!0}};Q.supportsEvaluationScope=!0;function ee(t,e,r,s,n){return`@group(0) @binding(0) var<storage, read> source: array<u32>;
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
${te(t)}
}

@compute @workgroup_size(${L}) fn main(
  @builtin(global_invocation_id) id: vec3<u32>
) {
  let rowIndex = id.x;
  if (rowIndex >= ${s}u) {
    return;
  }

  let color = readColor(rowIndex);
${n==="unorm8x4"?"  result[rowIndex] = pack4x8unorm(color);":n==="float16x4"?`  result[rowIndex * 2u] = pack2x16float(color.xy);
  result[rowIndex * 2u + 1u] = pack2x16float(color.zw);`:`  result[rowIndex * 4u] = bitcast<u32>(color.x);
  result[rowIndex * 4u + 1u] = bitcast<u32>(color.y);
  result[rowIndex * 4u + 2u] = bitcast<u32>(color.z);
  result[rowIndex * 4u + 3u] = bitcast<u32>(color.w);`}
}
`}function te(t){switch(t){case"uint8x3":return`  return vec4<f32>(
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
  );`;default:{const e=t;throw new Error(`Unsupported color input format ${e}`)}}}const re=`fn row_dot(x: array<{TYPE}, {X_LEN}>, y: array<{TYPE}, {Y_LEN}>) -> array<f32, 1> {
  var sum = 0.0;
  for (var i = 0u; i < {X_LEN}u; i = i + 1u) {
    sum += f32(x[i]) * f32(y[i]);
  }
  return array<f32, 1>(sum);
}
`,ne=({inputs:t,output:e,target:r,scope:s})=>(y({scope:s,module:{name:"row_dot",source:re},inputs:t,output:e,operationType:"float32",outputBuffer:r}),{success:!0});ne.supportsEvaluationScope=!0;const se=`fn equalAll(x: array<{TYPE}, {X_LEN}>, y: array<{TYPE}, {Y_LEN}>) -> array<u32, 1> {
  var allEqual = 1u;
  for (var i = 0u; i < {X_LEN}u; i = i + 1u) {
    if (x[i] != y[i]) {
      allEqual = 0u;
      break;
    }
  }
  return array<u32, 1>(allEqual);
}
`,ue=({inputs:t,output:e,target:r,scope:s})=>(y({scope:s,module:{name:"equalAll",source:se},inputs:t,output:e,operationType:t.x.type,outputBuffer:r}),{success:!0});ue.supportsEvaluationScope=!0;const x=64;function S(t,e,r){const s=f(e.type);return`@group(0) @binding(${r}) var<storage, read> ${t}: array<${s}>;`}function U(t,e,r,s=t){const n=f(r);if(e.isConstant){const a=e.value;if(!a)throw new Error(`Constant input ${e} is missing CPU values`);return`fn read_${s}(_sourceIndex: u32) -> array<${n}, ${e.size}> {
  return array<${n}, ${e.size}>(${Array.from({length:e.size},(c,d)=>F(n,a[d]??0)).join(", ")});
}`}const u=e.stride/e.ValueType.BYTES_PER_ELEMENT,o=e.offset/e.ValueType.BYTES_PER_ELEMENT,i=f(e.type)===n?"":`${n}`;return`fn read_${s}(sourceIndex: u32) -> array<${n}, ${e.size}> {
  var value: array<${n}, ${e.size}>;
  let rowOffset = ${o}u + sourceIndex * ${u}u;
${Array.from({length:e.size},(a,c)=>i?`  value[${c}] = ${i}(${t}[rowOffset + ${c}u]);`:`  value[${c}] = ${t}[rowOffset + ${c}u];`).join(`
`)}
  return value;
}`}function V(t,e){return U("sourceValues",t,e,"source_values")}function P(t,e){const r=f(t.type);return`@group(0) @binding(${e}) var<storage, read_write> result: array<${r}>;`}function T(t){const e=t.stride/t.ValueType.BYTES_PER_ELEMENT,r=t.offset/t.ValueType.BYTES_PER_ELEMENT;return`fn write_result(rowIndex: u32, value: array<${f(t.type)}, ${t.size}>) {
  let rowOffset = ${r}u + rowIndex * ${e}u;
${Array.from({length:t.size},(n,u)=>`  result[rowOffset + ${u}u] = value[${u}];`).join(`
`)}
}`}function oe(t,e){const r=E(t);return`fn zero_result() -> array<${f(t)}, ${e}> {
  var result: array<${f(t)}, ${e}>;
${Array.from({length:e},(s,n)=>`  result[${n}] = ${r};`).join(`
`)}
  return result;
}`}const be=({inputs:t,output:e,target:r})=>{const{sourceValues:s}=t;if(s.length===0){const i=new e.ValueType(e.length*e.size);return r.write(i),{success:!0,value:i}}if(s.isConstant){const i=s.value;if(!i)throw new Error(`Constant input ${s} is missing CPU values`);const a=new e.ValueType(e.length*e.size);for(let c=0;c<e.length;c++){const d=i[c];a[c*2]=d,a[c*2+1]=d}return r.write(a),{success:!0,value:a}}const n=[];let u=s,o="raw",l=s.length;try{for(;;){const i=Math.ceil(l/x),a=e.length*i,c=i===1?r:O.createOrReuse(r.device,a*e.stride);if(i>1&&n.push(c),ae({input:u,inputMode:o,inputGroupCount:l,channelCount:e.length,outputType:e.type,outputBuffer:c,outputLength:a,outputStride:e.stride,outputOffset:e.offset}),i===1)break;u=new C({buffer:c,type:e.type,size:2,length:a}),o="partial",l=i}return{success:!0}}finally{for(const i of n)O.recycle(i)}};function ae({input:t,inputMode:e,inputGroupCount:r,channelCount:s,outputType:n,outputBuffer:u,outputLength:o,outputStride:l,outputOffset:i}){const a=f(n),c=h(o,u.device.limits.maxComputeWorkgroupsPerDimension),d=new C({buffer:u,type:n,size:2,length:o,stride:l,offset:i}),p=`
${t.isConstant?"":S("sourceValues",t,0)}
${V(t,n)}
${P(d,t.isConstant?0:1)}
${T(d)}
${ie(e,n,s,r)}

var<workgroup> sharedMin: array<${a}, ${x}>;
var<workgroup> sharedMax: array<${a}, ${x}>;

@compute @workgroup_size(${x}) fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_id) localId: vec3<u32>
) {
  let outputRowIndex = ${N(c)};
  if (outputRowIndex >= ${o}u) {
    return;
  }

  let channelIndex = outputRowIndex % ${s}u;
  let outputGroupIndex = outputRowIndex / ${s}u;
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
    write_result(outputRowIndex, array<${a}, 2>(sharedMin[0], sharedMax[0]));
  }
}
`,g=new w(u.device,{source:p,shaderLayout:{bindings:[...t.isConstant?[]:[{name:"sourceValues",type:"storage",group:0,location:0}],{name:"result",type:"storage",group:0,location:t.isConstant?0:1}]}}),m={result:u};t.isConstant||(m.sourceValues=t.buffer);const I=m,B=u.device.beginComputePass({});g.dispatch(B,{bindings:I,x:c.x,y:c.y,z:c.z}),B.end(),u.device.submit(),g.destroy()}function ie(t,e,r,s){const n=f(e),[u,o]=ce(e);return t==="raw"?`fn extent_pass(channelIndex: u32, inputGroupIndex: u32) -> array<${n}, 2> {
  var result: array<${n}, 2>;
  result[0] = ${u};
  result[1] = ${o};

  if (inputGroupIndex < ${s}u) {
    let value = read_source_values(inputGroupIndex);
    result[0] = value[channelIndex];
    result[1] = value[channelIndex];
  }

  return result;
}`:`fn extent_pass(channelIndex: u32, inputGroupIndex: u32) -> array<${n}, 2> {
  var result: array<${n}, 2>;
  result[0] = ${u};
  result[1] = ${o};

  if (inputGroupIndex < ${s}u) {
    let rowIndex = inputGroupIndex * ${r}u + channelIndex;
    let value = read_source_values(rowIndex);
    result[0] = value[0];
    result[1] = value[1];
  }

  return result;
}`}function ce(t){switch(t){case"uint32":return["0xffffffffu","0u"];case"sint32":return["2147483647","-2147483648"];case"float32":return["3.402823e38","-3.402823e38"];default:throw new Error(`Unsupported WebGPU extent type for ${t}`)}}function le(){const t=new Uint16Array([255]);return new Uint8Array(t.buffer)[0]>0}const de=`const LE: bool = ${le()?"true":"false"};
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
`,fe=({inputs:t,output:e,target:r,scope:s})=>(y({scope:s,module:{name:"fround",source:de},inputs:t,output:e,operationType:"uint32",outputBuffer:r}),{success:!0});fe.supportsEvaluationScope=!0;const Ee=async({inputs:t,output:e,target:r})=>{const{ids:s,sourceValues:n}=t,u=f(s.type),o=[];s.isConstant||o.push({name:"ids",input:s,index:o.length}),n.isConstant||o.push({name:"sourceValues",input:n,index:o.length});const l=h(Math.ceil(e.length/x),r.device.limits.maxComputeWorkgroupsPerDimension),i=`
${o.map(({name:g,input:m,index:I})=>S(g,m,I)).join(`
`)}
${xe(s,u)}
${V(n,e.type)}
${P(e,o.length)}
${T(e)}
${oe(e.type,e.size)}
${pe(s.type,e.type,e.size,n.length)}

@compute @workgroup_size(${x}) fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_id) localId: vec3<u32>
) {
  let rowIndex = ${_(l,x)};
  if (rowIndex >= ${e.length}u) {
    return;
  }

  let idsValue = read_ids(rowIndex);
  let result = gather(idsValue);
  write_result(rowIndex, result);
}
`,a=new w(r.device,{source:i,shaderLayout:{bindings:[...o.map(({name:g,index:m})=>({name:g,type:"storage",group:0,location:m})),{name:"result",type:"storage",group:0,location:o.length}]}}),c={};s.isConstant||(c.ids=s.buffer),n.isConstant||(c.sourceValues=n.buffer),c.result=r;const d=c,p=r.device.beginComputePass({});return a.dispatch(p,{bindings:d,x:l.x,y:l.y,z:l.z}),p.end(),r.device.submit(),a.destroy(),{success:!0}};function xe(t,e){if(t.isConstant){const n=t.value;if(!n)throw new Error(`Constant input ${t} is missing CPU values`);return`fn read_ids(_rowIndex: u32) -> ${e} {
  return ${F(e,n[0]??0)};
}`}const r=t.stride/t.ValueType.BYTES_PER_ELEMENT,s=t.offset/t.ValueType.BYTES_PER_ELEMENT;return`fn read_ids(rowIndex: u32) -> ${e} {
  let rowOffset = ${s}u + rowIndex * ${r}u;
  return ids[rowOffset];
}`}function pe(t,e,r,s){const n=f(t),u=f(e);return`fn gather(idsValue: ${n}) -> array<${u}, ${r}> {
  let sourceIndex = ${n==="u32"?"i32(idsValue)":n==="i32"?"idsValue":"i32(idsValue)"};
  if (sourceIndex < 0 || sourceIndex >= ${s}) {
    return zero_result();
  }
  return read_source_values(u32(sourceIndex));
}`}const _e=async({inputs:t,output:e,target:r})=>{const{segments:s}=t,n=s.isConstant?[]:[{name:"segments",input:s,index:0}],u=h(Math.ceil(e.length/x),r.device.limits.maxComputeWorkgroupsPerDimension),o=`
${n.map(({name:d,input:p,index:g})=>S(d,p,g)).join(`
`)}
${U("segments",s,"uint32")}
${P(e,n.length)}
${T(e)}
${ge(s.length)}

@compute @workgroup_size(${x}) fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_id) localId: vec3<u32>
) {
  let rowIndex = ${_(u,x)};
  if (rowIndex >= ${e.length}u) {
    return;
  }

  let result = segmented_map(rowIndex);
  write_result(rowIndex, result);
}
`,l=new w(r.device,{source:o,shaderLayout:{bindings:[...n.map(({name:d,index:p})=>({name:d,type:"storage",group:0,location:p})),{name:"result",type:"storage",group:0,location:n.length}]}}),i=Object.fromEntries(n.map(({name:d,input:p})=>[d,p.buffer]));i.result=r;const a=i,c=r.device.beginComputePass({});return l.dispatch(c,{bindings:a,x:u.x,y:u.y,z:u.z}),c.end(),r.device.submit(),l.destroy(),{success:!0}};function ge(t){return`fn segmented_map(vertexIndex: u32) -> array<u32, 2> {
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
}`}const ye=`fn row_length(x: array<{TYPE}, {X_LEN}>) -> array<f32, 1> {
  var sum = 0.0;
  for (var i = 0u; i < {X_LEN}u; i = i + 1u) {
    sum += f32(x[i]) * f32(x[i]);
  }
  return array<f32, 1>(sqrt(sum));
}
`,me=({inputs:t,output:e,target:r,scope:s})=>(y({scope:s,module:{name:"row_length",source:ye},inputs:t,output:e,operationType:"float32",outputBuffer:r}),{success:!0});me.supportsEvaluationScope=!0;const we=async({inputs:t,output:e,target:r,scope:s})=>{const n=E(e.type);return y({scope:s,module:{name:"select",source:`// inline expression select
`},inputs:t,output:e,operationType:e.type,outputBuffer:r,expression:u=>{const o=$("condition",t.condition,u,n),l=$("whenTrue",t.whenTrue,u,n);return`select(${$("whenFalse",t.whenFalse,u,n)}, ${l}, ${o} != ${n})`}}),{success:!0}};function $(t,e,r,s){return r<e.size?`${t}[${r}]`:e.size===1?`${t}[0]`:s}we.supportsEvaluationScope=!0;const v=64,Se=({inputs:t,output:e,target:r})=>{const s=h(Math.ceil(e.length/v),r.device.limits.maxComputeWorkgroupsPerDimension),n=`@group(0) @binding(0) var<storage, read_write> result: array<i32>;

@compute @workgroup_size(${v}) fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_id) localId: vec3<u32>
) {
  let rowIndex = ${_(s,v)};
  if (rowIndex >= ${e.length}u) {
    return;
  }

  let rowOffset = ${e.offset/e.ValueType.BYTES_PER_ELEMENT}u + rowIndex * ${e.stride/e.ValueType.BYTES_PER_ELEMENT}u;
  result[rowOffset] = ${t.start} + i32(rowIndex) * ${t.step};
}
`,u=new w(r.device,{source:n,shaderLayout:{bindings:[{name:"result",type:"storage",group:0,location:0}]}}),o={result:r},l=r.device.beginComputePass({});return u.dispatch(l,{bindings:o,x:s.x,y:s.y,z:s.z}),l.end(),r.device.submit(),u.destroy(),{success:!0}},he=({inputs:t,output:e,target:r,scope:s})=>{const{columns:n}=t;return y({scope:s,module:{name:"swizzle",source:"// swizzle expression handled inline"},expression:u=>`x[${n[u]}]`,inputs:{x:t.x},output:e,outputBuffer:r}),{success:!0}};he.supportsEvaluationScope=!0;export{W as arithmetic,ve as castData,Q as convertColors,ne as dot,ue as equalAll,be as extent,fe as fround,Ee as gather,Be as interleave,me as length,_e as segmentedMap,we as select,Se as sequence,he as swizzle};
