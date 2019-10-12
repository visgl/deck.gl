export function addDoublePrecisionAttributes(attributeName, offset, size, accessor = {}) {
  const stride = size * 4;

  const attributes = {};
  attributes[`${attributeName}32`] = {
    ...accessor,
    offset,
    stride
  };
  attributes[`${attributeName}64`] = {
    ...accessor,
    offset: offset * 2,
    stride: stride * 2
  };
  attributes[`${attributeName}64xyLow`] = {
    ...accessor,
    offset: offset * 2 + stride,
    stride: stride * 2
  };

  return attributes;
}
