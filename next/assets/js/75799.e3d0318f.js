"use strict";(self.webpackChunkproject_website=self.webpackChunkproject_website||[]).push([["75799"],{10378(e,t,r){r.r(t),r.d(t,{sequence:()=>M,gather:()=>T,equalAll:()=>m,interleave:()=>k.C,castData:()=>c,swizzle:()=>U,fround:()=>S,arithmetic:()=>l,length:()=>L,convertColors:()=>p,dot:()=>g,extent:()=>B,segmentedMap:()=>F,select:()=>C});var n=r(19160),u=r(49459),a=r(26867),i=r(48560),o=r(24021);let s=`fn arithmetic_add(x: {TYPE}, y: {TYPE}) -> {TYPE} {
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
`,l=({inputs:e,output:t,target:r,scope:l})=>{let d=t.type,f=(0,o.iP)(d),c=(0,o._1)(d),p=e.namedInputs;return(0,i.g)({scope:l,module:{name:"arithmetic",source:s,dependencies:[n.i]},inputs:p,output:t,operationType:d,outputBuffer:r,expression:t=>(0,u.W)(e.expression,{operations:a.E,inputs:p,laneIndex:t,formatInput:e=>`${e}[${t}]`,formatOutOfBoundsInput:e=>1===p[e].size?`${e}[0]`:c,formatLiteral:e=>{let r=Array.isArray(e)?e[t]??0:e;return`${f}(${(0,o.C1)(d,r)})`},formatCall:(e,t)=>`${e}(${t.join(", ")})`})}),{success:!0}};l.supportsEvaluationScope=!0;var d=r(15650),f=r(77806);let c=async({inputs:e,output:t,target:r})=>{var n,u;let a,i,o,s,l,c,p=Math.ceil(t.byteLength/4),x=new d.M(r.device,{source:(n=e,u=t.length,a=(0,f.Ft)(n.inputFormat),i=(0,f.Ft)(n.outputFormat),s=u*(o=a.components),c=4/(l=i.elementByteLength/i.components),`\
@group(0) @binding(0) var<storage, read> source: array<u32>;
@group(0) @binding(1) var<storage, read_write> result: array<u32>;

fn readByte(byteIndex: u32) -> u32 {
  let word = source[byteIndex / 4u];
  return (word >> ((byteIndex % 4u) * 8u)) & 0xffu;
}

fn readUint16(byteIndex: u32) -> u32 {
  return readByte(byteIndex) | (readByte(byteIndex + 1u) << 8u);
}

fn readSourceValue(scalarIndex: u32) -> f32 {
  let rowIndex = scalarIndex / ${o}u;
  let componentIndex = scalarIndex % ${o}u;
  let byteIndex = ${n.source.offset}u + rowIndex * ${n.source.stride}u +
    componentIndex * ${a.elementByteLength/o}u;
  ${function(e,t){switch(e){case"float32":return"return bitcast<f32>(source[byteIndex / 4u]);";case"float16":return`let values = unpack2x16float(source[byteIndex / 4u]);
  return select(values.x, values.y, byteIndex % 4u == 2u);`;case"uint8":return t?"return f32(readByte(byteIndex)) / 255.0;":"return f32(readByte(byteIndex));";case"sint8":return t?"return max(f32(i32(readByte(byteIndex) << 24u) >> 24) / 127.0, -1.0);":"return f32(i32(readByte(byteIndex) << 24u) >> 24);";case"uint16":return t?"return f32(readUint16(byteIndex)) / 65535.0;":"return f32(readUint16(byteIndex));";case"sint16":return t?"return max(f32(i32(readUint16(byteIndex) << 16u) >> 16) / 32767.0, -1.0);":"return f32(i32(readUint16(byteIndex) << 16u) >> 16);";case"uint32":return t?"return f32(source[byteIndex / 4u]) / 4294967295.0;":"return f32(source[byteIndex / 4u]);";case"sint32":return t?"return max(f32(bitcast<i32>(source[byteIndex / 4u])) / 2147483647.0, -1.0);":"return f32(bitcast<i32>(source[byteIndex / 4u]));";default:throw Error(`castData WebGPU input does not support ${e}`)}}(a.signedDataType,a.normalized)}
}

${function(e){let{signedDataType:t,normalized:r}=(0,f.Ft)(e);if("float32"===t||"float16"===t)return"fn encodeValue(value: f32) -> f32 { return value; }";let n=function(e){switch(e){case"sint8":return 127;case"uint8":return 255;case"sint16":return 32767;case"uint16":return 65535;case"sint32":return 0x7fffffff;case"uint32":return 0xffffffff;default:throw Error(`castData WebGPU output does not support ${e}`)}}(t),u=t.startsWith("sint")?-n:0,a=r?`round(clamp(value, ${u<0?"-1.0":"0.0"}, 1.0) * ${n}.0)`:`round(clamp(value, ${u}.0, ${n}.0))`;return`fn encodeValue(value: f32) -> f32 { return ${a}; }`}(n.outputFormat)}

@compute @workgroup_size(64) fn main(
  @builtin(global_invocation_id) id: vec3<u32>
) {
  let wordIndex = id.x;
  let firstScalarIndex = wordIndex * ${c}u;
  if (firstScalarIndex >= ${s}u) {
    return;
  }
  ${function(e,t,r){if(4===t){let t="encodeValue(readSourceValue(firstScalarIndex))";return"float32"===e?`result[wordIndex] = bitcast<u32>(${t});`:"sint32"===e?`result[wordIndex] = bitcast<u32>(i32(${t}));`:`result[wordIndex] = u32(${t});`}if(2===t&&"float16"===e)return`let second = select(0.0, readSourceValue(firstScalarIndex + 1u), firstScalarIndex + 1u < ${r}u);
  result[wordIndex] = pack2x16float(vec2<f32>(
    encodeValue(readSourceValue(firstScalarIndex)),
    encodeValue(second)
  ));`;let n=8*t,u=8===n?"0xffu":"0xffffu",a=Array.from({length:4/t},(t,a)=>{let i=`firstScalarIndex + ${a}u`,o=e.startsWith("sint")?`bitcast<u32>(i32(encodeValue(readSourceValue(${i}))))`:`u32(encodeValue(readSourceValue(${i})))`;return`(select(0u, (${o}) & ${u}, ${i} < ${r}u) << ${a*n}u)`});return`result[wordIndex] = ${a.join(" |\n    ")};`}(i.signedDataType,l,s)}
}
`),shaderLayout:{bindings:[{name:"source",type:"storage",group:0,location:0},{name:"result",type:"storage",group:0,location:1}]}}),g={source:e.source.buffer,result:r};if(p>0){let e=r.device.beginComputePass({});r.device.statsManager.getStats("GPGPU Operation Counts").get("Computation Runs").incrementCount(),x.dispatch(e,{bindings:g,x:Math.ceil(p/64)}),e.end(),r.device.submit()}return x.destroy(),{success:!0}},p=async({inputs:e,output:t,target:r,scope:n})=>{var u,a,i,o,s;let{source:l,inputFormat:f}=e;if(0===t.length)return{success:!0};let c=new d.M(r.device,{source:(u=f,a=l.offset,i=l.stride,o=t.length,s=e.outputFormat,`\
@group(0) @binding(0) var<storage, read> source: array<u32>;
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
  let rowByteOffset = ${a}u + rowIndex * ${i}u;
${function(e){switch(e){case"uint8x3":return`  return vec4<f32>(
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
  );`;default:throw Error(`Unsupported color input format ${e}`)}}(u)}
}

@compute @workgroup_size(64) fn main(
  @builtin(global_invocation_id) id: vec3<u32>
) {
  let rowIndex = id.x;
  if (rowIndex >= ${o}u) {
    return;
  }

  let color = readColor(rowIndex);
${"unorm8x4"===s?"  result[rowIndex] = pack4x8unorm(color);":"float16x4"===s?`  result[rowIndex * 2u] = pack2x16float(color.xy);
  result[rowIndex * 2u + 1u] = pack2x16float(color.zw);`:`  result[rowIndex * 4u] = bitcast<u32>(color.x);
  result[rowIndex * 4u + 1u] = bitcast<u32>(color.y);
  result[rowIndex * 4u + 2u] = bitcast<u32>(color.z);
  result[rowIndex * 4u + 3u] = bitcast<u32>(color.w);`}
}
`),shaderLayout:{bindings:[{name:"source",type:"storage",group:0,location:0},{name:"result",type:"storage",group:0,location:1}]}}),p={source:l.buffer,result:r};n&&n.retain(()=>c.destroy());try{let e=n?n.commandEncoder.beginComputePass({}):r.device.beginComputePass({});try{r.device.statsManager.getStats("GPGPU Operation Counts").get("Computation Runs").incrementCount(),c.dispatch(e,{bindings:p,x:Math.ceil(t.length/64)})}finally{e.end()}n||r.device.submit()}finally{n||c.destroy()}return{success:!0}};p.supportsEvaluationScope=!0;let x=`\
fn row_dot(x: array<{TYPE}, {X_LEN}>, y: array<{TYPE}, {Y_LEN}>) -> array<f32, 1> {
  var sum = 0.0;
  for (var i = 0u; i < {X_LEN}u; i = i + 1u) {
    sum += f32(x[i]) * f32(y[i]);
  }
  return array<f32, 1>(sum);
}
`,g=({inputs:e,output:t,target:r,scope:n})=>((0,i.g)({scope:n,module:{name:"row_dot",source:x},inputs:e,output:t,operationType:"float32",outputBuffer:r}),{success:!0});g.supportsEvaluationScope=!0;let y=`\
fn equalAll(x: array<{TYPE}, {X_LEN}>, y: array<{TYPE}, {Y_LEN}>) -> array<u32, 1> {
  var allEqual = 1u;
  for (var i = 0u; i < {X_LEN}u; i = i + 1u) {
    if (x[i] != y[i]) {
      allEqual = 0u;
      break;
    }
  }
  return array<u32, 1>(allEqual);
}
`,m=({inputs:e,output:t,target:r,scope:n})=>((0,i.g)({scope:n,module:{name:"equalAll",source:y},inputs:e,output:t,operationType:e.x.type,outputBuffer:r}),{success:!0});m.supportsEvaluationScope=!0;var h=r(80316),w=r(95774),$=r(87271);function v(e,t,r){let n=(0,o.iP)(t.type);return`@group(0) @binding(${r}) var<storage, read> ${e}: array<${n}>;`}function I(e,t,r,n=e){let u=(0,o.iP)(r);if(t.isConstant){let e=t.value;if(!e)throw Error(`Constant input ${t} is missing CPU values`);return`fn read_${n}(_sourceIndex: u32) -> array<${u}, ${t.size}> {
  return array<${u}, ${t.size}>(${Array.from({length:t.size},(t,r)=>(0,o.Lm)(u,e[r]??0)).join(", ")});
}`}let a=t.stride/t.ValueType.BYTES_PER_ELEMENT,i=t.offset/t.ValueType.BYTES_PER_ELEMENT,s=(0,o.iP)(t.type)===u?"":`${u}`;return`fn read_${n}(sourceIndex: u32) -> array<${u}, ${t.size}> {
  var value: array<${u}, ${t.size}>;
  let rowOffset = ${i}u + sourceIndex * ${a}u;
${Array.from({length:t.size},(t,r)=>s?`  value[${r}] = ${s}(${e}[rowOffset + ${r}u]);`:`  value[${r}] = ${e}[rowOffset + ${r}u];`).join("\n")}
  return value;
}`}function b(e,t){return I("sourceValues",e,t,"source_values")}function E(e,t){let r=(0,o.iP)(e.type);return`@group(0) @binding(${t}) var<storage, read_write> result: array<${r}>;`}function _(e){let t=e.stride/e.ValueType.BYTES_PER_ELEMENT,r=e.offset/e.ValueType.BYTES_PER_ELEMENT,n=(0,o.iP)(e.type);return`fn write_result(rowIndex: u32, value: array<${n}, ${e.size}>) {
  let rowOffset = ${r}u + rowIndex * ${t}u;
${Array.from({length:e.size},(e,t)=>`  result[rowOffset + ${t}u] = value[${t}];`).join("\n")}
}`}let B=({inputs:e,output:t,target:r})=>{let{sourceValues:n}=e;if(0===n.length){let e=new t.ValueType(t.length*t.size);return r.write(e),{success:!0,value:e}}if(n.isConstant){let e=n.value;if(!e)throw Error(`Constant input ${n} is missing CPU values`);let u=new t.ValueType(t.length*t.size);for(let r=0;r<t.length;r++){let t=e[r];u[2*r]=t,u[2*r+1]=t}return r.write(u),{success:!0,value:u}}let u=[],a=n,i="raw",s=n.length;try{for(;;){let e=Math.ceil(s/64),n=t.length*e,l=1===e?r:w.R.createOrReuse(r.device,n*t.stride);if(e>1&&u.push(l),function({input:e,inputMode:t,inputGroupCount:r,channelCount:n,outputType:u,outputBuffer:a,outputLength:i,outputStride:s,outputOffset:l}){let f=(0,o.iP)(u),c=(0,$.BB)(i,a.device.limits.maxComputeWorkgroupsPerDimension),p=new h.GL({buffer:a,type:u,size:2,length:i,stride:s,offset:l}),x=`
${e.isConstant?"":v("sourceValues",e,0)}
${b(e,u)}
${E(p,+!e.isConstant)}
${_(p)}
${function(e,t,r,n){let u=(0,o.iP)(t),[a,i]=function(e){switch(e){case"uint32":return["0xffffffffu","0u"];case"sint32":return["2147483647","-2147483648"];case"float32":return["3.402823e38","-3.402823e38"];default:throw Error(`Unsupported WebGPU extent type for ${e}`)}}(t);return"raw"===e?`fn extent_pass(channelIndex: u32, inputGroupIndex: u32) -> array<${u}, 2> {
  var result: array<${u}, 2>;
  result[0] = ${a};
  result[1] = ${i};

  if (inputGroupIndex < ${n}u) {
    let value = read_source_values(inputGroupIndex);
    result[0] = value[channelIndex];
    result[1] = value[channelIndex];
  }

  return result;
}`:`fn extent_pass(channelIndex: u32, inputGroupIndex: u32) -> array<${u}, 2> {
  var result: array<${u}, 2>;
  result[0] = ${a};
  result[1] = ${i};

  if (inputGroupIndex < ${n}u) {
    let rowIndex = inputGroupIndex * ${r}u + channelIndex;
    let value = read_source_values(rowIndex);
    result[0] = value[0];
    result[1] = value[1];
  }

  return result;
}`}(t,u,n,r)}

var<workgroup> sharedMin: array<${f}, 64>;
var<workgroup> sharedMax: array<${f}, 64>;

@compute @workgroup_size(64) fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_id) localId: vec3<u32>
) {
  let outputRowIndex = ${(0,$.B)(c)};
  if (outputRowIndex >= ${i}u) {
    return;
  }

  let channelIndex = outputRowIndex % ${n}u;
  let outputGroupIndex = outputRowIndex / ${n}u;
  let inputGroupIndex = outputGroupIndex * 64u + localId.x;

  let result = extent_pass(channelIndex, inputGroupIndex);
  sharedMin[localId.x] = result[0];
  sharedMax[localId.x] = result[1];
  workgroupBarrier();

  var stride = ${Math.floor(32)}u;
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
    write_result(outputRowIndex, array<${f}, 2>(sharedMin[0], sharedMax[0]));
  }
}
`,g=new d.M(a.device,{source:x,shaderLayout:{bindings:[...e.isConstant?[]:[{name:"sourceValues",type:"storage",group:0,location:0}],{name:"result",type:"storage",group:0,location:+!e.isConstant}]}}),y={result:a};e.isConstant||(y.sourceValues=e.buffer);let m=a.device.beginComputePass({});g.dispatch(m,{bindings:y,x:c.x,y:c.y,z:c.z}),m.end(),a.device.submit(),g.destroy()}({input:a,inputMode:i,inputGroupCount:s,channelCount:t.length,outputType:t.type,outputBuffer:l,outputLength:n,outputStride:t.stride,outputOffset:t.offset}),1===e)break;a=new h.GL({buffer:l,type:t.type,size:2,length:n}),i="partial",s=e}return{success:!0}}finally{for(let e of u)w.R.recycle(e)}},P=`\
const LE: bool = ${new Uint8Array(new Uint16Array([255]).buffer)[0]>0?"true":"false"};
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
`,S=({inputs:e,output:t,target:r,scope:n})=>((0,i.g)({scope:n,module:{name:"fround",source:P},inputs:e,output:t,operationType:"uint32",outputBuffer:r}),{success:!0});S.supportsEvaluationScope=!0;let T=async({inputs:e,output:t,target:r})=>{var n,u,a,i,s,l;let f,c,p,{ids:x,sourceValues:g}=e,y=(0,o.iP)(x.type),m=[];x.isConstant||m.push({name:"ids",input:x,index:m.length}),g.isConstant||m.push({name:"sourceValues",input:g,index:m.length});let h=(0,$.BB)(Math.ceil(t.length/64),r.device.limits.maxComputeWorkgroupsPerDimension),w=`
${m.map(({name:e,input:t,index:r})=>v(e,t,r)).join("\n")}
${function(e,t){if(e.isConstant){let r=e.value;if(!r)throw Error(`Constant input ${e} is missing CPU values`);return`fn read_ids(_rowIndex: u32) -> ${t} {
  return ${(0,o.Lm)(t,r[0]??0)};
}`}let r=e.stride/e.ValueType.BYTES_PER_ELEMENT,n=e.offset/e.ValueType.BYTES_PER_ELEMENT;return`fn read_ids(rowIndex: u32) -> ${t} {
  let rowOffset = ${n}u + rowIndex * ${r}u;
  return ids[rowOffset];
}`}(x,y)}
${b(g,t.type)}
${E(t,m.length)}
${_(t)}
${(n=t.type,u=t.size,p=(0,o._1)(n),`fn zero_result() -> array<${(0,o.iP)(n)}, ${u}> {
  var result: array<${(0,o.iP)(n)}, ${u}>;
${Array.from({length:u},(e,t)=>`  result[${t}] = ${p};`).join("\n")}
  return result;
}`)}
${(a=x.type,i=t.type,s=t.size,l=g.length,f=(0,o.iP)(a),c=(0,o.iP)(i),`fn gather(idsValue: ${f}) -> array<${c}, ${s}> {
  let sourceIndex = ${"u32"===f?"i32(idsValue)":"i32"===f?"idsValue":"i32(idsValue)"};
  if (sourceIndex < 0 || sourceIndex >= ${l}) {
    return zero_result();
  }
  return read_source_values(u32(sourceIndex));
}`)}

@compute @workgroup_size(64) fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_id) localId: vec3<u32>
) {
  let rowIndex = ${(0,$.vL)(h,64)};
  if (rowIndex >= ${t.length}u) {
    return;
  }

  let idsValue = read_ids(rowIndex);
  let result = gather(idsValue);
  write_result(rowIndex, result);
}
`,I=new d.M(r.device,{source:w,shaderLayout:{bindings:[...m.map(({name:e,index:t})=>({name:e,type:"storage",group:0,location:t})),{name:"result",type:"storage",group:0,location:m.length}]}}),B={};x.isConstant||(B.ids=x.buffer),g.isConstant||(B.sourceValues=g.buffer),B.result=r;let P=r.device.beginComputePass({});return I.dispatch(P,{bindings:B,x:h.x,y:h.y,z:h.z}),P.end(),r.device.submit(),I.destroy(),{success:!0}},F=async({inputs:e,output:t,target:r})=>{var n;let{segments:u}=e,a=u.isConstant?[]:[{name:"segments",input:u,index:0}],i=(0,$.BB)(Math.ceil(t.length/64),r.device.limits.maxComputeWorkgroupsPerDimension),o=`
${a.map(({name:e,input:t,index:r})=>v(e,t,r)).join("\n")}
${I("segments",u,"uint32")}
${E(t,a.length)}
${_(t)}
${(n=u.length,`fn segmented_map(vertexIndex: u32) -> array<u32, 2> {
  var low = 0i;
  var high = ${n}i;
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
}`)}

@compute @workgroup_size(64) fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_id) localId: vec3<u32>
) {
  let rowIndex = ${(0,$.vL)(i,64)};
  if (rowIndex >= ${t.length}u) {
    return;
  }

  let result = segmented_map(rowIndex);
  write_result(rowIndex, result);
}
`,s=new d.M(r.device,{source:o,shaderLayout:{bindings:[...a.map(({name:e,index:t})=>({name:e,type:"storage",group:0,location:t})),{name:"result",type:"storage",group:0,location:a.length}]}}),l=Object.fromEntries(a.map(({name:e,input:t})=>[e,t.buffer]));l.result=r;let f=r.device.beginComputePass({});return s.dispatch(f,{bindings:l,x:i.x,y:i.y,z:i.z}),f.end(),r.device.submit(),s.destroy(),{success:!0}};var k=r(98350);let z=`\
fn row_length(x: array<{TYPE}, {X_LEN}>) -> array<f32, 1> {
  var sum = 0.0;
  for (var i = 0u; i < {X_LEN}u; i = i + 1u) {
    sum += f32(x[i]) * f32(x[i]);
  }
  return array<f32, 1>(sqrt(sum));
}
`,L=({inputs:e,output:t,target:r,scope:n})=>((0,i.g)({scope:n,module:{name:"row_length",source:z},inputs:e,output:t,operationType:"float32",outputBuffer:r}),{success:!0});L.supportsEvaluationScope=!0;let C=async({inputs:e,output:t,target:r,scope:n})=>{let u=(0,o._1)(t.type);return(0,i.g)({scope:n,module:{name:"select",source:"// inline expression select\n"},inputs:e,output:t,operationType:t.type,outputBuffer:r,expression:t=>{let r=O("condition",e.condition,t,u),n=O("whenTrue",e.whenTrue,t,u),a=O("whenFalse",e.whenFalse,t,u);return`select(${a}, ${n}, ${r} != ${u})`}}),{success:!0}};function O(e,t,r,n){return r<t.size?`${e}[${r}]`:1===t.size?`${e}[0]`:n}C.supportsEvaluationScope=!0;let M=({inputs:e,output:t,target:r})=>{let n=(0,$.BB)(Math.ceil(t.length/64),r.device.limits.maxComputeWorkgroupsPerDimension),u=`\
@group(0) @binding(0) var<storage, read_write> result: array<i32>;

@compute @workgroup_size(64) fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_id) localId: vec3<u32>
) {
  let rowIndex = ${(0,$.vL)(n,64)};
  if (rowIndex >= ${t.length}u) {
    return;
  }

  let rowOffset = ${t.offset/t.ValueType.BYTES_PER_ELEMENT}u + rowIndex * ${t.stride/t.ValueType.BYTES_PER_ELEMENT}u;
  result[rowOffset] = ${e.start} + i32(rowIndex) * ${e.step};
}
`,a=new d.M(r.device,{source:u,shaderLayout:{bindings:[{name:"result",type:"storage",group:0,location:0}]}}),i=r.device.beginComputePass({});return a.dispatch(i,{bindings:{result:r},x:n.x,y:n.y,z:n.z}),i.end(),r.device.submit(),a.destroy(),{success:!0}},U=({inputs:e,output:t,target:r,scope:n})=>{let{columns:u}=e;return(0,i.g)({scope:n,module:{name:"swizzle",source:"// swizzle expression handled inline"},expression:e=>`x[${u[e]}]`,inputs:{x:e.x},output:t,outputBuffer:r}),{success:!0}};U.supportsEvaluationScope=!0},49459(e,t,r){r.d(t,{W:()=>n});function n(e,t){return!function e(t,{operations:r,inputs:n}){switch(t.kind){case"input":if(!(t.name in n))throw Error(`Unknown expression input '${t.name}'`);return;case"literal":if(Array.isArray(t.value)){for(let e of t.value)if(!Number.isFinite(e))throw Error(`Expression literal array must contain only finite values, got ${e}`)}else if(!Number.isFinite(t.value))throw Error(`Expression literal must be finite, got ${t.value}`);return;case"call":{let u=r[t.op];if(!u)throw Error(`Unknown expression op '${t.op}'`);if(t.args.length!==u.arity)throw Error(`Expression op '${t.op}' expects ${u.arity} args, got ${t.args.length}`);for(let u of t.args)e(u,{operations:r,inputs:n});return}default:throw Error(`Unsupported expression node ${t.kind}`)}}(e,t),function e(t,r){switch(t.kind){case"input":{let e=r.inputs[t.name];if(r.laneIndex<e.size)return r.formatInput(t.name);return r.formatOutOfBoundsInput(t.name)}case"literal":return r.formatLiteral(t.value);case"call":{let n=r.operations[t.op],u=t.args.map(t=>e(t,r));return r.formatCall(n.symbol,u)}default:throw Error(`Unsupported expression node ${t.kind}`)}}(e,t)}}}]);
//# sourceMappingURL=75799.e3d0318f.js.map