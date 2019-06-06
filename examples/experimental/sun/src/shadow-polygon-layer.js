import {SolidPolygonLayer} from '@deck.gl/layers';

import shadowModule from './shadow-effect/shadow-module';

export default class ShadowPolygonLayer extends SolidPolygonLayer {
  getShaders(params) {
    const shaders = super.getShaders(params);
    shaders.modules.push(shadowModule);
    shaders.inject = {
      'picking_setPickingColor(props.pickingColors);': `
  gl_Position = shadow_setVertexPosition(position_commonspace);
`,
      'fs:#main-end': `
  gl_FragColor = shadow_filterShadowColor(gl_FragColor);
`
    };
    return shaders;
  }
}
