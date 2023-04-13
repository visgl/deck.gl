// Optimized (100X speed improvement) reading function for binary data
export function readPackedTypedArray(TypedArray, pbf, obj) {
  const end = pbf.type === 2 ? pbf.readVarint() + pbf.pos : pbf.pos + 1;
  obj.value = new TypedArray(pbf.buf.buffer.slice(pbf.pos, end));
  pbf.pos = end;
  return obj.value;
}
