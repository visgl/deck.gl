/**
 * A prop type for URL templates
 */
export const urlType = {
  type: 'url',
  value: null,
  validate: (value, propType) =>
    (propType.optional && value === null) ||
    typeof value === 'string' ||
    (Array.isArray(value) && value.every(url => typeof url === 'string')),
  equals: (value1, value2) => {
    if (value1 === value2) {
      return true;
    }
    if (!Array.isArray(value1) || !Array.isArray(value2)) {
      return false;
    }
    const len = value1.length;
    if (len !== value2.length) {
      return false;
    }
    for (let i = 0; i < len; i++) {
      if (value1[i] !== value2[i]) {
        return false;
      }
    }
    return true;
  }
};
