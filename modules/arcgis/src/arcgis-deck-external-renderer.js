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
    this.createFramebuffer(gl, this.view.size[0], this.view.size[1]);
    this.initializeDeckGL(gl);
  };
  ArcGISDeckExternalRenderer.prototype.render = function (context) {
    const gl = context.gl;
    const screenFbo = gl.getParameter(gl.FRAMEBUFFER_BINDING);

    this.createOrResizeFramebuffer(gl, this.view.size[0], this.view.size[1]);

    // ========== Zurich, we have a problem ==========
    //            V  V  V  V  V  V  V  V  V
    const cameraPositionGeographic = new Array(3);
    externalRenderers.fromRenderCoordinates(this.view,
      context.camera.eye, 0,
      cameraPositionGeographic, 0, SpatialReference.WGS84,
    1);
    this.deckgl.setProps({
      viewState: {
        latitude: cameraPositionGeographic[0],
        longitude: cameraPositionGeographic[1],
        zoom: 1,
        bearing: 0,
        pitch: 0
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
