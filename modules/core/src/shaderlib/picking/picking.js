import {picking, createModuleInjection} from '@luma.gl/core';

createModuleInjection('picking', {
  hook: 'vs:DECKGL_FILTER_COLOR',
  injection: `
  if (picking_uDrawZ) {
    picking_setZ(geometry.position.z, geometry.pickingColor);
  } else {
    picking_setPickingColor(geometry.pickingColor);
  }
`
});

createModuleInjection('picking', {
  hook: 'fs:DECKGL_FILTER_COLOR',
  order: 99,
  injection: `
  if (picking_uDrawZ) {
    color = picking_getZColor();
  } else {
    // use highlight color if this fragment belongs to the selected object.
    color = picking_filterHighlightColor(color);

    // use picking color if rendering to picking FBO.
    color = picking_filterPickingColor(color);
  }
`
});

export default {
  ...picking,
  getUniforms: opts => {
    const uniforms = picking.getUniforms(opts);
    if (opts && opts.pickingActive !== undefined) {
      uniforms.picking_uDrawZ = Boolean(opts.pickingActive && opts.pickingDrawZ);
    }
    return uniforms;
  },
  vs: `\
// z is in common space (pixels). This packing supports up to 4096p viewport @resolution 1/256/16 (0.02%)
const vec3 bitPackShift = vec3(16.0, 1.0 / 16.0, 1.0 / 4096.0);
const float packUpscale = 256.0 / 255.0;
const float shiftRight = 1. / 256.;

uniform bool picking_uDrawZ;
${picking.vs}

void picking_setZ(float z, vec3 pickingColor) {
  vec3 rgbZ = fract(z * bitPackShift);
  rgbZ.gb -= rgbZ.rg * shiftRight;
  picking_vRGBcolor_Aselected.rgb = rgbZ * packUpscale;
  // Use alpha as the validity flag. If pickingColor is [0, 0, 0] fragment is non-pickable
  picking_vRGBcolor_Aselected.a = step(0.5, length(pickingColor));
}
`,
  fs: `\
uniform bool picking_uDrawZ;
${picking.fs}

vec4 picking_getZColor() {
  if (picking_vRGBcolor_Aselected.a == 0.0) {
    discard;
  }
  return picking_vRGBcolor_Aselected;
}
`
};
