/* global window */
import {GL, Framebuffer, Model, Geometry} from 'luma.gl';
import {assembleShaders} from '../../shader-utils';
import {Effect} from '../../lib';

const glslify = require('glslify');

/*
 * This should be made a subclass of a more general effect class once other
 * effects are implemented.
 */

export default class ReflectionEffect extends Effect {
  constructor(reflectivity = 0.2) {
    super();
    this.reflectivity = reflectivity;
    this.framebuffer = null;
    this.setNeedsRedraw();
  }

  initialize({gl, deckgl}) {
    this.model = new Model({
      gl,
      ...assembleShaders(gl, {
        vs: glslify('./reflection-effect-vertex.glsl'),
        fs: glslify('./reflection-effect-fragment.glsl')
      }),
      geometry: new Geometry({
        drawMode: GL.TRIANGLE_FAN,
        vertices: new Float32Array([0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0])
      })
    });
    this.framebuffer = new Framebuffer(gl);

  }

  preDraw({gl, deckgl}) {
    const viewport = deckgl.layerManager.context.viewport;
    /*
     * the renderer already has a reference to this, but we don't have a reference to the renderer.
     * when we refactor the camera code, we should make sure we get a reference to the renderer so
     * that we can keep this in one place.
     */
    const dpi = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    this.framebuffer.resize({width: dpi * viewport.width, height: dpi * viewport.height});
    const pitch = viewport.pitch;
    this.framebuffer.bind();
    /* this is a huge hack around the existing viewport class.
     * TODO in the future, once we implement bona-fide cameras, we really need to fix this.
     */
    deckgl.layerManager.setContext({
      ...viewport,
      pitch: -180 - pitch
    });
    gl.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    deckgl.layerManager.drawLayers();
    deckgl.layerManager.setContext({
      ...viewport,
      pitch
    });
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  draw({gl, deckgl}) {
    this.model.render({
      reflectionTexture: this.framebuffer.texture,
      reflectivity: this.reflectivity
    });
  }

  setNeedsRedraw(redraw = true) {
    this.needsRedraw = redraw;
  }
}
