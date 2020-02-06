import { Deck } from '@deck.gl/core';
import Handles from "esri/core/Handles";
import BaseLayerViewGL2D from "esri/views/2d/layers/BaseLayerViewGL2D";
import EsriDeckLayer from './EsriDeckLayer';

export default BaseLayerViewGL2D.createSubclass({
  properties: {
    handles: {},
    uTexture: {},
    vertexBuffer: {},
    indexBuffer: {},
    program: {},
    deckgl: {},
    fboWidth: {},
    fboHeight: {},
    texture: {},
    deckFbo: {}
  },

  constructor () {

  },

  // Attach is called as soon as the layer view is ready to start rendering.
  attach: function () {
    // We use a full-screen quad and shaders to composite the frame rendered
    // with deck.gl on top of the MapView. Composition uses the MapView context.
    const gl = this.context;

    // Vertex shader
    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, `
    attribute vec2 a_pos;
    varying vec2 v_texcoord;
    void main(void) {
      gl_Position = vec4(a_pos, 0.0, 1.0);
      v_texcoord = (a_pos + 1.0) / 2.0;
    }
    `);
    gl.compileShader(vs);

    // Fragment shader
    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, `
    precision mediump float;
    uniform sampler2D u_texture;
    varying vec2 v_texcoord;
    void main(void) {
      vec4 rgba = texture2D(u_texture, v_texcoord);
      rgba.rgb *= rgba.a;
      gl_FragColor = rgba;
    }
    `);
    gl.compileShader(fs);

    // Shader program
    this.program = gl.createProgram();
    gl.attachShader(this.program, vs);
    gl.attachShader(this.program, fs);
    gl.linkProgram(this.program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);

    // Uniform locations
    this.uTexture = gl.getUniformLocation(this.program, "u_texture");

    // Full screen quad
    this.vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Int8Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    this.createOrResizeDeckGL(gl, this.view.state.size[0], this.view.state.size[1]);

    // The redraw() request must be forwarded from the layer to the layer view.
    // We listen to the event on the layer and propagate it to the layer view.
    this.handles.add([
      this.layer.on("redraw", () => {
        this.redraw();
      })
    ]);

    // We need to start drawing the deck.gl layer immediately.
    this.redraw();
  },

  createOrResizeDeckGL: function (gl, width, height) {
    if (!this.deckgl) {
      this.createDeckGL(gl, width, height);
      return;
    }


    if (this.fboWidth === width && this.fboHeight === height) {
      return;
    }

    this.destroyDeckGL(gl);
    this.createDeckGL(gl, width, height);
  },

  createDeckGL: function (gl, width, height) {
    // Create offscreen texture
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    this.fboWidth = width;
    this.fboHeight = height;
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.fboWidth, this.fboHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(this.fboWidth * this.fboHeight * 4));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);

    // Create auxiliary FBO
    this.deckFbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.deckFbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // Deck creation
    this.deckgl = new Deck({
      // The view state will be set dynamically to track the MapView current extent.
      initialViewState: {},

      // Input is handled by the ArcGIS API for JavaScript.
      controller: false,

      // We use the same WebGL context as the ArcGIS API for JavaScript.
      gl,

      // This deck renders into an auxiliary framebuffer.
      _framebuffer: this.deckFbo
    });
  },

  destroyDeckGL: function (gl) {
    this.deckgl = null;

    gl.deleteFramebuffer(this.deckFbo);
    this.deckFbo = null;

    gl.deleteTexture(this.texture);
    this.texture = null;

    this.fboWidth = null;
    this.fboHeight = null;
  },

  // This method is called whenever the deck.gl layer changes and must be
  // displayed.
  redraw: function () {
    let deckLayer = this.layer.getDeckLayer();

    if (!Array.isArray(deckLayer)) {
      deckLayer = [deckLayer];
    }

    this.deckgl.setProps({
      layers: deckLayer
    });

    // We need to tell the layer view that it must redraw itself.
    this.requestRender();
  },

  // Called when the layer must be destroyed.
  detach: function () {
    this.handles.removeAll();

    const gl = this.context;

    if (this.deckgl) {
      this.destroyDeckGL(gl);
    }

    if (this.program) {
      gl.deleteProgram(this.program);
      this.program = null;
    }

    if (this.vertexBuffer) {
      gl.deleteBuffer(this.vertexBuffer);
      this.vertexBuffer = null;
    }
  },

  // Called every time that the layer view must be rendered.
  render: function (renderParameters) {
    const gl = renderParameters.context;
    const screenFbo = gl.getParameter(gl.FRAMEBUFFER_BINDING);

    this.createOrResizeDeckGL(gl, this.view.state.size[0], this.view.state.size[1]);

    // The view state must be kept in-sync with the MapView of the ArcGIS API.
    const state = renderParameters.state;

    this.deckgl.setProps({
      viewState: {
        latitude: this.view.center.latitude,
        longitude: this.view.center.longitude,
        zoom: this.view.featuresTilingScheme.scaleToLevel(state.scale),
        bearing: -state.rotation,
        pitch: 0
      }
    });

    gl.activeTexture(gl.TEXTURE0 + 0);
    gl.bindTexture(gl.TEXTURE_2D, null);

    // We redraw the deck immediately.
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
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 6);
  }
});