"use strict";(self.webpackChunkproject_website=self.webpackChunkproject_website||[]).push([["5632"],{85251(e,r,t){t.r(r),t.d(r,{sequence:()=>B,gather:()=>T,equalAll:()=>c,interleave:()=>L.C,swizzle:()=>N,fround:()=>P,arithmetic:()=>l,length:()=>z,dot:()=>f,extent:()=>_,segmentedMap:()=>b,select:()=>C});var n=t(22270),i=t(84765),u=t(95309),a=t(84598),s=t(39463);let o=`fn arithmetic_add(x: {TYPE}, y: {TYPE}) -> {TYPE} {
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
`,l=({inputs:e,output:r,target:t})=>{let l=r.type,d=(0,s.iP)(l),f=(0,s._1)(l),p=e.namedInputs;return(0,a.P)({module:{name:"arithmetic",source:o,dependencies:[n.i]},inputs:p,output:r,operationType:l,outputBuffer:t,expression:r=>(0,i.W)(e.expression,{operations:u.E,inputs:p,laneIndex:r,formatInput:e=>`${e}[${r}]`,formatOutOfBoundsInput:e=>1===p[e].size?`${e}[0]`:f,formatLiteral:e=>{let t=Array.isArray(e)?e[r]??0:e;return`${d}(${(0,s.C1)(l,t)})`},formatCall:(e,r)=>`${e}(${r.join(", ")})`})}),{success:!0}},d=`\
fn row_dot(x: array<{TYPE}, {X_LEN}>, y: array<{TYPE}, {Y_LEN}>) -> array<f32, 1> {
  var sum = 0.0;
  for (var i = 0u; i < {X_LEN}u; i = i + 1u) {
    sum += f32(x[i]) * f32(y[i]);
  }
  return array<f32, 1>(sum);
}
`,f=({inputs:e,output:r,target:t})=>((0,a.P)({module:{name:"row_dot",source:d},inputs:e,output:r,operationType:"float32",outputBuffer:t}),{success:!0}),p=`\
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
`,c=({inputs:e,output:r,target:t})=>((0,a.P)({module:{name:"equalAll",source:p},inputs:e,output:r,operationType:e.x.type,outputBuffer:t}),{success:!0});var x=t(31709),g=t(64238),m=t(66008),h=t(75605);function $(e,r,t){let n=(0,s.iP)(r.type);return`@group(0) @binding(${t}) var<storage, read> ${e}: array<${n}>;`}function w(e,r,t,n=e){let i=(0,s.iP)(t);if(r.isConstant){let e=r.value;if(!e)throw Error(`Constant input ${r} is missing CPU values`);return`fn read_${n}(_sourceIndex: u32) -> array<${i}, ${r.size}> {
  return array<${i}, ${r.size}>(${Array.from({length:r.size},(r,t)=>(0,s.Lm)(i,e[t]??0)).join(", ")});
}`}let u=r.stride/r.ValueType.BYTES_PER_ELEMENT,a=r.offset/r.ValueType.BYTES_PER_ELEMENT,o=(0,s.iP)(r.type)===i?"":`${i}`;return`fn read_${n}(sourceIndex: u32) -> array<${i}, ${r.size}> {
  var value: array<${i}, ${r.size}>;
  let rowOffset = ${a}u + sourceIndex * ${u}u;
${Array.from({length:r.size},(r,t)=>o?`  value[${t}] = ${o}(${e}[rowOffset + ${t}u]);`:`  value[${t}] = ${e}[rowOffset + ${t}u];`).join("\n")}
  return value;
}`}function y(e,r){return w("sourceValues",e,r,"source_values")}function v(e,r){let t=(0,s.iP)(e.type);return`@group(0) @binding(${r}) var<storage, read_write> result: array<${t}>;`}function E(e){let r=e.stride/e.ValueType.BYTES_PER_ELEMENT,t=e.offset/e.ValueType.BYTES_PER_ELEMENT,n=(0,s.iP)(e.type);return`fn write_result(rowIndex: u32, value: array<${n}, ${e.size}>) {
  let rowOffset = ${t}u + rowIndex * ${r}u;
${Array.from({length:e.size},(e,r)=>`  result[rowOffset + ${r}u] = value[${r}];`).join("\n")}
}`}let _=({inputs:e,output:r,target:t})=>{let{sourceValues:n}=e;if(0===n.length){let e=new r.ValueType(r.length*r.size);return t.write(e),{success:!0,value:e}}if(n.isConstant){let e=n.value;if(!e)throw Error(`Constant input ${n} is missing CPU values`);let i=new r.ValueType(r.length*r.size);for(let t=0;t<r.length;t++){let r=e[t];i[2*t]=r,i[2*t+1]=r}return t.write(i),{success:!0,value:i}}let i=[],u=n,a="raw",o=n.length;try{for(;;){let e=Math.ceil(o/64),n=r.length*e,l=1===e?t:m.R.createOrReuse(t.device,n*r.stride);if(e>1&&i.push(l),function({input:e,inputMode:r,inputGroupCount:t,channelCount:n,outputType:i,outputBuffer:u,outputLength:a,outputStride:o,outputOffset:l}){let d=(0,s.iP)(i),f=(0,h.BB)(a,u.device.limits.maxComputeWorkgroupsPerDimension),p=new g.GL({buffer:u,type:i,size:2,length:a,stride:o,offset:l}),c=`
${e.isConstant?"":$("sourceValues",e,0)}
${y(e,i)}
${v(p,+!e.isConstant)}
${E(p)}
${function(e,r,t,n){let i=(0,s.iP)(r),[u,a]=function(e){switch(e){case"uint32":return["0xffffffffu","0u"];case"sint32":return["2147483647","-2147483648"];case"float32":return["3.402823e38","-3.402823e38"];default:throw Error(`Unsupported WebGPU extent type for ${e}`)}}(r);return"raw"===e?`fn extent_pass(channelIndex: u32, inputGroupIndex: u32) -> array<${i}, 2> {
  var result: array<${i}, 2>;
  result[0] = ${u};
  result[1] = ${a};

  if (inputGroupIndex < ${n}u) {
    let value = read_source_values(inputGroupIndex);
    result[0] = value[channelIndex];
    result[1] = value[channelIndex];
  }

  return result;
}`:`fn extent_pass(channelIndex: u32, inputGroupIndex: u32) -> array<${i}, 2> {
  var result: array<${i}, 2>;
  result[0] = ${u};
  result[1] = ${a};

  if (inputGroupIndex < ${n}u) {
    let rowIndex = inputGroupIndex * ${t}u + channelIndex;
    let value = read_source_values(rowIndex);
    result[0] = value[0];
    result[1] = value[1];
  }

  return result;
}`}(r,i,n,t)}

var<workgroup> sharedMin: array<${d}, 64>;
var<workgroup> sharedMax: array<${d}, 64>;

@compute @workgroup_size(64) fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_id) localId: vec3<u32>
) {
  let outputRowIndex = ${(0,h.B)(f)};
  if (outputRowIndex >= ${a}u) {
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
    write_result(outputRowIndex, array<${d}, 2>(sharedMin[0], sharedMax[0]));
  }
}
`,m=new x.C(u.device,{source:c,shaderLayout:{bindings:[...e.isConstant?[]:[{name:"sourceValues",type:"storage",group:0,location:0}],{name:"result",type:"storage",group:0,location:+!e.isConstant}]}}),w={result:u};e.isConstant||(w.sourceValues=e.buffer),m.setBindings(w);let _=u.device.beginComputePass({});m.dispatch(_,f.x,f.y,f.z),_.end(),u.device.submit(),m.destroy()}({input:u,inputMode:a,inputGroupCount:o,channelCount:r.length,outputType:r.type,outputBuffer:l,outputLength:n,outputStride:r.stride,outputOffset:r.offset}),1===e)break;u=new g.GL({buffer:l,type:r.type,size:2,length:n}),a="partial",o=e}return{success:!0}}finally{for(let e of i)m.R.recycle(e)}},I=`\
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
`,P=({inputs:e,output:r,target:t})=>((0,a.P)({module:{name:"fround",source:I},inputs:e,output:r,operationType:"uint32",outputBuffer:t}),{success:!0}),T=async({inputs:e,output:r,target:t})=>{var n,i,u,a,o,l;let d,f,p,{ids:c,sourceValues:g}=e,m=(0,s.iP)(c.type),w=[];c.isConstant||w.push({name:"ids",input:c,index:w.length}),g.isConstant||w.push({name:"sourceValues",input:g,index:w.length});let _=(0,h.BB)(Math.ceil(r.length/64),t.device.limits.maxComputeWorkgroupsPerDimension),I=`
${w.map(({name:e,input:r,index:t})=>$(e,r,t)).join("\n")}
${function(e,r){if(e.isConstant){let t=e.value;if(!t)throw Error(`Constant input ${e} is missing CPU values`);return`fn read_ids(_rowIndex: u32) -> ${r} {
  return ${(0,s.Lm)(r,t[0]??0)};
}`}let t=e.stride/e.ValueType.BYTES_PER_ELEMENT,n=e.offset/e.ValueType.BYTES_PER_ELEMENT;return`fn read_ids(rowIndex: u32) -> ${r} {
  let rowOffset = ${n}u + rowIndex * ${t}u;
  return ids[rowOffset];
}`}(c,m)}
${y(g,r.type)}
${v(r,w.length)}
${E(r)}
${(n=r.type,i=r.size,p=(0,s._1)(n),`fn zero_result() -> array<${(0,s.iP)(n)}, ${i}> {
  var result: array<${(0,s.iP)(n)}, ${i}>;
${Array.from({length:i},(e,r)=>`  result[${r}] = ${p};`).join("\n")}
  return result;
}`)}
${(u=c.type,a=r.type,o=r.size,l=g.length,d=(0,s.iP)(u),f=(0,s.iP)(a),`fn gather(idsValue: ${d}) -> array<${f}, ${o}> {
  let sourceIndex = ${"u32"===d?"i32(idsValue)":"i32"===d?"idsValue":"i32(idsValue)"};
  if (sourceIndex < 0 || sourceIndex >= ${l}) {
    return zero_result();
  }
  return read_source_values(u32(sourceIndex));
}`)}

@compute @workgroup_size(64) fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_id) localId: vec3<u32>
) {
  let rowIndex = ${(0,h.vL)(_,64)};
  if (rowIndex >= ${r.length}u) {
    return;
  }

  let idsValue = read_ids(rowIndex);
  let result = gather(idsValue);
  write_result(rowIndex, result);
}
`,P=new x.C(t.device,{source:I,shaderLayout:{bindings:[...w.map(({name:e,index:r})=>({name:e,type:"storage",group:0,location:r})),{name:"result",type:"storage",group:0,location:w.length}]}}),T={};c.isConstant||(T.ids=c.buffer),g.isConstant||(T.sourceValues=g.buffer),T.result=t,P.setBindings(T);let b=t.device.beginComputePass({});return P.dispatch(b,_.x,_.y,_.z),b.end(),t.device.submit(),P.destroy(),{success:!0}},b=async({inputs:e,output:r,target:t})=>{var n;let{segments:i}=e,u=i.isConstant?[]:[{name:"segments",input:i,index:0}],a=(0,h.BB)(Math.ceil(r.length/64),t.device.limits.maxComputeWorkgroupsPerDimension),s=`
${u.map(({name:e,input:r,index:t})=>$(e,r,t)).join("\n")}
${w("segments",i,"uint32")}
${v(r,u.length)}
${E(r)}
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
  let rowIndex = ${(0,h.vL)(a,64)};
  if (rowIndex >= ${r.length}u) {
    return;
  }

  let result = segmented_map(rowIndex);
  write_result(rowIndex, result);
}
`,o=new x.C(t.device,{source:s,shaderLayout:{bindings:[...u.map(({name:e,index:r})=>({name:e,type:"storage",group:0,location:r})),{name:"result",type:"storage",group:0,location:u.length}]}}),l=Object.fromEntries(u.map(({name:e,input:r})=>[e,r.buffer]));l.result=t,o.setBindings(l);let d=t.device.beginComputePass({});return o.dispatch(d,a.x,a.y,a.z),d.end(),t.device.submit(),o.destroy(),{success:!0}};var L=t(41568);let k=`\
fn row_length(x: array<{TYPE}, {X_LEN}>) -> array<f32, 1> {
  var sum = 0.0;
  for (var i = 0u; i < {X_LEN}u; i = i + 1u) {
    sum += f32(x[i]) * f32(x[i]);
  }
  return array<f32, 1>(sqrt(sum));
}
`,z=({inputs:e,output:r,target:t})=>((0,a.P)({module:{name:"row_length",source:k},inputs:e,output:r,operationType:"float32",outputBuffer:t}),{success:!0}),C=async({inputs:e,output:r,target:t})=>{let n=(0,s._1)(r.type);return(0,a.P)({module:{name:"select",source:"// inline expression select\n"},inputs:e,output:r,operationType:r.type,outputBuffer:t,expression:r=>{let t=S("condition",e.condition,r,n),i=S("whenTrue",e.whenTrue,r,n),u=S("whenFalse",e.whenFalse,r,n);return`select(${u}, ${i}, ${t} != ${n})`}}),{success:!0}};function S(e,r,t,n){return t<r.size?`${e}[${t}]`:1===r.size?`${e}[0]`:n}let B=({inputs:e,output:r,target:t})=>{let n=(0,h.BB)(Math.ceil(r.length/64),t.device.limits.maxComputeWorkgroupsPerDimension),i=`\
@group(0) @binding(0) var<storage, read_write> result: array<i32>;

@compute @workgroup_size(64) fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_id) localId: vec3<u32>
) {
  let rowIndex = ${(0,h.vL)(n,64)};
  if (rowIndex >= ${r.length}u) {
    return;
  }

  let rowOffset = ${r.offset/r.ValueType.BYTES_PER_ELEMENT}u + rowIndex * ${r.stride/r.ValueType.BYTES_PER_ELEMENT}u;
  result[rowOffset] = ${e.start} + i32(rowIndex) * ${e.step};
}
`,u=new x.C(t.device,{source:i,shaderLayout:{bindings:[{name:"result",type:"storage",group:0,location:0}]}});u.setBindings({result:t});let a=t.device.beginComputePass({});return u.dispatch(a,n.x,n.y,n.z),a.end(),t.device.submit(),u.destroy(),{success:!0}},N=({inputs:e,output:r,target:t})=>{let{columns:n}=e;return(0,a.P)({module:{name:"swizzle",source:"// swizzle expression handled inline"},expression:e=>`x[${n[e]}]`,inputs:{x:e.x},output:r,outputBuffer:t}),{success:!0}}},84765(e,r,t){t.d(r,{W:()=>n});function n(e,r){return!function e(r,{operations:t,inputs:n}){switch(r.kind){case"input":if(!(r.name in n))throw Error(`Unknown expression input '${r.name}'`);return;case"literal":if(Array.isArray(r.value)){for(let e of r.value)if(!Number.isFinite(e))throw Error(`Expression literal array must contain only finite values, got ${e}`)}else if(!Number.isFinite(r.value))throw Error(`Expression literal must be finite, got ${r.value}`);return;case"call":{let i=t[r.op];if(!i)throw Error(`Unknown expression op '${r.op}'`);if(r.args.length!==i.arity)throw Error(`Expression op '${r.op}' expects ${i.arity} args, got ${r.args.length}`);for(let i of r.args)e(i,{operations:t,inputs:n});return}default:throw Error(`Unsupported expression node ${r.kind}`)}}(e,r),function e(r,t){switch(r.kind){case"input":{let e=t.inputs[r.name];if(t.laneIndex<e.size)return t.formatInput(r.name);return t.formatOutOfBoundsInput(r.name)}case"literal":return t.formatLiteral(r.value);case"call":{let n=t.operations[r.op],i=r.args.map(r=>e(r,t));return t.formatCall(n.symbol,i)}default:throw Error(`Unsupported expression node ${r.kind}`)}}(e,r)}}}]);
//# sourceMappingURL=5632.146ce8d4.js.map