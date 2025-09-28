// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {GL, Model, Framebuffer, Texture2D, withParameters, Buffer} from '@luma.gl/webgl-legacy';

// Polygon geometry generation is managed by the polygon tesselator
import {SolidPolygonLayer} from '@deck.gl/layers';

import vsTop from './wboit-layer-vertex-top.glsl';
import vsSide from './wboit-layer-vertex-side.glsl';
import fs from './wboit-layer-fragment.glsl';
import oitBlendVs from './oit-blend-vertex.glsl';
import oitBlendFs from './oit-blend-fragment.glsl';

export default class WBOITLayer extends SolidPolygonLayer {
  getShaders(vs) {
    const shaders = super.getShaders(vs);
    shaders.vs =
      vs.indexOf('SHADER_NAME solid-polygon-layer-vertex-shader-side') > 0 ? vsSide : vsTop;
    shaders.fs = fs;
    return shaders;
  }

  initializeState() {
    super.initializeState();

    const [drawingBufferWidth, drawingBufferHeight] = this.context.device.canvasContext.getDra;

    const textureOpts = {
      type: GL.FLOAT,
      width: gl.drawingBufferWidth,
      height: gl.drawingBufferHeight,
      mipmaps: false,
      parameters: {
        [GL.TEXTURE_MIN_FILTER]: GL.NEAREST,
        [GL.TEXTURE_MAG_FILTER]: GL.NEAREST,
        [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
        [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE
      }
    };

    const accumulationTexture = new Texture2D(gl, {
      ...textureOpts,
      format: 'rgba32float'
    });

    const revealageTexture = new Texture2D(gl, {
      ...textureOpts,
      format: gl.R32F
    });

    // This is the depthTexture from solid objects!
    // const accumulationDepthTexture = new Texture2D(gl, {
    //   ...textureOpts,
    //   format: GL.DEPTH_COMPONENT32F,
    // });

    const accumulationFramebuffer = new Framebuffer(gl, {
      width: gl.drawingBufferWidth,
      height: gl.drawingBufferHeight,
      attachments: {
        [GL.COLOR_ATTACHMENT0]: accumulationTexture,
        [GL.COLOR_ATTACHMENT1]: revealageTexture
        // [GL.DEPTH_ATTACHMENT]: accumulationDepthTexture
      }
    });

    this.setState({
      accumulationTexture,
      // accumulationDepthTexture,
      revealageTexture,
      accumulationFramebuffer
    });
  }

  finalizeState() {
    const {
      accumulationTexture,
      // accumulationDepthTexture,
      revealageTexture,
      accumulationFramebuffer
    } = this.state;

    accumulationFramebuffer.delete();
    accumulationTexture.delete();
    // accumulationDepthTexture.delete();
    revealageTexture.delete();
  }

  draw(opts) {
    this.state.accumulationFramebuffer.clear({color: [0, 0, 0, 1], depth: 1});

    withParameters(
      this.context.device,
      {
        blendFunc: [GL.ONE, GL.ONE, GL.ZERO, GL.ONE_MINUS_SRC_ALPHA],
        blend: true,
        depthMask: false,
        cull: false,
        framebuffer: this.state.accumulationFramebuffer
      },
      () => {
        // Draws sides and top
        super.draw(opts);

        // Draw bottom if needed
        const {topModel} = this.state;
        const {extruded, filled} = this.props;
        if (topModel && extruded && filled) {
          topModel.setUniforms({elevationScale: 0}).draw();
        }
      }
    );

    withParameters(
      this.context.device,
      {
        blendFunc: [GL.ONE, gl.ONE_MINUS_SRC_ALPHA],
        blend: true,
        depthTest: false,
        framebuffer: null
      },
      () => {
        this.state.oitModel.draw();
      }
    );

    withParameters(
      this.context.device,
      {
        blend: false,
        depthTest: false,
        framebuffer: null
      },
      () => {
        // Draw wireframe on top
        // TODO: Update super.draw() to not draw wireframe
        const {sideModel} = this.state;
        const {wireframe} = this.props;
        if (sideModel && wireframe) {
          sideModel.setDrawMode(GL.LINE_STRIP);
          sideModel.setUniforms({isWireframe: true}).draw();
        }
      }
    );
  }

  _getModels() {
    const oitModel = new Model(this.context.device, {
      vs: oitBlendVs,
      fs: oitBlendFs,
      topology: 'triangle-strip',
      attributes: {
        positions: [
          new Buffer(this.context.device, new Float32Array([-1, 1, -1, -1, 1, 1, 1, -1])),
          {size: 2}
        ]
      },
      vertexCount: 4,
      uniforms: {
        uAccumulate: this.state.accumulationTexture,
        uAccumulateAlpha: this.state.revealageTexture
      }
    });

    this.setState({oitModel});

    return super._getModels();
  }
}

WBOITLayer.layerName = 'WBOITLayer';
