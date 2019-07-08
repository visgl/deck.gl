import {SolidPolygonLayer} from '@deck.gl/layers';

import shadow from '@deck.gl/core/shaderlib/shadow/shadow';

export default class ShadowPolygonLayer extends SolidPolygonLayer {
  getShaders(params) {
    const shaders = super.getShaders(params);
    shaders.modules.push(shadow);
    shaders.inject = {
      'DECKGL_FILTER_GL_POSITION(gl_Position, geometry);': `
  gl_Position = shadow_setVertexPosition(geometry.position);
`,
      'fs:#main-end': `
  gl_FragColor = shadow_filterShadowColor(gl_FragColor);
`
    };
    return shaders;
  }
}
