import {picking} from '@luma.gl/shadertools';

type PickingModuleSettings = {
  /** Set to a picking color to visually highlight that item */
  pickingSelectedColor?: [number, number, number] | null;
  /** Color of the highlight */
  pickingHighlightColor?: [number, number, number, number];
  /** Set to true when rendering to off-screen "picking" buffer */
  pickingActive?: boolean;
  /** Set to true when picking an attribute value instead of object index */
  pickingAttribute?: boolean;
};

export default {
  inject: {
    'vs:DECKGL_FILTER_GL_POSITION': `
    // for picking depth values
    picking_setPickingAttribute(position.z / position.w);
  `,
    'vs:DECKGL_FILTER_COLOR': `
  picking_setPickingColor(geometry.pickingColor);
  `,
    // TODO - this should be declared in the luma module
    'fs:#decl': `
uniform bool picking_uAttribute;
  `,
    'fs:DECKGL_FILTER_COLOR': {
      order: 99,
      injection: `
  // use highlight color if this fragment belongs to the selected object.
  color = picking_filterHighlightColor(color);

  // use picking color if rendering to picking FBO.
  color = picking_filterPickingColor(color);
    `
    }
  },
  ...picking,
  getUniforms(opts: PickingModuleSettings = {}): typeof picking.uniforms {
    return picking.getUniforms!({
      isActive: opts.pickingActive,
      isAttribute: opts.pickingAttribute,
      useFloatColors: false,
      highlightColor: opts.pickingHighlightColor,
      highlightedObjectColor: opts.pickingSelectedColor
    });
  }
};
