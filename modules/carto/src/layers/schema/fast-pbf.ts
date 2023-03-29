// Optimized (100X speed improvement) reading functions for binary data
export function readPackedDouble(pbf, obj) {
  const end = pbf.type === 2 ? pbf.readVarint() + pbf.pos : pbf.pos + 1;
  obj.value = new Float64Array(pbf.buf.buffer.slice(pbf.pos, end));
  pbf.pos = end;
  return obj.value;
}
export function readPackedFixed64(pbf, obj) {
  const end = pbf.type === 2 ? pbf.readVarint() + pbf.pos : pbf.pos + 1;
  obj.value = new BigUint64Array(pbf.buf.buffer.slice(pbf.pos, end));
  pbf.pos = end;
  return obj.value;
}
