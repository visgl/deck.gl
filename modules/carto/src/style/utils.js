export function getAttrValue(attr, d) {
  if (typeof attr === 'function') {
    return attr(d);
  }

  return d.properties[attr];
}
