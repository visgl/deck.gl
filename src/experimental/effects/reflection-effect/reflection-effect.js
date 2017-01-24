/* global window */
import {GL, Framebuffer, Model, Geometry} from 'luma.gl';
import {assembleShaders} from '../../../shader-utils';
import {Effect} from '../../lib';
import {readFileSync} from 'fs';
import {join} from 'path';
// import {WebMercatorViewport} from 'viewport-mercator-project';
import {WebMercatorViewport} from '../../../lib/viewports';

export default class ReflectionEffect extends Effect {

  /**
   * @classdesc
   * ReflectionEffect
   *
   * @class
   * @param reflectivity How visible reflections should be over the map, between 0 and 1
   * @param blur how blurry the reflection should be, between 0 and 1
   */

  constructor(reflectivity = 0.5, blur = 0.5) {
    super();
    this.reflectivity = reflectivity;
    this.blur = blur;
    this.framebuffer = null;
    this.setNeedsRedraw();
  }

  getShaders() {
    return {
      vs: readFileSync(join(__dirname, './reflection-effect-vertex.glsl'), 'utf8'),
      fs: readFileSync(join(__dirname, './reflection-effect-fragment.glsl'), 'utf8')
    };
  }

  initialize({gl, layerManager}) {
    const shaders = assembleShaders(gl, this.getShaders());

    this.unitQuad = new Model({
      gl,
      id: 'reflection-effect',
      vs: shaders.vs,
      fs: shaders.fs,
      geometry: new Geometry({
        drawMode: GL.TRIANGLE_FAN,
        vertices: new Float32Array([0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0])
      })
    });
    this.framebuffer = new Framebuffer(gl, {depth: true});

  }

  preDraw({gl, layerManager}) {
    const {viewport} = layerManager.context;
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
    layerManager.setViewport(
      new WebMercatorViewport(Object.assign({}, viewport, {pitch: -180 - pitch}))
    );
    gl.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

    layerManager.drawLayers({pass: 'reflection'});
    layerManager.setViewport(viewport);
    this.framebuffer.unbind();
  }

  draw({gl, layerManager}) {
    /*
     * Render our unit quad.
     * This will cover the entire screen, but will lie behind all other geometry.
     * This quad will sample the previously generated reflection texture
     * in order to create the reflection effect
     */
    this.unitQuad.render({
      reflectionTexture: this.framebuffer.texture,
      reflectionTextureWidth: this.framebuffer.width,
      reflectionTextureHeight: this.framebuffer.height,
      reflectivity: this.reflectivity,
      blur: this.blur
    });
  }

  finalize({gl, layerManager}) {
    /* TODO: Free resources? */
  }
}
