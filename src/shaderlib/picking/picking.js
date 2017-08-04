import log from '../../utils/log';

const DEFAULT_HIGHLIGHT_COLOR = new Uint8Array([0, 64, 128, 64]);

const DEFAULT_MODULE_OPTIONS = {
  pickingSelectedColor: null, //  Set to a picking color to visually highlight that item
  pickingHighlightColor: DEFAULT_HIGHLIGHT_COLOR, // Color of visual highlight of "selected" item
  pickingThreshold: 1.0,
  pickingActive: false, // Set to true when rendering to off-screen "picking" buffer
  pickingSelectedColorValid: false
};

/* eslint-disable camelcase */
function getUniforms(opts = DEFAULT_MODULE_OPTIONS) {
  const uniforms = {};
  if (opts.pickingSelectedColorValid !== undefined) {
    uniforms.picking_uSelectedPickingColorValid = opts.pickingSelectedColorValid ? 1 : 0;
  }
  if (opts.pickingValid !== undefined) {
    uniforms.picking_uSelectedPickingColorValid = opts.pickingValid ? 1 : 0;
    log.deprecated('pickingValid', 'pickingSelectedColorValid');
  }
  if (opts.pickingSelectedColor !== undefined) {
    if (opts.pickingSelectedColor) {
      const selectedColor = [
        opts.pickingSelectedColor[0],
        opts.pickingSelectedColor[1],
        opts.pickingSelectedColor[2]
      ];
      // console.log('selected picking color', selectedColor);
      uniforms.picking_uSelectedPickingColor = selectedColor;
    }
  }
  if (opts.pickingHighlightColor !== undefined) {
    uniforms.picking_uHighlightColor = opts.pickingHighlightColor;
  }
  // TODO - major hack - decide on normalization and remove
  if (opts.pickingThreshold !== undefined) {
    uniforms.picking_uThreshold = opts.pickingThreshold;
  }
  if (opts.pickingActive !== undefined) {
    uniforms.picking_uActive = opts.pickingActive ? 1 : 0;
  }
  return uniforms;
}

const vs = `\
uniform vec3 picking_uSelectedPickingColor;
uniform float picking_uThreshold;
uniform bool picking_uSelectedPickingColorValid;

varying vec4 picking_vRGBcolor_Aselected;

const float COLOR_SCALE = 1. / 255.;

bool isVertexPicked(vec3 vertexColor) {
  return
    picking_uSelectedPickingColorValid &&
    abs(vertexColor.r - picking_uSelectedPickingColor.r) < picking_uThreshold &&
    abs(vertexColor.g - picking_uSelectedPickingColor.g) < picking_uThreshold &&
    abs(vertexColor.b - picking_uSelectedPickingColor.b) < picking_uThreshold;
}

void picking_setPickingColor(vec3 pickingColor) {
  // Do the comparison with selected item color in vertex shader as it should mean fewer compares
  picking_vRGBcolor_Aselected.a =
    float(isVertexPicked(pickingColor));

  // Stores the picking color so that the fragment shader can render it during picking
  picking_vRGBcolor_Aselected.rgb = pickingColor * COLOR_SCALE;
}
`;

const fs = `\
uniform bool picking_uActive; // true during rendering to offscreen picking buffer
uniform vec3 picking_uSelectedPickingColor;
uniform vec4 picking_uHighlightColor;

varying vec4 picking_vRGBcolor_Aselected;

const float COLOR_SCALE = 1. / 255.;

/*
 * Returns highlight color if this item is selected.
 */
vec4 picking_filterHighlightColor(vec4 color) {
  bool selected = bool(picking_vRGBcolor_Aselected.a);
  return selected ? (picking_uHighlightColor * COLOR_SCALE) : color;
}

/*
 * Returns picking color if picking enabled else unmodified argument.
 */
vec4 picking_filterPickingColor(vec4 color) {
  vec3 pickingColor = picking_vRGBcolor_Aselected.rgb;
  return picking_uActive ? vec4(pickingColor, 1.0) : color;
}
`;

export default {
  name: 'picking',
  vs,
  fs,
  getUniforms
};
