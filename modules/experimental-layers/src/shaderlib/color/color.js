// TODO - this module is a WIP

/* eslint-disable camelcase */
const INITIAL_STATE = {
  color_uOpacity: 1.0,
  color_uDesaturate: 0.0,
  color_uBrightness: 1.0
};

function getUniforms(opts = INITIAL_STATE) {
  const uniforms = {};
  if (opts.opacity) {
    uniforms.color_uOpacity = opts.opacity;
  }
  return uniforms;
}

const vs = `\
varying vec4 color_vColor;

color_setColor(vec4 color) {
  color_vColor = color;
}
`;

const fs = `\
uniform float color_uOpacity;
uniform float color_uDesaturate;
uniform float color_uBrightness;

varying vec4 color_vColor;

vec4 color_getColor() {
  return color_vColor;
}

vec4 color_filterColor(vec4 color) {
  // apply desaturation and brightness
  if (color_uDesaturate > 0.01) {
    float luminance = (color.r + color.g + color.b) * 0.333333333 + color_uBrightness;
    color = vec4(mix(color.rgb, vec3(luminance), color_uDesaturate), color.a);

  // Apply opacity
  color = vec4(color.rgb, color.a * color_uOpacity);
  return color;
}
`;

export default {
  name: 'color',
  vs,
  fs,
  getUniforms
};
