"use strict";(self.webpackChunkproject_website=self.webpackChunkproject_website||[]).push([["5632"],{85251(e,t,r){r.r(t),r.d(t,{sequence:()=>B,gather:()=>P,equalAll:()=>p,interleave:()=>S.C,swizzle:()=>k,fround:()=>T,arithmetic:()=>l,length:()=>C,dot:()=>d,extent:()=>$,segmentedMap:()=>L,select:()=>N});var n=r(84765),i=r(95309),u=r(84598),a=r(39463);let s=`const TWO_PI: f32 = 6.2831854820251465;
const PI_2: f32 = 1.5707963705062866;
const PI_16: f32 = 0.1963495463132858;

const SIN_TABLE_0: f32 = 0.19509032368659973;
const SIN_TABLE_1: f32 = 0.3826834261417389;
const SIN_TABLE_2: f32 = 0.5555702447891235;
const SIN_TABLE_3: f32 = 0.7071067690849304;

const COS_TABLE_0: f32 = 0.9807852506637573;
const COS_TABLE_1: f32 = 0.9238795042037964;
const COS_TABLE_2: f32 = 0.8314695954322815;
const COS_TABLE_3: f32 = 0.7071067690849304;

const INVERSE_FACTORIAL_3: f32 = 1.666666716337204e-01;
const INVERSE_FACTORIAL_5: f32 = 8.333333767950535e-03;
const INVERSE_FACTORIAL_7: f32 = 1.9841270113829523e-04;
const INVERSE_FACTORIAL_9: f32 = 2.75573188446287533e-06;

const FP32_OVERFLOW = 3.402823466e+38;

fn sin_taylor_fp32(a: f32) -> f32 {
  if (a == 0.0) {
    return 0.0;
  }

  let x = -a * a;
  var s = a;
  var r = a;

  r = r * x;
  s = s + r * INVERSE_FACTORIAL_3;

  r = r * x;
  s = s + r * INVERSE_FACTORIAL_5;

  r = r * x;
  s = s + r * INVERSE_FACTORIAL_7;

  r = r * x;
  s = s + r * INVERSE_FACTORIAL_9;

  return s;
}

fn sincos_taylor_fp32(a: f32) -> vec2<f32> {
  if (a == 0.0) {
    return vec2<f32>(0.0, 1.0);
  }

  let sin_t = sin_taylor_fp32(a);
  let cos_t = sqrt(1.0 - sin_t * sin_t);
  return vec2<f32>(sin_t, cos_t);
}

fn tan_taylor_fp32(a: f32) -> f32 {
  if (a == 0.0) {
    return 0.0;
  }

  let z = floor(a / TWO_PI);
  let r = a - TWO_PI * z;

  var q = floor(r / PI_2 + 0.5);
  let j = i32(q);

  if (j < -2 || j > 2) {
    return FP32_OVERFLOW;
  }

  var t = r - PI_2 * q;

  q = floor(t / PI_16 + 0.5);
  let k = i32(q);
  let abs_k = abs(k);

  if (abs_k > 4) {
    return FP32_OVERFLOW;
  }

  t = t - PI_16 * q;

  let sincos_t = sincos_taylor_fp32(t);
  let sin_t = sincos_t.x;
  let cos_t = sincos_t.y;

  var u = 0.0;
  var v = 0.0;

  if (abs_k == 1) {
    u = COS_TABLE_0;
    v = SIN_TABLE_0;
  } else if (abs_k == 2) {
    u = COS_TABLE_1;
    v = SIN_TABLE_1;
  } else if (abs_k == 3) {
    u = COS_TABLE_2;
    v = SIN_TABLE_2;
  } else if (abs_k == 4) {
    u = COS_TABLE_3;
    v = SIN_TABLE_3;
  }

  var s = sin_t;
  var c = cos_t;

  if (k > 0) {
    s = u * sin_t + v * cos_t;
    c = u * cos_t - v * sin_t;
  } else if (k < 0) {
    s = u * sin_t - v * cos_t;
    c = u * cos_t + v * sin_t;
  }

  var sin_a = 0.0;
  var cos_a = 0.0;

  if (j == 0) {
    sin_a = s;
    cos_a = c;
  } else if (j == 1) {
    sin_a = c;
    cos_a = -s;
  } else if (j == -1) {
    sin_a = -c;
    cos_a = s;
  } else {
    sin_a = -s;
    cos_a = -c;
  }

  return sin_a / cos_a;
}

fn tan_fp32(a: f32) -> f32 {
  return tan_taylor_fp32(a);
}
`,o=`fn arithmetic_add(x: {TYPE}, y: {TYPE}) -> {TYPE} {
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
  return {TAN_IMPL}(x);
}
`,l=({device:e,inputs:t,output:r,target:l})=>{let f=r.type,d=(0,a.iP)(f),c=(0,a._1)(f),p=t.namedInputs,_=function(e){let{gpu:t}=e.info;return"nvidia"!==t&&"amd"!==t?`${s}
${o.replace("{TAN_IMPL}","tan_fp32")}`:o.replace("{TAN_IMPL}","tan")}(e);return(0,u.P)({module:{name:"arithmetic",source:_},inputs:p,output:r,operationType:f,outputBuffer:l,expression:e=>(0,n.W)(t.expression,{operations:i.E,inputs:p,laneIndex:e,formatInput:t=>`${t}[${e}]`,formatOutOfBoundsInput:e=>1===p[e].size?`${e}[0]`:c,formatLiteral:t=>{let r=Array.isArray(t)?t[e]??0:t;return`${d}(${(0,a.C1)(f,r)})`},formatCall:(e,t)=>`${e}(${t.join(", ")})`})}),{success:!0}},f=`\
fn row_dot(x: array<{TYPE}, {X_LEN}>, y: array<{TYPE}, {Y_LEN}>) -> array<f32, 1> {
  var sum = 0.0;
  for (var i = 0u; i < {X_LEN}u; i = i + 1u) {
    sum += f32(x[i]) * f32(y[i]);
  }
  return array<f32, 1>(sum);
}
`,d=({inputs:e,output:t,target:r})=>((0,u.P)({module:{name:"row_dot",source:f},inputs:e,output:t,operationType:"float32",outputBuffer:r}),{success:!0}),c=`\
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
`,p=({inputs:e,output:t,target:r})=>((0,u.P)({module:{name:"equalAll",source:c},inputs:e,output:t,operationType:e.x.type,outputBuffer:r}),{success:!0});var _=r(31709),x=r(64238),g=r(66008),m=r(75605);function h(e,t,r){let n=(0,a.iP)(t.type);return`@group(0) @binding(${r}) var<storage, read> ${e}: array<${n}>;`}function E(e,t,r,n=e){let i=(0,a.iP)(r);if(t.isConstant){let e=t.value;if(!e)throw Error(`Constant input ${t} is missing CPU values`);return`fn read_${n}(_sourceIndex: u32) -> array<${i}, ${t.size}> {
  return array<${i}, ${t.size}>(${Array.from({length:t.size},(t,r)=>(0,a.Lm)(i,e[r]??0)).join(", ")});
}`}let u=t.stride/t.ValueType.BYTES_PER_ELEMENT,s=t.offset/t.ValueType.BYTES_PER_ELEMENT,o=(0,a.iP)(t.type)===i?"":`${i}`;return`fn read_${n}(sourceIndex: u32) -> array<${i}, ${t.size}> {
  var value: array<${i}, ${t.size}>;
  let rowOffset = ${s}u + sourceIndex * ${u}u;
${Array.from({length:t.size},(t,r)=>o?`  value[${r}] = ${o}(${e}[rowOffset + ${r}u]);`:`  value[${r}] = ${e}[rowOffset + ${r}u];`).join("\n")}
  return value;
}`}function v(e,t){return E("sourceValues",e,t,"source_values")}function y(e,t){let r=(0,a.iP)(e.type);return`@group(0) @binding(${t}) var<storage, read_write> result: array<${r}>;`}function I(e){let t=e.stride/e.ValueType.BYTES_PER_ELEMENT,r=e.offset/e.ValueType.BYTES_PER_ELEMENT,n=(0,a.iP)(e.type);return`fn write_result(rowIndex: u32, value: array<${n}, ${e.size}>) {
  let rowOffset = ${r}u + rowIndex * ${t}u;
${Array.from({length:e.size},(e,t)=>`  result[rowOffset + ${t}u] = value[${t}];`).join("\n")}
}`}let $=({inputs:e,output:t,target:r})=>{let{sourceValues:n}=e;if(0===n.length){let e=new t.ValueType(t.length*t.size);return r.write(e),{success:!0,value:e}}if(n.isConstant){let e=n.value;if(!e)throw Error(`Constant input ${n} is missing CPU values`);let i=new t.ValueType(t.length*t.size);for(let r=0;r<t.length;r++){let t=e[r];i[2*r]=t,i[2*r+1]=t}return r.write(i),{success:!0,value:i}}let i=[],u=n,s="raw",o=n.length;try{for(;;){let e=Math.ceil(o/64),n=t.length*e,l=1===e?r:g.R.createOrReuse(r.device,n*t.stride);if(e>1&&i.push(l),function({input:e,inputMode:t,inputGroupCount:r,channelCount:n,outputType:i,outputBuffer:u,outputLength:s,outputStride:o,outputOffset:l}){let f=(0,a.iP)(i),d=(0,m.BB)(s,u.device.limits.maxComputeWorkgroupsPerDimension),c=new x.GL({buffer:u,type:i,size:2,length:s,stride:o,offset:l}),p=`
${e.isConstant?"":h("sourceValues",e,0)}
${v(e,i)}
${y(c,+!e.isConstant)}
${I(c)}
${function(e,t,r,n){let i=(0,a.iP)(t),[u,s]=function(e){switch(e){case"uint32":return["0xffffffffu","0u"];case"sint32":return["2147483647","-2147483648"];case"float32":return["3.402823e38","-3.402823e38"];default:throw Error(`Unsupported WebGPU extent type for ${e}`)}}(t);return"raw"===e?`fn extent_pass(channelIndex: u32, inputGroupIndex: u32) -> array<${i}, 2> {
  var result: array<${i}, 2>;
  result[0] = ${u};
  result[1] = ${s};

  if (inputGroupIndex < ${n}u) {
    let value = read_source_values(inputGroupIndex);
    result[0] = value[channelIndex];
    result[1] = value[channelIndex];
  }

  return result;
}`:`fn extent_pass(channelIndex: u32, inputGroupIndex: u32) -> array<${i}, 2> {
  var result: array<${i}, 2>;
  result[0] = ${u};
  result[1] = ${s};

  if (inputGroupIndex < ${n}u) {
    let rowIndex = inputGroupIndex * ${r}u + channelIndex;
    let value = read_source_values(rowIndex);
    result[0] = value[0];
    result[1] = value[1];
  }

  return result;
}`}(t,i,n,r)}

var<workgroup> sharedMin: array<${f}, 64>;
var<workgroup> sharedMax: array<${f}, 64>;

@compute @workgroup_size(64) fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_id) localId: vec3<u32>
) {
  let outputRowIndex = ${(0,m.B)(d)};
  if (outputRowIndex >= ${s}u) {
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
`,g=new _.C(u.device,{source:p,shaderLayout:{bindings:[...e.isConstant?[]:[{name:"sourceValues",type:"storage",group:0,location:0}],{name:"result",type:"storage",group:0,location:+!e.isConstant}]}}),E={result:u};e.isConstant||(E.sourceValues=e.buffer),g.setBindings(E);let $=u.device.beginComputePass({});g.dispatch($,d.x,d.y,d.z),$.end(),u.device.submit(),g.destroy()}({input:u,inputMode:s,inputGroupCount:o,channelCount:t.length,outputType:t.type,outputBuffer:l,outputLength:n,outputStride:t.stride,outputOffset:t.offset}),1===e)break;u=new x.GL({buffer:l,type:t.type,size:2,length:n}),s="partial",o=e}return{success:!0}}finally{for(let e of i)g.R.recycle(e)}},w=`\
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
`,T=({inputs:e,output:t,target:r})=>((0,u.P)({module:{name:"fround",source:w},inputs:e,output:t,operationType:"uint32",outputBuffer:r}),{success:!0}),P=async({inputs:e,output:t,target:r})=>{var n,i,u,s,o,l;let f,d,c,{ids:p,sourceValues:x}=e,g=(0,a.iP)(p.type),E=[];p.isConstant||E.push({name:"ids",input:p,index:E.length}),x.isConstant||E.push({name:"sourceValues",input:x,index:E.length});let $=(0,m.BB)(Math.ceil(t.length/64),r.device.limits.maxComputeWorkgroupsPerDimension),w=`
${E.map(({name:e,input:t,index:r})=>h(e,t,r)).join("\n")}
${function(e,t){if(e.isConstant){let r=e.value;if(!r)throw Error(`Constant input ${e} is missing CPU values`);return`fn read_ids(_rowIndex: u32) -> ${t} {
  return ${(0,a.Lm)(t,r[0]??0)};
}`}let r=e.stride/e.ValueType.BYTES_PER_ELEMENT,n=e.offset/e.ValueType.BYTES_PER_ELEMENT;return`fn read_ids(rowIndex: u32) -> ${t} {
  let rowOffset = ${n}u + rowIndex * ${r}u;
  return ids[rowOffset];
}`}(p,g)}
${v(x,t.type)}
${y(t,E.length)}
${I(t)}
${(n=t.type,i=t.size,c=(0,a._1)(n),`fn zero_result() -> array<${(0,a.iP)(n)}, ${i}> {
  var result: array<${(0,a.iP)(n)}, ${i}>;
${Array.from({length:i},(e,t)=>`  result[${t}] = ${c};`).join("\n")}
  return result;
}`)}
${(u=p.type,s=t.type,o=t.size,l=x.length,f=(0,a.iP)(u),d=(0,a.iP)(s),`fn gather(idsValue: ${f}) -> array<${d}, ${o}> {
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
  let rowIndex = ${(0,m.vL)($,64)};
  if (rowIndex >= ${t.length}u) {
    return;
  }

  let idsValue = read_ids(rowIndex);
  let result = gather(idsValue);
  write_result(rowIndex, result);
}
`,T=new _.C(r.device,{source:w,shaderLayout:{bindings:[...E.map(({name:e,index:t})=>({name:e,type:"storage",group:0,location:t})),{name:"result",type:"storage",group:0,location:E.length}]}}),P={};p.isConstant||(P.ids=p.buffer),x.isConstant||(P.sourceValues=x.buffer),P.result=r,T.setBindings(P);let L=r.device.beginComputePass({});return T.dispatch(L,$.x,$.y,$.z),L.end(),r.device.submit(),T.destroy(),{success:!0}},L=async({inputs:e,output:t,target:r})=>{var n;let{segments:i}=e,u=i.isConstant?[]:[{name:"segments",input:i,index:0}],a=(0,m.BB)(Math.ceil(t.length/64),r.device.limits.maxComputeWorkgroupsPerDimension),s=`
${u.map(({name:e,input:t,index:r})=>h(e,t,r)).join("\n")}
${E("segments",i,"uint32")}
${y(t,u.length)}
${I(t)}
${(n=i.length,`fn segmented_map(vertexIndex: u32) -> array<u32, 2> {
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
  let rowIndex = ${(0,m.vL)(a,64)};
  if (rowIndex >= ${t.length}u) {
    return;
  }

  let result = segmented_map(rowIndex);
  write_result(rowIndex, result);
}
`,o=new _.C(r.device,{source:s,shaderLayout:{bindings:[...u.map(({name:e,index:t})=>({name:e,type:"storage",group:0,location:t})),{name:"result",type:"storage",group:0,location:u.length}]}}),l=Object.fromEntries(u.map(({name:e,input:t})=>[e,t.buffer]));l.result=r,o.setBindings(l);let f=r.device.beginComputePass({});return o.dispatch(f,a.x,a.y,a.z),f.end(),r.device.submit(),o.destroy(),{success:!0}};var S=r(41568);let b=`\
fn row_length(x: array<{TYPE}, {X_LEN}>) -> array<f32, 1> {
  var sum = 0.0;
  for (var i = 0u; i < {X_LEN}u; i = i + 1u) {
    sum += f32(x[i]) * f32(x[i]);
  }
  return array<f32, 1>(sqrt(sum));
}
`,C=({inputs:e,output:t,target:r})=>((0,u.P)({module:{name:"row_length",source:b},inputs:e,output:t,operationType:"float32",outputBuffer:r}),{success:!0}),N=async({inputs:e,output:t,target:r})=>{let n=(0,a._1)(t.type);return(0,u.P)({module:{name:"select",source:"// inline expression select\n"},inputs:e,output:t,operationType:t.type,outputBuffer:r,expression:t=>{let r=A("condition",e.condition,t,n),i=A("whenTrue",e.whenTrue,t,n),u=A("whenFalse",e.whenFalse,t,n);return`select(${u}, ${i}, ${r} != ${n})`}}),{success:!0}};function A(e,t,r,n){return r<t.size?`${e}[${r}]`:1===t.size?`${e}[0]`:n}let B=({inputs:e,output:t,target:r})=>{let n=(0,m.BB)(Math.ceil(t.length/64),r.device.limits.maxComputeWorkgroupsPerDimension),i=`\
@group(0) @binding(0) var<storage, read_write> result: array<i32>;

@compute @workgroup_size(64) fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_id) localId: vec3<u32>
) {
  let rowIndex = ${(0,m.vL)(n,64)};
  if (rowIndex >= ${t.length}u) {
    return;
  }

  let rowOffset = ${t.offset/t.ValueType.BYTES_PER_ELEMENT}u + rowIndex * ${t.stride/t.ValueType.BYTES_PER_ELEMENT}u;
  result[rowOffset] = ${e.start} + i32(rowIndex) * ${e.step};
}
`,u=new _.C(r.device,{source:i,shaderLayout:{bindings:[{name:"result",type:"storage",group:0,location:0}]}});u.setBindings({result:r});let a=r.device.beginComputePass({});return u.dispatch(a,n.x,n.y,n.z),a.end(),r.device.submit(),u.destroy(),{success:!0}},k=({inputs:e,output:t,target:r})=>{let{columns:n}=e;return(0,u.P)({module:{name:"swizzle",source:"// swizzle expression handled inline"},expression:e=>`x[${n[e]}]`,inputs:{x:e.x},output:t,outputBuffer:r}),{success:!0}}},84765(e,t,r){r.d(t,{W:()=>n});function n(e,t){return!function e(t,{operations:r,inputs:n}){switch(t.kind){case"input":if(!(t.name in n))throw Error(`Unknown expression input '${t.name}'`);return;case"literal":if(Array.isArray(t.value)){for(let e of t.value)if(!Number.isFinite(e))throw Error(`Expression literal array must contain only finite values, got ${e}`)}else if(!Number.isFinite(t.value))throw Error(`Expression literal must be finite, got ${t.value}`);return;case"call":{let i=r[t.op];if(!i)throw Error(`Unknown expression op '${t.op}'`);if(t.args.length!==i.arity)throw Error(`Expression op '${t.op}' expects ${i.arity} args, got ${t.args.length}`);for(let i of t.args)e(i,{operations:r,inputs:n});return}default:throw Error(`Unsupported expression node ${t.kind}`)}}(e,t),function e(t,r){switch(t.kind){case"input":{let e=r.inputs[t.name];if(r.laneIndex<e.size)return r.formatInput(t.name);return r.formatOutOfBoundsInput(t.name)}case"literal":return r.formatLiteral(t.value);case"call":{let n=r.operations[t.op],i=t.args.map(t=>e(t,r));return r.formatCall(n.symbol,i)}default:throw Error(`Unsupported expression node ${t.kind}`)}}(e,t)}}}]);
//# sourceMappingURL=5632.25c9d973.js.map