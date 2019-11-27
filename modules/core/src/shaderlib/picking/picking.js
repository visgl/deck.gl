import {picking} from '@luma.gl/core';

export default Object.assign(
  {
    inject: {
      'vs:DECKGL_FILTER_COLOR': `
    picking_setPickingColor(geometry.pickingColor);
    // for picking depth values
    picking_setPickingAttribute(geometry.position.z);
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
    }
  },
  picking
);
