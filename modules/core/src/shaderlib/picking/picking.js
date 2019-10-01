import {picking, createModuleInjection} from '@luma.gl/core';

createModuleInjection('picking', {
  hook: 'vs:DECKGL_FILTER_COLOR',
  injection: `
  if (picking_uAttribute) {
    // z is in common space (pixels). Normalize it by viewport height
    float z = geometry.position.z / project_uViewportSize.y;
    picking_setPickingAttribute(geometry.pickingColor, z);
  } else {
    picking_setPickingColor(geometry.pickingColor);
  }
`
});

createModuleInjection('picking', {
  hook: 'fs:DECKGL_FILTER_COLOR',
  order: 99,
  injection: `
    // use highlight color if this fragment belongs to the selected object.
    color = picking_filterHighlightColor(color);

    // use picking color if rendering to picking FBO.
    color = picking_filterPickingColor(color);
`
});

export default picking;
