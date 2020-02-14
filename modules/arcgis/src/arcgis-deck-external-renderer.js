import {Deck} from '@deck.gl/core';
import {initializeResources, createOrResizeFramebuffer, createFramebuffer, destroyFramebuffer, initializeDeckGL} from './commons';

export default function loadArcGISDeckExternalRenderer(externalRenderers, SpatialReference) {
  const ArcGISDeckExternalRenderer = function (view, conf) {
    this.view = view;
    this.deckLayers = conf.deckLayers;
  };
  ArcGISDeckExternalRenderer.prototype.initializeResources = initializeResources;
  ArcGISDeckExternalRenderer.prototype.createOrResizeFramebuffer = createOrResizeFramebuffer;
  ArcGISDeckExternalRenderer.prototype.createFramebuffer = createFramebuffer;
  ArcGISDeckExternalRenderer.prototype.destroyFramebuffer = destroyFramebuffer;
  ArcGISDeckExternalRenderer.prototype.initializeDeckGL = initializeDeckGL;
  ArcGISDeckExternalRenderer.prototype.setup = function (context) {
    const gl = context.gl;
    this.initializeResources(gl);
    const dpr = window.devicePixelRatio;
    this.createFramebuffer(gl, Math.round(this.view.size[0] * dpr), Math.round(this.view.size[1] * dpr));
    this.initializeDeckGL(gl);
  };
  ArcGISDeckExternalRenderer.prototype.render = function (context) {
    const gl = context.gl;
    const screenFbo = gl.getParameter(gl.FRAMEBUFFER_BINDING);

    const dpr = window.devicePixelRatio;
    this.createOrResizeFramebuffer(gl, Math.round(this.view.size[0] * dpr), Math.round(this.view.size[1] * dpr));

    // ========== Zurich, we have a problem ==========
    //            V  V  V  V  V  V  V  V  V
    this.deckgl.setProps({
      viewState: {
        latitude: this.view.center.latitude,
        longitude: this.view.center.longitude,
        zoom: this.view.zoom,
        bearing: this.view.camera.heading,
        pitch: this.view.camera.tilt
      }
    });
    //            ^  ^  ^  ^  ^  ^  ^  ^  ^
    // ===============================================

    gl.activeTexture(gl.TEXTURE0 + 0);
    gl.bindTexture(gl.TEXTURE_2D, null);

    // We redraw the deck immediately.
    this.deckgl.setProps({
      layers: this.deckLayers
    });
    
    this.deckgl.redraw(true);

    // We overlay the texture on top of the map using the full-screen quad.
    gl.bindFramebuffer(gl.FRAMEBUFFER, screenFbo);
    gl.viewport(0, 0, Math.round(this.view.size[0] * dpr), Math.round(this.view.size[1] * dpr));

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(0, 2, gl.BYTE, false, 2, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    gl.useProgram(this.program);
    gl.uniform1i(this.uTexture, 0);
    gl.activeTexture(gl.TEXTURE0 + 0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    gl.enableVertexAttribArray(0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  return ArcGISDeckExternalRenderer;
}
