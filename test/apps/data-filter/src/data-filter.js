/*
 * data filter shader module
 */
const vs = `
uniform vec2 filter_range;
varying float filter_isVisible;

void filter_setValue(float value) {
  filter_isVisible = step(filter_range.x, value) * step(value, filter_range.y);
}
void filter_setValue(bool visible) {
  filter_isVisible = float(visible);
}
`;

const fs = `
varying float filter_isVisible;
vec4 filter_filterColor(vec4 color) {
  if (filter_isVisible < 0.5) {
    discard;
  }
  return color;
}
`;

const INITIAL_MODULE_OPTIONS = {};

export default {
  name: 'data-filter',
  vs,
  fs,
  getUniforms: (opts = INITIAL_MODULE_OPTIONS) => {
    if (!opts.filterRange) {
      return {};
    }
    return {
      filter_range: opts.filterRange
    };
  }
};
